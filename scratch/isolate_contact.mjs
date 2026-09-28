import { spawn } from 'child_process';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9265;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const edge = spawn(EDGE_PATH, ['--headless=new', `--remote-debugging-port=${PORT}`, 'about:blank'], { stdio: 'ignore' });
  
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) break;
    } catch {
      await sleep(200);
    }
  }

  const tabs = await (await fetch(`http://127.0.0.1:${PORT}/json/new?http://localhost:3000/contact`, { method: 'PUT' })).json();
  const ws = new WebSocket(tabs.webSocketDebuggerUrl);
  let id = 1;
  const pending = new Map();
  const send = (m, p = {}) => new Promise((res, rej) => {
    const i = id++;
    pending.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method: m, params: p }));
  });
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

  await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 800, deviceScaleFactor: 2, mobile: false });
  await sleep(1500);

  // We will hide elements one by one or test sections to see which section makes scrollWidth drop from 347 to 320
  const isolate = await send('Runtime.evaluate', {
    expression: `(() => {
      const results = {};
      const sections = Array.from(document.querySelectorAll('main > section'));
      sections.forEach((sec, idx) => {
        sec.style.display = 'none';
        results['without_section_' + idx] = document.documentElement.scrollWidth;
        sec.style.display = '';
      });

      // Also test header and footer
      const header = document.querySelector('header');
      if (header) {
        header.style.display = 'none';
        results['without_header'] = document.documentElement.scrollWidth;
        header.style.display = '';
      }

      const footer = document.querySelector('footer');
      if (footer) {
        footer.style.display = 'none';
        results['without_footer'] = document.documentElement.scrollWidth;
        footer.style.display = '';
      }

      return results;
    })()`,
    returnByValue: true
  });

  console.log('Isolation test on /contact at 320px:', JSON.stringify(isolate.result.value, null, 2));

  // Now dive into the offending section
  const section1Details = await send('Runtime.evaluate', {
    expression: `(() => {
      // Find inside section 1 (the main contact section)
      const sec = document.querySelectorAll('main > section')[1];
      if (!sec) return 'sec not found';
      const children = Array.from(sec.querySelectorAll('*'));
      return children.filter(c => c.scrollWidth > 320 || c.getBoundingClientRect().right > 320).map(c => ({
        tag: c.tagName,
        className: c.className,
        scrollWidth: c.scrollWidth,
        clientWidth: c.clientWidth,
        offsetWidth: c.offsetWidth,
        right: Math.round(c.getBoundingClientRect().right),
        styleWidth: window.getComputedStyle(c).width,
        stylePadding: window.getComputedStyle(c).padding
      }));
    })()`,
    returnByValue: true
  });

  console.log('Section 1 offending children:', JSON.stringify(section1Details.result.value, null, 2));

  ws.close();
  edge.kill();
}

main().catch(console.error);
