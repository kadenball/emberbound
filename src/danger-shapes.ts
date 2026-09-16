import type { Danger } from './engine';
export type DangerKind = 'blast' | 'ice' | 'jaw' | 'stamp';
export function dangerKind(d: Danger): DangerKind {
  if(d.kind)return d.kind;
  // Old bookmarks keep the correct meaning of attacks drawn as overhead objects.
  if(d.source?.kind==='enemy' && d.source.enemy==='boss')return d.source.region===1?'ice':d.source.region===5?'stamp':'blast';
  return 'blast';
}
export function dangerShape(d: Danger) {
  const kind=dangerKind(d);
  return {rx:d.radius,ry:d.depth ?? (kind==='stamp'?48:kind==='jaw'?38:d.radius/1.3),ceiling:kind==='blast'?45:1000};
}
export function dangerContains(d: Danger, x:number, y:number, height=0, padding=0) {
  const shape=dangerShape(d);
  return height<=shape.ceiling && ((x-d.x)/(shape.rx+padding))**2+((y-d.y)/(shape.ry+padding))**2<1;
}
export function raisedForks(e:{enraged:boolean;phase:number;bossState:string}) {
  return e.enraged && (e.phase+Number(e.bossState==='windup'))%2===0;
}
export const FORK_DEPTH=58;
export function bossChargeBounds(worldWidth:number,encounterX=0) {
  return {low:Math.max(60,encounterX-100),high:Math.min(worldWidth-80,encounterX+840)};
}
