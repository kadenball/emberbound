import { test, expect, type Page } from '@playwright/test';

async function skipIntro(page:Page){const skip=page.locator('[data-action="story-skip"]');if(await skip.isVisible())await skip.click();}

test('hero choice and settings persist across reloads', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Little bastards/ })).toBeVisible();
  await page.getByRole('button', { name: 'Heroes', exact: true }).click();
  await page.locator('[data-hero="frost"]').click();
  await expect(page.locator('[data-hero="frost"]')).toContainText('SELECTED');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.locator('[data-setting="music"]').uncheck();
  await page.getByRole('button', { name: 'All set' }).click();
  await page.reload();
  await expect(page.locator('.hero-tag')).toContainText('Wren');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.locator('[data-setting="music"]')).not.toBeChecked();
  expect(errors).toEqual([]);
});

test('a real battle moves, casts, pauses, and returns to camp', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Begin adventure' }).click();
  await expect(page.locator('[data-stage="1"]')).toBeDisabled();
  await page.getByRole('button', { name: 'Enter the wood' }).click();await skipIntro(page);
  await expect(page.getByLabel('Battle status')).toBeVisible();
  await page.keyboard.down('d'); await page.waitForTimeout(850); await page.keyboard.up('d');
  await expect(page.locator('#quest-progress')).toContainText('Heavy to launch');
  await page.keyboard.press('k');
  await expect(page.locator('#mana-label')).not.toHaveText('100 GUTS · POWER 36');
  await page.keyboard.down('j'); await page.waitForTimeout(500); await page.keyboard.up('j');
  await page.getByRole('button', { name: 'Pause game' }).click();
  await expect(page.getByRole('heading', { name: 'A moment by the fire.' })).toBeVisible();
  await page.getByRole('button', { name: 'Keep adventuring' }).click();
  await expect(page.getByLabel('Battle status')).toBeVisible();
  await page.getByRole('button', { name: 'Pause game' }).click();
  await page.getByRole('button', { name: 'Return to camp' }).click();
  await expect(page.getByRole('heading', { name: /Little bastards/ })).toBeVisible();
  expect(errors).toEqual([]);
});

test('all chapter layouts fit portrait and landscape without horizontal overflow', async ({ page }) => {
  await page.goto('/');
  for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport);
    await page.getByRole('button', { name: 'Adventure', exact: true }).click();
    await expect(page.locator('.stage-card')).toHaveCount(12);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(page.getByRole('button', { name: 'Enter the wood' })).toBeEnabled();
  }
});

test('touch controls cast magic on a mobile viewport', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'desktop', 'Touch devices only');
  await page.goto('/'); await page.locator('[data-action="start"]').click();await skipIntro(page);
  await expect(page.locator('#touch')).toBeVisible();
  await page.locator('#magic').tap();
  await expect(page.locator('#mana-label')).not.toHaveText('100 GUTS · POWER 36');
  await expect(page.locator('#magic')).not.toHaveClass(/pressed/);
});

test('Android supports simultaneous movement and attack touches', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== 'android', 'Chromium native multi-touch protocol');
  await page.goto('/'); await page.locator('[data-action="start"]').click();await skipIntro(page);
  const stick = (await page.locator('#stick').boundingBox())!, attack = (await page.locator('#attack').boundingBox())!;
  const session = await context.newCDPSession(page);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [
    { x: stick.x + stick.width * .9, y: stick.y + stick.height / 2, id: 1 },
    { x: attack.x + attack.width / 2, y: attack.y + attack.height / 2, id: 2 }
  ] });
  await page.waitForTimeout(1200);
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(page.locator('#quest-progress')).toContainText('Heavy to launch');
  await expect(page.locator('#attack')).not.toHaveClass(/pressed/);
});

test('Space jumps without triggering a ground attack and returns to the ground', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/'); await page.locator('[data-action="start"]').click();await skipIntro(page);
  await page.keyboard.press('Space');
  await expect(page.locator('#air-status')).toContainText('LIGHT: JUGGLE');
  await expect(page.locator('#air-status')).toContainText('HEAVY →');
  await page.keyboard.press('Space'); await page.keyboard.press('j');
  await expect(page.locator('#air-status')).toContainText('LIGHT: JUGGLE');
  await expect(page.locator('#air-status')).toContainText('HEAVY →');
  expect(errors).toEqual([]);
});

