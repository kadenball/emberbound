import type { Enemy } from './engine';
export const STITCH_TIME = 1.25;
export const STITCH_REACH = 310;
export function stitchConnected(jelly: Enemy, patient: Enemy | undefined): patient is Enemy {
 return !!patient && patient !== jelly && patient.kind !== 'healer' && patient.hp > 0 && patient.entrance <= 0 &&
  Math.hypot(patient.x-jelly.x, patient.y-jelly.y, patient.z-jelly.z) <= STITCH_REACH;
}
export function choosePatient(jelly: Enemy, crew: Enemy[]) {
 return crew.filter(e=>stitchConnected(jelly,e)&&e.maxHp-e.hp>=10)
  .sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp || a.id-b.id)[0];
}
