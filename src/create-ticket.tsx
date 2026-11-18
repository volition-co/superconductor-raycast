import {
  Action,
  ActionPanel,
  Detail,
  Form,
  List,
  Icon,
  LocalStorage,
  LaunchProps,
  getPreferenceValues,
  openExtensionPreferences,
  showToast,
  Toast,
  Keyboard,
} from "@raycast/api";
import { useEffect, useRef, useState } from "react";
import {
  createClient,
  CreatedTicket,
  launchOutcome,
  Project,
  UnknownCreateOutcome,
} from "./api";

import { groupProjects, readFavorites } from "./favorites";

type Values = {
  project: string;
  description: string;
  launchDefault: boolean;
};
type Result =
  | { ticket: CreatedTicket; launchDefault: boolean }
  | { unknown: true; projectUrl: string };

export default function Command(
  props: LaunchProps<{ arguments: { description?: string } }>,
) {
  const { apiToken } = getPreferenceValues<{ apiToken: string }>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>();
  const [reload, setReload] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [description, setDescription] = useState(
    props.arguments.description ?? "",
  );
  const [editing, setEditing] = useState(!props.arguments.description?.trim());
  const [launchDefault, setLaunchDefault] = useState(true);
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
        const [available, saved] = await Promise.all([
          createClient(apiToken).projects(abort.signal),
          LocalStorage.getItem<string>("favoriteProjects"),
        ]);
        if (abort.signal.aborted) return;
        setProjects(available);
        setFavorites(readFavorites(saved));
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
        title: "",
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

  const savingFavorite = useRef(false);
  async function toggleFavorite(projectId: string) {
    if (savingFavorite.current) return;
    savingFavorite.current = true;
    const next = favorites.includes(projectId)
      ? favorites.filter((id) => id !== projectId)
      : [...favorites, projectId];
    try {
      await LocalStorage.setItem("favoriteProjects", JSON.stringify(next));
      setFavorites(next);
    } catch {
      await showToast({
        style: Toast.Style.Failure,
        title: "Could not save starred projects",
      });
    } finally {
      savingFavorite.current = false;
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

  if (editing)
    return (
      <Form
        actions={
          <ActionPanel>
            <Action.SubmitForm
              title="Choose Project"
              onSubmit={(values: { description: string }) => {
                if (!values.description.trim()) {
                  setDescriptionError("Write a ticket first.");
                  return;
                }
                setDescription(values.description);
                setEditing(false);
              }}
            />
          </ActionPanel>
        }
      >
        <Form.TextArea
          id="description"
          title="Ticket"
          defaultValue={description}
          autoFocus
          error={descriptionError}
          onChange={() => setDescriptionError(undefined)}
          placeholder="What should we work on?"
        />
      </Form>
    );

  function projectItem(project: Project) {
    const starred = favorites.includes(project.id);
    return (
      <List.Item
        key={project.id}
        id={project.id}
        title={project.name || "Untitled project"}
        subtitle={project.workspace.name}
        keywords={[project.workspace.name]}
        icon={starred ? Icon.Star : Icon.Folder}
        actions={
          <ActionPanel>
            <Action
              title={sending ? "Creating Ticket…" : "Create Ticket"}
              icon={Icon.Plus}
              onAction={() =>
                submit({ project: project.id, description, launchDefault })
              }
            />
            {!sending && (
              <>
                <Action
                  title={starred ? "Unstar Project" : "Star Project"}
                  icon={starred ? Icon.StarDisabled : Icon.Star}
                  shortcut={Keyboard.Shortcut.Common.Save}
                  onAction={() => toggleFavorite(project.id)}
                />
                <Action
                  title="Edit Ticket"
                  icon={Icon.Pencil}
                  shortcut={Keyboard.Shortcut.Common.Edit}
                  onAction={() => setEditing(true)}
                />
                <Action
                  title={
                    launchDefault
                      ? "Create Without Implementation"
                      : "Start Default Implementation"
                  }
                  icon={Icon.Bolt}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "i" }}
                  onAction={() => setLaunchDefault((value) => !value)}
                />
              </>
            )}
          </ActionPanel>
        }
      />
    );
  }

  const { starred, other } = groupProjects(projects, favorites);
  return (
    <List
      isLoading={loading || sending}
      navigationTitle={`Ticket: ${description}`}
      searchBarPlaceholder="Choose a project — type to filter"
    >
      <List.Section
        title="Starred"
        subtitle={
          launchDefault ? "Starts default implementation" : "Ticket only"
        }
      >
        {starred.map(projectItem)}
      </List.Section>
      <List.Section
        title={starred.length ? "Other Projects" : "Projects"}
        subtitle={starred.length ? undefined : "⌘S to star a project"}
      >
        {other.map(projectItem)}
      </List.Section>
      <List.EmptyView
        title="No matching projects"
        description="Try a different project or workspace name."
      />
    </List>
  );
}
