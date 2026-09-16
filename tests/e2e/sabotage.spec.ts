import { test, expect } from '@playwright/test';
test('journey sabotage teaches its inputs, warns, wrecks and allows continued progress',async({page},info)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{Date.now=()=>140;localStorage.setItem('CapacitorStorage.emberbound.save.v1',JSON.stringify({version:2,hero:'ember',storySeen:['intro-0']}));});
  await page.goto('/');
  // Accelerated normal simulation inputs, no health/position/wave edits. The driver
  // holds milestones for the actual HUD and renderer to present them.
  await page.evaluate(async()=>{
    const engineUrl=performance.getEntriesByType('resource').map(r=>r.name).find(url=>url.includes('/src/engine.ts'))!;
    const {Game}=await import(engineUrl),{playInput}=await import('/scripts/gameplay-policy.ts');
    const original=Game.prototype.update;let frame=0;
    Object.assign(window,{machineStep:0,machineReady:0});
    Game.prototype.update=function(dt,input,partner){
      const w=window as Window & {machineStep:number;machineReady:number};let advanced=false;
      for(let i=0;i<30;i++){
        const m=this.machines[0];
        const milestone=this.wave>m.encounter?5:m.phase==='wrecked'?4:m.phase==='running'?(m.clock>=1.5?3:2):this.wave===m.encounter?1:0;
        if(milestone>w.machineStep){w.machineReady=milestone;return advanced;}
        advanced=original.call(this,1/60,playInput(this,frame++),partner)||advanced;
        if(this.state!=='playing')break;
      }
      return advanced;
    };
  });
  await page.locator('[data-action="start"]').click();
  const ready=()=>page.evaluate(()=>(window as Window & {machineReady:number}).machineReady);
  await expect.poll(ready,{timeout:25000}).toBe(1);await expect(page.locator('#quest-progress')).toContainText('Heavy');
  await page.screenshot({path:`artifacts/sabotage-ready-${info.project.name}.png`});
  for(const [step,name] of [[1,'warning'],[2,'disaster'],[3,'wreck']] as const){
    await page.evaluate(step=>{(window as Window & {machineStep:number}).machineStep=step;},step);
    await expect.poll(ready,{timeout:15000}).toBe(step+1);
    if(step<3)await expect(page.locator('#quest-progress')).toContainText('Jump');
    await page.screenshot({path:`artifacts/sabotage-${name}-${info.project.name}.png`});
  }
  await page.evaluate(()=>{(window as Window & {machineStep:number}).machineStep=4;});
  await expect.poll(ready,{timeout:25000}).toBe(5);await expect(page.locator('#quest-progress')).toContainText('cart');
  expect(errors).toEqual([]);
});
