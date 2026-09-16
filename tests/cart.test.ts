import {expect,it} from 'vitest';
import {Game,idleInput,type Input} from '../src/engine';
import {freshSave} from '../src/save';
const step=(g:Game,n=1,input:Partial<Input>={},partner:Partial<Input>={})=>{for(let i=0;i<n;i++)g.update(1/60,{...idleInput(),...input},{...idleInput(),...partner});};
const make=()=>{const g=new Game('ember',0,freshSave().upgrades,140);g.props=[];g.cart={x:290,y:455,goal:900,moving:false,complete:false};return g;};
it('a grounded Heavy from behind launches the cargo while Light and a front hit do not',()=>{
 const light=make();step(light,12,{attack:true});expect(light.cart!.boost??0).toBe(0);
 const g=make();step(g,30,{heavy:true});expect(g.cart!.boost).toBeGreaterThan(0);expect(g.cart!.cooldown).toBeGreaterThan(1);
 const front=make();front.player.x=350;front.player.face=-1;step(front,30,{heavy:true});expect(front.cart!.boost??0).toBe(0);
});
it('the launched cart hits a distant enemy once and keeps moving without an escort until momentum runs out',()=>{
 const g=make(),e=g.spawn('shield',450,455);e.cooldown=20;
 step(g,30,{heavy:true});g.player.x=60;
 const start=g.cart!.x;step(g,60);
 expect(g.cart!.x).toBeGreaterThan(start);expect(e.hp).toBe(e.maxHp-32);expect(g.cart!.hits?.has(e.id)).toBe(true);
 expect(g.cart!.boost).toBe(0);const stopped=g.cart!.x;step(g,30);expect(g.cart!.x).toBe(stopped);expect(e.hp).toBe(e.maxHp-32);
});
it('a planted brute stops the delivery instead of being repeatedly run over',()=>{
 const g=make(),e=g.spawn('brute',450,455);e.windup=8;e.targetX=450;e.targetY=455;
 step(g,30,{heavy:true});step(g,55);
 expect(g.cart!.boost).toBe(0);expect(g.cart!.moving).toBe(false);expect(g.cart!.x).toBeLessThanOrEqual(e.x-60);expect(e.hp).toBe(e.maxHp);
});
it('the axle cooldown prevents a second Heavy from rearming damage during the same rush',()=>{
 const g=make();step(g,30,{heavy:true});const remaining=g.cart!.cooldown!;step(g,1);g.player.x=g.cart!.x-60;
 step(g,30,{heavy:true});expect(g.cart!.cooldown).toBeLessThan(remaining);expect(g.cart!.cooldown).toBeGreaterThan(0);
});
it('a boosted arrival clamps to the destination and grants the existing delivery reward once',()=>{
 const g=make();g.cart!.goal=430;step(g,30,{heavy:true});step(g,150);
 expect(g.cart!.x).toBe(430);expect(g.cart!.complete).toBe(true);expect(g.cart!.moving).toBe(false);expect(g.cart!.boost).toBe(0);expect(g.gold).toBe(40);const xp=g.xp;
 step(g,120,{heavy:true});expect(g.gold).toBe(40);expect(g.xp).toBe(xp);
});
