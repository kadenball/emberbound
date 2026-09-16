import {test,expect} from '@playwright/test';
test('the king visibly delegates protection, then loses it when the player clears his staff',async({page},info)=>{
 await page.addInitScript(()=>{Date.now=()=>140;localStorage.setItem('CapacitorStorage.emberbound.save.v1',JSON.stringify({version:2,hero:'ember',xp:9000,gold:0,unlocked:11,best:Array.from({length:12},(_,i)=>i<11?1:0),weapons:['starter','pan','fork'],equipped:'fork',upgrades:{strength:4,vitality:4,spirit:4},storySeen:['intro-11']}));});
 await page.goto('/');await page.evaluate(async()=>{
  const engineUrl=performance.getEntriesByType('resource').map(r=>r.name).find(url=>url.includes('/src/engine.ts'))!;
  const {Game,idleInput}=await import(engineUrl),{playInput}=await import('/scripts/gameplay-policy.ts');
  const update=Game.prototype.update;let frame=0,seen=false,released=false;
  (window as any).royal={advance:false,phase:''};
  Game.prototype.update=function(dt,input,partner){
   const state=(window as any).royal;
   if(state.phase&&!state.advance)return false;
   if(this.bossMoment){if(this.bossMoment.clock>.5)this.skipBossMoment();return update.call(this,1/60,idleInput(),partner);}
   for(let i=0;i<20;i++){
    update.call(this,1/60,playInput(this,frame++),partner);
    const king=this.enemies.find(e=>e.kind==='boss'&&e.hp>0);
    if(king?.decree&&!seen){seen=true;state.phase='protected';state.advance=false;return true;}
    if(seen&&king&&!king.decree&&!released){released=true;state.phase='exposed';state.advance=false;return true;}
    if(this.bossMoment||this.state!=='playing')break;
   }return true;
  };
 });
 await page.locator('[data-action="start"]').click();
 await expect.poll(()=>page.evaluate(()=>(window as any).royal.phase),{timeout:25000}).toBe('protected');
 await expect(page.locator('#boss-state')).toContainText('CLEAR STAFF');
 await page.screenshot({path:`artifacts/royal-protected-${info.project.name}.png`});
 await page.evaluate(()=>(window as any).royal.advance=true);
 await expect.poll(()=>page.evaluate(()=>(window as any).royal.phase),{timeout:25000}).toBe('exposed');
 await expect(page.locator('#boss-state')).toContainText(/OPENING|RETURNED TO SENDER/);
 await page.screenshot({path:`artifacts/royal-exposed-${info.project.name}.png`});
});
