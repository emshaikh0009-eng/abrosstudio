import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9290;
const BASE_URL = 'http://localhost:3000';
const ARTIFACT_DIR = 'C:\\Users\\ATG study abroad\\.gemini\\antigravity-ide\\brain\\e8294e18-0680-4231-b356-8321569ee6bd';

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
];

const ROUTES = ['/', '/services', '/about', '/work', '/contact'];

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
  await send('DOM.enable');

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

  async function navigate(urlPath) {
    await send('Page.navigate', { url: `${BASE_URL}${urlPath}` });
    await sleep(750);
  }

  async function capture(filename) {
    const ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, filename), Buffer.from(ss.data, 'base64'));
    console.log(`Saved screenshot: ${filename}`);
  }

  console.log('=== 1. VERIFYING DESKTOP BASELINE & CONTENT REQUIREMENTS (1440px) ===');
  await setVp(1440, 900);
  await navigate('/');

  const heroH1 = await evaluate(`document.querySelector('.hero-title').innerText.replace(/\\s+/g, ' ').trim()`);
  console.log('Hero Headline:', heroH1);
  if (heroH1 === 'Build Your Professional Website Now') {
    console.log('✅ PASS: Hero headline exactly matches "Build Your Professional Website Now"');
  } else {
    console.error('❌ FAIL: Hero headline does not match:', heroH1);
  }

  const ultraChipExists = await evaluate(`!!document.querySelector('.chip-1')`);
  if (!ultraChipExists) {
    console.log('✅ PASS: "Ultra-Fast Load" chip is completely removed from homepage');
  } else {
    console.error('❌ FAIL: "Ultra-Fast Load" chip still exists!');
  }

  // Metal card checks
  const metalCardText = await evaluate(`document.querySelector('.card-scene')?.innerText || ''`);
  const hasAmbrosOnCard = /ambros/i.test(metalCardText);
  if (!hasAmbrosOnCard) {
    console.log('✅ PASS: Metal card contains NO "AMBROS" or "Ambros Studio" text');
  } else {
    console.error('❌ FAIL: Metal card contains Ambros text:', metalCardText);
  }

  const smartChipExists = await evaluate(`!!document.querySelector('.metal-smart-chip')`);
  if (smartChipExists) {
    console.log('✅ PASS: Realistic gold contact smart chip (.metal-smart-chip) is present on card');
  } else {
    console.error('❌ FAIL: Smart chip is missing');
  }

  // Test card flip interaction
  const cardBox = await evaluate(`(() => {
    const rect = document.querySelector('.card-scene').getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  })()`);

  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: cardBox.x, y: cardBox.y, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: cardBox.x, y: cardBox.y, button: 'left', clickCount: 1 });
  await sleep(500);

  const isFlipped = await evaluate(`document.querySelector('.card-scene')?.classList.contains('flipped')`);
  console.log('Card flip after click:', isFlipped ? '✅ PASS: Flipped successfully' : '❌ FAIL: Card did not flip');

  // Verify WhatsApp floating button hidden on desktop
  const waDesktopDisplay = await evaluate(`(() => {
    const btn = document.querySelector('.wa-floating-btn');
    return btn ? window.getComputedStyle(btn).display : 'none';
  })()`);
  console.log('WhatsApp CTA on 1440px desktop:', waDesktopDisplay === 'none' ? '✅ PASS: Hidden on desktop' : `❌ FAIL: Display is ${waDesktopDisplay}`);

  // Capture desktop screenshot
  await capture('desktop_1440_final.png');

  console.log('\n=== 2. VERIFYING SERVICES PAGE REQUIREMENTS ===');
  await navigate('/services');
  const servicesText = await evaluate(`document.body.innerText`);
  const hasIntroText = servicesText.includes('Full-Service Digital Suite') || servicesText.includes('Precision Services for Ambitious Businesses');
  if (!hasIntroText) {
    console.log('✅ PASS: Services page intro section is completely removed');
  } else {
    console.error('❌ FAIL: Services page intro section is still present!');
  }

  const hasUrlText = servicesText.includes('abrosstudio.com/websites') || servicesText.includes('abrosstudio.com/meta-ads') || servicesText.includes('abrosstudio.com/nfc-cards');
  if (!hasUrlText) {
    console.log('✅ PASS: "abrosstudio.com/..." URL text is completely removed from service cards');
  } else {
    console.error('❌ FAIL: Service cards still contain abrosstudio.com URL text!');
  }

  await capture('services_page_final.png');

  console.log('\n=== 3. VERIFYING MOBILE 2-COLUMN CARDS & COMPACT LAYOUT (390px) ===');
  await setVp(390, 844);
  await navigate('/');

  const whyCols = await evaluate(`window.getComputedStyle(document.querySelector('.why-grid')).gridTemplateColumns`);
  console.log('Why Grid computed columns at 390px:', whyCols);
  if (whyCols.split(' ').length === 2) {
    console.log('✅ PASS: .why-grid renders as 2 columns [ Box 1 ] [ Box 2 ] on mobile');
  } else {
    console.error('❌ FAIL: .why-grid column count is:', whyCols.split(' ').length);
  }

  const processCols = await evaluate(`window.getComputedStyle(document.querySelector('.process-grid')).gridTemplateColumns`);
  console.log('Process Grid computed columns at 390px:', processCols);
  if (processCols.split(' ').length === 2) {
    console.log('✅ PASS: .process-grid renders as 2 columns on mobile');
  }

  await navigate('/services');
  const featureCols = await evaluate(`window.getComputedStyle(document.querySelector('.service-features-grid')).gridTemplateColumns`);
  console.log('Service features computed columns at 390px:', featureCols);
  if (featureCols.split(' ').length === 2) {
    console.log('✅ PASS: .service-features-grid renders as 2 columns on mobile');
  }

  const valuesCols = await evaluate(`window.getComputedStyle(document.querySelector('.values-grid')).gridTemplateColumns`);
  console.log('Values grid computed columns at 390px:', valuesCols);
  if (valuesCols.split(' ').length === 2) {
    console.log('✅ PASS: .values-grid renders as 2 columns on mobile');
  }

  // Capture Mobile Home 2-Col
  await navigate('/');
  await evaluate(`window.scrollTo(0, 1000)`);
  await sleep(400);
  await capture('mobile_home_2col_390.png');

  // Capture Mobile Metal Card
  await evaluate(`document.querySelector('#digitalCardFeature').scrollIntoView()`);
  await sleep(400);
  await capture('mobile_metal_card_390.png');

  // Flip and capture back
  const mCardBox = await evaluate(`(() => {
    const rect = document.querySelector('.card-scene').getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  })()`);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: mCardBox.x, y: mCardBox.y, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: mCardBox.x, y: mCardBox.y, button: 'left', clickCount: 1 });
  await sleep(600);
  await capture('mobile_metal_card_flipped_390.png');

  // Capture Ultra-compact 320px Contact
  await setVp(320, 800);
  await navigate('/contact');
  await capture('mobile_contact_320_final.png');

  console.log('\n=== 4. RUNNING MULTI-VIEWPORT AUDIT ACROSS ALL 5 ROUTES × 11 VIEWPORTS ===');
  let passCount = 0;
  let failCount = 0;

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
        console.error(`❌ OVERFLOW DETECTED: Route ${r} at ${vp.width}px -> scrollWidth = ${scrollW}px (+${scrollW - vp.width}px)`);
      }
    }
  }

  console.log(`\n==================================================`);
  console.log(`FINAL AUDIT RESULTS:`);
  console.log(`Total tests: ${passCount + failCount}`);
  console.log(`Passed: ${passCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Pass Rate: ${Math.round((passCount / (passCount + failCount)) * 100)}%`);
  console.log(`==================================================`);

  ws.close();
  edge.kill();
  process.exit(failCount === 0 ? 0 : 1);
}

main().catch(err => {
  console.error('Fatal error during CDP test:', err);
  process.exit(1);
});
