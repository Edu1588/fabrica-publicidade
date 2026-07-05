import * as cheerio from 'cheerio';
async function f() {
  const html = await fetch('https://unimaisveiculos.com.br/?post_type=product&s=renegade').then(r=>r.text());
  const $ = cheerio.load(html);
  const links = [];
  $('a').each((i, el) => {
    const href = $(el).attr('href');
    if(href && href.includes('/product/')) links.push(href);
  });
  
  for(const link of [...new Set(links)]) {
    console.log("Checking", link);
    const p = await fetch(link).then(r=>r.text());
    if(p.includes('GAP4D01') || p.includes('GAP-4D01') || p.includes('GAP 4D01')) {
      console.log('FOUND IN', link);
    }
  }
  console.log('DONE');
}
f();
