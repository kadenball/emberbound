import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const profiles=JSON.parse(readFileSync('docs/COMBAT-AUDIT-0.28.json','utf8')).profiles;
for(const stage of [4,8])test(`chapter ${stage+1} moving floor carries feet, accepts Jump and a brake bonk`,async({page},info)=>{
 const profile=profiles.find((p:{hero:string;stage:number})=>p.hero==='ember'&&p.stage===stage);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(p=>{Date.now=()=>140;localStorage.setItem('CapacitorStorage.emberbound.save.v1',JSON.stringify({version:2,hero:p.hero,xp:p.xp,gold:0,unlocked:p.stage,best:Array.from({length:12},(_,i)=>i<p.stage?1:0),weapons:p.weapons,equipped:p.weapon,upgrades:p.upgrades,storySeen:[`intro-${p.stage}`]}));},profile);
 await page.goto('/');
 await page.evaluate(async()=>{
  const url=performance.getEntriesByType('resource').map(r=>r.name).find(u=>u.includes('/src/engine.ts'))!;
  const {Game,idleInput}=await import(url),{playInput}=await import('/scripts/gameplay-policy.ts');
  const original=Game.prototype.update;let mode='seek',frame=0,elapsed=0;
  const probe={pose:'',release:false,startX:0,x:0,height:0,stopped:false,state:'playing'};(window as any).flowProbe=probe;
  Game.prototype.update=function(dt,input,partner){
   const p=this.player,flow=this.flows[0],brake=this.props.find(q=>q.flow===flow.control);
   if(probe.pose==='done')return false;
   if(probe.pose==='ready'){if(!probe.release)return false;probe.release=false;probe.pose='';mode='drift';}
   if(probe.pose==='drift'){if(!input.jump)return false;probe.pose='';mode='jump';}
   if(probe.pose==='air'){if(!probe.release)return false;probe.release=false;probe.pose='';mode='brake';}
   if(probe.pose==='brake'){if(!input.attack)return false;probe.pose='';mode='bonk';}
   if(['drift','jump','bonk'].includes(mode)){
    const advanced=original.call(this,dt,mode==='drift'?idleInput():input,partner);probe.state=this.state;
    if(mode==='drift'&&advanced){elapsed+=dt;if(elapsed>.18){probe.x=p.x;probe.pose='drift';}}
    if(mode==='jump'&&p.z>60){probe.height=p.z;probe.pose='air';}
    if(mode==='bonk'&&brake.active){probe.stopped=this.flows.every(f=>!this.flowRunning(f));probe.pose='done';}
    return advanced;
   }
   let advanced=false;
   for(let i=0;i<30;i++){
    const steering=playInput(this,frame++);
    const approaching=mode==='seek'&&this.wave===flow.encounter,nearBrake=mode==='brake'&&Math.abs(p.x-brake.x)<240;
    if(approaching||nearBrake){
      const x=approaching?flow.x+45:brake.x-55,y=approaching?flow.y:brake.y,dx=x-p.x,dy=y-p.y;
      steering.x=p.attack?0:Math.abs(dx)>7?Math.sign(dx):0;steering.y=p.attack?0:Math.abs(dy)>5?Math.sign(dy):0;
      steering.attack=steering.heavy=steering.magic=steering.jump=steering.dodge=false;
      if(Math.abs(dx)<12&&Math.abs(dy)<9&&!p.attack&&p.z===0&&p.roll<=0&&this.hitStop<=0){probe.pose=approaching?'ready':'brake';probe.startX=p.x;break;}
    }
    advanced=original.call(this,1/60,steering,partner)||advanced;probe.state=this.state;
    if(this.state!=='playing')break;
   }
   return advanced;
  };
 });
 await page.locator('[data-action="start"]').click();
 await expect.poll(()=>page.evaluate(()=>(window as any).flowProbe.pose),{timeout:30000}).toBe('ready');
 await page.screenshot({path:`artifacts/flow-${stage}-ready-${info.project.name}.png`});
 await page.evaluate(()=>(window as any).flowProbe.release=true);
 await expect.poll(()=>page.evaluate(()=>(window as any).flowProbe.pose)).toBe('drift');
 expect(await page.evaluate(()=>{const q=(window as any).flowProbe;return q.x-q.startX;})).toBeGreaterThan(15);
 if(info.project.name==='desktop')await page.keyboard.press('Space');else await page.locator('#jump').tap();
 await expect.poll(()=>page.evaluate(()=>(window as any).flowProbe.pose)).toBe('air');
 expect(await page.evaluate(()=>(window as any).flowProbe.height)).toBeGreaterThan(60);
 await page.screenshot({path:`artifacts/flow-${stage}-jump-${info.project.name}.png`});
 await page.evaluate(()=>(window as any).flowProbe.release=true);
 await expect.poll(()=>page.evaluate(()=>(window as any).flowProbe.pose),{timeout:30000}).toBe('brake');
 if(info.project.name==='desktop')await page.keyboard.press('j');else await page.locator('#attack').tap();
 await expect.poll(()=>page.evaluate(()=>(window as any).flowProbe.pose)).toBe('done');
 expect(await page.evaluate(()=>(window as any).flowProbe.stopped)).toBe(true);
 await expect(page.locator('#quest-progress')).toContainText('LINE STOPPED');
 await page.screenshot({path:`artifacts/flow-${stage}-stopped-${info.project.name}.png`});expect(errors).toEqual([]);
});
