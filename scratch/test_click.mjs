import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9229;
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
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) break;
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

  console.log('Navigating to http://localhost:3000...');
  await send('Page.navigate', { url: 'http://localhost:3000' });
  await sleep(2500);

  // Get toggle coordinates
  const rectRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.mobile-toggle');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    })()`,
    returnByValue: true
  });

  const coords = rectRes.result.value;
  console.log('Mobile toggle coords:', coords);

  // Dispatch real mouse press & release
  await send('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x: coords.x,
    y: coords.y,
    button: 'left',
    clickCount: 1
  });

  await send('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x: coords.x,
    y: coords.y,
    button: 'left',
    clickCount: 1
  });

  await sleep(600);

  const checkRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const card = document.querySelector('.mobile-nav-card');
      const backdrop = document.querySelector('.mobile-nav-backdrop');
      return {
        cardOpen: card ? card.classList.contains('open') : false,
        backdropOpen: backdrop ? backdrop.classList.contains('open') : false,
        cardComputedDisplay: card ? getComputedStyle(card).display : null,
        cardComputedOpacity: card ? getComputedStyle(card).opacity : null,
        cardComputedTransform: card ? getComputedStyle(card).transform : null
      };
    })()`,
    returnByValue: true
  });

  console.log('Check result:', JSON.stringify(checkRes.result.value));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'mobile_menu_open.png'), Buffer.from(shot.data, 'base64'));
  console.log('Captured mobile_menu_open.png with real click');

  ws.close();
  edge.kill();
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
