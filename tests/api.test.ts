import assert from "node:assert/strict";
import test from "node:test";
import { createClient, launchOutcome, UnknownCreateOutcome } from "../src/api";

const token = "sc_test_only_not_a_real_token";
const project = {
  id: "project1",
  name: "Example",
  url: "https://www.superconductor.com/projects/project1",
  workspace: { id: "workspace1", name: "Example team" },
};
const created = {
  id: "ticket1",
  friendly_id: "12",
  url: "https://www.superconductor.com/tickets/ticket1",
  title: "Example",
  implementation_launches: [{ profile: "default" }],
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

test("project picker follows opaque cursors, deduplicates records, and drops unselected fields", async () => {
  const urls: string[] = [];
  const client = createClient(token, async (url, init) => {
    urls.push(String(url));
    assert.equal(
      init?.headers && (init.headers as Record<string, string>).Authorization,
      `Bearer ${token}`,
    );
    return urls.length === 1
      ? json({
          data: [{ ...project, extra_upstream_field: "do not retain" }],
          next_cursor: "a+b/c=",
        })
      : json({ data: [project], next_cursor: null });
  });
  assert.deepEqual(await client.projects(), [project]);
  assert.equal(new URL(urls[1]).searchParams.get("cursor"), "a+b/c=");
});

test("ticket creation sends only selected fields and can opt out of the default implementation", async () => {
  const sent: unknown[] = [];
  const client = createClient(token, async (url, init) => {
    assert.equal(
      url,
      "https://www.superconductor.com/api/v1/projects/project1/tickets",
    );
    assert.equal(init?.method, "POST");
    assert.equal(init?.redirect, "error");
    sent.push(JSON.parse(String(init?.body)));
    return json(created, 201);
  });
  await client.createTicket({
    projectId: "project1",
    title: "  ",
    description: " Work ",
    launchDefault: true,
  });
  await client.createTicket({
    projectId: "project1",
    title: "Title",
    description: "Work",
    launchDefault: false,
  });
  assert.deepEqual(sent, [
    {
      ticket: { description: "Work" },
      implementations: [{ profile: "default" }],
    },
    { ticket: { title: "Title", description: "Work" } },
  ]);
});

test("ambiguous creates never retry, including transport failures and malformed successes", async () => {
  for (const response of [
    () => {
      throw new Error("network lost");
    },
    () => json({}, 503),
    () => json({}, 201),
    () => new Response("not json", { status: 201 }),
  ]) {
    let calls = 0;
    const client = createClient(token, async () => {
      calls++;
      return response();
    });
    await assert.rejects(
      client.createTicket({
        projectId: "project1",
        title: "",
        description: "Work",
        launchDefault: true,
      }),
      UnknownCreateOutcome,
    );
    assert.equal(calls, 1);
  }
});

test("known rejection is retryable without leaking response content, and empty descriptions send nothing", async () => {
  let calls = 0;
  const client = createClient(token, async () => {
    calls++;
    return json({ error: { message: "private diagnostic" } }, 422);
  });
  await assert.rejects(
    client.createTicket({
      projectId: "project1",
      title: "",
      description: "  ",
      launchDefault: true,
    }),
    /description is required/,
  );
  assert.equal(calls, 0);
  await assert.rejects(
    client.createTicket({
      projectId: "project1",
      title: "",
      description: "Work",
      launchDefault: true,
    }),
    (error: Error) =>
      !(error instanceof UnknownCreateOutcome) &&
      !error.message.includes("private diagnostic"),
  );
});

test("creation success remains distinct from failed or unknown implementation launch", () => {
  assert.equal(launchOutcome(created, true), "started");
  assert.equal(
    launchOutcome(
      {
        ...created,
        implementation_launches: [{ profile: "default", launch_error: "" }],
      },
      true,
    ),
    "failed",
  );
  assert.equal(
    launchOutcome({ ...created, implementation_launches: [] }, true),
    "unknown",
  );
  assert.equal(
    launchOutcome({ ...created, implementation_launches: [] }, false),
    "not-requested",
  );
  assert.equal(launchOutcome(created, false), "unknown");
});

test("rejects foreign result URLs and repeated project cursors", async () => {
  const badUrl = createClient(token, async () =>
    json({
      data: [{ ...project, url: "https://example.com/private" }],
      next_cursor: null,
    }),
  );
  await assert.rejects(badUrl.projects(), /unexpected project list/);
  let calls = 0;
  const repeated = createClient(token, async () => {
    calls++;
    return json({ data: [project], next_cursor: "same" });
  });
  await assert.rejects(repeated.projects(), /finish loading projects/);
  assert.equal(calls, 2);
});

test("waits for the exact ticket's implementation across pages without repeating creation", async () => {
  let calls = 0;
  const url = "https://www.superconductor.com/tickets/new/implementations/impl";
  const client = createClient(
    token,
    (async (input, init) => {
      assert.equal(init?.method, "GET");
      const query = new URL(String(input)).searchParams;
      assert.equal(query.get("include"), "implementations");
      calls++;
      if (calls === 1)
        return Response.json({
          data: [{ id: "new", implementations: [] }],
          next_cursor: null,
        });
      if (calls === 2)
        return Response.json({
          data: [
            {
              id: "other",
              implementations: [
                { id: "wrong", url: "https://www.superconductor.com/wrong" },
              ],
            },
          ],
          next_cursor: "next",
        });
      assert.equal(query.get("cursor"), "next");
      return Response.json({
        data: [{ id: "new", implementations: [{ id: "impl", url }] }],
        next_cursor: null,
      });
    }) as typeof fetch,
    async () => {},
  );
  assert.equal(await client.waitForImplementation("project", "new"), url);
  assert.equal(calls, 3);
});

test("stops waiting when no implementation appears", async () => {
  let calls = 0;
  const client = createClient(
    token,
    (async () => {
      calls++;
      return Response.json({
        data: [{ id: "new", implementations: [] }],
        next_cursor: null,
      });
    }) as typeof fetch,
    async () => {},
  );
  assert.equal(await client.waitForImplementation("project", "new"), undefined);
  assert.equal(calls, 15);
});
