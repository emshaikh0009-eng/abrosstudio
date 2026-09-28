import { spawn } from 'child_process';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9256;
const BASE_URL = 'http://localhost:3000';

async function main() {
  const edge = spawn(EDGE_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    'about:blank'
  ], { stdio: 'ignore' });

  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) break;
    } catch {
      await new Promise(r => setTimeout(r, 200));
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

  // Let's set device metrics WITHOUT mobile zoom first to see what elements overflow 390px
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: false // test with mobile: false so viewport stays exactly 390px
  });

  await send('Page.navigate', { url: BASE_URL });
  await new Promise(r => setTimeout(r, 2000));

  const check = await send('Runtime.evaluate', {
    expression: `(() => {
      const winW = window.innerWidth;
      const docW = document.documentElement.scrollWidth;
      const bodyW = document.body.scrollWidth;
      
      const elements = Array.from(document.querySelectorAll('*'));
      const culprits = [];

      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        if (rect.right > 390.5 || rect.width > 390.5 || el.scrollWidth > 390.5) {
          culprits.push({
            tag: el.tagName.toLowerCase(),
            id: el.id || '',
            className: typeof el.className === 'string' ? el.className.slice(0, 50) : '',
            right: Math.round(rect.right),
            left: Math.round(rect.left),
            width: Math.round(rect.width),
            scrollWidth: el.scrollWidth,
            cssWidth: style.width,
            minWidth: style.minWidth,
            maxWidth: style.maxWidth,
            padding: style.padding,
            margin: style.margin,
            boxSizing: style.boxSizing,
            text: el.children.length === 0 ? el.textContent.trim().slice(0, 30) : ''
          });
        }
      }

      // Sort by right edge descending
      culprits.sort((a, b) => b.right - a.right);

      return {
        winW,
        docW,
        bodyW,
        culpritCount: culprits.length,
        topCulprits: culprits.slice(0, 25)
      };
    })()`,
    returnByValue: true
  });

  console.log('Result for 390px (mobile:false):', JSON.stringify(check.result.value, null, 2));

  // Now also check 320px
  await send('Emulation.setDeviceMetricsOverride', {
    width: 320,
    height: 800,
    deviceScaleFactor: 2,
    mobile: false
  });
  await new Promise(r => setTimeout(r, 1000));

  const check320 = await send('Runtime.evaluate', {
    expression: `(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const culprits = [];

      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        if (rect.right > 320.5 || rect.width > 320.5 || el.scrollWidth > 320.5) {
          culprits.push({
            tag: el.tagName.toLowerCase(),
            id: el.id || '',
            className: typeof el.className === 'string' ? el.className.slice(0, 50) : '',
            right: Math.round(rect.right),
            left: Math.round(rect.left),
            width: Math.round(rect.width),
            scrollWidth: el.scrollWidth,
            minWidth: style.minWidth,
            maxWidth: style.maxWidth,
            text: el.children.length === 0 ? el.textContent.trim().slice(0, 30) : ''
          });
        }
      }

      culprits.sort((a, b) => b.right - a.right);

      return {
        culpritCount: culprits.length,
        topCulprits: culprits.slice(0, 20)
      };
    })()`,
    returnByValue: true
  });

  console.log('Result for 320px (mobile:false):', JSON.stringify(check320.result.value, null, 2));

  ws.close();
  edge.kill();
}

main().catch(console.error);
