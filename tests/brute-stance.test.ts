import {expect,it} from 'vitest';
import {Game,idleInput,type Input} from '../src/engine';
import type {WeaponId} from '../src/content';
import {freshSave} from '../src/save';
const step=(g:Game,n:number,input:Partial<Input>={})=>{for(let i=0;i<n;i++)g.update(1/60,{...idleInput(),...input});};
function fixture(weapon:WeaponId='starter') {
  const g=new Game('ember',0,freshSave().upgrades,7,{weapon});g.props=[];
  const brute=g.spawn('brute',270,455);brute.cooldown=0;step(g,1);
  expect(brute.windup).toBe(.7);return {g,brute};
}
it.each(['starter','pan','popsicle','sock','crown'] as WeaponId[])('a frontal %s Heavy hurts planted fists but cannot cancel, freeze or move them',weapon=>{
  const {g,brute}=fixture(weapon),x=brute.x;
  step(g,20,{heavy:true});
  expect(brute.hp).toBeLessThan(brute.maxHp);expect(brute.windup).toBeGreaterThan(0);
  expect(brute.z).toBe(0);expect(brute.bowlTime).toBe(0);expect(brute.frozen).toBe(0);expect(brute.x).toBe(x);
  step(g,35);expect(g.events).toContain('hurt');expect(brute.attackTime).toBeGreaterThan(0);
});
it('a rear Heavy breaks the committed direction and launches the brute',()=>{
  const {g,brute}=fixture();g.player.x=brute.x+65;g.player.face=-1;
  step(g,16,{heavy:true});expect(brute.windup).toBe(0);expect(brute.z).toBeGreaterThan(0);expect(g.events).toContain('brace-break');
  expect(g.player.hp).toBe(g.player.maxHp);
});
it('two connected Light swings earn a frontal Heavy that breaks the stance',()=>{
  const g=new Game('ember',0,freshSave().upgrades,7);g.props=[];
  const brute=g.spawn('brute',265,455);brute.stun=10;brute.cooldown=10;
  step(g,35,{attack:true});step(g,2);expect(g.player.combo).toBe(2);
  brute.stun=0;brute.cooldown=0;step(g,1);expect(brute.windup).toBe(.7);
  step(g,20,{heavy:true});expect(g.events).toContain('brace-break');expect(brute.windup).toBe(0);expect(brute.bowlTime).toBeGreaterThan(0);
});
it('a bowled creature breaks a planted brute and rewards the environmental counter',()=>{
  const {g,brute}=fixture('pan'),rat=g.spawn('raider',g.player.x+35,g.player.y);
  // Place the second target beyond the pan itself, then let the body collision run.
  brute.x=400;brute.windup=.7;rat.cooldown=10;
  step(g,34,{heavy:true});expect(g.bowlingHits).toBeGreaterThan(0);expect(g.events).toContain('brace-break');expect(brute.hp).toBeLessThan(brute.maxHp);
});
it('the low pound can be late-jumped while a committed high swat requires leaving its lane',()=>{
  const low=fixture();step(low.g,20);step(low.g,1,{jump:true});step(low.g,25);expect(low.g.player.hp).toBe(low.g.player.maxHp);
  const high=fixture();high.brute.targetZ=90;step(high.g,20);step(high.g,1,{jump:true});step(high.g,25);expect(high.g.player.hp).toBeLessThan(high.g.player.maxHp);
  const sidestep=fixture();sidestep.brute.targetZ=90;step(sidestep.g,46,{y:-1});expect(sidestep.g.player.hp).toBe(sidestep.g.player.maxHp);
});
it('the end of a missed rush is vulnerable to melee, not an invisible immunity window',()=>{
  const g=new Game('ember',0,freshSave().upgrades,7);g.props=[];
  const rat=g.spawn('raider',270,455);rat.recovery=.42;rat.cooldown=1.5;
  step(g,12,{heavy:true});expect(rat.hp).toBeLessThan(rat.maxHp);expect(rat.z).toBeGreaterThan(0);
});
