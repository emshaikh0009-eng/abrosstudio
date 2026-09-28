import { spawn } from 'child_process';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9273;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function inspectRoute(url) {
  const edge = spawn(EDGE_PATH, ['--headless=new', `--remote-debugging-port=${PORT}`, 'about:blank'], { stdio: 'ignore' });
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) break;
    } catch {
      await sleep(200);
    }
  }

  const tabs = await (await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' })).json();
  const ws = new WebSocket(tabs.webSocketDebuggerUrl);
  let id = 1;
  const pending = new Map();
  const send = (m, p = {}) => new Promise((res, rej) => {
    const i = id++;
    pending.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method: m, params: p }));
  });
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

  await send('Page.navigate', { url });
  await sleep(2000);

  await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 800, deviceScaleFactor: 2, mobile: true });
  await sleep(1000);

  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      const docW = document.documentElement.scrollWidth;
      const all = Array.from(document.querySelectorAll('*'));
      
      const elementsExceeding320 = all.filter(el => {
        const r = el.getBoundingClientRect();
        return r.right > 320.5;
      }).map(el => {
        const r = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return {
          tag: el.tagName.toLowerCase(),
          className: el.className ? (typeof el.className === 'string' ? el.className.slice(0, 40) : '') : '',
          id: el.id,
          right: Math.round(r.right),
          left: Math.round(r.left),
          width: Math.round(r.width),
          scrollW: el.scrollWidth,
          offsetW: el.offsetWidth,
          text: el.children.length === 0 ? el.textContent.trim().slice(0, 30) : '',
          styleWidth: style.width,
          styleMinWidth: style.minWidth,
          stylePadding: style.padding,
          styleMargin: style.margin,
          parent: el.parentElement ? el.parentElement.tagName.toLowerCase() + '.' + (typeof el.parentElement.className === 'string' ? el.parentElement.className.slice(0, 30) : '') : ''
        };
      });

      return {
        url: window.location.href,
        docW,
        count: elementsExceeding320.length,
        items: elementsExceeding320
      };
    })()`,
    returnByValue: true
  });

  console.log(`\nURL: ${url}`);
  console.log(`Document scrollWidth: ${res.result.value.docW}px`);
  console.log(`Found ${res.result.value.count} elements with right > 320:`);
  for (const it of res.result.value.items) {
    console.log(`  ${it.tag}.${it.className} (parent: ${it.parent}) => right: ${it.right}, left: ${it.left}, width: ${it.width}, text: "${it.text}"`);
  }

  ws.close();
  edge.kill();
}

async function run() {
  await inspectRoute('http://localhost:3000');
  await inspectRoute('http://localhost:3000/contact');
}

run().catch(console.error);
