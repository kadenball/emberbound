import { describe, expect, it } from 'vitest';
import { Game, idleInput, type Input } from '../src/engine';
import { xpForLevel } from '../src/content';
import { freshSave, parseSave } from '../src/save';
import type { StyleId } from '../src/progression';
const make=(level=1,style:StyleId='scrapper',hero:'ember'|'moss'|'frost'='ember')=>{const g=new Game(hero,0,freshSave().upgrades,7,{xp:xpForLevel(level),style});g.props=[];return g;};
function step(g:Game,n:number,input:Partial<Input>={}){for(let i=0;i<n;i++)g.update(1/60,{...idleInput(),...input});}
describe('fighting style progression',()=>{
 it('migrates old saves and rejects unknown styles without losing progression',()=>{
  const s=freshSave();s.xp=1400;expect(parseSave(JSON.stringify({...s,style:'hexer'})).style).toBe('hexer');
  expect(parseSave(JSON.stringify({...s,style:'invalid'}))).toMatchObject({style:'scrapper',xp:1400});
  expect(parseSave(JSON.stringify({...s,style:undefined})).style).toBe('scrapper');
 });
 it('gates the Scrapper counter at level two and consumes one primed reply',()=>{
  for(const level of [1,2]){
   const g=make(level);const foe=g.spawn('brute',280,455);foe.windup=.18;
   step(g,1,{dodge:true});expect(g.perfectDodges).toBe(1);step(g,17);step(g,1,{heavy:true});
   expect(g.player.attack?.counter).toBe(level>=2);if(level>=2)expect(g.player.counter).toBe(0);
  }
 });
 it('level four adds a directional three-light quake with a level-six travelling wave',()=>{
  for(const level of [3,4,6]){
   const g=make(level);g.player.combo=3;g.player.comboWindow=1;
   step(g,1,{heavy:true,y:1});expect(g.player.attack?.move.kind).toBe(level>=4?'quake':'spin');
   step(g,18);expect(g.projectiles.some(p=>p.groundWave)).toBe(level>=6);
  }
 });
 it('an Acrobat air dash unlocks a kick; further unearned lift is bounded',()=>{
  const low=make(1,'acrobat'),g=make(2,'acrobat');
  for(const game of [low,g]){game.player.z=90;step(game,1,{dodge:true});}
  expect(low.player.airDash).toBe(0);expect(g.player.airDash).toBeGreaterThan(0);expect(g.player.airDashes).toBe(1);
  step(g,16);step(g,1,{attack:true});expect(g.player.attack?.move.kind).toBe('kick');expect(g.player.airDash).toBe(0);
 });
 it('level four Acrobat can jump-cancel a connected non-launcher heavy',()=>{
  const g=new Game('ember',0,freshSave().upgrades,7,{xp:xpForLevel(4),style:'acrobat',weapon:'pan'});g.props=[];
  g.spawn('brute',260,455).cooldown=10;step(g,20,{heavy:true});expect(g.player.attack?.hit.size).toBeGreaterThan(0);
  step(g,4,{jump:true,attack:true});expect(g.player.attack?.move.kind).toBe('air');expect(g.player.z).toBeGreaterThan(0);
 });
 it('Hexer casts prime an elemental heavy, consume it, and refund once per connected swing',()=>{
  const g=make(4,'hexer','frost');g.player.mana=80;
  g.spawn('brute',260,455).cooldown=10;g.spawn('brute',265,465).cooldown=10;
  step(g,1,{magic:true});expect(g.player.infusion).toBe(3);step(g,4);step(g,1,{heavy:true});
  expect(g.player.attack?.move.kind).toBe('hex');expect(g.player.infusion).toBe(0);
  const before=g.player.mana;step(g,15);expect(g.player.mana-before).toBeGreaterThan(15);expect(g.player.mana-before).toBeLessThan(16.1);
  expect(g.enemies.every(e=>e.frozen>0)).toBe(true);
 });
 it('a whiffed infused move does not grant the connected refund',()=>{
  const g=make(4,'hexer');step(g,1,{magic:true});step(g,1,{heavy:true});const mana=g.player.mana;step(g,30);expect(g.player.mana-mana).toBeLessThan(4);
 });
 it('dropping a decoy grants no immediate healing even beside enemies',()=>{
  const g=make(1,'scrapper','moss');g.player.hp=50;step(g,1,{magic:true});expect(g.player.hp).toBe(50);
  g.player.spellCooldown=0;g.spawn('brute',300,455);step(g,1,{magic:true});expect(g.player.hp).toBe(50);expect(g.messes.length).toBe(2);
 });
});
describe('readable additional pressure',()=>{
 it('a guard answers repeated frontal light hits with a visible riposte',()=>{
  const g=make(),guard=g.spawn('shield',265,455);guard.cooldown=10;
  step(g,15,{attack:true});expect(guard.blocked).toBe(1);guard.cooldown=.4;step(g,17,{attack:true});
  expect(g.texts.some(t=>t.text==='LID SLAP!')).toBe(true);expect(guard.windup).toBeGreaterThan(0);
 });
 it('an archer aims a high shot that can hit a jumping player',()=>{
  const g=make(),e=g.spawn('archer',400,455);e.windup=.01;e.targetX=200;e.targetY=455;e.targetZ=90;
  step(g,1);expect(g.projectiles[0].z).toBe(90);
  g.projectiles[0].x=200;g.projectiles[0].vx=0;g.player.z=90;step(g,1);expect(g.player.hp).toBeLessThan(g.player.maxHp);
 });
 it('boss escalation changes the first boss volley at half health',()=>{
  const counts=[1,.4].map(hp=>{const g=make();const b=g.spawn('boss',500,455);b.hp=b.maxHp*hp;if(hp<.5){step(g,1);expect(g.bossMoment?.kind).toBe('rage');g.skipBossMoment();step(g,1);}b.bossState='windup';b.bossTimer=.01;b.targetX=200;b.targetY=455;step(g,1);return g.projectiles.length;});
  expect(counts).toEqual([3,5]);
 });
});
