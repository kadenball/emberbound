import { expect, it, vi } from 'vitest';
import { Game, idleInput } from '../src/engine';
import { freshSave, parseSave, writeSave } from '../src/save';
import { parseBookmark } from '../src/fight-bookmark';
import { RunSession } from '../src/run-session';
import { playInput } from '../scripts/gameplay-policy';
import { Preferences } from '@capacitor/preferences';
vi.mock('@capacitor/preferences',()=>({Preferences:{set:vi.fn(async()=>{}),get:vi.fn(async()=>({value:null}))}}));
function laterFight(partner=false, stage=0) {
  const g=new Game('ember',stage,{strength:1,vitality:1,spirit:1},140,{xp:450,weapons:['starter','pan'],weapon:'pan',partner:partner?'frost':undefined});
  for(let f=0;f<60*180 && g.wave<1 && g.state==='playing';f++)g.update(1/60,playInput(g,f),partner?playInput(g,f+15,1):idleInput());
  expect(g.wave).toBe(1);return g;
}
it('can pocket and restore the trailhead before any fight has started',()=>{
  const g=new Game('moss',0,freshSave().upgrades),raw=g.exportBookmark()!,resumed=Game.resumeBookmark(raw)!;
  expect(resumed).not.toBeNull();expect(resumed.wave).toBe(-1);expect(resumed.retryPoint?.title).toBe('The trailhead');expect(resumed.player.hero).toBe('moss');expect(resumed.retries).toBe(1);
});
it('saves a just-cleared fight immediately, without replaying it or granting another clear reward',()=>{
  const g=new Game('ember',0,freshSave().upgrades,140);
  for(let f=0;f<60*90 && !g.retryPoint?.between && g.state==='playing';f++)g.update(1/60,playInput(g,f));
  expect(g.retryPoint?.between).toBe(true);expect(g.wave).toBe(0);
  const r=Game.resumeBookmark(g.exportBookmark()!)!;expect(r).not.toBeNull();expect(r.encounterActive).toBe(false);expect(r.retryPoint?.encounter).toBe(2);
  expect(r.gold).toBe(g.gold);expect(r.xp).toBe(g.xp);expect(r.player.hp).toBe(g.player.hp);
  const gold=r.gold,xp=r.xp;for(let i=0;i<20;i++)r.update(1/60,idleInput());expect(r.gold).toBe(gold);expect(r.xp).toBe(xp);
  for(let f=0;f<600 && r.wave<1;f++)r.update(1/60,playInput(r,f));expect(r.wave).toBe(1);
});
it('a completed sabotage stays wrecked after resuming its cleared road',()=>{
  const g=new Game('ember',0,freshSave().upgrades,140);
  for(let f=0;f<60*180 && !(g.wave===2&&g.retryPoint?.between) && g.state==='playing';f++)g.update(1/60,playInput(g,f));
  expect(g.wave).toBe(2);expect(g.retryPoint?.between).toBe(true);
  const r=Game.resumeBookmark(g.exportBookmark()!)!;expect(r.machines[0].phase).toBe('wrecked');expect(r.machines[0].fired.size).toBeGreaterThan(0);expect(r.props.find(p=>p.kind==='bell')?.active).toBe(true);expect(r.gold).toBe(g.gold);expect(r.xp).toBe(g.xp);
});
it('JSON round-trip restores the same exact later-fight state as an in-memory retry',()=>{
  const g=laterFight();for(let f=0;f<60;f++)g.update(1/60,playInput(g,f));
  const raw=g.exportBookmark()!;expect(raw.length).toBeLessThan(150000);
  const resumed=Game.resumeBookmark(raw)!;expect(resumed).not.toBeNull();g.state='lost';g.retryEncounter();
  expect(resumed.players).toEqual(g.players);expect(resumed.props).toEqual(g.props);expect(resumed.enemies).toEqual(g.enemies);expect(resumed.machines).toEqual(g.machines);expect(resumed.setpieces).toEqual(g.setpieces);expect(resumed.totalTime).toBeCloseTo(g.totalTime,8);expect(resumed.gold).toBe(g.gold);expect(resumed.earnedXp).toBe(g.earnedXp);expect(resumed.retries).toBe(g.retries);
  expect(resumed.enemies[0].bowlHits).toBeInstanceOf(Set);expect(resumed.setpieces[0].hits).toBeInstanceOf(Set);
  resumed.enemies[0].bowlHits.add(999);expect(g.enemies[0].bowlHits.has(999)).toBe(false);
});
it('restores two independent partners, their entry resources and cleared fight rewards',()=>{
  const g=laterFight(true),r=Game.resumeBookmark(g.exportBookmark()!)!;
  expect(r.players).toHaveLength(2);expect(r.players.map(p=>p.hero)).toEqual(['ember','frost']);expect(r.retryPoint?.hp).toEqual(g.retryPoint?.hp);expect(r.gold).toBeGreaterThan(0);
  for(let f=0;f<60*240 && r.state==='playing';f++)r.update(1/60,playInput(r,f),playInput(r,f+15,1));expect(r.state).toBe('won');
});
it('a resumed boss chapter can reach victory, bank once and consume its bookmark',()=>{
  const g=laterFight(false,1),save=freshSave();save.xp=450;save.unlocked=1;save.upgrades={strength:1,vitality:1,spirit:1};
  new RunSession(g,save).bookmark();const raw=save.resume!,disk=parseSave(JSON.stringify(save)),r=Game.resumeBookmark(disk.resume!)!,run=new RunSession(r,disk);
  for(let f=0;f<60*240 && r.state==='playing';f++)r.update(1/60,playInput(r,f));expect(r.state).toBe('won');
  const payout=run.settle(),gold=disk.gold,xp=disk.xp;expect(disk.resume).toBeNull();expect(disk.best[1]).toBeGreaterThan(0);expect(disk.best[1]).toBeLessThan(3);run.settle();expect(disk.gold).toBe(gold);expect(disk.xp).toBe(xp);expect(payout.gold).toBeGreaterThan(0);
  expect(parseSave(JSON.stringify({...disk,resume:raw})).resume).toBeNull();
});
it('practice cannot overwrite or remove a campaign bookmark; abandoning the campaign can',()=>{
  const save=freshSave(),campaign=new RunSession(new Game('ember',0,save.upgrades),save);campaign.bookmark();const raw=save.resume;
  const practice=new RunSession(new Game('frost',5,save.upgrades),save,true);expect(practice.bookmark()).toBe(false);practice.abandon();practice.game.state='won';practice.settle();expect(save.resume).toBe(raw);
  campaign.abandon();expect(save.resume).toBeNull();
});
it('rejects corrupt, incompatible and impossible bookmarks without losing the banked profile',()=>{
  const raw=laterFight().exportBookmark()!,data=JSON.parse(raw);
  const variants=[null,'broken','x'.repeat(750001),JSON.stringify({...data,rules:2}),JSON.stringify({...data,stage:99}),JSON.stringify({...data,snapshot:{...data.snapshot,group:2}}),JSON.stringify({...data,snapshot:{...data.snapshot,players:[]}}),JSON.stringify({...data,snapshot:{...data.snapshot,players:[{...data.snapshot.players[0],hero:'script',hp:null}]}}),JSON.stringify({...data,snapshot:{...data.snapshot,enemies:Array(65).fill(data.snapshot.enemies[0])}})];
  for(const resume of variants){expect(parseBookmark(resume)).toBeNull();const save=parseSave(JSON.stringify({version:2,xp:450,gold:230,unlocked:4,resume}));expect(save.resume).toBeNull();expect(save.gold).toBe(230);expect(save.xp).toBe(450);expect(save.unlocked).toBe(4);}
});
it('strips unexpected snapshot fields before they can replace simulation methods',()=>{
  const raw=new Game('ember',0,freshSave().upgrades).exportBookmark()!,data=JSON.parse(raw);data.snapshot.update='hijacked';data.snapshot.state='won';data.snapshot.__proto__={polluted:true};
  const r=Game.resumeBookmark(JSON.stringify(data))!;expect(typeof r.update).toBe('function');expect(r.state).toBe('playing');expect((r as unknown as {polluted?:boolean}).polluted).toBeUndefined();
});
it('orders pending bookmark and settlement writes, with payout and removal in one saved record',async()=>{
  const write=vi.mocked(Preferences.set);write.mockClear();let finishFirst!:()=>void;
  write.mockImplementationOnce(()=>new Promise<void>(resolve=>{finishFirst=resolve;}));
  const save=freshSave(),g=new Game('ember',0,save.upgrades),run=new RunSession(g,save);run.bookmark();const pending=writeSave(save);await vi.waitFor(()=>expect(write).toHaveBeenCalledTimes(1));
  g.state='won';g.gold=123;g.earnedXp=175;run.settle();const settled=writeSave(save);expect(write).toHaveBeenCalledTimes(1);
  finishFirst();await pending;await settled;expect(write).toHaveBeenCalledTimes(2);
  const first=JSON.parse(write.mock.calls[0][0].value),last=JSON.parse(write.mock.calls[1][0].value);
  expect(first.resume).not.toBeNull();expect(first.gold).toBe(0);expect(last.resume).toBeNull();expect(last.gold).toBe(123);expect(last.xp).toBe(175);
});
