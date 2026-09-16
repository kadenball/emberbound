import {it,expect} from 'vitest';
import {Game,idleInput} from '../src/engine';
import {freshSave} from '../src/save';

it('a boss answers repeated close ground Heavies instead of letting the player camp recovery',()=>{
 const g=new Game('ember',1,freshSave().upgrades,7);g.props=[];
 const boss=g.spawn('boss',265,455);boss.bossState='recover';boss.bossTimer=3;
 let answered=false;
 for(let frame=0;frame<95;frame++){
  g.update(1/60,{...idleInput(),heavy:frame%2===0});
  answered ||= g.dangers.some(d=>d.source?.attack==='read-heavy');
 }
 expect(answered).toBe(true);
});

it.each([1,3,5,7,9,11])('the stage %s Heavy read gives time to jump its ground blast',stage=>{
 const g=new Game('ember',stage,freshSave().upgrades,7);g.props=[];const boss=g.spawn('boss',265,455);boss.bossState='recover';boss.bossTimer=5;
 for(let f=0;f<100&&!g.dangers.some(d=>d.source?.attack==='read-heavy');f++)g.update(1/60,{...idleInput(),heavy:f%2===0});
 const danger=g.dangers.find(d=>d.source?.attack==='read-heavy')!;expect(danger).toBeDefined();expect(danger.timer).toBeGreaterThan(.5);
 // Isolate this committed attack, retaining the real player and danger update.
 g.enemies=[];g.dangers=[danger];const hp=g.player.hp;
 for(let f=0;f<42;f++)g.update(1/60,{...idleInput(),jump:f>=17&&f<19});
 expect(g.player.hp).toBe(hp);expect(danger.resolved).toBe(true);
});
it('one Heavy still damages and a real Light-Light-Heavy recipe avoids the read',()=>{
 const g=new Game('ember',1,freshSave().upgrades,7);g.props=[];const boss=g.spawn('boss',265,455);boss.bossState='recover';boss.bossTimer=10;
 for(let f=0;f<38;f++)g.update(1/60,{...idleInput(),heavy:f===0});
 expect(boss.hp).toBeLessThan(boss.maxHp);expect(g.dangers).toHaveLength(0);
 for(let f=0;f<95&&g.player.combo<2;f++)g.update(1/60,{...idleInput(),attack:true});
 expect(g.player.combo).toBe(2);
 for(let f=0;f<40;f++)g.update(1/60,{...idleInput(),heavy:f===0});
 expect(g.dangers.some(d=>d.source?.attack==='read-heavy')).toBe(false);
});
it('ordinary brutes commit an answer through repeated raw Heavy instead of being stun locked',()=>{
 const g=new Game('ember',0,freshSave().upgrades,7);g.props=[];const brute=g.spawn('brute',270,455);brute.cooldown=10;
 let answer=false;for(let f=0;f<180&&brute.hp>0;f++){g.update(1/60,{...idleInput(),heavy:f%2===0});answer ||= brute.defiance>0&&brute.windup>0||g.projectiles.some(p=>!p.friendly&&p.groundWave);}
 expect(answer).toBe(true);
});
