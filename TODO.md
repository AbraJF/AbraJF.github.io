# TODO

Open work for the site, newest priorities first.

- [ ] **Research-arc animation** — multi-beat narrative of the PhD's through-line
      (LM predicts language → predicts the brain → why? → concepts → syntax →
      causal erasure → bio). Full spec + beat script in
      `docs/research-arc-animation-plan.md`. Bio stays in DOM (`.about-bio`);
      respects `prefers-reduced-motion`; degrades without JS.
      - **Decided:** autoplay-on-view + controls (dots, replay, pause-on-hover) —
        scroll-driven scrollytelling was built and rejected (felt like broken
        scrolling). Provider names cut entirely.
      - **Done:** beats 1–5 (LM glyph → token-streamed prediction → brain + RDM
        heatmaps linked by ≈ → "why?" → concepts/magnifier + chips).
      - **Next:** beat 6 (accurate/drives-prediction), beat 7 (syntax dep-parse —
        port the parked engine from git `6c9a5ca`), beats 8–10 (probe / causal
        erasure), resolve to bio + polish.
- [ ] **Arc caption spacing** — very slightly increase the distance between the
      caption text and the icons/figure in the research-arc animation (currently
      hugging a touch too tightly).
- [ ] **Arc start trigger** — only begin playing the arc once the *bottom* of the
      animation is in the viewport (so the whole figure is on-screen before it
      starts), instead of the current 0.4 intersection threshold.
- [ ] **Arc word-by-word reveal** — from beat 2 onward, let the caption words
      appear one word at a time, and sync the matching icons/images to appear with
      the right word (e.g. "human brain" → brain glyph; "concepts" → chips). The
      "icting language" completion stays token-by-token (it already streams).
- [ ] **Header anchor positions** — make sure every header nav link lands at the
      perfect scroll position for its section on both mobile and desktop (account
      for the sticky header height; use `scroll-margin-top` / `scroll-padding-top`
      so titles aren't hidden under the bar). Verify each anchor on both layouts.
- [ ] **Fix content** — review and correct the copy across all sections (About,
      News, Publications, Consulting, CV) for accuracy and tone.
- [ ] **Improve fonts & feel** — refine the typography: display/body pairing,
      sizes, line-height and spacing; tighten overall visual polish.
- [ ] **Add animations / flair** — subtle motion and transitions to bring the
      page to life (e.g. on-scroll reveals, hover states). Must respect
      `prefers-reduced-motion: reduce` and degrade gracefully without JS.
- [ ] **SEO** — meta tags (title, description), Open Graph / Twitter cards,
      structured data (JSON-LD Person/ScholarlyArticle), sitemap.xml, robots.txt,
      canonical URL, semantic headings.
