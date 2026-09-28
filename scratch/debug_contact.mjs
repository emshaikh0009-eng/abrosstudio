import { spawn } from 'child_process';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9266;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const edge = spawn(EDGE_PATH, ['--headless=new', `--remote-debugging-port=${PORT}`, 'about:blank'], { stdio: 'ignore' });
  
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) break;
    } catch {
      await sleep(200);
    }
  }

  const tabs = await (await fetch(`http://127.0.0.1:${PORT}/json/new?http://localhost:3000/contact`, { method: 'PUT' })).json();
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
  await send('Page.navigate', { url: 'http://localhost:3000/contact' });
  await sleep(2000);

  await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 800, deviceScaleFactor: 2, mobile: false });
  await sleep(1000);

  const debug = await send('Runtime.evaluate', {
    expression: `(() => {
      const all = Array.from(document.querySelectorAll('*'));
      const culprits = all.filter(el => {
        const r = el.getBoundingClientRect();
        return r.right > 320.5 || el.scrollWidth > 320.5;
      }).map(el => {
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          class: el.className,
          id: el.id,
          right: Math.round(r.right),
          scrollW: el.scrollWidth,
          offsetW: el.offsetWidth,
          text: el.children.length === 0 ? el.textContent.trim().slice(0, 40) : ''
        };
      });

      return {
        url: window.location.href,
        scrollW: document.documentElement.scrollWidth,
        culpritCount: culprits.length,
        culprits: culprits.slice(0, 20)
      };
    })()`,
    returnByValue: true
  });

  console.log('Result:', JSON.stringify(debug.result.value, null, 2));

  ws.close();
  edge.kill();
}

main().catch(console.error);
