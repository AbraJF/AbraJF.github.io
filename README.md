# PhD personal website

A fast, dependency-free personal academic website for a PhD researcher who is also a
part-time AI & Innovation consultant/engineer. Plain HTML + CSS, deployed on
[GitHub Pages](https://pages.github.com/). No build step, no frameworks.

The look is an **editorial-sage** theme: serif display headings (Newsreader) over a
sans-serif body/UI (Inter), a green/amber/orange/brown palette, diamond section dividers.
Light by default, with a dark variant that activates automatically via
`prefers-color-scheme`. Fonts are **self-hosted** (no external request) and subtle motion
(scroll reveals, hover states, an animated dependency-parse in the bio) degrades
gracefully without JS and respects `prefers-reduced-motion`.

## Sections

- **About / Bio** — short intro, photo, social-icon row (email, GitHub, Google Scholar, X, LinkedIn), research-interest chips, consulting one-liner.
- **News** — dated updates with category tags (Conference, Paper, Preprint, Talk, Award, News).
- **Publications** — papers and preprints, newest first.
- **Consulting** — part-time AI & Innovation consulting offer.
- **CV** — education and experience (full-time / part-time tags), downloadable PDF.

## Quick start

```bash
# Serve locally (any static server works)
python -m http.server 8000
# then open http://localhost:8000
```

Edit `index.html` — every spot to change is marked with an `EDIT:` comment.
Replace placeholders (`Your Name`, `[University]`, links, etc.).

## Deploy on GitHub Pages

1. Push this repo to GitHub.
2. **Settings → Pages → Build and deployment → Source: `Deploy from a branch`**,
   branch `main`, folder `/ (root)`.
3. For a **user site** (`https://<username>.github.io`), name the repo
   `<username>.github.io`. For a **project site**
   (`https://<username>.github.io/phd-website`), any repo name works.

`.nojekyll` is included so GitHub Pages serves the files as-is (no Jekyll processing).

## Assets to add

- `assets/img/bram.jpg` — portrait (square works best). The `<img>` hides itself if the file is missing.
- `assets/files/cv.pdf` — **generated** from `data/cv.json` (see below), not hand-placed.

## Typography (self-hosted fonts)

Fonts ship as variable `woff2` files in `assets/fonts/`, declared in
`assets/css/fonts.css` — no Google Fonts request, works offline, identical on every
device. The live pairing is **Newsreader** (display) + **Inter** (body & UI).

Re-skin the whole site by changing three variables in `assets/css/style.css` `:root`:

```css
--font-display:"Newsreader",var(--serif);  /* headings */
--font-body:"Inter",var(--sans);           /* reading text */
--font-ui:"Inter",var(--sans);             /* nav, tags, labels */
```

To browse other combinations, open **`examples/font-playground.html`** — a preview tool
that loads ~24 families live from Google Fonts (preview only) with dropdowns and presets.
Pick a pair, then self-host it: drop its `woff2` in `assets/fonts/`, add an `@font-face`
block in `fonts.css`, and update the variables above.

## Motion & animations

All motion is progressive enhancement (see the
[developer guide](docs/developer-guide.md#motion--animations)):

- **Scroll reveals** + **hover states** — CSS transitions; JS only adds the hidden
  start state, so without JS everything is visible.
- **Animated dependency parse** — the bio opens with a sentence whose dependency arcs
  (and a ROOT marker) draw in step by step via the Web Animations API, echoing the
  thesis parse figures. JS measures word positions; `data-arcs` / `data-root` on the
  `.depparse` element define the structure.
- All of it is disabled under `prefers-reduced-motion: reduce`.

## CV (generated PDF)

The CV PDF is built from a single source of truth, `data/cv.json`:

```bash
npm install        # one-time (puppeteer + MCP SDK)
npm run build:cv   # data/cv.json → assets/files/cv.pdf
```

Edit `data/cv.json`, rerun `build:cv`. Layout lives in `lib/cv.js`.

## Content automation (MCP)

A project-level [MCP](https://modelcontextprotocol.io) server (`mcp/server.js`,
registered in `.mcp.json`) lets an MCP client push updates without hand-editing markup:

- `add_news` — add a dated News entry to `index.html`.
- `add_publication` — add a paper to the site **and** CV, rebuild the PDF.
- `import_scholar` — best-effort import from a Google Scholar profile.
- `add_cv_item` — add an Education/Experience entry to the CV, rebuild the PDF.

See the [developer guide](docs/developer-guide.md#content-automation-cv--mcp) for
details and the Google Scholar reliability caveat.

## Docs

- [User guide](docs/user-guide.md) — how to edit content, no coding needed.
- [Developer guide](docs/developer-guide.md) — structure, styling, testing, deploy internals.

## Tests

```bash
npm test               # node:test unit tests + python site validation
# or individually:
npm run test:js        # node --test tests/  (lib/ pure functions)
npm run test:site      # python tests/test_site.py
```

`test:js` covers the CV/news/publication/Scholar libraries; `test:site` validates HTML
structure, required sections, and that local asset links resolve. See the developer
guide for details.

## License

See [LICENSE](LICENSE).
