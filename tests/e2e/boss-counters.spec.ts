import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const profiles=JSON.parse(readFileSync('docs/COMBAT-AUDIT-0.12.json','utf8')).profiles;
for(const [stage,kind] of [[3,'ice'],[7,'jaw'],[9,'forks'],[11,'stamp']] as const)test(`${kind} warning and impact render during an input-driven boss fight`,async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 const profile=profiles.find((p:{hero:string;stage:number})=>p.hero==='ember'&&p.stage===stage);
 await page.addInitScript(p=>{Date.now=()=>140;localStorage.setItem('CapacitorStorage.emberbound.save.v1',JSON.stringify({version:2,hero:p.hero,xp:p.xp,gold:0,unlocked:p.stage,best:Array.from({length:12},(_,i)=>i<p.stage?1:0),weapons:p.weapons,equipped:p.weapon,upgrades:p.upgrades,storySeen:[`intro-${p.stage}`]}));},profile);
 await page.goto('/');
 await page.evaluate(async kind=>{
  const url=performance.getEntriesByType('resource').map(r=>r.name).find(u=>u.includes('/src/engine.ts'))!;
  const {Game}=await import(url),{playInput}=await import('/scripts/gameplay-policy.ts'),{raisedForks}=await import('/src/danger-shapes.ts');
  const update=Game.prototype.update;let frame=0,warning=false,impact=false,serving=false,opening=false;
  const w=window as Window & {counterPose?:string;releaseCounter?:boolean};
  Game.prototype.update=function(dt,input,partner){
   if(w.counterPose&&!w.releaseCounter)return false;
   w.counterPose='';w.releaseCounter=false;
   let advanced=false;
   for(let i=0;i<40;i++){
    const steering=playInput(this,frame++);
    advanced=update.call(this,1/60,steering,partner)||advanced;
    const boss=this.enemies.find(e=>e.kind==='boss'&&e.hp>0);
    const hazard=this.dangers.find(d=>d.kind===kind);
    const warned=kind==='forks'?boss&&raisedForks(boss)&&boss.bossState==='windup'&&boss.bossTimer<.55:hazard&&!hazard.resolved&&hazard.timer<.4;
    const hit=kind==='forks'?boss&&raisedForks(boss)&&boss.bossState==='spin'&&boss.bossTimer<1.5:hazard?.resolved;
    if(kind==='jaw'&&!serving&&boss?.bossState==='volley'&&this.dangers.some(d=>d.kind==='blast'&&!d.resolved&&d.timer<.2)){serving=true;w.counterPose='sweets';break;}
    if(kind==='jaw'&&impact&&!opening&&boss?.bossState==='recover'&&boss.bossTimer<1.3&&!this.bossMoment){opening=true;w.counterPose='opening';break;}
    if(!warning&&warned){warning=true;w.counterPose='warning';break;}
    if(warning&&!impact&&hit){impact=true;w.counterPose='impact';break;}
    if(this.state!=='playing')break;
   }
   return advanced;
  };
 },kind);
 await page.locator('[data-action="start"]').click();
 for(const pose of kind==='jaw'?['sweets','warning','impact','opening']:['warning','impact']){
  await expect.poll(()=>page.evaluate(()=>(window as Window & {counterPose?:string}).counterPose),{timeout:25000}).toBe(pose);
  if(pose==='sweets')await expect(page.locator('#boss-state')).toContainText('LOW SWEETS! JUMP');
  if(pose==='opening')await expect(page.locator('#boss-state')).toContainText('RECOVERING');
  if(pose==='warning')await expect(page.locator('#boss-state')).toContainText('CHANGE LANES');
  const combo=page.locator('#combo-display');if(await combo.textContent()){const box=(await combo.boundingBox())!;expect(box.y+box.height).toBeLessThan(page.viewportSize()!.height*.33);}
  await page.screenshot({path:`artifacts/counter-${kind}-${pose}-${info.project.name}.png`});
  await page.evaluate(()=>{(window as Window & {releaseCounter?:boolean}).releaseCounter=true;});
 }
 expect(errors).toEqual([]);
});
