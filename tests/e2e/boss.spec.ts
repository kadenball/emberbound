import {test,expect} from '@playwright/test';
// This driver supplies combat inputs to the production simulation in batches.
// It neither edits HP/positions nor skips waves. Scenes wait for their real UI button.
async function driveBoss(page: import('@playwright/test').Page, finale=false) {
 await page.addInitScript(finale=>{
  Date.now=()=>140;
  if(!localStorage.getItem('CapacitorStorage.emberbound.save.v1'))localStorage.setItem('CapacitorStorage.emberbound.save.v1',JSON.stringify(finale?{version:2,hero:'ember',xp:9000,gold:0,unlocked:11,best:Array.from({length:12},(_,i)=>i<11?1:0),weapons:['starter','pan','fork'],equipped:'fork',upgrades:{strength:4,vitality:4,spirit:4},storySeen:['intro-11']}:{version:2,hero:'ember',xp:450,gold:0,unlocked:1,best:[1],weapons:['starter','pan'],equipped:'pan',upgrades:{strength:1,vitality:1,spirit:1},storySeen:['intro-1']}));
 },finale);
 await page.goto('/');
 await page.evaluate(async()=>{
  const engineUrl=performance.getEntriesByType('resource').map(r=>r.name).find(url=>url.includes('/src/engine.ts'))!;
  const {Game,idleInput}=await import(engineUrl),{playInput}=await import('/scripts/gameplay-policy.ts');
  const update=Game.prototype.update;let frame=0;
  Game.prototype.update=function(dt,input,partner){
   if(this.bossMoment&&this.bossMoment.clock<this.bossMoment.duration){
    if(this.bossMoment.clock<this.bossMoment.duration*.65)return update.call(this,1/60,idleInput(),idleInput());
    (window as Window & {bossPoseReady?:string}).bossPoseReady=this.bossMoment.kind;return false;
   }
   (window as Window & {bossPoseReady?:string}).bossPoseReady='';
   let advanced=false;
   for(let i=0;i<50;i++){advanced=update.call(this,1/60,playInput(this,frame++),partner)||advanced;if(this.bossMoment||this.state!=='playing')break;}
   return advanced;
  };
 });
 await page.locator('[data-action="start"]').click();
}
test('boss entrance, breakdown and defeat lead through the real UI to a banked crown tooth',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await driveBoss(page);
 await expect(page.locator('#boss-cue')).toContainText('Sir Burps-a-Lot',{timeout:25000});
 await expect(page.locator('#boss-cue')).toContainText('A kettle with a drinking problem');
 const button=page.locator('[data-action="skip-boss"]');const box=(await button.boundingBox())!,viewport=page.viewportSize()!;expect(box.x).toBeGreaterThanOrEqual(0);expect(box.y+box.height).toBeLessThanOrEqual(viewport.height);
 await expect.poll(()=>page.evaluate(()=>(window as Window & {bossPoseReady?:string}).bossPoseReady)).toBe('entrance');
 await expect(page.locator('#score-cue')).toHaveAttribute('data-scene','entrance');
 await expect.poll(()=>page.locator('#score-cue').evaluate((a:HTMLAudioElement)=>!a.paused&&a.currentTime>0)).toBe(true);
 await page.screenshot({path:`artifacts/boss-entrance-${info.project.name}.png`});await button.click();
 await expect(page.locator('#boss-cue')).toContainText('THE LID HAS LEFT THE CONVERSATION',{timeout:25000});
 await expect.poll(()=>page.evaluate(()=>(window as Window & {bossPoseReady?:string}).bossPoseReady)).toBe('rage');
 await expect(page.locator('#score-cue')).toHaveAttribute('data-scene','rage');
 await page.screenshot({path:`artifacts/boss-rage-${info.project.name}.png`});await button.click();
 await expect(page.locator('#boss-cue')).toContainText('DECaffeinated. DEFEATED.',{timeout:25000});
 const pending=await page.evaluate(()=>JSON.parse(localStorage.getItem('CapacitorStorage.emberbound.save.v1')!));expect(pending.best[1]??0).toBe(0);expect(pending.xp).toBe(450);
 await expect.poll(()=>page.evaluate(()=>(window as Window & {bossPoseReady?:string}).bossPoseReady)).toBe('defeat');
 await expect(page.locator('#score-cue')).toHaveAttribute('data-scene','victory');
 await page.screenshot({path:`artifacts/boss-defeat-${info.project.name}.png`});await button.click();
 await expect(page.locator('.comic-scene')).toBeVisible();await page.locator('[data-action="story-skip"]').click();await expect(page.locator('.loot-result')).toContainText('CROWN TOOTH RECOVERED');
 expect(await page.locator('#menu-music').evaluate((a:HTMLAudioElement)=>a.paused)).toBe(true);
 await expect.poll(()=>page.locator('#chapter-music').evaluate((a:HTMLAudioElement)=>!a.paused)).toBe(true);
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('CapacitorStorage.emberbound.save.v1')!).unlocked)).toBe(2);
 const earned=await page.evaluate(()=>JSON.parse(localStorage.getItem('CapacitorStorage.emberbound.save.v1')!));expect(earned.gold).toBeGreaterThan(100);expect(earned.xp).toBeGreaterThan(450);expect(earned.best[1]).toBeGreaterThan(0);
 await page.getByRole('button',{name:'World map',exact:true}).click();expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('CapacitorStorage.emberbound.save.v1')!).gold)).toBe(earned.gold);expect(errors).toEqual([]);
});

