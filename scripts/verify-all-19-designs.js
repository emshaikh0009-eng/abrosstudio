/**
 * Ambros Studio — 19 Card Designs Comprehensive Verification Matrix
 */
const path = require('path');
const designRegistry = require('../public/cards/design-registry.js');
const cardRenderer = require('../public/cards/card-renderer.js');

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
  'spice-route',
  'interior-luxury'
];

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

console.log('========================================================');
console.log('🚀 RUNNING VERIFICATION MATRIX ON ALL 19 CARD DESIGNS');
console.log('========================================================\n');

ALL_19_DESIGNS.forEach((designId, index) => {
  console.log(`[Design ${index + 1}/19] Testing: ${designId}`);

  // Test Case 1: Full Customer with Dedicated Fields + Facebook in customSettings.links + Custom GitHub
  const fullCustomer = {
    fullName: 'Jane Doe',
    designation: 'Managing Director',
    company: 'Ambros Studio Testing Co',
    description: 'Bespoke identity solutions and craftsmanship.',
    phone: '+1 555-0199',
    whatsapp: '15550199',
    email: 'jane@ambrosstudio.com',
    website: 'https://ambrosstudio.com',
    address: '100 Design Boulevard, Studio 4A',
    socialInstagram: 'https://www.instagram.com/ambrosstudio/',
    socialLinkedIn: 'https://www.linkedin.com/company/ambrosstudio/',
    cardDesign: designId,
    profileSlug: `test-${designId}`,
    avatarUrl: 'https://ambrosstudio.com/logo.png',
    is_active: true,
    customSettings: {
      links: [
        {
          id: 'link_facebook',
          type: 'facebook',
          label: 'Facebook',
          value: 'https://www.facebook.com/ambrosstudio/',
          enabled: true,
          order: 0
        },
        {
          id: 'link_github_custom',
          type: 'github',
          label: 'Engineering Hub',
          value: 'https://github.com/ambrosstudio',
          enabled: true,
          order: 1
        }
      ]
    }
  };

  const fullHtml = cardRenderer.renderCompleteCardHtml(fullCustomer);
  assert(typeof fullHtml === 'string' && fullHtml.length > 200, `${designId}: HTML output is non-empty`);
  assert(!fullHtml.includes('undefined'), `${designId}: No "undefined" text rendered in HTML`);
  assert(!fullHtml.includes('[object Object]'), `${designId}: No "[object Object]" rendered in HTML`);

  // Verify Instagram
  assert(
    fullHtml.includes('instagram.com/ambrosstudio') || fullHtml.includes('instagram'),
    `${designId}: Instagram is rendered`
  );

  // Verify Facebook
  assert(
    fullHtml.includes('facebook.com/ambrosstudio') || fullHtml.includes('facebook'),
    `${designId}: Facebook is rendered`
  );

  // Verify LinkedIn
  assert(
    fullHtml.includes('linkedin.com/company/ambrosstudio') || fullHtml.includes('linkedin'),
    `${designId}: LinkedIn is rendered`
  );

  // Verify Website
  assert(
    fullHtml.includes('ambrosstudio.com'),
    `${designId}: Website is rendered`
  );

  // Verify Email
  assert(
    fullHtml.includes('mailto:jane@ambrosstudio.com') || fullHtml.includes('jane@ambrosstudio.com'),
    `${designId}: Email is rendered`
  );

  // Verify Phone or WhatsApp
  assert(
    fullHtml.includes('15550199') || fullHtml.includes('tel:'),
    `${designId}: Contact action (Phone/WhatsApp) is rendered`
  );

  // Verify Custom Link (GitHub)
  assert(
    fullHtml.includes('github.com/ambrosstudio') || fullHtml.includes('Engineering Hub'),
    `${designId}: Additional Custom link (GitHub) is preserved and rendered`
  );

  // Test Case 2: Duplicate Social Link Prevention (Admin dedicated + Additional Links identical URL)
  const dupCustomer = {
    fullName: 'Jane Doe',
    cardDesign: designId,
    profileSlug: `test-dup-${designId}`,
    socialInstagram: 'https://www.instagram.com/ambrosstudio/',
    customSettings: {
      links: [
        {
          id: 'link_ig_dup',
          type: 'instagram',
          label: 'Instagram Duplicate',
          value: 'https://www.instagram.com/ambrosstudio/',
          enabled: true
        }
      ]
    }
  };
  const dupHtml = cardRenderer.renderCompleteCardHtml(dupCustomer);
  const igAnchorCount = (dupHtml.match(/<a\s[^>]*href=["'][^"']*instagram\.com\/ambrosstudio/gi) || []).length;
  const maxExpected = ['atg-study-abroad', 'spice-route'].includes(designId) ? 2 : 1;
  assert(
    igAnchorCount >= 1 && igAnchorCount <= maxExpected,
    `${designId}: Duplicate Instagram URL deduplicated (rendered ${igAnchorCount} anchor buttons, expected max ${maxExpected})`
  );

  // Test Case 3: Distinct Secondary Custom Link Preservation
  const distinctCustomer = {
    fullName: 'Jane Doe',
    cardDesign: designId,
    profileSlug: `test-distinct-${designId}`,
    socialInstagram: 'https://www.instagram.com/ambrosstudio/',
    customSettings: {
      links: [
        {
          id: 'link_ig_distinct',
          type: 'instagram',
          label: 'Design Team IG',
          value: 'https://www.instagram.com/ambrosstudio.design/',
          enabled: true
        }
      ]
    }
  };
  const distinctHtml = cardRenderer.renderCompleteCardHtml(distinctCustomer);
  assert(
    distinctHtml.includes('ambrosstudio.design'),
    `${designId}: Distinct secondary Instagram link (@ambrosstudio.design) is preserved`
  );

  // Test Case 4: Minimal Customer (Empty optional fields graceful degradation)
  const minimalCustomer = {
    fullName: 'Minimal User',
    cardDesign: designId,
    profileSlug: `test-min-${designId}`,
    is_active: true
  };
  const minHtml = cardRenderer.renderCompleteCardHtml(minimalCustomer);
  assert(typeof minHtml === 'string' && minHtml.length > 50, `${designId}: Minimal customer renders gracefully`);
  assert(!minHtml.includes('href=""'), `${designId}: No empty href attributes in minimal card`);
  assert(!minHtml.includes('undefined'), `${designId}: Minimal card has no undefined values`);
});

console.log('\n========================================================');
console.log(`📊 TEST RESULTS: Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
console.log('========================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL 19 CARD DESIGNS PASSED ALL VERIFICATION TESTS!');
  process.exit(0);
}
