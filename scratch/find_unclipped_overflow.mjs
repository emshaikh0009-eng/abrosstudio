import { spawn } from 'child_process';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9257;
const BASE_URL = 'http://localhost:3000';

async function main() {
  const edge = spawn(EDGE_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    'about:blank'
  ], { stdio: 'ignore' });

  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) break;
    } catch {
      await new Promise(r => setTimeout(r, 200));
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

  // Navigate to /
  await send('Page.navigate', { url: BASE_URL });
  await new Promise(r => setTimeout(r, 2000));

  // Test across widths: 320, 360, 375, 390, 768, 820, 1024
  const widths = [320, 360, 375, 390, 768, 820];

  for (const w of widths) {
    console.log(`\n=================== CHECKING WIDTH: ${w}px ===================`);
    await send('Emulation.setDeviceMetricsOverride', {
      width: w,
      height: 844,
      deviceScaleFactor: 2,
      mobile: false // keep fixed viewport width so layout doesn't expand
    });
    await new Promise(r => setTimeout(r, 400));

    const analysis = await send('Runtime.evaluate', {
      expression: `(() => {
        const vw = ${w};
        
        function isClippedByAncestor(el) {
          let curr = el.parentElement;
          while (curr && curr !== document.body && curr !== document.documentElement) {
            const style = window.getComputedStyle(curr);
            const ox = style.overflowX;
            const o = style.overflow;
            if (ox === 'hidden' || ox === 'clip' || o === 'hidden' || o === 'clip') {
              const r = curr.getBoundingClientRect();
              if (r.right <= vw + 1) return true;
            }
            curr = curr.parentElement;
          }
          return false;
        }

        const all = Array.from(document.querySelectorAll('*'));
        const trueOffenders = [];

        for (const el of all) {
          const rect = el.getBoundingClientRect();
          if (rect.right > vw + 0.5) {
            // Check if clipped
            if (!isClippedByAncestor(el)) {
              const style = window.getComputedStyle(el);
              trueOffenders.push({
                tag: el.tagName.toLowerCase(),
                id: el.id || '',
                className: typeof el.className === 'string' ? el.className.slice(0, 60) : '',
                rectRight: Math.round(rect.right),
                rectLeft: Math.round(rect.left),
                rectWidth: Math.round(rect.width),
                scrollWidth: el.scrollWidth,
                width: style.width,
                minWidth: style.minWidth,
                maxWidth: style.maxWidth,
                marginRight: style.marginRight,
                paddingRight: style.paddingRight,
                transform: style.transform !== 'none' ? style.transform : '',
                textSnippet: el.children.length === 0 ? el.textContent.trim().slice(0, 35) : ''
              });
            }
          }
        }

        return {
          viewportWidth: vw,
          htmlScrollWidth: document.documentElement.scrollWidth,
          bodyScrollWidth: document.body.scrollWidth,
          offenderCount: trueOffenders.length,
          topOffenders: trueOffenders.sort((a,b) => b.rectRight - a.rectRight).slice(0, 15)
        };
      })()`,
      returnByValue: true
    });

    console.log(JSON.stringify(analysis.result.value, null, 2));
  }

  ws.close();
  edge.kill();
}

main().catch(console.error);