test('mobile jump button works alongside movement and stays inside the screen', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name === 'desktop', 'Mobile controls only');
  await page.goto('/'); await page.locator('[data-action="start"]').click();await skipIntro(page);
  const jump = page.getByRole('button', { name: 'Jump', exact: true });
  await expect(jump).toBeVisible();
  const box = (await jump.boundingBox())!, viewport = page.viewportSize()!;
  expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
  if (testInfo.project.name === 'android') {
    const stick = (await page.locator('#stick').boundingBox())!, session = await context.newCDPSession(page);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [
      { x: stick.x + stick.width * .9, y: stick.y + stick.height / 2, id: 1 },
      { x: box.x + box.width / 2, y: box.y + box.height / 2, id: 2 }
    ] });
    await expect(page.locator('#air-status')).toContainText('LIGHT: JUGGLE');
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  } else { await jump.tap(); await expect(page.locator('#air-status')).toContainText('LIGHT: JUGGLE'); }
  await expect(page.locator('#air-status')).toContainText('HEAVY →');
  await expect(jump).not.toHaveClass(/pressed/);
});

test('a real weapon stash equips its find and camp explains the new systems', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/'); await page.locator('[data-action="start"]').click();await skipIntro(page);
  await page.keyboard.down('j');
  await expect(page.locator('#weapon-status')).toHaveText('Pan of poor choices');
  await page.keyboard.up('j');
  await page.getByRole('button', { name: 'Pause game' }).click();
  await page.getByRole('button', { name: 'Return to camp' }).click();
  await page.getByRole('button', { name: 'Back-alley surgery', exact: true }).click();
  await page.getByRole('button', { name: 'Armory & combos' }).click();
  await expect(page.locator('.weapon-card')).toHaveCount(8);
  // Quitting a live battle forfeits its unbanked weapon, as the pause menu explains.
  await expect(page.locator('[data-weapon="pan"]')).toBeDisabled();
  await expect(page.locator('.combo-card').filter({ hasText: 'Spin of shame' })).toContainText('UNLOCKS AT LEVEL 3');
  await page.getByRole('button', { name: 'Heroes', exact: true }).click();
  await page.getByRole('button', { name: 'Meet the local weirdos' }).click();
  await expect(page.locator('.bestiary-card')).toHaveCount(9);
  expect(errors).toEqual([]);
});

test('old campaign saves migrate into paired journey and boss victories', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('CapacitorStorage.emberbound.save.v1', JSON.stringify({ version: 1, hero: 'ember', gold: 150, xp: 450, unlocked: 2, best: [3, 2, 0] })));
  await page.goto('/'); await page.getByRole('button', { name: 'Adventure', exact: true }).click();
  await expect(page.locator('[data-stage="4"]')).toBeEnabled(); await expect(page.locator('[data-stage="5"]')).toBeDisabled();
  await expect(page.locator('.crown-progress .recovered')).toHaveCount(2);
});

test('saved weapons can be equipped and persist into another battle', async ({ page }) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem('equipment-fixture')) return;
    localStorage.setItem('CapacitorStorage.emberbound.save.v1', JSON.stringify({ version: 2, hero: 'ember', gold: 150, xp: 450, unlocked: 4, weapons: ['starter', 'pan', 'popsicle'], equipped: 'pan' }));
    sessionStorage.setItem('equipment-fixture', '1');
  });
  await page.goto('/'); await page.getByRole('button', { name: 'Back-alley surgery', exact: true }).click();
  await page.getByRole('button', { name: 'Armory & combos' }).click();
  await page.locator('[data-weapon="popsicle"]').click();
  await expect(page.locator('.weapon-card.equipped')).toContainText('Brain-stick');
  await expect(page.locator('.combo-card').filter({ hasText: 'Spin of shame' })).toContainText('✓ UNLOCKED');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('CapacitorStorage.emberbound.save.v1')!).equipped)).toBe('popsicle');
  await page.reload(); await page.locator('[data-action="start"]').click();await skipIntro(page);
  await expect(page.locator('#weapon-status')).toHaveText('Brain-stick'); await expect(page.locator('#combat-level')).toHaveText('3');
});

