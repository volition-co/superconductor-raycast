import { Action, ActionPanel, Detail } from "@raycast/api";
import { CreatedTicket, launchOutcome } from "../api";

export type TicketResultState =
  | { ticket: CreatedTicket; launchDefault: boolean }
  | { unknown: true; projectUrl: string };

export default function TicketResult({
  result,
}: {
  result: TicketResultState;
}) {
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
