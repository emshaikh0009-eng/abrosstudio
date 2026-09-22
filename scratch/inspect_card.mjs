import { spawn } from 'child_process';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9260;

async function run() {
  const edge = spawn(EDGE_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-extensions',
    '--window-size=1200,900',
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

  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send('Page.navigate', { url: 'http://localhost:3000' });
  await new Promise(r => setTimeout(r, 2500));

  await send('Runtime.evaluate', { expression: 'document.querySelector(".mobile-toggle").click()' });
  await new Promise(r => setTimeout(r, 600));

  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      const c = document.querySelector(".mobile-nav-card");
      return {
        windowInnerWidth: window.innerWidth,
        clientWidth: document.documentElement.clientWidth,
        cardRect: c ? {
          left: c.getBoundingClientRect().left,
          right: c.getBoundingClientRect().right,
          width: c.getBoundingClientRect().width,
          top: c.getBoundingClientRect().top,
          height: c.getBoundingClientRect().height
        } : null,
        computed: c ? {
          width: window.getComputedStyle(c).width,
          maxWidth: window.getComputedStyle(c).maxWidth,
          left: window.getComputedStyle(c).left,
          right: window.getComputedStyle(c).right,
          margin: window.getComputedStyle(c).margin,
          transform: window.getComputedStyle(c).transform
        } : null
      };
    })()`,
    returnByValue: true
  });

  console.log('OUTPUT:', JSON.stringify(res.result.value, null, 2));
  ws.close();
  edge.kill();
}

run().catch(console.error);
