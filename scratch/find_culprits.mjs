import { spawn } from 'child_process';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9255;
const BASE_URL = 'http://localhost:3000';

const VIEWPORTS = [
  { name: '320px', width: 320, height: 800 },
  { name: '360px', width: 360, height: 800 },
  { name: '375px', width: 375, height: 812 },
  { name: '390px', width: 390, height: 844 },
  { name: '414px', width: 414, height: 896 },
  { name: '430px', width: 430, height: 932 },
  { name: '768px', width: 768, height: 1024 },
  { name: '820px', width: 820, height: 1180 },
  { name: '834px', width: 834, height: 1112 },
  { name: '912px', width: 912, height: 1368 },
  { name: '1024px', width: 1024, height: 768 },
];

const ROUTES = ['/', '/about', '/services', '/work', '/contact'];

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const edge = spawn(EDGE_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    'about:blank'
  ], { stdio: 'ignore' });

  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) break;
    } catch {
      await sleep(200);
    }
  }

  const tabRes = await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(BASE_URL)}`, { method: 'PUT' });
  const tab = await tabRes.json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);

  let id = 1;
  const pending = new Map();
  function send(m, p = {}) {
    return new Promise((res, rej) => {
      const i = id++;
      pending.set(i, { res, rej });
      ws.send(JSON.stringify({ id: i, method: m, params: p }));
    });
  }
  await new Promise(r => ws.onopen = r);
  ws.onmessage = (e) => {
    const d = JSON.parse(e.data);
    if (d.id && pending.has(d.id)) {
      const { res, rej } = pending.get(d.id);
      pending.delete(d.id);
      if (d.error) rej(d.error);
      else res(d.result);
    }
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  console.log('--- SCANNING ALL ROUTES AND VIEWPORTS FOR OVERFLOW CULPRITS ---');

  for (const route of ROUTES) {
    console.log(`\n=================== ROUTE: ${route} ===================`);
    await send('Page.navigate', { url: `${BASE_URL}${route}` });
    await sleep(2000);

    for (const vp of VIEWPORTS) {
      await send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 2,
        mobile: vp.width < 1024
      });
      await sleep(300);

      const check = await send('Runtime.evaluate', {
        expression: `(() => {
          const docEl = document.documentElement;
          const body = document.body;
          const winW = window.innerWidth;
          const docScrollW = docEl.scrollWidth;
          const bodyScrollW = body.scrollWidth;
          const maxScrollW = Math.max(docScrollW, bodyScrollW);
          const hasOverflow = maxScrollW > winW + 1;

          let culprits = [];
          if (hasOverflow) {
            const all = document.querySelectorAll('*');
            for (const el of all) {
              const r = el.getBoundingClientRect();
              const style = window.getComputedStyle(el);
              // Check if element extends beyond right edge
              if (r.right > winW + 1) {
                culprits.push({
                  tag: el.tagName.toLowerCase(),
                  id: el.id || undefined,
                  className: el.className ? (typeof el.className === 'string' ? el.className.slice(0, 60) : '') : undefined,
                  right: Math.round(r.right),
                  width: Math.round(r.width),
                  winW: winW,
                  diff: Math.round(r.right - winW),
                  computedWidth: style.width,
                  minWidth: style.minWidth,
                  maxWidth: style.maxWidth,
                  transform: style.transform !== 'none' ? style.transform : undefined,
                  position: style.position
                });
              }
            }
          }

          return {
            winW,
            docScrollW,
            bodyScrollW,
            hasOverflow,
            diff: maxScrollW - winW,
            culpritCount: culprits.length,
            // Top 10 worst offenders
            worstCulprits: culprits.sort((a,b) => b.right - a.right).slice(0, 10)
          };
        })()`,
        returnByValue: true
      });

      const res = check.result.value;
      if (res.hasOverflow) {
        console.log(`❌ [${vp.name}] OVERFLOW: +${res.diff}px (doc: ${res.docScrollW}px, body: ${res.bodyScrollW}px, win: ${res.winW}px)`);
        console.log(`   Offenders (${res.culpritCount} elements):`, JSON.stringify(res.worstCulprits.slice(0, 4), null, 2));
      } else {
        console.log(`✅ [${vp.name}] OK (scrollWidth: ${res.docScrollW}px, win: ${res.winW}px)`);
      }
    }
  }

  ws.close();
  edge.kill();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
