import { Blood } from './blood';
import {bossCue} from './boss-cue';
import {chapterFlows,onFlow,type RouteFlow} from './route-flow';
import {royalProtected,royalStaff} from './royal-guard';
import { bruteBraced, breaksBruteBrace, canDisplace } from './brute-stance';
import { STITCH_TIME, choosePatient, stitchConnected } from './triage';
import { bossChargeBounds, dangerContains, dangerShape, dangerKind, raisedForks, FORK_DEPTH, type DangerKind } from './danger-shapes';
import { bossDefense, type HitOrigin } from './boss-defense';
import { parseBookmark, stringifyBookmark } from './fight-bookmark';
import { chapterSabotage, machineZones, inMachineZone, WORKPLACES, type Sabotage } from './sabotage';
import { BOSS_SOUNDS, type BossMoment } from './boss-performance';
import type { DamageReceipt, DamageSource } from './defeat';
import { HEROES, STAGES, weaponById, WEAPONS, levelForXp, COMBOS, type WeaponId, type EnemyKind, type HeroId } from './content';
import { chapterEncounters, type Encounter } from './encounters';
import { chapterSetpieces, trapState, setpieceRunning, type Setpiece } from './setpieces';
import { moveDuration, moveFor, playerMove, type AttackState, type MoveKind } from './combat';
import { styleById, type StyleId } from './progression';
import type { Save } from './save';
export const FLOOR_TOP = 350, FLOOR_BOTTOM = 555;
export interface Input { x: number; y: number; attack: boolean; heavy?: boolean; magic: boolean; dodge: boolean; jump: boolean }
export const idleInput = (): Input => ({ x: 0, y: 0, attack: false, heavy: false, magic: false, dodge: false, jump: false });
export type { EnemyKind } from './content';
export interface Prop { id: number; kind: 'chest' | 'barrel' | 'spring' | 'lever' | 'gate' | 'vent' | 'snack' | 'laundry' | 'bell'; x: number; y: number; hp: number; active: boolean; link?: number; weapon?: WeaponId; vx?: number; hazard?: number; machine?: number; flow?:number }
export interface Mess { id: number; kind: 'sludge' | 'decoy'; x: number; y: number; life: number; owner: number; damage: number; empowered: boolean; hp: number }
export interface Danger { kind?: DangerKind; depth?: number; resolved?: boolean; x: number; y: number; radius: number; timer: number; damage: number; color: string; source?: DamageSource; sac?: { returned: boolean; vx: number } }
export interface Actor { x: number; y: number; hp: number; maxHp: number; face: number; hurt: number; walk: number; attackTime: number }
export type BossState = 'idle' | 'windup' | 'inhale' | 'spin' | 'volley' | 'recover' | 'jammed';
export interface Enemy extends Actor { id: number; kind: EnemyKind; cooldown: number; windup: number; stun: number; targetX: number; targetY: number; dead: number; phase: number; rush: number; z: number; vz: number; vx: number; knockdown: number; recovery: number; guard: number; entrance: number; entranceKind: Encounter['entrance']; bowlTime: number; bowlHits: Set<number>; bounces: number; juggle: number; frozen: number; bossState: BossState; bossTimer: number; target: number; targetZ: number; elite: boolean; blocked: number; enraged: boolean; controlTime: number; defiance: number; summoned: boolean; dashX: number; dashY: number; patient?: number; decree?: boolean; heavyReads?: number; heavyMemory?: number }
export interface Player extends Actor { id: number; hero: HeroId; weapon: WeaponId; mana: number; power: number; speed: number; combo: number; comboWindow: number; cooldown: number; spellCooldown: number; dodgeCooldown: number; roll: number; invulnerable: number; rollX: number; rollY: number; z: number; vz: number; jumpHeld: boolean; airAttack: boolean; landing: number; uppercutWindow: number; attack: AttackState | null; queued: 'light' | 'heavy' | null; queuedDown?:boolean; queueTime: number; attackHeld: boolean; heavyHeld: boolean; downed: boolean; revive: number; reviveLatch: boolean; counter: number; airDash: number; airDashes: number; infusion: number; lastMove: MoveKind | null; variety: number; varietyTime: number; slam: boolean; filth: number; powerPose: number; recentMoves: string[] }
export interface Impact { x:number; y:number; kind:'hit'|'heavy'|'launch'|'slam'|'guard'|'death'|'dash'|'cast'; color:string; face:number; life:number; duration:number }
export interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; color: string }
export interface FloatText { x: number; y: number; text: string; color: string; life: number }
export interface Projectile { x: number; y: number; vx: number; vy: number; life: number; friendly: boolean; damage: number; hit: Set<number>; color: string; z?: number; owner?: number; groundWave?: boolean; source?: DamageSource; rewarded?:boolean }
export interface Pickup { x: number; y: number; kind: 'gold' | 'health'; value: number; phase: number }
export type GameEvent = 'punt' | 'retch' | 'stink-pop' | 'slash' | 'hit' | 'hurt' | 'magic' | 'dodge' | 'jump' | 'land' | 'coin' | 'win' | 'lose' | 'wave' | 'heavy' | 'clang' | 'launch' | 'bowl' | 'bounce' | 'revive' | 'jam' | 'burp' | 'freeze' | 'lawn' | 'tear' | 'boss-rage' | 'boss-fall' | 'machine-warning' | 'machine-break' | 'crunch' | 'stamp-hit' | 'stitch' | 'snip' | 'restuff' | 'brace' | 'brace-break' | 'claim' | typeof BOSS_SOUNDS[number];
export interface Cart { x: number; y: number; goal: number; moving: boolean; complete: boolean; boost?:number; cooldown?:number; hits?:Set<number> }
export class Game {
  players: Player[];
  get player() { return this.players[0]; }
  get heroId() { return this.player.hero; }
  get weapon() { return this.player.weapon; }
  get equippedWeapon() { return weaponById(this.weapon); }
  readonly config; readonly worldWidth: number; readonly encounters: Encounter[];
  readonly flows:RouteFlow[];
  flowRunning(flow:RouteFlow) { return this.wave>=flow.encounter&&this.props.some(p=>p.flow===flow.control&&!p.active); }
  private flowSpeed(x:number,y:number,height=0) { return this.flows.find(f=>this.flowRunning(f)&&onFlow(f,x,y,height))?.speed??0; }
  impacts: Impact[] = [];
  messes: Mess[] = []; meltdowns = 0;
  machines: Sabotage[] = [];
  readonly blood = new Blood();
  setpieces: Setpiece[] = []; scars: {x: number; y: number; color: string; seed: number}[] = [];
  props: Prop[] = []; dangers: Danger[] = []; cart: Cart | null = null;
  xp: number; earnedXp = 0; level: number; foundWeapons: WeaponId[] = [];
  private ownedWeapons: WeaponId[]; private initialXp: number;
  get encounterActive() { return this.wave >= 0 && !this.cleared && this.state === 'playing'; }
  get encounterCount() { return this.encounters.length; }
  get nextEncounterX() { return this.encounters[this.wave + 1]?.x ?? this.worldWidth; }
  get currentEncounter() { return this.encounters[this.wave]; }
  get cameraFocus() { const living = this.players.some(p => !p.downed) ? this.players.filter(p => !p.downed) : this.players; return living.reduce((sum, p) => sum + p.x, 0) / (living.length || 1); }
  get objective() {
    const boss = this.enemies.find(e => e.kind === 'boss' && e.hp > 0);
    if(boss && this.config.region===3 && ['windup','volley'].includes(boss.bossState))return bossCue(boss,3,this.dangers);
    if(boss && this.dangers.some(d=>!d.resolved && dangerKind(d)!=='blast'))return 'Overhead attack! Leave its marked lane before it lands';
    if(boss && this.config.region===4 && ['windup','spin'].includes(boss.bossState))return raisedForks(boss)?'Forks up! Change lanes before Frank charges':'Forks low! Jump over the charge';
    if(boss&&this.config.region===5&&boss.decree)return 'Staff carry his protection · Clear them or bowl one into the king';
    if (boss?.bossState === 'inhale') return 'Bowl a laundry bundle into the open drum!';
    if (boss?.bossState === 'jammed') return this.config.region===5?'RETURN TO SENDER! Get in and bonk!':'DRUM JAMMED! Get in and bonk!';
    if (boss?.bossState === 'recover') return 'Boss recovering — your opening!';
    if(boss && this.config.region===3)return 'Wafer armor! Jump and hit his head, or punish recovery';
    if(boss && this.config.region===4)return 'Armored front! Circle behind Frank or punish recovery';
    if(this.dangers.some(d=>d.sac&&!d.sac.returned&&!d.resolved&&Math.abs(d.x-this.cameraFocus)<300))return 'STINK SACS! Ground Light punts them · Or jump / get clear';
    if (this.cart?.complete) return 'Delivery signed · Clear the remaining crew';
    if (this.cart) return (this.cart.boost??0)>0?'EXPRESS DISASTER! Follow the delivery':(this.cart.cooldown??0)>0?'Axle cooling · Clear the crew and stay close':'Heavy from behind → Launch the cart · Braced brutes stop it';
    if (this.players.some(p => p.downed)) return 'Stand beside your friend and hold MAGIC to restuff';
    const machine = this.machines.find(m => m.encounter === this.wave && m.phase !== 'wrecked' && !this.cleared);
    if (machine) return machine.phase === 'ready' ? `Bell: ${machine.strikes}/3 Heavy hits · Light ×2 → Heavy bowls a foe into it` : WORKPLACES[machine.region].dodge;
    if(this.flows.some(f=>f.encounter===this.wave&&this.props.some(p=>p.flow===f.control&&p.active)))return this.encounterActive?'LINE STOPPED · Finish the crew. They’re still on the clock.':'LINE STOPPED · Rummage, then follow the road →';
    const trap = this.setpieces.find(t => !t.road && t.encounter === this.wave && !t.disabled && !this.cleared);
    const currentFlow=this.flows.find(f=>this.flowRunning(f)&&Math.abs(this.cameraFocus-(f.x+f.width/2))<600);
    if(currentFlow&&(!trap||!trapState(trap).warning&&!trapState(trap).active))return this.stage===4?'Rinse carries feet and sacs · Jump or bonk the drain brake':'Opposing belts! Ride a lane, jump, or bonk the shared brake';
    if (trap) return trap.kind === 'press' || trap.kind === 'stamp' ? 'Switch lanes before the press drops · Bonk the switch to shut it down' : trap.kind === 'taffy' ? 'Jump out of sticky syrup · Lure enemies in · Bonk the switch' : 'Jump the marked machinery · Bait enemies in · Bonk the switch';
    if(!this.encounterActive&&this.setpieces.some(t=>t.road&&!t.disabled&&Math.abs(t.x-this.cameraFocus)<260))return 'Optional supplies · Get close and bonk while the shutters are open';
    if(this.enemies.some(e=>bruteBraced(e)&&Math.abs(e.x-this.cameraFocus)<400))return 'Planted fists! Get behind or Light ×2 → Heavy';
    return this.currentEncounter && !this.cleared ? this.currentEncounter.hint : 'Rummage for snacks · Follow the road →';
  }
  enemies: Enemy[] = []; particles: Particle[] = []; texts: FloatText[] = []; projectiles: Projectile[] = []; pickups: Pickup[] = [];
  state: 'playing' | 'won' | 'lost' = 'playing'; time = 0; kills = 0; gold = 0; score = 0; wave = -1; camera = 0; shake = 0; hitStop = 0;
  banner = ''; bannerTime = 0; comboHits = 0; comboTimer = 0; bestCombo = 0; bowlingHits = 0; juggles = 0; revives = 0;
  spellRing = 0; spellX = 0; spellY = 0; events: GameEvent[] = [];
  private checkpoint: ReturnType<Game['checkpointState']> | null = null;
  bossMoment: BossMoment | null = null;
  retries = 0; private retrySeconds = 0; damageLog: DamageReceipt[] = [];
  get totalTime() { return this.time + this.retrySeconds; }
  get retryPoint() { const c=this.checkpoint;if(!c)return null;const next=c.wave+(c.cleared?1:0);return {title:this.encounters[next]?.title ?? 'The trailhead',encounter:next+1,between:c.cleared,hp:c.players.map(p=>Math.ceil(p.hp))}; }
  get bookmarkKey() { return `${this.checkpoint?.wave}:${this.checkpoint?.cleared}:${this.retries}:${this.checkpoint?.time}`; }
  // Snapshot after a fight's entrances are created. No active simulation or storage is cloned.
  private checkpointState() {
    return structuredClone({bossMoment:this.bossMoment,players:this.players,props:this.props,machines:this.machines,setpieces:this.setpieces,scars:this.scars,messes:this.messes,enemies:this.enemies,particles:this.particles,texts:this.texts,projectiles:this.projectiles,pickups:this.pickups,dangers:this.dangers,impacts:this.impacts,cart:this.cart,
      xp:this.xp,earnedXp:this.earnedXp,level:this.level,foundWeapons:this.foundWeapons,ownedWeapons:this.ownedWeapons,kills:this.kills,gold:this.gold,score:this.score,wave:this.wave,time:this.time,camera:this.camera,sequence:this.sequence,rng:this.rng,cleared:this.cleared,group:this.group,groupTimer:this.groupTimer,
      comboHits:this.comboHits,comboTimer:this.comboTimer,bestCombo:this.bestCombo,bowlingHits:this.bowlingHits,juggles:this.juggles,revives:this.revives,perfectDodges:this.perfectDodges,meltdowns:this.meltdowns,damageLog:this.damageLog});
  }
  retryEncounter(): boolean {
    if(this.state!=='lost' || !this.checkpoint)return false;
    this.blood.clear();
    this.retrySeconds+=Math.max(0,this.time-this.checkpoint.time);this.retries++;
    Object.assign(this,structuredClone(this.checkpoint));
    this.state='playing';this.bossMoment=null;this.events=['wave'];this.hitStop=this.shake=this.spellRing=0;
    this.banner=`TAKE ${this.retries+1}. SAME BAD IDEA.`;this.bannerTime=1.4;
    // Clear the old button edges, so retry never commits a held attack before a fresh input.
    for(const p of this.players){p.attackHeld=p.heavyHeld=p.jumpHeld=false;p.queued=null;p.queueTime=0;}
    return true;
  }
  // Persist the same entry snapshot used by retry, not a half-resolved attack frame.
  exportBookmark(): string | null {
    if (!this.checkpoint || this.state === 'won') return null;
    return stringifyBookmark({format:1,rules:1,stage:this.stage,upgrades:{...this.upgrades},initialXp:this.initialXp,style:this.style,relaxed:this.relaxed,
      retries:this.retries,retrySeconds:this.retrySeconds+Math.max(0,this.time-this.checkpoint.time),snapshot:this.checkpoint});
  }
  static resumeBookmark(raw: string): Game | null {
    const b=parseBookmark(raw);if(!b)return null;
    const p=b.snapshot.players[0];
    const g=new Game(p.hero,b.stage,b.upgrades,1,{xp:b.initialXp,weapon:p.weapon,weapons:b.snapshot.ownedWeapons,partner:b.snapshot.players[1]?.hero,style:b.style,difficulty:b.relaxed?'relaxed':'normal'});
    g.blood.clear();g.checkpoint=structuredClone(b.snapshot);g.retries=b.retries;g.retrySeconds=b.retrySeconds;
    // Reopening retries the current fight, so quitting cannot earn a clean-run star.
    g.state='lost';g.retryEncounter();return g;
  }
  skipBossMoment() { if(this.bossMoment)this.bossMoment.clock=this.bossMoment.duration; }
  private performBoss(e: Enemy, kind: BossMoment['kind']) {
    this.bossMoment={kind,boss:e.id,region:this.config.region,clock:0,duration:kind==='rage'?1.15:kind==='defeat'?2.5:2.3,x:e.x,y:e.y};
    this.hitStop=0;this.bannerTime=0;
    this.emit(kind==='entrance'?BOSS_SOUNDS[this.config.region]:kind==='rage'?'boss-rage':'boss-fall');
  }
  private sequence = 0; private rng: number; private cleared = false; private group = 0; private groupTimer = 0; private roadClaimed = false;
  constructor(heroId: HeroId, public stage: number, public upgrades: Save['upgrades'], seed = 1234, progression: { xp?: number; weapon?: WeaponId; weapons?: WeaponId[]; partner?: HeroId; difficulty?: 'normal' | 'relaxed'; style?: StyleId } = {}) {
    this.style = progression.style ?? 'scrapper'; this.encounters = chapterEncounters(stage); this.config = { ...STAGES[stage], encounters: this.encounters.map(e => e.x) }; this.worldWidth = this.config.length;
    this.flows=chapterFlows(stage,this.encounters);
    this.xp = this.initialXp = progression.xp ?? 0; this.level = levelForXp(this.xp); this.rng = seed;
    this.ownedWeapons = [...new Set(['starter' as WeaponId, ...(progression.weapons ?? []), progression.weapon ?? 'starter'])];
    this.players = [heroId, ...(progression.partner ? [progression.partner] : [])].map((hero, id) => {
      const h = HEROES.find(h => h.id === hero)!, weapon = progression.weapon ?? 'starter';
      const hp = h.hp + upgrades.vitality * 15 + (this.level - 1) * 6;
      return { id, hero, weapon, x: 200 - id * 65, y: 455 + id * 35, hp, maxHp: hp, mana: 100, power: h.power + upgrades.strength * 3 + (this.level - 1) * 2 + weaponById(weapon).power, speed: h.speed, face: 1, hurt: 0, walk: 0, attackTime: 0, combo: 0, comboWindow: 0, cooldown: 0, spellCooldown: 0, dodgeCooldown: 0, roll: 0, invulnerable: 0, rollX: 1, rollY: 0, z: 0, vz: 0, jumpHeld: false, airAttack: false, landing: 0, uppercutWindow: 0, attack: null, queued: null, queueTime: 0, attackHeld: false, heavyHeld: false, downed: false, revive: 0, reviveLatch: false, counter: 0, airDash: 0, airDashes: 0, infusion: 0, lastMove: null, variety: 0, varietyTime: 0, slam: false, filth: 0, powerPose: 0, recentMoves: [] };
    });
    this.relaxed = progression.difficulty === 'relaxed'; this.banner = this.config.name; this.bannerTime = 3; this.setpieces = chapterSetpieces(stage, this.encounters); this.machines = chapterSabotage(stage, this.encounters); this.createProps();
    this.checkpoint = this.checkpointState();
  }
  readonly relaxed: boolean; readonly style: StyleId; perfectDodges = 0;
  random() { this.rng = (Math.imul(1664525, this.rng) + 1013904223) >>> 0; return this.rng / 4294967296; }
  emit(event: GameEvent) { this.events.push(event); }
  spawn(kind: EnemyKind, x: number, y: number): Enemy {
    const hp = ({ raider: 62, archer: 50, brute: 138, shield: 90, bomber: 58, charger: 76, healer: 54, flanker: 56, boss: 680 }[kind]) * (1 + this.config.region * .19) * (this.players.length > 1 ? 1.45 : 1);
    const e: Enemy = { id: ++this.sequence, kind, x: clamp(x, 60, this.worldWidth - 60), y, hp, maxHp: hp, face: -1, hurt: 0, walk: 0, attackTime: 0, cooldown: .5 + this.random() * .4, windup: 0, stun: 0, targetX: 0, targetY: 0, dead: 0, phase: 0, rush: 0, z: 0, vz: 0, vx: 0, knockdown: 0, recovery: 0, guard: 0, entrance: 0, entranceKind: 'run', bowlTime: 0, bowlHits: new Set(), bounces: 0, juggle: 0, frozen: 0, bossState: 'idle', bossTimer: 0, target: 0, targetZ: 0, elite: false, blocked: 0, enraged: false, controlTime: 0, defiance: 0, summoned: false, dashX: -1, dashY: 0 };
    this.enemies.push(e); return e;
  }
  private startWave(index: number) {
    this.wave = index; this.cleared = false; this.group = 0; this.groupTimer = 0;
    const beat = this.encounters[index]; this.banner = beat.title; this.bannerTime = 3;
    // Create new-district machinery at entry so pre-expansion bookmarks receive it too.
    if(!this.config.bossStage && index>=6 && !this.setpieces.some(t=>t.encounter===index)){
      const id=Math.max(-1,...this.setpieces.map(t=>t.id))+1;
      const kind=(['spore','cutter','drain','taffy','press','stamp'] as const)[this.config.region];
      this.setpieces.push({id,encounter:index,kind,x:beat.x+410,y:(beat.top+beat.bottom)/2,clock:0,disabled:false,hits:new Set(),cycle:-1});
      this.props.push({id:++this.sequence,kind:'lever',x:beat.x+650,y:beat.top+20,hp:1,active:false,hazard:id});
      this.props.push({id:++this.sequence,kind:index===7?'spring':'barrel',x:beat.x+290,y:beat.bottom-25,hp:index===7?1:30,active:false});
    }
    if (beat.kind === 'cart') this.cart = { x: beat.x + 130, y: 470, goal: beat.x + 720, moving: false, complete: false };
    if (beat.kind === 'bowling') {
      this.props.push({ id: ++this.sequence, kind: 'spring', x: beat.x + 420, y: 470, hp: 1, active: false });
      this.props.push({ id: ++this.sequence, kind: 'snack', x: beat.x + 655, y: 485, hp: 30, active: false });
    }
    this.spawnGroup(); this.emit('wave');
    if(beat.kind==='boss'){const boss=this.enemies.find(e=>e.kind==='boss'&&e.hp>0)!;this.performBoss(boss,'entrance');}
    this.checkpoint = this.checkpointState();
  }
  private spawnGroup() {
    const beat = this.currentEncounter, kinds = beat.groups[this.group++];
    for (let i = 0; i < kinds.length; i++) {
      const behind = this.group > 1 && i % 2 === 0;
      const x = kinds[i] === 'healer' ? beat.x + 740 : kinds[i] === 'boss' ? beat.x + 490 : behind ? beat.x + 60 + i * 50 : beat.x + 450 + i * 90;
      const e = this.spawn(kinds[i], x, beat.top + 30 + (i * 63 + this.group * 23) % Math.max(1, beat.bottom - beat.top - 55));
      e.elite = !this.relaxed && (this.config.region >= 1 || this.wave === 5) && i === kinds.length - 1 && (this.group > 1 || this.wave >= 2) && e.kind !== 'boss';
      e.entrance = this.group === 1 ? .8 : .55; e.entranceKind = beat.entrance;
      if (e.entranceKind === 'drop') { e.z = 220; e.vz = 0; }
    }
    this.groupTimer = 1.2;
  }
  burst(x: number, y: number, color: string, count = 12) {
    for (let i = 0; i < count && this.particles.length < 200; i++) {
      const a = this.random() * Math.PI * 2, v = 40 + this.random() * 160, life = .25 + this.random() * .35;
      this.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 30, color, life, maxLife: life, size: 2 + this.random() * 5 });
    }
  }
  impact(x:number,y:number,kind:Impact['kind'],color='#ffe6a7',face=1) {
    const duration=kind==='death'?.65:kind==='dash'?.2:kind==='slam'?.4:.26;
    this.impacts.push({x,y,kind,color,face,life:duration,duration});if(this.impacts.length>70)this.impacts.shift();
  }
  label(x: number, y: number, text: string, color = '#fff0c7') {
    if (this.texts.length >= 14) this.texts.shift(); this.texts.push({ x, y, text, color, life: .85 });
  }
  private damageEnemy(e: Enemy, damage: number, knockback = 0, freeze = false, impact: 'light' | 'heavy' | 'magic' | 'bowl' = 'light',origin?:HitOrigin):boolean {
    if (e.hp <= 0 || e.entrance > 0 || this.bossMoment) return false;
    if (e.kind === 'boss') {
      if(this.config.region===5&&royalProtected(e,this.enemies)) {
        if(impact==='bowl')this.endRoyalProtection(e,true);
        else {if(e.hurt<=0){e.hurt=.12;this.emit('clang');this.impact(e.x,e.y-160,'guard','#f4d58b');this.label(e.x,e.y-245,'STAFF TAKE THE BLAME!','#f4d58b');}return false;}
      }
      const defense=bossDefense(e,this.config.region,origin);
      if(defense.blocked){if(e.hurt<=0){e.hurt=.12;this.emit('clang');this.impact(e.x+e.face*45,e.y-65,'guard','#b9d8de');this.label(e.x,e.y-220,this.config.region===3?'WAFER ARMOR! HIT THE HEAD!':'ARMORED FRONT! HIT THE REAR!','#b9d8de');}return false;}
      damage *= defense.scale;
      knockback *= .08;
    }
    if (e.kind === 'healer' && e.patient !== undefined && e.windup > 0 && impact !== 'light') this.cancelStitch(e);
    if (bruteBraced(e) && breaksBruteBrace(e,impact,origin)) {
      e.windup = 0; e.cooldown = 1.25; e.attackTime = 0;
      this.label(e.x,e.y-175,origin?.finisher?'UNION BREAK!':'BACK PAIN!','#d9efac');
      this.emit('brace-break'); this.impact(e.x,e.y-70,'guard','#d9efac');
    } else if (bruteBraced(e) && impact !== 'light' && e.hurt <= 0) {
      this.label(e.x,e.y-175,'PLANTED! GET BEHIND!','#ffe1a1');
      this.impact(e.x+e.face*35,e.y-60,'guard','#ffe1a1');
    }
    if(origin?.rawHeavy && e.z<24 && (origin.x-e.x)*e.face>=-20) {
      e.heavyReads=(e.heavyMemory??0)>0?(e.heavyReads??0)+1:1;e.heavyMemory=2;
      if(e.heavyReads>=2 && e.defiance<=0) {
        e.defiance=2;e.heavyReads=0;
        const target=this.players.filter(p=>!p.downed).sort((a,b)=>Math.abs(a.x-e.x)-Math.abs(b.x-e.x))[0];
        this.label(e.x,e.y-e.z-145,'READ YOUR SHIT!','#ffb990');this.emit('brace');
        if(e.kind==='boss') {
          this.dangers.push({kind:'blast',source:{kind:'enemy',enemy:'boss',region:this.config.region,attack:'read-heavy'},x:e.x,y:e.y,radius:155,timer:.65,damage:32,color:'#f07b88'});
          if(e.bossState==='recover')e.bossTimer=Math.min(e.bossTimer,.8);
        } else if(target) {
          e.patient=undefined;e.windup=Math.max(e.windup,.45);e.cooldown=0;
          e.targetX=target.x;e.targetY=target.y;e.targetZ=target.z;
        }
      }
      if(e.defiance>0)damage*=.35;
    } else if(origin && impact!=='bowl') {e.heavyReads=0;e.heavyMemory=0;}
    this.blood.spray(e.x,e.y,e.z,Math.sign(knockback)||-e.face,impact!=='light',e.id+this.time*60);
    e.hp -= damage; e.hurt = .13;this.impact(e.x,e.y-e.z-45,impact==='light'?'hit':'heavy',freeze?'#b9f4ff':'#ffe1a1',Math.sign(knockback)||1);
    const committed = bruteBraced(e);
    if (e.kind !== 'boss' && !committed && e.defiance <= 0) {
      e.stun = freeze ? .7 : impact === 'light' ? .09 : .23;
      if (impact !== 'light') e.windup = 0;
    }
    if (freeze && canDisplace(e)) e.frozen = .7;
    if (e.kind === 'boss' || canDisplace(e)) e.vx += knockback * 7;
    this.burst(e.x, e.y - e.z - 50, freeze ? '#b7faff' : '#f3ddb7', impact === 'light' ? 5 : 15);
    this.shake = Math.max(this.shake, impact === 'light' ? .04 : .15); this.hitStop = Math.max(this.hitStop, impact === 'light' ? .008 : .04);
    this.emit(impact === 'light' ? 'hit' : 'heavy'); this.comboHits++; this.comboTimer = 2.3; this.bestCombo = Math.max(this.comboHits, this.bestCombo);
    if (impact !== 'light') this.label(e.x, e.y - e.z - 100, String(Math.round(damage)), '#ffe1a1');
    if (e.hp <= 0) {
      e.dead = .85;if(e.kind==='boss'){this.performBoss(e,'defeat');for(const other of this.enemies)if(other!==e&&other.summoned){other.hp=0;other.dead=.3;}this.projectiles=this.projectiles.filter(p=>p.friendly);this.dangers=[];}this.emit('tear'); this.scars.push({x:e.x,y:e.y,color:this.config.accent,seed:e.id}); if(this.scars.length>90)this.scars.shift();this.impact(e.x,e.y-e.z-40,'death','#ebdcc4'); this.kills++; this.score += e.kind === 'boss' ? 1500 : 100; if (!e.summoned) this.gainXp(e.kind === 'boss' ? 150 : 20);
      this.burst(e.x, e.y - e.z - 50, '#eee2c9', 18);
      if (e.kind === 'boss' || e.id % 5 === 0) this.label(e.x, e.y - e.z - 115, ['MY GOOD SOCK!', 'OFF THE CLOCK.', 'TELL MY PILLOW.', 'I QUIT.'][e.id % 4]);
      if (!e.summoned) this.pickups.push({ x: e.x, y: e.y, kind: 'gold', value: e.kind === 'boss' ? 110 : 10 + Math.floor(this.random() * 7), phase: 0 });
      if (!e.summoned && this.random() < (this.relaxed ? .22 : .12)) this.pickups.push({ x: e.x + 15, y: e.y, kind: 'health', value: 18, phase: 0 });
    }
    return true;
  }
  private damagePlayer(p: Player, amount: number, fromX: number, reach = 48, source: DamageSource = {kind:'blast'}) {
    if (p.invulnerable > 0 || p.downed || p.z > reach) return;
    this.blood.spray(p.x,p.y,p.z,Math.sign(p.x-fromX)||1,true,this.time*70+p.id);
    amount = Math.round(amount * (this.relaxed ? .6 : 1 + this.config.region * .065)); p.hp = Math.max(0, p.hp - amount); p.hurt = .25; p.invulnerable = .65;
    p.x = clamp(p.x + Math.sign(p.x - fromX || 1) * 16, 60, this.worldWidth - 60); p.attack = null; p.attackTime = 0; p.cooldown = .12;
    this.damageLog.push({source,amount,at:this.time,player:p.id});if(this.damageLog.length>6)this.damageLog.shift();
    this.shake = .2; this.comboHits = 0; p.variety = 0; p.varietyTime = 0; this.label(p.x, p.y - p.z - 90, `−${amount}`, '#ffa58d'); this.burst(p.x, p.y - 45, '#e79178', 8); this.emit('hurt');
    if (p.hp <= 0) { p.downed = true; p.z = p.vz = 0; p.slam = false; p.counter = p.infusion = p.airDash = 0; p.queued = null; this.label(p.x, p.y - 95, 'NEEDS RESTUFFING'); }
    if (this.players.every(p => p.downed)) { this.state = 'lost'; this.collectGold(); this.emit('lose'); }
  }
  private startAttack(p: Player, heavy: boolean, down=false) {
    const afterDodge = p.uppercutWindow > 0;
    const kind=playerMove(p,heavy,this.level,this.style,down);p.uppercutWindow=0;
    const counter=heavy&&p.counter>0&&this.style==='scrapper'&&this.level>=2;
    if(kind==='hex')p.infusion=0;
    const move = moveFor(kind, weaponById(p.weapon).speed * (p.hero === 'frost' ? 1.06 : p.hero === 'moss' ? .96 : 1));
    p.attack = { move, elapsed: 0, hit: new Set(), propHit: new Set(), connected: false, face: p.face, counter,finisher:heavy&&(counter||kind==='hex'||p.combo>=2&&p.comboWindow>0) };
    if (counter) { p.attack.move.damage *= 1.65; p.counter = 0; this.label(p.x,p.y-125,'RUDE REPLY!'); }
    if (kind === 'quake' && this.level >= 8 && counter) p.attack.move.reach = 230;
    if (kind === 'hex' && this.level >= 6) { p.attack.move.reach = 230; p.attack.move.depth = 90; }
    if (kind === 'kick') p.airDash = 0;
    p.attackTime = moveDuration(move); p.cooldown = moveDuration(move); p.queued = null; p.queueTime = 0;
    if (kind === 'air') p.airAttack = true;
    if (kind === 'slam') { p.slam = true; p.airAttack = true; p.vz = -780; }
    if (kind === 'launcher' && afterDodge && this.level >= 5) p.attack.move.damage *= 1.25;
  }
  private attackContact(p: Player) {
    const attack = p.attack!; const move = attack.move, kind = move.kind, w = weaponById(p.weapon), heavy = !['light','air'].includes(kind);
    if (!attack.connected) {
      this.emit(heavy ? 'heavy' : 'slash'); attack.connected = true;
      if (kind === 'quake' && this.level >= 6) this.projectiles.push({x:p.x+p.face*50,y:p.y,z:0,vx:p.face*500,vy:0,life:.7,friendly:true,damage:p.power*.75,hit:new Set(),color:'#eed3a1',groundWave:true,owner:p.id});
    }
    this.hitProps(p, attack);
    if (kind === 'light' && p.z < 24) for (const d of this.dangers) {
      const dx=(d.x-p.x)*attack.face;
      if(!d.sac||d.sac.returned||d.resolved||d.timer<=0||dx < -16||dx>move.reach+w.reach||Math.abs(d.y-p.y)>move.depth)continue;
      // The original fuse keeps running. A sac can change sides only once.
      d.sac.returned=true;d.sac.vx=attack.face*620;d.color='#c7ec91';
      this.impact(d.x,d.y-25,'launch',d.color,attack.face);this.emit('punt');
      this.label(d.x,d.y-100,'NOT MY PROBLEM!','#e5f8b7');
    }
    if (heavy && p.z < 35) for (const mess of [...this.messes]) if (Math.abs(mess.x-p.x)<move.reach+w.reach && Math.abs(mess.y-p.y)<80 && (mess.x-p.x)*attack.face > -30) this.popMess(mess, p);
    if (kind === 'slam') return;
    for (const e of this.enemies) {
      const dx = (e.x - p.x) * attack.face;
      if (e.hp <= 0 || e.entrance > 0 || attack.hit.has(e.id) || dx < (['spin','quake','hex'].includes(kind) ? -move.reach : -16) || dx > move.reach + w.reach || Math.abs(e.y - p.y) > move.depth || Math.abs(p.z - e.z) > (e.kind === 'boss' ? 145 : 58)) continue;
      attack.hit.add(e.id);
      const guarded = e.kind === 'shield' && e.guard <= 0 && e.face === -attack.face && p.z < 24;
      if (guarded && !heavy) {
        e.blocked++; if (e.blocked >= 2 && e.cooldown <= .5 && e.windup <= 0) { e.windup = .32; e.targetX = p.x; e.targetY = p.y; e.blocked = 0; this.label(e.x,e.y-115,'LID SLAP!'); }
        e.hurt = .06; this.emit('clang'); this.burst(e.x - e.face * 20, e.y - 70, '#b6d6df', 6); if (attack.hit.size === 1) p.combo = Math.min(3, p.combo + 1); p.comboWindow = .9;
        continue;
      }
      if (guarded) { e.guard = 2;this.impact(e.x,e.y-55,'guard','#bfe8eb'); this.emit('clang'); this.label(e.x, e.y - 125, 'LID OFF!'); }
      const airBonus = kind === 'air' && p.weapon === 'popsicle' ? 1.4 : 1;
      if(!this.damageEnemy(e, p.power * .7 * move.damage * airBonus * (kind === 'hex' && p.hero === 'ember' ? 1.4 : 1), kind === 'pull' ? 0 : move.knock * attack.face, (p.weapon === 'popsicle' && heavy) || (kind === 'hex' && p.hero === 'frost'), heavy ? 'heavy' : 'light',{x:p.x,height:p.z,finisher:attack.finisher,rawHeavy:heavy&&!attack.finisher&&p.z<24}))continue;
      if (kind === 'light' || kind === 'air') { if (!attack.rewarded) p.combo = Math.min(3, p.combo + 1); p.comboWindow = .95; }
      if ((kind === 'launcher' || kind === 'hex' && this.level >= 8 || kind === 'quake' && counterActive(attack) && this.level >= 8) && canDisplace(e)) { e.z = Math.max(e.z, 2); e.vz = 600; e.stun = .2; e.windup = 0; e.juggle = 0; this.emit('launch');this.impact(e.x,e.y-45,'launch','#ddf6b0'); this.label(e.x, e.y - 135, 'UP YOU GO!'); }
      if (['air','kick'].includes(kind) && e.z > 18 && canDisplace(e) && e.juggle < (this.style === 'acrobat' && this.level >= 6 ? 5 : 3)) { e.vz = 260; p.vz = Math.max(p.vz, 210); e.juggle++; this.juggles++; if (this.style === 'acrobat' && this.level >= 6) p.mana = Math.min(100,p.mana+6); }
      if ((kind === 'bowl' || kind === 'spin') && canDisplace(e)) this.bowl(e, attack.face, p.weapon === 'pan' ? 770 : 590);
      if (kind === 'pull' && canDisplace(e)) { e.x = clamp(p.x + attack.face * 75, 60, this.worldWidth - 60); e.y += (p.y - e.y) * .8; e.stun = .3; e.windup = 0; this.label(e.x, e.y - 120, 'GET OVER HERE-ISH'); }
      if (kind === 'quake' && canDisplace(e)) { e.knockdown = .55; e.windup = 0; }
      if (kind === 'hex' && p.hero === 'moss' && canDisplace(e)) { e.x += (p.x + p.face * 65 - e.x) * .7; e.y += (p.y-e.y)*.7; }
      if (kind === 'hex' && p.hero === 'ember') this.burst(e.x,e.y-e.z-45,'#ffb96f',20);
      if (!attack.rewarded) {
        attack.rewarded = true;
        if (!p.recentMoves.includes(kind) && p.varietyTime > 0) { p.variety = Math.min(4,p.variety+1); p.mana = Math.min(100,p.mana+2*p.variety); } else if (p.varietyTime <= 0) p.variety = 0;
        p.lastMove = kind; p.varietyTime = 3; this.chargeFilth(p, kind);
        p.mana = Math.min(100, p.mana + (p.weapon === 'sock' ? 5 : 3));
        const finisher=attack.finisher??(!!attack.counter||kind==='hex'||p.combo>=2&&p.comboWindow>0);
        if (p.weapon === 'crown' || (p.weapon === 'candy' && heavy && finisher)) p.hp = Math.min(p.maxHp, p.hp + (p.weapon === 'crown' ? .5 : 6));
        if (kind === 'hex' && this.level >= 4) p.mana = Math.min(100,p.mana+12);
      }
      if (p.weapon === 'tooth' && heavy) for (const other of this.enemies) if (other !== e && other.hp > 0 && Math.hypot(other.x - e.x, other.y - e.y) < 90) this.damageEnemy(other, p.power * .25, attack.face * 8, false, 'heavy',{x:p.x,height:p.z});
    }
  }
  private bowl(e: Enemy, face: number, speed: number) {
    if (!canDisplace(e)) return;
    e.vx = face * speed; e.bowlTime = .85; e.knockdown = .65; e.windup = 0; e.stun = 0; e.z = Math.min(15, e.z); e.vz = 0; e.bounces = 0; e.bowlHits = new Set([e.id]); this.emit('bowl');
  }
  private chargeFilth(p: Player, move: string) {
    if (p.recentMoves.includes(move)) return;
    p.recentMoves.push(move); if (p.recentMoves.length > 3) p.recentMoves.shift();
    const before=p.filth; p.filth=Math.min(100,p.filth+16);
    if (before<100 && p.filth===100) this.label(p.x,p.y-145,'MELTDOWN READY!','#dcff73');
  }
  private popMess(mess: Mess, trigger?: Player) {
    if (mess.life<=0) return; mess.life=0;
    const owner=this.players[mess.owner], p=trigger ?? owner;
    let hits=0;
    for (const e of this.enemies) if(e.hp>0 && e.entrance<=0 && e.z<80 && Math.hypot(e.x-mess.x,(e.y-mess.y)*1.4)<(mess.empowered?210:145)) {
      if(this.damageEnemy(e,mess.damage,Math.sign(e.x-mess.x)*24,mess.kind==='sludge','magic',{x:mess.x,height:0}))hits++;
    }
    if(hits) { this.chargeFilth(p,mess.kind); if(mess.kind==='decoy' && !owner.downed) owner.hp=Math.min(owner.maxHp,owner.hp+5); }
    this.burst(mess.x,mess.y-25,mess.kind==='sludge'?'#98f5dc':'#f3a0bc',28);
    this.label(mess.x,mess.y-100,mess.kind==='sludge'?'SPLASH DAMAGE. LITERALLY.':'EMOTIONAL DAMAGE!');this.emit('heavy');
  }
  private magic(p: Player) {
    const empowered=p.filth>=100;
    if ((!empowered && p.mana < 36) || p.spellCooldown > 0 || p.roll > 0 || p.attack && p.attack.elapsed < p.attack.move.startup) return;
    if(empowered) { p.filth=0; p.recentMoves=[]; this.meltdowns++; } else p.mana-=36;
    p.spellCooldown=1.25;p.powerPose=.55;this.impact(p.x,p.y-p.z-40,'cast',HEROES.find(h=>h.id===p.hero)!.color,p.face);
    if (this.style === 'hexer' && this.level >= 2) p.infusion = 3;
    this.emit(p.hero === 'ember' ? 'burp' : p.hero === 'frost' ? 'freeze' : 'lawn');
    const damage=(32+this.upgrades.spirit*8+(this.level-1)*2)*(empowered?1.65:1);
    this.spellRing=.5;this.spellX=p.x;this.spellY=p.y;
    this.label(p.x,p.y-p.z-130,empowered?'ABSOLUTE SHITSHOW!':p.hero==='ember'?'ASS AFTERBURNER!':p.hero==='frost'?'PROJECTILE REGRET!':'MY SON. MY PROBLEM.',empowered?'#dcff73':'#fff0c7');
    if(p.hero==='ember') {
      for(const lane of empowered?[-45,0,45]:[0]) this.projectiles.push({x:p.x+p.face*35,y:p.y+lane,z:p.z,vx:p.face*720,vy:0,life:empowered?1:.7,friendly:true,damage,hit:new Set(),color:'#ffc16f',owner:p.id});
      p.x=clamp(p.x-p.face*45,60,this.worldWidth-60);
    } else if(p.hero==='frost') {
      for(const e of this.enemies) if(Math.hypot(e.x-p.x,(e.y-p.y)*1.5)<195 && Math.abs(e.z-p.z)<100) this.damageEnemy(e,damage*.65,Math.sign(e.x-p.x)*12,true,'magic',{x:p.x,height:p.z});
      this.messes.push({id:++this.sequence,kind:'sludge',x:clamp(p.x+p.face*95,60,this.worldWidth-60),y:p.y,life:5,owner:p.id,damage:damage*.8,empowered,hp:1});
    } else {
      this.messes.push({id:++this.sequence,kind:'decoy',x:clamp(p.x+p.face*100,60,this.worldWidth-60),y:p.y,life:6,owner:p.id,damage:damage*1.3,empowered,hp:empowered?3:2});
    }
    this.messes=this.messes.filter(m=>m.life>0).slice(-8);
    this.burst(p.x,p.y-p.z-40,HEROES.find(h=>h.id===p.hero)!.color,18);
  }
  private gainXp(amount: number) {
    this.xp += amount; this.earnedXp = this.xp - this.initialXp; const next = levelForXp(this.xp);
    if (next <= this.level) return;
    const delta = next - this.level; this.level = next;
    for (const p of this.players) { p.maxHp += delta * 6; p.power += delta * 2; if (!p.downed) p.hp = Math.min(p.maxHp, p.hp + 15 * delta); p.mana = Math.min(100, p.mana + 35); this.burst(p.x, p.y - 65, '#ffe4a0', 20); }
    this.banner = `LEVEL ${next}! ${styleById(this.style).techniques.find(t => t.level === next)?.name ?? COMBOS.find(c => c.level === next)?.name ?? '+2 power · +6 stuffing'}`; this.bannerTime = 3; this.emit('coin');
  }
  private findWeapon(id: WeaponId, p: Player) {
    if (this.ownedWeapons.includes(id)) { this.gold += 35; this.label(p.x, p.y - 130, 'DUPLICATE → 35 GOLD'); return; }
    this.ownedWeapons.push(id); this.foundWeapons.push(id); p.power += weaponById(id).power - weaponById(p.weapon).power; p.weapon = id;
    this.banner = `FOUND: ${weaponById(id).name}!`; this.bannerTime = 4; this.label(p.x, p.y - 135, 'TRY ITS HEAVY ATTACK'); this.emit('coin');
  }
  private createProps() {
    const add = (kind: Prop['kind'], x: number, y: number, extra: Partial<Prop> = {}) => { const prop: Prop = { id: ++this.sequence, kind, x, y, hp: kind === 'chest' ? 26 : 22, active: false, ...extra }; this.props.push(prop); return prop; };
    if (!this.config.bossStage) {
      // The opening pan is optional. Later finds sit on a short side spur before bowling practice.
      add('chest', this.config.region === 0 ? 285 : this.encounters[2].x - 190, this.config.region === 0 ? 515 : 535, { weapon: WEAPONS[this.config.region + 1].id });
      this.encounters.forEach((beat, i) => {
        if (i % 2 === 0) add('barrel', beat.x + 580, 470);
        if (beat.kind === 'bowling') add('spring', beat.x + 250, 475);
        if ((i === 1 || i === 4) && beat.kind !== 'sabotage') { const gate = add('gate', beat.x + 880, 450); add('lever', beat.x + 760, 390, { link: gate.id }); }
        if (i === 2 || i === 4) add('chest', beat.x - 150, i===2?375:525, {hazard:this.setpieces.find(t=>t.road&&t.encounter===i)!.id});
        if (i === 4 && beat.kind !== 'sabotage') add('vent', beat.x + 370, 455);
      });
    } else { add('barrel', 2300, 390); add('spring', 2160, 520); add('chest', 1830, 520); }
    for (const machine of this.machines) add('bell', machine.controlX, machine.controlY, {machine: machine.encounter});
    for (const trap of this.setpieces) if(!trap.road)add('lever', trap.x + 230, 375, { hazard: trap.id });
    for(const flow of this.flows)if(flow.id===flow.control){
      const trap=this.setpieces.find(t=>!t.road&&t.encounter===flow.encounter),control=this.props.find(p=>p.kind==='lever'&&p.hazard===trap?.id);
      if(control){control.flow=flow.control;control.x=flow.x+flow.width+45;control.y=flow.kind==='rinse'?460:450;}
    }
  }
  private hitProps(p: Player, attack: AttackState) {
    const move = attack.move;
    const cart=this.cart;
    if(cart&&!cart.complete&&(cart.cooldown??0)<=0&&p.z<50&&attack.face>0&&p.x<cart.x&&cart.x-p.x<move.reach+55&&Math.abs(p.y-cart.y)<42&&!['light','air'].includes(move.kind)){
      cart.boost=1;cart.cooldown=2.4;cart.hits=new Set();this.emit('bowl');
      this.label(cart.x,cart.y-135,'EXPRESS DISASTER!');this.impact(cart.x-50,cart.y-35,'heavy','#efd09b',1);
    }
    for (const prop of this.props) {
      if (prop.active || ['gate','spring','vent'].includes(prop.kind) || attack.propHit.has(prop.id) || Math.abs(prop.x - p.x) > move.reach + weaponById(p.weapon).reach || Math.abs(prop.y - p.y) > 78 || p.z > 50) continue;
      if(prop.kind==='chest'&&prop.hazard!==undefined&&(Math.abs(prop.x-p.x)>65||Math.abs(prop.y-p.y)>30))continue;
      attack.propHit.add(prop.id);
      if(this.supplyClosed(prop)){this.emit('clang');this.label(prop.x,prop.y-115,'SHUTTER DOWN. WAIT!');continue;}
      if (prop.kind === 'bell') {
        if (!['light','air'].includes(move.kind)) this.strikeMachine(prop, false);
        else this.label(prop.x, prop.y - 95, 'HEAVY. OR AN EMPLOYEE.');
      } else if (prop.kind === 'laundry') {
        if (!['light','air'].includes(move.kind)) { prop.vx = attack.face * 600; this.emit('bowl'); } else this.label(prop.x, prop.y - 60, 'HEAVY TO BOWL');
      } else if (prop.kind === 'lever') {
        prop.active = true;
        if(prop.flow!==undefined)this.roadClaimed=true;
        const gate = this.props.find(q => q.id === prop.link); if (gate) gate.active = true; if (prop.hazard !== undefined) { const trap = this.setpieces.find(t => t.id === prop.hazard); if (trap) trap.disabled = true; }
        this.label(prop.x, prop.y - 75, prop.flow!==undefined?'UNPAID BREAK!':prop.hazard !== undefined ? 'HEALTH & SAFETY. DISGUSTING.' : 'OPEN SESAME-ISH!'); this.gainXp(20); this.emit(prop.flow!==undefined?'clang':'coin');
      }
      else { prop.hp -= p.power * (move.kind === 'light' ? .7 : 1.5); this.burst(prop.x, prop.y - 25, '#d9bd92', 7); if (prop.hp <= 0) this.breakProp(prop, p); }
    }
  }
  private supplyClosed(prop:Prop) {
    if(prop.kind!=='chest'||prop.hazard===undefined)return false;
    const trap=this.setpieces.find(t=>t.id===prop.hazard&&t.road);
    return !!trap&&!trap.disabled&&trapState(trap).active;
  }
  private breakProp(prop: Prop, p = this.player) {
    if (prop.active || this.supplyClosed(prop)) return; prop.active = true;
    if(prop.kind==='chest'&&prop.hazard!==undefined){
      const trap=this.setpieces.find(t=>t.id===prop.hazard);if(trap?.road){trap.disabled=true;this.roadClaimed=true;this.emit('claim');}
    }
    if (prop.kind === 'barrel') { this.label(prop.x, prop.y - 90, 'BEANSPLOSION!'); for (const e of this.enemies) if (e.hp > 0 && Math.hypot(e.x - prop.x, (e.y - prop.y) * 1.3) < 180) this.damageEnemy(e, 65, Math.sign(e.x - prop.x) * 35, false, 'heavy'); this.burst(prop.x, prop.y - 35, '#b3ce71', 25); this.shake = .25; }
    else if (prop.weapon) this.findWeapon(prop.weapon, p);
    else { this.gold += 25; p.hp = Math.min(p.maxHp, p.hp + 25); this.label(prop.x, prop.y - 80, prop.kind === 'snack' ? 'PICNIC CANCELLED! +25' : '+25 GOLD · +25 HP'); this.emit('coin'); }
  }
  private collectGold() { for (const item of this.pickups) if (item.kind === 'gold') this.gold += item.value; this.pickups = this.pickups.filter(i => i.kind !== 'gold'); }
  update(dt: number, input: Input, partnerInput: Input = idleInput()): boolean {
    if (this.state !== 'playing') return false;
    dt = clamp(dt, 0, .05);this.roadClaimed=false;
    if(this.bossMoment) {
      this.time+=dt;this.bossMoment.clock+=dt;this.shake=Math.max(0,this.shake-dt);this.tickEffects(dt);
      for(const e of this.enemies)if(e.kind!=='boss'&&e.hp<=0)e.dead=Math.max(0,e.dead-dt);
      if(this.bossMoment.clock>.4 && (input.attack || input.heavy || input.jump || input.magic || input.dodge))this.skipBossMoment();
      if(this.bossMoment.clock>=this.bossMoment.duration)this.bossMoment=null;
      return true;
    }
    if (this.hitStop > 0) { this.hitStop = Math.max(0, this.hitStop - dt); return false; }
    this.blood.update(dt);this.time += dt; this.groupTimer -= dt; this.shake = Math.max(0, this.shake - dt); this.bannerTime = Math.max(0, this.bannerTime - dt); this.spellRing = Math.max(0, this.spellRing - dt);
    this.comboTimer -= dt; if (this.comboTimer <= 0) this.comboHits = 0;
    for (const p of this.players) this.updatePlayer(p, p.id === 0 ? input : partnerInput, dt);
    if (this.state !== 'playing') return true;
    const leader = Math.max(...this.players.filter(p => !p.downed).map(p => p.x));
    if ((this.wave < 0 || this.cleared) && this.wave + 1 < this.encounterCount && leader > this.nextEncounterX) this.startWave(this.wave + 1);
    if(this.bossMoment)return true;
    this.updateWorld(dt);
    if(this.bossMoment||this.state!=='playing')return true;
    for(const mess of this.messes) { if(mess.life<=0)continue; mess.life-=dt; if(mess.life<=0 && mess.kind==='decoy') {mess.life=.001;this.popMess(mess);} }
    this.messes=this.messes.filter(m=>m.life>0);
    for (const e of this.enemies) { this.updateEnemy(e, dt); if(this.bossMoment)break; }
    if(this.bossMoment)return true;
    this.updateProjectiles(dt); if(this.bossMoment)return true; this.updatePickups(dt);
    if (this.state !== 'playing') return true;
    if (this.wave >= 0 && !this.cleared) {
      let alive = this.enemies.filter(e => e.hp > 0).length;
      if (alive <= 1 && this.group < this.currentEncounter.groups.length && this.groupTimer <= 0) { this.spawnGroup(); alive = this.enemies.filter(e => e.hp > 0).length; }
      if (!alive && this.group >= this.currentEncounter.groups.length && (!this.cart || this.cart.complete) && !this.machines.some(m => m.encounter === this.wave && m.phase !== 'wrecked')) {
        this.cleared = true; this.collectGold(); this.projectiles = this.projectiles.filter(b => b.friendly); this.dangers = [];
        for (const p of this.players) { if (p.downed) { p.downed = false; p.hp = Math.ceil(p.maxHp * .3); p.revive = 0; } else p.hp = Math.min(p.maxHp, p.hp + (this.relaxed ? 20 : 3)); }
        if (this.wave === this.encounterCount - 1) { this.state = 'won'; this.gainXp(this.config.bossStage ? 200 : 150); this.score += Math.round(this.players.reduce((n,p) => n + p.hp, 0) * 5); if (this.stage === STAGES.length - 1) this.findWeapon('crown', this.player); this.emit('win'); }
        else { this.banner = this.cart ? 'DELIVERED. MOSTLY EDIBLE.' : 'Your mess. Your masterpiece.'; this.bannerTime = 1.8; this.cart = null;this.checkpoint=this.checkpointState(); }
      }
    }
    this.tickEffects(dt);
    this.enemies = this.enemies.filter(e => e.hp > 0 || e.dead > 0 || e.bowlTime > 0);
    if(this.roadClaimed&&!this.encounterActive&&this.state==='playing')this.checkpoint=this.checkpointState();
    this.camera += (clamp(this.cameraFocus - 450, 0, this.worldWidth - 1100) - this.camera) * Math.min(1, dt * 5);
    return true;
  }
  private tickEffects(dt: number) {
    for(const effect of this.impacts)effect.life-=dt;this.impacts=this.impacts.filter(effect=>effect.life>0);
    for (const q of this.particles) { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += dt * 280; q.life -= dt; } this.particles = this.particles.filter(q => q.life > 0);
    for (const t of this.texts) { t.y -= dt * 32; t.life -= dt; } this.texts = this.texts.filter(t => t.life > 0);
  }
  private updatePlayer(p: Player, input: Input, dt: number) {
    if (p.downed) return;
    if (!input.magic) p.reviveLatch = false;
    for (const k of ['hurt','spellCooldown','dodgeCooldown','roll','invulnerable','comboWindow','landing','uppercutWindow','cooldown','queueTime','counter','airDash','infusion','varietyTime','powerPose'] as const) p[k] = Math.max(0, p[k] - dt);
    if(p.comboWindow<=0)p.combo=0;
    p.mana = Math.min(100, p.mana + dt * (this.relaxed ? 7 : 2.5));
    if (p.queueTime <= 0) p.queued = null;
    // Edge taps are queued during recovery; held light remains an accessibility shortcut.
    if (input.attack && !p.attackHeld) { p.queued = 'light'; p.queueTime = .22; }
    if (input.heavy && !p.heavyHeld) { p.queued = 'heavy'; p.queuedDown=input.y>.5; p.queueTime = .32; }
    p.attackHeld = input.attack; p.heavyHeld = !!input.heavy;
    const len = Math.hypot(input.x, input.y), ix = input.x / Math.max(1, len), iy = input.y / Math.max(1, len);
    if (input.dodge && p.dodgeCooldown <= 0) {
      const late = this.enemies.some(e => e.hp > 0 && e.windup > 0 && e.windup < .23 && Math.abs(e.x-p.x)<135 && Math.abs(e.y-p.y)<65) || this.dangers.some(d=>!d.resolved && !d.sac?.returned && d.timer<.2 && dangerContains(d,p.x,p.y,p.z));
      if (late) { this.perfectDodges++; this.chargeFilth(p,'dodge'); p.counter = 1.2; p.mana = Math.min(100,p.mana+5); this.label(p.x,p.y-115,'THREAD THE NEEDLE!'); }
      if (p.z > 18 && this.style === 'acrobat' && this.level >= 2 && p.airDashes < (this.level >= 8 ? 2 : 1)) { p.airDashes++; p.vz = 330; p.airDash = .65; }
      p.roll = .23; p.invulnerable = .28; p.dodgeCooldown = .86; p.rollX = len > .1 ? ix : p.face; p.rollY = len > .1 ? iy : 0; p.uppercutWindow = .65; p.attack = null; p.cooldown = 0; this.emit('dodge');this.impact(p.x,p.y-p.z-30,'dash',HEROES.find(h=>h.id===p.hero)!.color,p.face); }
    if (input.jump && !p.jumpHeld && p.z === 0 && p.roll <= 0) { p.vz = 650; p.landing = 0; if(p.queued==='heavy'){p.queued=null;p.queueTime=0;} if ((p.attack?.move.kind === 'launcher' || this.style === 'acrobat' && this.level >= 4 && p.attack?.hit.size) && p.attack && p.attack.elapsed >= p.attack.move.startup) { p.attack = null; p.cooldown = p.attackTime = 0; } this.emit('jump'); this.burst(p.x, p.y, '#ead7b1', 5); }
    p.jumpHeld = input.jump;
    if (p.z > 0 || p.vz > 0) {
      p.vz -= 1850 * dt; p.z += p.vz * dt;
      if (p.z <= 0) {
        p.z = p.vz = 0; p.landing = .17; this.emit('land'); this.burst(p.x, p.y, '#ebd3a4', p.slam ? 20 : 5);
        if (p.slam) { this.impact(p.x,p.y,'slam','#ffe3a2'); this.label(p.x, p.y - 65, this.level >= 7 ? 'EXTINCTION FLOMP!' : 'FLOMP!'); for (const e of this.enemies) if (e.hp > 0 && e.z < 30 && Math.hypot(e.x - p.x, (e.y - p.y) * 1.4) < (this.level >= 7 ? 165 : 115)) { if(!this.damageEnemy(e, p.power * (this.level >= 7 ? 1.6 : 1.15), Math.sign(e.x - p.x) * 25, false, 'heavy',{x:p.x,height:80}))continue;this.chargeFilth(p,'slam'); if (canDisplace(e)) e.knockdown = .45; } }
        p.slam = p.airAttack = false; p.airDashes = 0; p.airDash = 0;
      }
    }
    const committed = p.attack && p.attack.elapsed < p.attack.move.startup + p.attack.move.active;
    const sticky = p.z < 10 && this.setpieces.some(t => t.kind === 'taffy' && setpieceRunning(t,this.wave,this.encounterActive,this.players) && trapState(t).warning && ((p.x-t.x)/78)**2+((p.y-t.y)/32)**2 < 1);
    const speed = p.roll > 0 ? 700 : p.speed * (committed ? .65 : 1) * (sticky ? .6 : 1);
    p.x += ((p.roll > 0 ? p.rollX : ix) * speed + (p.roll>0?0:this.flowSpeed(p.x,p.y,p.z))) * dt; p.y += (p.roll > 0 ? p.rollY : iy) * speed * .7 * dt;
    if (Math.abs(ix) > .1 && !committed) p.face = Math.sign(ix);
    p.walk = len > .05 ? p.walk + dt * (p.hero === 'moss' ? 14 : 18) : 0;
    const beat = this.currentEncounter, locked = beat && !this.cleared;
    p.x = clamp(p.x, locked ? Math.max(60, beat.x - 160) : 60, locked ? Math.min(this.worldWidth - 60, beat.x + 900) : this.worldWidth - 60);
    p.y = clamp(p.y, locked ? beat.top : 360, locked ? beat.bottom : 543);
    for (const prop of this.props) if (prop.kind === 'gate' && !prop.active && p.x > prop.x - 30) p.x = prop.x - 30;
    const ally = this.players.find(other => other !== p);
    if (ally && !ally.downed) {
      p.x = clamp(p.x, ally.x - 680, ally.x + 680);
      const dx = p.x - ally.x, dy = p.y - ally.y, d = Math.hypot(dx, dy);
      if (d < 33) { p.x += (dx || (p.id ? -1 : 1)) / Math.max(1,d) * 70 * dt; p.y = clamp(p.y + dy / Math.max(1,d) * 70 * dt, locked ? beat.top : 360, locked ? beat.bottom : 543); }
    }
    if (p.attack) {
      p.attack.elapsed += dt; const a = p.attack;
      if (a.elapsed >= a.move.startup && a.elapsed <= a.move.startup + a.move.active) this.attackContact(p);
      p.attackTime = Math.max(0, moveDuration(a.move) - a.elapsed);
      if (a.elapsed >= moveDuration(a.move)) { if (!['light','air'].includes(a.move.kind)) { p.combo = 0; p.comboWindow = 0; } p.attack = null; p.attackTime = 0; p.cooldown = 0; }
    }
    if (!p.attack && p.cooldown <= 0 && p.roll <= 0 && !p.slam) {
      const next = p.queued ?? (input.attack ? 'light' : null);
      if (next) this.startAttack(p, next === 'heavy',!!p.queuedDown);
    }
    if (ally?.downed && Math.hypot(ally.x - p.x, ally.y - p.y) < 80 && input.magic && p.z === 0 && p.roll <= 0) {
      p.reviveLatch = true; if (p.hurt > 0) ally.revive = 0; else ally.revive += dt; p.attack = null; p.attackTime = 0;
      if (ally.revive >= 2) { ally.hp = Math.ceil(ally.maxHp * .4); ally.downed = false; ally.revive = 0; ally.invulnerable = 1.5; this.revives++; this.label(ally.x, ally.y - 100, 'RESTUFFED!'); this.emit('revive'); }
    } else { if (ally?.downed) ally.revive = Math.max(0, ally.revive - dt * .5); if (input.magic && !p.reviveLatch) this.magic(p); }
  }
  private strikeMachine(prop: Prop, bowled: boolean) {
    const m = this.machines.find(m => m.encounter === prop.machine);
    if (!m || m.phase !== 'ready' || this.wave !== m.encounter || !this.encounterActive) return;
    m.strikes = Math.min(3, m.strikes + (bowled ? 3 : 1)); this.emit('clang');
    this.impact(prop.x, prop.y - 40, 'heavy', WORKPLACES[m.region].color);
    if (m.strikes < 3) { this.label(prop.x, prop.y - 100, `${3-m.strikes} MORE HEAVY HITS!`); return; }
    m.phase = 'running'; m.clock = 0; m.bowled = bowled; prop.active = true;
    this.label(prop.x, prop.y - 125, bowled ? 'EMPLOYEE CHECKED IN!' : 'WARRANTY VOID!');
    this.emit('machine-warning');
  }
  private updateMachines(dt: number) {
    for (const m of this.machines) {
      if (m.phase !== 'running' || m.encounter !== this.wave || !this.encounterActive) continue;
      m.clock += dt;
      for (const zone of machineZones(m)) {
        if (!zone.active) continue;
        if (!m.fired.has(zone.id)) { m.fired.add(zone.id); this.emit(WORKPLACES[m.region].cue); this.shake = Math.max(this.shake, .16); }
        for (const p of this.players) if (!p.downed && !m.hits.has(`${zone.id}:p${p.id}`) && inMachineZone(zone, p.x, p.y, p.z)) {
          const hp = p.hp;
          this.damagePlayer(p, this.relaxed ? 10 : 18, zone.x, zone.ceiling, {kind:'sabotage',region:m.region});
          if (p.hp < hp) m.hits.add(`${zone.id}:p${p.id}`);
        }
        for (const e of this.enemies) if (e.hp > 0 && e.kind !== 'boss' && e.entrance <= 0 && !m.hits.has(`${zone.id}:e${e.id}`) && inMachineZone(zone, e.x, e.y, e.z)) {
          m.hits.add(`${zone.id}:e${e.id}`);
          this.damageEnemy(e, 82 + m.region * 9, Math.sign(e.x - zone.x) * 20, false, 'heavy');
          if (m.region === 1 || m.region === 3) { e.frozen = 1.3; e.stun = Math.max(e.stun, 1.3); }
          this.label(e.x, e.y - 105, 'PAID IN EXPOSURE');
        }
      }
      if (m.clock >= 3.4) {
        m.phase = 'wrecked'; this.gold += m.bowled ? 65 : 35; this.gainXp(m.bowled ? 50 : 30);
        this.label(m.x, m.y - 125, WORKPLACES[m.region].payoff); this.emit('machine-break');
        this.burst(m.x, m.y - 130, WORKPLACES[m.region].color, 28); this.shake = Math.max(this.shake, .24);
        this.scars.push({x:m.x,y:m.y,color:WORKPLACES[m.region].color,seed:m.encounter*39});
        if (this.scars.length > 90) this.scars.shift();
      }
    }
  }
  private updateWorld(dt: number) {
    this.updateMachines(dt);
    for (const trap of this.setpieces) {
      if (!setpieceRunning(trap,this.wave,this.encounterActive,this.players)) continue;
      trap.clock += dt;
      const state = trapState(trap);
      if (state.cycle !== trap.cycle) { trap.cycle = state.cycle; trap.hits.clear();if(trap.road)this.emit('machine-warning'); }
      const inside = (x: number, y: number) => ((x - state.x) / state.rx) ** 2 + ((y - state.y) / state.ry) ** 2 < 1;
      // The suckhole pulls during its warning; dodging or jumping breaks the pull.
      if (state.warning && trap.kind === 'drain') for (const p of this.players) {
        if (!p.downed && p.z < 10 && p.roll <= 0 && Math.hypot(p.x-trap.x,p.y-trap.y) < 145 && (!trap.road||Math.abs(p.y-trap.y)<48)) { p.x += Math.sign(trap.x-p.x)*dt*32; p.y += Math.sign(trap.y-p.y)*dt*18; }
      }
      if (!state.active) continue;
      for (const p of this.players) if (!p.downed && !trap.hits.has(`p${p.id}`) && p.z < state.ceiling && inside(p.x,p.y)) {
        const hp = p.hp; this.damagePlayer(p, this.relaxed ? 10 : 18, state.x, state.ceiling, {kind:'machine',machine:trap.kind,supply:trap.road});
        if (p.hp < hp) { trap.hits.add(`p${p.id}`); this.burst(p.x,p.y-10,'#d3dd83',8); }
      }
      for (const e of this.enemies) if (e.hp > 0 && e.kind !== 'boss' && !trap.hits.has(`e${e.id}`) && e.z < state.ceiling && inside(e.x,e.y)) {
        trap.hits.add(`e${e.id}`); this.damageEnemy(e, 48, 0, false, 'heavy'); this.label(e.x,e.y-115,'WORKPLACE INCIDENT');
      }
    }
    for (const prop of this.props) {
      if (prop.active) continue;
      if (prop.kind === 'spring') {
        for (const p of this.players) if (!p.downed && p.z === 0 && p.vz === 0 && Math.hypot(p.x - prop.x, p.y - prop.y) < 29) { p.vz = 850; this.emit('bounce'); this.label(p.x, p.y - 100, 'BOING!'); }
      }
      if (prop.kind === 'vent' && this.time % 4 > 2.8) {
        for (const p of this.players) if (Math.hypot(p.x - prop.x, p.y - prop.y) < 52) this.damagePlayer(p, 9, prop.x, 35, {kind:'vent'});
        for (const e of this.enemies) if (e.hp > 0 && e.hurt <= 0 && e.z < 35 && Math.hypot(e.x - prop.x, e.y - prop.y) < 52) this.damageEnemy(e, 8, 0, false, 'heavy');
      }
      if (prop.kind === 'laundry' && prop.vx) {
        prop.x += prop.vx * dt; prop.vx *= Math.max(0, 1 - dt * .35);
        const boss = this.enemies.find(e => e.kind === 'boss' && e.hp > 0 && Math.abs(e.x - prop.x) < 75 && Math.abs(e.y - prop.y) < 75);
        if (boss) {
          prop.active = true;
          if (boss.bossState === 'inhale') { boss.bossState = 'jammed'; boss.bossTimer = 3.2; boss.windup = 0; this.damageEnemy(boss, 65, 0, false, 'bowl'); this.label(boss.x, boss.y - 200, 'SOCK BLOCKED!'); this.emit('jam'); }
          else { this.label(prop.x, prop.y - 65, 'WAIT FOR THE OPEN DRUM'); this.emit('clang'); }
        }
        if (prop.x < 60 || prop.x > this.worldWidth - 60) prop.active = true;
      }
    }
    if (this.cart && !this.cart.complete) {
      const cart = this.cart;
      cart.cooldown=Math.max(0,(cart.cooldown??0)-dt);
      const boost=cart.boost??0,near=this.players.some(p=>!p.downed&&Math.hypot(p.x-cart.x,p.y-cart.y)<185);
      const blockers=this.enemies.filter(e=>e.hp>0&&e.entrance<=0&&e.z<55&&Math.abs(e.y-cart.y)<55);
      cart.moving=boost>0||near&&!this.enemies.some(e=>e.hp>0&&e.knockdown<=0&&Math.hypot(e.x-cart.x,e.y-cart.y)<125);
      if(cart.moving){
        let next=Math.min(cart.goal,cart.x+dt*(145+boost*360));
        if(boost>0)for(const e of blockers.sort((a,b)=>a.x-b.x)){
          if(e.x<cart.x-55||e.x>next+65||cart.hits?.has(e.id))continue;
          if(e.kind==='boss'||bruteBraced(e)||e.defiance>0){
            next=Math.max(cart.x,Math.min(next,e.x-65));cart.boost=0;cart.moving=false;
            this.emit('clang');this.label(cart.x,cart.y-135,'ROADBLOCK! BREAK THE STANCE!');break;
          }
          (cart.hits??=new Set()).add(e.id);
          if(this.damageEnemy(e,32+this.config.region*5,30,false,'bowl',{x:cart.x,height:0})&&canDisplace(e)){
            e.knockdown=.65;e.windup=0;e.vx=310;e.guard=1;
          }
          this.label(e.x,e.y-115,'SIGNED FOR. WITH FACE.');
        }
        cart.x=next;
      }
      cart.boost=Math.max(0,(cart.boost??0)-dt);
      if (cart.x >= cart.goal) { cart.complete = true; cart.moving = false; cart.boost=0; cart.cooldown=0; this.gold += 40; this.gainXp(35); this.label(cart.x, cart.y - 105, 'SIGNED. SOILED. DELIVERED!'); this.emit('coin'); }
    }
    for (const d of this.dangers) {
      if(this.bossMoment)break;
      if(d.sac&&!d.resolved)d.x+=this.flowSpeed(d.x,d.y)*Math.min(dt,Math.max(0,d.timer));
      if(d.sac?.returned&&!d.resolved){d.x=clamp(d.x+d.sac.vx*Math.min(dt,Math.max(0,d.timer)),40,this.worldWidth-40);d.sac.vx*=Math.exp(-.9*dt);}
      d.timer -= dt;
      if (d.timer <= 0 && !d.resolved) {
        d.resolved=true;
        if(d.sac?.returned){
          for(const e of this.enemies)if(e.hp>0&&e.entrance<=0&&dangerContains(d,e.x,e.y,e.z))this.damageEnemy(e,40+this.config.region*6,Math.sign(e.x-d.x)*25,false,'heavy',{x:d.x,height:0});
        } else for (const p of this.players) if (dangerContains(d,p.x,p.y,p.z)) this.damagePlayer(p,d.damage,d.x,dangerShape(d).ceiling,d.source);
        this.burst(d.x,d.y-10,d.color,18);this.impact(d.x,d.y,'slam',d.color);this.shake=Math.max(this.shake,.12);
        if(d.sac)this.emit('stink-pop');else if(dangerKind(d)!=='blast')this.emit(dangerKind(d)==='stamp'?'stamp-hit':'crunch');
      }
    }
    this.dangers = this.dangers.filter(d => d.timer > -.24);
  }
  private updateEnemy(e: Enemy, dt: number) {
    for (const k of ['hurt','cooldown','attackTime','stun','guard','frozen','dead','recovery'] as const) e[k] = Math.max(0, e[k] - dt);
    e.defiance=Math.max(0,e.defiance-dt);e.heavyMemory=Math.max(0,(e.heavyMemory??0)-dt);
    if(e.hp>0 && e.kind!=='boss') {
      if(e.stun>0 || e.knockdown>0 || e.bowlTime>0 || e.z>0) e.controlTime+=dt; else e.controlTime=Math.max(0,e.controlTime-dt*.5);
      if(e.controlTime>2.1 && e.defiance<=0) { e.defiance=2.4;e.controlTime=0;this.label(e.x,e.y-130,'MAD AS HELL!','#ffbc76'); }
      if(e.defiance>0) {e.stun=e.frozen=e.knockdown=e.bowlTime=e.z=e.vz=e.vx=e.recovery=0;}
    }
    const beat = this.currentEncounter;
    if (e.entrance > 0) { e.entrance = Math.max(0, e.entrance - dt); if (e.entranceKind === 'drop') { e.vz -= 1600 * dt; e.z = Math.max(0, e.z + e.vz * dt); } return; }
    if (e.z > 0 || e.vz > 0) {
      e.vz -= dt * 1600; e.z += e.vz * dt;
      if (e.z <= 0) { e.z = e.vz = 0; e.knockdown = Math.max(e.knockdown, .38); e.juggle = 0; this.burst(e.x, e.y, '#e8d7b8', 6); }
    }
    e.x += (e.vx+(canDisplace(e)?this.flowSpeed(e.x,e.y,e.z):0)) * dt;
    if (e.bowlTime > 0) {
      e.bowlTime = Math.max(0, e.bowlTime - dt);
      for (const other of this.enemies) if (other !== e && other.hp > 0 && other.entrance <= 0 && !e.bowlHits.has(other.id) && Math.abs(e.x - other.x) < 44 && Math.abs(e.y - other.y) < 53 && Math.abs(e.z - other.z) < 75) {
        e.bowlHits.add(other.id); this.bowlingHits++; this.damageEnemy(other, 34 + this.level * 3, Math.sign(e.vx) * 15, false, 'bowl',{x:e.x,height:e.z});
        if (canDisplace(other)) { other.guard = 1.2; other.knockdown = .65; other.vx = e.vx * .6; other.windup = 0; }
        this.label(other.x, other.y - 100, 'STUFFING STRIKE!'); this.emit('bowl');
      }
      for (const prop of this.props) if (!prop.active && !e.bowlHits.has(prop.id) && Math.hypot(e.x - prop.x, e.y - prop.y) < 55) {
        e.bowlHits.add(prop.id);
        if (prop.kind === 'spring' && e.bounces < 2) {
          const target = this.enemies.filter(q => q !== e && q.hp > 0 && !e.bowlHits.has(q.id)).sort((a,b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0];
          e.vx = (target ? Math.sign(target.x - e.x) || 1 : -Math.sign(e.vx)) * 650; if (target) e.y += (target.y - e.y) * .6;
          e.vz = 260; e.bowlTime = .7; e.bounces++; this.label(e.x, e.y - 90, 'BOING!'); this.emit('bounce');
        } else if (prop.kind === 'bell' && e.z < 100) this.strikeMachine(prop, true);
        else if (['barrel','snack','chest'].includes(prop.kind)) this.breakProp(prop, this.players.find(p => !p.downed) ?? this.player);
      }
    } else e.vx *= Math.max(0, 1 - dt * 12);
    e.x = clamp(e.x, beat && !this.cleared ? Math.max(60, beat.x - 135) : 60, beat && !this.cleared ? Math.min(this.worldWidth - 60, beat.x + 860) : this.worldWidth - 60);
    if (e.hp <= 0) return;
    if (e.knockdown > 0 && e.z === 0 && e.bowlTime <= 0) { e.knockdown = Math.max(0, e.knockdown - dt); if (e.knockdown === 0) e.recovery = .25; return; }
    if (e.z > 0 || e.bowlTime > 0 || e.recovery > 0 || e.stun > 0) return;
    const target = this.players.filter(p => !p.downed).sort((a,b) => Math.hypot(a.x-e.x,(a.y-e.y)*1.4) - Math.hypot(b.x-e.x,(b.y-e.y)*1.4))[0];
    if (!target) return; e.target = target.id;
    if (e.kind === 'boss') { this.updateBoss(e, target, dt); return; }
    if (e.kind === 'healer') { this.updateHealer(e, target, dt); return; }
    const lure=e.defiance<=0 && ['raider','shield','flanker','charger'].includes(e.kind) ? this.messes.find(m=>m.kind==='decoy' && m.life>0 && Math.hypot(m.x-e.x,m.y-e.y)<310) : undefined;
    if(lure && e.windup<=0 && e.rush<=0) { const dx=lure.x-e.x,dy=lure.y-e.y,d=Math.hypot(dx,dy);e.face=Math.sign(dx)||e.face; if(d>55){e.x+=dx/d*150*dt;e.y+=dy/d*110*dt;e.walk+=dt*10;} else if(e.cooldown<=0){e.attackTime=.25;e.cooldown=.8;lure.hp--;if(lure.hp<=0)this.popMess(lure);}return; }
    const dx = target.x - e.x, dy = target.y - e.y;
    if (e.rush > 0) {
      e.rush=Math.max(0,e.rush-dt);const speed=e.kind==='flanker'?620:e.kind==='raider'?400:490;
      e.x+=e.dashX*speed*dt;e.y+=e.dashY*speed*dt;e.walk+=dt*24;
      e.x=clamp(e.x,beat?Math.max(60,beat.x-135):60,beat?Math.min(this.worldWidth-60,beat.x+860):this.worldWidth-60);e.y=clamp(e.y,beat?.top??360,beat?.bottom??543);
      for(const p of this.players)if(Math.abs(p.x-e.x)<(e.kind==='charger'?65:48)&&Math.abs(p.y-e.y)<38)this.damagePlayer(p,e.kind==='charger'?19:e.kind==='flanker'?17:14,e.x,48,{kind:'enemy',enemy:e.kind,region:this.config.region,attack:'rush'});
      if(e.rush===0)e.recovery=e.kind==='raider'?.3:.42;return;
    }
    if (e.windup > 0) {
      e.windup = Math.max(0, e.windup - dt);
      if (e.windup === 0) {
        e.attackTime = e.kind === 'brute' ? .42 : .24; e.cooldown = (e.kind === 'brute' ? 1.4 : e.kind === 'archer' ? 1.3 : e.kind==='flanker'?1.7:1.05) * (e.elite ? .8 : 1);
        if (e.kind === 'archer') { this.shoot(e, e.targetX, e.targetY, 350, 13, '#f8dfa5'); if (e.elite) this.shoot(e,e.targetX,e.targetY+55,310,13,'#f8dfa5'); }
        else if (e.kind === 'bomber') {this.emit('retch');this.dangers.push({source:{kind:'enemy',enemy:e.kind,region:this.config.region},x:e.targetX,y:e.targetY,radius:74,timer:.8,damage:20,color:'#e9ab89',sac:{returned:false,vx:0}},{source:{kind:'enemy',enemy:e.kind,region:this.config.region},x:e.targetX+e.face*85,y:clamp(e.targetY+(e.id%2?60:-60),beat?.top??360,beat?.bottom??543),radius:64,timer:1.25,damage:17,color:'#c2cf89',sac:{returned:false,vx:0}});}
        else if (['charger','raider','flanker'].includes(e.kind)) {const dx=e.targetX-e.x,dy=e.kind==='charger'?0:e.targetY-e.y,d=Math.hypot(dx,dy)||1;e.dashX=dx/d;e.dashY=dy/d;e.rush=e.kind==='raider'?.38:e.kind==='flanker'?.3:.58;this.impact(e.x,e.y-20,'dash','#edb1a0',e.face);}
        else {if(e.kind==='brute' && e.targetZ<=40){this.projectiles.push({x:e.x+e.face*55,y:e.y,z:0,vx:e.face*370,vy:0,life:.85,friendly:false,damage:18,hit:new Set(),color:'#ffc2a0',groundWave:true,source:{kind:'enemy',enemy:'brute',region:this.config.region,attack:'wave'}});this.impact(e.x+e.face*45,e.y,'slam','#d5b09c');}
        for (const p of this.players) if ((p.x-e.x)*e.face > -15 && (p.x-e.x)*e.face < (e.kind==='brute'?125:82) && Math.abs(p.y-e.y)<(e.kind==='brute'?62:43)) this.damagePlayer(p, e.kind==='brute'?23:e.kind==='flanker'?14:12, e.x, e.kind==='brute' && e.targetZ > 40 ? 160 : e.kind==='brute'?65:48,{kind:'enemy',enemy:e.kind,region:this.config.region,attack:e.kind==='brute'&&e.targetZ>40?'swat':undefined});}
      }
      return;
    }
    e.face = Math.sign(dx) || e.face;
    const ranged = ['archer','bomber'].includes(e.kind), range = ranged ? 290 : e.kind === 'charger' ? 320 : e.kind === 'brute' ? 150 : e.kind==='raider'?170:e.kind==='flanker'?220:85;
    const occupied = this.enemies.filter(q => q !== e && q.hp > 0 && (q.windup > 0 || q.rush > 0)).length;
    const canAttack = Math.abs(dx) < range && Math.abs(dy) < (ranged ? 160 : e.kind === 'charger' ? 32 : 40);
    if (canAttack && e.cooldown <= 0 && occupied < this.players.length + (this.relaxed?1:2) + Number(!this.relaxed && this.config.region >= 3)) { e.windup = e.kind==='brute'?.7:e.kind==='charger'?.7:e.kind==='raider'?.46:e.kind==='flanker'?.52:ranged?.65:.36; e.targetX = target.x; e.targetY = target.y; e.targetZ = target.z; if (e.kind === 'brute') { e.vx = 0; e.walk = 0; this.emit('brace'); if(e.targetZ > 40)this.label(e.x,e.y-145,'FLY SWAT!'); } return; }
    let goalX = target.x - e.face * (range - 18), goalY = target.y;
    if (e.kind === 'flanker' && Math.abs(dx)>85) { goalX = target.x - target.face * 65; goalY = clamp(target.y + (e.id%2?58:-58), beat?.top ?? 360, beat?.bottom ?? 543); }
    if(e.kind==='shield' && Math.abs(dx)>100)goalY=clamp(target.y+Math.sin(this.time*3+e.id)*75,beat?.top??360,beat?.bottom??543);
    if(e.kind==='archer')goalY=clamp(target.y+Math.sin(this.time*2.7+e.id)*65,beat?.top??360,beat?.bottom??543);
    if(e.kind==='bomber')goalY=clamp(target.y+(e.id%2?75:-75),beat?.top??360,beat?.bottom??543);
    if (ranged && Math.abs(dx) < 170) goalX = target.x - e.face * 220;
    const mx = goalX-e.x, my = goalY-e.y, distance = Math.hypot(mx,my);
    if (distance > 8) { const speed = e.kind==='brute'?95:e.kind==='shield'?150:e.kind==='flanker'?215:e.kind==='archer'?180:e.kind==='bomber'?175:ranged?120:175; e.x += mx/distance*speed*dt; e.y += my/distance*speed*.7*dt; e.walk += dt*10; }
    e.y = clamp(e.y, beat?.top ?? 360, beat?.bottom ?? 543);
  }
  private cancelStitch(e: Enemy) {
    e.patient = undefined; e.windup = 0; e.cooldown = 2; e.attackTime = 0;
    this.label(e.x,e.y-135,'CLAIM DENIED!','#d9efac'); this.emit('snip');
    this.impact(e.x,e.y-70,'guard','#d9efac');
  }
  private updateHealer(e: Enemy, target: Player, dt: number) {
    if (e.windup > 0) {
      if (e.patient !== undefined) {
        const patient = this.enemies.find(q=>q.id===e.patient);
        if (!stitchConnected(e,patient)) { this.cancelStitch(e); return; }
        e.face = Math.sign(patient.x-e.x)||e.face;
        e.windup = Math.max(0,e.windup-dt);
        if (e.windup === 0) {
          const restored = Math.min(32,patient.maxHp-patient.hp);
          patient.hp += restored; e.patient = undefined; e.cooldown = e.elite ? 2.8 : 3.4; e.attackTime = 0;
          if (restored > 0) { this.label(patient.x,patient.y-patient.z-120,`+${Math.round(restored)} RESTUFFED`,'#d9efac'); this.burst(patient.x,patient.y-patient.z-60,'#cae9a3',12); this.emit('restuff'); }
        }
      } else {
        // The orphaned medic has one committed, avoidable slap instead of fleeing forever.
        e.windup = Math.max(0,e.windup-dt);
        if (e.windup === 0) {
          e.attackTime = .3; e.cooldown = 1.5; e.recovery = .35;
          for (const p of this.players) if ((p.x-e.x)*e.face>-15 && (p.x-e.x)*e.face<100 && Math.abs(p.y-e.y)<40)
            this.damagePlayer(p,12,e.x,48,{kind:'enemy',enemy:'healer',region:this.config.region});
        }
      }
      return;
    }
    const crew = this.enemies.filter(q=>q!==e&&q.hp>0&&q.kind!=='healer');
    const patient = choosePatient(e,crew);
    if (patient && e.cooldown<=0) { e.patient=patient.id; e.windup=STITCH_TIME; this.emit('stitch'); return; }
    const dx=target.x-e.x,dy=target.y-e.y;
    e.face=Math.sign(dx)||e.face;
    if (!crew.length && Math.abs(dx)<90 && Math.abs(dy)<38 && e.cooldown<=0) {
      e.patient=undefined; e.windup=.65; e.targetX=target.x; e.targetY=target.y; return;
    }
    const ally=crew.sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
    let goalX=ally ? ally.x-Math.sign(target.x-ally.x||1)*140 : target.x-e.face*65;
    const goalY=ally?.y??target.y;
    if (ally && Math.abs(dx)<150) goalX=target.x-e.face*210;
    const mx=goalX-e.x,my=goalY-e.y,d=Math.hypot(mx,my);
    if(d>8){e.x+=mx/d*135*dt;e.y+=my/d*100*dt;e.walk+=dt*8;}
    e.y=clamp(e.y,this.currentEncounter?.top??360,this.currentEncounter?.bottom??543);
  }
  private shoot(e: Enemy, x: number, y: number, speed: number, damage: number, color: string, height?: number) {
    const dx=x-e.x, dy=y-e.y, d=Math.hypot(dx,dy)||1;
    this.projectiles.push({x:e.x,y:e.y,z:height ?? (e.kind === 'archer' ? Math.max(22,e.targetZ) : 22),vx:dx/d*speed,vy:dy/d*speed,life:3,friendly:false,damage,hit:new Set(),color,source:{kind:'enemy',enemy:e.kind,region:this.config.region,attack:'shot'}});
  }
  private endRoyalProtection(e:Enemy,bowled:boolean) {
    e.decree=false;e.bossState=bowled?'jammed':'recover';e.bossTimer=bowled?3.2:2.2;e.windup=0;e.cooldown=.65;
    this.label(e.x,e.y-245,bowled?'RETURN TO SENDER!':'NO STAFF. NO COVER.','#d9efac');
    this.emit('brace-break');this.impact(e.x,e.y-150,'guard','#d9efac');this.burst(e.x,e.y-200,'#e8d6ac',20);
  }
  private updateBoss(e: Enemy, p: Player, dt: number) {
    e.bossTimer = Math.max(0, e.bossTimer - dt);
    const region = this.config.region;
    if(region===5&&e.decree&&!royalStaff(this.enemies).length){this.endRoyalProtection(e,false);return;}
    if (!e.enraged && e.hp < e.maxHp * .5) { e.enraged = true;if(region===4)e.phase=1;e.bossState='idle';e.bossTimer=e.windup=0;e.cooldown=.65;this.dangers=[];this.projectiles=this.projectiles.filter(p=>p.friendly);this.performBoss(e,'rage');return; }
    if (['jammed','recover'].includes(e.bossState)) { e.windup=0; if (e.bossTimer===0) { e.bossState='idle'; e.cooldown=e.enraged?.25:.55; } return; }
    if (e.bossState === 'volley') {
      e.windup=0;
      if(e.bossTimer===0){e.bossState='recover';e.bossTimer=1.65;this.label(e.x,e.y-235,'DENTURES IN THE DISHWASHER!','#d9efac');}
      return;
    }
    if (e.bossState === 'inhale') {
      for (const player of this.players) if (!player.downed && player.z < 35 && player.roll<=0 && Math.abs(player.y-e.y)<90 && (player.x-e.x)*e.face>0 && Math.abs(player.x-e.x)<510) { player.x += Math.sign(e.x-player.x)*dt*100; if(Math.abs(player.x-e.x)<74) this.damagePlayer(player,13,e.x,35,{kind:'enemy',enemy:'boss',region}); }
      if (e.bossTimer === 0) { e.bossState='spin'; e.bossTimer=e.enraged?2.05:1.6; e.face=Math.sign(p.x-e.x)||-1; e.phase++; this.label(e.x,e.y-195,'SPIN CYCLE!'); }
      return;
    }
    if (e.bossState === 'spin') {
      const {low,high}=bossChargeBounds(this.worldWidth,this.currentEncounter?.x);
      e.x=clamp(e.x+e.face*(region===4?410:265)*dt,low,high); e.walk+=dt*25;
      if(e.x===low||e.x===high)e.face*=-1;
      for(const player of this.players)if(Math.abs(player.x-e.x)<85&&Math.abs(player.y-e.y)<(region===4?FORK_DEPTH:65))this.damagePlayer(player,23,e.x,region===4&&raisedForks(e)?1000:55,{kind:'enemy',enemy:'boss',region});
      if(e.bossTimer===0){e.bossState='recover';e.bossTimer=1.8;this.label(e.x,e.y-185,'DIZZY. VERY DIZZY.');} return;
    }
    if (e.bossState === 'windup') {
      e.windup=e.bossTimer;
      if(e.bossTimer>0)return;
      e.phase++; e.attackTime=.35;this.emit(BOSS_SOUNDS[region]);
      if(region===2){
        e.bossState='inhale';e.bossTimer=3.6;
        this.props=this.props.filter(prop=>prop.kind!=='laundry');
        for(let i=0;i<3;i++)this.props.push({id:++this.sequence,kind:'laundry',x:clamp(e.x+e.face*(155+i*95),70,this.worldWidth-70),y:clamp(e.y+(i-1)*48,370,535),hp:1,active:false,vx:0});
        this.label(e.x,e.y-195,'OPEN WIDE!');this.emit('magic');return;
      }
      if(region===4){e.bossState='spin';e.bossTimer=e.enraged?1.7:1.35;e.y=e.targetY;return;}
      if(region===0){
        if(e.phase%2){for(const offset of (e.enraged ? [-120,-60,0,60,120] : [-85,0,85]))this.shoot(e,e.targetX,e.targetY+offset,290,18,'#b1cc73',e.targetZ>45?e.targetZ:22);this.label(e.x,e.y-185,'EXCUSE MEEEE');}
        else {e.x=clamp(e.targetX,80,this.worldWidth-80);e.y=e.targetY;this.dangers.push({source:{kind:'enemy',enemy:e.kind,region:this.config.region},x:e.x,y:e.y,radius:130,timer:.28,damage:26,color:'#cdb485'});}
      } else if(region===1){
        for(let i=(e.enraged?-3:-2);i<=(e.enraged?3:2);i++)this.dangers.push({source:{kind:'enemy',enemy:e.kind,region:this.config.region},x:e.targetX+i*85,y:clamp(e.targetY+(e.phase%2?0:i*22),365,540),kind:'ice',radius:58,timer:.55+Math.abs(i)*.16,damage:20,color:'#bce8f4'});
      } else if(region===3){
        const count=e.enraged?6:4,source={kind:'enemy' as const,enemy:e.kind,region};
        // One committed serving: low sweets sweep first, then dentures snap in
        // the locked target lane and at the Count's feet. Neither tracks dodges.
        for(let i=0;i<count;i++)this.dangers.push({source,x:clamp(e.targetX+(i-(count-1)/2)*85,80,this.worldWidth-80),y:e.targetY,kind:'blast',radius:68,timer:.4+(e.phase%2?i:count-1-i)*.12,damage:22,color:'#f2a4cc'});
        const bite=1.5+(count-4)*.12;
        for(const [x,y] of [[e.targetX,e.targetY],[e.x+e.face*45,e.y]])this.dangers.push({source,x,y,kind:'jaw',radius:110,depth:42,timer:bite,damage:30,color:'#f2a4cc'});
        e.bossState='volley';e.bossTimer=bite+.3;e.windup=0;
        this.label(e.x,e.y-235,'FIRST THE SWEETS. THEN THE TEETH.');return;
      } else {
        if(e.phase%3===1&&this.enemies.filter(q=>q.hp>0).length<5){for(const kind of ['flanker','shield'] as const){const minion=this.spawn(kind,e.x-190,kind==='shield'?515:390);minion.entrance=.8;minion.summoned=true;}e.decree=true;this.label(e.x,e.y-245,'STAFF TAKE THE BLAME!');}
        else if(e.phase%3===2)for(const offset of [-120,-60,0,60,120])this.shoot(e,e.targetX,e.targetY+offset,340,19,'#f6d887');
        else this.dangers.push({source:{kind:'enemy',enemy:e.kind,region:this.config.region},x:e.targetX,y:e.targetY,kind:'stamp',radius:180,depth:48,timer:.7,damage:29,color:'#e7beef'});
      }
      e.bossState='recover';e.bossTimer=region===0?1.35:1.65;e.windup=0;return;
    }
    e.face=Math.sign(p.x-e.x)||e.face;
    const dx=p.x-e.x,dy=p.y-e.y;
    if(Math.abs(dx)>240){e.x+=Math.sign(dx)*90*dt;e.walk+=dt*8;}
    e.y+=Math.sign(dy)*Math.min(Math.abs(dy),65*dt);
    if(e.cooldown<=0){e.bossState='windup';e.bossTimer=region===4?1:.85;e.windup=e.bossTimer;e.targetX=p.x;e.targetY=p.y;e.targetZ=p.z;if(region===4)this.label(e.x,e.y-210,raisedForks(e)?'FORKS UP! CHANGE LANES!':'FORKS LOW! JUMP!');}
  }
  private updateProjectiles(dt: number) {
    for(const b of this.projectiles){
      b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
      if(b.friendly){for(const e of this.enemies)if(e.hp>0&&e.entrance<=0&&!b.hit.has(e.id)&&Math.abs(e.x-b.x)<40&&Math.abs(e.y-b.y)<40&&Math.abs(e.z-(b.z??0))<(e.kind==='boss'?150:55)){const rewarded=b.rewarded??b.hit.size>0,dealt=this.damageEnemy(e,b.damage,Math.sign(b.vx)*12,false,'magic',{x:e.x-Math.sign(b.vx)*60,height:b.z??0});if(dealt && !rewarded && b.owner!==undefined)this.chargeFilth(this.players[b.owner],b.groundWave?'quake':'power');b.rewarded=rewarded||dealt;b.hit.add(e.id);}}
      else { const decoy=this.messes.find(m=>m.life>0 && m.kind==='decoy' && Math.abs(m.x-b.x)<35 && Math.abs(m.y-b.y)<35 && (b.z??0)<60);if(decoy){decoy.hp--;b.life=0;if(decoy.hp<=0)this.popMess(decoy);continue;} }
      if(!b.friendly) for(const p of this.players)if(!p.downed&&!b.hit.has(p.id)&&Math.abs(p.x-b.x)<30&&Math.abs(p.y-b.y)<32&&Math.abs(p.z-(b.z??0))<45){b.hit.add(p.id);this.damagePlayer(p,b.damage,b.x,(b.z??0)+45,b.source);b.life=0;}
    }
    this.projectiles=this.projectiles.filter(b=>b.life>0&&b.x>0&&b.x<this.worldWidth&&b.y>310&&b.y<590);
  }
  private updatePickups(dt: number) {
    this.pickups=this.pickups.filter(item=>{
      item.x+=this.flowSpeed(item.x,item.y)*dt;
      item.phase+=dt*5;
      const p=this.players.filter(p=>!p.downed&&(item.kind==='gold'||p.hp<p.maxHp)).sort((a,b)=>Math.hypot(a.x-item.x,a.y-item.y)-Math.hypot(b.x-item.x,b.y-item.y))[0];
      if(!p)return true;
      const dx=p.x-item.x,dy=p.y-item.y,d=Math.hypot(dx,dy);
      if(d<85){item.x+=dx*dt*7;item.y+=dy*dt*7;}
      if(d<26){if(item.kind==='gold')this.gold+=item.value;else{p.hp=Math.min(p.maxHp,p.hp+item.value);this.label(p.x,p.y-95,`+${item.value} STUFFING`,'#cceba5');}this.emit('coin');return false;}return true;
    });
  }
}
export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const counterActive = (attack: AttackState) => attack.counter === true;
