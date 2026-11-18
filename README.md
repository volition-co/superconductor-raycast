# Superconductor for Raycast

Create a Superconductor ticket and start your default coding agent from Raycast.

The extension is in development and is not yet available in the Raycast Store. To try it locally, follow the development instructions below.

## Create Ticket

Set the command's alias to `sc` in Raycast Settings → Superconductor → Create Ticket.

1. Open Raycast, type `sc`, and press Tab.
2. Type your ticket and press Enter.
3. Choose a project with ↑/↓, or type to filter projects by name or workspace.
4. Press Enter to create the ticket and start your default implementation.

Press **⌘S** on a project to star or unstar it. Starred projects appear first, in the order you starred them, so your usual destination is ready when you open the list. These favorites are saved locally in Raycast.

Use **⌘E** to edit the ticket before submitting. Use **⌘⇧I** to toggle whether to start the default implementation. Superconductor generates the ticket title from your description.

After creation, the ticket opens automatically in your default browser and Raycast closes. Check the ticket for implementation status. If the connection fails after submission, check the project before trying again—the ticket may already exist.

## Setup

1. In [Superconductor](https://www.superconductor.com), open **Account Settings → Developer → Personal access tokens**.
2. Create a token for Raycast.
3. Enter it in the extension's **Personal Access Token** password preference.
4. Make sure your Superconductor account has a default coding agent configured if you want implementations to start immediately.

The extension acts as the token's user and only lists projects that account can access. Project choices are grouped by workspace.

## Develop

Requires macOS with Raycast and Node.js >=22.22.2 (a recent Node 24 release is recommended).

```sh
npm ci
npm run dev
```

Raycast imports the extension in development mode. Configure your token through Raycast's preferences, never in source files or environment files.

```sh
npm test
npm run typecheck
npm run lint
npm run build
```

Tests use fake credentials and mocked network responses; they do not create production tickets. To test submission manually, use a designated project and disable the implementation checkbox unless you intend to start an agent.

## Data and authentication

Your API token is stored in Raycast's encrypted preferences. The extension connects directly to Superconductor to load your projects and create tickets. Tickets are saved in Superconductor; the extension keeps no local ticket history.

## Publishing and maintenance

See [PUBLISHING.md](PUBLISHING.md) for publisher setup, Store submission, and remaining release checks. Contributions are welcome through pull requests. Keep API behavior aligned with the [live API documentation](https://www.superconductor.com/docs/api) and [OpenAPI schema](https://www.superconductor.com/docs/api/openapi.yaml).

## License and branding

Source code is MIT licensed. The Superconductor name and logo remain their owners' trademarks. The bundled icon is rendered from [Superconductor's public favicon](https://www.superconductor.com/favicon.svg); use of the brand does not grant rights to imply endorsement of forks.
