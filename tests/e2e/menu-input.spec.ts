import { test, expect, type Page } from '@playwright/test';

async function setup(page: Page, rich = false) {
 await page.addInitScript(rich => {
  const make = (index: number) => ({ index, connected: true, axes: [0, 0], buttons: Array.from({length:16}, () => ({pressed:false})) });
  (window as any).menuPads = [make(0), make(1)];
  Object.defineProperty(navigator, 'getGamepads', {value: () => (window as any).menuPads});
  if (rich && !sessionStorage.getItem('menu-fixture')) {
   localStorage.setItem('CapacitorStorage.emberbound.save.v1', JSON.stringify({version:2,gold:9000,xp:900,unlocked:11,weapons:['starter','candy'],upgrades:{strength:0,vitality:0,spirit:0}}));
   sessionStorage.setItem('menu-fixture', '1');
  }
 }, rich);
 await page.goto('/'); await expect(page.locator('.home-actions')).toBeVisible();
}
async function hold(page: Page, button: number, pressed: boolean, pad = 0) {
 await page.evaluate(({button, pressed, pad}) => {(window as any).menuPads[pad].buttons[button].pressed = pressed;}, {button, pressed, pad});
 await page.waitForTimeout(80);
}
async function press(page: Page, button: number) { await hold(page,button,true); await hold(page,button,false); }
async function observeCombat(page: Page) {
 await page.evaluate(async () => {
  const url = performance.getEntriesByType('resource').map(r=>r.name).find(url=>url.includes('/src/engine.ts'))!;
  const {Game} = await import(url), update = Game.prototype.update;
  Game.prototype.update = function(dt: number, input: any, partner: any) {
   (window as any).combatProbe = {input:{...input},x:this.player.x,z:this.player.z,mana:this.player.mana};
   if ((window as any).forceDefeat) { (window as any).forceDefeat=false; this.damagePlayer(this.player,1000,this.player.x+20); }
   return update.call(this,dt,input,partner);
  };
 });
}
const saved = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('CapacitorStorage.emberbound.save.v1')!));

test('controller enters chapters and advances chatter once per press; held menu controls cannot fight', async ({page}) => {
 await setup(page); await observeCombat(page);
 await hold(page,0,true); await expect(page.locator('#ui')).toHaveClass('screen-map');
 await page.waitForTimeout(450); await expect(page.locator('#ui')).toHaveClass('screen-map');
 await expect(page.locator('[data-stage="0"]')).toHaveClass(/menu-focus/);
 await hold(page,0,false); await press(page,0); await expect(page.locator('.comic-controls')).toContainText('1 / 7');
 await hold(page,0,true); await page.waitForTimeout(450); await expect(page.locator('.comic-controls')).toContainText('2 / 7');
 await hold(page,0,false);
 for(let i=0;i<5;i++) await press(page,0);
 await expect(page.locator('.comic-controls')).toContainText('7 / 7');
 await hold(page,3,true); await page.evaluate(()=>(window as any).menuPads[0].axes[0]=1); await hold(page,0,true);
 await expect(page.getByLabel('Battle status')).toBeVisible(); await page.waitForTimeout(200);
 expect(await page.evaluate(()=>(window as any).combatProbe.input)).toMatchObject({jump:false,magic:false,attack:false,x:0,y:0});
 await page.evaluate(()=>(window as any).menuPads[0].axes[0]=0); await hold(page,0,false); await hold(page,3,false); await press(page,3);
 await expect(page.locator('#mana-label')).not.toHaveText('100 GUTS · POWER 36');
 await press(page,0); await expect.poll(()=>page.evaluate(()=>(window as any).combatProbe.z)).toBeGreaterThan(0);
});

test('Back walks story pages and cancels the first page without marking it seen', async ({page}) => {
 await setup(page); await press(page,0); await press(page,0); await press(page,0);
 await expect(page.locator('.comic-controls')).toContainText('2 / 7'); await press(page,1);
 await expect(page.locator('.comic-controls')).toContainText('1 / 7'); await press(page,1);
 await expect(page.locator('#ui')).toHaveClass('screen-map');
 expect((await saved(page))?.storySeen ?? []).not.toContain('intro-0');
 await press(page,0); await expect(page.locator('.comic-controls')).toContainText('1 / 7');
});

test('controller changes heroes across redraws, scrolls focus into view and returns through menus', async ({page}, info) => {
 await setup(page);
 await page.getByRole('button',{name:'Heroes',exact:true}).click();
 await press(page,15); await expect(page.locator('[data-hero="frost"]')).toBeFocused();
 await press(page,0); await expect(page.locator('[data-hero="frost"]')).toHaveClass(/selected/);
 await expect(page.locator('[data-hero="frost"]')).toBeFocused();
 await press(page,15); await press(page,0); await expect(page.locator('[data-hero="moss"]')).toHaveClass(/selected/);
 expect((await saved(page)).hero).toBe('moss');
 await page.screenshot({path:`artifacts/controller-heroes-${info.project.name}.png`});
 const box = (await page.locator('[data-hero="moss"]').boundingBox())!;
 expect(box.y).toBeLessThan(page.viewportSize()!.height); expect(box.y+box.height).toBeGreaterThan(0);
 await press(page,1); await expect(page.locator('#ui')).toHaveClass('screen-map');
 await press(page,1); await expect(page.locator('#ui')).toHaveClass('screen-home');
});

