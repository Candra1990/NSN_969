import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.evaluateOnNewDocument(() => {
    window.addEventListener('error', e => {
      console.log('REAL ERROR:', e.message, e.filename, e.lineno, e.colno);
    });
  });

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
