const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('https://fabrica-publicidade.vercel.app/', { waitUntil: 'networkidle0' });
  const html = await page.content();
  console.log(html);
  
  await browser.close();
})();
