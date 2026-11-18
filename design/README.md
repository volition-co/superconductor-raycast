# Extension icon

`source-icon.svg` is the editable source downloaded from [Superconductor's public favicon](https://www.superconductor.com/favicon.svg). Only `assets/icon.png` is bundled with the extension.

To regenerate the 512 × 512 PNG with librsvg installed, run from the repository root:

```sh
rsvg-convert -w 512 -h 512 design/source-icon.svg -o assets/icon.png
```

Review the icon in Raycast's light and dark themes before release. The Superconductor name and logo remain their owners' trademarks.
