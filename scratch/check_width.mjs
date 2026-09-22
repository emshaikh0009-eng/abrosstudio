import { spawn } from 'child_process';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9265;

async function test(args, emulation) {
  const edge = spawn(EDGE_PATH, [
    ...args,
    `--remote-debugging-port=${PORT}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-extensions',
    '--hide-scrollbars',
    'about:blank'
  ], { stdio: 'ignore' });

  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) break;
    } catch (e) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  const tabRes = await fetch(`http://127.0.0.1:${PORT}/json/new?http://localhost:3000`, { method: 'PUT' });
  const tab = await tabRes.json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  let id = 1;
  const pending = new Map();
  function send(m, p = {}) {
    return new Promise(r => {
      const i = id++;
      pending.set(i, r);
      ws.send(JSON.stringify({ id: i, method: m, params: p }));
    });
  }
  await new Promise(r => ws.onopen = r);
  ws.onmessage = (e) => {
    const d = JSON.parse(e.data);
    if (d.id && pending.has(d.id)) {
      const r = pending.get(d.id);
      pending.delete(d.id);
      r(d.result);
    }
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  if (emulation) {
    await send('Emulation.setDeviceMetricsOverride', emulation);
  }
  await send('Page.navigate', { url: 'http://localhost:3000' });
  await new Promise(r => setTimeout(r, 2000));

  const dims = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.createElement('div');
      el.style.position = 'fixed';
      el.style.width = '100vw';
      document.body.appendChild(el);
      const vwWidth = el.getBoundingClientRect().width;
      el.style.width = '100cqw';
      const cqwWidth = el.getBoundingClientRect().width;
      el.remove();
      return {
        innerWidth: window.innerWidth,
        clientWidth: document.documentElement.clientWidth,
        vwWidth,
        cqwWidth
      };
    })()`,
    returnByValue: true
  });

  console.log('Test args:', args, 'dims:', dims.result.value);
  ws.close();
  edge.kill();
}

async function main() {
  await test(['--headless=old'], { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
}

main().catch(console.error);
