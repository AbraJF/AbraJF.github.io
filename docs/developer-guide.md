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
├── index.html              # All page content and structure (incl. SEO <head>)
├── robots.txt              # Crawler directives + sitemap pointer
├── sitemap.xml             # Single-URL sitemap (the home page)
├── .nojekyll               # Tells GitHub Pages: serve files as-is, no Jekyll
├── assets/
│   ├── css/style.css        # All styling; design tokens in :root
│   ├── css/fonts.css        # @font-face for self-hosted webfonts
│   ├── fonts/               # Variable woff2 (Newsreader, Inter), latin+latin-ext
│   ├── img/bram.jpg         # Portrait (user-supplied; optional)
│   └── files/cv.pdf         # CV PDF — GENERATED from data/cv.json
├── data/cv.json             # CV single source of truth
├── examples/
│   └── font-playground.html # Live font-pairing preview (Google Fonts CDN; dev only)
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
  `#about`, `#news`, `#publications`, `#consulting`, `#cv`. (Contact links live in the
  About hero social-icon row, not a separate section.)
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
- **SEO / `<head>`** — `<title>` + `meta description`, a `link rel="canonical"`, Open
  Graph (`og:title/description/type/url/site_name/locale/image`) and a Twitter
  `summary` card, plus two JSON-LD blocks (`Person` and the published
  `ScholarlyArticle`). All absolute URLs hardcode the user site
  `https://abrajf.github.io/`; if a custom domain is added (a `CNAME` file), update
  these, `robots.txt`, and `sitemap.xml` together. `scroll-padding-top` on `html`
  offsets in-page anchor jumps so section titles clear the sticky header (a larger
  value below 560px, where the nav is taller).

## CSS conventions

- Editorial-sage theme. Three font variables under `:root` drive all type:
  `--font-display` (headings, nav brand, pub titles), `--font-body` (reading text),
  `--font-ui` (nav, tags, labels, metadata). Each is a self-hosted webfont with a
  system fallback (`--serif` / `--sans`). Live pairing: Newsreader + Inter.
- All design tokens (palette, max width, surfaces, on-accent text, shadows, fonts) are
  CSS custom properties under `:root` in `style.css`. Change the theme in one place.
- Dark mode via `@media (prefers-color-scheme: dark)` — overrides **only** the `:root`
  tokens; every rule below references variables, so no rule is duplicated per mode.
- End-of-section dividers are a pseudo-element diamond (`◆`) on a fading hairline
  (`.section:not(:last-of-type)::before/::after`); the last section omits it.
- Mobile-first. Two breakpoints: `@media (max-width: 480px)` for hero/news stacking,
  and `@media (max-width: 560px)` which turns the nav into a horizontally scrollable
  row (styled scrollbar + CSS scroll-shadow edge fade for iOS).
- BEM-ish flat class names (`.pub`, `.pub-title`, `.nav-links`). No nesting tools.

## Typography (self-hosted fonts)

- `assets/css/fonts.css` holds the `@font-face` blocks. Each family is a **variable**
  `woff2` (weight axis 400–700 in one file) with separate roman + italic files, each
  split into `latin` + `latin-ext` subsets (the latter covers accented names like
  "de Heer Kloots"). `font-display:swap`.
- Linked **before** `style.css` in `index.html` so the faces are known when the
  cascade resolves `--font-display` / `--font-body` / `--font-ui`.
- To add a family: drop its `woff2` in `assets/fonts/`, copy a block in `fonts.css`,
  then point a font variable at it. Files were pulled from the Google Fonts CSS API
  (`css2` endpoint, latin/latin-ext woff2).
- `examples/font-playground.html` is a **dev-only** preview that loads ~24 families
  live from the Google Fonts CDN with dropdowns + presets — it is NOT shipped/linked by
  the live site, which only ever self-hosts the chosen pair.

## Motion & animations

All motion is progressive enhancement, gated so the site is fully usable without JS and
silent under `prefers-reduced-motion: reduce`. Logic lives in the inline `<script>` at
the bottom of `index.html`; styles in the "Motion & flair" block of `style.css`.

- **Hover** — pure CSS transitions (avatar scale, chip/button/icon lift, animated nav
  underline). Disabled in the reduced-motion media query.
- **Scroll reveals** — an `IntersectionObserver` adds `.is-visible` to tagged blocks.
  The hidden start state lives behind a `.js-reveal` class added to `<html>` only when
  JS runs **and** motion is allowed, so no-JS / reduced-motion users see content as-is.
