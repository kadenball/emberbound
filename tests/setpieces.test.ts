import { expect, it } from 'vitest';
import { Game, idleInput } from '../src/engine';
import { freshSave } from '../src/save';
import { trapState } from '../src/setpieces';
function fixture(region=0) {
 const g=new Game('ember',region*2,freshSave().upgrades);g.wave=1;g.props=[];
 const trap=g.setpieces[0];g.player.x=trap.x;g.player.y=trap.y;
 return {g,trap};
}
it('machinery grants its full warning before dealing damage, then hits a player only once per cycle',()=>{
 const {g,trap}=fixture();trap.clock=2.6;g.update(.05,idleInput());expect(trapState(trap).warning).toBe(true);expect(g.player.hp).toBe(g.player.maxHp);
 trap.clock=2.85;g.update(.05,idleInput());expect(g.player.hp).toBe(g.player.maxHp-18);
 g.player.invulnerable=0;g.player.hurt=0;g.hitStop=0;g.update(.05,idleInput());expect(g.player.hp).toBe(g.player.maxHp-18);
});
it('low hazards can be jumped; overhead presses require a different lane',()=>{
 for(const region of [0,4]) {const {g,trap}=fixture(region);trap.clock=2.85;g.player.z=100;g.update(.01,idleInput());expect(g.player.hp).toBe(g.player.maxHp-(region===4?23:0));}
 const {g,trap}=fixture(4);trap.clock=2.85;g.player.y=trap.y+39;g.update(.01,idleInput());expect(g.player.hp).toBe(g.player.maxHp);
});
it('baited enemies take machinery damage, and bonking the switch disables the linked machine',()=>{
 const {g,trap}=fixture();g.player.y=530;const e=g.spawn('brute',trap.x,trap.y);e.stun=5;trap.clock=2.85;g.update(.01,idleInput());expect(e.hp).toBe(e.maxHp-48);
 const game=new Game('ember',0,freshSave().upgrades);const machine=game.setpieces[0],lever=game.props.find(p=>p.hazard===machine.id)!;
 lever.x=245;lever.y=455;for(let i=0;i<12;i++)game.update(1/60,{...idleInput(),attack:true});expect(machine.disabled).toBe(true);expect(lever.active).toBe(true);
});
it('dormant and disabled machinery never damages outside its encounter',()=>{
 const {g,trap}=fixture();trap.clock=2.85;g.wave=0;g.update(.01,idleInput());expect(g.player.hp).toBe(g.player.maxHp);
 g.wave=1;trap.disabled=true;g.update(.01,idleInput());expect(g.player.hp).toBe(g.player.maxHp);
});
it('syrup slows grounded movement during its warning, while jumping clears the glue',()=>{
 const ground=fixture(3),air=fixture(3);for(const q of [ground,air])q.trap.clock=1.7;air.g.player.z=100;
 ground.g.update(.01,{...idleInput(),x:1});air.g.update(.01,{...idleInput(),x:1});expect(air.g.player.x-air.trap.x).toBeGreaterThan(ground.g.player.x-ground.trap.x);
});
