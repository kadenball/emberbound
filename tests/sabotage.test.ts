import { expect, it } from 'vitest';
import { Game, idleInput } from '../src/engine';
import { freshSave } from '../src/save';
import { chapterEncounters } from '../src/encounters';
import { machineZones, inMachineZone } from '../src/sabotage';
import { defeatAdvice } from '../src/defeat';
import { playInput } from '../scripts/gameplay-policy';
function fixture(region=0) {
  const g=new Game('ember',region*2,freshSave().upgrades,140),m=g.machines[0];
  g.wave=m.encounter;g.player.x=m.controlX-45;g.player.y=m.controlY;
  g.props=g.props.filter(p=>p.kind==='bell');g.setpieces=[];
  for(const y of [370,530]){const e=g.spawn('brute',m.x+200,y);e.stun=60;}
  return {g,m,bell:g.props[0]};
}
function heavy(g: Game) {for(let i=0;i<50;i++)g.update(1/60,{...idleInput(),heavy:i===0});}
it('each region has a different encounter sequence, with one reachable sabotage and one delivery',()=>{
  const routes=[0,2,4,6,8,10].map(stage=>chapterEncounters(stage));
  expect(new Set(routes.map(r=>r.map(e=>e.kind).join(','))).size).toBe(6);
  for(const r of routes){expect(r.filter(e=>e.kind==='sabotage')).toHaveLength(1);expect(r.filter(e=>e.kind==='cart')).toHaveLength(1);}
  for(const stage of [1,3,5,7,9,11])expect(new Game('ember',stage,freshSave().upgrades).machines).toHaveLength(0);
});
it('light spam cannot sabotage; each committed Heavy counts once and three start the warning',()=>{
  const {g,m,bell}=fixture();
  for(let i=0;i<120;i++)g.update(1/60,{...idleInput(),attack:true});
  expect(m.strikes).toBe(0);for(let i=0;i<40;i++)g.update(1/60,idleInput());
  heavy(g);expect(m.strikes).toBe(1);heavy(g);expect(m.strikes).toBe(2);heavy(g);
  expect(m.phase).toBe('running');expect(bell.active).toBe(true);expect(m.bowled).toBe(false);
  expect(g.objective).toContain('Jump');
});
it('a bowled body trips the bell on contact, and the one-time skill bonus cannot repeat',()=>{
  const {g,m,bell}=fixture();const e=g.spawn('raider',bell.x-15,bell.y);
  e.bowlTime=.4;e.vx=500;e.knockdown=1;
  g.update(1/60,idleInput());expect(m.phase).toBe('running');expect(m.bowled).toBe(true);expect(m.strikes).toBe(3);
  for(let i=0;i<240;i++)g.update(1/60,idleInput());expect(m.phase).toBe('wrecked');
  const gold=g.gold,xp=g.earnedXp;expect(gold).toBeGreaterThanOrEqual(65);heavy(g);heavy(g);expect(g.gold).toBe(gold);expect(g.earnedXp).toBe(xp);
});
it('every disaster gives its full warning; only low hazards allow jumping, and all leave a safe lane',()=>{
  for(let region=0;region<6;region++){
    const {m}=fixture(region);m.phase='running';m.clock=1;
    expect(machineZones(m).every(z=>z.warning&&!z.active)).toBe(true);
    m.clock=1.65;const z=machineZones(m).find(z=>z.active)!;expect(z).toBeDefined();
    expect(inMachineZone(z,z.x,z.y,0)).toBe(true);
    expect(inMachineZone(z,z.x,z.y,100)).toBe([0,2,3].includes(region)?false:true);
    expect([370,535].some(y=>!inMachineZone(z,z.x,y,0))).toBe(true);
  }
});
it('disasters hit both sides once per pulse and retain a useful, regional death explanation',()=>{
  const {g,m}=fixture(4);m.phase='running';m.clock=1.65;
  const z=machineZones(m)[0];g.player.x=z.x;g.player.y=z.y;
  const e=g.enemies[0];e.x=z.x;e.y=z.y;
  g.update(.01,idleInput());expect(g.player.hp).toBeLessThan(g.player.maxHp);expect(e.hp).toBeLessThan(e.maxHp);
  const hp=g.player.hp,ehp=e.hp;g.player.invulnerable=0;g.hitStop=0;g.update(.01,idleInput());expect(g.player.hp).toBe(hp);expect(e.hp).toBe(ehp);
  expect(defeatAdvice(g.damageLog.at(-1)).tip).toContain('jumping will not help');
});
it('idle machinery outside the current fight cannot be triggered or paid',()=>{
  const {g,m}=fixture();g.wave--;heavy(g);heavy(g);heavy(g);expect(m.strikes).toBe(0);expect(m.phase).toBe('ready');expect(g.gold).toBe(0);
});
it('a real encounter retry restores the bell, hit sets, rewards and machinery without sharing state',()=>{
  const g=new Game('ember',0,freshSave().upgrades,140);
  for(let f=0;f<60*160 && g.wave<g.machines[0].encounter && g.state==='playing';f++)g.update(1/60,playInput(g,f));
  expect(g.wave).toBe(g.machines[0].encounter);expect(g.retryPoint?.encounter).toBe(3);
  const gold=g.gold,xp=g.xp;
  for(let f=0;f<60*60 && g.machines[0].clock<2 && g.state==='playing';f++)g.update(1/60,playInput(g,f));
  expect(g.machines[0].phase).toBe('running');
  g.player.invulnerable=0;g.player.z=g.player.vz=g.hitStop=0;
  g.dangers.push({x:g.player.x,y:g.player.y,radius:100,timer:0,damage:99999,color:'#fff'});
  g.update(1/60,idleInput());expect(g.state).toBe('lost');expect(g.retryEncounter()).toBe(true);
  expect(g.gold).toBe(gold);expect(g.xp).toBe(xp);expect(g.machines[0].phase).toBe('ready');expect(g.machines[0].hits.size).toBe(0);expect(g.machines[0].fired.size).toBe(0);expect(g.props.find(p=>p.kind==='bell')?.active).toBe(false);
});
