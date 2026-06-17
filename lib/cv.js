// CV rendering — pure functions, no I/O. Turns a cv.json object into a
// self-contained, print-ready HTML string. build-cv.js feeds the result to
// puppeteer; tests exercise these functions directly.
'use strict';

/** Escape text for safe interpolation into HTML. */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** One Education/Experience entry. */
function renderItem(item) {
  const where = item.where
    ? `<span class="cv-where">${esc(item.where)}</span>`
    : '';
  return `      <div class="cv-item">
        <div class="cv-when">${esc(item.when)}</div>
        <div class="cv-what"><span class="cv-role">${esc(item.what)}</span>${where}</div>
      </div>`;
}

/** A titled section (Education, Experience, …). */
function renderSection(section) {
  const items = (section.items || []).map(renderItem).join('\n');
  return `    <section class="cv-section">
      <h2>${esc(section.title)}</h2>
${items}
    </section>`;
}

/** One publication line. */
function renderPublication(pub) {
  const year = pub.year ? ` (${esc(pub.year)})` : '';
  const venue = pub.venue ? ` <span class="cv-venue">${esc(pub.venue)}${year}</span>` : year;
  const link = pub.url
    ? ` <a class="cv-pdf" href="${esc(pub.url)}">[PDF]</a>`
    : '';
  return `      <div class="cv-pub">
        <span class="cv-authors">${esc(pub.authors)}</span>
        <span class="cv-pub-title">${esc(pub.title)}.</span>${venue}${link}
      </div>`;
}

/** Print stylesheet — A4, serif, single accent. Kept inline so the PDF is self-contained. */
const PRINT_CSS = `
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
    color: #15291c; line-height: 1.5; margin: 0; font-size: 10.5pt;
  }
  .cv-head { border-bottom: 2px solid #1f4a2c; padding-bottom: 8px; margin-bottom: 14px; }
  .cv-name { font-size: 22pt; color: #1f4a2c; margin: 0; letter-spacing: -.01em; }
  .cv-title { font-size: 11pt; color: #7a430f; margin: 2px 0 0; font-style: italic; }
  .cv-tagline { font-size: 9.5pt; color: #3f5746; margin: 6px 0 0; }
  .cv-contact { font-size: 9pt; color: #3f5746; margin: 6px 0 0; }
  .cv-contact a { color: #7a430f; text-decoration: none; }
  .cv-interests { font-size: 9pt; color: #3f5746; margin: 6px 0 0; }
  h2 {
    font-family: -apple-system, "Segoe UI", Roboto, sans-serif;
    font-size: 10pt; text-transform: uppercase; letter-spacing: .12em;
    color: #7a430f; border-bottom: 1px solid #bcd6c6;
    padding-bottom: 3px; margin: 16px 0 8px;
  }
  .cv-item { display: grid; grid-template-columns: 90px 1fr; gap: 10px; margin: 0 0 7px; }
  .cv-when { color: #3f5746; font-style: italic; font-size: 9.5pt; }
  .cv-role { display: block; }
  .cv-where { display: block; color: #3f5746; font-size: 9.5pt; }
  .cv-pub { margin: 0 0 7px; }
  .cv-authors { display: block; font-size: 9.5pt; }
  .cv-pub-title { font-weight: 700; }
  .cv-venue { font-style: italic; color: #3f5746; }
  .cv-pdf { color: #7a430f; text-decoration: none; font-size: 9pt; }
`;

/**
 * Render a full CV HTML document from a cv.json object.
 * @param {object} cv parsed cv.json
 * @returns {string} complete HTML document
 */
function renderCvHtml(cv) {
  const contact = cv.contact || {};
  const links = (contact.links || [])
    .map((l) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`)
    .join(' · ');
  const contactBits = [
    contact.email ? `<a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a>` : '',
    contact.location ? esc(contact.location) : '',
    links,
  ].filter(Boolean).join(' · ');

  const interests = (cv.interests && cv.interests.length)
    ? `<p class="cv-interests"><strong>Research interests:</strong> ${cv.interests.map(esc).join(' · ')}</p>`
    : '';

  const sections = (cv.sections || []).map(renderSection).join('\n');

  const pubs = (cv.publications && cv.publications.length)
    ? `    <section class="cv-section">
      <h2>Publications</h2>
${cv.publications.map(renderPublication).join('\n')}
    </section>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${esc(cv.name)} — CV</title>
<style>${PRINT_CSS}</style>
</head>
<body>
  <header class="cv-head">
    <h1 class="cv-name">${esc(cv.name)}</h1>
    <p class="cv-title">${esc(cv.title)}</p>
    ${cv.tagline ? `<p class="cv-tagline">${esc(cv.tagline)}</p>` : ''}
    <p class="cv-contact">${contactBits}</p>
    ${interests}
  </header>
${sections}
${pubs}
</body>
</html>`;
}

module.exports = { renderCvHtml, renderSection, renderItem, renderPublication, esc };
