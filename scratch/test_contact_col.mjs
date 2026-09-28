import { spawn } from 'child_process';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9263;

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

  for (const m of [false, true]) {
    console.log(`\n=== Testing /contact width: 320px with mobile: ${m} ===`);
    await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 800, deviceScaleFactor: 2, mobile: m });
    await sleep(1500);

    const docInfo = await send('Runtime.evaluate', {
      expression: `(() => {
        return {
          innerWidth: window.innerWidth,
          docScrollW: document.documentElement.scrollWidth,
          bodyScrollW: document.body.scrollWidth,
          docClientW: document.documentElement.clientWidth
        };
      })()`,
      returnByValue: true
    });
    console.log('Doc info:', docInfo.result.value);

    const culprits = await send('Runtime.evaluate', {
      expression: `(() => {
        const vw = window.innerWidth;
        const all = Array.from(document.querySelectorAll('*'));
        return all.filter(el => {
          const r = el.getBoundingClientRect();
          return r.right > vw + 0.5 || el.scrollWidth > vw + 0.5;
        }).map(el => {
          const r = el.getBoundingClientRect();
          return {
            tag: el.tagName.toLowerCase(),
            class: el.className && typeof el.className === 'string' ? el.className.slice(0, 40) : '',
            id: el.id || '',
            right: Math.round(r.right),
            width: Math.round(r.width),
            scrollW: el.scrollWidth,
            text: el.children.length === 0 ? el.textContent.trim().slice(0, 30) : ''
          };
        });
      })()`,
      returnByValue: true
    });
    console.log('Culprits count:', culprits.result.value.length);
    if (culprits.result.value.length > 0) {
      console.log('Culprits:', culprits.result.value.slice(0, 10));
    }
  }

  ws.close();
  edge.kill();
}

main().catch(console.error);
