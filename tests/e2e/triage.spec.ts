import { test, expect } from '@playwright/test';
test('a real laundry fight shows a locked stitch and the mixed player interrupts it',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 // Earned chapter-entry profile from the 0.14 audit. The driver only supplies inputs.
 // Wait for a nearby cast: a distant first cast may validly break by patient separation.
 await page.addInitScript(()=>{Date.now=()=>140;localStorage.setItem('CapacitorStorage.emberbound.save.v1',JSON.stringify({version:2,hero:'ember',xp:2870,unlocked:4,equipped:'popsicle',weapons:['starter','pan','popsicle'],upgrades:{vitality:3,strength:3,spirit:3},storySeen:['intro-4']}));});
 await page.goto('/');
 await page.evaluate(async()=>{
  const url=performance.getEntriesByType('resource').map(r=>r.name).find(url=>url.includes('/src/engine.ts'))!;
  const {Game}=await import(url),{playInput}=await import('/scripts/gameplay-policy.ts'),update=Game.prototype.update;
  const state={release:false,ready:false,cut:false,frame:0,cast:0,hp:0,patient:0};(window as any).triageProbe=state;
  Game.prototype.update=function(dt,input,partner){
   if(state.cut)return false;
   let advanced=false;
   for(let i=0;i<20 && this.state==='playing';i++){
    const jelly=this.enemies.find(e=>e.kind==='healer'&&e.patient!==undefined&&e.windup>.6&&Math.hypot(e.x-this.player.x,e.y-this.player.y)<180);
    if(jelly&&!state.ready){state.ready=true;state.cast=jelly.id;state.hp=jelly.hp;state.patient=jelly.patient!;}
    if(state.ready&&!state.release)return advanced;
    const before=this.enemies.find(e=>e.id===state.cast);
    const channel=before?.patient!==undefined&&before.windup>0,hp=before?.hp;
    advanced=update.call(this,1/60,playInput(this,state.frame++),partner)||advanced;
    const caster=this.enemies.find(e=>e.id===state.cast);
    if(channel&&this.events.includes('snip')&&caster&&caster.patient===undefined&&caster.hp<hp){state.cut=true;return advanced;}
    if(state.cut)return advanced;
   }
   return advanced;
  };
 });
 await page.locator('[data-action="start"]').click();
 await expect.poll(()=>page.evaluate(()=>(window as any).triageProbe.ready),{timeout:25000}).toBe(true);
 await page.screenshot({path:`artifacts/triage-stitch-${info.project.name}.png`});
 await page.evaluate(()=>(window as any).triageProbe.release=true);
 await expect.poll(()=>page.evaluate(()=>(window as any).triageProbe.cut),{timeout:25000}).toBe(true);
 await page.screenshot({path:`artifacts/triage-cut-${info.project.name}.png`});
 expect(errors).toEqual([]);
});

test('the isolated jelly slap has a distinct warning and a real jump avoids it',async({page},info)=>{
 await page.goto('/');
 // Staged isolated-enemy fixture: creates one jelly at the trailhead. The attack,
 // warning, jump input and collision then run through production code.
 await page.evaluate(async()=>{
  const url=performance.getEntriesByType('resource').map(r=>r.name).find(url=>url.includes('/src/engine.ts'))!;
  const {Game}=await import(url),update=Game.prototype.update;
  const probe={ready:false,release:false,checked:false,damage:0,jumped:false};(window as any).slapProbe=probe;
  let spawned=false,medic:any;
  Game.prototype.update=function(dt,input,partner){
   if(!spawned){medic=this.spawn('healer',this.player.x+70,this.player.y);medic.cooldown=0;spawned=true;}
   if(medic.windup>0&&medic.windup<.45&&!probe.ready)probe.ready=true;
   if(probe.ready&&!probe.release || probe.checked)return false;
   const advanced=update.call(this,dt,input,partner);
   if(this.player.z>0)probe.jumped=true;
   if(probe.release&&medic.recovery>0){probe.checked=true;probe.damage=this.player.maxHp-this.player.hp;}
   return advanced;
  };
 });
 await page.locator('[data-action="start"]').click();await page.locator('[data-action="story-skip"]').click();
 await expect.poll(()=>page.evaluate(()=>(window as any).slapProbe.ready)).toBe(true);
 await page.screenshot({path:`artifacts/triage-slap-${info.project.name}.png`});
 await page.keyboard.down('Space');await page.evaluate(()=>(window as any).slapProbe.release=true);
 await expect.poll(()=>page.evaluate(()=>(window as any).slapProbe.checked)).toBe(true);await page.keyboard.up('Space');
 expect(await page.evaluate(()=>(window as any).slapProbe)).toMatchObject({jumped:true,damage:0});
});
