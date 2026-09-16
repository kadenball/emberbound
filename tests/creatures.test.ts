import { expect,it } from 'vitest';
import { Game,idleInput } from '../src/engine';
import { freshSave } from '../src/save';
const make=()=>{const g=new Game('ember',0,freshSave().upgrades,7);g.props=[];return g;};
const step=(g:Game,n:number)=>{for(let i=0;i<n;i++)g.update(1/60,idleInput());};
it('rats warn and pounce across a gap rather than walk into slap range',()=>{
 const g=make(),rat=g.spawn('raider',345,455);rat.cooldown=0;step(g,1);expect(rat.windup).toBeGreaterThan(0);step(g,32);expect(rat.rush).toBeGreaterThan(0);
});
it('a brute pound threatens the ground beyond its arm with a travelling wave',()=>{
 const g=make(),brute=g.spawn('brute',360,455);brute.windup=.01;brute.targetX=200;brute.targetY=455;
 step(g,1);expect(g.projectiles.some(b=>!b.friendly && b.groundWave)).toBe(true);
});
it('crabs scuttle between lanes while guarding instead of following a straight line',()=>{
 const g=make(),crab=g.spawn('shield',420,455);crab.cooldown=10;let excursion=0;for(let i=0;i<120;i++){step(g,1);excursion=Math.max(excursion,Math.abs(crab.y-455));}expect(excursion).toBeGreaterThan(8);
});
it('ticks leave two distinct delayed hazards so standing in the old lane is unsafe',()=>{
 const g=make(),tick=g.spawn('bomber',430,455);tick.windup=.01;tick.targetX=200;tick.targetY=455;
 step(g,1);expect(g.dangers).toHaveLength(2);expect(g.dangers[0].timer).not.toBe(g.dangers[1].timer);
});
it('a committed pounce keeps its aim when the player changes lane',()=>{
 const g=make(),rat=g.spawn('raider',350,455);rat.windup=.01;rat.targetX=200;rat.targetY=455;
 step(g,1);const aim=[rat.dashX,rat.dashY];g.player.y=535;step(g,8);expect([rat.dashX,rat.dashY]).toEqual(aim);expect(rat.y).toBe(455);
});
it('a ground wave hurts a grounded player but passes under a high jumper',()=>{
 for(const airborne of [false,true]){const g=make();if(airborne)g.player.z=110;g.projectiles.push({x:200,y:455,z:0,vx:0,vy:0,life:.8,friendly:false,damage:18,hit:new Set(),color:'#ed947d',groundWave:true});step(g,1);expect(g.player.hp<g.player.maxHp).toBe(!airborne);}
});
it('an interrupted pounce never starts and does not deal contact damage',()=>{
 const g=make(),rat=g.spawn('raider',280,455);rat.windup=.3;rat.targetX=200;rat.targetY=455;
 for(let i=0;i<28;i++)g.update(1/60,{...idleInput(),heavy:i<4});expect(rat.rush).toBe(0);expect(g.player.hp).toBe(g.player.maxHp);
});
it('impact effects are bounded and expire after the action',()=>{
 const g=make();for(let i=0;i<100;i++)g.impact(200,455,'heavy');expect(g.impacts.length).toBe(70);step(g,60);expect(g.impacts).toHaveLength(0);
});
