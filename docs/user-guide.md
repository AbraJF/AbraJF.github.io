# User guide — editing your website

No coding knowledge needed. Everything you edit lives in **`index.html`**. Open it in
any text editor. Spots you should change are marked with comments like:

```html
<!-- EDIT: ... -->
```

## 1. Your name and tagline

Near the top of the About section:

```html
<h1>Your Name</h1>
<p class="tagline">PhD Student in NeuroAI · [University / Lab]</p>
<p class="tagline">Part-time AI & Innovation Consultant / Engineer</p>
```

Replace the text. Also change the `<title>` and the `<meta>` tags in the
`<head>` so search engines and link previews show the right info.

## 2. Photo

Save a square photo as `assets/img/bram.jpg` (the `src` in the `<img>` points there).
If the file is missing the page simply hides the image — nothing breaks.

## 3. Bio, social icons, and research interests

- The About section opens with an **animated research band** (`<div class="research-arc">`):
  a short, self-playing sequence that walks through the PhD's idea — a language model that
  predicts language, then predicts the brain (two similar-but-not-identical pattern grids),
  then the question *why?*, then the concepts probed. It plays once when scrolled into view;
  small dots let you replay a step and a **Replay** button restarts it.
  - The narrative lines live in `<div class="arc-beats">` as one `<p class="arc-beat">` per
    beat — edit them like normal text. When animations are off they read as a short intro
    paragraph.
  - The **real bio** is the always-present set of `<p class="about-bio">` paragraphs right below
    the band — this is what no-JS visitors, reduced-motion users and search engines read. Keep it
    complete and up to date; the animation is decoration on top of it. The first paragraph
    (`.bio-lead`) is the larger opening line — keep it to one or two sentences so it reads as a
    lead; put detail in the paragraphs beneath it.
  - The figure (glyphs, pattern grids, concept chips) is built from plain markup — to tweak it,
    see the developer guide. The build is phased (`docs/research-arc-animation-plan.md`).
- The **consulting paragraph** comes after the bio in the About section — edit it like any text.
- The round **social icons** under your name are a `<ul class="social-icons">` list —
  update each link's `href` (email, GitHub, Scholar, X, LinkedIn) or remove a `<li>`.
- **Research interests** are chips: one `<li>` per interest inside
  `<ul class="chips">`. Add or remove `<li>` items.

## 4. News

Each update is one `<li class="news">` block with a date, a category tag, and text.
Newest first. The tag class sets the colour — choose from `tag-conference`,
`tag-paper`, `tag-preprint`, `tag-talk`, `tag-award`, `tag-news`.

```html
<li class="news">
  <span class="news-date">2026</span>
  <span class="tag tag-paper">Paper</span>
  <span class="news-text">Short description, with an optional <a href="URL">link</a>.</span>
</li>
```

## 5. Publications

Each paper is one `<li class="pub">` block. Copy an existing one, paste it, edit the
fields. Put the newest paper first. Remove the `<li>` blocks you don't need.

```html
<li class="pub">
  <span class="pub-title">Paper title</span>
  <span class="pub-authors">Your Name, Coauthor</span>
  <span class="pub-venue">Venue, Year</span>
  <span class="pub-links"><a href="URL">PDF</a></span>
</li>
```

## 6. Consulting

Edit the paragraphs and the bullet list under the **Consulting** section to describe
what you offer. The "Get in touch" link reuses your email — update it there.

## 7. CV

The CV on the page is the **Education**/**Experience** timelines (each entry one `<li>`);
mark roles with `<span class="tag tag-full">Full-time</span>` / `tag-part`.

The **downloadable PDF** is *generated* — don't edit `cv.pdf` directly. Instead edit
`data/cv.json` (plain text: name, sections, items, publications) and run:

```bash
npm run build:cv
```

This rebuilds `assets/files/cv.pdf` from your edits.

## 7b. Updating via Claude (MCP)

If you use Claude Code in this repo, you can just *ask* — a built-in helper
("phd-website" MCP server) does the editing for you:

- "Add a news item: 2026, Talk, gave an invited talk at X" → updates the News section.
- "Add this publication …" → adds it to the page **and** the CV PDF.
- "Import my publications from Google Scholar" → best-effort pull (may need a retry if
  Scholar rate-limits; otherwise add the paper manually).
- "Add a CV experience entry …" → updates `cv.json` and rebuilds the PDF.

Always preview and commit afterward (see below).

## 8. Contact / social links

Your contact links live in the **social-icon row** under your name in the About hero
(email, GitHub, Google Scholar, X, LinkedIn) — there is no separate Contact section.
Replace every `href` with your real links, and delete any icon for a service you
don't use.

## 9. Colours

Want different colours? Open `assets/css/style.css` and change the values at the very
top under `:root`. The site uses an editorial-sage palette (green / amber / orange /
brown). Visitors get a **theme toggle** (the moon/sun button in the nav) and the site
also follows their system setting by default; their choice is remembered. To tune the
dark colours, edit the `html[data-theme="dark"]` block just below `:root` (the
`@media (prefers-color-scheme: dark)` block mirrors it for visitors who never click the
toggle — keep the two in sync).

## Getting found on Google (SEO)

The site ships search-ready: a sitemap, structured data, and your profile links. To get
Google to index it, verify the site in [Google Search Console](https://search.google.com/search-console)
(URL-prefix property `https://abrajf.github.io/`), submit `sitemap.xml`, and request
indexing. The `google*.html` files at the repo root are ownership tokens — **don't delete
them**. The single biggest ranking lever for your name is **backlinks**: link the site
from your ORCID, Google Scholar, LinkedIn, GitHub profile, and your institute staff page.

## Preview before publishing

```bash
python -m http.server 8000
```

Open `http://localhost:8000` in your browser. When happy, commit and push — GitHub
Pages updates within a minute or two.
