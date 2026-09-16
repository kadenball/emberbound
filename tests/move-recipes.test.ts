import {expect,it} from 'vitest';
import {Game,idleInput,type Input} from '../src/engine';
import {WEAPONS,xpForLevel,type WeaponId} from '../src/content';
import {heavyHint} from '../src/combat';
const make=(weapon:WeaponId='starter',level=4)=>{const g=new Game('ember',0,{strength:0,vitality:0,spirit:0},140,{weapon,xp:xpForLevel(level)});g.props=[];return g;};
const step=(g:Game,n:number,input:Partial<Input>={})=>{for(let i=0;i<n;i++)g.update(1/60,{...idleInput(),...input});};
it.each(WEAPONS.map(w=>w.id))('%s keeps the earned bowl and spin recipes at level four',weapon=>{
 for(const [count,kind] of [[2,'bowl'],[3,'spin']] as const){const g=make(weapon);g.player.combo=count;g.player.comboWindow=.9;expect(heavyHint(g.player,g.level,g.style)).toContain(kind.toUpperCase());step(g,1,{heavy:true});expect(g.player.attack?.move.kind).toBe(kind);}
});
it('three connected Light inputs offer spin or the separate Down-Heavy quake',()=>{
 const g=make();const foe=g.spawn('brute',265,455);foe.stun=10;foe.hp=foe.maxHp=1000;
 for(let i=0;i<100&&g.player.combo<3;i++)step(g,1,{attack:true,x:foe.x-g.player.x>55?1:0});expect(g.player.combo).toBe(3);
 expect(heavyHint(g.player,g.level,g.style)).toContain('↓ + HEAVY: QUAKE');
 // Tap during Light recovery, then release Down. The buffered intent must survive.
 // Game.update returns false during hit-stop; the real input adapter retains taps then.
 let accepted=false;for(let i=0;i<12&&!accepted;i++)accepted=g.update(1/60,{...idleInput(),heavy:true,y:1});expect(accepted).toBe(true);
 for(let i=0;i<30&&g.player.attack?.move.kind==='light';i++)step(g,1);
 expect(g.player.attack?.move.kind).toBe('quake');
});
it('expired chain hits cannot be banked into the next attack',()=>{
 const g=make();const foe=g.spawn('brute',265,455);foe.stun=10;foe.hp=foe.maxHp=1000;
 for(let i=0;i<70&&g.player.combo<2;i++)step(g,1,{attack:true});expect(g.player.combo).toBe(2);
 step(g,90);expect(g.player.comboWindow).toBe(0);expect(g.player.combo).toBe(0);expect(heavyHint(g.player,g.level,g.style)).toBe('HEAVY → LAUNCH');
 foe.x=g.player.x+65;foe.vx=0;for(let i=0;i<20&&g.player.combo===0;i++)step(g,1,{attack:true});expect(g.player.combo).toBe(1);
});
it('the royal brush really spins and bowls nearby bodies instead of applying hidden launcher physics',()=>{
 const g=make('crown');const foe=g.spawn('brute',260,455);foe.stun=10;step(g,20,{heavy:true});
 expect(g.player.attack?.move.kind).toBe('spin');expect(foe.bowlTime).toBeGreaterThan(0);expect(foe.vz).toBeLessThan(300);
});
it('the level-eight directional counter quake is available without banking prior Lights',()=>{
 const g=make('starter',8);g.player.counter=1;g.player.uppercutWindow=.5;
 expect(heavyHint(g.player,g.level,g.style)).toContain('↓ + HEAVY: QUAKE');step(g,1,{heavy:true,y:1});expect(g.player.attack?.move.kind).toBe('quake');expect(g.player.attack?.counter).toBe(true);expect(g.player.attack?.move.reach).toBe(230);
});