test('held and simultaneous confirms buy only one surgery and focus skips unavailable upgrades', async ({page}) => {
 await setup(page,true); await page.getByRole('button',{name:'Back-alley surgery',exact:true}).click();
 await page.evaluate(()=>{for(const p of (window as any).menuPads)p.buttons[0].pressed=true;});
 await expect(page.locator('[data-upgrade="vitality"]')).toBeDisabled(); await page.waitForTimeout(450);
 expect((await saved(page)).upgrades).toEqual({strength:0,vitality:1,spirit:0});
 await expect(page.locator('.menu-focus')).toBeEnabled();
 for(const pad of [0,1]) await hold(page,0,false,pad);
 await page.getByRole('button',{name:'Armory & combos'}).click();
 await press(page,0); await expect(page.locator('[data-style="acrobat"]')).toBeDisabled();
 expect((await saved(page)).style).toBe('acrobat');
 // Native Tab can reach every available weapon and remains compatible with pad confirm.
 for(let i=0;i<20 && await page.locator(':focus').getAttribute('data-weapon')!=='candy';i++) await page.keyboard.press('Tab');
 await expect(page.locator('[data-weapon="candy"]')).toBeFocused(); await press(page,0);
 expect((await saved(page)).equipped).toBe('candy');
 await press(page,1); await expect(page.locator('#ui')).toHaveClass('screen-forge');
});

test('pause settings return safely and solo disconnect pauses; held resume buttons need release', async ({page}) => {
 await setup(page); await observeCombat(page);
 await page.locator('[data-action="start"]').click(); await page.locator('[data-action="story-skip"]').click();
 await press(page,9); await page.getByRole('button',{name:'Settings',exact:true}).click();
 await press(page,0); await expect(page.locator('[data-setting="sound"]')).not.toBeChecked();
 await press(page,1); await expect(page.locator('[data-action="resume"]')).toBeVisible();
 await hold(page,1,true); await expect(page.getByLabel('Battle status')).toBeVisible();
 expect(await page.evaluate(()=>(window as any).combatProbe.input.dodge)).toBe(false);
 await hold(page,1,false); await press(page,1);
 await expect.poll(()=>page.evaluate(()=>(window as any).combatProbe.input.dodge)).toBe(false);
 await page.evaluate(()=>{(window as any).menuPads[0].connected=false;window.dispatchEvent(new Event('gamepaddisconnected'));});
 await expect(page.locator('[data-action="resume"]')).toBeVisible();
 await page.evaluate(()=>{const p=(window as any).menuPads[0];p.connected=true;p.buttons[3].pressed=true;});
 await hold(page,9,true); await page.waitForTimeout(350);
 await expect(page.getByLabel('Battle status')).toBeVisible();
 expect(await page.evaluate(()=>(window as any).combatProbe.input.magic)).toBe(false);
 await hold(page,9,false); await hold(page,3,false); await press(page,3);
 await expect(page.locator('#mana-label')).not.toHaveText('100 GUTS · POWER 36');
 expect((await saved(page)).settings.sound).toBe(false);
});

test('keyboard focus follows Tab; held Space and movement do not leak from story into combat', async ({page}) => {
 await setup(page); await observeCombat(page);
 await page.keyboard.press('Enter'); await page.keyboard.press('Enter');
 await page.keyboard.press('Shift+Tab'); const focused = await page.locator(':focus').getAttribute('data-action');
 await page.waitForTimeout(150); expect(await page.locator(':focus').getAttribute('data-action')).toBe(focused);
 await page.keyboard.down('d'); await page.keyboard.down('Space');
 // Shift+Tab reaches Skip chatter from the default Next button.
 await expect(page.getByLabel('Battle status')).toBeVisible();
 await page.waitForTimeout(200); expect(await page.evaluate(()=>(window as any).combatProbe.input)).toMatchObject({jump:false,x:0});
 await page.keyboard.up('Space'); await page.keyboard.up('d'); await page.keyboard.press('Space');
 await expect.poll(()=>page.evaluate(()=>(window as any).combatProbe.z)).toBeGreaterThan(0);
 await page.keyboard.press('Escape'); await expect(page.locator('[data-action="resume"]')).toBeVisible();
 await page.keyboard.press('p'); await expect(page.getByLabel('Battle status')).toBeVisible();
});

test('defeat Back only selects exit; controller retry preserves the bookmark without jumping', async ({page}) => {
 await setup(page); await observeCombat(page);
 await page.locator('[data-action="start"]').click(); await page.locator('[data-action="story-skip"]').click();
 await page.evaluate(()=>(window as any).forceDefeat=true);
 await expect(page.getByLabel('Defeat report')).toBeVisible(); const before=await saved(page);
 await press(page,1); await expect(page.locator('[data-action="cash-out"]')).toBeFocused();
 await expect(page.getByLabel('Defeat report')).toBeVisible(); expect((await saved(page)).resume).toBe(before.resume);
 await press(page,12); await expect(page.locator('[data-action="retry-fight"]')).toBeFocused();
 await hold(page,0,true); await expect(page.getByLabel('Battle status')).toBeVisible();
 expect(await page.evaluate(()=>(window as any).combatProbe.input.jump)).toBe(false);
 await expect.poll(async()=>JSON.parse((await saved(page)).resume).retries).toBe(1);
});
