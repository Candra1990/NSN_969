const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER_ERROR:', msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('PAGE_ERROR:', err.message);
  });

  page.on('requestfailed', request => {
    console.log('REQUEST_FAILED:', request.url(), request.failure().errorText);
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await browser.close();
})();
