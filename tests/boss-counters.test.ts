import {expect,it} from 'vitest';
import {Game,idleInput,type Danger,type Input} from '../src/engine';
import {freshSave} from '../src/save';
import {dangerContains,dangerKind,raisedForks} from '../src/danger-shapes';
import {bossCue} from '../src/boss-cue';
const make=(stage=1)=>new Game('ember',stage,freshSave().upgrades,140);
const step=(g:Game,n=1,input:Partial<Input>={})=>{for(let i=0;i<n;i++)g.update(1/60,{...idleInput(),...input});};
const marker=(g:Game,kind:Danger['kind']='blast'):Danger=>({x:g.player.x,y:g.player.y,radius:80,timer:.01,damage:20,color:'#fff',kind});

it.each(['blast','ice','jaw','stamp'] as const)('%s respects its visible low or overhead counter',kind=>{
 const g=make();step(g,12,{jump:true});expect(g.player.z).toBeGreaterThan(85);g.dangers.push(marker(g,kind));step(g);
 expect(g.player.hp<g.player.maxHp).toBe(kind!=='blast');expect(g.dangers[0].resolved).toBe(true);
});
it('leaving the narrow royal stamp lane avoids it on the ground and in the air',()=>{
 const g=make(),d=marker(g,'stamp');d.radius=180;d.depth=48;
 expect(dangerContains(d,d.x+175,d.y,90)).toBe(true);
 expect(dangerContains(d,d.x,d.y+49,0)).toBe(false);
 g.dangers.push({...d,y:d.y+49});step(g);expect(g.player.hp).toBe(g.player.maxHp);
});
it('keeps the impact visible without applying damage or perfect-dodge rewards again',()=>{
 const g=make();g.dangers.push(marker(g,'jaw'));step(g);const hp=g.player.hp;expect(hp).toBeLessThan(g.player.maxHp);
 g.player.invulnerable=0;step(g,3);expect(g.player.hp).toBe(hp);expect(g.dangers).toHaveLength(1);
 step(g,1,{dodge:true,y:1});expect(g.perfectDodges).toBe(0);step(g,20);expect(g.dangers).toHaveLength(0);
});
it('preserves overhead meaning for bookmarks made before hazards had explicit kinds',()=>{
 const g=make();for(const [region,kind] of [[1,'ice'],[5,'stamp']] as const){const d={...marker(g),kind:undefined,source:{kind:'enemy' as const,enemy:'boss' as const,region}};expect(dangerKind(d)).toBe(kind);expect(dangerContains(d,d.x,d.y,100)).toBe(true);}
});
it.each([0,1])('Frank commits to the displayed fork height through the charge, phase %s',phase=>{
 const g=make(9),e=g.spawn('boss',g.player.x+200,g.player.y);e.enraged=true;e.phase=phase;e.cooldown=0;step(g);
 const high=raisedForks(e);expect(high).toBe(phase===1);expect(bossCue(e,4,[])).toContain(high?'CHANGE LANES':'JUMP');
 for(let i=0;i<65&&e.bossState==='windup'&&e.bossTimer>.08;i++)step(g);
 step(g,1,{jump:true});step(g,25);expect(e.bossState).toBe('spin');expect(raisedForks(e)).toBe(high);
 expect(g.player.hp<g.player.maxHp).toBe(high);
});
it.each([false,true])('Candy commits low sweets then overhead teeth before exposing its body, enraged %s',enraged=>{
 const g=make(7),e=g.spawn('boss',g.player.x+200,g.player.y);e.enraged=enraged;e.cooldown=0;step(g);
 expect(bossCue(e,3,[])).toBe('SWEETS LOW · THEN TEETH HIGH');
 for(let i=0;i<60&&e.bossState==='windup';i++)step(g);
 expect(e.bossState).toBe('volley');
 const sweets=g.dangers.filter(d=>d.kind==='blast'),teeth=g.dangers.filter(d=>d.kind==='jaw');
 expect(sweets).toHaveLength(enraged?6:4);expect(teeth).toHaveLength(2);
 expect(Math.min(...teeth.map(d=>d.timer))-Math.max(...sweets.map(d=>d.timer))).toBeGreaterThan(.6);
 expect(bossCue(e,3,g.dangers)).toContain('LOW SWEETS! JUMP');
 const targets=teeth.map(d=>({x:d.x,y:d.y}));
 for(let i=0;i<90&&sweets.some(d=>!d.resolved);i++)step(g,1,{y:1});expect(teeth.map(d=>({x:d.x,y:d.y}))).toEqual(targets);
 expect(g.player.y).toBeGreaterThan(teeth[0].y+42);
 expect(bossCue(e,3,g.dangers)).toContain('TEETH HIGH! CHANGE LANES');
 expect(e.bossState).toBe('volley');
 for(let i=0;i<90&&e.bossState==='volley';i++)step(g);
 expect(e.bossState).toBe('recover');expect(g.dangers.filter(d=>!d.resolved)).toHaveLength(0);
 expect(bossCue(e,3,g.dangers)).toBe('RECOVERING — YOUR OPENING');
});
it('Candy reverses its low sweep on the next serving without moving the locked bite',()=>{
 const g=make(7),e=g.spawn('boss',g.player.x+200,g.player.y);e.cooldown=0;step(g);
 for(let i=0;i<60&&e.bossState==='windup';i++)step(g);
 const first=g.dangers.filter(d=>d.kind==='blast');expect(first[0].timer).toBeLessThan(first.at(-1)!.timer);
 g.dangers=[];e.bossState='idle';e.cooldown=0;step(g);
 for(let i=0;i<60&&e.bossState==='windup';i++)step(g);
 const next=g.dangers.filter(d=>d.kind==='blast');expect(next[0].timer).toBeGreaterThan(next.at(-1)!.timer);
 expect(g.dangers.filter(d=>d.kind==='jaw')[0].x).toBe(e.targetX);
});
it('the kettle locks its high burp at the visible windup instead of tracking a landing',()=>{
 const g=make();step(g,12,{jump:true});const e=g.spawn('boss',g.player.x+200,g.player.y);e.cooldown=0;step(g);
 const height=e.targetZ;expect(height).toBeGreaterThan(90);expect(bossCue(e,0,[])).toContain('STAY LOW');
 for(let i=0;i<60&&e.bossState==='windup';i++)step(g);
 expect(g.player.z).toBe(0);expect(g.projectiles).toHaveLength(3);for(const shot of g.projectiles)expect(shot.z).toBe(height);
});
