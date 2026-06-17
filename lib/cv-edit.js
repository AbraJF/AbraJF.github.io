// Pure transforms on a parsed cv.json object. No I/O — callers read/write the
// file. Every function returns a NEW object (never mutates its input) so they
// are trivial to test and reason about.
'use strict';

/** Deep-ish clone sufficient for cv.json (plain JSON, no functions/dates). */
function clone(cv) {
  return JSON.parse(JSON.stringify(cv));
}

/** Normalise a title for comparison: strip diacritics/punctuation, lowercase, collapse space. */
function normTitle(s) {
  return String(s || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Extract a stable identity key from a publication URL: Scholar citation id or DOI. */
function urlKey(url) {
  const u = String(url || '');
  const scholar = u.match(/citation_for_view=([^&]+)/);
  if (scholar) return 'scholar:' + decodeURIComponent(scholar[1]);
  const doi = u.match(/10\.\d{4,9}\/[^\s&?#]+/);
  if (doi) return 'doi:' + doi[0].toLowerCase();
  return '';
}

/** Token-set Jaccard similarity of two normalised titles (0..1). */
function titleSimilarity(a, b) {
  const ta = new Set(normTitle(a).split(' ').filter(Boolean));
  const tb = new Set(normTitle(b).split(' ').filter(Boolean));
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / (ta.size + tb.size - inter);
}

/**
 * Decide whether two publications are the same work. Hardened against title
 * drift (e.g. preprint vs published wording):
 *   1. same stable URL key (Scholar citation id / DOI) → same,
 *   2. identical normalised titles → same,
 *   3. high token-overlap (Jaccard ≥ 0.85) → same.
 * Divergent retitles below the threshold are intentionally NOT merged.
 */
function isSamePublication(a, b) {
  const ka = urlKey(a.url);
  const kb = urlKey(b.url);
  if (ka && kb && ka === kb) return true;
  if (normTitle(a.title) && normTitle(a.title) === normTitle(b.title)) return true;
  return titleSimilarity(a.title, b.title) >= 0.85;
}

/**
 * Add an entry to a CV section (Education, Experience, …), newest first.
 * Creates the section if it does not yet exist.
 * @param {object} cv parsed cv.json
 * @param {string} sectionTitle e.g. "Experience"
 * @param {{when:string, what:string, where?:string}} item
 * @returns {object} new cv
 */
function addCvItem(cv, sectionTitle, item) {
  if (!item || !item.when || !item.what) {
    throw new Error('cv item requires "when" and "what"');
  }
  const next = clone(cv);
  next.sections = next.sections || [];
  let section = next.sections.find(
    (s) => s.title.toLowerCase() === String(sectionTitle).toLowerCase()
  );
  if (!section) {
    section = { title: sectionTitle, items: [] };
    next.sections.push(section);
  }
  section.items = section.items || [];
  section.items.unshift({ when: item.when, what: item.what, where: item.where || '' });
  return next;
}

/**
 * Add a publication to cv.json, newest first. De-duplicates on title.
 * @param {object} cv parsed cv.json
 * @param {{title:string, authors:string, venue?:string, year?:string, url?:string}} pub
 * @returns {object} new cv
 */
function addCvPublication(cv, pub) {
  if (!pub || !pub.title || !pub.authors) {
    throw new Error('publication requires "title" and "authors"');
  }
  const next = clone(cv);
  next.publications = next.publications || [];
  const exists = next.publications.some((p) => isSamePublication(p, pub));
  if (!exists) {
    next.publications.unshift({
      title: pub.title,
      authors: pub.authors,
      venue: pub.venue || '',
      year: pub.year || '',
      url: pub.url || '',
    });
  }
  return next;
}

module.exports = { addCvItem, addCvPublication, isSamePublication, normTitle, urlKey, titleSimilarity };
