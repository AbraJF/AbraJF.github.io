# Developer guide

Technical reference for maintaining and extending the site.

## Philosophy

- **No build step.** What you see in the repo is what gets served. This keeps the site
  fast, debuggable, and immune to dependency rot — important for a site meant to live
  for years with minimal maintenance.
- **No runtime dependencies.** One HTML file, one CSS file, a few lines of optional JS.
- **Progressive enhancement.** The page is fully functional with JavaScript disabled;
  JS only updates the footer year.

## File layout

```
phd-website/
├── index.html              # All page content and structure
├── .nojekyll               # Tells GitHub Pages: serve files as-is, no Jekyll
├── assets/
│   ├── css/style.css        # All styling; design tokens in :root
│   ├── img/bram.jpg         # Portrait (user-supplied; optional)
│   └── files/cv.pdf         # CV PDF — GENERATED from data/cv.json
├── data/cv.json             # CV single source of truth
├── lib/                     # Pure logic (cv, cv-edit, site-edit, scholar)
├── scripts/build-cv.js      # cv.json → cv.pdf (puppeteer)
├── mcp/server.js            # MCP content-update server
├── .mcp.json                # Registers the MCP server for Claude Code
├── docs/
│   ├── user-guide.md        # Non-technical editing guide
│   └── developer-guide.md   # This file
├── tests/
│   ├── test_site.py         # Structure + link validation (Python stdlib)
│   └── test_lib.mjs         # Unit tests for lib/ (node:test)
└── README.md
```

## HTML conventions

- One `<section>` per content area, each with a stable `id` used by the nav anchors:
  `#about`, `#news`, `#publications`, `#consulting`, `#cv`, `#contact`.
- The About hero is split into `.hero-top` (avatar + `.hero-head` with name, taglines,
  and the `.social-icons` row) followed by full-width bio paragraphs and the
  `.interests` block (`.chips`), so the bio aligns to the page's left edge rather than
  to a narrow column beside the photo.
- Inline SVG icons in `.social-icons` — no icon-font/CDN dependency.
- Category tags use one class per kind: `.tag-full` / `.tag-part` (CV roles) and
  `.tag-conference` / `.tag-paper` / `.tag-preprint` / `.tag-talk` / `.tag-award` /
  `.tag-news` (News entries). Colours are defined in `style.css`.
- Editable content is annotated with `<!-- EDIT: ... -->` comments. Keep these when
  refactoring so the user guide stays accurate.
- The portrait `<img>` has an inline `onerror` handler that hides it when the file is
  missing — so the page never shows a broken image icon.

## CSS conventions

- All design tokens (colours, max width, radius) are CSS custom properties under
  `:root` in `style.css`. Change the theme in one place.
- Dark mode via `@media (prefers-color-scheme: dark)` — overrides only the tokens.
- Mobile-first; a single `@media (max-width: 480px)` block handles small screens.
- BEM-ish flat class names (`.pub`, `.pub-title`, `.nav-links`). No nesting tools.

## Adding a new section

1. Add a `<section id="newid" class="section">…</section>` in `index.html`.
2. Add `<li><a href="#newid">Label</a></li>` to the nav.
3. If the section is required, add `"newid"` to `REQUIRED_SECTIONS` in
   `tests/test_site.py` so its presence is tested.

## Testing

`tests/test_site.py` uses only the Python standard library (`html.parser`, `pathlib`,
`urllib`). It checks:

