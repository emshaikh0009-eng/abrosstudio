import { spawn } from 'child_process';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9299;
const BASE_URL = 'http://localhost:3000';

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
    '--window-size=390,844',
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

  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (d.id && pending.has(d.id)) {
        const { res, rej } = pending.get(d.id);
        pending.delete(d.id);
        if (d.error) rej(d.error);
        else res(d.result);
      }
    };
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });

  await send('Page.navigate', { url: BASE_URL });
  await sleep(1000);

  const initialElements = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const els = Array.from(document.querySelectorAll('.fade-in-up, .fade-in-scale'));
        return els.map((el, i) => {
          const s = window.getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return {
            i,
            tag: el.tagName,
            cls: el.className,
            attr: el.getAttribute('data-scroll-reveal'),
            opacity: s.opacity,
            display: s.display,
            top: Math.round(r.top),
            bottom: Math.round(r.bottom),
            text: el.innerText.slice(0, 30).replace(/\\n/g, ' ')
          };
        });
      })()
    `,
    returnByValue: true
  });

  console.log('--- INITIAL STATE (at top of page) ---');
  console.table(initialElements.result.value);

  // Now scroll to 1000px
  console.log('\n--- SCROLLING TO 1200px ---');
  await send('Runtime.evaluate', {
    expression: `
      window.scrollTo({ top: 1200, behavior: 'instant' });
    `
  });
  await sleep(400);

  const scrolledElements = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const els = Array.from(document.querySelectorAll('.fade-in-up, .fade-in-scale'));
        return els.map((el, i) => {
          const s = window.getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return {
            i,
            tag: el.tagName,
            cls: el.className,
            attr: el.getAttribute('data-scroll-reveal'),
            opacity: s.opacity,
            display: s.display,
            top: Math.round(r.top),
            bottom: Math.round(r.bottom),
            text: el.innerText.slice(0, 30).replace(/\\n/g, ' ')
          };
        });
      })()
    `,
    returnByValue: true
  });
  console.table(scrolledElements.result.value);

  ws.close();
  edge.kill();
}

main().catch(console.error);
