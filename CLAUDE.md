# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Webpack dev server at http://localhost:3001 (live reload, no HMR)
npm run build    # Production build → dist/
npm run watch    # Webpack watch mode (no dev server)
```

No lint or test scripts are configured.

## Architecture

This is a **static marketing site** (Abu Dhabi Food Hub) built with Webpack 5 + Tailwind CSS v4 + vanilla JS.

### Build pipeline

`src/templates/index.html` → **FileIncludeWebpackPlugin** resolves all `@@include()` directives → Webpack bundles JS → PostCSS processes Tailwind → output lands in `dist/`.

Tailwind scans `src/templates/**/*.html` and `src/includes/**/*.html` for class names. There is no `tailwind.config.js` — all custom theme tokens (colors, fonts, sizes) are defined in `src/styles/styles.css` using Tailwind v4's `@theme {}` block.

### Templating system

HTML components live in `src/includes/` and are composed via `@@include()` with a JSON parameter object:

```html
@@include("../includes/sections/section-tab.html", {
  "tab": { "id": "tab-1", "videoSrc": "hero.mp4", "buttonText": "Build with Us" }
})
```

Inside the included file, values are accessed as `@@tab.id`, `@@tab.videoSrc`, etc. **Plugin constraint:** argument values cannot contain `@@` characters — inline the markup instead of nesting includes when this is needed.

### CSS stacking context — critical pattern

The hero section uses `position: fixed` video backgrounds inside a `z-1` section. This is intentional:

- `<section class="relative z-1">` creates a low-level stacking context
- Fixed video elements inside inherit that z-1 context globally
- Subsequent `bg-white relative z-10` sections correctly scroll over the videos

If you move fixed children into a higher-z-indexed ancestor (e.g. `z-20`), the fixed videos will cover the entire page. Keep tab panes as **direct children** of the `z-1` section, outside any `z-20` container.

### External dependencies (CDN, not npm)

jQuery, Slick carousel, GSAP, and ScrollTrigger are loaded via CDN `<script>` tags at the bottom of `src/includes/footer.html` — they are **not** in `package.json`. They load before `js/main.js` and are available as globals (`$`, `gsap`, `ScrollTrigger`). Headroom.js is the only runtime npm dependency.

### JavaScript (`src/scripts/script.js`)

Single bundled file organized by feature. Webpack output is `dist/js/main.js`, referenced in HTML as `js/main.js`.

| Feature | Description |
|---|---|
| Mega menu | Hover/click panels, search focus |
| Tab system | `.tab` elements with `data-target` → shows/hides `.tab-pane` elements by id |
| Slick sliders | Service cards, small cards, news cards; re-initialized on RTL toggle |
| Accordion | `aria-expanded` toggles, auto-close siblings |
| Globe canvas | Interactive 3D rotating globe with GeoJSON, mouse/touch drag, UAE highlight |
| i18n / RTL | EN/AR language switch; flips `dir` attribute; re-inits sliders |
| Headroom | Sticky header hide-on-scroll via `headroom.js` on `#header` |

Tab system pattern: JS removes `hidden` from the first `.tab-pane` on load and toggles `hidden` on click. Active tab gets `text-white border-primary-glowgreen`; inactive gets `text-white/50 border-transparent`.

### i18n / RTL system

- `<html lang="en" dir="ltr">` is the root toggle target (not `<body>`)
- The globe button (`id="lang-toggle"` in `header.html`) flips `lang` (en↔ar) and `dir` (ltr↔rtl) on `<html>`
- **Text-only** translatable elements use `data-i18n="key"` (JS sets `textContent`)
- **HTML-content** elements use `data-i18n-html="key"` (JS sets `innerHTML`)
- Translation dictionary lives in the lang-toggle IIFE at the bottom of `script.js`
- RTL-aware CSS: use logical properties (`ps`/`pe`/`ms`/`me`/`start`/`end`) throughout — never `pl`/`pr`/`ml`/`mr`/`left`/`right`
- Arrow/directional icons use `rtl:scale-x-[-1]` to flip automatically

### Component hover pattern (service cards)

Cards use Tailwind `group` on the article. The **expanding panel** works by animating `padding-bottom` on the **text content div** (not the white panel container). This keeps the arrow button (a flex sibling with `items-end`) stationary. The "Read more" link is `absolute -bottom-8` (clipped by `overflow-hidden`) and slides to `group-hover:bottom-3`.

### Key custom theme tokens

Defined in `src/styles/styles.css` via Tailwind v4 `@theme {}`:

```
--color-primary-deepblue: #283a57
--color-secondary-deepblue: #283a57a8
--color-primary-lightblue: #14b8e7
--color-primary-green: #709936
--color-primary-glowgreen: #8cd623
--color-primary-yellow: #d4ac39
--color-primary-lightgrey: #f5f6f6
--color-primary-grey: #333332
--color-secondary-grey: #131313
--color-secondary-grey-light: #f1f1f1
--font-heading: "Exo"
--font-body: "Inter"
```

The `.container` utility is defined here too: `max-w-[1536px] px-4 md:px-8 2xl:px-12 mx-auto w-full`.

### Assets

Webpack copies images, videos (mp4/webm), and fonts to `dist/assets/`. Reference assets in HTML as `assets/filename.ext`.
