import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const profiles=JSON.parse(readFileSync('docs/COMBAT-AUDIT-0.26.json','utf8')).profiles;
for(const hero of ['ember','frost','moss'])test(`${hero} punts a live tick sac through actual Light input`,async({page},info)=>{
 const profile=profiles.find((p:{hero:string;stage:number})=>p.hero===hero&&p.stage===4);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(p=>{Date.now=()=>140;localStorage.setItem('CapacitorStorage.emberbound.save.v1',JSON.stringify({version:2,hero:p.hero,xp:p.xp,gold:0,unlocked:4,best:[1,1,1,1],weapons:p.weapons,equipped:p.weapon,upgrades:p.upgrades,storySeen:['intro-4']}));},profile);
 await page.goto('/');
 await page.evaluate(async()=>{
  const url=performance.getEntriesByType('resource').map(r=>r.name).find(u=>u.includes('/src/engine.ts'))!;
  const {Game,idleInput}=await import(url),{playInput}=await import('/scripts/gameplay-policy.ts');
  const original=Game.prototype.update;let frame=0,watching=false,manual=false,sac:any;
  const probe={pose:'',finish:false,popped:false,startX:0,x:0,fuse:0,initialFuse:0,returned:false,diagnostic:{}};(window as any).sacProbe=probe;
  Game.prototype.update=function(dt,input,partner){
   if(probe.pose==='burst'||probe.pose==='returned'&&!probe.finish||probe.pose==='ready'&&!input.attack)return false;
   if(probe.pose==='ready')probe.pose='';
   if(manual){
    const advanced=original.call(this,dt,input,partner);
    probe.diagnostic={returned:sac?.sac.returned,timer:sac?.timer,inWorld:this.dangers.includes(sac),foes:this.enemies.filter(e=>e.hp>0).length,attack:this.player.attack?.move.kind};
    if(sac?.sac.returned&&sac.timer<.4&&!sac.resolved&&!probe.finish){probe.pose='returned';probe.x=sac.x;probe.fuse=sac.timer;probe.returned=true;}
    if(probe.finish&&sac?.resolved){probe.pose='burst';probe.popped=this.events.includes('stink-pop');}
    return advanced;
   }
   let advanced=false;
   for(let i=0;i<30;i++){
    const tick=this.enemies.find(e=>e.kind==='bomber'&&e.hp>0&&e.windup>0),p=this.player;
    if(tick)watching=true;
    const steering=watching?idleInput():playInput(this,frame++);
    if(watching&&tick){
      // Follow the committed mark, then punt away from the wounded thrower so
      // the swing does not end the encounter before the flight can be captured.
      const dx=tick.targetX-p.x,dy=tick.targetY-p.y;
      steering.x=Math.abs(dx)>5?Math.sign(dx):p.face===Math.sign(tick.x-p.x)?-Math.sign(tick.x-p.x)*.2:0;
      steering.y=Math.abs(dy)>5?Math.sign(dy):0;
    }
    advanced=original.call(this,1/60,steering,partner)||advanced;
    sac=this.dangers.find(d=>d.sac&&!d.sac.returned&&!d.resolved&&d.timer>.4&&Math.abs(d.x-p.x)<50&&Math.abs(d.y-p.y)<25);
    if(sac&&!p.attack&&p.z===0&&p.roll<=0){manual=true;probe.pose='ready';probe.startX=sac.x;probe.initialFuse=sac.timer;break;}
    if(this.state!=='playing')break;
   }
   return advanced;
  };
 });
 await page.locator('[data-action="start"]').click();
 await expect.poll(()=>page.evaluate(()=>(window as any).sacProbe.pose),{timeout:30000}).toBe('ready');
 await expect(page.locator('#quest-progress')).toContainText('STINK SACS');
 await page.screenshot({path:`artifacts/stink-${hero}-ready-${info.project.name}.png`});
 if(info.project.name==='desktop')await page.keyboard.press('j');else await page.locator('#attack').tap();
 await expect.poll(()=>page.evaluate(()=>(window as any).sacProbe.pose),{timeout:10000}).toBe('returned');
 const state=await page.evaluate(()=>(window as any).sacProbe);
 expect(state.returned).toBe(true);expect(Math.abs(state.x-state.startX)).toBeGreaterThan(60);expect(state.fuse).toBeLessThan(state.initialFuse);
 await page.screenshot({path:`artifacts/stink-${hero}-returned-${info.project.name}.png`});
 await page.evaluate(()=>(window as any).sacProbe.finish=true);
 await expect.poll(()=>page.evaluate(()=>(window as any).sacProbe.pose)).toBe('burst');
 expect(await page.evaluate(()=>(window as any).sacProbe.popped)).toBe(true);
 await page.screenshot({path:`artifacts/stink-${hero}-burst-${info.project.name}.png`});expect(errors).toEqual([]);
});
