import { expect, it } from 'vitest';
import { Game, idleInput } from '../src/engine';
import { freshSave, buyUpgrade } from '../src/save';
const make=()=>{const g=new Game('ember',0,freshSave().upgrades,7,{weapon:'candy'});g.props=[];g.player.hp=40;g.player.mana=0;return g;};
it('one connected swing cannot multiply healing or refunds across a crowd',()=>{
 const results=[1,5].map(n=>{const g=make();g.player.combo=2;g.player.comboWindow=1;for(let i=0;i<n;i++)g.spawn('brute',255+i,455).cooldown=10;for(let i=0;i<24;i++)g.update(1/60,{...idleInput(),heavy:true});return {hp:g.player.hp,mana:g.player.mana};});
 expect(results[0].hp).toBe(46);
 expect(results[1].hp).toBe(results[0].hp);expect(Math.abs(results[1].mana-results[0].mana)).toBeLessThan(1);
});
it('cash alone cannot buy later surgical ranks before beating a boss',()=>{
 const s=freshSave();s.gold=9999;expect(buyUpgrade(s,'strength')).toBe(true);expect(buyUpgrade(s,'strength')).toBe(false);
});

import { bankPayout, parseSave, surgeryLimit } from '../src/save';
function step(g:Game,n:number,input:Partial<ReturnType<typeof idleInput>>={}){for(let i=0;i<n;i++)g.update(1/60,{...idleInput(),...input});}
it('repeating a failed haul pays no more XP and never banks teeth',()=>{
 const s=freshSave(),run={stage:0,won:false,gold:999,earnedXp:200};
 expect(bankPayout(s,run)).toEqual({gold:0,xp:50});
 const restored=parseSave(JSON.stringify(s));expect(bankPayout(restored,run)).toEqual({gold:0,xp:0});
 expect(bankPayout(restored,{...run,earnedXp:300})).toEqual({gold:0,xp:25});
 expect(bankPayout(restored,{...run,won:true})).toEqual({gold:999,xp:200});
});
it('boss permits unlock the next rank and preserve old upgrades',()=>{
 const s=freshSave();s.best[0]=3;expect(surgeryLimit(s)).toBe(1);s.best[1]=1;expect(surgeryLimit(s)).toBe(2);
 s.upgrades.strength=5;expect(parseSave(JSON.stringify(s)).upgrades.strength).toBe(5);
});
it('Ash fires in the aimed direction and recoils away from the jet',()=>{
 const g=make();g.player.mana=100;const x=g.player.x;step(g,1,{magic:true});
 expect(g.player.x).toBeLessThan(x);expect(g.projectiles[0].vx).toBeGreaterThan(0);expect(g.player.powerPose).toBeGreaterThan(0);
});
it('Wren can splash her finite puddle with a heavy for extra damage',()=>{
 const g=new Game('frost',0,freshSave().upgrades);g.props=[];const e=g.spawn('brute',285,455);e.cooldown=10;
 step(g,1,{magic:true});const hp=e.hp;expect(g.messes[0].kind).toBe('sludge');
 step(g,6,{heavy:true});step(g,30);expect(g.messes.length).toBe(0);expect(e.hp).toBeLessThan(hp);expect(g.player.filth).toBeGreaterThan(0);
});
it('Bram healing requires a decoy explosion to hit, and occurs once',()=>{
 const g=new Game('moss',0,freshSave().upgrades);g.props=[];g.player.hp=50;const e=g.spawn('brute',320,455);e.cooldown=10;
 step(g,1,{magic:true});expect(g.player.hp).toBe(50);expect(g.messes[0].kind).toBe('decoy');
 step(g,1,{heavy:true});step(g,20);expect(g.player.hp).toBe(55);expect(g.messes.length).toBe(0);step(g,40);expect(g.player.hp).toBeLessThanOrEqual(55);
});
it('a decoy lures ordinary enemies and they can bite it to detonate it',()=>{
 const g=new Game('moss',0,freshSave().upgrades);g.props=[];const e=g.spawn('raider',400,455);
 step(g,1,{magic:true});g.player.x=60;const hp=e.hp;step(g,180);
 expect(g.messes.length).toBe(0);expect(e.hp).toBeLessThan(hp);
});
it('meltdown consumes the full meter, costs no guts and cannot repeat for free',()=>{
 const g=make();g.player.mana=0;g.player.filth=100;step(g,1,{magic:true});
 expect(g.meltdowns).toBe(1);expect(g.projectiles.length).toBe(3);expect(g.player.filth).toBe(0);step(g,90,{magic:true});expect(g.meltdowns).toBe(1);
});
it('holding light cannot fill FILTH by repeating the same successful move',()=>{
 const g=make();const e=g.spawn('brute',255,455);e.hp=e.maxHp=10000;e.cooldown=10;
 step(g,120,{attack:true});expect(g.player.filth).toBe(16);
});
it('sustained control produces a visible escape and a finite resistance window',()=>{
 const g=make();g.player.x=60;const e=g.spawn('brute',500,455);e.stun=10;
 step(g,135);expect(e.defiance).toBeGreaterThan(0);expect(e.stun).toBe(0);expect(g.texts.some(t=>t.text==='MAD AS HELL!')).toBe(true);
 step(g,180);expect(e.defiance).toBe(0);
});
it('summoned retinue cannot produce XP, currency or healing pickups',()=>{
 const g=make();g.player.power=1000;const e=g.spawn('raider',255,455);e.summoned=true;
 step(g,25,{attack:true});expect(e.hp).toBeLessThanOrEqual(0);expect(g.earnedXp).toBe(0);expect(g.pickups).toEqual([]);
});
it('brutes ignore the decoy and ranged shots can destroy it',()=>{
 const g=new Game('moss',0,freshSave().upgrades);g.props=[];const brute=g.spawn('brute',360,455);brute.cooldown=10;
 step(g,1,{magic:true});g.player.x=60;step(g,90);expect(brute.x).toBeLessThan(245);expect(g.messes[0].hp).toBe(2);
 const m=g.messes[0];for(let i=0;i<2;i++)g.projectiles.push({x:m.x,y:m.y,z:22,vx:0,vy:0,life:1,friendly:false,damage:10,hit:new Set(),color:'#fff'});
 step(g,1);expect(m.life).toBe(0);expect(g.player.hp).toBe(g.player.maxHp);
});
it.each(['brute','shield'] as const)('repeated real sock heavies cannot keep a durable %s permanently disabled',kind=>{
 const g=new Game('ember',0,freshSave().upgrades,7,{weapon:'sock'});g.props=[];
 const e=g.spawn(kind,270,455);e.hp=e.maxHp=3000;let escaped=false;
 for(let i=0;i<420 && g.state==='playing';i++){g.update(1/60,{...idleInput(),heavy:i%25<4});escaped ||= e.defiance>0 || e.attackTime>0;}
 expect(escaped).toBe(true);expect(g.player.hp).toBeLessThan(g.player.maxHp);
});
