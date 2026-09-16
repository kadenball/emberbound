import {expect,it} from 'vitest';
import {Game,idleInput} from '../src/engine';
import {scoreScene} from '../src/score-scene';
import {playInput} from '../scripts/gameplay-policy';

it('follows an actual boss approach, entrance, rage and performed defeat without replaying victory',()=>{
 const g=new Game('ember',1,{vitality:1,strength:1,spirit:1},140,{xp:450,weapon:'pan',weapons:['starter','pan']});
 const scenes=new Set<string>();
 for(let frame=0;frame<10800&&!g.bossMoment&&g.state==='playing';frame++){g.update(1/60,playInput(g,frame));scenes.add(scoreScene(g,true));}
 expect(scenes.has('combat')).toBe(true);expect(scoreScene(g,true)).toBe('entrance');
 g.skipBossMoment();g.update(1/60,idleInput());expect(scoreScene(g,true)).toBe('boss');
 const boss=g.enemies.find(e=>e.kind==='boss')!;boss.entrance=0;boss.hp=boss.maxHp*.49;
 g.update(1/60,idleInput());expect(scoreScene(g,true)).toBe('rage');
 g.skipBossMoment();g.update(1/60,idleInput());expect(scoreScene(g,true)).toBe('rage');
 boss.entrance=0;boss.hp=1;g.projectiles.push({x:boss.x,y:boss.y,vx:0,vy:0,life:1,damage:10,friendly:true,hit:new Set(),color:'#fff'});
 g.update(1/60,idleInput());expect(g.state).toBe('playing');expect(scoreScene(g,true)).toBe('victory');
 g.skipBossMoment();g.update(1/60,idleInput());g.update(1/60,idleInput());expect(g.state).toBe('won');expect(scoreScene(g,true)).toBe('victory');
 expect(scoreScene(g,false)).toBe('menu');
});
it('loss overrides a surviving enraged boss and a retry restores battle music',()=>{
 const g=new Game('ember',1,{vitality:0,strength:0,spirit:0},140);const boss=g.spawn('boss',500,455);boss.enraged=true;
 g.state='lost';expect(scoreScene(g,true)).toBe('defeat');g.state='playing';expect(scoreScene(g,true)).toBe('rage');
 expect(scoreScene(null,true)).toBe('menu');
});
