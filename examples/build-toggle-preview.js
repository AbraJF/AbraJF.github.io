// Generate examples/preview-toggle.html from index.html:
//  - swap the live stylesheet for a switchable editorial-sage theme link
//  - rewrite assets/ -> ../assets/ (preview lives one dir down)
//  - inject a fixed Light/Dark toggle button + script (persists in localStorage)
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

// switchable theme link (default light)
html = html.replace(
  '<link rel="stylesheet" href="assets/css/style.css" />',
  '<link id="theme" rel="stylesheet" href="theme-editorial-sage-light.css" />'
);
// fix relative asset paths for the examples/ subdir
html = html.replace(/(src|href)="assets\//g, '$1="../assets/');

const widget = `
<div style="position:fixed;top:14px;right:14px;z-index:1000;display:flex;gap:.5rem;align-items:center;font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:.8rem;font-weight:600">
  <select id="sep-select" aria-label="Section divider" style="padding:.5rem .7rem;border-radius:999px;border:1px solid currentColor;background:rgba(127,127,127,.15);color:inherit;cursor:pointer;font:inherit;font-weight:600;backdrop-filter:blur(6px)">
    <option value="none">Divider: plain line</option>
    <option value="a">A — gradient fade</option>
    <option value="b">B — fleuron</option>
    <option value="c">C — diamond on rule</option>
    <option value="d">D — asterism</option>
    <option value="e">E — accent bar</option>
  </select>
  <button id="theme-toggle" aria-label="Toggle light/dark" style="padding:.5rem .9rem;border-radius:999px;border:1px solid currentColor;background:rgba(127,127,127,.15);color:inherit;cursor:pointer;font:inherit;font-weight:600;backdrop-filter:blur(6px)">◐ Theme</button>
</div>
<style id="sep-style"></style>
<script>
(function(){
  var link=document.getElementById('theme'),btn=document.getElementById('theme-toggle');
  var base='theme-editorial-sage-',mode=localStorage.getItem('previewTheme')||'light';
  function apply(m){link.href=base+m+'.css?t='+Date.now();btn.textContent=(m==='dark'?'◑ Dark':'◐ Light');localStorage.setItem('previewTheme',m);}
  apply(mode);
  btn.addEventListener('click',function(){apply(link.href.indexOf('dark')>-1?'light':'dark');});

  // End-of-section divider candidates. Only the LAST section is excluded (footer follows).
  var SEP={
    none:'',
    a:'.section{border-bottom:none}.section:not(:last-of-type)::after{content:"";display:block;height:1px;margin:2.6rem auto 0;background:linear-gradient(90deg,transparent,var(--border) 18%,var(--border) 82%,transparent)}',
    b:'.section{border-bottom:none}.section:not(:last-of-type)::after{content:"\\\\276E\\\\276F";display:block;text-align:center;margin-top:2.4rem;color:var(--amber);font-size:1.1rem;letter-spacing:.4rem}',
    c:'.section{border-bottom:none;padding-bottom:4.5rem}.section:not(:last-of-type){position:relative}.section:not(:last-of-type)::after{content:"";position:absolute;left:0;right:0;bottom:2rem;height:1px;background:linear-gradient(90deg,transparent,var(--border) 20%,var(--border) 80%,transparent)}.section:not(:last-of-type)::before{content:"\\\\25C6";position:absolute;left:50%;bottom:1.35rem;transform:translateX(-50%);background:var(--bg);padding:0 .7rem;color:var(--amber);font-size:.72rem;z-index:1}',
    d:'.section{border-bottom:none}.section:not(:last-of-type)::after{content:"\\\\2042";display:block;text-align:center;margin-top:2rem;color:var(--brown);font-size:1.4rem;line-height:1}',
    e:'.section{border-bottom:none}.section:not(:last-of-type)::after{content:"";display:block;width:54px;height:4px;border-radius:2px;margin:2.6rem auto 0;background:linear-gradient(90deg,var(--amber),var(--orange))}'
  };
  var sel=document.getElementById('sep-select'),sty=document.getElementById('sep-style');
  var cur=localStorage.getItem('previewSep')||'none';
  function applySep(v){sty.textContent=SEP[v]||'';sel.value=v;localStorage.setItem('previewSep',v);}
  applySep(cur);
  sel.addEventListener('change',function(){applySep(sel.value);});
})();
</script>
`;
html = html.replace('</body>', widget + '</body>');

const out = path.join(__dirname, 'preview-toggle.html');
fs.writeFileSync(out, html);
console.log('wrote ' + out);
