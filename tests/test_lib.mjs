// Unit tests for the content-automation libraries. Run: node --test tests/
// Pure functions only — no puppeteer, no network, no MCP transport.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { renderCvHtml, esc } = require('../lib/cv.js');
const { addCvItem, addCvPublication, isSamePublication } = require('../lib/cv-edit.js');
const { insertNews, insertPublication } = require('../lib/site-edit.js');
const { parseScholarProfile, stripTags } = require('../lib/scholar.js');

// ---------- lib/cv.js ----------
test('esc escapes HTML metacharacters', () => {
  assert.equal(esc('a & b <c> "d"'), 'a &amp; b &lt;c&gt; &quot;d&quot;');
});

test('renderCvHtml includes name, sections, and publications', () => {
  const cv = {
    name: 'Test Person',
    title: 'Researcher',
    contact: { email: 'a@b.com', links: [{ label: 'GH', href: 'https://x' }] },
    interests: ['NeuroAI'],
    sections: [{ title: 'Education', items: [{ when: '2020', what: 'MSc', where: 'Uni' }] }],
    publications: [{ title: 'A paper', authors: 'Person, T.', venue: 'Venue', year: '2024', url: 'u' }],
  };
  const html = renderCvHtml(cv);
  assert.match(html, /Test Person/);
  assert.match(html, /Education/);
  assert.match(html, /A paper/);
  assert.match(html, /mailto:a@b\.com/);
  assert.match(html, /<!DOCTYPE html>/);
});

// ---------- lib/cv-edit.js ----------
test('addCvItem prepends to an existing section without mutating input', () => {
  const cv = { sections: [{ title: 'Experience', items: [{ when: '2020', what: 'old' }] }] };
  const next = addCvItem(cv, 'Experience', { when: '2026', what: 'new' });
  assert.equal(next.sections[0].items[0].what, 'new');
  assert.equal(next.sections[0].items.length, 2);
  assert.equal(cv.sections[0].items.length, 1, 'input not mutated');
});

test('addCvItem creates a missing section', () => {
  const next = addCvItem({ sections: [] }, 'Awards', { when: '2026', what: 'Prize' });
  assert.equal(next.sections.at(-1).title, 'Awards');
});

test('addCvItem requires when and what', () => {
  assert.throws(() => addCvItem({ sections: [] }, 'X', { when: '2026' }));
});

test('addCvPublication dedupes on title (case + punctuation insensitive)', () => {
  const cv = { publications: [{ title: 'Paper One: A Study!', authors: 'A' }] };
  const next = addCvPublication(cv, { title: 'paper one  a study', authors: 'B' });
  assert.equal(next.publications.length, 1);
});

test('isSamePublication matches on Scholar citation id despite title drift', () => {
  const a = {
    title: 'LMs that represent syntactic structure align with brain',
    url: 'https://scholar.google.com/citations?view_op=view_citation&citation_for_view=ABC:xyz',
  };
  const b = {
    title: 'Completely different wording of the same paper',
    url: 'https://scholar.google.com/citations?...&citation_for_view=ABC:xyz&hl=en',
  };
  assert.ok(isSamePublication(a, b));
});

test('isSamePublication matches on DOI', () => {
  const a = { title: 'X', url: 'https://doi.org/10.1234/abcd.5678' };
  const b = { title: 'Y', url: 'https://publisher.com/article/10.1234/abcd.5678' };
  assert.ok(isSamePublication(a, b));
});

test('isSamePublication merges near-identical titles (high overlap)', () => {
  const a = { title: 'Language models represent syntactic structure in the brain' };
  const b = { title: 'Language models represent syntactic structure in brain' };
  assert.ok(isSamePublication(a, b));
});

test('isSamePublication keeps genuinely different papers separate', () => {
  const a = { title: 'Predictive coding in language models' };
  const b = { title: 'A survey of reinforcement learning for robotics' };
  assert.equal(isSamePublication(a, b), false);
});

test('addCvPublication keeps two divergent retitles of the same paper (documented limit)', () => {
  // Below the 0.85 threshold and no shared id/DOI → not auto-merged. This is why
  // Scholar is treated as ground truth rather than relying on fuzzy dedup.
  const cv = {
    publications: [
      { title: 'Language models that accurately represent syntactic information align better with brain activity', url: 'https://escholarship.org/x.pdf' },
    ],
  };
  const next = addCvPublication(cv, {
    title: 'Language models that accurately represent syntactic structure exhibit higher representational similarity to brain activity',
    authors: 'A',
    url: 'https://scholar.google.com/citations?...&citation_for_view=Q:z',
  });
  assert.equal(next.publications.length, 2);
});

// ---------- lib/site-edit.js ----------
const NEWS_HTML = '<ul class="news-list">\n  <li class="news">old</li>\n</ul>';
const PUB_HTML = '<ul class="pub-list">\n  <li class="pub">old</li>\n</ul>';

test('insertNews puts the new item before existing items', () => {
  const out = insertNews(NEWS_HTML, { date: '2026', type: 'award', label: 'Award', text: 'Won X' });
  assert.match(out, /tag-award/);
  assert.ok(out.indexOf('Won X') < out.indexOf('old'), 'newest first');
});

test('insertNews rejects unknown tag types', () => {
  assert.throws(() => insertNews(NEWS_HTML, { date: '2026', type: 'bogus', text: 't' }));
});

test('insertNews keeps inline HTML in text unescaped', () => {
  const out = insertNews(NEWS_HTML, { date: '2026', text: 'See <a href="#">link</a>' });
  assert.match(out, /<a href="#">link<\/a>/);
});

test('insertPublication renders title, authors, venue, and links', () => {
  const out = insertPublication(PUB_HTML, {
    title: 'My Title',
    authors: 'Me',
    venue: 'CogSci, 2024',
    links: [{ label: 'PDF', href: 'http://x/y' }],
  });
  assert.match(out, /My Title/);
  assert.match(out, /pub-venue">CogSci, 2024/);
  assert.match(out, /href="http:\/\/x\/y"/);
  assert.ok(out.indexOf('My Title') < out.indexOf('old'), 'newest first');
});

// ---------- lib/scholar.js ----------
test('stripTags removes markup and decodes entities', () => {
  assert.equal(stripTags('<b>A&amp;B</b>'), 'A&B');
});

test('parseScholarProfile extracts publications from profile HTML', () => {
  const html = `
  <tr class="gsc_a_tr">
    <td class="gsc_a_t">
      <a href="/citations?view_op=view_citation&hl=en&citation_for_view=ABC:1" class="gsc_a_at">A Great Paper</a>
      <div class="gs_gray">Fresen A, Heilbron M</div>
      <div class="gs_gray">Proceedings of CogSci<span class="gs_oph">, 2024</span></div>
    </td>
    <td class="gsc_a_y"><span class="gsc_a_h gsc_a_hc gs_ibl">2024</span></td>
  </tr>`;
  const pubs = parseScholarProfile(html);
  assert.equal(pubs.length, 1);
  assert.equal(pubs[0].title, 'A Great Paper');
  assert.match(pubs[0].authors, /Fresen A/);
  assert.equal(pubs[0].year, '2024');
  assert.match(pubs[0].url, /^https:\/\/scholar\.google\.com/);
});

test('parseScholarProfile returns [] on a non-profile / CAPTCHA page', () => {
  assert.deepEqual(parseScholarProfile('<html>please verify you are human</html>'), []);
});
