import { STAGES } from './content';
import type { Encounter } from './encounters';

export const WORKPLACES = [
  { name: 'PICNIC INSPECTOR', order: 'RING FOR A HEALTH INSPECTION', payoff: 'PASSED. NO SURVIVORS.', color: '#bfd77c', cue: 'kettle', dodge: 'Jump the three steam bursts', label: 'STEAM' },
  { name: 'EXPIRED EMPLOYEE', order: 'BREAK THE EMERGENCY DEFROST', payoff: 'BEST BEFORE: YESTERDAY.', color: '#afe3ee', cue: 'dough', dodge: 'Change lanes under falling ice', label: 'ICE FALL' },
  { name: 'THE BIG FLUSH', order: 'UNION-MANDATED TOILET BREAK', payoff: 'YOUR COMPLAINT HAS BEEN FLUSHED.', color: '#add3ae', cue: 'drum', dodge: 'Jump the rinse sweeping across the floor', label: 'RINSE' },
  { name: 'HOLY SHIT, FONDUE', order: 'BREAK THE CHOCOLATE FONT', payoff: 'CONTAINS TRACES OF STAFF.', color: '#eba9c5', cue: 'sugar', dodge: 'Jump the syrup; frozen enemies cannot follow', label: 'SYRUP' },
  { name: 'EMPLOYEE OF THE MONTH', order: 'CLOCK SOMEBODY OUT', payoff: 'STAFF REDUCTION: SUCCESSFUL.', color: '#ddb477', cue: 'forklift', dodge: 'Leave the roller lane; jumping will not help', label: 'ROLLER' },
  { name: 'THE ROYAL STAMP', order: 'FILE A FORMAL COMPLAINT', payoff: 'COMPLAINT: FLATTENED.', color: '#d5b1df', cue: 'royal', dodge: 'Leave the marked stamp lane', label: 'STAMP' },
] as const;
export interface Sabotage {
  encounter: number; region: number; x: number; y: number; controlX: number; controlY: number;
  strikes: number; phase: 'ready' | 'running' | 'wrecked'; clock: number; bowled: boolean;
  hits: Set<string>; fired: Set<number>;
}
export interface MachineZone { id: number; x: number; y: number; rx: number; ry: number; ceiling: number; warning: boolean; active: boolean }
export function chapterSabotage(stage: number, encounters: Encounter[]): Sabotage[] {
  return encounters.flatMap((e, encounter) => e.kind === 'sabotage' ? [{ encounter, region: STAGES[stage].region, x: e.x + 565, y: 445, controlX: e.x + 235, controlY: 475, strikes: 0, phase: 'ready' as const, clock: 0, bowled: false, hits: new Set<string>(), fired: new Set<number>() }] : []);
}
// One geometry/timeline drives both rendering and damage. Every pulse has >= 1.1s warning.
export function machineZones(m: Sabotage): MachineZone[] {
  if (m.phase !== 'running') return [];
  const make = (id: number, x: number, y: number, rx: number, ry: number, ceiling: number, start: number, duration: number): MachineZone => ({ id, x, y, rx, ry, ceiling, warning: m.clock < start, active: m.clock >= start && m.clock < start + duration });
  const x = m.x;
  if (m.region === 0) return [0,1,2].map(i => make(i, x - 180 + i * 155, 467, 76, 42, 50, 1.1 + i * .38, .55));
  if (m.region === 1) return [0,1,2].map(i => make(i, x - 170 + i * 155, i % 2 ? 509 : 395, 83, 36, 1000, 1.1 + i * .5, .48));
  if (m.region === 2) return [make(0, x - 210 + Math.min(1, Math.max(0, (m.clock - 1.3) / 1.5)) * 520, 460, 57, 70, 50, 1.3, 1.5)];
  if (m.region === 3) return [0,1,2].map(i => make(i, x - 155 + i * 160, i % 2 ? 399 : 506, 100, 36, 45, 1.2 + i * .35, 1.15));
  if (m.region === 4) return [make(0, x - 220 + Math.min(1, Math.max(0, (m.clock - 1.4) / 1.4)) * 535, 466, 63, 44, 1000, 1.4, 1.4)];
  return [make(0, x - 35, 476, 255, 50, 1000, 1.6, .55)];
}
export function inMachineZone(z: MachineZone, x: number, y: number, height: number) {
  return height < z.ceiling && ((x - z.x) / z.rx) ** 2 + ((y - z.y) / z.ry) ** 2 < 1;
}
