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
│   ├── img/avatar.jpg       # Portrait (user-supplied; optional)
│   └── files/cv.pdf         # CV PDF (user-supplied)
├── docs/
│   ├── user-guide.md        # Non-technical editing guide
│   └── developer-guide.md   # This file
├── tests/
│   └── test_site.py         # Structure + link validation (stdlib only)
└── README.md
```

## HTML conventions

- One `<section>` per content area, each with a stable `id` used by the nav anchors:
  `#about`, `#publications`, `#consulting`, `#cv`, `#contact`.
- Editable content is annotated with `<!-- EDIT: ... -->` comments. Keep these when
  refactoring so the user guide stays accurate.
- The avatar `<img>` has an inline `onerror` handler that hides it when the file is
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
   (`avatar.jpg`, `cv.pdf`) which are allowed to be absent.

Run:

```bash
python tests/test_site.py
```

Exit code `0` = pass, `1` = failures (printed to stderr). Per the project testing
policy, run this after every change.

### Extending the tests

Add new check functions returning a list of error strings, and append their results in
`main()`. Keep the stdlib-only constraint so the suite runs anywhere without `pip`.

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
