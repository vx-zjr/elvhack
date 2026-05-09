# Design Tokens

Source of truth: `src/styles/global.css`.

```css
@theme {
  --color-bg: #08080c;
  --color-fg: #e8e6e0;
  --color-dim: #6f6c64;
  --color-faint: rgb(232 230 224 / 0.10);
  --color-acc: #5fffd7;

  --font-serif: "EB Garamond Variable", "Iowan Old Style", Georgia,
    "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", serif;
  --font-mono: "JetBrains Mono Variable", ui-monospace, "SF Mono", Menlo,
    Consolas, "PingFang SC", "Microsoft YaHei", monospace;

  --ease-elv: cubic-bezier(.7, 0, .2, 1);
  --dur-reveal: 720ms;
  --dur-bar: 480ms;
  --dur-blink: 1050ms;
  --dur-pulse: 2600ms;
  --dur-hint: 600ms;
}
```

The cyan accent is the signal line: portal focus, active navigation, and quiet
links. The background is cool black without becoming pure black, and foreground
text stays warm to keep long reading comfortable.

Fonts are bundled through `@fontsource-variable`, not Google Fonts. This keeps
the site self-contained, improves Lighthouse stability, and avoids a third-party
font request on first paint.
