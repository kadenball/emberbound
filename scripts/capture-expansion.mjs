import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:4173'); await page.locator('h1').waitFor();
  await page.getByRole('button', { name: 'The forge', exact: true }).click();
  await page.getByRole('button', { name: 'Armory & combos' }).click();
  await page.screenshot({ path: 'artifacts/armory.png' });
  await page.getByRole('button', { name: 'Heroes', exact: true }).click();
  await page.getByRole('button', { name: 'Meet the local weirdos' }).click();
  await page.screenshot({ path: 'artifacts/field-guide.png' });
  // Developer-only scene inspection. Real-input campaign simulations cover progression.
  const scenes = await page.evaluate(async () => {
    const { Renderer } = await import('/src/render.ts'); const { Game } = await import('/src/engine.ts');
    const { WEAPONS } = await import('/src/content.ts');
    const canvas = document.createElement('canvas'), renderer = new Renderer(canvas), results = [];
    for (let region = 0; region < 6; region++) {
      const stage = region * 2, g = new Game('ember', stage, { vitality: 0, strength: 0, spirit: 0 }, 7, { xp: 1600, weapon: WEAPONS[region + 1].id });
      g.player.x = 2260; g.player.y = 460; g.wave = 2;
      for (let i = 0; i < 4; i++) g.spawn(['shield', 'charger', 'healer', 'bomber'][i], 2460 + i * 100, 380 + i % 3 * 60);
      renderer.camera = 1740;
      const times = [];
      for (let i = 0; i < 40; i++) {
        await new Promise(requestAnimationFrame); const start = performance.now(); renderer.draw(g, 'ember', stage, 3, false); if (i > 5) times.push(performance.now() - start);
      }
      times.sort((a, b) => a - b);
      results.push({ region, median: times[17], p95: times[32], image: canvas.toDataURL() });
      const boss = new Game('ember', stage + 1, { vitality: 0, strength: 0, spirit: 0 }, 7, { xp: 1600, weapon: WEAPONS[region + 1].id });
      boss.player.x = 2330; boss.player.y = 450; const e = boss.spawn('boss', 2570, 455); e.windup = .7; e.targetX = 2330; e.targetY = 450;
      renderer.camera = 1790; renderer.draw(boss, 'ember', stage + 1, 3, false);
      results.push({ region, boss: true, image: canvas.toDataURL() });
    }
    return results;
  });
  for (const item of scenes) { await writeFile(`artifacts/region-${item.region + 1}${item.boss ? '-boss' : ''}.png`, Buffer.from(item.image.split(',')[1], 'base64')); delete item.image; }
  await writeFile('artifacts/expansion-render-timings.json', JSON.stringify({ note: 'Headless desktop draw submission timings, not physical device FPS.', scenes, errors }, null, 2));
  console.log(JSON.stringify({ scenes, errors }));
} finally { await browser.close(); }
