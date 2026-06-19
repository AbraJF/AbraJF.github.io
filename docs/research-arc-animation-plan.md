# Research-arc animation — plan & critique

A scrollytelling hero for the About section that walks a visitor through the PhD's
central question, then resolves into the static bio. This document is the spec to
work from after the conversation context is cleared.

> **Status:** planning. Supersedes the current four-beat `.research-arc` figure
> (`index.html` + the `.research-arc` IIFE). That engine — the dependency-parse
> drawer, glyphs, scissors — is **reused**, not thrown away.

---

## 1. The story (what the visitor learns)

A funnel from a broad, known fact down to this specific PhD:

1. Language models are great at **predicting language**.
2. They are also surprisingly great at **predicting how the human brain responds to
   language**.
3. **Why?** That is the question.
4. To answer it, look at **which concepts** the models represent (semantics, syntax,
   pragmatics…), **how accurately**, and whether that is **what drives their
   predictive power over the brain**.
5. Worked example — **syntax**: probe it (dependency parse, including a realistic
   mistake), then ask: do models that represent syntax better also predict the brain
   better? And if we **erase** a model's ability to represent syntax, does its brain
   prediction degrade too?
6. Resolve into the **full bio**.

---

## 2. Beat-by-beat script (refined)

Each beat = a short line of narrative text + a synchronized figure state. "Clear"
means the previous line is removed before the next appears. The **figure is sticky**;
text beats advance with scroll (see §4).

| # | Narrative text | Figure / animation |
|---|----------------|--------------------|
| 1 | "Language models" | LM glyph appears. A few **wordmarks** (OpenAI, Anthropic, Mistral — *text, not logos*; see critique 3) flash in and fade, glyph remains. |
| 2 | "…are great at **predicting language**." | Sentence completes itself (type-on / fill-in of "predicting language"). |
| 3 | "But they are also great at predicting how the **human brain** responds to language." | Brain glyph appears. A sentence flows **into the LM** → LM emits a pattern (colored cells). The *same* sentence flows **into the brain** → brain shows a **similar-but-not-identical** pattern. A small "≈ matches" indicator links them. (Do **not** show identical patterns — critique 4.) |
| 4 | "The question is… **why?**" | Figure quiets; a question mark / both glyphs held with the link pulsing. |
| 5 | "To answer it, we look at which **concepts** these models represent." | Magnifying glass over the LM; labelled lines fan out: **semantics · syntax · pragmatics**. |
| 6 | "…whether they are represented **accurately**, and whether that **drives their prediction of the brain**." | (Compressed from old beats 6–7.) The three concept lines re-converge onto the LM→brain link, which strengthens. *Anim TBD — keep concrete.* |
| 7 | "For example: how well do they represent **syntax**?" | Dependency-parse animation (reuse existing engine) on a **new** sentence, drawn so it appears to **flow out of the LM glyph**. Include one **plausible attachment error**, then **mark it** (e.g. red strike + ✗). |
| 8 | "Are models that represent syntax better also better at **predicting the brain**?" | Parse stays. Link to brain highlighted as the open question. |
| 9 | "What if we **remove** a model's ability to represent syntax?" → "Does its prediction of the brain break too?" | **Scissors** on the LM; dependency arcs fade away; the LM→brain pattern **degrades** (brain pattern partially scrambles, not blanks — critique 4). |
| 10 | — (text cleared) | All transient animation cleans up; figure settles to a calm resting state. |
| 11 | **Full bio** (the real About text) | Bio fades in / is revealed. This text is **always in the DOM** (critique 2). |

---

## 3. Hard requirements (non-negotiable)

- **Bio always in the DOM.** The real About bio is present in markup at all times for
  no-JS, reduced-motion, and search crawlers (ties into the SEO TODO). The animation
  is layered enhancement, never the only source of the bio.
- **Reduced motion / no-JS:** skip the entire show. Render the static end-state —
  glyphs (optional), and the full bio — immediately. No autoplay, no scrubbing.
- **Skippable & reversible:** the visitor must be able to get past it instantly
  (scroll) and ideally scroll back up to replay.
- **Mobile-first layout:** stack LM / brain / patterns vertically under ~640px; parse
  sentence scrolls horizontally as today. Design this in, not after.
- **Scientific honesty:** similar-not-identical model/brain patterns; partial (not
  total) degradation on erasure; a realistic, marked parse error.

---

## 4. How it advances — DECIDED: autoplay on view + controls

**Chosen: autoplay-on-view with playback controls.** Scroll-driven scrollytelling
was built first and **rejected** — the sticky pin + tall spacer makes the page "stop"
mid-scroll, which reads as broken/janky.

