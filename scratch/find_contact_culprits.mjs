import { spawn } from 'child_process';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9259;
const BASE_URL = 'http://localhost:3000/contact';

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

  await send('Emulation.setDeviceMetricsOverride', {
    width: 320,
    height: 800,
    deviceScaleFactor: 2,
    mobile: false
  });

  await send('Page.navigate', { url: BASE_URL });
  await new Promise(r => setTimeout(r, 2000));

  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      const vw = 320;
      const all = Array.from(document.querySelectorAll('*'));
      const results = [];

      for (const el of all) {
        const rect = el.getBoundingClientRect();
        if (rect.right > vw + 0.5 || el.scrollWidth > vw + 0.5) {
          const style = window.getComputedStyle(el);
          results.push({
            tag: el.tagName.toLowerCase(),
            className: typeof el.className === 'string' ? el.className.slice(0, 50) : '',
            id: el.id || '',
            right: Math.round(rect.right),
            left: Math.round(rect.left),
            width: Math.round(rect.width),
            scrollWidth: el.scrollWidth,
            cssWidth: style.width,
            minWidth: style.minWidth,
            maxWidth: style.maxWidth,
            padding: style.padding,
            parentTag: el.parentElement ? el.parentElement.tagName.toLowerCase() : '',
            parentClass: el.parentElement && typeof el.parentElement.className === 'string' ? el.parentElement.className.slice(0, 40) : '',
            text: el.children.length === 0 ? el.textContent.trim().slice(0, 30) : ''
          });
        }
      }

      return results.sort((a,b) => b.right - a.right);
    })()`,
    returnByValue: true
  });

  console.log('Contact 320px culprits:', JSON.stringify(res.result.value, null, 2));

  ws.close();
  edge.kill();
}

main().catch(console.error);
