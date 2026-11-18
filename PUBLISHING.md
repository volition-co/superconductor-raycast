# Publishing the official extension

## Publisher setup

Publish under the Superconductor Raycast organization, with an individual maintainer credited as the author. Before the first submission, register the organization and update these fields in `package.json`:

- `owner`: the Superconductor organization's Raycast handle.
- `author`: the submitting maintainer's Raycast username. The current value, `kevingutowski`, is a placeholder and must be verified or replaced.
- `access`: `public`, so the extension is available in the Store.

## Before submission

1. Confirm author/owner metadata and official branding with the maintainers.
2. Test the command in Raycast: token setup, the `sc` alias and argument, project filtering and arrow navigation, starring across restarts, implementation on/off, errors, and ticket opening.
3. Use Raycast's Capture Window command to create Store screenshots from a demonstration account/project. Do not publish real private ticket descriptions or credentials.
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
