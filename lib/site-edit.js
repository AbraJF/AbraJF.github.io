// Pure string transforms on the index.html source. Each function takes the
// current HTML and an entry, and returns new HTML with the entry inserted
// newest-first. No file I/O — callers handle reading/writing. This keeps the
// "no build step" static site intact: we edit the real HTML in place.
'use strict';

const NEWS_ANCHOR = '<ul class="news-list">';
const PUB_ANCHOR = '<ul class="pub-list">';

// Known news tag types → CSS class is always `tag-<type>` (see style.css /
// theme files). Default human label is the capitalised type.
const KNOWN_TAGS = ['news', 'conference', 'paper', 'preprint', 'talk', 'award', 'part', 'full'];

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Insert `block` immediately after the line containing `anchor`, preserving indent. */
function insertAfterAnchor(html, anchor, block) {
  const idx = html.indexOf(anchor);
  if (idx === -1) throw new Error(`anchor not found: ${anchor}`);
  const lineEnd = html.indexOf('\n', idx);
  const at = lineEnd === -1 ? html.length : lineEnd + 1;
  return html.slice(0, at) + block + '\n' + html.slice(at);
}

/**
 * Add a news entry to the top of the news list.
 * @param {string} html index.html source
 * @param {{date:string|number, type?:string, label?:string, text:string}} entry
 *   `text` may contain inline HTML (e.g. links) — it is NOT escaped.
 * @returns {string} new HTML
 */
function insertNews(html, entry) {
  if (!entry || !entry.date || !entry.text) {
    throw new Error('news entry requires "date" and "text"');
  }
  const type = (entry.type || 'news').toLowerCase();
  if (!KNOWN_TAGS.includes(type)) {
    throw new Error(`unknown news type "${type}" (known: ${KNOWN_TAGS.join(', ')})`);
  }
  const label = entry.label || (type.charAt(0).toUpperCase() + type.slice(1));
  const block = `        <li class="news">
          <span class="news-date">${esc(entry.date)}</span>
          <span class="tag tag-${esc(type)}">${esc(label)}</span>
          <span class="news-text">${entry.text}</span>
        </li>`;
  return insertAfterAnchor(html, NEWS_ANCHOR, block);
}

/**
 * Add a publication to the top of the publications list.
 * @param {string} html index.html source
 * @param {{title:string, authors:string, venue?:string, links?:Array<{label:string,href:string}>}} pub
 * @returns {string} new HTML
 */
function insertPublication(html, pub) {
  if (!pub || !pub.title || !pub.authors) {
    throw new Error('publication requires "title" and "authors"');
  }
  const venue = pub.venue
    ? `\n          <span class="pub-venue">${esc(pub.venue)}</span>`
    : '';
  const links = (pub.links || [])
    .map((l) => `            <a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)}</a>`)
    .join('\n');
  const linksBlock = links
    ? `\n          <span class="pub-links">\n${links}\n          </span>`
    : '';
  const block = `        <li class="pub">
          <span class="pub-title">${esc(pub.title)}</span>
          <span class="pub-authors">${esc(pub.authors)}</span>${venue}${linksBlock}
        </li>`;
  return insertAfterAnchor(html, PUB_ANCHOR, block);
}

module.exports = { insertNews, insertPublication, esc, KNOWN_TAGS };
