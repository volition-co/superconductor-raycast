# Publishing the official extension

## Current status

This is a company-source extension prepared for local development. No Raycast Store submission has been made. GitHub publication and Raycast Store publication are separate steps.

## Publisher identity

- Confirm Kevin Gutowski's exact Raycast Store username. The manifest currently uses `kevingutowski` as an **unverified development value**, not a confirmed publisher identity.
- Superconductor does not yet have a Raycast organization. Decide whether to submit under the confirmed personal author or establish a company organization for maintainership.
- Raycast documents an `owner` organization handle and an `access` field. If using an organization for a public extension, set `access` to `public` explicitly; an owner without public access defaults to private distribution. Verify the current organization onboarding and publishing flow with Raycast before submission.
- Company ownership of this GitHub repository establishes where the source is maintained. It does not itself create a Raycast organization, a Store listing, a partner relationship, or a verified badge.

## Before submission

1. Confirm author/owner metadata and official branding with the maintainers.
2. Test the command in Raycast: token setup, multiple workspaces, optional title, implementation on/off, errors, and ticket opening.
3. Use Raycast's Capture Window command to create Store screenshots from a demonstration account/project. Do not publish real private ticket descriptions or credentials.
4. Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`.
5. Review all files being published, including screenshots and source assets.
6. Submit through `npm run publish`, which opens the extension review PR in `raycast/extensions`, or use the documented manual fork/PR flow. Publication to the Store follows Raycast's review and merge.

After Store contributions land, use Raycast's documented pull-contributions workflow before publishing subsequent updates. Keep this repository and the Store source synchronized.

## References

- [Publish an extension](https://developers.raycast.com/basics/publish-an-extension)
- [Prepare an extension for the Store](https://developers.raycast.com/basics/prepare-an-extension-for-store)
- [Manifest fields](https://developers.raycast.com/information/manifest)
- [Security and password preferences](https://developers.raycast.com/information/security)

API scope intentionally excludes chat creation: the inspected API documents reading/messaging existing chats, but no create-chat endpoint. Search and following are future features once the API supports them; this release does not depend on them.

## Known release checks

As of November 17, 2026, source lint, formatting, type checks, six API tests, and the production build pass. Full `ray lint` is blocked by the unconfirmed author handle. The command still needs an authenticated manual run in Raycast before Store submission.

`npm audit` reports a high-severity picomatch ReDoS advisory ([GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf)) through Raycast CLI and lint dependencies. The registry's latest picomatch version is currently affected; the suggested automatic fix downgrades the Raycast SDK across a major version. Recheck upstream fixes before release. Ticket input is not passed to these glob utilities. CI checks source lint separately from publisher metadata until the author account is confirmed.
