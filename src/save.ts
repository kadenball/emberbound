import { parseBookmark } from './fight-bookmark';
import { validStoryId } from './story';
import { validStyle, type StyleId } from './progression';
import { Preferences } from '@capacitor/preferences';
import { HEROES, STAGES, WEAPONS, upgradeCost, type WeaponId, type HeroId, type Upgrade } from './content';
export interface Save {
  version: 2; resume: string | null; style: StyleId; weapons: WeaponId[]; equipped: WeaponId; hero: HeroId; gold: number; xp: number; unlocked: number;
  upgrades: Record<Upgrade, number>;
  best: number[]; failureBest: number[]; storySeen: string[];
  settings: { sound: boolean; music: boolean; shake: boolean; touch: boolean; relaxed: boolean };
}
export const freshSave = (): Save => ({ version: 2, resume: null, storySeen: [], style: 'scrapper', weapons: ['starter'], equipped: 'starter', hero: 'ember', gold: 0, xp: 0, unlocked: 0, upgrades: { vitality: 0, strength: 0, spirit: 0 }, best: STAGES.map(() => 0), failureBest: STAGES.map(() => 0), settings: { sound: true, music: true, shake: true, touch: false, relaxed: false } });
const integer = (v: unknown, fallback = 0, max = 9999999) => typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : fallback;
export function parseSave(raw: string | null): Save {
  const base = freshSave();
  try {
    if (!raw) return base;
    const s = JSON.parse(raw);
    if (!s || ![1, 2].includes(s.version)) return base;
    base.storySeen = Array.isArray(s.storySeen) ? [...new Set<string>(s.storySeen.filter(validStoryId))] : [];
    base.style = validStyle(s.style) ? s.style : 'scrapper';
    base.hero = HEROES.some(h => h.id === s.hero) ? s.hero : 'ember';
    base.gold = integer(s.gold); base.xp = integer(s.xp); base.unlocked = integer(s.unlocked, 0, STAGES.length - 1);
    for (const k of ['vitality', 'strength', 'spirit'] as const) base.upgrades[k] = integer(s.upgrades?.[k], 0, 5);
    base.failureBest = base.failureBest.map((_,i) => integer(s.failureBest?.[i]));
    base.best = base.best.map((_, i) => integer(s.best?.[i], 0, 3));
    if (s.version === 1) {
      base.best = STAGES.map(() => 0);
      for (const [old, next] of [[0, 0], [1, 2], [2, 10]]) {
        const stars = integer(s.best?.[old], 0, 3);
        base.best[next] = stars; base.best[next + 1] = stars;
      }
      base.unlocked = integer(s.best?.[2], 0, 3) > 0 ? 11 : Math.min(2, integer(s.unlocked)) * 2;
    }
    base.weapons = ['starter', ...WEAPONS.filter(w => w.id !== 'starter' && Array.isArray(s.weapons) && s.weapons.includes(w.id)).map(w => w.id)];
    base.equipped = base.weapons.includes(s.equipped) ? s.equipped : 'starter';
    for (const k of ['sound', 'music', 'shake', 'touch', 'relaxed'] as const) if (typeof s.settings?.[k] === 'boolean') base.settings[k] = s.settings[k];
    const resume = parseBookmark(s.resume);
    if (resume && resume.stage <= base.unlocked && resume.initialXp === base.xp) base.resume = s.resume;
    return base;
  } catch { return base; }
}
const KEY = 'emberbound.save.v1';
export let discardedBookmark=false, saveReadFailed=false;
export async function readSave(): Promise<Save> {
  saveReadFailed=false;discardedBookmark=false;
  try {
    const raw=(await Preferences.get({ key: KEY })).value,save=parseSave(raw);
    try {discardedBookmark=!!(raw && JSON.parse(raw)?.resume && !save.resume);} catch {discardedBookmark=false;}
    return save;
  }
  catch { saveReadFailed=true;return freshSave(); }
}
let writes = Promise.resolve();
export function writeSave(save: Save): Promise<void> {
  if(saveReadFailed)return Promise.reject(new Error('Read the existing save before writing.'));
  const value = JSON.stringify(save);
  const next = writes.catch(() => {}).then(() => Preferences.set({ key: KEY, value }));
  writes = next;
  return next;
}
export function buyUpgrade(save: Save, type: Upgrade): boolean {
  const level = save.upgrades[type], cost = upgradeCost(level);
  if (level >= surgeryLimit(save) || save.gold < cost) return false;
  save.gold -= cost; save.upgrades[type]++; return true;
}

// Boss clears grant surgical permits. Existing purchased ranks survive migration.
export function surgeryLimit(save: Save): number {
  return Math.min(5, 1 + save.best.filter((stars,i)=>i%2===1 && stars>0).length);
}
export interface RunReward { stage: number; won: boolean; gold: number; earnedXp: number }
export function runPayout(save: Save, run: RunReward) {
  return { gold: run.won ? run.gold : 0, xp: run.won ? run.earnedXp : Math.max(0,Math.floor(run.earnedXp*.25)-save.failureBest[run.stage]) };
}
export function bankPayout(save: Save, run: RunReward) {
  const payout=runPayout(save,run);save.gold+=payout.gold;save.xp+=payout.xp;
  if(!run.won)save.failureBest[run.stage]=Math.max(save.failureBest[run.stage],Math.floor(run.earnedXp*.25));
  return payout;
}
