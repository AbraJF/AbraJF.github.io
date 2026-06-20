# TODO

Open work for the site, newest priorities first.

- [x] **Research-arc animation** — multi-beat narrative of the PhD's through-line
      (LM predicts language → predicts the brain → why? → concepts → syntax →
      causal erasure → bio). Full spec + beat script in
      `docs/research-arc-animation-plan.md`. Bio stays in DOM (`.about-bio`);
      respects `prefers-reduced-motion`; degrades without JS.
      - **Decided:** autoplay-on-view + controls (dots, replay, pause-on-hover) —
        scroll-driven scrollytelling was built and rejected (felt like broken
        scrolling). Provider names cut entirely.
      - **Done (all 10 beats):** 1–2 LM glyph → token-streamed prediction; 3 brain
        + RDM heatmaps linked by ≈; 4 "why?"; 5 concepts/magnifier + chips; 6 brain
        returns with a "drives?" arrow; 7 syntax dependency-parse (ported from git
        `6c9a5ca` as `buildSyntax`) with a marked attachment error + correction;
        8 open question (brain re-lights + pulsing "?"); 9 causal erasure (scissors
        snip the LM, parse arcs fade, brain RDM partially degrades); 10 resolves to
        the LM ≈ brain through-line, then the bio. Glyph row is position-locked from
        beat 3 (RDM/chip space reserved; fixed-width relation slot).
      - **Polish (optional, later):** timing pass over the full 10-beat run; the
        reserved whitespace at beat 3 (pre-RDM) could be tightened.
- [x] **Arc caption spacing** — increased the gap between the caption and the
      figure (static `.arc-beats` margin-top → .95rem; `.js-arc .arc-beats`
      margin-top 0 → .85rem).
- [x] **Arc start trigger** — the arc now begins only once its *bottom* edge is on
      screen (IntersectionObserver checks `boundingClientRect.bottom <= rootBounds.bottom`,
      with a fallback for viewports too short to fit the whole band).
- [x] **Arc word-by-word reveal** — beats 2+ reveal one word at a time
      (`.arc-word` spans split by the engine), with trigger words pulling in the
      matching figure (`SEEN_TRIGGER`: "brain" → brain column, "why" → question
      pivot, "concepts" → chips). Beat 2's prediction still streams token-by-token
      after the words land. Verified in headless Chrome (no JS errors, full 1→5
      progression, trigger sync confirmed).
- [x] **Header anchor positions** — added `scroll-padding-top` on `html` (4.75rem
      desktop, 6.75rem ≤560px) so anchor jumps clear the sticky header on both
      layouts.
- [ ] **Fix content** — review and correct the copy across all sections (About,
      News, Publications, Consulting, CV) for accuracy and tone.
- [ ] **Improve fonts & feel** — refine the typography: display/body pairing,
      sizes, line-height and spacing; tighten overall visual polish.
- [ ] **Add animations / flair** — subtle motion and transitions to bring the
      page to life (e.g. on-scroll reveals, hover states). Must respect
      `prefers-reduced-motion: reduce` and degrade gracefully without JS.
- [x] **SEO** — canonical URL, fuller Open Graph (url/site_name/locale/image) +
      Twitter card, JSON-LD `Person` + `ScholarlyArticle`, `sitemap.xml`,
      `robots.txt`. Headings already semantic. All URLs assume the user site
      `https://abrajf.github.io/` (update if a custom domain / CNAME is added).
