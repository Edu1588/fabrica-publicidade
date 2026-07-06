const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  await page.goto('https://fabrica-publicidade.vercel.app/', { waitUntil: 'networkidle0' });
  const content = await page.content();
  console.log('HTML CONTENT:', content.substring(0, 500));
  await browser.close();
})();
