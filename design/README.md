# Extension icon

`assets/superconductor-icon.png` is derived from the 512 × 512 PNG in Superconductor
for macOS 1.1.0 (`Superconductor.app/Contents/Resources/icon.icns`). The 47-pixel transparent outer margin is trimmed and the resulting 418 × 418
icon is resized to 512 × 512 for Raycast. Its rounded corners are preserved.

To extract it again from an installed copy:

```sh
iconutil -c iconset /Applications/Superconductor.app/Contents/Resources/icon.icns -o /tmp/superconductor-app.iconset
magick /tmp/superconductor-app.iconset/icon_512x512.png -trim +repage -resize 512x512 assets/superconductor-icon.png
```

Review the icon in Raycast's light and dark themes before release. The
Superconductor name and logo remain their owners' trademarks.

## Store screenshots

The three PNGs in `metadata/` were saved by Raycast's built-in Capture Window
command at 2000 × 1250 pixels. They show multiple-ticket entry, the starred
project picker, and launcher input with example website tasks. The demo project
is named Website and has no connected repository.

`screenshot-background.png` is a still rendered from the wave shader on the
[Superconductor landing page](https://www.superconductor.com/), using its original
colors at 2000 × 1250 pixels. The source was
[the landing-page script](https://cdn.superconductor.com/assets/entrypoints-splash-vthashDezjPbdG.js)
on November 17, 2026.

For consistent captures, select this image as Capture Window's Custom Wallpaper.
Open it in a normal Preview window behind Raycast so the glass picks up its colors.
Use the capture hotkey, then click the camera button to save. Inspect the saved PNG,
including the background and glass tint, before adding it to `metadata/`.
