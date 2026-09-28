import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9280;
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
  await new Promise(r => ws.onopen = r);
  ws.onmessage = (e) => {
    const d = JSON.parse(e.data);
    if (d.id && pending.has(d.id)) {
      const { res, rej } = pending.get(d.id);
      pending.delete(d.id);
      if (d.error) rej(d.error);
      else res(d.result);
    }
  };

  await send('Page.enable');
  await send('Runtime.enable');

  console.log('--- 1. CAPTURE DESKTOP BASELINE (1440px) ---');
  await send('Page.navigate', { url: BASE_URL });
  await sleep(2000);
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 2, mobile: false });
  await sleep(500);

  const desktopCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const waBtn = document.querySelector('.wa-floating-btn');
      const waStyle = waBtn ? window.getComputedStyle(waBtn) : null;
      const navLinks = document.querySelector('.nav-links');
      const navStyle = navLinks ? window.getComputedStyle(navLinks) : null;
      const toggle = document.querySelector('.mobile-toggle');
      const toggleStyle = toggle ? window.getComputedStyle(toggle) : null;
      const h1 = document.querySelector('.hero-title');
      return {
        waDisplay: waStyle ? waStyle.display : 'none',
        navDisplay: navStyle ? navStyle.display : 'none',
        toggleDisplay: toggleStyle ? toggleStyle.display : 'none',
        h1Text: h1 ? h1.textContent.trim().replace(/\\s+/g, ' ') : ''
      };
    })()`,
    returnByValue: true
  });
  console.log('Desktop 1440px checks:', JSON.stringify(desktopCheck.result.value, null, 2));

  const deskShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'desktop_1440.png'), Buffer.from(deskShot.data, 'base64'));
  console.log('Saved desktop_1440.png');

  console.log('\n--- 2. CAPTURE TABLET HOME (768px) ---');
  await send('Emulation.setDeviceMetricsOverride', { width: 768, height: 1024, deviceScaleFactor: 2, mobile: true });
  await sleep(500);

  const tabletCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const waBtn = document.querySelector('.wa-floating-btn');
      const waStyle = waBtn ? window.getComputedStyle(waBtn) : null;
      const waLabel = document.querySelector('.wa-cta-label');
      const toggle = document.querySelector('.mobile-toggle');
      const toggleStyle = toggle ? window.getComputedStyle(toggle) : null;
      const logo = document.querySelector('.brand-logo-img');
      const logoRect = logo ? logo.getBoundingClientRect() : null;
      return {
        waDisplay: waStyle ? waStyle.display : 'none',
        waText: waLabel ? waLabel.textContent : '',
        toggleDisplay: toggleStyle ? toggleStyle.display : 'none',
        logoVisible: logoRect && logoRect.left >= 0 && logoRect.right <= 768
      };
    })()`,
    returnByValue: true
  });
  console.log('Tablet 768px checks:', JSON.stringify(tabletCheck.result.value, null, 2));

  const tabShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'tablet_768.png'), Buffer.from(tabShot.data, 'base64'));
  console.log('Saved tablet_768.png');

  console.log('\n--- 3. CAPTURE MOBILE HOME (390px) ---');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await sleep(500);

  const mobileCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const waBtn = document.querySelector('.wa-floating-btn');
      const waRect = waBtn ? waBtn.getBoundingClientRect() : null;
      const logo = document.querySelector('.brand-logo-img');
      const logoRect = logo ? logo.getBoundingClientRect() : null;
      const toggle = document.querySelector('.mobile-toggle');
      const toggleRect = toggle ? toggle.getBoundingClientRect() : null;
      const h1 = document.querySelector('.hero-title');
      const h1Rect = h1 ? h1.getBoundingClientRect() : null;
      const chip = document.querySelector('.chip-1');
      const chipRect = chip ? chip.getBoundingClientRect() : null;
      return {
        logoFits: logoRect && logoRect.left >= 0 && logoRect.right <= 390,
        logoRect: logoRect ? { left: Math.round(logoRect.left), right: Math.round(logoRect.right) } : null,
        toggleFits: toggleRect && toggleRect.left >= 0 && toggleRect.right <= 390,
        toggleRect: toggleRect ? { left: Math.round(toggleRect.left), right: Math.round(toggleRect.right) } : null,
        waFits: waRect && waRect.left >= 0 && waRect.right <= 390,
        waRect: waRect ? { left: Math.round(waRect.left), right: Math.round(waRect.right), width: Math.round(waRect.width) } : null,
        h1Fits: h1Rect && h1Rect.left >= 0 && h1Rect.right <= 390,
        chipFits: chipRect && chipRect.left >= 0 && chipRect.right <= 390
      };
    })()`,
    returnByValue: true
  });
  console.log('Mobile 390px checks:', JSON.stringify(mobileCheck.result.value, null, 2));

  const mobileHomeShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'mobile_home_390.png'), Buffer.from(mobileHomeShot.data, 'base64'));
  console.log('Saved mobile_home_390.png');

  console.log('\n--- 4. TEST HAMBURGER DRAWER INTERACTION (390px) ---');
  // Click mobile toggle
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('.mobile-toggle');
      if (btn) btn.click();
    })()`
  });
  await sleep(600);

  const menuCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const card = document.querySelector('.mobile-nav-card');
      const cardRect = card ? card.getBoundingClientRect() : null;
      const isOpen = card && card.classList.contains('open');
      const closeBtn = document.querySelector('.mobile-nav-close-btn');
      const closeRect = closeBtn ? closeBtn.getBoundingClientRect() : null;
      return {
        isOpen,
        cardFits: cardRect && cardRect.left >= 0 && cardRect.right <= 390,
        cardRect: cardRect ? { left: Math.round(cardRect.left), right: Math.round(cardRect.right), width: Math.round(cardRect.width) } : null,
        closeBtnFits: closeRect && closeRect.left >= 0 && closeRect.right <= 390
      };
    })()`,
    returnByValue: true
  });
  console.log('Mobile menu open checks:', JSON.stringify(menuCheck.result.value, null, 2));

  const menuShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'mobile_menu_open.png'), Buffer.from(menuShot.data, 'base64'));
  console.log('Saved mobile_menu_open.png');

  // Close menu
  await send('Runtime.evaluate', {
    expression: `(() => {
      const closeBtn = document.querySelector('.mobile-nav-close-btn');
      if (closeBtn) closeBtn.click();
    })()`
  });
  await sleep(400);

  console.log('\n--- 5. CAPTURE MOBILE CONTACT PAGE (390px) ---');
  await send('Page.navigate', { url: `${BASE_URL}/contact` });
  await sleep(1500);

  const contactCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const docW = document.documentElement.scrollWidth;
      const form = document.querySelector('.contact-form-card');
      const formRect = form ? form.getBoundingClientRect() : null;
      const cards = document.querySelectorAll('.contact-method-card');
      const card1Rect = cards[0] ? cards[0].getBoundingClientRect() : null;
      return {
        docW,
        formFits: formRect && formRect.right <= 390,
        card1Fits: card1Rect && card1Rect.right <= 390
      };
    })()`,
    returnByValue: true
  });
  console.log('Mobile contact 390px checks:', JSON.stringify(contactCheck.result.value, null, 2));

  const contactShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'mobile_contact_390.png'), Buffer.from(contactShot.data, 'base64'));
  console.log('Saved mobile_contact_390.png');

  console.log('\n--- 6. CAPTURE ULTRA-COMPACT MOBILE (320px) ---');
  await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 800, deviceScaleFactor: 2, mobile: true });
  await sleep(500);
  const shot320 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'mobile_contact_320.png'), Buffer.from(shot320.data, 'base64'));
  console.log('Saved mobile_contact_320.png');

  ws.close();
  edge.kill();
  console.log('\nAll QA captures completed successfully!');
}

main().catch(console.error);
