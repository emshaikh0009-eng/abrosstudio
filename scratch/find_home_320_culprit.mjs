import { spawn } from 'child_process';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9272;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const edge = spawn(EDGE_PATH, ['--headless=new', `--remote-debugging-port=${PORT}`, 'about:blank'], { stdio: 'ignore' });
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) break;
    } catch {
      await sleep(250);
    }
  }

  const tabs = await (await fetch(`http://127.0.0.1:${PORT}/json/new?http://localhost:3000`, { method: 'PUT' })).json();
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
  await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 800, deviceScaleFactor: 2, mobile: true });
  await sleep(2000);

  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      const docW = document.documentElement.scrollWidth;
      const winW = window.innerWidth;
      const all = Array.from(document.querySelectorAll('*'));
      
      const wide = all.filter(el => {
        const r = el.getBoundingClientRect();
        return r.right > 320.5 || el.scrollWidth > 320.5 || el.offsetWidth > 320.5;
      }).map(el => {
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          className: typeof el.className === 'string' ? el.className.slice(0, 40) : '',
          right: Math.round(r.right),
          left: Math.round(r.left),
          width: Math.round(r.width),
          scrollW: el.scrollWidth,
          offsetW: el.offsetWidth,
          text: el.children.length === 0 ? el.textContent.trim().slice(0, 30) : ''
        };
      });

      return {
        docW,
        winW,
        wideCount: wide.length,
        topWide: wide.sort((a,b) => b.scrollW - a.scrollW).slice(0, 20)
      };
    })()`,
    returnByValue: true
  });

  console.log('Home with mobile:true at 320px:', JSON.stringify(res.result.value, null, 2));
  ws.close();
  edge.kill();
}

main().catch(console.error);
