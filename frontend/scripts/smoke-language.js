const { chromium } = require('playwright');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture PATCH /api/profile/ requests
  let patchSeen = null;
  page.on('request', (request) => {
    try {
      if (request.method() === 'PATCH' && request.url().includes('/api/profile/')) {
        patchSeen = request;
      }
    } catch (e) {
      // ignore
    }
  });

  // Navigate
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

  // Ensure initial language is 'en' or unset
  const initialLang = await page.evaluate(() => localStorage.getItem('lang'));
  console.log('initial lang:', initialLang);

  // Switch to Russian using header select
  const sel = await page.$('header select[aria-label]');
  if (!sel) {
    console.error('Language select not found');
    await browser.close();
    process.exit(2);
  }

  // Set a fake token to simulate logged-in user (so backend PATCH is attempted)
  await page.evaluate(() => localStorage.setItem('token', 'smoke-test-token'));

  // Change to Russian
  await sel.selectOption('ru');

  // Wait for confirmation message
  try {
    await page.waitForSelector('.text-green-600', { timeout: 3000 });
  } catch (e) {
    console.error('No save confirmation shown');
  }

  // Check localStorage
  const langNow = await page.evaluate(() => localStorage.getItem('lang'));
  console.log('lang after change:', langNow);

  // Check that UI changed: check header title text
  const titleText = await page.$eval('header h1', el => el.textContent.trim());
  console.log('header title now:', titleText);

  // Wait a bit for PATCH to be sent
  await page.waitForTimeout(1000);

  if (patchSeen) {
    console.log('PATCH /api/profile/ was sent. Post data:', patchSeen.postData());
  } else {
    console.warn('PATCH /api/profile/ was NOT seen (backend may reject or offline)');
  }

  await browser.close();

  // Evaluate results
  if (langNow !== 'ru') {
    console.error('Language not saved to localStorage');
    process.exit(3);
  }

  // If backend present, verify request body contains lang
  if (patchSeen) {
    const body = patchSeen.postData();
    if (!body.includes('ru')) {
      console.error('PATCH body does not include lang=ru');
      process.exit(4);
    }
  }

  console.log('Smoke test passed');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});