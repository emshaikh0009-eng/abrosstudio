const fs = require('fs');
const path = require('path');

// Test 1: Image files verification
console.log('=== TEST 1: ASSET FILES VERIFICATION ===');
const requiredAssets = [
  'public/assets/mahadev/hero-bg.jpg',
  'public/assets/mahadev/gallery-1.jpg',
  'public/assets/mahadev/gallery-2.jpg',
  'public/assets/mahadev/gallery-3.jpg',
  'public/assets/mahadev/gallery-4.jpg',
  'public/assets/ambros-crafted-hero.jpg'
];

requiredAssets.forEach(a => {
  const p = path.join(process.cwd(), a);
  if (fs.existsSync(p)) {
    console.log(`[PASS] Asset exists: ${a} (${fs.statSync(p).size} bytes)`);
  } else {
    console.error(`[FAIL] Asset missing: ${a}`);
  }
});

// Test 2: Standalone HTML files verification
console.log('\n=== TEST 2: STANDALONE FILES VERIFICATION ===');
const staticFiles = [
  'public/cards/mahadev-spa/index.html',
  'public/cards/ambros-studio/index.html',
  'public/mahadev-spa.html',
  'public/mahadev-spa-centre.html',
  'public/ambros-studio.html'
];

staticFiles.forEach(f => {
  const p = path.join(process.cwd(), f);
  if (fs.existsSync(p)) {
    console.log(`[PASS] Static file exists: ${f} (${fs.statSync(p).size} bytes)`);
  } else {
    console.error(`[FAIL] Static file missing: ${f}`);
  }
});

// Test 3: Client-side Registry & Renderer check
console.log('\n=== TEST 3: CLIENT-SIDE JS REGISTRY & RENDERER ===');
const designRegistryJs = fs.readFileSync(path.join(process.cwd(), 'public/cards/design-registry.js'), 'utf8');
const cardRendererJs = fs.readFileSync(path.join(process.cwd(), 'public/cards/card-renderer.js'), 'utf8');
const designEditorConfigsJs = fs.readFileSync(path.join(process.cwd(), 'public/admin/design-editor-configs.js'), 'utf8');
const adminIndexHtml = fs.readFileSync(path.join(process.cwd(), 'public/admin/index.html'), 'utf8');

console.log('mahadev-spa in design-registry.js:', designRegistryJs.includes("'mahadev-spa'") ? '[PASS]' : '[FAIL]');
console.log('ambros-flagship in design-registry.js:', designRegistryJs.includes("'ambros-flagship'") ? '[PASS]' : '[FAIL]');
console.log('renderMahadevSpaBody in card-renderer.js:', cardRendererJs.includes('renderMahadevSpaBody') ? '[PASS]' : '[FAIL]');
console.log('renderAmbrosFlagshipBody in card-renderer.js:', cardRendererJs.includes('renderAmbrosFlagshipBody') ? '[PASS]' : '[FAIL]');
console.log('mahadev-spa in design-editor-configs.js:', designEditorConfigsJs.includes("'mahadev-spa'") ? '[PASS]' : '[FAIL]');
console.log('ambros-flagship in design-editor-configs.js:', designEditorConfigsJs.includes("'ambros-flagship'") ? '[PASS]' : '[FAIL]');
console.log('Mahadev Spa option in admin index.html:', adminIndexHtml.includes('value="Mahadev Spa"') ? '[PASS]' : '[FAIL]');
console.log('Ambros Flagship option in admin index.html:', adminIndexHtml.includes('value="Ambros Flagship"') ? '[PASS]' : '[FAIL]');

// Test 4: Server-side TypeScript checks
console.log('\n=== TEST 4: SERVER-SIDE CODE INTEGRATION ===');
const cardDesignsTs = fs.readFileSync(path.join(process.cwd(), 'utils/card-designs.ts'), 'utf8');
const cardRendererTs = fs.readFileSync(path.join(process.cwd(), 'utils/card-renderer.ts'), 'utf8');
const routeSlugTs = fs.readFileSync(path.join(process.cwd(), 'app/c/[slug]/route.ts'), 'utf8');
const apiCardsSlugTs = fs.readFileSync(path.join(process.cwd(), 'app/api/cards/[slug]/route.ts'), 'utf8');

console.log('mahadev-spa in card-designs.ts:', cardDesignsTs.includes("'mahadev-spa'") ? '[PASS]' : '[FAIL]');
console.log('ambros-flagship in card-designs.ts:', cardDesignsTs.includes("'ambros-flagship'") ? '[PASS]' : '[FAIL]');
console.log('AUTHORITATIVE_MAHADEV_CUSTOMER export:', cardDesignsTs.includes('export const AUTHORITATIVE_MAHADEV_CUSTOMER') ? '[PASS]' : '[FAIL]');
console.log('AUTHORITATIVE_AMBROS_CUSTOMER uses ambros-flagship:', cardDesignsTs.includes('cardDesign: "ambros-flagship"') ? '[PASS]' : '[FAIL]');
console.log('renderMahadevSpaBody in card-renderer.ts:', cardRendererTs.includes('renderMahadevSpaBody') ? '[PASS]' : '[FAIL]');
console.log('renderAmbrosFlagshipBody in card-renderer.ts:', cardRendererTs.includes('renderAmbrosFlagshipBody') ? '[PASS]' : '[FAIL]');
console.log('renderCompleteMahadevSpaHtml in card-renderer.ts:', cardRendererTs.includes('renderCompleteMahadevSpaHtml') ? '[PASS]' : '[FAIL]');
console.log('renderCompleteAmbrosFlagshipHtml in card-renderer.ts:', cardRendererTs.includes('renderCompleteAmbrosFlagshipHtml') ? '[PASS]' : '[FAIL]');
console.log('mahadevspa fallback in app/c/[slug]/route.ts:', routeSlugTs.includes('sanitizedSlug === "mahadevspa"') ? '[PASS]' : '[FAIL]');
console.log('mahadevspa fallback in app/api/cards/[slug]/route.ts:', apiCardsSlugTs.includes('sanitizedSlug === "mahadevspa"') ? '[PASS]' : '[FAIL]');

console.log('\n=== ALL INTEGRITY CHECKS COMPLETED ===');

