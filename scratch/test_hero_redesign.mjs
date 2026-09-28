import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9299;
const BASE_URL = 'http://localhost:3000';
const ARTIFACT_DIR = 'C:\\Users\\ATG study abroad\\.gemini\\antigravity-ide\\brain\\d0bc9903-b1bb-41e4-b119-8719f8a8c81c';

const VIEWPORTS = [
  // Mobile
  { name: '360px', width: 360, height: 800, isMobile: true },
  { name: '375px', width: 375, height: 812, isMobile: true },
  { name: '390px', width: 390, height: 844, isMobile: true },
  { name: '414px', width: 414, height: 896, isMobile: true },
  { name: '430px', width: 430, height: 932, isMobile: true },
  // Tablet
  { name: '768px', width: 768, height: 1024, isMobile: false },
  { name: '820px', width: 820, height: 1180, isMobile: false },
  { name: '1024px', width: 1024, height: 768, isMobile: false },
  // Desktop
  { name: '1280px', width: 1280, height: 850, isMobile: false },
  { name: '1366px', width: 1366, height: 768, isMobile: false },
  { name: '1440px', width: 1440, height: 900, isMobile: false },
  { name: '1920px', width: 1920, height: 1080, isMobile: false },
];

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('Launching headless Edge for Hero Section Redesign Verification...');
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

  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (d.id && pending.has(d.id)) {
        const { res, rej } = pending.get(d.id);
        pending.delete(d.id);
        if (d.error) rej(d.error);
        else res(d.result);
      }
    };
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');
  await send('CSS.enable');

  console.log('\n--- VERIFYING HERO SECTION ACROSS VIEWPORTS ---');

  for (const vp of VIEWPORTS) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 2,
      mobile: vp.isMobile
    });

    await send('Page.navigate', { url: BASE_URL });
    await sleep(600);

    // Make reveal elements visible
    await send('Runtime.evaluate', {
      expression: `
        document.querySelectorAll('.fade-in-up, .fade-in-scale').forEach(el => {
          el.classList.add('visible');
          el.removeAttribute('data-scroll-reveal');
        });
      `
    });
    await sleep(200);

    const auditRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const docEl = document.documentElement;
          const body = document.body;
          const scrollW = Math.max(docEl.scrollWidth, body.scrollWidth);
          const clientW = docEl.clientWidth;
          const hasHScroll = scrollW > clientW;

          const heroEl = document.querySelector('#hero');
          const heroRect = heroEl ? heroEl.getBoundingClientRect() : null;

          const titleEl = document.querySelector('.hero-title');
          const titleText = titleEl ? titleEl.innerText.replace(/\\n/g, ' ') : '';

          const descEl = document.querySelector('.hero-desc');
          const descText = descEl ? descEl.innerText : '';

          const ctaEl = document.querySelector('.btn-hero-cta');
          const ctaText = ctaEl ? ctaEl.innerText : '';
          const ctaHref = ctaEl ? ctaEl.getAttribute('href') : '';

          const trustItems = Array.from(document.querySelectorAll('.trust-indicator-item')).map(el => {
            const label = Array.from(el.querySelectorAll('.trust-line')).map(s => s.innerText.trim()).join(' ') || el.innerText.trim();
            const rect = el.getBoundingClientRect();
            return { label, width: Math.round(rect.width), height: Math.round(rect.height) };
          });

          const imgEl = document.querySelector('.hero-composition-img');
          const imgRect = imgEl ? imgEl.getBoundingClientRect() : null;
          const imgSrc = imgEl ? (imgEl.currentSrc || imgEl.src) : '';

          const navLinks = Array.from(document.querySelectorAll('.nav-links .nav-link')).map(a => a.innerText.trim());
          const headerCta = document.querySelector('.header-book-btn')?.innerText.trim() || '';

          return {
            scrollW,
            clientW,
            hasHScroll,
            heroHeight: heroRect ? Math.round(heroRect.height) : 0,
            titleText,
            descText,
            ctaText,
            ctaHref: ctaHref.slice(0, 30) + '...',
            trustItems,
            imgRect: imgRect ? { width: Math.round(imgRect.width), height: Math.round(imgRect.height) } : null,
            imgSrc,
            navLinks,
            headerCta
          };
        })()
      `,
      returnByValue: true
    });

    const resVal = auditRes.result.value;
    console.log(`\n[${vp.name} (${vp.width}x${vp.height}) - ${vp.isMobile ? 'Mobile' : 'Desktop/Tablet'}]`);
    console.log(`  Horizontal Scroll: ${resVal.hasHScroll ? 'FAIL (' + resVal.scrollW + ' > ' + resVal.clientW + ')' : 'PASS (0px overflow)'}`);
    console.log(`  Hero Height: ${resVal.heroHeight}px`);
    console.log(`  Title: "${resVal.titleText}"`);
    console.log(`  CTA: "${resVal.ctaText}" (dest: ${resVal.ctaHref})`);
    console.log(`  Trust Indicators: ${resVal.trustItems.map(t => t.label).join(' | ')}`);
    console.log(`  Showcase Image: ${resVal.imgRect ? resVal.imgRect.width + 'x' + resVal.imgRect.height : 'NOT FOUND'}`);

    // Capture screenshots for key viewport benchmarks
    if (['390px', '768px', '1024px', '1440px', '1920px'].includes(vp.name)) {
      const screenshot = await send('Page.captureScreenshot', {
        format: 'png',
        clip: {
          x: 0,
          y: 0,
          width: vp.width,
          height: Math.min(vp.height, 1000),
          scale: 1
        }
      });
      const filename = `hero_${vp.name.replace('px', '')}.png`;
      const outPath = path.join(ARTIFACT_DIR, filename);
      fs.writeFileSync(outPath, Buffer.from(screenshot.data, 'base64'));
      console.log(`  --> Saved screenshot: ${filename}`);
    }
  }

  ws.close();
  edge.kill();
  console.log('\nVerification run finished successfully!');
}

main().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
