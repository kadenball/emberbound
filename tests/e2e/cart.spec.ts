import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const profiles=JSON.parse(readFileSync('docs/COMBAT-AUDIT-0.25.json','utf8')).profiles;
for(const stage of [0,2,4,6,8,10])test(`chapter ${stage+1} cargo accepts a real Heavy and visibly rushes`,async({page},info)=>{
 const profile=profiles.find((p:{hero:string;stage:number})=>p.hero==='ember'&&p.stage===stage);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(p=>{Date.now=()=>140;localStorage.setItem('CapacitorStorage.emberbound.save.v1',JSON.stringify({version:2,hero:p.hero,xp:p.xp,gold:0,unlocked:p.stage,best:Array.from({length:12},(_,i)=>i<p.stage?1:0),weapons:p.weapons,equipped:p.weapon,upgrades:p.upgrades,storySeen:[`intro-${p.stage}`]}));},profile);
 await page.goto('/');
 await page.evaluate(async()=>{
  const url=performance.getEntriesByType('resource').map(r=>r.name).find(u=>u.includes('/src/engine.ts'))!;
  const {Game}=await import(url),{playInput}=await import('/scripts/gameplay-policy.ts');
  const original=Game.prototype.update;let frame=0,manual=false;
  const probe={pose:'',release:false,startX:0,x:0};(window as any).cargoProbe=probe;
  Game.prototype.update=function(dt,input,partner){
   if(probe.pose==='ready'&&input.heavy)probe.release=true;
   if(probe.pose&&!probe.release)return false;probe.release=false;probe.pose='';
   if(manual){
    const advanced=original.call(this,dt,input,partner);
    if(this.cart&&(this.cart.boost??0)>.1&&(this.cart.boost??0)<.65){probe.x=this.cart.x;probe.pose='rush';}
    return advanced;
   }
   let advanced=false;
   for(let i=0;i<40;i++){
    const steering=playInput(this,frame++),p=this.player,q=this.cart;
    if(q&&!q.complete){
     const dx=q.x-80-p.x,dy=q.y-p.y;steering.x=Math.abs(dx)>8?Math.sign(dx):p.face<0?.2:0;steering.y=Math.abs(dy)>8?Math.sign(dy):0;
     steering.attack=steering.heavy=steering.magic=steering.jump=steering.dodge=false;
     if(q.x-p.x>45&&q.x-p.x<115&&Math.abs(dy)<20&&p.face>0&&!p.attack&&p.z===0&&p.roll<=0){manual=true;probe.startX=q.x;probe.pose='ready';break;}
    }
    advanced=original.call(this,1/60,steering,partner)||advanced;
    if(this.state!=='playing')break;
   }
   return advanced;
  };
 });
 await page.locator('[data-action="start"]').click();
 await expect.poll(()=>page.evaluate(()=>(window as any).cargoProbe.pose),{timeout:30000}).toBe('ready');
 await page.screenshot({path:`artifacts/cargo-${stage}-ready-${info.project.name}.png`});
 if(info.project.name==='desktop')await page.keyboard.press('h');else await page.locator('#heavy').tap();
 await expect.poll(()=>page.evaluate(()=>(window as any).cargoProbe.pose),{timeout:10000}).toBe('rush');
 const moved=await page.evaluate(()=>{const p=(window as any).cargoProbe;return p.x-p.startX;});expect(moved).toBeGreaterThan(100);
 await expect(page.locator('#quest-progress')).toContainText('EXPRESS DISASTER');
 await page.screenshot({path:`artifacts/cargo-${stage}-rush-${info.project.name}.png`});expect(errors).toEqual([]);
});