test('a weapon found during a real run is banked when defeat is accepted', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Real-time defeat and banking flow; mobile storage is covered separately');
  await page.goto('/'); await page.locator('[data-action="start"]').click();await skipIntro(page);
  await page.keyboard.down('j'); await expect(page.locator('#weapon-status')).toHaveText('Pan of poor choices'); await page.keyboard.up('j');
  await page.keyboard.down('d'); await page.waitForTimeout(1700); await page.keyboard.up('d');
  await expect(page.getByRole('heading', { name: 'Restuff. Get even.' })).toBeVisible({ timeout: 35000 });
  await expect(page.locator('.loss-loot')).toContainText('Pan of poor choices');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('CapacitorStorage.emberbound.save.v1')!).weapons)).not.toContain('pan');
  await page.locator('[data-action="cash-out"]').click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('CapacitorStorage.emberbound.save.v1')!).gold)).toBe(0);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('CapacitorStorage.emberbound.save.v1')!).weapons)).toContain('pan');
  await page.reload(); await page.locator('[data-action="start"]').click();await skipIntro(page);
  await expect(page.locator('#weapon-status')).toHaveText('Pan of poor choices');
});

test('local party selection exposes independent second-player controls', async ({page}) => {
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await page.getByRole('button',{name:'Begin adventure'}).click();
  await page.getByRole('button',{name:/Bring a friend/}).click();await page.locator('[data-partner="frost"]').click();
  await page.getByRole('button',{name:'Party ready'}).click();await page.locator('[data-action="start"]').click();await skipIntro(page);
  await expect(page.locator('#partner-hud')).toContainText('P2 Wren');
  await page.keyboard.press('Numpad3');await expect(page.locator('#partner-hud')).not.toContainText('100 GUTS');
  await expect(page.locator('#mana-label')).toHaveText('100 GUTS · POWER 36');
  await page.getByRole('button',{name:'Pause game'}).click();await expect(page.getByRole('button',{name:'Keep adventuring'})).toBeVisible();expect(errors).toEqual([]);
});

test('heavy is a reachable touch control and launches a distinct move',async({page},testInfo)=>{
  await page.goto('/');await page.locator('[data-action="start"]').click();await skipIntro(page);
  if(testInfo.project.name!=='desktop'){
    for(const id of ['jump','magic','dodge','heavy','attack']){
      const box=(await page.locator(`#${id}`).boundingBox())!,v=page.viewportSize()!;
      expect(box.width).toBeGreaterThanOrEqual(44);expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(v.width);expect(box.y+box.height).toBeLessThanOrEqual(v.height);
    }
    const boxes = await Promise.all(['jump','magic','dodge','heavy','attack'].map(id=>page.locator(`#${id}`).boundingBox()));
    for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i]!,b=boxes[j]!;expect(a.x+a.width<=b.x||b.x+b.width<=a.x||a.y+a.height<=b.y||b.y+b.height<=a.y).toBe(true);}
    await page.locator('#heavy').tap();await expect(page.locator('#heavy')).not.toHaveClass(/pressed/);
  }else await page.keyboard.press('h');
  await expect(page.locator('#weapon-status')).toHaveText('Pan of poor choices');
});

test('Madame practice is accessible without unlocking the campaign',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'Begin adventure'}).click();await page.getByRole('button',{name:'Try Madame’s boss fight'}).click();
  await expect(page.locator('.quest-hud')).toContainText('CHAPTER 6');
  await page.getByRole('button',{name:'Pause game'}).click();await page.getByRole('button',{name:'Return to camp'}).click();
  await page.getByRole('button',{name:'Begin adventure'}).click();await expect(page.locator('[data-stage="5"]')).toBeDisabled();
});