- **Animated research arc** (the `.research-arc` IIFE) — a self-playing, multi-beat
  narrative of the PhD's through-line. It sits in **normal page flow** (no scroll
  hijack): the engine adds `.js-arc` to `<html>`, plays the sequence once when the band
  scrolls into view, and exposes playback controls. The real bio is a separate, always-in-DOM
  `<p class="about-bio">` below the band (not the captions), so no-JS / reduced-motion /
  crawlers always get the full text. Full spec + beat script: `docs/research-arc-animation-plan.md`.
  All **10 beats** are live. The legacy four-beat dep-parse engine (arcs, ROOT, WAAPI) from git
  commit `6c9a5ca` was **ported back in** as beat 7 and rebuilt onto the beat timeline
  (`buildSyntax`, below); beats 8–10 add the open question, causal erasure, and the resolve.

  Structure (inside `.arc-stage`, which is `aria-hidden`):
  - `.arc-stage` is bottom-aligned (`justify-content:flex-end`) and **reserved at the tallest
    figure's height** (a fixed `min-height`, 208px desktop / 170px mobile — the measured beat-5
    max). So the figure grows *upward* into the spare space as icons/RDMs/chips appear, its
    bottom edge stays put, and the caption below never jumps between beats. To stop the *glyphs*
    themselves drifting, the RDM `.arc-pattern` boxes and the `.arc-concepts` row are **space-
    reserved (`visibility:hidden`) from `data-seen~="3"`** — so the glyph row jumps up once, with
    the brain's entrance, then holds its position through beats 3–6; the cells/chips merely fill
    in (`visible` + scale/fan-in) at `3r`/`5` without lifting the glyphs. Beat 7 is the one
  deliberate exception (the parse grows the figure downward) — but its layout changes (chips
  collapse, parse reserved via `prepareSyntax`) are all triggered at **beat-7 start**
  (`data-beat="7"`), not on the "syntax" word, so the caption drops once cleanly instead of
  flashing high then jumping down mid-line.
  - `.arc-figure` > `.arc-row` — the glyph row: `.arc-col-lm` and `.arc-col-brain`
    (each a `currentColor` inline-SVG `.arc-glyph` + `.arc-glyph-label` + an RDM
    `.arc-pattern`), with `.arc-rel` (the `≈`/`similar`, a `?`, and the beat-6
    `drives?` arrow) centred between them. `.arc-rel` is **fixed-width** and reserved
    the moment the brain joins (`data-seen~="3"`), so swapping its inner content
    across beats 3–6 never reflows the row — the glyphs lock in place from beat 3.
  - `.arc-pattern` — a 4×4 representational-dissimilarity matrix of `.arc-cell` cells.
    Value classes `v0`–`v3` set warm/red intensity (diagonal = `v3`, same stimulus); the
    brain's differing off-diagonal cells carry `.d` (a green ring) for "similar, not identical".
    Cells are real markup so they survive no-JS; JS only staggers their reveal.
  - `.arc-concepts` — the concept chips (`.arc-concept`, Semantics/Syntax/Pragmatics) that
    fan in at the concepts beat; `.arc-magnifier` is the badge on the LM glyph.
  - `.arc-drive` (inside `.arc-rel`) — beat 6: the brain returns to focus and the link
    resolves from "≈ similar" into a directed "→ drives?" arrow (does accurate concept
    representation *drive* the model's brain prediction — the open question).
  - `.arc-syntax` > `.depparse` — beat 7: a dependency parse of a probe sentence ("I saw the
    man with the telescope"). Plain text in the DOM; the engine overlays an SVG of labelled
    arcs. It plants the classic PP-attachment mistake — the model hangs "with the telescope"
    on the verb (`obl`, the `data-wrong` arc), which is **drawn, marked ✗ + struck red**, then
    **corrected** onto the noun (`nmod`, the final `data-arcs` entry, drawn in green).
    `data-arcs` = `[head, dep, label]` indices over the `.w` words; `data-root` is the root word.
  - `.arc-scissors` (on the LM glyph, like `.arc-magnifier`) — beat 9: snips the model
    (causal erasure). Together with the parse-arc fade and the brain-RDM degrade it is a
    **one-shot keyed off `data-beat="9"`** (the *current* beat, not cumulative `data-seen`), so
    it clears itself at beat 10. Beats: 8 re-lights the brain + a pulsing `?` (open question,
    parse stays); 9 runs the erasure (scissors / `.dep-svg` fades / a few brain `.arc-cell`s
    shift intensity — degrade, not blank); 10 hides the parse and restores `≈ similar`, calm,
    settling to the LM ≈ brain through-line before `.about-bio`.
  - `.arc-beats` — one `<p class="arc-beat" data-beat="N">` per beat; JS crossfades one at a
    time (`.is-active`). Beats 2+ reveal **word by word**: `splitNode()` wraps each word in an
    `.arc-word` span (recursing into `<strong>`/`<em>`), held at `opacity:0` until `.is-on`.
    Beat 2's prediction then streams token-by-token: `.arc-tok` spans inside `.arc-pred`, with
    a `.arc-caret` that blinks only during the prediction phase (`.is-predicting`).
  - `.arc-controls` — a progress **dot** per beat (jump target) + a **Replay** button.

  The engine maps a beat index to two attributes on `.arc-stage`: cumulative
  `data-seen="1 2 …"` (CSS reveals figure parts and stays) and `data-beat="N"` (the current
  beat, for one-shot flourishes). `setBeat(i)` resets to the start of a beat (figure shows
  earlier beats; this beat's words hidden); `playBeat(i)` reveals it word by word and then
  advances; `completeBeat(i)` (dot jumps) shows it in full at once. A beat's figure reveal is
  **staged via `BEATS_CFG`** (keyed by `data-beat`): `now` tokens show at beat start, `word`
  tokens show as a synced word appears, `end` tokens show once the line finishes, and `all` is
  the full set used to rebuild past beats' state. So "why" → question pivot and "concepts" →
  chips fire mid-line, while **beat 3 is staged in three**: the brain column joins on "human
  brain" (`3`), then the two RDMs + the "≈ similar" relation land together at end-of-line (`3r`)
  and linger; "drives" (`6`) brings the brain back, "syntax" (`7`) reveals the parse and calls
  `buildSyntax()`. `WORD_STEP` is the per-word gap, `PAUSE` the caret "think"
  before streaming, `TOKEN_STEP` the per-token gap, and `data-dwell` (else `DEFAULT_HOLD`) the
  hold *after* a line finishes revealing. Every reveal loop polls a `paused` flag, so hover /
  keyboard-focus freezes mid-reveal and resumes cleanly; a dot click stops autoplay and jumps;
  Replay restarts. The band autoplays once its **bottom edge** scrolls on screen (the
  IntersectionObserver checks `boundingClientRect.bottom` against `rootBounds`). Reveal
  animations are CSS, keyed off `data-seen`/`data-beat`; per-cell stagger delays are set inline
  by the engine. Without JS — or under reduced motion — `.js-arc` is never added: the band shows
  its static figure, the beats read as a short intro paragraph, controls stay hidden, and
  `.about-bio` carries the meaning.

  **Beat 7's dep-parse** splits into reserve-then-draw. `.arc-syntax` is shown the moment beat 7
  starts (`data-beat="7"`), and `setBeat` calls **`prepareSyntax()`** → `layoutSyntax()`: it reserves
  padding for the tallest arc, measures each `.w` centre, and builds the SVG **hidden** (`curve`/
  `arrow`/`label` builders; each element stashes a `_delay`; `getBoundingClientRect` forces a sync
  layout, so no rAF). That reserves the parse's full height up front, so the caption is at its final
  position before the words reveal. The word "syntax" then calls **`drawSyntax()`** → `playSyntax()`,
  which animates the staggered draw-in via the Web Animations API (stroke-dashoffset + opacity):
  structural arcs first, then the `data-wrong` arc, then (after a delay) `markWrong()` recolours it +
  strikes the label + shows the ✗, then the corrected arc draws. All labels (and the ✗) are built
  into a `.dep-labels` group appended **last**, so every label box paints in front of every arc /
  arrowhead — a later-drawn arc can't slice through an earlier label. Dot-jumps use **`snapSyntaxNow()`**
  → `snapSyntax()` (lay out if needed, then jump to the final state). `resetSyntax()` tears the SVG down so Replay re-animates it —
  but `setBeat` only calls it when entering at/before the syntax beat (`i <= idx7`), so forward
  auto-advance into beats 8–9 keeps the drawn parse on screen. Because the parse is large, **beat 7 grows the figure downward** below the
  reserved `min-height` (the only beat that does) — a deliberate "the parse unfurls" reveal rather
  than a layout bug. Reduced motion never reaches `buildSyntax` (the engine returns before adding
  `.js-arc`), leaving just the plain sentence.

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
