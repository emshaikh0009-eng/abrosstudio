import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9295;
const BASE_URL = 'http://localhost:3000';
const ARTIFACT_DIR = 'C:\\Users\\ATG study abroad\\.gemini\\antigravity-ide\\brain\\e8294e18-0680-4231-b356-8321569ee6bd';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const edge = spawn(EDGE_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-extensions',
    '--window-size=1440,900',
    'about:blank'
  ], { stdio: 'ignore' });

  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) break;
    } catch {
      await sleep(250);
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

  ws.onmessage = e => {
    const d = JSON.parse(e.data);
    if (d.id && pending.has(d.id)) {
      const { res, rej } = pending.get(d.id);
      pending.delete(d.id);
      if (d.error) rej(d.error);
      else res(d.result);
    }
  };

  await new Promise(r => ws.onopen = r);
  await send('Page.enable');

  async function setVp(w, h) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: w,
      height: h,
      deviceScaleFactor: 1,
      mobile: w < 768
    });
  }

  async function evaluate(exp) {
    const res = await send('Runtime.evaluate', {
      expression: exp,
      returnByValue: true,
      awaitPromise: true
    });
    return res?.result?.value;
  }

  async function capture(filename) {
    const ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, filename), Buffer.from(ss.data, 'base64'));
    console.log(`Saved screenshot: ${filename}`);
  }

  // 1. Capture Why Grid 2-column cards on 390px
  await setVp(390, 844);
  await send('Page.navigate', { url: `${BASE_URL}/` });
  await sleep(800);

  await evaluate(`document.querySelector('.why-grid').scrollIntoView({ block: 'center' })`);
  await sleep(400);
  await capture('mobile_why_2col_390.png');

  // 2. Capture Service Features 2-column cards on 390px
  await send('Page.navigate', { url: `${BASE_URL}/services` });
  await sleep(800);
  await evaluate(`document.querySelector('.service-features-grid').scrollIntoView({ block: 'center' })`);
  await sleep(400);
  await capture('mobile_service_features_2col_390.png');

  // 3. Capture Metal card front and back on desktop 1440px
  await setVp(1440, 900);
  await send('Page.navigate', { url: `${BASE_URL}/` });
  await sleep(800);
  await evaluate(`document.querySelector('#digitalCardFeature').scrollIntoView({ block: 'center' })`);
  await sleep(400);
  await capture('desktop_metal_card_front.png');

  // Trigger flip via DOM click event directly on .card-scene
  await evaluate(`document.querySelector('.card-scene').click()`);
  await sleep(700);
  await capture('desktop_metal_card_back.png');

  ws.close();
  edge.kill();
  console.log('Extra visual captures complete!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
