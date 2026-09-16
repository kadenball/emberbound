import { idleInput, type Game } from '../src/engine';
import { dangerContains, dangerKind, dangerShape, FORK_DEPTH, raisedForks } from '../src/danger-shapes';
import {shellClosed} from '../src/boss-defense';
// Deterministic steering probe, not a model of human skill or fun.
export function playInput(g: Game, frame: number, player = 0) {
  const p=g.players[player], input=idleInput(), enemies=g.enemies.filter(e=>e.hp>0);
  const priority=(e:typeof enemies[number])=>Math.hypot(e.x-p.x,(e.y-p.y)*2)-(e.kind==='healer'?(e.patient!==undefined?220:60):0);
  const target=enemies.sort((a,b)=>priority(a)-priority(b))[0];
  const steer=(x:number,y:number,distance=55)=>{input.x=Math.abs(x-p.x)>distance?Math.sign(x-p.x):p.face!==Math.sign(x-p.x)&&Math.abs(x-p.x)>10?Math.sign(x-p.x)*.2:0;input.y=Math.abs(y-p.y)>9?Math.sign(y-p.y):0;};
  const machine=g.machines.find(m=>m.encounter===g.wave && m.phase==='ready' && g.encounterActive);
  if(machine && (!target || Math.hypot(machine.controlX-p.x,machine.controlY-p.y)<220)){
    steer(machine.controlX,machine.controlY,45);input.heavy=Math.abs(machine.controlX-p.x)<80 && Math.abs(machine.controlY-p.y)<45 && frame%40<3;return input;
  }
  if(!target){
    const prop=g.props.filter(q=>!q.active&&['lever','chest'].includes(q.kind)&&q.x>p.x-140&&q.x<g.nextEncounterX).sort((a,b)=>a.x-b.x)[0];
    if(g.cart&&!g.cart.complete)steer(g.cart.x+70,g.cart.y,15);
    else if(prop){steer(prop.x,prop.y,55);input.attack=Math.abs(prop.x-p.x)<90&&Math.abs(prop.y-p.y)<65;}

    else if(g.machines.some(m=>m.encounter===g.wave && m.phase==='running')) {input.y=p.y>365?-1:0;}
    else input.x=1;
    return input;
  }
  steer(target.x,target.y);
  const dx=target.x-p.x,dy=target.y-p.y,close=Math.abs(dx)<100&&Math.abs(dy)<40;
  input.attack=close;
  input.heavy=close&&(target.kind==='healer'&&target.patient!==undefined||frame%45<3); if(input.heavy)input.attack=false;
  input.magic=Math.abs(dx)<(p.hero==='ember'?420:170)&&Math.abs(dy)<35;
  if(target.kind==='boss' && !['jammed','recover'].includes(target.bossState))input.magic=false;
  if(target.z>25&&close&&p.z===0)input.jump=true;
  const threat=enemies.some(e=>e.windup>0&&e.windup<.24&&Math.abs(e.x-p.x)<140&&Math.abs(e.y-p.y)<65);
  const pending=g.dangers.filter(d=>!d.resolved&&d.timer>0);
  const danger=pending.some(d=>dangerKind(d)==='blast'&&d.timer<.3&&dangerContains(d,p.x,p.y,0,15));
  const spin=enemies.some(e=>e.bossState==='spin'&&Math.abs(e.x-p.x)<220&&Math.abs(e.y-p.y)<70);
  if(threat||danger||spin){input.jump=p.z===0; if(p.z===0&&p.jumpHeld&&p.dodgeCooldown<=0){input.dodge=true;input.y=p.y>450?-1:1;}}
  const mess=g.messes.find(m=>m.life>0 && Math.abs(m.x-p.x)<105 && Math.abs(m.y-p.y)<65 && enemies.some(e=>e.hp>0 && Math.hypot(e.x-m.x,(e.y-m.y)*1.4)<130));
  if(mess && p.z===0 && !threat && frame%12<3){input.attack=false;input.heavy=true;}
  const spinning=enemies.find(e=>e.kind==='boss'&&e.bossState==='spin'&&g.config.region===2);
  if(spinning){input.attack=input.heavy=input.magic=false;input.x=Math.sign(p.x-spinning.x)||-spinning.face;input.y=p.y>spinning.y?1:-1;}
  const boss=enemies.find(e=>e.kind==='boss'&&e.bossState==='inhale');
  if(boss){
    const bundle=g.props.filter(q=>q.kind==='laundry'&&!q.active&&!q.vx).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
    if(bundle){steer(bundle.x+boss.face*48,bundle.y,7);input.attack=false;input.magic=false;input.jump=false;const dir=Math.sign(boss.x-p.x);if(p.face!==dir)input.x=dir*.2;input.heavy=Math.abs(p.x-bundle.x)<88&&Math.abs(p.y-bundle.y)<30&&p.face===dir&&frame%3===0;}
  }
  if(target.kind==='boss'&&shellClosed(target.bossState)){
    if(g.config.region===3){
      input.jump=close&&p.z===0;input.attack=close&&p.z>=55;input.heavy=false;
      input.magic=p.z>=55&&Math.abs(dx)<170&&Math.abs(dy)<35;
    }
    if(g.config.region===4){
      const inFront=(p.x-target.x)*target.face>=-25;
      if(inFront){
        const lane=target.bossState==='windup'?target.targetY:target.y,top=g.currentEncounter?.top??360,bottom=g.currentEncounter?.bottom??543;
        const side=Math.abs(top-lane)>Math.abs(bottom-lane)?top:bottom;
        steer(target.x-target.face*110,side,15);
        if(Math.abs(p.y-lane)<75)input.x=0;
        input.attack=input.heavy=input.magic=false;
      }else steer(target.x-target.face*55,target.y,12);
    }
  }
  // Respond only to displayed, committed attack shapes; no future RNG/state edits.
  const overhead=pending.filter(d=>dangerKind(d)!=='blast'&&d.timer<1.1&&Math.abs(d.x-p.x)<d.radius+35);
  const frank=enemies.find(e=>e.kind==='boss'&&g.config.region===4&&raisedForks(e)&&['windup','spin'].includes(e.bossState));
  if(overhead.length||frank){
    const top=g.currentEncounter?.top??360,bottom=g.currentEncounter?.bottom??543;
    const candidates=[top,bottom,...overhead.flatMap(d=>[d.y-dangerShape(d).ry-25,d.y+dangerShape(d).ry+25])].filter(y=>y>=top&&y<=bottom);
    const score=(y:number)=>Math.abs(y-p.y)+overhead.filter(d=>dangerContains(d,p.x,y,100,20)).length*1000+(frank&&Math.abs(y-(frank.bossState==='windup'?frank.targetY:frank.y))<FORK_DEPTH+20?1000:0);
    const safe=candidates.sort((a,b)=>score(a)-score(b))[0];
    input.y=Math.abs(safe-p.y)>5?Math.sign(safe-p.y):0;input.x=0;input.jump=false;input.attack=input.heavy=input.magic=false;
    if(overhead.some(d=>d.timer<.22&&dangerContains(d,p.x,p.y,p.z))||frank&&frank.bossState==='spin'&&Math.abs(frank.x-p.x)<160&&Math.abs(frank.y-p.y)<FORK_DEPTH)input.dodge=p.dodgeCooldown<=0;
  }
  return input;
}
