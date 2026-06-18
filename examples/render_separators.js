// Render candidate end-of-section dividers over a small News→Publications mock,
// using the light editorial-sage theme. One screenshot per option for comparison.
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const theme = fs.readFileSync(path.join(__dirname, 'theme-editorial-sage-light.css'), 'utf8');

// Each option: CSS that restyles the END-of-section divider only.
// Inter-item .news rows keep the plain hairline (set in the theme) for contrast.
const options = {
  'a-gradient-fade': `
    .section{border-bottom:none}
    .section:not(:last-child)::after{content:"";display:block;height:1px;margin:2.6rem auto 0;
      background:linear-gradient(90deg,transparent,var(--border) 18%,var(--border) 82%,transparent)}`,
  'b-fleuron': `
    .section{border-bottom:none}
    .section:not(:last-child)::after{content:"\\276E\\276F";display:block;text-align:center;margin-top:2.4rem;
      color:var(--amber);font-size:1.1rem;letter-spacing:.4rem}`,
  'c-diamond-rules': `
    .section{border-bottom:none;padding-bottom:4.5rem}
    .section:not(:last-child){position:relative}
    .section:not(:last-child)::after{content:"";position:absolute;left:0;right:0;bottom:2rem;height:1px;
      background:linear-gradient(90deg,transparent,var(--border) 20%,var(--border) 80%,transparent)}
    .section:not(:last-child)::before{content:"\\25C6";position:absolute;left:50%;bottom:1.35rem;transform:translateX(-50%);
      background:var(--bg);padding:0 .7rem;color:var(--amber);font-size:.72rem;z-index:1}`,
  'd-asterism': `
    .section{border-bottom:none}
    .section:not(:last-child)::after{content:"\\2042";display:block;text-align:center;margin-top:2rem;
      color:var(--brown);font-size:1.4rem;line-height:1}`,
  'e-accent-bar': `
    .section{border-bottom:none}
    .section:not(:last-child)::after{content:"";display:block;width:54px;height:4px;border-radius:2px;
      margin:2.6rem auto 0;background:linear-gradient(90deg,var(--amber),var(--orange))}`,
};

const html = `<!doctype html><html><head><meta charset="utf-8"><style>__THEME__</style></head><body>
<main>
  <section class="section">
    <h2>News</h2>
    <ul class="news-list">
      <li class="news"><span class="news-date">2025</span><span><span class="tag tag-paper">Paper</span></span>
        <span class="news-text">New paper out in the Proceedings of the Cognitive Science Society.</span></li>
      <li class="news"><span class="news-date">2024</span><span><span class="tag tag-conference">Conference</span></span>
        <span class="news-text">Presented work at CogSci 2024.</span></li>
      <li class="news"><span class="news-date">2024</span><span><span class="tag tag-news">News</span></span>
        <span class="news-text">Started my PhD at the Language and Predictive Computation Group.</span></li>
    </ul>
  </section>
  <section class="section">
    <h2>Publications</h2>
    <p>End-of-section divider sits between News and Publications above.</p>
  </section>
</main>
</body></html>`;

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 820, height: 620, deviceScaleFactor: 2 });
  for (const [name, css] of Object.entries(options)) {
    await page.setContent(html.replace('__THEME__', theme + css), { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: path.join(__dirname, `sep-${name}.png`), fullPage: true });
    console.log(`rendered sep-${name}`);
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
