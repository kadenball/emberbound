import type { Enemy } from './engine';
import type { HitOrigin } from './boss-defense';

/** The planted fists commit to one direction; damage still lands during the windup. */
export function bruteBraced(e: Pick<Enemy, 'kind' | 'hp' | 'windup'>) {
  return e.kind === 'brute' && e.hp > 0 && e.windup > 0;
}
export function breaksBruteBrace(e: Enemy, impact: 'light' | 'heavy' | 'magic' | 'bowl', origin?: HitOrigin) {
  return impact !== 'light' && (impact === 'bowl' || !origin || origin.finisher || (origin.x - e.x) * e.face < -20);
}
export function canDisplace(e: Enemy) {
  return e.kind !== 'boss' && e.defiance <= 0 && !bruteBraced(e);
}
