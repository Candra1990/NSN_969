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

  await page.goto('http://localhost:3000', { waitUntil: 'load' });
  await new Promise(resolve => setTimeout(resolve, 3000));
  await browser.close();
  process.exit(0);
})();
