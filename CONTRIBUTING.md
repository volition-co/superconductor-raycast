# Contributing

## Local development

Requires macOS, Raycast, and Node.js 22.22.2 or newer. CI uses Node 24.

```sh
git clone https://github.com/volition-co/superconductor-raycast.git
cd superconductor-raycast
npm ci
npm run dev
```

Raycast imports both commands in development mode and reloads them as you edit. Enter your Superconductor token in the extension's password preference. Keep credentials out of source files and test fixtures.

## Checks

```sh
npm run check
```

This runs type checks, source lint, formatting checks, network-mocked tests, and the distribution build. CI runs the same command. Use `npm run format` to format changes.

`npm run lint` also validates Store metadata and icons. See [PUBLISHING.md](PUBLISHING.md) for the release checklist.

## Source layout

| Path                              | Responsibility                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------ |
| `src/create-ticket.tsx`           | Single-ticket command entry point                                              |
| `src/create-multiple-tickets.tsx` | Repeated-ticket command entry point                                            |
| `src/components/`                 | Shared ticket workflow and fallback screens                                    |
| `src/api.ts`                      | API requests, selected response schemas, pagination, and implementation lookup |
| `src/favorites.ts`                | Local favorite parsing and project ordering                                    |
| `tests/`                          | API and favorite behavior with fake credentials and network responses          |
| `assets/`                         | Bundled runtime icon                                                           |
| `help.md`                         | Token setup instructions displayed by Raycast                                  |

Command filenames match the command names in `package.json`. Keep new code near the behavior it serves; add a hook or component when it has a clear responsibility, rather than creating layers for every function.

## Making changes

- Preserve the keyboard flow and native Raycast controls.
- Keep ticket creation separate from browser opening and implementation lookup. A failure after creation must not resubmit the ticket.
- Keep retained data small: only project IDs are needed for favorites.
- Test changed behavior with mocked requests. Never create production tickets from automated tests.
- For manual creation tests, choose a designated test project. Turn off implementation launch with ⌘⇧I unless the test is intended to start an agent.
- Update the README and changelog when user-facing behavior changes.

The [API reference](https://www.superconductor.com/docs/api) and [OpenAPI schema](https://www.superconductor.com/docs/api/openapi.yaml) define the server contract.
