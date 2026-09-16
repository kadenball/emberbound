import {expect,it} from 'vitest';
import {Game,idleInput,type Input} from '../src/engine';
import {freshSave} from '../src/save';
import {setpieceRunning,trapState} from '../src/setpieces';
const step=(g:Game,n:number,input:Partial<Input>={},partner:Partial<Input>={})=>{for(let i=0;i<n;i++)g.update(1/60,{...idleInput(),...input},{...idleInput(),...partner});};
function fixture(region=0,coop=false) {
 const g=new Game('ember',region*2,freshSave().upgrades,140,{partner:coop?'frost':undefined});
 const trap=g.setpieces.find(t=>t.road)!,chest=g.props.find(p=>p.kind==='chest'&&p.hazard===trap.id)!;
 // Explicit cleared-road fixture; combat and payout are not bypassed in campaign probes.
 Object.assign(g,{wave:1,cleared:true,group:g.encounters[1].groups.length});
 for(const gate of g.props.filter(p=>p.kind==='gate'&&p.x<trap.x)){gate.active=true;const lever=g.props.find(p=>p.link===gate.id);if(lever)lever.active=true;}
 g.player.x=trap.x-55;g.player.y=trap.y;g.player.hp=70;
 return {g,trap,chest};
}
it.each([0,1,2,3,4,5])('region %s offers two supply detours and an unharmed lower route',region=>{
 const {g,trap}=fixture(region);expect(g.setpieces.filter(t=>t.road)).toHaveLength(2);
 expect(g.props.filter(p=>p.kind==='lever'&&g.setpieces.find(t=>t.id===p.hazard)?.road)).toHaveLength(0);
 g.player.y=455;trap.clock=1.05;const hp=g.player.hp;step(g,30,{x:1});expect(g.player.hp).toBe(hp);
 expect(g.setpieces.every(t=>Number.isFinite(t.clock))).toBe(true);
});
it('a first approach gives a full second of warning before a low hazard hits once per cycle',()=>{
 const {g,trap}=fixture();g.player.x=trap.x;
 expect(setpieceRunning(trap,g.wave,g.encounterActive,g.players)).toBe(true);
 step(g,58);expect(trapState(trap).warning).toBe(true);expect(g.player.hp).toBe(70);
 step(g,4);expect(g.player.hp).toBe(52);g.player.invulnerable=0;g.player.hurt=0;step(g,25);expect(g.player.hp).toBe(52);
});
it('closed shutters reject attacks; waiting for a safe opening allows the same Heavy to claim supplies',()=>{
 const {g,trap,chest}=fixture();trap.clock=1.05;g.player.invulnerable=5;
 step(g,22,{heavy:true});expect(chest.active).toBe(false);expect(chest.hp).toBe(26);expect(g.gold).toBe(0);expect(g.events).toContain('clang');
 step(g,22);expect(trapState(trap).active).toBe(false);
 step(g,20,{heavy:true});expect(chest.active).toBe(true);expect(trap.disabled).toBe(true);expect(g.gold).toBe(25);expect(g.player.hp).toBe(95);
});
it('a distant long-reach swing cannot collect the service counter from outside its marked detour',()=>{
 const {g,trap,chest}=fixture();g.player.weapon='sock';g.player.x=trap.x-130;trap.clock=2;
 step(g,20,{heavy:true});expect(chest.active).toBe(false);expect(g.gold).toBe(0);
});
it('claiming supplies creates a durable cleared-road bookmark without duplicating the reward on resume',()=>{
 const {g,trap,chest}=fixture();trap.clock=2;const before=g.bookmarkKey;
 step(g,20,{heavy:true});expect(chest.active).toBe(true);expect(g.bookmarkKey).not.toBe(before);
 const resumed=Game.resumeBookmark(g.exportBookmark()!)!;expect(resumed).not.toBeNull();expect(resumed.gold).toBe(25);expect(resumed.player.hp).toBe(95);
 expect(resumed.props.find(p=>p.id===chest.id)?.active).toBe(true);expect(resumed.setpieces.find(t=>t.id===trap.id)?.disabled).toBe(true);
 step(resumed,90,{heavy:true});expect(resumed.gold).toBe(25);expect(resumed.player.hp).toBe(95);
});
it('two simultaneous claims pay once and heal only the player who reaches the supplies first',()=>{
 const {g,trap}=fixture(0,true);trap.clock=2;Object.assign(g.players[1],{x:g.player.x,y:g.player.y,hp:70});
 step(g,22,{heavy:true},{heavy:true});expect(g.gold).toBe(25);expect(g.players.reduce((sum,p)=>sum+p.hp,0)).toBe(165);
});
it('bookmarks from before road machinery keep their ordinary supply crates',()=>{
 const g=new Game('ember',0,freshSave().upgrades),raw=JSON.parse(g.exportBookmark()!),ids=new Set(raw.snapshot.setpieces.filter((t:any)=>t.road).map((t:any)=>t.id));
 raw.snapshot.setpieces=raw.snapshot.setpieces.filter((t:any)=>!t.road);for(const p of raw.snapshot.props)if(ids.has(p.hazard))delete p.hazard;
 const resumed=Game.resumeBookmark(JSON.stringify(raw))!;expect(resumed).not.toBeNull();expect(resumed.setpieces.some(t=>t.road)).toBe(false);expect(resumed.props.filter(p=>p.kind==='chest')).toHaveLength(3);
});

it('low booth hazards spare an airborne player while overhead supplies record their own defeat advice',async()=>{
 const {defeatAdvice}=await import('../src/defeat');
 for(const region of [0,4]){
  const {g,trap}=fixture(region);trap.clock=1.1;g.player.x=trap.x;g.player.z=100;step(g,1);
  expect(g.player.hp<70).toBe(region===4);
  if(region===4){const receipt=g.damageLog.at(-1)!;expect(receipt.source).toMatchObject({kind:'machine',supply:true});expect(defeatAdvice(receipt).tip).toContain('main road');expect(defeatAdvice(receipt).tip).not.toContain('switch');}
 }
});
