import {expect,it} from 'vitest';
import {Game,idleInput,type Input} from '../src/engine';
import {freshSave} from '../src/save';
const step=(g:Game,n:number,input:Partial<Input>={})=>{for(let i=0;i<n;i++)g.update(1/60,{...idleInput(),...input});};
const fixture=(stage:number,back=false)=>{
 const g=new Game('ember',stage,freshSave().upgrades,140,{weapon:'candy'});g.props=[];
 const boss=g.spawn('boss',260,455);boss.bossState='windup';boss.bossTimer=10;boss.face=-1;
 g.player.x=back?320:200;g.player.face=back?-1:1;g.player.hp=40;g.player.mana=0;
 return {g,boss};
};
it('ground strikes clang off the wafer shell without healing, combo credit or hit refunds',()=>{
 const {g,boss}=fixture(7);step(g,40,{heavy:true});
 expect(boss.hp).toBe(boss.maxHp);expect(g.player.hp).toBe(40);expect(g.comboHits).toBe(0);expect(g.player.filth).toBe(0);expect(g.player.mana).toBeLessThan(2);expect(g.events).toContain('clang');
});
it('a real jump and aerial strike reaches the exposed head',()=>{
 const {g,boss}=fixture(7);step(g,12,{jump:true});step(g,12,{attack:true});
 expect(boss.hp).toBeLessThan(boss.maxHp);expect(g.comboHits).toBeGreaterThan(0);expect(g.player.filth).toBe(16);
});
it.each([false,true])('Frank blocks the front but accepts a rear strike (rear = %s)',back=>{
 const {g,boss}=fixture(9,back);step(g,24,{heavy:true});expect(boss.hp<boss.maxHp).toBe(back);expect(g.player.filth>0).toBe(back);
});
it('both bosses expose ordinary ground attacks during recovery',()=>{
 for(const stage of [7,9]){const {g,boss}=fixture(stage);boss.bossState='recover';step(g,24,{heavy:true});expect(boss.hp).toBeLessThan(boss.maxHp);}
});
it('a blocked low spell cannot refund FILTH through wafer armor',()=>{
 const {g,boss}=fixture(7);g.player.mana=100;step(g,1,{magic:true});step(g,20);
 expect(boss.hp).toBe(boss.maxHp);expect(g.player.filth).toBe(0);expect(g.player.mana).toBeLessThan(66);
});
it('a piercing shot earns credit for its first damaging target after armor, once only',()=>{
 const {g,boss}=fixture(7);const first=g.spawn('brute',365,455),second=g.spawn('brute',465,455);first.cooldown=second.cooldown=10;
 g.projectiles.push({x:220,y:455,vx:180,vy:0,z:0,life:3,friendly:true,damage:10,color:'#fff',owner:0,hit:new Set()});
 for(let i=0;i<100&&first.hp===first.maxHp;i++)step(g,1);
 expect(boss.hp).toBe(boss.maxHp);expect(first.hp).toBeLessThan(first.maxHp);expect(g.player.filth).toBe(16);
 // Other successful moves could evict 'power' while the same bolt is still travelling.
 g.player.recentMoves=[];step(g,60);expect(second.hp).toBeLessThan(second.maxHp);expect(g.player.filth).toBe(16);
});
it('a dive attacks from above rather than being rejected as a ground hit on landing',()=>{
 const {g,boss}=fixture(7);step(g,12,{jump:true});step(g,1,{heavy:true});step(g,18);
 expect(g.player.z).toBe(0);expect(boss.hp).toBeLessThan(boss.maxHp);expect(g.player.filth).toBe(16);
});
it('Jawbreaker heals for an earned combo finisher, once per swing',()=>{
 const {g,boss}=fixture(1);boss.bossState='recover';boss.bossTimer=20;
 step(g,40,{heavy:true});expect(g.player.hp).toBe(40);
 for(let i=0;i<90&&g.player.combo<2;i++)step(g,1,{attack:true});expect(g.player.combo).toBe(2);
 // Let the second light recover, then use its still-live recipe window.
 step(g,18);step(g,40,{heavy:true});expect(g.player.hp).toBe(46);
 step(g,1);step(g,40,{heavy:true});expect(g.player.hp).toBe(46);
});

it('Candy keeps its body covered through the serving but still rewards an aerial head strike',()=>{
 const {g,boss}=fixture(7);boss.bossState='volley';boss.bossTimer=5;
 step(g,20,{heavy:true});expect(boss.hp).toBe(boss.maxHp);
 step(g,20,{jump:true});step(g,1,{attack:true});step(g,10);
 expect(boss.hp).toBeLessThan(boss.maxHp);
});
