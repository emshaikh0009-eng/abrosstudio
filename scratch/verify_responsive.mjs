import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9224;
const BASE_URL = 'http://localhost:3000';

const VIEWPORTS = [
  { name: 'iPhone SE', width: 375, height: 667, mobile: true },
  { name: 'iPhone 13/14', width: 390, height: 844, mobile: true },
  { name: 'iPhone 14 Pro Max', width: 430, height: 932, mobile: true },
  { name: 'iPad Mini (Tablet)', width: 768, height: 1024, mobile: false },
  { name: 'iPad Air (Tablet)', width: 820, height: 1180, mobile: false },
  { name: 'iPad Pro / Desktop Boundary', width: 1024, height: 1366, mobile: false },
  { name: 'Desktop Baseline', width: 1440, height: 900, mobile: false }
];

const ROUTES = ['/', '/about', '/services', '/work', '/contact'];

const ARTIFACT_DIR = 'C:\\Users\\ATG study abroad\\.gemini\\antigravity-ide\\brain\\d69061c7-20a5-4ab1-a640-9ca9668beab6';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log('Launching headless browser on port', PORT);
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

  let versionData = null;
  for (let i = 0; i < 30; i++) {
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

  if (!versionData) {
    console.error('Failed to connect to browser CDP');
    edge.kill();
    process.exit(1);
  }

  console.log('Browser ready:', versionData.Browser);

  // Open a tab
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

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pendingRequests.has(data.id)) {
      const { resolve, reject } = pendingRequests.get(data.id);
      pendingRequests.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  const testResults = [];

  for (const route of ROUTES) {
    console.log(`\n================ Testing Route: ${route} ================`);
    await send('Page.navigate', { url: `${BASE_URL}${route}` });
    await sleep(1500);

    for (const vp of VIEWPORTS) {
      await send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 2,
        mobile: vp.mobile
      });
      await sleep(300);

      // Evaluate overflow
      const overflowEval = await send('Runtime.evaluate', {
        expression: `(() => {
          const docEl = document.documentElement;
          const scrollW = docEl.scrollWidth;
          const winW = window.innerWidth;
          const bodyScrollW = document.body.scrollWidth;
          const hasOverflow = scrollW > winW || bodyScrollW > winW;
          return {
            hasOverflow,
            scrollW,
            winW,
            diff: Math.max(scrollW - winW, bodyScrollW - winW)
          };
        })()`,
        returnByValue: true
      });

      const res = overflowEval.result.value;
      const status = res.hasOverflow ? `FAIL (+${res.diff}px overflow)` : 'PASS (0px overflow)';
      console.log(`  [${vp.width}px - ${vp.name}] => ${status}`);

      testResults.push({
        route,
        viewport: vp.width,
        name: vp.name,
        pass: !res.hasOverflow,
        diff: res.diff
      });
    }
  }

  // --- Specific Feature Test 1: Mobile Navigation Drawer Interaction on 390px ---
  console.log('\n--- Testing Mobile Navigation Menu on 390px ---');
  await send('Page.navigate', { url: `${BASE_URL}/` });
  await sleep(1000);
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await sleep(400);

  // Click mobile toggle
  const clickToggle = await send('Runtime.evaluate', {
    expression: `(() => {
      const toggle = document.querySelector('.mobile-toggle');
      if (toggle) {
        toggle.click();
        return true;
      }
      return false;
    })()`,
    returnByValue: true
  });

  await sleep(500);

  const menuState = await send('Runtime.evaluate', {
    expression: `(() => {
      const card = document.querySelector('.mobile-nav-card');
      const backdrop = document.querySelector('.mobile-nav-backdrop');
      const bodyOverflow = document.body.style.overflow;
      const isOpen = card && card.classList.contains('open');
      const activeItem = document.querySelector('.mobile-nav-item.active');
      const activeText = activeItem ? activeItem.textContent.trim() : null;
      return {
        isOpen,
        bodyOverflow,
        activeText,
        backdropVisible: backdrop && backdrop.classList.contains('open')
      };
    })()`,
    returnByValue: true
  });

  console.log('Mobile menu state after click:', JSON.stringify(menuState.result.value));

  // Capture screenshot of open mobile menu
  const menuShot = await send('Page.captureScreenshot', { format: 'png' });
  const menuBuf = Buffer.from(menuShot.data, 'base64');
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'mobile_menu_open.png'), menuBuf);
  console.log('Saved mobile_menu_open.png');

  // Close menu
  await send('Runtime.evaluate', {
    expression: `(() => {
      const closeBtn = document.querySelector('.mobile-nav-close-btn');
      if (closeBtn) closeBtn.click();
    })()`
  });
  await sleep(400);

  // --- Capture Mobile Home Page (390px) ---
  console.log('\n--- Capturing Mobile Home Page (390px viewport) ---');
  const homeMobileShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'mobile_home_390.png'), Buffer.from(homeMobileShot.data, 'base64'));
  console.log('Saved mobile_home_390.png');

  // --- Capture Tablet Home Page (768px) ---
  console.log('\n--- Capturing Tablet Home Page (768px viewport) ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 768,
    height: 1024,
    deviceScaleFactor: 2,
    mobile: false
  });
  await sleep(400);
  const tabletHomeShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'tablet_home_768.png'), Buffer.from(tabletHomeShot.data, 'base64'));
  console.log('Saved tablet_home_768.png');

  // --- Capture Desktop Home Page (1440px) to verify desktop is untouched ---
  console.log('\n--- Capturing Desktop Home Page (1440px viewport) ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 2,
    mobile: false
  });
  await sleep(400);
  const deskHomeShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'desktop_home_1440.png'), Buffer.from(deskHomeShot.data, 'base64'));
  console.log('Saved desktop_home_1440.png');

  // --- Capture Mobile Contact Page (390px) ---
  console.log('\n--- Capturing Mobile Contact Page (390px viewport) ---');
  await send('Page.navigate', { url: `${BASE_URL}/contact` });
  await sleep(1000);
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await sleep(400);
  const contactMobileShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'mobile_contact_390.png'), Buffer.from(contactMobileShot.data, 'base64'));
  console.log('Saved mobile_contact_390.png');

  // --- Summary of results ---
  const total = testResults.length;
  const passed = testResults.filter(r => r.pass).length;
  console.log(`\n================ VERIFICATION SUMMARY ================`);
  console.log(`Total tests: ${total} | Passed: ${passed} | Failed: ${total - passed}`);

  ws.close();
  edge.kill();
  console.log('Test completed successfully.');
}

run().catch(err => {
  console.error('Test run error:', err);
  process.exit(1);
});
