# Superconductor for Raycast

Create tickets, start your coding agent, and jump straight into the implementation.

| Command                     | What it does                                                             |
| --------------------------- | ------------------------------------------------------------------------ |
| **Create a Ticket**         | Write a ticket, choose a project, and open the new implementation.       |
| **Create Multiple Tickets** | Choose a project once and keep creating tickets without leaving Raycast. |

The extension is in development and is not yet available in the Raycast Store. You can [install it locally](CONTRIBUTING.md#local-development) to try it now.

## Connect your account

1. In [Superconductor](https://www.superconductor.com), go to **Account Settings → Developer → Personal access tokens**.
2. Create a token for Raycast.
3. Open either command and enter the token in **Personal Access Token**.

Both commands use the same token and show the projects your account can access. Projects display their workspace name so you can distinguish similar names.

## Create a Ticket

Set the command's alias to `sc` in **Raycast Settings → Superconductor → Create a Ticket**.

1. Open Raycast, type `sc`, and press Tab.
2. Write your ticket and press Enter.
3. Choose a project with ↑/↓, or type to filter by project or workspace name.
4. Press Enter to create the ticket and start your default implementation.

Superconductor generates the title. Raycast waits up to 30 seconds for the implementation, then opens it in your default browser and closes. If implementation launch is disabled, fails, or takes longer, it opens the ticket instead.

## Create Multiple Tickets

Open **Create Multiple Tickets** and choose a project. Type a ticket and press Enter. After each successful creation, the input clears for the next ticket. Your project and implementation setting stay selected, and Raycast stays open.

## Keyboard shortcuts

| Shortcut | Action                       | Where                                 |
| -------- | ---------------------------- | ------------------------------------- |
| ↑ / ↓    | Choose a project             | Project list                          |
| ⌘S       | Star or unstar a project     | Project list                          |
| ⌘E       | Edit the ticket              | Create a Ticket project list          |
| ⌘⇧I      | Toggle implementation launch | Project list or multiple-ticket entry |
| ⌘⇧P      | Change project               | Multiple-ticket entry                 |
| ⌘O       | Open the last created ticket | Multiple-ticket entry                 |
| ⌘K       | Show available actions       | Either command                        |

Starred projects appear first, in the order you starred them. Stars are saved locally in Raycast and are separate from Superconductor favorites.

## Troubleshooting

**My token stopped working.** Update it in **Raycast Settings → Superconductor → Personal Access Token**. Tokens can expire or be revoked.

**I can't find a project.** Check that the account associated with your token can access it in Superconductor. Clear the project search to see all accessible projects.

**The ticket was created but the implementation didn't start.** Open the ticket to check your agent configuration and launch it there. You don't need to create another ticket.

**The connection failed during creation.** Check the project's recent tickets before trying again. The extension stops when it cannot confirm the outcome, because the ticket may already exist.

## Privacy

Your token is stored in Raycast's encrypted preferences. Requests go directly to Superconductor. The extension saves starred project IDs locally; ticket history stays in Superconductor.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for local development and checks, and [PUBLISHING.md](PUBLISHING.md) for the release checklist. Report reproducible problems through [GitHub issues](https://github.com/volition-co/superconductor-raycast/issues).

## License

Source code is [MIT licensed](LICENSE). The Superconductor name and logo remain their owners' trademarks.