test('one controller belongs to P2 and holding Start with two pads pauses once',async({page})=>{
  await page.addInitScript(()=>{
    const make=(index:number)=>({index,connected:true,mapping:'standard',axes:[0,0],buttons:Array.from({length:16},()=>({pressed:false,touched:false,value:0}))});
    const state={pads:[make(0)]};Object.defineProperty(navigator,'getGamepads',{value:()=>state.pads});(window as unknown as {padTest:typeof state}).padTest=state;
  });
  await page.goto('/');await page.getByRole('button',{name:'Begin adventure'}).click();await page.getByRole('button',{name:/Bring a friend/}).click();await page.locator('[data-partner="frost"]').click();await page.getByRole('button',{name:'Party ready'}).click();await page.locator('[data-action="start"]').click();await skipIntro(page);
  await page.evaluate(()=>{(window as any).padTest.pads[0].buttons[3].pressed=true;});
  await expect(page.locator('#partner-hud')).not.toContainText('100 GUTS');await expect(page.locator('#mana-label')).toHaveText('100 GUTS · POWER 36');
  await page.evaluate(()=>{const s=(window as any).padTest;s.pads[0].buttons[3].pressed=false;s.pads.push({...s.pads[0],index:1,buttons:Array.from({length:16},()=>({pressed:false}))});s.pads[0].buttons[9].pressed=true;});
  await expect(page.getByRole('button',{name:'Keep adventuring'})).toBeVisible();await page.waitForTimeout(350);await expect(page.getByRole('button',{name:'Keep adventuring'})).toBeVisible();
});


test('fighting styles unlock, persist, and appear in the battle HUD',async({page})=>{
  await page.addInitScript(()=>{if(sessionStorage.getItem('style-fixture'))return;localStorage.setItem('CapacitorStorage.emberbound.save.v1',JSON.stringify({version:2,xp:900,hero:'ember',unlocked:0,weapons:['starter'],equipped:'starter',upgrades:{strength:0,vitality:0,spirit:0}}));sessionStorage.setItem('style-fixture','1');});
  await page.goto('/');await page.getByRole('button',{name:'Back-alley surgery',exact:true}).click();await page.getByRole('button',{name:'Armory & combos'}).click();
  await expect(page.locator('.style-card')).toHaveCount(3);await page.locator('[data-style="hexer"]').click();
  await page.getByRole('button',{name:/Try it on someone/}).click();await page.locator('[data-action="start"]').click();await skipIntro(page);await expect(page.locator('#style-status')).toContainText('Hexer');
  await page.keyboard.press('k');await expect(page.locator('#air-status')).toContainText('ELEMENTAL FINISHER');
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('CapacitorStorage.emberbound.save.v1')!).style)).toBe('hexer');
  await page.reload();await page.getByRole('button',{name:'Adventure',exact:true}).click();await page.locator('[data-action="start"]').click();await page.getByRole('button',{name:'Start new adventure',exact:true}).click();await skipIntro(page);await expect(page.locator('#style-status')).toContainText('Hexer');
});

test('new fighters can inspect later techniques without selecting a locked style',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'Back-alley surgery',exact:true}).click();await page.getByRole('button',{name:'Armory & combos'}).click();
  await expect(page.locator('[data-style="acrobat"]')).toBeDisabled();await expect(page.locator('.style-card').filter({hasText:'Acrobat'})).toContainText('LV 8');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});


test('surgery explains the boss permit and FILTH rules survive a narrow layout',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('CapacitorStorage.emberbound.save.v1',JSON.stringify({version:2,gold:9000,upgrades:{strength:1,vitality:1,spirit:1}})));
 await page.goto('/');await page.getByRole('button',{name:'Back-alley surgery',exact:true}).click();
 await expect(page.locator('[data-upgrade="strength"]')).toBeDisabled();await expect(page.locator('[data-upgrade="strength"]')).toContainText('Beat another boss');
 await page.getByRole('button',{name:'Armory & combos'}).click();await expect(page.locator('.filth-manifesto')).toContainText('MELTDOWN');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.getByRole('button',{name:/Try it on someone/}).click();await page.locator('[data-action="start"]').click();await skipIntro(page);await expect(page.locator('#filth-label')).toHaveText('FILTH 0% · MIX MOVES');
});

test('the supplied menu track plays after a gesture, obeys Music, and stops in battle',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Heroes',exact:true}).click();
 await expect.poll(()=>page.locator('#menu-music').evaluate((el:HTMLAudioElement)=>!el.paused && el.currentTime>0)).toBe(true);
 expect(await page.locator('#menu-music').evaluate((el:HTMLAudioElement)=>el.loop)).toBe(true);
 await page.getByRole('button',{name:'Settings',exact:true}).click();await page.locator('[data-setting="music"]').uncheck();
 await expect.poll(()=>page.locator('#menu-music').evaluate((el:HTMLAudioElement)=>el.paused)).toBe(true);
 await page.locator('[data-setting="music"]').check();await expect.poll(()=>page.locator('#menu-music').evaluate((el:HTMLAudioElement)=>!el.paused)).toBe(true);
 await page.getByRole('button',{name:'All set'}).click();await page.getByRole('button',{name:'Adventure',exact:true}).click();await page.locator('[data-action="start"]').click();await skipIntro(page);
 await expect.poll(()=>page.locator('#menu-music').evaluate((el:HTMLAudioElement)=>el.paused)).toBe(true);
 await expect.poll(()=>page.locator('#chapter-music').evaluate((el:HTMLAudioElement)=>!el.paused&&el.currentTime>0)).toBe(true);
 await page.getByRole('button',{name:'Pause game'}).click();await page.getByRole('button',{name:'Return to camp'}).click();
 await expect.poll(()=>page.locator('#menu-music').evaluate((el:HTMLAudioElement)=>!el.paused)).toBe(true);
});