Current model:
- The band sits in **normal page flow** (no `position: sticky`, no tall wrapper, no
  scroll hijack).
- An `IntersectionObserver` starts the sequence once the band scrolls into view; beats
  advance on a timer (`DWELL`, currently 2600 ms).
- **Controls:** one progress **dot per beat** (also a jump target) + a **Replay**
  button. Hover / keyboard-focus within the band **pauses** the timer so visitors can
  read; clicking a dot stops autoplay and jumps.
- State model carries over from the scroll version: stage `data-seen="1 2 …"`
  (cumulative — figure elements appear and stay, keyed by CSS) and `data-beat="N"`
  (current beat); `.arc-beat.is-active` crossfades one narrative line at a time.

**Rejected alternatives:**
- *Scroll-driven scrollytelling:* feels like broken scrolling (the sticky pin). Built,
  then removed.
- *Click / tap to advance only:* good control, but many visitors never click and would
  see only beat 1. (Folded in as the dots, on top of autoplay.)
- *Reveal-on-scroll panels:* natural scroll, but loses the single morphing figure.
- *Static figure, no narrative:* lowest risk, loses the funnel storytelling.

---

## 5. Other open decisions

1. **Company names:** wordmarks-as-text (recommended), abstract tokens, or cut
   entirely? (Real logos rejected — trademark + aesthetic + maintenance.)
2. **Pattern representation:** what are the "colored patterns"? Options: small RDM-like
   grids (accurate to the RSA method), abstract heatmap strips, or node-activation
   dots. Must read at a glance on mobile and stay honest.
3. **Beats 5–6 (concepts / accurate / predictive):** can they be merged further? These
   are the most abstract and the highest risk of vague filler.
4. **Length budget:** how much vertical scroll is acceptable before the bio? (Long
   scrollytelling pushes News/Publications far down the page.)
5. **Placement:** does this replace the whole top of About, or sit as a distinct hero
   band above it?
6. **Reuse vs rebuild:** confirm the existing dep-parse engine (arcs, ROOT, scissors,
   WAAPI sequencing) is the base for beat 7; the glyphs (`.arc-lm`, `.arc-brain`) and
   link carry over.

---

## 6. Critique summary (why the plan changed)

1. ~~**Autoplay timing** is the core risk → go scroll-driven.~~ **Reversed (§4):**
   scroll-driven was built and felt like broken scrolling. Now autoplay-on-view +
   controls (dots, replay, pause-on-hover) handle the timing risk instead.
2. **Bio hidden till the end** breaks the page's job, a11y, and SEO → bio always in
   DOM; animation is enhancement.
3. **Real company logos** → drop; trademark + clashes with the serif minimalism +
   dates fast. **Update:** provider names cut entirely (no logos *and* no text
   wordmarks) — they added clutter and implied affiliation.
4. **"Identical model/brain pattern"** overstates RSA → similar-not-identical;
   degrade-not-vanish on erasure.
5. **Vague middle beats** (concepts/accurate/predictive) → compress to concrete steps.
6. **Effort** → phase it (§7); reuse the dep-parse engine.
7. **Mobile** → stacked layout designed in from the start.
8. **Parse mistake** → keep; make it a plausible attachment error, clearly marked.

---

## 7. Suggested build phases

1. **Scaffolding & a11y baseline:** sticky scrollytelling shell, beat → scroll mapping,
   reduced-motion / no-JS path that shows the static bio. Get the skeleton + fallback
   right before any flourish.
2. **Glyphs & link:** reuse/extend existing LM + brain glyphs; sentence-into-glyph flow;
   the similar-not-identical pattern generator.
3. **Concept funnel:** magnifier + semantics/syntax/pragmatics lines (beats 5–6).
4. **Syntax example:** parse-flows-from-model + the marked mistake (beat 7), reusing the
   dep-parse engine.
5. **Causal erasure:** scissors → arcs fade → pattern degrades (beat 9).
6. **Resolve to bio + polish:** transitions, mobile pass, timing, copy.

Each phase: keep the reduced-motion/no-JS fallback working, and run `npm test`
(`tests/test_lib.mjs` + `tests/test_site.py`) after changes.

---

## 8. Pointers

- Current implementation to evolve: `index.html` (`<figure class="research-arc">` +
  the `.research-arc` IIFE) and the `.research-arc` / `.depparse` / `.dep-*` styles in
  `assets/css/style.css`.
- Dep-parse engine details: `docs/developer-guide.md` → "Animated research arc".
- Render-verify with puppeteer (already a dependency); pattern in
  `examples/render_themes.js`. Screenshot light/dark/mobile/reduced for every phase.