test('the final king leads through all ending dialogue to the crown weapon and durable completion',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await driveBoss(page,true);
 for(const kind of ['entrance','rage','defeat']){
  await expect.poll(()=>page.evaluate(()=>(window as Window & {bossPoseReady?:string}).bossPoseReady),{timeout:25000}).toBe(kind);
  if(kind==='defeat')await page.screenshot({path:`artifacts/finale-defeat-${info.project.name}.png`});
  await page.locator('[data-action="skip-boss"]').click();
 }
 await expect(page.locator('.comic-scene')).toBeVisible();
 for(const line of ['expensive hat','public toilet brush','free dental clinic','suggestion box','right reasons']){
  await expect(page.locator('.speech')).toContainText(line);
  if(line==='right reasons')await page.screenshot({path:`artifacts/finale-story-${info.project.name}.png`});
  await page.locator('[data-action="story-next"]').click();
 }
 await expect(page.locator('.result-modal')).toContainText('You fixed the royal overbite');await expect(page.locator('.loot-result')).toContainText('CROWN TOOTH RECOVERED');
 const completed=await page.evaluate(()=>JSON.parse(localStorage.getItem('CapacitorStorage.emberbound.save.v1')!));expect(completed.best[11]).toBeGreaterThan(0);expect(completed.weapons).toContain('crown');expect(completed.resume).toBeNull();expect(completed.storySeen).toContain('after-11');expect(completed.xp).toBeGreaterThan(9000);
 if(info.project.name!=='desktop'){for(const selector of ['.result-modal>.primary','.loot-result']){const box=(await page.locator(selector).boundingBox())!;expect(box.y).toBeGreaterThanOrEqual(0);expect(box.y+box.height).toBeLessThanOrEqual(page.viewportSize()!.height);}}
 await page.screenshot({path:`artifacts/finale-result-${info.project.name}.png`});await page.getByRole('button',{name:'World map',exact:true}).click();await expect(page.locator('.crown-progress .recovered')).toHaveCount(6);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('CapacitorStorage.emberbound.save.v1')!).gold)).toBe(completed.gold);await page.reload();await expect(page.getByRole('button',{name:'Continue the mess'})).toHaveCount(0);await page.getByRole('button',{name:'Adventure',exact:true}).click();await expect(page.locator('.crown-progress .recovered')).toHaveCount(6);expect(errors).toEqual([]);
});

test('controller handles boss performances, aftermath, rewards and the next chapter',async({page})=>{
 await page.addInitScript(()=>{
  const pad={index:0,connected:true,axes:[0,0],buttons:Array.from({length:16},()=>({pressed:false}))};
  (window as any).scenePad=pad;Object.defineProperty(navigator,'getGamepads',{value:()=>[pad]});
 });
 await driveBoss(page);
 const press=async()=>{
  await page.evaluate(()=>(window as any).scenePad.buttons[0].pressed=true);await page.waitForTimeout(100);
  await page.evaluate(()=>(window as any).scenePad.buttons[0].pressed=false);await page.waitForTimeout(100);
 };
 for(const kind of ['entrance','rage','defeat']){
  await expect.poll(()=>page.evaluate(()=>(window as Window & {bossPoseReady?:string}).bossPoseReady),{timeout:25000}).toBe(kind);
  await press();
 }
 await expect(page.locator('.comic-scene')).toBeVisible();await press();await press();
 await expect(page.locator('.result-modal')).toBeVisible();
 await press();await expect(page.locator('.comic-heading')).toContainText('CHAPTER 3');
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('CapacitorStorage.emberbound.save.v1')!).unlocked)).toBe(2);
});
