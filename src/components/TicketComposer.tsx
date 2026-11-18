import {
  Action,
  ActionPanel,
  Detail,
  Form,
  List,
  Icon,
  LocalStorage,
  getPreferenceValues,
  openExtensionPreferences,
  showToast,
  Toast,
  Keyboard,
  open,
  closeMainWindow,
  PopToRootType,
} from "@raycast/api";
import { useEffect, useRef, useState } from "react";
import {
  createClient,
  CreatedTicket,
  launchOutcome,
  Project,
  UnknownCreateOutcome,
} from "../api";

import TicketResult, { TicketResultState } from "./TicketResult";

import { groupProjects, readFavorites } from "../favorites";

type Values = {
  project: string;
  description: string;
  launchDefault: boolean;
};

export default function TicketComposer({
  initialDescription = "",
  mode,
}: {
  initialDescription?: string;
  mode: "single" | "multiple";
}) {
  const repeat = mode === "multiple";
  const { apiToken } = getPreferenceValues<{ apiToken: string }>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>();
  const [reload, setReload] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [description, setDescription] = useState(initialDescription);
  const [editing, setEditing] = useState(!repeat && !initialDescription.trim());
  const [batchProject, setBatchProject] = useState<Project>();
  const [lastTicket, setLastTicket] = useState<CreatedTicket>();
  const [launchDefault, setLaunchDefault] = useState(true);
  const [descriptionError, setDescriptionError] = useState<string>();
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<TicketResultState>();
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
      await showToast({
        style: Toast.Style.Failure,
        title: "Write a ticket first",
      });
      return;
    }
    submitted.current = true;
    setSending(true);
    let ticket: CreatedTicket;
    try {
      ticket = await createClient(apiToken).createTicket({
        projectId: target.id,
        title: "",
        description: values.description,
        launchDefault: values.launchDefault,
      });
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
      return;
    } finally {
      setSending(false);
    }

    if (repeat) {
      setLastTicket(ticket);
      setDescription("");
      submitted.current = false;
      const outcome = launchOutcome(ticket, values.launchDefault);
      await showToast({
        style:
          outcome === "failed" || outcome === "unknown"
            ? Toast.Style.Failure
            : Toast.Style.Success,
        title: `Ticket #${ticket.friendly_id} created`,
        message:
          outcome === "failed"
            ? "Implementation could not start. Open the last ticket to check."
            : outcome === "unknown"
              ? "Implementation status is unconfirmed. Open the last ticket to check."
              : "Ready for the next ticket.",
      });
      return;
    }

    let destination = ticket.url;
    if (values.launchDefault && launchOutcome(ticket, true) !== "failed") {
      const toast = await showToast({
        style: Toast.Style.Animated,
        title: "Ticket created — waiting for implementation…",
      });
      setSending(true);
      try {
        destination =
          (await createClient(apiToken).waitForImplementation(
            target.id,
            ticket.id,
          )) ?? ticket.url;
      } catch {
        // Creation succeeded; a lookup failure falls back to the existing ticket.
      } finally {
        setSending(false);
        await toast.hide();
      }
    }

    // A browser failure must never turn a successful create into a retry.
    try {
      await open(destination);
      await closeMainWindow({
        clearRootSearch: true,
        popToRootType: PopToRootType.Immediate,
      });
    } catch {
      setResult({ ticket, launchDefault: values.launchDefault });
      await showToast({
        style: Toast.Style.Failure,
        title: "Ticket created — open it below",
        message: "Could not finish opening the ticket in your browser.",
      });
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

  if (result) return <TicketResult result={result} />;

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

  if (repeat && batchProject)
    return (
      <List
        isLoading={sending}
        navigationTitle={`Create Multiple Tickets · ${batchProject.name || "Untitled project"}`}
        searchBarPlaceholder="Write a ticket, then press Enter"
        searchText={description}
        onSearchTextChange={(value) => {
          if (!submitted.current) setDescription(value);
        }}
        filtering={false}
      >
        <List.Item
          title={batchProject.name || "Untitled project"}
          subtitle={batchProject.workspace.name}
          icon={Icon.Plus}
          accessories={[
            { text: launchDefault ? "Start implementation" : "Ticket only" },
          ]}
          actions={
            <ActionPanel>
              <Action
                title={sending ? "Creating Ticket…" : "Create Ticket"}
                icon={Icon.Plus}
                onAction={() =>
                  submit({
                    project: batchProject.id,
                    description,
                    launchDefault,
                  })
                }
              />
              {!sending && (
                <>
                  <Action
                    title="Change Project"
                    icon={Icon.Folder}
                    shortcut={{ modifiers: ["cmd", "shift"], key: "p" }}
                    onAction={() => setBatchProject(undefined)}
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
              {lastTicket && (
                <Action.OpenInBrowser
                  title="Open Last Ticket"
                  url={lastTicket.url}
                  shortcut={Keyboard.Shortcut.Common.Open}
                />
              )}
            </ActionPanel>
          }
        />
      </List>
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
              title={
                repeat
                  ? "Choose Project"
                  : sending
                    ? "Creating Ticket…"
                    : "Create Ticket"
              }
              icon={Icon.Plus}
              onAction={() =>
                repeat
                  ? setBatchProject(project)
                  : submit({ project: project.id, description, launchDefault })
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
                {!repeat && (
                  <Action
                    title="Edit Ticket"
                    icon={Icon.Pencil}
                    shortcut={Keyboard.Shortcut.Common.Edit}
                    onAction={() => setEditing(true)}
                  />
                )}
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
      navigationTitle={
        repeat ? "Create Multiple Tickets" : `Ticket: ${description}`
      }
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
