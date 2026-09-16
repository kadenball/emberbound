import { describe, expect, it } from 'vitest';
import { Game, idleInput, type Input } from '../src/engine';
import { freshSave } from '../src/save';
const make=(weapon:'starter'|'pan'|'sock'='starter',partner?:'frost',stage=0)=>new Game('ember',stage,freshSave().upgrades,44,{weapon,partner});
const step=(g:Game,n:number,input:Partial<Input>={},second:Partial<Input>={})=>{for(let i=0;i<n;i++)g.update(1/60,{...idleInput(),...input},{...idleInput(),...second});};
describe('deliberate combat',()=>{
 it('has visible startup, one contact per enemy, and recovery before another move',()=>{
  const g=make(),e=g.spawn('brute',260,455);e.cooldown=10;g.props=[];
  step(g,3,{attack:true});expect(e.hp).toBe(e.maxHp);
  step(g,6,{attack:true});const hp=e.hp;expect(hp).toBeLessThan(e.maxHp);
  step(g,5,{attack:true});expect(e.hp).toBe(hp);expect(g.player.attack).not.toBeNull();
 });
 it('queues one late heavy tap, but does not endlessly replay it',()=>{
  const g=make();g.props=[];step(g,13,{attack:true});step(g,1,{heavy:true});step(g,10);
  expect(g.player.attack?.move.kind).toBe('launcher');step(g,60);expect(g.player.attack).toBeNull();
 });
 it('counts swings rather than enemies for light-heavy recipes',()=>{
  const g=make();g.props=[];g.spawn('brute',260,455);g.spawn('brute',265,450);step(g,9,{attack:true});
  expect(g.comboHits).toBe(2);expect(g.player.combo).toBe(1);
 });
 it('can launch, jump-cancel recovery, and juggle using actual inputs',()=>{
  const g=make();g.props=[];const e=g.spawn('brute',260,455);e.cooldown=10;
  step(g,12,{heavy:true});expect(e.z).toBeGreaterThan(0);step(g,5,{jump:true});step(g,10,{attack:true});
  expect(g.juggles).toBeGreaterThan(0);expect(g.player.attack?.move.kind).toBe('air');expect(e.z).toBeGreaterThan(30);
 });
 it('does not permanently stagger a committed brute with held light',()=>{
  const g=make();g.props=[];g.spawn('brute',265,455);step(g,200,{attack:true});
  expect(g.events).toContain('hurt');
 });
 it('bowls a body into another enemy and redirects it off a spring',()=>{
  const g=make('pan');g.props=[];const first=g.spawn('brute',270,455),second=g.spawn('brute',420,455);first.cooldown=second.cooldown=10;
  g.props.push({id:900,kind:'spring',x:330,y:455,hp:1,active:false});
  step(g,45,{heavy:true});expect(g.events).toContain('bounce');expect(g.bowlingHits).toBeGreaterThan(0);expect(second.hp).toBeLessThan(second.maxHp);
 });
 it('a sock pulls a distant target without pretending to be a wide pan',()=>{
  const g=make('sock');g.props=[];const e=g.spawn('brute',400,455);e.cooldown=10;step(g,12,{heavy:true});
  expect(e.x-g.player.x).toBeLessThan(110);expect(e.bowlTime).toBe(0);
 });
});
describe('authored objectives and boss openings',()=>{
 it('keeps an encounter locked until reinforcements are actually defeated',()=>{
  const g=make();g.player.x=330;step(g,60);
  for(const e of g.enemies)e.hp=0;step(g,25);
  expect(g.enemies.some(e=>e.hp>0)).toBe(true);expect(g.objective).toContain('Heavy');
 });
 it('moves a cart only with a nearby living player and a clear path',()=>{
  const g=make();g.props=[];g.cart={x:230,y:455,goal:300,moving:false,complete:false};
  const blocker=g.spawn('shield',260,455);step(g,10);expect(g.cart.x).toBe(230);
  blocker.hp=0;step(g,50);expect(g.cart.complete).toBe(true);expect(g.gold).toBe(40);
 });
 it('confines the bridge to its visible lane',()=>{
  const g=make();g.wave=1;g.player.x=1500;g.player.y=430;step(g,30,{y:-1});expect(g.player.y).toBe(420);
 });
 it('jams Madame by bowling a bundle into her open drum, then exposes a damage window',()=>{
  const g=make('starter',undefined,5);g.props=[];const boss=g.spawn('boss',400,455);boss.bossState='inhale';boss.bossTimer=3.6;boss.face=-1;
  g.props.push({id:900,kind:'laundry',x:270,y:455,hp:1,active:false,vx:0});
  step(g,40,{heavy:true});expect(boss.bossState).toBe('jammed');expect(boss.hp).toBeLessThan(boss.maxHp-100);expect(g.events).toContain('jam');
  step(g,240);expect(boss.bossState).not.toBe('jammed');
 });
});
describe('local cooperative play',()=>{
 it('moves and attacks independently and keeps partners within the shared camera',()=>{
  const g=make('starter','frost');g.props=[];step(g,15,{y:-1},{y:1,heavy:true});
  expect(g.players[0].y).toBeLessThan(455);expect(g.players[1].y).toBeGreaterThan(490);expect(g.players[0].attack).toBeNull();expect(g.players[1].attack).not.toBeNull();
  step(g,220,{x:1},{x:-1});expect(Math.abs(g.players[0].x-g.players[1].x)).toBeLessThanOrEqual(680);
 });
 it('lets a surviving friend revive a downed player without paying mana',()=>{
  const g=make('starter','frost');g.props=[];const ally=g.players[1];ally.x=190;ally.y=455;ally.hp=0;ally.downed=true;const mana=g.player.mana;
  step(g,125,{magic:true});expect(ally.downed).toBe(false);expect(ally.hp).toBeGreaterThan(0);expect(g.revives).toBe(1);expect(g.player.mana).toBe(mana);
 });
 it('loses only when both players are down, and banks loose gold once',()=>{
  const g=make('starter','frost');g.props=[];g.player.hp=0;g.player.downed=true;const ally=g.players[1];ally.hp=1;
  const foe=g.spawn('shield',ally.x+40,ally.y);foe.windup=.01;g.pickups.push({x:900,y:400,kind:'gold',value:13,phase:0});
  step(g,1);expect(g.state).toBe('lost');expect(g.gold).toBe(13);step(g,30);expect(g.gold).toBe(13);
 });
 it('shares discovered ownership while each player keeps their equipped weapon',()=>{
  const g=make('starter','frost');g.props=[];g.players[1].x=190;g.players[1].y=455;
  g.props.push({id:900,kind:'chest',x:250,y:455,hp:1,active:false,weapon:'sock'});step(g,10,{}, {attack:true});
  expect(g.foundWeapons).toEqual(['sock']);expect(g.players[1].weapon).toBe('sock');expect(g.weapon).toBe('starter');
 });
});
