import type {Player} from './engine';
import type {StyleId} from './progression';
import type { WeaponId } from './content';
export type MoveKind = 'light' | 'launcher' | 'bowl' | 'pull' | 'spin' | 'air' | 'slam' | 'quake' | 'kick' | 'hex';
export interface Move { kind: MoveKind; startup: number; active: number; recovery: number; damage: number; reach: number; depth: number; knock: number }
const moves: Record<MoveKind, Move> = {
  quake: {kind:'quake',startup:.21,active:.12,recovery:.32,damage:1.6,reach:165,depth:70,knock:26},
  kick: {kind:'kick',startup:.045,active:.12,recovery:.2,damage:1.4,reach:150,depth:45,knock:20},
  hex: {kind:'hex',startup:.16,active:.13,recovery:.32,damage:1.25,reach:145,depth:65,knock:16},
  light: { kind: 'light', startup: .065, active: .07, recovery: .16, damage: 1, reach: 100, depth: 48, knock: 6 },
  launcher: { kind: 'launcher', startup: .13, active: .10, recovery: .27, damage: 1.4, reach: 110, depth: 46, knock: 10 },
  bowl: { kind: 'bowl', startup: .19, active: .10, recovery: .31, damage: 1.7, reach: 128, depth: 66, knock: 28 },
  pull: { kind: 'pull', startup: .11, active: .10, recovery: .24, damage: .85, reach: 230, depth: 34, knock: 0 },
  spin: { kind: 'spin', startup: .14, active: .15, recovery: .33, damage: 1.35, reach: 150, depth: 85, knock: 30 },
  air: { kind: 'air', startup: .045, active: .085, recovery: .15, damage: 1.1, reach: 105, depth: 50, knock: 9 },
  slam: { kind: 'slam', startup: .08, active: .1, recovery: .25, damage: 1.6, reach: 100, depth: 62, knock: 25 }
};
export function selectMove(heavy: boolean, airborne: boolean, combo: number, level: number, weapon: WeaponId, afterDodge: boolean): MoveKind {
  if (airborne) return heavy ? 'slam' : 'air';
  if (!heavy) return 'light';
  if (afterDodge) return 'launcher';
  if (combo >= 2) return level >= 3 && combo >= 3 ? 'spin' : 'bowl';
  if (weapon === 'crown') return 'spin';
  if (weapon === 'sock') return 'pull';
  if (weapon === 'pan' || weapon === 'candy') return 'bowl';
  return 'launcher';
}
export const moveFor = (kind: MoveKind, speed = 1): Move => ({ ...moves[kind], startup: moves[kind].startup / speed, active: moves[kind].active / speed, recovery: moves[kind].recovery / speed });
export const moveDuration = (move: Move) => move.startup + move.active + move.recovery;
export interface AttackState { move: Move; elapsed: number; hit: Set<number>; propHit: Set<number>; connected: boolean; face: number; rewarded?: boolean; counter?: boolean; empowered?: boolean; finisher?:boolean }

/** Shared by attack execution and the live move hint. Direction is captured on the Heavy tap. */
export function playerMove(p:Player,heavy:boolean,level:number,style:StyleId,down=false):MoveKind {
 const airborne=p.z>18||p.vz>0,combo=p.comboWindow>0?p.combo:0;
 if(!heavy&&airborne&&p.airDash>0&&style==='acrobat'&&level>=2)return 'kick';
 if(heavy&&!airborne){
  if(style==='hexer'&&level>=2&&p.infusion>0)return 'hex';
  if(style==='scrapper'&&down&&(level>=8&&p.counter>0||level>=4&&combo>=3))return 'quake';
 }
 return selectMove(heavy,airborne,combo,level,p.weapon,p.uppercutWindow>0);
}
export function heavyHint(p:Player,level:number,style:StyleId){
 if(p.downed)return 'HOLD ON · YOUR FRIEND CAN RESTUFF YOU';
 if(p.slam)return 'INCOMING FLOMP!';
 if(p.z>18||p.vz>0)return p.airDash>0&&style==='acrobat'?'LIGHT → FLYING KICK!':'LIGHT: JUGGLE · HEAVY: FLOMP';
 const names:Record<MoveKind,string>={light:'BONK',air:'JUGGLE',launcher:'LAUNCH',bowl:'BOWL',pull:'PULL',spin:'SPIN',slam:'FLOMP',quake:'GROUND QUAKE',kick:'FLYING KICK',hex:'ELEMENTAL FINISHER'};
 const kind=playerMove(p,true,level,style),alternate=playerMove(p,true,level,style,true);
 const counter=p.counter>0&&style==='scrapper'&&level>=2;
 return `HEAVY → ${counter?'COUNTER ':''}${names[kind]}${alternate!==kind?' · ↓ + HEAVY: QUAKE':p.weapon==='candy'&&(counter||kind==='hex'||p.combo>=2&&p.comboWindow>0)?' · +6 HP':''}`;
}
