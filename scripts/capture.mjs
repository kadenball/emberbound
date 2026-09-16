import { chromium } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';
await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:4173');
  await page.locator('h1').waitFor(); await page.screenshot({ path: 'artifacts/title-screen.png' });
  await page.locator('[data-action="start"]').click();
  await page.keyboard.down('d'); await page.waitForTimeout(1500); await page.keyboard.up('d');
  await page.keyboard.down('j'); await page.waitForTimeout(200); await page.screenshot({ path: 'artifacts/gameplay.png' }); await page.keyboard.up('j');
  await page.getByRole('button', { name: 'Pause game' }).click();
  await page.getByRole('button', { name: 'Return to camp' }).click();
  await page.getByRole('button', { name: 'Adventure', exact: true }).click();
  await page.screenshot({ path: 'artifacts/world-map.png' });
  const mobile = await browser.newPage({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  await mobile.goto('http://127.0.0.1:4173'); await mobile.locator('[data-action="start"]').click();
  await mobile.waitForTimeout(500); await mobile.screenshot({ path: 'artifacts/mobile-gameplay.png' });
  const icon = await browser.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 1 });
  const svg = await readFile('public/icon.svg', 'utf8');
  await icon.setContent(`<style>body{margin:0;background:#102422}svg{display:block;width:1024px;height:1024px}</style>${svg}`);
  await icon.screenshot({ path: 'artifacts/icon-1024.png' });
} finally { await browser.close(); }
