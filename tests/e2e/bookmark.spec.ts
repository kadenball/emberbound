import { test, expect, type Page } from '@playwright/test';
const key='CapacitorStorage.emberbound.save.v1';
const profile=(page:Page)=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),key);
async function reachLaterFight(page:Page) {
  await page.addInitScript(key=>{Date.now=()=>140;if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({version:2,hero:'ember',storySeen:['intro-0']}));},key);
  await page.goto('/');
  await page.evaluate(async()=>{
    const url=performance.getEntriesByType('resource').map(r=>r.name).find(url=>url.includes('/src/engine.ts'))!;
    const {Game}=await import(url),{playInput}=await import('/scripts/gameplay-policy.ts');const update=Game.prototype.update;let frame=0;
    Game.prototype.update=function(dt,input,partner){let advanced=false;for(let i=0;i<25 && this.wave<2 && this.state==='playing';i++)advanced=update.call(this,1/60,playInput(this,frame++),partner)||advanced;return advanced;};
  });
  await page.locator('[data-action="start"]').click();
  await expect.poll(async()=>{const save=await profile(page);return save.resume?JSON.parse(save.resume).snapshot.wave:-1;},{timeout:20000}).toBe(2);
}
test('reloading mid-chapter restores its real checkpoint and saved loadout, then Save & quit keeps it',async({page},info)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await reachLaterFight(page);
  const before=await profile(page),entry=JSON.parse(before.resume);
  // A full module/runtime reload, with no explicit pause, quit or test state edits.
  await page.reload();await expect(page.getByRole('button',{name:'Continue the mess'})).toBeVisible();
  await expect(page.getByLabel('Saved adventure')).toContainText('Fight 3 / 9');await expect(page.getByLabel('Saved adventure')).toContainText('Pan of poor choices');
  await page.screenshot({path:`artifacts/bookmark-home-${info.project.name}.png`});
  await page.getByRole('button',{name:'Meet your hero'}).click();await page.locator('[data-hero="frost"]').click();await page.getByRole('button',{name:'Emberbound home'}).click();
  await page.evaluate(async()=>{
    const url=performance.getEntriesByType('resource').map(r=>r.name).find(url=>url.includes('/src/engine.ts'))!;const {Game}=await import(url),exporter=Game.prototype.exportBookmark;
    Game.prototype.exportBookmark=function(){(window as Window & {restored?:unknown}).restored={wave:this.wave,players:this.players.map(p=>({hero:p.hero,hp:p.hp,mana:p.mana,weapon:p.weapon})),gold:this.gold,xp:this.xp};return exporter.call(this);};
  });
  await page.getByRole('button',{name:'Continue the mess'}).click();await expect(page.getByRole('button',{name:'Keep adventuring'})).toBeVisible();
  const restored=await page.evaluate(()=>(window as Window & {restored?:unknown}).restored);
  expect(restored).toEqual({wave:2,players:entry.snapshot.players.map(p=>({hero:p.hero,hp:p.hp,mana:p.mana,weapon:p.weapon})),gold:entry.snapshot.gold,xp:entry.snapshot.xp});
  await expect.poll(async()=>JSON.parse((await profile(page)).resume).retries).toBe(1);
  await page.screenshot({path:`artifacts/bookmark-resume-${info.project.name}.png`});
  await page.getByRole('button',{name:'Pocket the mess'}).click();await expect(page.getByLabel('Saved adventure')).toContainText('Fight 3 / 9');
  const after=await profile(page);expect(after.gold).toBe(before.gold);expect(after.xp).toBe(before.xp);expect(after.hero).toBe('ember');expect(after.resume).not.toBeNull();
  await page.reload();await expect(page.getByRole('button',{name:'Continue the mess'})).toBeVisible();expect(errors).toEqual([]);
});
test('starting another adventure makes the bookmark choice explicit; abandoning removes it',async({page},info)=>{
  await reachLaterFight(page);await page.reload();const before=await profile(page);
  await page.getByRole('button',{name:'Adventure',exact:true}).click();await page.locator('[data-action="start"]').click();
  await expect(page.locator('.resume-choice')).toContainText('drops its unbanked loot');await page.screenshot({path:`artifacts/bookmark-choice-${info.project.name}.png`});
  await page.getByRole('button',{name:'Back to map',exact:true}).click();expect((await profile(page)).resume).toBe(before.resume);
  await page.locator('[data-action="start"]').click();await page.getByRole('button',{name:'Start new adventure',exact:true}).click();await expect(page.getByLabel('Battle status')).toBeVisible();
  await expect.poll(async()=>JSON.parse((await profile(page)).resume).snapshot.wave).toBe(-1);
  await page.getByRole('button',{name:'Pause game'}).click();await page.getByRole('button',{name:'Return to camp',exact:true}).click();await expect.poll(async()=>(await profile(page)).resume).toBeNull();
  await page.reload();await expect(page.getByRole('button',{name:'Continue the mess'})).toHaveCount(0);
});
test('failed storage keeps Save & quit paused and recoverable instead of claiming it saved',async({page})=>{
  await page.goto('/');await page.locator('[data-action="start"]').click();await page.locator('[data-action="story-skip"]').click();await page.getByRole('button',{name:'Pause game'}).click();
  await page.evaluate(key=>{const set=Storage.prototype.setItem;(window as Window & {restoreStorage?:()=>void}).restoreStorage=()=>{Storage.prototype.setItem=set;};Storage.prototype.setItem=function(k,v){if(k===key)throw new DOMException('Storage full','QuotaExceededError');return set.call(this,k,v);};},key);
  await page.getByRole('button',{name:'Pocket the mess'}).click();await expect(page.locator('#toast')).toContainText('Could not save');await expect(page.getByRole('button',{name:'Keep adventuring'})).toBeVisible();await expect(page.getByRole('button',{name:'Pocket the mess'})).toBeEnabled();
  await page.evaluate(()=>(window as Window & {restoreStorage?:()=>void}).restoreStorage?.());await page.getByRole('button',{name:'Pocket the mess'}).click();await expect(page.getByLabel('Saved adventure')).toBeVisible();
});
test('the saved co-op partner returns after a fresh runtime starts',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'Adventure',exact:true}).click();await page.getByRole('button',{name:'Bring a friend'}).click();await page.locator('[data-partner="frost"]').click();await page.getByRole('button',{name:'Party ready'}).click();await page.locator('[data-action="start"]').click();await page.locator('[data-action="story-skip"]').click();
  await page.getByRole('button',{name:'Pause game'}).click();await page.getByRole('button',{name:'Pocket the mess'}).click();await expect(page.getByLabel('Saved adventure')).toContainText('Ash + Wren');await page.reload();
  await page.getByRole('button',{name:'Continue the mess'}).click();await page.getByRole('button',{name:'Keep adventuring'}).click();await expect(page.locator('#partner-hud')).toContainText('P2 Wren');await expect(page.getByLabel('Battle status')).toContainText('Ash');
});
test('a failed profile read cannot overwrite the existing save, and retry can recover it',async({page})=>{
  await page.addInitScript(key=>{
    if(sessionStorage.getItem('read-failure-tested'))return;sessionStorage.setItem('read-failure-tested','yes');
    localStorage.setItem(key,JSON.stringify({version:2,gold:321,xp:900,hero:'moss'}));
    const get=Storage.prototype.getItem;
    (window as Window & {readStored?:()=>string|null}).readStored=()=>get.call(localStorage,key);
    Storage.prototype.getItem=function(k){if(k===key)throw new DOMException('Temporarily unavailable','SecurityError');return get.call(this,k);};
  },key);
  await page.goto('/');await expect(page.locator('.save-error')).toContainText('has not been replaced');
  expect(await page.evaluate(()=>JSON.parse((window as Window & {readStored:()=>string}).readStored()).gold)).toBe(321);
  await page.getByRole('button',{name:'Try again',exact:false}).click();await expect(page.getByRole('button',{name:'Begin adventure'})).toBeVisible();expect((await profile(page)).gold).toBe(321);
});