1. `index.html` parses without errors.
2. All `REQUIRED_SECTIONS` ids are present.
3. Each nav anchor (`href="#..."`) points to an element that exists.
4. Local resource links (`href`/`src` that aren't `http`, `mailto:`, or `#...`)
   resolve to a file on disk — **except** known user-supplied placeholders
   (`bram.jpg`, `cv.pdf`) which are allowed to be absent.

Run:

```bash
python tests/test_site.py
```

Exit code `0` = pass, `1` = failures (printed to stderr). Per the project testing
policy, run this after every change.

### Extending the tests

Add new check functions returning a list of error strings, and append their results in
`main()`. Keep the stdlib-only constraint so the suite runs anywhere without `pip`.

## Content automation (CV + MCP)

The static site has **no build step for the pages themselves** — `index.html` is still
served as-is. Two pieces of optional tooling sit *beside* it to make recurring updates
painless. They are dev-time tools; their output (the edited `index.html`, the rebuilt
`cv.pdf`) is what gets committed and served.

### Layout

```
data/cv.json            # CV single source of truth
lib/
├── cv.js               # renderCvHtml(cv) → printable HTML  (pure)
├── cv-edit.js          # addCvItem / addCvPublication        (pure)
├── site-edit.js        # insertNews / insertPublication      (pure, edits index.html string)
└── scholar.js          # parseScholarProfile (pure) + fetchScholarProfile (network)
scripts/build-cv.js     # cv.json → puppeteer → assets/files/cv.pdf
mcp/server.js           # MCP server exposing the tools below
.mcp.json               # registers the server for Claude Code
tests/test_lib.mjs      # node:test unit tests for every pure function
```

All logic lives in `lib/` as **pure functions** (no I/O), so it is unit-tested directly
in `tests/test_lib.mjs`. `scripts/` and `mcp/` are thin I/O shells around them.

### CV → PDF

`data/cv.json` is the only place CV facts live. Edit it, then:

```bash
npm run build:cv      # node scripts/build-cv.js → assets/files/cv.pdf
```

Layout/print CSS is in `lib/cv.js` (`PRINT_CSS`, A4). To restyle the PDF, edit that
constant — never edit the PDF directly.

### MCP server

`mcp/server.js` is a project-level [MCP](https://modelcontextprotocol.io) server,
registered in `.mcp.json` so Claude Code loads it automatically in this repo. Tools:

| Tool | Effect |
|------|--------|
| `add_news` | Prepend a `<li class="news">` to the News list in `index.html`. |
| `add_publication` | Add to `index.html` **and** `cv.json`, then rebuild `cv.pdf`. |
| `import_scholar` | Best-effort pull from a Google Scholar profile → site + CV → rebuild. |
| `add_cv_item` | Add an Education/Experience entry to `cv.json`, then rebuild `cv.pdf`. |

Run standalone for debugging: `npm run mcp` (speaks MCP over stdio).

**Publication de-duplication** (`isSamePublication` in `lib/cv-edit.js`) is hardened
against title drift so re-running `import_scholar` is idempotent. Two publications are
treated as the same work when **any** of these hold, in order:

1. same stable URL key — Google Scholar `citation_for_view` id, or a DOI;
2. identical normalised titles (case/punctuation/diacritics ignored);
3. token-overlap (Jaccard) ≥ 0.85.

Genuinely divergent retitles (e.g. a preprint title vs a substantially reworded
published title) fall below the threshold and are **not** auto-merged — by design.
Treat Google Scholar as ground truth and correct the canonical entry rather than
relying on fuzzy matching to reconcile two very different titles.

**Google Scholar caveat:** Scholar has no public API and rate-limits / CAPTCHAs
automated requests. `parseScholarProfile` is pure and reliable given HTML; the network
`fetchScholarProfile` is best-effort. If `import_scholar` fails, fall back to
`add_publication`. For a robust pipeline, swap the fetch for a keyed service
(e.g. SerpAPI) — the parser/insertion logic stays the same.

## Deployment internals

GitHub Pages serves the branch root directly. `.nojekyll` disables Jekyll so files in
folders beginning with `_` (none here, but future-proof) and the raw HTML are served
untouched. No GitHub Actions workflow is required for plain static files.

Custom domain: add a `CNAME` file containing the domain, and configure DNS per GitHub's
docs. Then set the domain under **Settings → Pages**.

## Roadmap ideas

- Migrate to a Jekyll academic theme (al-folio) if publication count grows large and
  you want automatic BibTeX rendering / a blog.
- Add a `publications.bib` + a small generator if manual `<li>` upkeep becomes painful.
