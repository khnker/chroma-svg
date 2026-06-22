const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('https://coolors.co/palettes/trending', { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(5000);

const palettes = await page.evaluate(() => {
  const lines = document.body.innerText.split('\n').map(l => l.trim()).filter(l => l);
  const hexRe = /^[0-9a-fA-F]{6}$/;
  const result = [];
  let i = 0;
  while (i < lines.length) {
    const group = [];
    while (i < lines.length && hexRe.test(lines[i])) { group.push('#' + lines[i].toLowerCase()); i++; }
    if (group.length >= 3 && i < lines.length) {
      const name = lines[i]; i++;
      let count = '';
      if (i < lines.length && /^[\d.]+K?$/.test(lines[i])) { count = lines[i]; i++; }
      result.push({ id: group.join('-').replace(/#/g, ''), hexes: group, name, count });
    } else { i++; }
  }
  return result.slice(0, 50);
});

await browser.close();

const outPath = path.join(__dirname, '..', 'public', 'trending-palettes.json');
fs.writeFileSync(outPath, JSON.stringify(palettes, null, 2));
console.log(`Saved ${palettes.length} palettes to public/trending-palettes.json`);
})();
