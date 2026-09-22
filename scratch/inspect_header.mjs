import { spawn } from 'child_process';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9231;
const BASE_URL = 'http://localhost:3000';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  const edge = spawn(EDGE_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    'about:blank'
  ], { stdio: 'ignore' });

  await sleep(1000);
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) break;
    } catch (e) {
      await sleep(250);
    }
  }

  const newTabRes = await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(BASE_URL)}`, { method: 'PUT' });
  const tabData = await newTabRes.json();
  const ws = new WebSocket(tabData.webSocketDebuggerUrl);

  let msgId = 1;
  const pendingRequests = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await new Promise(r => ws.onopen = r);
  ws.onmessage = (e) => {
    const d = JSON.parse(e.data);
    if (d.id && pendingRequests.has(d.id)) {
      const { resolve, reject } = pendingRequests.get(d.id);
      pendingRequests.delete(d.id);
      if (d.error) reject(d.error);
      else resolve(d.result);
    }
  };

  await send('Page.enable');
  await send('Runtime.enable');

  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });

  await send('Page.navigate', { url: BASE_URL });
  await sleep(2000);

  const info = await send('Runtime.evaluate', {
    expression: `(() => {
      const toggle = document.querySelector('.mobile-toggle');
      const r = toggle.getBoundingClientRect();
      const header = document.querySelector('.site-header').getBoundingClientRect();
      const navContainer = document.querySelector('.nav-container').getBoundingClientRect();
      return {
        winW: window.innerWidth,
        headerW: header.width,
        navContainerW: navContainer.width,
        toggleLeft: r.left,
        toggleWidth: r.width,
        centerX: r.left + r.width / 2
      };
    })()`,
    returnByValue: true
  });

  console.log('Header Layout Info:', JSON.stringify(info.result.value, null, 2));

  ws.close();
  edge.kill();
}

run().catch(console.error);
