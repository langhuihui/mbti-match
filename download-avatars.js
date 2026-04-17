import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const types = [
  'intj-architect', 'intp-logician', 'entj-commander', 'entp-debater',
  'infj-advocate', 'infp-mediator', 'enfj-protagonist', 'enfp-campaigner',
  'istj-logistician', 'isfj-defender', 'estj-executive', 'esfj-consul',
  'istp-virtuoso', 'isfp-adventurer', 'estp-entrepreneur', 'esfp-entertainer'
];

async function downloadAvatars() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  // First visit the main page to get cookies
  console.log('Visiting main page to get cookies...');
  await page.goto('https://www.16personalities.com/personality-types', { waitUntil: 'domcontentloaded', timeout: 60000 });

  // Wait for Cloudflare challenge to complete
  console.log('Waiting for Cloudflare verification...');
  await page.waitForSelector('a[href*="personality"]', { timeout: 60000 });
  console.log('Cloudflare verification passed!');

  const outputDir = path.join(__dirname, 'public', 'avatars');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const type of types) {
    const url = `https://www.16personalities.com/static/images/personality-types/avatars/${type}.svg?v=3`;
    console.log(`Downloading ${type}...`);

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1000);
      const content = await page.evaluate(() => document.documentElement.outerHTML);

      if (content.startsWith('<svg')) {
        const filePath = path.join(outputDir, `${type}.svg`);
        fs.writeFileSync(filePath, content);
        console.log(`  Saved ${type}.svg (${content.length} bytes)`);
      } else {
        console.log(`  Failed: ${type} - not an SVG (got ${content.substring(0, 50)}...)`);
      }
    } catch (e) {
      console.log(`  Error: ${type} - ${e.message}`);
    }
  }

  await browser.close();
  console.log('Done!');
}

downloadAvatars();

