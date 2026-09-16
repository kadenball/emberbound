// Historical 0.2 scene capture. Use capture-expansion.mjs for the current campaign.
import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:4173'); await page.locator('h1').waitFor();
  await page.getByRole('button', { name: 'Heroes', exact: true }).click();
  await page.screenshot({ path: 'artifacts/monster-heroes.png' });
  // Inspect all actual scenery variants independently of a player's locked save.
  // This is a developer capture, not a production cheat or balance test.
  const measurements = await page.evaluate(async () => {
    const { Renderer } = await import('/src/render.ts');
    const { Game, idleInput } = await import('/src/engine.ts');
    const canvas = document.createElement('canvas'); const renderer = new Renderer(canvas);
    const result = [];
    for (const stage of [0, 2, 10]) {
      const g = new Game('ember', stage, { strength: 0, vitality: 0, spirit: 0 }, 7);
      g.player.x = 2300; g.wave = 2;
      for (let i = 0; i < 6; i++) g.spawn(i === 0 ? 'boss' : i % 2 ? 'archer' : 'raider', 2140 + i * 100, 380 + (i % 3) * 55);
      renderer.camera = 1700;
      const ms = [];
      for (let i = 0; i < 35; i++) {
        await new Promise(requestAnimationFrame);
        const start = performance.now(); renderer.draw(g, 'ember', stage, i / 60, false);
        if (i >= 5) ms.push(performance.now() - start);
      }
      ms.sort((a,b) => a-b);
      result.push({ stage, medianDrawMs: ms[15], p95DrawMs: ms[28], image: canvas.toDataURL() });
    }
    return result;
  });
  for (const item of measurements) {
    await writeFile(`artifacts/chapter-${item.stage+1}-updated.png`, Buffer.from(item.image.split(',')[1], 'base64'));
    delete item.image;
  }
  await writeFile('artifacts/render-timings.json', JSON.stringify({ note: 'Desktop Chromium draw submission timings; not physical mobile frame-rate measurements.', measurements }, null, 2));
  console.log(JSON.stringify(measurements));
  await page.getByRole('button', { name: 'Adventure', exact: true }).click();
  await page.getByRole('button', { name: 'Enter the wood' }).click();
  await page.keyboard.down('d'); await page.waitForTimeout(600); await page.keyboard.up('d');
  await page.keyboard.press('Space'); await page.waitForTimeout(100); await page.keyboard.press('j');
  await page.screenshot({ path: 'artifacts/jumping.png' });
} finally { await browser.close(); }
