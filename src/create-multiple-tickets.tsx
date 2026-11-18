import type { LaunchProps } from "@raycast/api";
import CreateTicket from "./create-ticket";

export default function CreateMultipleTickets(props: LaunchProps) {
  return <CreateTicket {...props} arguments={{}} repeat />;
}
