import type { LaunchProps } from "@raycast/api";
import TicketComposer from "./components/TicketComposer";

export default function CreateTicket({
  arguments: args,
}: LaunchProps<{ arguments: { description?: string } }>) {
  return <TicketComposer mode="single" initialDescription={args.description} />;
}
