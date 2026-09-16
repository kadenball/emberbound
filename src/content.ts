import { EXTRA_ROUTES } from './extended-routes';
export const HEROES = [
  { id: 'ember', name: 'Ash', title: 'THE HOT MESS', element: 'Fire', color: '#eea269', dark: '#a95840', description: 'A squat furnace-lizard. Eats candles. Farts fire.', spell: 'Ass Afterburner', detail: 'Fart a piercing flame jet toward your aim; recoil kicks you back. Meltdown: three lanes of arse-on-fire.', hp: 120, power: 21, speed: 320 },
  { id: 'frost', name: 'Wren', title: 'CERTIFIED BRAIN FREEZE', element: 'Ice', color: '#a7c4df', dark: '#6977a5', description: 'A freezer-burned sewer bird. All legs, neck and regret.', spell: 'Projectile Regret', detail: 'Vomit freezing sludge. Heavy the puddle to splash a crowd. Meltdown: a much bigger mess.', hp: 105, power: 19, speed: 345 },
  { id: 'moss', name: 'Bram', title: 'UNLICENSED ORGAN DONOR', element: 'Nature', color: '#bec784', dark: '#6e824e', description: 'A broad slug-toad with spare limbs and a very bad son.', spell: 'Emotional Support Tumour', detail: 'Drop a toothy decoy. Small melee foes bite it; brutes and ranged foes resist the bait. Heavy bursts it early. A hit heals 5 HP. Meltdown: tougher, bigger blast.', hp: 150, power: 25, speed: 280 }
] as const;
export type HeroId = typeof HEROES[number]['id'];
export type EnemyKind = 'raider' | 'archer' | 'brute' | 'shield' | 'bomber' | 'charger' | 'healer' | 'flanker' | 'boss';
export const REGIONS = [
  { name: 'Wobbly Woods', sky: '#a5c5ad', ground: '#487263', accent: '#dbe8ac', seed: 7, boss: 'Sir Burps-a-Lot', journey: 'The Whispering Wood', arena: 'The Picnic of Doom', subtitle: 'Recover the first crown tooth. Do not eat it.', enemies: ['raider', 'archer', 'brute'] },
  { name: 'Brain-Freeze Country', sky: '#b5c4dd', ground: '#7f94ad', accent: '#eddfed', seed: 21, boss: 'The Abominable Doughman', journey: 'Frostfall Pass', arena: 'Freezer Burn', subtitle: 'Someone put the second tooth in the freezer.', enemies: ['raider', 'shield', 'archer', 'charger'] },
  { name: 'The Lost Sock Marsh', sky: '#a9c2b2', ground: '#526c70', accent: '#c4e8b0', seed: 52, boss: 'Madame Spin-Cycle', journey: 'Laundry Lagoon', arena: 'The Rinse Pit', subtitle: 'Follow the missing socks. Hold your nose.', enemies: ['bomber', 'raider', 'healer', 'brute'] },
  { name: 'Sugar-Rush Industries', sky: '#dfb3c4', ground: '#956e8f', accent: '#ffe3a6', seed: 81, boss: 'Count Snackula', journey: 'The Crumble Works', arena: 'The Last Supper-ish', subtitle: 'The fourth tooth has a terrible sugar habit.', enemies: ['charger', 'bomber', 'archer', 'shield'] },
  { name: 'The Rusty Rump', sky: '#c5b296', ground: '#736e62', accent: '#f3ca80', seed: 102, boss: 'Forklift Frank', journey: 'Junkdrawer Junction', arena: 'Employee of the Bonk', subtitle: 'Find the tooth before it becomes a door handle.', enemies: ['shield', 'healer', 'brute', 'bomber'] },
  { name: 'Cardboard Royalty', sky: '#c9a5b2', ground: '#80667b', accent: '#f0c68d', seed: 139, boss: 'His Royal Toothiness', journey: 'The Hollow Keep', arena: 'The Throne of Bad Decisions', subtitle: 'Six crown teeth. One spectacularly silly king.', enemies: ['charger', 'shield', 'healer', 'bomber', 'brute', 'archer'] }
] as const;
export interface Stage { name: string; subtitle: string; label: string; boss: string; sky: string; ground: string; accent: string; seed: number; region: number; bossStage: boolean; length: number; encounters: number[]; enemies: readonly EnemyKind[]; par: number }
export const STAGES: Stage[] = REGIONS.flatMap((r, region) => [false, true].map(bossStage => ({
  ...r, name: bossStage ? r.arena : r.journey, label: `${r.name.toUpperCase()} · ${bossStage ? 'BOSS' : 'JOURNEY'}`,
  subtitle: bossStage ? `Face ${r.boss}. Recover a crown tooth.` : r.subtitle, region, bossStage,
  length: bossStage ? 2800 : EXTRA_ROUTES[region].at(-1)!.x + 1000,
  encounters: bossStage ? [380, 1200, 1980] : [...Array.from({ length: 6 }, (_, i) => 320 + i * (region > 2 ? 1020 : 1100)),...EXTRA_ROUTES[region].map(e=>e.x)],
  par: bossStage ? 180 : 480 + region * 25
})));
export const WEAPONS = [
  { id: 'starter', name: 'Old faithful', icon: '⚒', power: 0, speed: 1, reach: 0, perk: 'Your hero’s trusty household mistake.', region: -1, color: '#cbd1bf' },
  { id: 'pan', name: 'Pan of poor choices', icon: '◉', power: 4, speed: .82, reach: 6, perk: 'Slow, wide swings. Heavy bowls enemies; spring bounces hit harder.', region: 0, color: '#aebcba' },
  { id: 'popsicle', name: 'Brain-stick', icon: '❄', power: -2, speed: 1.22, reach: -12, perk: 'Quick but short. Air hits juggle longer; heavy briefly freezes.', region: 1, color: '#a9e4ee' },
  { id: 'sock', name: 'Sock of last resort', icon: '♧', power: -2, speed: 1.05, reach: 18, perk: 'Heavy stretches out and pulls a foe toward you. Lower damage.', region: 2, color: '#aec775' },
  { id: 'candy', name: 'Jawbreaker', icon: '◎', power: 7, speed: .8, reach: 10, perk: 'Light ×2 → Heavy restores 6 health on contact. Counters and elemental finishers qualify too; plain Heavy does not.', region: 3, color: '#e5a4c3' },
  { id: 'fork', name: 'Unreasonably large fork', icon: 'Ψ', power: 2, speed: .92, reach: 42, perk: 'Long reach and a narrow sweep. Heavy launches through shields.', region: 4, color: '#d8d0a8' },
  { id: 'tooth', name: 'The tooth fairy’s problem', icon: '♜', power: 5, speed: 1, reach: 20, perk: 'Finishers splash damage onto nearby enemies.', region: 5, color: '#fff0c9' },
  { id: 'crown', name: 'Royal toilet brush', icon: '♛', power: 4, speed: 1.02, reach: 25, perk: 'Standing Heavy spins around you. Connected-light combos still bowl or spin; Dodge → Heavy launches. Light hits restore a little health.', region: 6, color: '#e4c26a' }
] as const;
export type WeaponId = typeof WEAPONS[number]['id'];
export const weaponById = (id: WeaponId) => WEAPONS.find(w => w.id === id)!;
export const xpForLevel = (level: number) => (level - 1) * level * 75;
export const levelForXp = (xp: number) => Math.min(10, Math.floor((1 + Math.sqrt(1 + Math.max(0, xp) * 4 / 75)) / 2));
export const COMBOS = [
  { level: 1, name: 'The classic bonk', input: 'Light attack', detail: 'Quick slaps. Hold to repeat, or tap to time your next hit.' },
  { level: 1, name: 'Up you go', input: 'Heavy → Jump → Light', detail: 'Launch a foe, then jump and continue the juggle. Pan, candy, sock and crown have different standing Heavies; Dodge → Heavy supplies a launcher.' },
  { level: 1, name: 'Plush bowling', input: 'Light × 2 → Heavy', detail: 'Send a plush rolling into enemies, springs, and props. Works with every weapon. Pan and candy also bowl with a plain ground Heavy.' },
  { level: 1, name: 'Flying bad decision', input: 'Jump → Heavy', detail: 'Dive into a belly-flop. Light attacks in the air keep your juggle going.' },
  { level: 3, name: 'Spin of shame', input: 'Light × 3 → Heavy', detail: 'A deliberate spinning finisher clears space on both sides.' },
  { level: 5, name: 'Panic uppercut', input: 'Dodge → Heavy', detail: 'An empowered guard-breaking launcher after a roll.' },
  { level: 7, name: 'Extinction flomp', input: 'Jump → Heavy → Land', detail: 'Your landing shockwave gains reach and damage.' }
] as const;
export const BESTIARY: { kind: EnemyKind; name: string; tip: string }[] = [
  { kind: 'raider', name: 'Ratchet rat', tip: 'Crouches, then pounces at your marked position. Sidestep the bite and punish its landing.' },
  { kind: 'archer', name: 'Syringe mosquito', tip: 'Strafes between lanes and aims its needle at your height. Change lane after the aiming line appears; veterans fire a spread.' },
  { kind: 'brute', name: 'Knuckle mildew', tip: 'Plants its fists before swinging. Front hits hurt but cannot stop it. Get behind, finish Light ×2 → Heavy, or bowl a body into it. Jump the low wave; sidestep its high swat.' },
  { kind: 'shield', name: 'Hermit bastard', tip: 'Scuttles sideways in a dustbin shell. Stops frontal light hits and answers repeated bonks with a lid slap. Heavy opens the lid; circle behind or use magic.' },
  { kind: 'bomber', name: 'Bloat tick', tip: 'Retches two staggered stink sacs. Ground Light punts one along your facing direction; its fuse keeps burning. Jump or leave the other circle.' },
  { kind: 'charger', name: 'Road-hog roast', tip: 'Four-legged boar. Scrapes its hoof, locks a lane, then rushes it. Step aside or hop over.' },
  { kind: 'healer', name: 'Malpractice jelly', tip: 'Stitches one injured ally along a green thread. Heavy or power cuts the stitch; pulling its patient away also breaks it. Alone, it warns before slapping.' },
  { kind: 'flanker', name: 'Socktopede', tip: 'Many legs, no shame. Curves behind you then commits to a fast marked dash. Dodge across its route and punish the stop.' },
  { kind: 'boss', name: 'Management', tip: 'Six bosses, six bad habits. Watch their warnings and punish recovery. Bowl laundry into Madame’s open drum.' }
];
export type Upgrade = 'vitality' | 'strength' | 'spirit';
export const UPGRADES: { id: Upgrade; name: string; description: string; icon: string }[] = [
  { id: 'vitality', name: 'Emergency stuffing', description: '+15 maximum health', icon: '♥' },
  { id: 'strength', name: 'Spatula calibration', description: '+3 melee damage', icon: '⚔' },
  { id: 'spirit', name: 'Weaponized indigestion', description: '+8 magic damage', icon: '✦' }
];
export const upgradeCost = (level: number) => 70 + level * 55;
