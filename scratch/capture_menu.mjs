import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9228;
const BASE_URL = 'http://localhost:3000';
const ARTIFACT_DIR = 'C:\\Users\\ATG study abroad\\.gemini\\antigravity-ide\\brain\\d69061c7-20a5-4ab1-a640-9ca9668beab6';

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
  let versionData = null;
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) {
        versionData = await res.json();
        break;
      }
    } catch (e) {
      await sleep(300);
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
  await send('DOM.enable');

  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });

  // Wait for hydration
  console.log('Waiting for Next.js hydration...');
  await sleep(2000);

  // Click the toggle
  console.log('Dispatching click to .mobile-toggle...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('.mobile-toggle');
      if (btn) {
        btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        return true;
      }
      return false;
    })()`
  });

  await sleep(600);

  const status = await send('Runtime.evaluate', {
    expression: `(() => {
      const card = document.querySelector('.mobile-nav-card');
      const backdrop = document.querySelector('.mobile-nav-backdrop');
      return {
        cardClass: card ? card.className : 'NOT_FOUND',
        backdropClass: backdrop ? backdrop.className : 'NOT_FOUND',
        bodyOverflow: document.body.style.overflow
      };
    })()`,
    returnByValue: true
  });

  console.log('Menu status:', JSON.stringify(status.result.value));

  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'mobile_menu_open.png'), Buffer.from(screenshot.data, 'base64'));
  console.log('Saved mobile_menu_open.png successfully');

  ws.close();
  edge.kill();
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
