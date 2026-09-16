import {expect,it} from 'vitest';
import {Game,idleInput,type Danger,type Input} from '../src/engine';
import {freshSave} from '../src/save';
import {parseBookmark,stringifyBookmark} from '../src/fight-bookmark';

const make=(partner?:'frost')=>{const g=new Game('ember',4,freshSave().upgrades,140,{partner});g.props=[];return g;};
const step=(g:Game,n=1,input:Partial<Input>={},second:Partial<Input>={})=>{for(let i=0;i<n;i++)g.update(1/60,{...idleInput(),...input},{...idleInput(),...second});};
const sac=(g:Game,overrides:Partial<Danger>={}):Danger=>({x:g.player.x+50,y:g.player.y,radius:74,timer:.8,damage:20,color:'#e9ab89',source:{kind:'enemy',enemy:'bomber',region:2},sac:{returned:false,vx:0},...overrides});

it('the tick commits two separately timed physical sacs to the marked positions',()=>{
 const g=make(),e=g.spawn('bomber',440,455);e.cooldown=0;step(g);
 const marked={x:e.targetX,y:e.targetY};expect(e.windup).toBeGreaterThan(0);
 for(let i=0;i<60&&!g.dangers.length;i++)step(g,1,{y:-1});
 expect(g.dangers).toHaveLength(2);const [first,second]=g.dangers;
 expect(first.x).toBe(marked.x);expect(first.y).toBe(marked.y);
 expect(first.sac).toEqual({returned:false,vx:0});expect(second.timer-first.timer).toBeCloseTo(.45);
 expect(second.y).not.toBe(first.y);expect(g.events).toContain('retch');
});
it('a grounded Light changes sides once and keeps the original fuse running',()=>{
 const g=make(),d=sac(g);g.dangers=[d];step(g,3,{attack:true});expect(d.sac?.returned).toBe(false);
 step(g,4);expect(d.sac?.returned).toBe(true);expect(d.x).toBeGreaterThan(250);expect(d.timer).toBeLessThan(.8-6/60);
 expect(g.events.filter(e=>e==='punt')).toHaveLength(1);step(g,6);expect(g.events.filter(e=>e==='punt')).toHaveLength(1);
 expect(g.player.filth).toBe(0);expect(g.player.combo).toBe(0);
});
it.each(['heavy','air','behind','other-lane','spent','boss'] as const)('rejects an invalid punt: %s',reason=>{
 const g=make(),d=sac(g);g.dangers=[d];
 if(reason==='behind')d.x=g.player.x-65;
 if(reason==='other-lane')d.y=g.player.y+70;
 if(reason==='spent'){d.resolved=true;d.timer=-.01;}
 if(reason==='boss'){delete d.sac;d.source={kind:'enemy',enemy:'boss',region:3};}
 if(reason==='air')step(g,8,{jump:true});
 step(g,15,reason==='heavy'?{heavy:true}:{attack:true});
 expect(g.events).not.toContain('punt');expect(d.sac?.returned??false).toBe(false);
});
it('detonates once against the crew, without healing or burning either partner',()=>{
 const g=make('frost'),d=sac(g,{x:230,timer:.01,sac:{returned:true,vx:0}});g.dangers=[d];
 const e=g.spawn('brute',260,455);e.stun=10;g.player.hp-=20;g.players[1].x=230;g.players[1].y=455;
 const before=g.players.map(p=>p.hp);step(g);expect(e.hp).toBe(e.maxHp-52);const hp=e.hp;
 expect(g.players.map(p=>p.hp)).toEqual(before);expect(d.resolved).toBe(true);
 e.hurt=0;step(g,6);expect(e.hp).toBe(hp);expect(g.events.filter(e=>e==='stink-pop')).toHaveLength(1);expect(g.player.filth).toBe(0);
});
it('leaves the second sac hostile and retains jump as a non-punting escape',()=>{
 const g=make(),first=sac(g,{x:240}),second=sac(g,{x:200,y:525,timer:1.25});g.dangers=[first,second];
 step(g,12,{attack:true});expect(first.sac?.returned).toBe(true);expect(second.sac?.returned).toBe(false);
 const jumped=make();step(jumped,12,{jump:true});jumped.dangers=[sac(jumped,{x:jumped.player.x,timer:.01})];step(jumped);
 expect(jumped.player.hp).toBe(jumped.player.maxHp);
 const stayed=make();stayed.dangers=[sac(stayed,{x:stayed.player.x,timer:.01})];step(stayed);expect(stayed.player.hp).toBeLessThan(stayed.player.maxHp);
});
it('does not award a perfect dodge for an already returned sac',()=>{
 const g=make();g.dangers=[sac(g,{x:200,timer:.1,sac:{returned:true,vx:0}})];step(g,1,{dodge:true});expect(g.perfectDodges).toBe(0);
});
it('lets the second player punt left with their own Light',()=>{
 const g=make('frost'),p=g.players[1];p.face=-1;g.dangers=[sac(g,{x:p.x-40,y:p.y})];step(g,12,{}, {attack:true});
 expect(g.dangers[0].sac?.returned).toBe(true);expect(g.dangers[0].sac!.vx).toBeLessThan(0);
});
it('restores pending sac motion while accepting older danger records',()=>{
 const g=make(),b=parseBookmark(g.exportBookmark())!;b.snapshot.dangers=[sac(g,{sac:{returned:true,vx:-400}}),{...sac(g),sac:undefined}];
 const restored=Game.resumeBookmark(stringifyBookmark(b))!;expect(restored.dangers[0].sac).toEqual({returned:true,vx:-400});expect(restored.dangers[1].sac).toBeUndefined();
 step(restored);expect(restored.dangers[0].x).toBeLessThan(250);
});
it.each(['blast','enemy'] as const)('a killing return stops the %s from hurting the player during boss defeat',next=>{
 const g=new Game('ember',5,freshSave().upgrades,140,{xp:9000});g.props=[];g.player.hp=1;
 const slapper=next==='enemy'?g.spawn('shield',250,455):undefined;
 if(slapper){slapper.windup=.01;slapper.face=-1;}
 const boss=g.spawn('boss',400,455);boss.hp=1;boss.bossState='recover';boss.bossTimer=2;
 g.dangers=[sac(g,{x:400,timer:.01,sac:{returned:true,vx:0}})];
 if(next==='blast')g.dangers.push(sac(g,{x:200,timer:.01}));
 step(g);expect(boss.hp).toBeLessThanOrEqual(0);expect(g.bossMoment?.kind).toBe('defeat');
 expect(g.state).toBe('playing');expect(g.player.hp).toBe(1);expect(g.dangers).toHaveLength(0);
});
