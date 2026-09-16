import type { Danger, Enemy } from './engine';
import { dangerKind, raisedForks } from './danger-shapes';
export function bossCue(boss:Enemy,region:number,dangers:Danger[]) {
  if(region===3&&boss.bossState==='windup')return 'SWEETS LOW · THEN TEETH HIGH';
  if(region===3&&boss.bossState==='volley'){
    const next=dangers.filter(d=>!d.resolved).sort((a,b)=>a.timer-b.timer)[0];
    return next&&dangerKind(next)==='blast'?'LOW SWEETS! JUMP · THEN CHANGE LANES':'TEETH HIGH! CHANGE LANES';
  }
  if(dangers.some(d=>!d.resolved&&dangerKind(d)!=='blast'))return 'OVERHEAD! CHANGE LANES';
  if(region===4&&['spin','windup'].includes(boss.bossState))return raisedForks(boss)?'FORKS UP! CHANGE LANES':'FORKS LOW! JUMP';
  if(region===5&&boss.decree)return 'CLEAR STAFF · OR BOWL ONE INTO HIM';
  if(boss.bossState==='jammed')return region===5?'RETURNED TO SENDER · BONK NOW':'DRUM JAMMED — BONK NOW';
  if(boss.bossState==='recover')return dangers.some(d=>!d.resolved)?'JUMP THE BLASTS · BONK THE BOSS':'RECOVERING — YOUR OPENING';
  if(boss.bossState==='inhale')return 'HEAVY LAUNDRY INTO THE DRUM';
  if(boss.bossState==='spin')return 'CLEAR THE CHARGE LANE';
  if(boss.bossState==='windup'&&region===0&&(boss.phase+1)%2===1)return boss.targetZ>45?'HIGH BURP! STAY LOW':'LOW BURP! JUMP OR SIDESTEP';
  if(region===3)return 'WAFER ARMOR · JUMP AND HIT HIS HEAD';
  if(region===4)return 'ARMORED FRONT · HIT THE REAR';
  return boss.bossState==='windup'?'WATCH THE FLOOR WARNING':'WAIT FOR THE COMMITMENT';
}
