# Publishing the official extension

## Publisher setup

Publish under the Superconductor Raycast organization, with an individual maintainer credited as the author. Before the first submission, register the organization and update these fields in `package.json`:

- `owner`: the Superconductor organization's Raycast handle.
- `author`: the submitting maintainer's Raycast username. The current value, `kevingutowski`, is a placeholder and must be verified or replaced.
- `access`: `public`, so the extension is available in the Store.

## Release readiness

| Check                                                                  | Status                                                       |
| ---------------------------------------------------------------------- | ------------------------------------------------------------ |
| Type checks, source lint, formatting, mocked tests, distribution build | Passing locally                                              |
| Launcher argument, project search, starring, empty-input handling      | Inspected in Raycast                                         |
| Single-ticket browser handoff and implementation wait                  | Live end-to-end verification pending                         |
| Repeated successful creations in one project                           | Live end-to-end verification pending                         |
| Token expiry, request failures, and browser-open failure in Raycast    | Manual verification pending; API errors have mocked coverage |
| Publisher identity and full `ray lint`                                 | Blocked on confirmed Raycast author and organization handles |
| Store screenshots and icon in both themes                              | Pending                                                      |
| Dependency audit                                                       | Upstream advisory remains; see below                         |

## Before submission

1. Confirm author/owner metadata and official branding with the maintainers.
2. Complete the pending live checks above in a designated test project. Test both commands, implementation launch on/off, two successive creations, starring across command restarts, and returning to the launcher after browser handoff.
3. Use Raycast's **Capture Window** command with **Save to Metadata** to capture the launcher input, starred project picker, and multiple-ticket entry. Use demonstration data and a consistent background. Store screenshots belong in `metadata/`: PNG, 2000 × 1250 pixels, at most six; Raycast recommends at least three. README-only media belongs in `media/`. Do not publish private project names, descriptions, or credentials.
4. Run `npm run check` and `npm run lint`.
5. Review all files being published, including screenshots and source assets.
6. Submit through `npm run publish`, which opens the extension review PR in `raycast/extensions`, or use the documented manual fork/PR flow. Publication to the Store follows Raycast's review and merge.

After Store contributions land, use Raycast's documented pull-contributions workflow before publishing subsequent updates. Keep this repository and the Store source synchronized.

## References

- [Publish an extension](https://developers.raycast.com/basics/publish-an-extension)
- [Prepare an extension for the Store](https://developers.raycast.com/basics/prepare-an-extension-for-store)
- [Manifest fields](https://developers.raycast.com/information/manifest)
- [Security and password preferences](https://developers.raycast.com/information/security)

## Known release checks

Before the first release, configure the publisher metadata and test ticket creation in Raycast with a Superconductor account. Full `ray lint` requires a valid author handle; CI currently checks source lint separately.

On November 17, 2026, `npm audit` reported a high-severity picomatch ReDoS advisory ([GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf)) through Raycast CLI and lint dependencies. The latest picomatch version available on that date was affected; the suggested automatic fix downgrades the Raycast SDK across a major version. Recheck upstream fixes before release. Ticket input is not passed to these glob utilities.

The command title **Create a Ticket** intentionally retains the product wording. Raycast recommends omitting articles from command titles; revisit this with the Store reviewer if requested.
