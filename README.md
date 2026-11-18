# Superconductor for Raycast

Create a Superconductor ticket and start your default coding agent from Raycast.

Developed for Superconductor. This repository is the source project; the extension has **not yet been submitted to or published in the Raycast Store**.

## Create Ticket

Choose a project, enter a description, and optionally give the ticket a title. Leave the title blank to let Superconductor write one. **Start default implementation** is checked by default; turn it off to create the ticket without starting an agent.

The result screen links to the ticket and distinguishes successful creation from an agent launch failure. Requests are never automatically retried. If the connection fails after submission, check the project before trying again—the ticket may already exist.

This release creates text tickets only. It does not create chats or search existing work.

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

Requests go directly to `https://www.superconductor.com/api/v1`. The extension uses Raycast's encrypted password preference for the token. It does not read the separate API-helper Keychain credential, log tokens, add analytics, cache conversations, or retain ticket history. Project metadata and form values are held in memory for the command's lifetime. There is no automatic background polling.

The client follows project pagination and normalizes the API response to selected fields. Redirects are rejected. Ticket creation makes one POST, and an uncertain response leads to a check-project screen rather than an automatic retry.

## Publishing and maintenance

See [PUBLISHING.md](PUBLISHING.md) for publisher setup, Store submission, and remaining release checks. Contributions are welcome through pull requests. Keep API behavior aligned with the [live API documentation](https://www.superconductor.com/docs/api) and [OpenAPI schema](https://www.superconductor.com/docs/api/openapi.yaml).

## License and branding

Source code is MIT licensed. The Superconductor name and logo remain their owners' trademarks. The bundled icon is rendered from [Superconductor's public favicon](https://www.superconductor.com/favicon.svg); use of the brand does not grant rights to imply endorsement of forks.
