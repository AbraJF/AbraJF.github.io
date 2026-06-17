// Google Scholar import — best-effort. Scholar has no public API and actively
// rate-limits / CAPTCHAs automated requests, so fetchScholarProfile is a
// convenience that may fail; parseScholarProfile is a pure function over HTML
// and is fully tested. When fetch fails, fall back to manual add_publication.
'use strict';

const https = require('https');

/** Strip HTML tags and decode the few entities Scholar emits. */
function stripTags(s) {
  return String(s || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/**
 * Parse a Google Scholar profile page's publication table.
 * Pure: takes the page HTML, returns structured publications.
 * @param {string} html
 * @returns {Array<{title:string, authors:string, venue:string, year:string, url:string}>}
 */
function parseScholarProfile(html) {
  const rows = String(html || '').split('gsc_a_tr').slice(1);
  const pubs = [];
  for (const row of rows) {
    // Title anchor — attribute order varies, so grab the whole <a> then pull pieces.
    const anchorM = row.match(/<a[^>]*class="gsc_a_at"[^>]*>([\s\S]*?)<\/a>/);
    if (!anchorM) continue;
    const hrefM = anchorM[0].match(/href="([^"]*)"/);
    const rawHref = hrefM ? hrefM[1] : '';
    const grays = [...row.matchAll(/class="gs_gray"[^>]*>([\s\S]*?)<\/div>/g)].map((m) =>
      stripTags(m[1])
    );
    const yearM = row.match(/class="gsc_a_h[^"]*"[^>]*>(\d{4})</);
    const href = !rawHref || rawHref.startsWith('http')
      ? rawHref
      : `https://scholar.google.com${rawHref.replace(/&amp;/g, '&')}`;
    pubs.push({
      title: stripTags(anchorM[1]),
      authors: grays[0] || '',
      venue: grays[1] || '',
      year: yearM ? yearM[1] : '',
      url: href,
    });
  }
  return pubs;
}

/**
 * Fetch a Scholar profile page (best-effort). Resolves to raw HTML.
 * @param {string} userId Scholar user id (the `user=` query param)
 * @returns {Promise<string>}
 */
function fetchScholarProfile(userId) {
  const path = `/citations?user=${encodeURIComponent(userId)}&hl=en&cstart=0&pagesize=100`;
  const options = {
    hostname: 'scholar.google.com',
    path,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  };
  return new Promise((resolve, reject) => {
    https
      .get(options, (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`Scholar returned HTTP ${res.statusCode} (likely rate-limited)`));
        }
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (c) => (body += c));
        res.on('end', () => resolve(body));
      })
      .on('error', reject);
  });
}

module.exports = { parseScholarProfile, fetchScholarProfile, stripTags };
