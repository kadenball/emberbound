import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const profiles=JSON.parse(readFileSync('docs/COMBAT-AUDIT-0.13.json','utf8')).profiles;
for(const [stage,name] of [[7,'wafer'],[9,'rear']] as const)test(`${name} defense rejects an ordinary attack and rewards its visible counter`,async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 const profile=profiles.find((p:{hero:string;stage:number})=>p.hero==='ember'&&p.stage===stage);
 await page.addInitScript(p=>{Date.now=()=>140;localStorage.setItem('CapacitorStorage.emberbound.save.v1',JSON.stringify({version:2,hero:p.hero,xp:p.xp,gold:0,unlocked:p.stage,best:Array.from({length:12},(_,i)=>i<p.stage?1:0),weapons:p.weapons,equipped:p.weapon,upgrades:p.upgrades,storySeen:[`intro-${p.stage}`]}));},profile);
 await page.goto('/');
 await page.evaluate(async()=>{
  const url=performance.getEntriesByType('resource').map(r=>r.name).find(u=>u.includes('/src/engine.ts'))!;
  const {Game,idleInput}=await import(url),{playInput}=await import('/scripts/gameplay-policy.ts'),{shellClosed}=await import('/src/boss-defense.ts');
  const update=Game.prototype.update;let frame=0,blocked=false,countered=false;
  const w=window as Window & {defensePose?:string;releaseDefense?:boolean;counterEvidence?:{hpBefore:number;hpAfter:number;height:number;rear:boolean}};
  Game.prototype.update=function(dt,input,partner){
   if(w.defensePose&&!w.releaseDefense)return false;w.defensePose='';w.releaseDefense=false;
   let advanced=false;
   for(let i=0;i<40;i++){
    const boss=this.enemies.find(e=>e.kind==='boss'&&e.hp>0),before=boss?.hp,events=this.events.length,p=this.player;
    const rear=boss&&(p.x-boss.x)*boss.face<-10,height=p.z,closed=boss&&shellClosed(boss.bossState);
    let action=playInput(this,frame++);
    // First demonstrate an actual blocked Heavy; then use the normal mixed policy.
    if(boss&&!blocked&&!this.bossMoment){const dx=boss.x-p.x,dy=boss.y-p.y;action={...idleInput(),x:Math.abs(dx)>55?Math.sign(dx):p.face!==Math.sign(dx)?Math.sign(dx)*.2:0,y:Math.abs(dy)>9?Math.sign(dy):0,heavy:Math.abs(dx)<100&&Math.abs(dy)<35&&frame%40<3};}
    advanced=update.call(this,1/60,action,partner)||advanced;
    if(boss&&!blocked&&this.events.slice(events).includes('clang')&&boss.hp===before){blocked=true;w.defensePose='blocked';break;}
    if(boss&&blocked&&!countered&&closed&&boss.hp<before&&(this.config.region===3?height>=55:rear)){
     countered=true;w.counterEvidence={hpBefore:before,hpAfter:boss.hp,height,rear};w.defensePose='counter';break;
    }
    if(this.state!=='playing')break;
   }
   return advanced;
  };
 });
 await page.locator('[data-action="start"]').click();
 for(const pose of ['blocked','counter']){
  await expect.poll(()=>page.evaluate(()=>(window as Window & {defensePose?:string}).defensePose),{timeout:25000}).toBe(pose);
  await page.screenshot({path:`artifacts/defense-${name}-${pose}-${info.project.name}.png`});
  if(pose==='counter'){const evidence=await page.evaluate(()=>(window as Window & {counterEvidence?:{hpBefore:number;hpAfter:number;height:number;rear:boolean}}).counterEvidence!);expect(evidence.hpAfter).toBeLessThan(evidence.hpBefore);if(stage===7)expect(evidence.height).toBeGreaterThanOrEqual(55);else expect(evidence.rear).toBe(true);}
  await page.evaluate(()=>{(window as Window & {releaseDefense?:boolean}).releaseDefense=true;});
 }
 expect(errors).toEqual([]);
});
