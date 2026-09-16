import {expect,it} from 'vitest';
import {Game,idleInput,type Input} from '../src/engine';
import {freshSave} from '../src/save';
import {parseBookmark,stringifyBookmark} from '../src/fight-bookmark';
import {readFileSync} from 'node:fs';
import {playInput} from '../scripts/gameplay-policy';

function fixture(stage=4,partner?:'frost') {
  const g=new Game('ember',stage,freshSave().upgrades,140,{partner}),flow=g.flows[0];
  g.wave=flow.encounter;g.machines=[];g.props=g.props.filter(p=>p.flow!==undefined);
  g.player.x=flow.x+200;g.player.y=flow.y;
  // Keep the encounter active without incidental combat in a terrain contract fixture.
  for(let i=0;i<3;i++){const e=g.spawn('raider',g.currentEncounter.x+30,430);e.stun=99;}
  return {g,flow,brake:g.props[0]};
}
const step=(g:Game,n=12,input:Partial<Input>={})=>{for(let i=0;i<n;i++)g.update(1/60,{...idleInput(),...input});};

it('the rinse carries feet without damage, while a real jump avoids most of its drift',()=>{
  const ground=fixture(),air=fixture(),start=ground.g.player.x;
  step(ground.g);step(air.g,12,{jump:true});
  expect(ground.g.player.x-start).toBeCloseTo(22);expect(air.g.player.x-start).toBeLessThan(5);
  expect(air.g.player.z).toBeGreaterThan(50);expect(ground.g.player.hp).toBe(ground.g.player.maxHp);
});
it('opposing belts move two grounded partners apart and leave a dry center lane',()=>{
  const {g,flow}=fixture(8,'frost'),other=g.flows[1];g.players[1].x=g.player.x;g.players[1].y=other.y;
  const start=g.player.x;step(g);expect(g.player.x-start).toBeCloseTo(25);expect(g.players[1].x-start).toBeCloseTo(-25);
  const dry=fixture(8);dry.g.player.y=450;const before=dry.g.player.x;step(dry.g);expect(dry.g.player.x).toBe(before);
  expect(flow.encounter).toBe(other.encounter);
});
it('a roll keeps its own displacement and leaving a belt stops the drift',()=>{
  const moving=fixture(8),stopped=fixture(8);stopped.brake.active=true;
  step(moving.g,6,{dodge:true,x:1});step(stopped.g,6,{dodge:true,x:1});expect(moving.g.player.x).toBeCloseTo(stopped.g.player.x);
  const edge=fixture(8);edge.g.player.x=edge.flow.x+edge.flow.width-1;step(edge.g,1);const after=edge.g.player.x;step(edge.g,10);expect(edge.g.player.x).toBe(after);
});
it('a planted brute holds position while an unbraced, stunned enemy rides the current',()=>{
  const {g,flow}=fixture();const braced=g.spawn('brute',flow.x+350,flow.y),loose=g.spawn('shield',flow.x+450,flow.y);
  braced.windup=.7;braced.targetX=g.player.x;braced.targetY=g.player.y;loose.stun=10;
  const x=braced.x,y=loose.x;step(g);expect(braced.x).toBe(x);expect(loose.x-y).toBeCloseTo(22);
});
it('physical sacs and loose pickups ride the current without changing the fuse or causing damage',()=>{
  const {g,flow}=fixture(),x=flow.x+450;
  g.dangers=[{x,y:flow.y,radius:74,timer:1.25,damage:20,color:'#fff',sac:{returned:false,vx:0}},{x,y:flow.y,radius:80,timer:1.25,damage:20,color:'#fff',kind:'jaw'}];
  g.pickups=[{x,y:flow.y,kind:'gold',value:10,phase:0}];step(g);
  expect(g.dangers[0].x-x).toBeCloseTo(22);expect(g.dangers[0].timer).toBeCloseTo(1.05);
  expect(g.dangers[1].x).toBe(x);expect(g.pickups[0].x-x).toBeCloseTo(22);expect(g.player.hp).toBe(g.player.maxHp);
});
it('a real Light bonks the shared brake once, stopping both lanes with the existing one-time switch XP',()=>{
  const {g,brake}=fixture(8);g.player.x=brake.x-50;g.player.y=brake.y;const xp=g.xp;
  expect(g.flows.every(f=>g.flowRunning(f))).toBe(true);step(g,12,{attack:true});expect(brake.active).toBe(true);expect(g.setpieces.find(t=>t.id===brake.hazard)?.disabled).toBe(true);
  expect(g.flows.every(f=>!g.flowRunning(f))).toBe(true);expect(g.xp).toBe(xp+20);step(g,30,{attack:true});expect(g.xp).toBe(xp+20);
  expect(g.objective).toContain('LINE STOPPED');
  expect(g.texts.filter(t=>t.text==='UNPAID BREAK!')).toHaveLength(1);
});
it('old bookmarks without a brake keep the new terrain stationary; current brake state round-trips',()=>{
  const g=new Game('ember',8,freshSave().upgrades,140),b=parseBookmark(g.exportBookmark())!;
  const control=b.snapshot.props.find(p=>p.flow===0)!;expect(control).toBeDefined();control.active=true;
  const restored=Game.resumeBookmark(stringifyBookmark(b))!;restored.wave=2;expect(restored.flows.every(f=>!restored.flowRunning(f))).toBe(true);
  b.snapshot.props=b.snapshot.props.filter(p=>p.flow===undefined);const old=Game.resumeBookmark(stringifyBookmark(b))!;old.wave=2;
  expect(old.flows.every(f=>!old.flowRunning(f))).toBe(true);
});
it('normal campaign inputs carry a stopped line into the next durable encounter bookmark',()=>{
  const p=JSON.parse(readFileSync('docs/COMBAT-AUDIT-0.28.json','utf8')).profiles.find((p:{hero:string;stage:number})=>p.hero==='ember'&&p.stage===8);
  const g=new Game(p.hero,p.stage,p.upgrades,140,p);
  for(let f=0;f<18000&&g.state==='playing'&&g.wave<3;f++){g.update(1/60,playInput(g,f));g.events=[];}
  expect(g.wave).toBe(3);expect(g.state).toBe('playing');expect(g.props.find(q=>q.flow===0)?.active).toBe(true);
  const restored=Game.resumeBookmark(g.exportBookmark()!)!;expect(restored).not.toBeNull();expect(restored.xp).toBe(g.xp);
  expect(restored.props.find(q=>q.flow===0)?.active).toBe(true);expect(restored.flows.every(f=>!restored.flowRunning(f))).toBe(true);
});
