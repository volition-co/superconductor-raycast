import { z } from "zod";

const base = "https://www.superconductor.com/api/v1";
const id = z.string().regex(/^[A-Za-z0-9_-]+$/);
const appUrl = z.url().refine((value) => {
  const url = new URL(value);
  return (
    url.protocol === "https:" &&
    ["www.superconductor.com", "superconductor.com"].includes(url.hostname) &&
    !url.username &&
    !url.password
  );
});
const projectSchema = z.object({
  id,
  name: z.string().nullable(),
  url: appUrl,
  workspace: z.object({ id, name: z.string() }),
});
const pageSchema = z.object({
  data: z.array(projectSchema),
  next_cursor: z.string().nullable(),
});
const createdSchema = z.object({
  id,
  friendly_id: z.string(),
  url: appUrl,
  title: z.string().nullable(),
  implementation_launches: z.array(
    z.object({ profile: z.string(), launch_error: z.string().optional() }),
  ),
});

export type Project = z.infer<typeof projectSchema>;
export type CreatedTicket = z.infer<typeof createdSchema>;
export type TicketInput = {
  projectId: string;
  title: string;
  description: string;
  launchDefault: boolean;
};

export class UnknownCreateOutcome extends Error {
  constructor() {
    super(
      "The request may have created a ticket. Check the project before trying again.",
    );
  }
}

function statusMessage(status: number): string {
  switch (status) {
    case 401:
      return "Your token is invalid or expired. Update it in extension preferences.";
    case 403:
      return "Your account does not have permission to perform this action.";
    case 404:
      return "This project is unavailable or you no longer have access.";
    case 400:
    case 422:
      return "The request was rejected. Check the project and ticket details.";
    default:
      return `Superconductor returned HTTP ${status}.`;
  }
}

export function createClient(token: string, transport: typeof fetch = fetch) {
  if (!/^sc_[\x21-\x7E]+$/.test(token))
    throw new Error(
      "Enter a valid Superconductor personal access token in extension preferences.",
    );

  async function request(path: string, body?: unknown, signal?: AbortSignal) {
    return transport(`${base}${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      redirect: "error",
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(20000)])
        : AbortSignal.timeout(20000),
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  }

  return {
    async projects(signal?: AbortSignal): Promise<Project[]> {
      const projects = new Map<string, Project>();
      const seen = new Set<string>();
      let cursor: string | null = null;
      do {
        const query = new URLSearchParams({ limit: "100" });
        if (cursor) query.set("cursor", cursor);
        let response: Response;
        try {
          response = await request(`/projects?${query}`, undefined, signal);
        } catch {
          throw new Error(
            "Could not connect to Superconductor. Check your connection and try again.",
          );
        }
        if (response.status !== 200)
          throw new Error(statusMessage(response.status));
        let page: z.infer<typeof pageSchema>;
        try {
          page = pageSchema.parse(await response.json());
        } catch {
          throw new Error(
            "Superconductor returned an unexpected project list. Please update the extension or contact support.",
          );
        }
        for (const project of page.data) projects.set(project.id, project);
        cursor = page.next_cursor;
        if (cursor) {
          if (seen.has(cursor) || seen.size >= 100)
            throw new Error(
              "Could not finish loading projects. Please contact support.",
            );
          seen.add(cursor);
        }
      } while (cursor);
      return [...projects.values()].sort((a, b) =>
        `${a.workspace.name} ${a.name}`.localeCompare(
          `${b.workspace.name} ${b.name}`,
        ),
      );
    },

    async createTicket(input: TicketInput): Promise<CreatedTicket> {
      const projectId = id.parse(input.projectId);
      if (!input.description.trim())
        throw new Error("A description is required.");
      const body = {
        ticket: {
          description: input.description.trim(),
          ...(input.title.trim() ? { title: input.title.trim() } : {}),
        },
        ...(input.launchDefault
          ? { implementations: [{ profile: "default" }] }
          : {}),
      };
      let response: Response;
      try {
        response = await request(`/projects/${projectId}/tickets`, body);
      } catch {
        throw new UnknownCreateOutcome();
      }
      if ([400, 401, 403, 404, 422].includes(response.status))
        throw new Error(statusMessage(response.status));
      if (response.status !== 201) throw new UnknownCreateOutcome();
      try {
        return createdSchema.parse(await response.json());
      } catch {
        throw new UnknownCreateOutcome();
      }
    },
  };
}

export function launchOutcome(
  ticket: CreatedTicket,
  requested: boolean,
): "started" | "failed" | "unknown" | "not-requested" {
  const launches = ticket.implementation_launches;
  if (!requested) return launches.length === 0 ? "not-requested" : "unknown";
  if (launches.length !== 1 || launches[0].profile !== "default")
    return "unknown";
  return launches[0].launch_error === undefined ? "started" : "failed";
}
