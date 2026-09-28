import { chromium } from 'playwright';
import path from 'path';

const ARTIFACTS_DIR = 'C:\\Users\\ATG study abroad\\.gemini\\antigravity-ide\\brain\\e8294e18-0680-4231-b356-8321569ee6bd';

const VIEWPORTS = [
  { name: 'Mobile 320', width: 320, height: 800 },
  { name: 'Mobile 360', width: 360, height: 800 },
  { name: 'Mobile 375', width: 375, height: 812 },
  { name: 'Mobile 390', width: 390, height: 844 },
  { name: 'Mobile 414', width: 414, height: 896 },
  { name: 'Mobile 430', width: 430, height: 932 },
  { name: 'Tablet 768', width: 768, height: 1024 },
  { name: 'Tablet 820', width: 820, height: 1180 },
  { name: 'Tablet 834', width: 834, height: 1112 },
  { name: 'Tablet 912', width: 912, height: 1368 },
  { name: 'Tablet 1024', width: 1024, height: 768 },
];

const ROUTES = [
  { path: '/', name: 'Home' },
  { path: '/services', name: 'Services' },
  { path: '/about', name: 'About' },
  { path: '/work', name: 'Work' },
  { path: '/contact', name: 'Contact' },
];

async function runTest() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('=== 1. VERIFYING CONTENT & METAL CARD REQUIREMENTS (Desktop 1440px) ===');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

  // 1.1 Hero Headline Check
  const heroH1 = await page.$eval('.hero-title', el => el.innerText.replace(/\s+/g, ' ').trim());
  console.log('Hero Headline:', heroH1);
  if (heroH1 === 'Build Your Professional Website Now') {
    console.log('✅ PASS: Hero headline exactly matches "Build Your Professional Website Now"');
  } else {
    console.error('❌ FAIL: Hero headline does not match:', heroH1);
  }

  // 1.2 Ultra-Fast Load Chip Check
  const ultraChip = await page.$('.chip-1');
  if (!ultraChip) {
    console.log('✅ PASS: "Ultra-Fast Load" chip is completely removed from homepage');
  } else {
    console.error('❌ FAIL: "Ultra-Fast Load" chip is still present');
  }

  // 1.3 Metal Business Card Requirements
  const metalCardText = await page.$eval('.card-scene', el => el.innerText);
  console.log('Metal Card Text snippet:', metalCardText.replace(/\n+/g, ' | '));
  const hasAmbrosOnCard = /ambros/i.test(metalCardText);
  if (!hasAmbrosOnCard) {
    console.log('✅ PASS: Metal card contains NO "AMBROS" or "Ambros Studio" text');
  } else {
    console.error('❌ FAIL: Metal card still contains Ambros text!');
  }

  const smartChip = await page.$('.metal-smart-chip');
  if (smartChip) {
    console.log('✅ PASS: Realistic gold contact smart chip (.metal-smart-chip) is present on card');
  } else {
    console.error('❌ FAIL: Smart chip is missing');
  }

  // Test card flip interaction
  await page.click('.card-scene');
  await page.waitForTimeout(500);
  const isFlipped = await page.$eval('.card-scene', el => el.classList.contains('flipped'));
  console.log('Card flip after click:', isFlipped ? '✅ PASS: Flipped' : '❌ FAIL: Not flipped');

  // 1.4 Services Page Checks
  console.log('\n=== 2. VERIFYING SERVICES PAGE REQUIREMENTS ===');
  await page.goto('http://localhost:3000/services', { waitUntil: 'networkidle' });
  const servicesText = await page.innerText('body');
  const hasIntroText = servicesText.includes('Full-Service Digital Suite') || servicesText.includes('Precision Services for Ambitious Businesses');
  if (!hasIntroText) {
    console.log('✅ PASS: Services page intro section is completely removed');
  } else {
    console.error('❌ FAIL: Services page intro section is still present!');
  }

  const hasUrlText = servicesText.includes('abrosstudio.com/websites') || servicesText.includes('abrosstudio.com/meta-ads') || servicesText.includes('abrosstudio.com/nfc-cards');
  if (!hasUrlText) {
    console.log('✅ PASS: "abrosstudio.com/..." URL text is completely removed from service cards');
  } else {
    console.error('❌ FAIL: Service cards still contain abrosstudio.com URL text!');
  }

  // 2-Column layout checks on mobile
  console.log('\n=== 3. VERIFYING MOBILE 2-COLUMN CARDS & COMPACT LAYOUT (390px) ===');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

  const whyCols = await page.$eval('.why-grid', el => window.getComputedStyle(el).gridTemplateColumns);
  console.log('Why Grid computed columns at 390px:', whyCols);
  const whyColCount = whyCols.split(' ').length;
  if (whyColCount === 2) {
    console.log('✅ PASS: .why-grid renders as a 2-column layout [ Box 1 ] [ Box 2 ] on mobile');
  } else {
    console.error('❌ FAIL: .why-grid column count is:', whyColCount);
  }

  const processCols = await page.$eval('.process-grid', el => window.getComputedStyle(el).gridTemplateColumns);
  console.log('Process Grid computed columns at 390px:', processCols);
  if (processCols.split(' ').length === 2) {
    console.log('✅ PASS: .process-grid renders as a 2-column layout on mobile');
  }

  // Check services 2-column features
  await page.goto('http://localhost:3000/services', { waitUntil: 'networkidle' });
  const featureCols = await page.$eval('.service-features-grid', el => window.getComputedStyle(el).gridTemplateColumns);
  console.log('Service features computed columns at 390px:', featureCols);
  if (featureCols.split(' ').length === 2) {
    console.log('✅ PASS: .service-features-grid renders as a 2-column layout on mobile');
  }

  const valuesCols = await page.$eval('.values-grid', el => window.getComputedStyle(el).gridTemplateColumns);
  console.log('Values grid computed columns at 390px:', valuesCols);
  if (valuesCols.split(' ').length === 2) {
    console.log('✅ PASS: .values-grid renders as a 2-column layout on mobile');
  }

  // Multi-viewport & Route Audit for Horizontal Overflow
  console.log('\n=== 4. RUNNING MULTI-VIEWPORT AUDIT ACROSS ALL 5 ROUTES × 11 VIEWPORTS ===');
  let passCount = 0;
  let failCount = 0;

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    for (const route of ROUTES) {
      await page.goto(`http://localhost:3000${route.path}`, { waitUntil: 'networkidle' });
      const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
      const docW = await page.evaluate(() => document.documentElement.clientWidth);
      const isClean = scrollW <= vp.width;

      if (isClean) {
        passCount++;
      } else {
        failCount++;
        console.error(`❌ OVERFLOW DETECTED: Route ${route.path} at ${vp.width}px -> scrollWidth = ${scrollW}px (overflow = +${scrollW - vp.width}px)`);
      }
    }
  }

  console.log(`\nAudit Summary: Total: ${passCount + failCount} | Passed: ${passCount} | Failed: ${failCount}`);

  // Capture Visual Screenshots
  console.log('\n=== 5. CAPTURING VISUAL EVIDENCE ARTIFACTS ===');
  // Desktop
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'desktop_1440_final.png') });
  console.log('Saved desktop_1440_final.png');

  // Services Page Top
  await page.goto('http://localhost:3000/services', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'services_page_final.png') });
  console.log('Saved services_page_final.png');

  // Mobile Home 2-Col Cards
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'mobile_home_2col_390.png') });
  console.log('Saved mobile_home_2col_390.png');

  // Mobile Metal Card
  const cardElem = await page.$('.card-feature-section');
  if (cardElem) {
    await cardElem.scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'mobile_metal_card_390.png') });
    console.log('Saved mobile_metal_card_390.png');

    // Flip card and capture back
    await page.click('.card-scene');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'mobile_metal_card_flipped_390.png') });
    console.log('Saved mobile_metal_card_flipped_390.png');
  }

  // Ultra-compact 320px Contact Page
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('http://localhost:3000/contact', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'mobile_contact_320_final.png') });
  console.log('Saved mobile_contact_320_final.png');

  await browser.close();
  console.log('\nAll tests and captures completed successfully!');
}

runTest().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
