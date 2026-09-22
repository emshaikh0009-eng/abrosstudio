import { spawn } from 'child_process';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9245;

async function run() {
  const edge = spawn(EDGE_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1000));
  const newTabRes = await fetch(`http://127.0.0.1:${PORT}/json/new?http://localhost:3000`, { method: 'PUT' });
  const tabData = await newTabRes.json();
  const ws = new WebSocket(tabData.webSocketDebuggerUrl);

  let msgId = 1;
  const pending = new Map();
  function send(method, params = {}) {
    return new Promise((res, rej) => {
      const id = msgId++;
      pending.set(id, { res, rej });
      ws.send(JSON.stringify({ id, method, params }));
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

  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await send('Page.navigate', { url: 'http://localhost:3000' });
  await new Promise(r => setTimeout(r, 2000));

  // click button
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('.mobile-toggle');
      if (btn) btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 500));

  const result = await send('Runtime.evaluate', {
    expression: `(() => {
      const card = document.querySelector('.mobile-nav-card');
      const header = document.querySelector('.mobile-nav-card-header');
      const closeBtn = document.querySelector('.mobile-nav-close-btn');
      return {
        windowWidth: window.innerWidth,
        cardRect: card ? card.getBoundingClientRect() : null,
        headerRect: header ? header.getBoundingClientRect() : null,
        closeBtnRect: closeBtn ? closeBtn.getBoundingClientRect() : null,
        cardComputedStyle: card ? {
          width: window.getComputedStyle(card).width,
          left: window.getComputedStyle(card).left,
          right: window.getComputedStyle(card).right,
          transform: window.getComputedStyle(card).transform
        } : null
      };
    })()`,
    returnByValue: true
  });

  console.log('Result:', JSON.stringify(result.result.value, null, 2));
  ws.close();
  edge.kill();
}

run().catch(console.error);
