import { expect, it } from 'vitest';
import { Game, idleInput } from '../src/engine';
import { freshSave } from '../src/save';
const make=()=>{const g=new Game('ember',0,freshSave().upgrades,7);g.props=[];return g;};
const step=(g:Game,n:number)=>{for(let i=0;i<n;i++)g.update(1/60,idleInput());};
const crew=()=>{const g=make(),patient=g.spawn('brute',580,455),jelly=g.spawn('healer',760,455);patient.hp=60;patient.stun=5;jelly.cooldown=0;return {g,patient,jelly};};
it('a distant medic starts a visible stitch for an injured ally without needing the player nearby',()=>{
 const {g,patient,jelly}=crew();step(g,1);expect(jelly.patient).toBe(patient.id);expect(jelly.windup).toBe(1.25);expect(g.events).toContain('stitch');
 step(g,60);expect(patient.hp).toBe(60);step(g,18);expect(patient.hp).toBe(92);expect(jelly.patient).toBeUndefined();expect(g.events.filter(e=>e==='restuff')).toHaveLength(1);
 step(g,90);expect(patient.hp).toBe(92);
});
it('triage locks one patient and never heals the whole crowd or an undamaged ally',()=>{
 const {g,patient,jelly}=crew(),other=g.spawn('shield',650,455);other.hp=65;other.stun=5;step(g,1);expect(jelly.patient).toBe(patient.id);
 other.hp=5;step(g,78);expect(other.hp).toBe(5);expect(patient.hp).toBe(92);
 const solo=make(),medic=solo.spawn('healer',650,455),healthy=solo.spawn('brute',560,455);medic.cooldown=0;healthy.stun=5;step(solo,30);expect(medic.patient).toBeUndefined();expect(medic.windup).toBe(0);
});
it('pulling a patient out of tether range cancels its heal and creates a recovery window',()=>{
 const {g,patient,jelly}=crew();step(g,1);patient.vx=-650;patient.bowlTime=.8;step(g,30);
 expect(patient.hp).toBe(60);expect(jelly.windup).toBe(0);expect(jelly.patient).toBeUndefined();expect(jelly.cooldown).toBeGreaterThan(1);expect(g.events).toContain('snip');
});
it('a dead patient breaks its committed stitch instead of silently selecting another',()=>{
 const {g,patient,jelly}=crew();step(g,1);patient.hp=0;step(g,1);expect(jelly.patient).toBeUndefined();expect(jelly.windup).toBe(0);expect(g.events).toContain('snip');
});
it('Heavy and power cut a channel even during defiance; light damage alone does not',()=>{
 for(const action of ['attack','heavy','magic'] as const){
  const g=make(),jelly=g.spawn('healer',270,455),patient=g.spawn('brute',480,455);patient.hp=60;patient.stun=5;jelly.cooldown=0;
  step(g,1);jelly.defiance=2;
  for(let i=0;i<24;i++)g.update(1/60,{...idleInput(),[action]:i<3});
  expect(g.events.includes('snip')).toBe(action!=='attack');expect(patient.hp).toBeLessThanOrEqual(60);expect(g.events).not.toContain('restuff');
 }
});
it('an isolated jelly commits to a slap that can be sidestepped or late-jumped, then recovers',()=>{
 for(const evade of ['none','lane','jump','early']){
  const g=make(),jelly=g.spawn('healer',270,455);jelly.cooldown=0;step(g,1);expect(jelly.windup).toBe(.65);
  for(let i=0;i<42;i++)g.update(1/60,{...idleInput(),y:evade==='lane'?1:0,jump:evade==='jump'&&i===12||evade==='early'&&i===0});
  expect(g.player.hp<g.player.maxHp).toBe(evade==='none'||evade==='early');expect(jelly.recovery).toBeGreaterThan(0);expect(jelly.cooldown).toBeGreaterThan(1);
 }
});

it('bookmarks preserve a locked patient and old entries without that field still resume',()=>{
 const g=make();g.player.x=330;step(g,1);const raw=JSON.parse(g.exportBookmark()!);
 const [jelly,patient]=raw.snapshot.enemies;jelly.kind='healer';jelly.entrance=0;jelly.windup=1.25;jelly.patient=patient.id;patient.entrance=0;
 const resumed=Game.resumeBookmark(JSON.stringify(raw))!;expect(resumed).not.toBeNull();expect(resumed.enemies[0].patient).toBe(resumed.enemies[1].id);
 delete jelly.patient;expect(Game.resumeBookmark(JSON.stringify(raw))).not.toBeNull();
});
