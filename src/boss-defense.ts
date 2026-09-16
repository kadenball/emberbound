import type { BossState } from './engine';
export interface HitOrigin { x:number; height:number; finisher?:boolean; rawHeavy?:boolean }
type BossPose={x:number;face:number;bossState:BossState};
export function shellClosed(state:BossState) { return state!=='recover'&&state!=='jammed'; }
/** Defenses follow anatomy: wafer shell below an exposed head, plated forklift front. */
export function bossDefense(boss:BossPose,region:number,origin?:HitOrigin) {
  if(boss.bossState==='jammed')return {scale:1.75,blocked:false};
  if(!shellClosed(boss.bossState))return {scale:1.1,blocked:false};
  if(region===3&&origin)return origin.height<55?{scale:0,blocked:true}:{scale:.85,blocked:false};
  if(region===4&&origin)return (origin.x-boss.x)*boss.face>=-10?{scale:0,blocked:true}:{scale:.85,blocked:false};
  return {scale:.35,blocked:false};
}
