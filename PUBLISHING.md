# Publishing

1. Confirm the author and organization in `package.json` have permission to publish to the public Raycast Store.
2. Test both commands in Raycast: project selection, starring, ticket creation, implementation launch, browser handoff, and repeated creation. Check error handling and the icon in both themes.
3. Update the changelog and any screenshots affected by the release. Store screenshots belong in `metadata/`; use demonstration data without private information.
4. Run `npm run check` and `npm run lint`.
5. Run `npm run publish` to open a pull request in `raycast/extensions`. Raycast reviews the extension before publishing it to the Store.

Before publishing subsequent updates, run `npx @raycast/api@latest pull-contributions` to bring Store contributions back into this repository.

See Raycast's [publishing guide](https://developers.raycast.com/basics/publish-an-extension) and [Store preparation guide](https://developers.raycast.com/basics/prepare-an-extension-for-store).
