const http = require('http');

const ALL_19_DESIGNS = [
  'mint-haven',
  'evergreen',
  'noir-gold',
  'emerald-ivory',
  'neon-pulse',
  'mono-studio',
  'classic-navy',
  'fresh-mint',
  'bold-pop',
  'bento-grid',
  'glass-aurora',
  'luxe-foil',
  'skyline',
  'atelier',
  'care-plus',
  'roast-and-co',
  'raftcon-luxury',
  'atg-study-abroad',
  'spice-route'
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, data }));
    }).on('error', reject);
  });
}

async function testAll() {
  console.log('====================================================');
  console.log('🌐 TESTING LIVE HTTP ENDPOINTS ON LOCAL SERVER');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  for (const design of ALL_19_DESIGNS) {
    const url = `http://localhost:3000/c/demo?design=${design}`;
    try {
      const res = await fetchUrl(url);
      if (res.statusCode === 200 && res.data.length > 500 && !res.data.includes('undefined')) {
        passed++;
        console.log(`  ✅ [${design}] HTTP 200 OK — ${res.data.length} bytes`);
      } else {
        failed++;
        console.error(`  ❌ [${design}] Failed! Status: ${res.statusCode}, Length: ${res.data.length}`);
      }
    } catch (err) {
      failed++;
      console.error(`  ❌ [${design}] Request error:`, err.message);
    }
  }

  // Also test authoritative brand and demo slugs
  const specialSlugs = ['ambros', 'tabrezqureshi', 'aamirshaikh', 'spiceroute'];
  for (const slug of specialSlugs) {
    const url = `http://localhost:3000/c/${slug}`;
    try {
      const res = await fetchUrl(url);
      if (res.statusCode === 200 && res.data.length > 500) {
        passed++;
        console.log(`  ✅ [slug: /c/${slug}] HTTP 200 OK — ${res.data.length} bytes`);
      } else if (slug === 'tabrezqureshi' && res.statusCode === 308) {
        passed++;
        console.log(`  ✅ [slug: /c/${slug}] HTTP 308 Redirect (Canonical Subdomain Routing) -> ${res.headers.location}`);
      } else {
        failed++;
        console.error(`  ❌ [slug: /c/${slug}] Failed! Status: ${res.statusCode}`);
      }
    } catch (err) {
      failed++;
      console.error(`  ❌ [slug: /c/${slug}] Request error:`, err.message);
    }
  }

  console.log('\n====================================================');
  console.log(`🏁 RESULT: ${passed} Passed | ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

testAll().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
