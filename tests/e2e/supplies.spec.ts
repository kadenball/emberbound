import {test,expect} from '@playwright/test';
const key='CapacitorStorage.emberbound.save.v1';
test('an optional booth warns, closes, pays once and survives a real save/reload',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{Date.now=()=>140;});await page.goto('/');
 await page.evaluate(async()=>{
  const url=performance.getEntriesByType('resource').map(r=>r.name).find(url=>url.includes('/src/engine.ts'))!;
  const {Game}=await import(url),{supplyInput}=await import('/scripts/supply-policy.ts'),{trapState}=await import('/src/setpieces.ts'),update=Game.prototype.update;
  const probe={want:'warning',paused:false,phase:'',frame:0,id:-1,gold:0,hp:0,maxHp:0,afterGold:0,afterHp:0};(window as any).supplyProbe=probe;
  Game.prototype.update=function(dt,input,partner){
   if(probe.paused)return false;let advanced=false;
   for(let i=0;i<20&&this.state==='playing';i++){
    const trap=this.setpieces.find(t=>t.road),s=trapState(trap);
    const near=Math.abs(this.player.x-trap.x)<220;
    const stop=probe.want==='warning'&&near&&trap.clock>.2&&s.warning||probe.want==='active'&&near&&s.active||probe.want==='claimed'&&trap.disabled;
    if(stop){probe.paused=true;probe.phase=probe.want;probe.id=trap.id;if(probe.want==='warning'){probe.gold=this.gold;probe.hp=this.player.hp;probe.maxHp=this.player.maxHp;}if(probe.want==='claimed'){probe.afterGold=this.gold;probe.afterHp=this.player.hp;}return advanced;}
    advanced=update.call(this,1/60,supplyInput(this,probe.frame++,'read'),partner)||advanced;
   }return advanced;
  };
 });
 await page.locator('[data-action="start"]').click();await page.locator('[data-action="story-skip"]').click();
 for(const phase of ['warning','active','claimed']){
  if(phase!=='warning')await page.evaluate(phase=>{const p=(window as any).supplyProbe;p.want=phase;p.paused=false;},phase);
  await expect.poll(()=>page.evaluate(()=>(window as any).supplyProbe.phase),{timeout:25000}).toBe(phase);
  await page.screenshot({path:`artifacts/supply-${phase}-${info.project.name}.png`});
 }
 const probe=await page.evaluate(()=>(window as any).supplyProbe);
 expect(probe.afterGold-probe.gold).toBe(25);expect(probe.afterHp).toBe(Math.min(probe.hp+25,probe.maxHp));
 await expect.poll(()=>page.evaluate(({key,id})=>{const s=JSON.parse(localStorage.getItem(key)!);return s.resume?JSON.parse(s.resume).snapshot.setpieces.find(t=>t.id===id)?.disabled:false;},{key,id:probe.id})).toBe(true);
 const entry=await page.evaluate(key=>JSON.parse(JSON.parse(localStorage.getItem(key)!).resume),key);
 await page.reload();await page.getByRole('button',{name:'Continue the mess'}).click();await expect(page.getByRole('button',{name:'Keep adventuring'})).toBeVisible();
 const restored=await page.evaluate(key=>JSON.parse(JSON.parse(localStorage.getItem(key)!).resume),key);
 expect(restored.snapshot.gold).toBe(entry.snapshot.gold);expect(restored.snapshot.players[0].hp).toBe(entry.snapshot.players[0].hp);expect(restored.snapshot.setpieces.find(t=>t.id===probe.id).disabled).toBe(true);
 expect(restored.snapshot.props.find(p=>p.kind==='chest'&&p.hazard===probe.id).active).toBe(true);expect(errors).toEqual([]);
});
