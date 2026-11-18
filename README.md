# Superconductor for Raycast

Create a Superconductor ticket and start your default coding agent from Raycast.

The extension is in development and is not yet available in the Raycast Store. To try it locally, follow the development instructions below.

## Create Ticket

Choose a project, enter a description, and optionally give the ticket a title. Leave the title blank to let Superconductor write one. **Start default implementation** is checked by default; turn it off to create the ticket without starting an agent.

The result screen links to the ticket and distinguishes successful creation from an agent launch failure. Requests are never automatically retried. If the connection fails after submission, check the project before trying again—the ticket may already exist.

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
