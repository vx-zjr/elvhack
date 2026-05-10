# Design Tokens

Source of truth: `src/styles/global.css`.

```css
@theme {
  --color-bg: #1c1c1a;
  --color-surface: #262624;
  --color-text: #e8e6df;
  --color-muted: #aaa69d;
  --color-border: rgb(232 230 223 / 0.12);
  --color-link: #5fffd7;
  --color-code-bg: #20201e;
  --color-card-bg: #242422;
  --color-fg: #e8e6df;
  --color-dim: #aaa69d;
  --color-faint: rgb(232 230 223 / 0.12);
  --color-acc: #5fffd7;
  --color-quant-frame: #4aa3ff;

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

`[data-theme="light"]` overrides the same semantic tokens with a warm paper
palette:

```css
--color-bg: #f7f4ed;
--color-surface: #fbfaf7;
--color-text: #2f2f2f;
--color-muted: #66615a;
--color-border: rgb(47 47 47 / 0.12);
--color-link: #2f6f67;
--color-code-bg: #eee9df;
--color-card-bg: #fbfaf7;
```

The cyan accent is the signal line for dark mode: portal focus, active
navigation, quiet links, and the TECH frame. QUANT uses a separate blue frame
token to separate the two homepage entries without changing the broader accent
system. Light mode moves links to a quieter green-gray to keep the reading
surface warm and low contrast.

Fonts are bundled through `@fontsource-variable`, not Google Fonts. This keeps
the site self-contained, improves Lighthouse stability, and avoids a third-party
font request on first paint.

## Layout tokens

Source of truth: `src/styles/layout.css`.

```css
:root {
  --page-max: 1180px;
  --page-wide: 1280px;
  --content-max: 720px;
  --content-wide: 820px;
  --side-left: 140px;
  --side-right: 220px;
  --gap-xs: 8px;
  --gap-sm: 12px;
  --gap-md: 20px;
  --gap-lg: 32px;
  --gap-xl: 48px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --header-height: 64px;
}
```

The shell classes use those tokens to keep pages wide enough for research-blog
navigation while preserving a 720px reading column for long-form posts. Article
pages use the side tokens for desktop metadata and table-of-contents columns,
then collapse to a single column below the tablet breakpoint.
