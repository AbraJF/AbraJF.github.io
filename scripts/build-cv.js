#!/usr/bin/env node
// Build assets/files/cv.pdf from data/cv.json.
//   node scripts/build-cv.js
// Single source of truth = data/cv.json. Edit it (by hand or via the MCP
// server), then run this script to regenerate the PDF. Layout lives in lib/cv.js.
'use strict';

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { renderCvHtml } = require('../lib/cv');

const ROOT = path.resolve(__dirname, '..');
const CV_JSON = path.join(ROOT, 'data', 'cv.json');
const OUT_PDF = path.join(ROOT, 'assets', 'files', 'cv.pdf');

async function buildCv() {
  const cv = JSON.parse(fs.readFileSync(CV_JSON, 'utf8'));
  const html = renderCvHtml(cv);

  const browser = await puppeteer.launch({ headless: 'new' });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: OUT_PDF,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
    });
  } finally {
    await browser.close();
  }
  return OUT_PDF;
}

if (require.main === module) {
  buildCv()
    .then((out) => console.log(`built ${path.relative(ROOT, out)}`))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

module.exports = { buildCv };
