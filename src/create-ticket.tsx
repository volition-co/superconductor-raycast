import {
  Action,
  ActionPanel,
  Detail,
  Form,
  Icon,
  getPreferenceValues,
  openExtensionPreferences,
  showToast,
  Toast,
} from "@raycast/api";
import { useEffect, useRef, useState } from "react";
import {
  createClient,
  CreatedTicket,
  launchOutcome,
  Project,
  UnknownCreateOutcome,
} from "./api";

type Values = {
  project: string;
  title: string;
  description: string;
  launchDefault: boolean;
};
type Result =
  | { ticket: CreatedTicket; launchDefault: boolean }
  | { unknown: true; projectUrl: string };

export default function Command() {
  const { apiToken } = getPreferenceValues<{ apiToken: string }>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>();
  const [reload, setReload] = useState(0);
  const [project, setProject] = useState("");
  const [descriptionError, setDescriptionError] = useState<string>();
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<Result>();
  const submitted = useRef(false);

  useEffect(() => {
    const abort = new AbortController();
    setLoading(true);
    setLoadError(undefined);
    async function load() {
      try {
        const available = await createClient(apiToken).projects(abort.signal);
        if (abort.signal.aborted) return;
        setProjects(available);
        setProject((current) =>
          available.some((p) => p.id === current)
            ? current
            : (available[0]?.id ?? ""),
        );
      } catch (error) {
        if (!abort.signal.aborted)
          setLoadError(
            error instanceof Error ? error.message : "Could not load projects.",
          );
      } finally {
        if (!abort.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => abort.abort();
  }, [apiToken, reload]);

  async function submit(values: Values) {
    if (submitted.current || loading) return;
    const target = projects.find((p) => p.id === values.project);
    if (!target) return;
    if (!values.description.trim()) {
      setDescriptionError("Describe what the ticket should accomplish.");
      return;
    }
    submitted.current = true;
    setSending(true);
    try {
      const ticket = await createClient(apiToken).createTicket({
        projectId: target.id,
        title: values.title,
        description: values.description,
        launchDefault: values.launchDefault,
      });
      setResult({ ticket, launchDefault: values.launchDefault });
    } catch (error) {
      if (error instanceof UnknownCreateOutcome) {
        setResult({ unknown: true, projectUrl: target.url });
      } else {
        submitted.current = false;
        await showToast({
          style: Toast.Style.Failure,
          title: "Ticket was not created",
          message: error instanceof Error ? error.message : "Please try again.",
        });
      }
    } finally {
      setSending(false);
    }
  }

  if (result) {
    if ("unknown" in result)
      return (
        <Detail
          markdown={
            "# Check your project before trying again\n\nThe connection ended without a confirmed result. Your ticket **may already exist**, and its agent may have started.\n\nOpen the project and check its recent tickets. This command will not automatically resend the request."
          }
          actions={
            <ActionPanel>
              <Action.OpenInBrowser
                title="Check Project"
                url={result.projectUrl}
              />
            </ActionPanel>
          }
        />
      );
    const outcome = launchOutcome(result.ticket, result.launchDefault);
    const messages = {
      started: "Your default implementation was launched.",
      failed:
        "The ticket was created, but the default implementation could not start. Open the ticket to check your agent setup and launch it there. Do not create the ticket again.",
      unknown:
        "The ticket was created, but the implementation launch could not be confirmed. Open the ticket to check its status. Do not create the ticket again.",
      "not-requested": "The ticket is ready. No implementation was requested.",
    };
    return (
      <Detail
        markdown={`# Ticket #${result.ticket.friendly_id} created\n\n${messages[outcome]}`}
        actions={
          <ActionPanel>
            <Action.OpenInBrowser title="Open Ticket" url={result.ticket.url} />
            <Action.CopyToClipboard
              title="Copy Ticket Link"
              content={result.ticket.url}
            />
          </ActionPanel>
        }
      />
    );
  }

  if (!loading && (loadError || projects.length === 0))
    return (
      <Detail
        markdown={`# ${loadError ? "Could not load projects" : "No projects available"}\n\n${loadError ?? "This account has no accessible projects. Join or create a project in Superconductor, then try again."}`}
        actions={
          <ActionPanel>
            <Action
              title="Retry"
              icon={Icon.ArrowClockwise}
              onAction={() => setReload((n) => n + 1)}
            />
            <Action
              title="Open Extension Preferences"
              icon={Icon.Gear}
              onAction={openExtensionPreferences}
            />
            <Action.OpenInBrowser
              title="Open Superconductor"
              url="https://www.superconductor.com"
            />
          </ActionPanel>
        }
      />
    );

  const workspaces = [...new Set(projects.map((p) => p.workspace.id))];
  return (
    <Form
      isLoading={loading || sending}
      actions={
        <ActionPanel>
          {!loading && !sending && (
            <Action.SubmitForm
              title="Create Ticket"
              icon={Icon.Plus}
              onSubmit={submit}
            />
          )}
          <Action
            title="Open Extension Preferences"
            icon={Icon.Gear}
            onAction={openExtensionPreferences}
          />
        </ActionPanel>
      }
    >
      <Form.Dropdown
        id="project"
        title="Project"
        value={project}
        onChange={setProject}
      >
        {workspaces.map((workspace) => (
          <Form.Dropdown.Section
            key={workspace}
            title={
              projects.find((p) => p.workspace.id === workspace)?.workspace.name
            }
          >
            {projects
              .filter((p) => p.workspace.id === workspace)
              .map((p) => (
                <Form.Dropdown.Item
                  key={p.id}
                  value={p.id}
                  title={p.name || "Untitled project"}
                />
              ))}
          </Form.Dropdown.Section>
        ))}
      </Form.Dropdown>
      <Form.TextField
        id="title"
        title="Title"
        placeholder="Optional — Superconductor can write one"
      />
      <Form.TextArea
        id="description"
        title="Description"
        placeholder="What should this ticket accomplish? Markdown is supported."
        error={descriptionError}
        onChange={() => setDescriptionError(undefined)}
        onBlur={(event) => {
          if (!event.target.value?.trim())
            setDescriptionError("Describe what the ticket should accomplish.");
        }}
      />
      <Form.Separator />
      <Form.Checkbox
        id="launchDefault"
        label="Start default implementation"
        defaultValue={true}
        info="Start work immediately with the default coding agent configured for your Superconductor account."
      />
      <Form.Description text="Creating this ticket will send its description to the selected project. With the option above enabled, your default coding agent will start work." />
    </Form>
  );
}
