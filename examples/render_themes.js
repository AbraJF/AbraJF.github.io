// Render each candidate theme over the live local site and screenshot it.
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const themes = ['editorial-sage', 'editorial-sage-light'];

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1100, height: 900, deviceScaleFactor: 1 });

  for (const t of themes) {
    const css = fs.readFileSync(path.join(__dirname, `theme-${t}.css`), 'utf8');
    await page.goto('http://localhost:8000/', { waitUntil: 'networkidle0' });
    // Drop the site's own stylesheet, inject the candidate theme.
    await page.evaluate(() => {
      document.querySelectorAll('link[rel="stylesheet"]').forEach((l) => l.remove());
    });
    await page.addStyleTag({ content: css });
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
    await page.screenshot({ path: path.join(__dirname, `preview-${t}.png`), fullPage: true });
    console.log(`rendered ${t}`);
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
