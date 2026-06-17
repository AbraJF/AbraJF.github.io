# PhD personal website

A fast, dependency-free personal academic website for a PhD researcher who is also a
part-time AI & Innovation consultant/engineer. Plain HTML + CSS, deployed on
[GitHub Pages](https://pages.github.com/). No build step, no frameworks.

## Sections

- **About / Bio** — short intro, photo, social-icon row, research-interest chips, consulting one-liner.
- **News** — dated updates with category tags (Conference, Paper, Preprint, Talk, Award, News).
- **Publications** — papers and preprints, newest first.
- **Consulting** — part-time AI & Innovation consulting offer.
- **CV** — education and experience (full-time / part-time tags), downloadable PDF.
- **Contact** — email, GitHub, Google Scholar, X, LinkedIn.

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
- `assets/files/cv.pdf` — CV PDF.

## Docs

- [User guide](docs/user-guide.md) — how to edit content, no coding needed.
- [Developer guide](docs/developer-guide.md) — structure, styling, testing, deploy internals.

## Tests

```bash
python tests/test_site.py
```

Validates HTML structure, required sections, and that local asset links resolve.
See the developer guide for details.

## License

See [LICENSE](LICENSE).
