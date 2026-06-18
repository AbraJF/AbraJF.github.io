# PhD personal website

A fast, dependency-free personal academic website for a PhD researcher who is also a
part-time AI & Innovation consultant/engineer. Plain HTML + CSS, deployed on
[GitHub Pages](https://pages.github.com/). No build step, no frameworks.

The look is an **editorial-sage** theme: serif display headings over sans-serif accents,
a green/amber/orange/brown palette, diamond section dividers. Light by default, with a
dark variant that activates automatically via `prefers-color-scheme`.

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
