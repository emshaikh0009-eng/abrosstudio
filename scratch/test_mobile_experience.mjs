import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9288;
const BASE_URL = 'http://localhost:3000';
const ARTIFACT_DIR = 'C:\\Users\\ATG study abroad\\.gemini\\antigravity-ide\\brain\\d0bc9903-b1bb-41e4-b119-8719f8a8c81c';

const VIEWPORTS = [
  { name: '320px', width: 320, height: 750, isMobile: true },
  { name: '360px', width: 360, height: 780, isMobile: true },
  { name: '375px', width: 375, height: 812, isMobile: true },
  { name: '390px', width: 390, height: 844, isMobile: true },
  { name: '414px', width: 414, height: 896, isMobile: true },
  { name: '430px', width: 430, height: 932, isMobile: true },
  { name: '768px', width: 768, height: 1024, isMobile: false },
  { name: '1280px', width: 1280, height: 850, isMobile: false },
];

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('Launching headless Edge for comprehensive mobile QA...');
  const edge = spawn(EDGE_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-extensions',
    '--window-size=1280,850',
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

  console.log('\n--- VIEWPORT AUDIT & SECTION VISIBILITY ---');

  for (const vp of VIEWPORTS) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 2,
      mobile: vp.isMobile
    });

    await send('Page.navigate', { url: BASE_URL });
    await sleep(700);

    // Scroll down gradually to trigger scroll animations
    await send('Runtime.evaluate', {
      expression: `
        (async () => {
          const totalHeight = document.body.scrollHeight;
          const step = Math.floor(window.innerHeight * 0.7);
          for (let y = 0; y <= totalHeight; y += step) {
            window.scrollTo(0, y);
            await new Promise(r => setTimeout(r, 60));
          }
          window.scrollTo(0, 0);
          await new Promise(r => setTimeout(r, 100));
        })()
      `,
      awaitPromise: true
    });
    await sleep(400);

    const auditRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const docEl = document.documentElement;
          const body = document.body;
          const scrollW = Math.max(docEl.scrollWidth, body.scrollWidth);
          const clientW = docEl.clientWidth;
          const hasHScroll = scrollW > clientW;

          function isVisible(sel) {
            const el = document.querySelector(sel);
            if (!el) return { exists: false, visible: false };
            const style = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            const visible = style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0' && rect.height > 0;
            return { exists: true, visible, display: style.display, height: rect.height };
          }

          const sections = {
            header: isVisible('#siteHeader'),
            hero: isVisible('.hero'),
            services: isVisible('#servicesOverview'),
            trust: isVisible('#trustSection'),
            whyItMatters: isVisible('#whyItMatters'),
            selectedWork: isVisible('#selectedWork'),
            digitalCardFeature: isVisible('#digitalCardFeature'),
            process: isVisible('#process'),
            testimonials: isVisible('#testimonials'),
            finalCta: isVisible('#finalCta'),
            footer: isVisible('.site-footer')
          };

          // Check hero buttons
          const heroBtns = Array.from(document.querySelectorAll('.hero .btn')).filter(b => {
            const s = window.getComputedStyle(b);
            return s.display !== 'none' && s.visibility !== 'hidden';
          }).map(b => b.innerText.trim());

          // Check final CTA buttons
          const finalCtaBtns = Array.from(document.querySelectorAll('#finalCta .btn')).filter(b => {
            const s = window.getComputedStyle(b);
            return s.display !== 'none' && s.visibility !== 'hidden';
          }).map(b => b.innerText.trim());

          // Check service cards count
          const serviceCards = Array.from(document.querySelectorAll('#servicesOverview .service-card')).filter(c => {
            const s = window.getComputedStyle(c);
            return s.display !== 'none' && s.visibility !== 'hidden';
          }).map(c => c.querySelector('.service-title')?.innerText.trim());

          return {
            scrollW,
            clientW,
            hasHScroll,
            sections,
            heroBtns,
            finalCtaBtns,
            serviceCards
          };
        })()
      `,
      returnByValue: true
    });

    const resVal = auditRes.result.value;
    console.log(`\n[${vp.name} (${vp.width}x${vp.height})]`);
    console.log(`  Horizontal Scroll: ${resVal.hasHScroll ? 'FAIL (' + resVal.scrollW + ' > ' + resVal.clientW + ')' : 'PASS (0px overflow)'}`);
    console.log(`  Hero Buttons: [${resVal.heroBtns.join(' | ')}]`);
    console.log(`  Final CTA Buttons: [${resVal.finalCtaBtns.join(' | ')}]`);
    console.log(`  Service Cards: [${resVal.serviceCards.join(' | ')}]`);
    console.log(`  Section Visibility:`);
    for (const [secName, secData] of Object.entries(resVal.sections)) {
      console.log(`    - ${secName}: ${secData.visible ? 'VISIBLE' : 'HIDDEN'} (display: ${secData.display || 'none'}, height: ${Math.round(secData.height || 0)}px)`);
    }

    // Capture screenshots for representative devices
    if (['320px', '390px', '768px', '1280px'].includes(vp.name)) {
      await send('Runtime.evaluate', {
        expression: `
          document.querySelectorAll('.fade-in-up, .fade-in-scale').forEach(el => {
            el.classList.add('visible');
            el.removeAttribute('data-scroll-reveal');
          });
        `
      });
      await sleep(150);

      const screenshot = await send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true
      });
      const filename = `screen_${vp.name.replace('px', '')}.png`;
      const outPath = path.join(ARTIFACT_DIR, filename);
      fs.writeFileSync(outPath, Buffer.from(screenshot.data, 'base64'));
      console.log(`  Saved screenshot: ${outPath}`);
    }
  }

  ws.close();
  edge.kill();
  console.log('\nAudit complete!');
}

main().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
