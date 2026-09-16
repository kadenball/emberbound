import { expect, it } from 'vitest';
import { Game, idleInput } from '../src/engine';
import { freshSave } from '../src/save';
import { RunSession, earnedStars } from '../src/run-session';
import { defeatAdvice } from '../src/defeat';
import { playInput } from '../scripts/gameplay-policy';
function opening(partner=false) {
 const g=new Game('ember',0,freshSave().upgrades,12,{partner:partner?'frost':undefined});
 for(let i=0;i<60 && g.wave<0;i++)g.update(1/60,{...idleInput(),x:1},idleInput());
 return g;
}
function lose(g:Game) {
 g.hitStop=0;for(const p of g.players){p.invulnerable=0;p.z=p.vz=0;g.dangers.push({x:p.x,y:p.y,radius:100,timer:0,damage:9999,color:'#fff',source:{kind:'enemy',enemy:'bomber',region:g.config.region}});}
 g.update(1/60,idleInput());expect(g.state).toBe('lost');
}
it('creates a checkpoint at the real encounter entrance and refuses live/won retries',()=>{
 const g=opening();expect(g.retryPoint?.encounter).toBe(1);expect(g.retryPoint?.hp).toEqual([120]);expect(g.retryEncounter()).toBe(false);
 g.state='won';expect(g.retryEncounter()).toBe(false);
});
it('restores rewards, equipment, switches, RNG-driven entrances and health repeatedly without sharing mutable snapshots',()=>{
 const g=opening();const start={xp:g.xp,gold:g.gold,weapon:g.weapon};
 // Smash the real opening weapon chest during the failed fight.
 g.player.x=240;g.player.y=500;for(let i=0;i<24;i++)g.update(1/60,{...idleInput(),attack:true});expect(g.foundWeapons).toContain('pan');
 g.props.find(p=>p.kind==='lever')!.active=true;g.setpieces[0].disabled=true;
 lose(g);expect(g.retryEncounter()).toBe(true);expect(g.weapon).toBe(start.weapon);expect(g.foundWeapons).toEqual([]);expect(g.xp).toBe(start.xp);expect(g.gold).toBe(start.gold);expect(g.props.find(p=>p.kind==='lever')!.active).toBe(false);expect(g.setpieces[0].disabled).toBe(false);expect(g.player.hp).toBe(120);
 const entrance=g.enemies.map(e=>({x:e.x,hp:e.hp,cooldown:e.cooldown}));g.enemies[0].hp=1;g.player.hp=5;lose(g);expect(g.retryEncounter()).toBe(true);expect(g.enemies.map(e=>({x:e.x,hp:e.hp,cooldown:e.cooldown}))).toEqual(entrance);expect(g.player.hp).toBe(120);expect(g.retries).toBe(2);expect(g.totalTime).toBeGreaterThan(g.time);
});
it('a later checkpoint preserves cleared fights and pre-fight rewards, but does not heal beyond its entry condition',()=>{
 const g=opening();for(let frame=0;frame<60*180 && g.wave<1 && g.state==='playing';frame++)g.update(1/60,playInput(g,frame));
 expect(g.wave).toBe(1);const point=g.retryPoint!,gold=g.gold,xp=g.xp,kills=g.kills;
 expect(gold).toBeGreaterThan(0);expect(xp).toBeGreaterThan(0);lose(g);g.retryEncounter();
 expect(g.wave).toBe(1);expect(g.gold).toBe(gold);expect(g.xp).toBe(xp);expect(g.kills).toBe(kills);expect(Math.ceil(g.player.hp)).toBe(point.hp[0]);expect(g.enemies.filter(e=>e.hp>0).map(e=>e.kind)).toEqual(['brute','flanker']);
});
it('co-op retries restore both independent fighters and clear stale attack edges',()=>{
 const g=opening(true);lose(g);expect(g.retryEncounter()).toBe(true);expect(g.players.map(p=>p.downed)).toEqual([false,false]);expect(g.players.map(p=>p.hp)).toEqual([120,105]);expect(g.players.every(p=>!p.attackHeld && p.queued===null)).toBe(true);
});
it('defeat preview and repeated retries cannot bank or farm rewards, and a later win banks only its final restored haul',()=>{
 const save=freshSave(),g=opening(),run=new RunSession(g,save);
 g.earnedXp=200;g.gold=80;lose(g);expect(run.payout).toEqual({gold:0,xp:50});expect(save.xp).toBe(0);expect(run.retry()).toBe(true);
 expect(g.earnedXp).toBe(0);expect(g.gold).toBe(0);expect(save.xp).toBe(0);expect(save.failureBest[0]).toBe(0);
 g.earnedXp=140;g.gold=55;g.state='won';expect(run.settle()).toEqual({gold:55,xp:140});expect(save.xp).toBe(140);expect(save.gold).toBe(55);expect(save.unlocked).toBe(1);run.settle();expect(save.xp).toBe(140);expect(run.retry()).toBe(false);
});
it('accepting defeat retains weapons, pays capped XP once and prevents resuming that settled run',()=>{
 const save=freshSave(),g=opening(),run=new RunSession(g,save);g.earnedXp=200;g.foundWeapons=['pan'];g.player.weapon='pan';lose(g);
 expect(run.settle()).toEqual({gold:0,xp:50});run.settle();expect(save.xp).toBe(50);expect(save.weapons).toContain('pan');expect(save.equipped).toBe('pan');expect(run.retry()).toBe(false);
 const again=opening(),second=new RunSession(again,save);again.earnedXp=200;lose(again);expect(second.settle().xp).toBe(0);
});
it('practice and abandoning a live chapter leave the saved profile untouched',()=>{
 const save=freshSave(),before=structuredClone(save),g=opening(),practice=new RunSession(g,save,true);g.earnedXp=400;g.gold=200;lose(g);practice.settle();expect(save).toEqual(before);
 const live=new RunSession(opening(),save);live.game.earnedXp=400;live.settle();expect(save).toEqual(before);expect(live.settled).toBe(false);
});
it('a retry retains access to victory rewards but the third mastery star requires a clean run',()=>{
 const g=opening();g.state='won';expect(earnedStars(g)).toBe(3);g.state='playing';lose(g);g.retryEncounter();g.state='won';expect(earnedStars(g)).toBe(2);
});
it('actual delayed damage retains its culprit and ignored damage does not overwrite the report',()=>{
 const g=new Game('ember',0,freshSave().upgrades);g.dangers.push({x:200,y:455,radius:100,timer:.01,damage:20,color:'#fff',source:{kind:'enemy',enemy:'bomber',region:0}});g.update(.02,idleInput());
 expect(g.damageLog.at(-1)?.source).toEqual({kind:'enemy',enemy:'bomber',region:0});expect(defeatAdvice(g.damageLog.at(-1)).tip).toContain('two stink sacs');
 g.dangers.push({x:200,y:455,radius:100,timer:0,damage:20,color:'#fff',source:{kind:'machine',machine:'press'}});g.update(.02,idleInput());expect(g.damageLog).toHaveLength(1);
});
it('can finish a real chapter after restoring a failed later fight, with earlier encounter state intact',()=>{
 const save=freshSave(),g=opening(),run=new RunSession(g,save);
 for(let frame=0;frame<60*180 && g.wave<1 && g.state==='playing';frame++)g.update(1/60,playInput(g,frame));expect(g.wave).toBe(1);
 lose(g);expect(run.retry()).toBe(true);
 for(let frame=0;frame<60*240 && g.state==='playing';frame++)g.update(1/60,playInput(g,frame));
 expect(g.state).toBe('won');expect(g.wave).toBe(g.encounterCount-1);const earned=g.earnedXp,gold=g.gold;run.settle();expect(save.xp).toBe(earned);expect(save.gold).toBe(gold);expect(save.best[0]).toBeLessThan(3);expect(save.unlocked).toBe(1);
});
