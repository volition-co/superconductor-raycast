# Extension icon

`source-icon.svg` is the editable source downloaded from [Superconductor's public favicon](https://www.superconductor.com/favicon.svg). Only `assets/icon.png` is bundled with the extension.

To regenerate the 512 × 512 PNG with librsvg installed, run from the repository root:

```sh
rsvg-convert -w 512 -h 512 design/source-icon.svg -o assets/icon.png
```

Review the icon in Raycast's light and dark themes before release. The Superconductor name and logo remain their owners' trademarks.

## Store screenshots

`metadata/superconductor-1.png` was saved by Raycast's built-in Capture Window
command at 2000 × 1250 pixels. It shows Create Multiple Tickets with example
Pokémon content.

`screenshot-background.png` is a still rendered from the wave shader on the
[Superconductor landing page](https://www.superconductor.com/), using its original
colors at 2000 × 1250 pixels. The source was
[the landing-page script](https://cdn.superconductor.com/assets/entrypoints-splash-vthashDezjPbdG.js)
on November 17, 2026.

For consistent captures, select this image as Capture Window's Custom Wallpaper.
Open it in a normal Preview window behind Raycast so the glass picks up its colors.
Use the capture hotkey, then click the camera button to save. Inspect the saved PNG,
including the background and glass tint, before adding it to `metadata/`.
