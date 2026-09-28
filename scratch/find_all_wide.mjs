import { spawn } from 'child_process';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9258;
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

  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: false
  });

  await send('Page.navigate', { url: BASE_URL });
  await new Promise(r => setTimeout(r, 2000));

  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      const vw = 390;
      const all = Array.from(document.querySelectorAll('*'));
      const results = [];

      for (const el of all) {
        const rect = el.getBoundingClientRect();
        // Check if element itself exceeds vw without being clipped
        if (el.offsetWidth > vw || el.scrollWidth > vw || rect.width > vw || rect.right > vw) {
          const style = window.getComputedStyle(el);
          results.push({
            tag: el.tagName.toLowerCase(),
            className: typeof el.className === 'string' ? el.className.slice(0, 50) : '',
            id: el.id || '',
            offsetWidth: el.offsetWidth,
            scrollWidth: el.scrollWidth,
            clientWidth: el.clientWidth,
            rectRight: Math.round(rect.right),
            rectLeft: Math.round(rect.left),
            rectWidth: Math.round(rect.width),
            cssWidth: style.width,
            cssMaxWidth: style.maxWidth,
            cssMinWidth: style.minWidth,
            cssMargin: style.margin,
            cssPadding: style.padding,
            overflow: style.overflow,
            overflowX: style.overflowX,
            parentTag: el.parentElement ? el.parentElement.tagName.toLowerCase() : '',
            parentClass: el.parentElement && typeof el.parentElement.className === 'string' ? el.parentElement.className.slice(0, 40) : ''
          });
        }
      }

      // Group by distinct class / structure
      return results;
    })()`,
    returnByValue: true
  });

  console.log(`Found ${res.result.value.length} elements with width/scroll/right > 390px.`);
  // Print elements that are not children of another element with overflow:hidden
  for (const item of res.result.value) {
    console.log(`${item.tag}.${item.className} (parent: ${item.parentTag}.${item.parentClass}) => right: ${item.rectRight}, offsetW: ${item.offsetWidth}, scrollW: ${item.scrollWidth}, cssW: ${item.cssWidth}, overflow: ${item.overflow}`);
  }

  ws.close();
  edge.kill();
}

main().catch(console.error);
