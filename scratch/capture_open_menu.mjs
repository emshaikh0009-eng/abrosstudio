import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9251;
const BASE_URL = 'http://localhost:3000';
const ARTIFACT_DIR = 'C:\\Users\\ATG study abroad\\.gemini\\antigravity-ide\\brain\\d69061c7-20a5-4ab1-a640-9ca9668beab6';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  const edge = spawn(EDGE_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-extensions',
    '--hide-scrollbars',
    '--window-size=390,844',
    'about:blank'
  ], { stdio: 'ignore' });

  for (let i = 0; i < 30; i++) {
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

  await send('Page.navigate', { url: BASE_URL });
  await sleep(1500);

  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await sleep(400);

  console.log('Waiting for hydration...');
  await send('Runtime.evaluate', {
    expression: `new Promise((resolve) => {
      const start = Date.now();
      const check = setInterval(() => {
        const btn = document.querySelector('.mobile-toggle');
        if (btn) {
          const propKey = Object.keys(btn).find(k => k.startsWith('__reactProps'));
          if (propKey && btn[propKey] && btn[propKey].onClick) {
            clearInterval(check);
            return resolve('hydrated');
          }
        }
        if (Date.now() - start > 10000) {
          clearInterval(check);
          resolve('timeout');
        }
      }, 50);
    })`,
    awaitPromise: true
  });

  console.log('Hydrated! Dispatching real click event...');
  const clickRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('.mobile-toggle');
      if (btn) {
        btn.focus();
        btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        return true;
      }
      return false;
    })()`,
    returnByValue: true
  });

  console.log('Click result:', clickRes.result.value);
  await sleep(500);

  const status = await send('Runtime.evaluate', {
    expression: `(() => {
      const card = document.querySelector('.mobile-nav-card');
      const backdrop = document.querySelector('.mobile-nav-backdrop');
      return {
        cardClass: card ? card.className : null,
        backdropClass: backdrop ? backdrop.className : null,
        bodyOverflow: document.body.style.overflow,
        windowInnerWidth: window.innerWidth,
        cardRect: card ? {
          left: card.getBoundingClientRect().left,
          right: card.getBoundingClientRect().right,
          width: card.getBoundingClientRect().width
        } : null
      };
    })()`,
    returnByValue: true
  });

  console.log('Menu status:', JSON.stringify(status.result.value));

  const shot = await send('Page.captureScreenshot', {
    format: 'png'
  });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'mobile_menu_open.png'), Buffer.from(shot.data, 'base64'));
  console.log('Saved mobile_menu_open.png successfully');

  ws.close();
  edge.kill();
}

run().catch(console.error);