test('new chapter story advances, skips, persists, and can be replayed without starting a fight',async({page})=>{
 await page.goto('/');await page.locator('[data-action="start"]').click();await expect(page.locator('.comic-scene')).toBeVisible();
 await expect(page.locator('.speech')).toContainText('stuffing tax');await page.locator('[data-action="story-next"]').click();await expect(page.locator('.speech')).toContainText('king problem');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.locator('[data-action="story-skip"]').click();await expect(page.getByLabel('Battle status')).toBeVisible();
 await page.reload();await page.getByRole('button',{name:'Adventure',exact:true}).click();await page.locator('[data-action="start"]').click();await page.getByRole('button',{name:'Start new adventure',exact:true}).click();await expect(page.getByLabel('Battle status')).toBeVisible();await expect(page.locator('.comic-scene')).toHaveCount(0);
 await page.getByRole('button',{name:'Pause game'}).click();await page.getByRole('button',{name:'Return to camp'}).click();await page.getByRole('button',{name:'Adventure',exact:true}).click();
 await page.locator('[data-action="story-replay"]').click();await expect(page.locator('.comic-scene')).toBeVisible();await page.locator('[data-action="story-skip"]').click();await expect(page.locator('.stage-card')).toHaveCount(12);
});

test('every chapter plays a user-selected local recording, with ten distinct songs',async({page},info)=>{
 test.skip(info.project.name!=='desktop','All chapters decode once; transport is exercised on every platform.');
 await page.goto('/');const result=await page.evaluate(async()=>{
  const {CHAPTER_MUSIC}=await import('/src/soundtrack.ts');const context=new AudioContext();const checks=[];
  if(new Set(CHAPTER_MUSIC.map(s=>s.file)).size!==10)throw new Error('Expected all ten user songs');
  for(const score of CHAPTER_MUSIC){const response=await fetch(score.file);const decoded=await context.decodeAudioData(await response.arrayBuffer());checks.push({duration:decoded.duration,channels:decoded.numberOfChannels});}
  await context.close();return checks;
 });expect(result).toHaveLength(12);for(const r of result){expect(r.duration).toBeGreaterThan(30);expect(r.channels).toBe(2);}
});


test('real defeat offers a readable counter and an immediate fight retry without banking',async({page},info)=>{
 test.setTimeout(90000);
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/');await page.locator('[data-action="start"]').click();await skipIntro(page);
 await page.keyboard.down('d');await page.waitForTimeout(650);await page.keyboard.up('d');
 await expect(page.getByLabel('Defeat report')).toBeVisible({timeout:55000});
 await expect(page.locator('.counter-note')).toContainText('pounc');
 await expect(page.locator('.checkpoint-detail')).toContainText('120 stuffing');
 const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('CapacitorStorage.emberbound.save.v1')!));
 if(info.project.name==='desktop')await page.keyboard.press('Enter');else await page.locator('[data-action="retry-fight"]').tap();
 await expect(page.getByLabel('Battle status')).toBeVisible();await expect(page.locator('#wave-banner')).toContainText('TAKE 2');
 const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('CapacitorStorage.emberbound.save.v1')!));expect({...after,resume:null}).toEqual({...before,resume:null});
 await expect.poll(()=>page.evaluate(()=>JSON.parse(JSON.parse(localStorage.getItem('CapacitorStorage.emberbound.save.v1')!).resume).retries)).toBe(1);
 await page.getByRole('button',{name:'Pause game'}).click();await page.getByRole('button',{name:'Return to camp'}).click();
 expect(errors).toEqual([]);
});
