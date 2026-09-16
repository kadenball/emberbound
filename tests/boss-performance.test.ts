import { expect, it } from 'vitest';
import { Game, idleInput } from '../src/engine';
import { freshSave } from '../src/save';
import { playInput } from '../scripts/gameplay-policy';
import { RunSession } from '../src/run-session';
const make=(stage=1)=>new Game('ember',stage,{vitality:1,strength:1,spirit:1},140,{xp:450,weapon:'pan',weapons:['starter','pan']});
it('a real boss entrance freezes danger, movement and resource use, and supports immediate skipping',()=>{
 const g=make();for(let frame=0;frame<60*180&&!g.bossMoment&&g.state==='playing';frame++)g.update(1/60,playInput(g,frame));
 expect(g.bossMoment?.kind).toBe('entrance');const before={x:g.player.x,hp:g.player.hp,mana:g.player.mana};g.impact(0,0,'heavy');const flash=g.impacts.at(-1)!;
 for(let i=0;i<15;i++)g.update(1/60,{...idleInput(),x:1,magic:true});expect({x:g.player.x,hp:g.player.hp,mana:g.player.mana}).toEqual(before);expect(flash.life).toBeLessThan(.05);
 g.skipBossMoment();g.update(1/60,idleInput());expect(g.bossMoment).toBeNull();
});
it('the half-health breakdown runs once, clears hostile carryover and returns to a fresh windup',()=>{
 const g=make(),b=g.spawn('boss',500,455);b.hp=b.maxHp*.49;
 g.projectiles.push({x:200,y:455,vx:0,vy:0,life:2,damage:999,friendly:false,hit:new Set(),color:'#fff'});
 g.update(1/60,idleInput());expect(g.bossMoment?.kind).toBe('rage');expect(b.enraged).toBe(true);expect(g.player.hp).toBe(g.player.maxHp);expect(g.projectiles).toHaveLength(0);
 g.skipBossMoment();g.update(1/60,idleInput());g.update(1/60,idleInput());expect(g.bossMoment).toBeNull();expect(b.cooldown).toBeGreaterThan(.5);
});
it('a lethal projectile performs the defeat before victory and reward settlement',()=>{
 const g=make(),save=freshSave(),session=new RunSession(g,save);
 for(let frame=0;frame<60*180&&!g.bossMoment&&g.state==='playing';frame++)g.update(1/60,playInput(g,frame));expect(g.wave).toBe(2);
 g.skipBossMoment();g.update(1/60,idleInput());const boss=g.enemies.find(e=>e.kind==='boss')!;boss.entrance=0;boss.hp=1;boss.enraged=true;
 g.projectiles.push({x:boss.x,y:boss.y,vx:0,vy:0,life:1,damage:10,friendly:true,hit:new Set(),color:'#fff'});g.update(1/60,idleInput());
 expect(boss.hp).toBeLessThanOrEqual(0);expect(g.bossMoment?.kind).toBe('defeat');expect(g.state).toBe('playing');session.settle();expect(save.gold).toBe(0);
 g.skipBossMoment();g.update(1/60,idleInput());g.update(1/60,idleInput());expect(g.state).toBe('won');session.settle();const gold=save.gold;expect(gold).toBeGreaterThan(100);session.settle();expect(save.gold).toBe(gold);
});
it('a boss retry restores its fight state and skips the already-seen entrance',()=>{
 const g=make();for(let frame=0;frame<60*180&&!g.bossMoment&&g.state==='playing';frame++)g.update(1/60,playInput(g,frame));
 g.skipBossMoment();g.update(1/60,idleInput());g.player.invulnerable=0;g.player.z=0;g.dangers.push({x:g.player.x,y:g.player.y,radius:100,timer:0,damage:9999,color:'#fff'});g.update(1/60,idleInput());expect(g.state).toBe('lost');
 expect(g.retryEncounter()).toBe(true);expect(g.wave).toBe(2);expect(g.bossMoment).toBeNull();expect(g.enemies.find(e=>e.kind==='boss')!.enraged).toBe(false);
});
