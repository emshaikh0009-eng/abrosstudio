import { spawn } from 'child_process';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9275;
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
    '--disable-extensions',
    '--window-size=1440,900',
    'about:blank'
  ], { stdio: 'ignore' });

  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) break;
    } catch {
      await sleep(250);
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

  console.log('=== REAL VIEWPORT OVERFLOW AUDIT (Comparing ScrollWidth to Target Width) ===\n');

  let totalTests = 0;
  let passedTests = 0;

  for (const route of ROUTES) {
    console.log(`\nRoute: ${route}`);
    await send('Page.navigate', { url: `${BASE_URL}${route}` });
    await sleep(2000);

    for (const vp of VIEWPORTS) {
      totalTests++;
      await send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 2,
        mobile: vp.width < 1024
      });
      await sleep(300);

      const res = await send('Runtime.evaluate', {
        expression: `(() => {
          const targetW = ${vp.width};
          const docW = document.documentElement.scrollWidth;
          const bodyW = document.body.scrollWidth;
          const maxW = Math.max(docW, bodyW);
          const hasOverflow = maxW > targetW + 0.5;
          const diff = maxW - targetW;

          let culprits = [];
          if (hasOverflow) {
            const all = Array.from(document.querySelectorAll('*'));
            for (const el of all) {
              const r = el.getBoundingClientRect();
              if (r.right > targetW + 0.5) {
                culprits.push({
                  tag: el.tagName.toLowerCase(),
                  className: typeof el.className === 'string' ? el.className.slice(0, 40) : '',
                  right: Math.round(r.right),
                  width: Math.round(r.width),
                  diff: Math.round(r.right - targetW)
                });
              }
            }
          }

          return {
            targetW,
            maxW,
            hasOverflow,
            diff,
            culpritCount: culprits.length,
            topCulprits: culprits.sort((a,b) => b.right - a.right).slice(0, 5)
          };
        })()`,
        returnByValue: true
      });

      const data = res.result.value;
      if (data.hasOverflow) {
        console.log(`  ❌ [${vp.name}] OVERFLOW: scrollWidth is ${data.maxW}px (exceeds ${data.targetW}px by +${data.diff}px)`);
        console.log(`     Top offenders:`, data.topCulprits.map(c => `${c.tag}.${c.className} (right: ${c.right}px, +${c.diff}px)`).join(', '));
      } else {
        passedTests++;
        console.log(`  ✅ [${vp.name}] PASS (${data.maxW}px <= ${data.targetW}px)`);
      }
    }
  }

  console.log(`\n================ FINAL AUDIT SCORE ================`);
  console.log(`Total: ${totalTests} | Passed: ${passedTests} | Failed: ${totalTests - passedTests}`);

  ws.close();
  edge.kill();
}

main().catch(console.error);
