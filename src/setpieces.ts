import { STAGES } from './content';
import type { Encounter } from './encounters';
export type TrapKind = 'spore' | 'cutter' | 'drain' | 'taffy' | 'press' | 'stamp';
export interface Setpiece { id: number; encounter: number; kind: TrapKind; x: number; y: number; clock: number; disabled: boolean; hits: Set<string>; cycle: number; road?: boolean }
export const TRAP_NAMES: Record<TrapKind, string> = { spore: 'ARSE-SPORE', cutter: 'FREEZER BURN', drain: 'THE SUCKHOLE', taffy: 'CHEWING YOU', press: 'STAFF FLATTENER', stamp: 'DEATH & TAXES' };
export function chapterSetpieces(stage: number, encounters: Encounter[]): Setpiece[] {
  const chapter = STAGES[stage], kind: TrapKind = (['spore','cutter','drain','taffy','press','stamp'] as const)[chapter.region];
  const indices = chapter.bossStage ? [1] : [1, 2, 4];
  const fights: Setpiece[] = indices.filter(i => encounters[i].kind !== 'sabotage').map((encounter, id) => ({ id, encounter, kind, x: encounters[encounter].x + 410, y: encounter === 1 && !chapter.bossStage ? 460 : id % 2 ? 410 : 495, clock: 0, disabled: false, hits: new Set(), cycle: -1 }));
  if(!chapter.bossStage)for(const encounter of [2,4])fights.push({id:fights.length,encounter,kind,x:encounters[encounter].x-150,y:encounter===2?375:525,clock:0,disabled:false,hits:new Set(),cycle:-1,road:true});
  return fights;
}
export function setpieceRunning(trap:Setpiece,wave:number,encounterActive:boolean,players:readonly {x:number;downed:boolean}[]) {
  if(trap.disabled)return false;
  return trap.road ? wave>=trap.encounter-1&&players.some(p=>!p.downed&&Math.abs(p.x-trap.x)<360) : trap.encounter===wave&&encounterActive;
}
// Timing is shared by collision and art. Every first activation starts with a full warning.
export function trapState(trap: Setpiece) {
  const period = trap.road ? 3.2 : trap.kind === 'cutter' ? 5.8 : 5.2, phase = trap.clock % period;
  const activeStart=trap.road?1:2.8,activeEnd=trap.road?1.75:3.8;
  const warning = phase >= (trap.road?0:1.4) && phase < activeStart, active = phase >= activeStart && phase < activeEnd;
  const activeAge=phase-activeStart;
  const moving = trap.kind === 'cutter' && active ? Math.sin(activeAge/(activeEnd-activeStart)*Math.PI*2)*(trap.road?70:150) : 0;
  return { warning, active, phase, activeAge, cycle: Math.floor(trap.clock / period), x: trap.x + moving, y: trap.y, rx: trap.kind === 'press' || trap.kind === 'stamp' ? 90 : trap.kind === 'cutter' ? 37 : 78, ry: trap.kind === 'cutter' ? 25 : 32, ceiling: trap.kind === 'press' || trap.kind === 'stamp' ? 1000 : 45 };
}
