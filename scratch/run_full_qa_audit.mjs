import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9292;
const BASE_URL = 'http://localhost:3000';
const ARTIFACT_DIR = 'C:\\Users\\ATG study abroad\\.gemini\\antigravity-ide\\brain\\ce7fe8c4-6e90-4756-8d21-4e2477600463';

const VIEWPORTS = [
  { name: '320px', width: 320, height: 800 },
  { name: '360px', width: 360, height: 800 },
  { name: '375px', width: 375, height: 812 },
  { name: '390px', width: 390, height: 844 },
  { name: '414px', width: 414, height: 896 },
  { name: '430px', width: 430, height: 932 },
  { name: '768px', width: 768, height: 1024 },
  { name: '820px', width: 820, height: 1180 },
  { name: '834px', width: 834, height: 1112 },
  { name: '912px', width: 912, height: 1368 },
  { name: '1024px', width: 1024, height: 768 },
  { name: '1280px', width: 1280, height: 800 },
  { name: '1440px', width: 1440, height: 900 },
  { name: '1600px', width: 1600, height: 1000 },
  { name: '1920px', width: 1920, height: 1080 },
];

const ROUTES = ['/', '/services', '/about', '/work', '/contact'];

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }

  console.log('Launching headless Edge browser...');
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

  ws.onmessage = (evt) => {
    const d = JSON.parse(evt.data);
    if (d.id && pending.has(d.id)) {
      const p = pending.get(d.id);
      pending.delete(d.id);
      if (d.error) p.rej(d.error);
      else p.res(d.result);
    }
  };

  await new Promise(r => ws.onopen = r);

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  async function evaluate(exp) {
    const r = await send('Runtime.evaluate', { expression: exp, returnByValue: true });
    if (r.exceptionDetails) {
      throw new Error(`Eval exception: ${JSON.stringify(r.exceptionDetails)}`);
    }
    return r.result.value;
  }

  async function navigate(urlPath) {
    await send('Page.navigate', { url: `${BASE_URL}${urlPath}` });
    await sleep(900);
  }

  async function setVp(w, h) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: w,
      height: h,
      deviceScaleFactor: 1,
      mobile: w <= 834,
    });
    await sleep(200);
  }

  async function capture(filename) {
    const ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, filename), Buffer.from(ss.data, 'base64'));
    console.log(`Saved screenshot: ${filename}`);
  }

  console.log('\n=== 1. VERIFYING DESKTOP HOMEPAGE (1440px) ===');
  await setVp(1440, 900);
  await navigate('/');

  const heroH1 = await evaluate(`document.querySelector('.hero-title')?.innerText?.replace(/\\s+/g, ' ').trim() || ''`);
  console.log('Hero Headline:', heroH1);
  if (heroH1.includes('Build Your Professional Website Now')) {
    console.log('✅ PASS: Hero headline verified: "Build Your Professional Website Now"');
  } else {
    console.error('❌ FAIL: Hero headline unexpected:', heroH1);
  }

  const logoSvg = await evaluate(`!!document.querySelector('.ambros-logo-svg')`);
  console.log('AmbrosLogo SVG present:', logoSvg ? '✅ PASS' : '❌ FAIL');

  // Verify retired slogans do NOT exist anywhere on page
  const bodyText = await evaluate(`document.body.innerText`);
  const hasBuiltToWin = /built to win/i.test(bodyText);
  const hasCraftedTagline = /crafted with purpose/i.test(bodyText);
  console.log('Retired "Built to Win":', hasBuiltToWin ? '❌ FAIL: Found' : '✅ PASS: Not found');
  console.log('Retired "Crafted with Purpose":', hasCraftedTagline ? '❌ FAIL: Found' : '✅ PASS: Not found');

  // Verify Founder title
  const hasLeadDesigner = /lead designer/i.test(bodyText);
  console.log('Deprecated "Lead Designer":', hasLeadDesigner ? '❌ FAIL: Found' : '✅ PASS: Not found');

  // Capture desktop screenshot
  await capture('desktop_1440_homepage.png');

  // Scroll to services and capture
  await evaluate(`document.querySelector('#servicesOverview')?.scrollIntoView()`);
  await sleep(400);
  await capture('desktop_1440_services.png');

  // Scroll to why it matters
  await evaluate(`document.querySelector('#whyMatters')?.scrollIntoView()`);
  await sleep(400);
  await capture('desktop_1440_why_it_matters.png');

  // Scroll to metal card
  await evaluate(`document.querySelector('#digitalCardFeature')?.scrollIntoView()`);
  await sleep(400);
  await capture('desktop_1440_metal_card_front.png');

  // Flip card
  const cardBox = await evaluate(`(() => {
    const el = document.querySelector('.card-scene');
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  })()`);

  if (cardBox) {
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: cardBox.x, y: cardBox.y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: cardBox.x, y: cardBox.y, button: 'left', clickCount: 1 });
    await sleep(600);
    await capture('desktop_1440_metal_card_back.png');
  }

  console.log('\n=== 2. VERIFYING SUBPAGES AT 1440px ===');
  for (const r of ['/services', '/about', '/work', '/contact']) {
    await navigate(r);
    await sleep(400);
    const subPageName = r.replace('/', '');
    await capture(`desktop_1440_${subPageName}.png`);
  }

  console.log('\n=== 3. VERIFYING MOBILE (390px iPhone & 320px ultra-small) ===');
  await setVp(390, 844);
  await navigate('/');
  await capture('mobile_390_homepage.png');

  await setVp(320, 800);
  await navigate('/contact');
  await capture('mobile_320_contact.png');

  console.log('\n=== 4. AUDITING ALL 5 ROUTES × 15 VIEWPORTS FOR ZERO HORIZONTAL OVERFLOW ===');
  let passCount = 0;
  let failCount = 0;
  const failures = [];

  for (const vp of VIEWPORTS) {
    await setVp(vp.width, vp.height);
    for (const r of ROUTES) {
      await navigate(r);
      const scrollW = await evaluate(`document.documentElement.scrollWidth`);
      const isClean = scrollW <= vp.width;

      if (isClean) {
        passCount++;
      } else {
        failCount++;
        const overflow = scrollW - vp.width;
        failures.push({ route: r, viewport: vp.name, overflow });
        console.error(`❌ OVERFLOW: Route ${r} at ${vp.name} (${vp.width}px) -> scrollWidth = ${scrollW}px (+${overflow}px)`);
      }
    }
  }

  console.log(`\n==================================================`);
  console.log(`AUDIT SUMMARY:`);
  console.log(`Total Route × Viewport Checks: ${passCount + failCount}`);
  console.log(`Passed: ${passCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Pass Rate: ${Math.round((passCount / (passCount + failCount)) * 100)}%`);
  if (failures.length > 0) {
    console.log('Failures:', JSON.stringify(failures, null, 2));
  }
  console.log(`==================================================`);

  ws.close();
  edge.kill();
  process.exit(failCount === 0 ? 0 : 1);
}

main().catch(err => {
  console.error('Fatal error during audit:', err);
  process.exit(1);
});
