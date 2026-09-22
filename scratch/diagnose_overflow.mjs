import { spawn } from 'child_process';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9225;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function test(url) {
  console.log('Testing url:', url);
  const edge = spawn(EDGE_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
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
      await sleep(200);
    }
  }

  const tabs = await (await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' })).json();
  const ws = new WebSocket(tabs.webSocketDebuggerUrl);

  await new Promise(r => ws.onopen = r);

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = Math.floor(Math.random() * 100000);
      const handler = (e) => {
        const d = JSON.parse(e.data);
        if (d.id === id) {
          ws.removeEventListener('message', handler);
          resolve(d.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Emulation.setDeviceMetricsOverride', {
    width: 768,
    height: 1024,
    deviceScaleFactor: 1,
    mobile: false
  });

  await sleep(1500);

  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      const all = document.querySelectorAll('*');
      const culprits = [];
      for (const el of all) {
        const rect = el.getBoundingClientRect();
        if (rect.right > 768.5 || el.scrollWidth > 768.5) {
          culprits.push({
            tag: el.tagName,
            id: el.id,
            className: el.className,
            scrollWidth: el.scrollWidth,
            clientWidth: el.clientWidth,
            right: rect.right
          });
        }
      }
      return culprits;
    })()`,
    returnByValue: true
  });

  console.log('Culprits:', JSON.stringify(res.result ? res.result.value : res, null, 2));

  ws.close();
  edge.kill();
}

test('http://localhost:3000/work');
