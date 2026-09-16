import { chapterEncounters } from './encounters';
import { z } from 'zod';
import { HEROES, WEAPONS, STAGES, levelForXp } from './content';
import { STYLES } from './progression';

// A closed, versioned format. Only parsed fields can enter the simulation; an old
// or damaged bookmark is discarded independently of the player's banked profile.
const n = z.number().min(-1e9).max(1e9), count = z.number().int().min(0).max(1e9);
const num = <K extends string>(...keys: K[]) => Object.fromEntries(keys.map(k=>[k,n])) as Record<K, typeof n>;
const bool = <K extends string>(...keys: K[]) => Object.fromEntries(keys.map(k=>[k,z.boolean()])) as Record<K, z.ZodBoolean>;
const text=z.string().max(220), color=z.string().regex(/^#[\da-f]{3,8}$/i);
const hero=z.enum(HEROES.map(h=>h.id)), weapon=z.enum(WEAPONS.map(w=>w.id)), style=z.enum(STYLES.map(s=>s.id));
const enemy=z.enum(['raider','archer','brute','shield','bomber','charger','healer','flanker','boss']);
const move=z.enum(['light','launcher','bowl','pull','spin','air','slam','quake','kick','hex']);
const trap=z.enum(['spore','cutter','drain','taffy','press','stamp']);
const ids=z.array(count).max(256).transform(a=>new Set(a)), tags=z.array(z.string().max(32)).max(256).transform(a=>new Set(a));
const actor={...num('x','y','hp','maxHp','face','hurt','walk','attackTime')};
const source=z.discriminatedUnion('kind',[
  z.object({kind:z.literal('enemy'),enemy,region:z.number().int().min(0).max(5),attack:z.enum(['rush','shot','wave','swat','read-heavy']).optional()}),
  z.object({kind:z.literal('machine'),machine:trap,supply:z.boolean().optional()}),z.object({kind:z.literal('sabotage'),region:z.number().int().min(0).max(5)}),
  z.object({kind:z.literal('vent')}),z.object({kind:z.literal('blast')})
]);
const attack=z.object({move:z.object({kind:move,...num('startup','active','recovery','damage','reach','depth','knock')}),elapsed:n,hit:ids,propHit:ids,connected:z.boolean(),face:n,rewarded:z.boolean().optional(),finisher:z.boolean().optional(),counter:z.boolean().optional(),empowered:z.boolean().optional()});
const player=z.object({ ...actor,id:count,hero,weapon,...num('mana','power','speed','combo','comboWindow','cooldown','spellCooldown','dodgeCooldown','roll','invulnerable','rollX','rollY','z','vz','landing','uppercutWindow','queueTime','revive','counter','airDash','airDashes','infusion','variety','varietyTime','filth','powerPose'),
  ...bool('jumpHeld','airAttack','attackHeld','heavyHeld','downed','reviveLatch','slam'),queuedDown:z.boolean().optional(),attack:attack.nullable(),queued:z.enum(['light','heavy']).nullable(),lastMove:move.nullable(),recentMoves:z.array(z.string().max(30)).max(16)
});
const foe=z.object({...actor,id:count,kind:enemy,...num('cooldown','windup','stun','targetX','targetY','dead','phase','rush','z','vz','vx','knockdown','recovery','guard','entrance','bowlTime','bounces','juggle','frozen','bossTimer','target','targetZ','blocked','controlTime','defiance','dashX','dashY'),
  decree:z.boolean().optional(),heavyReads:count.optional(),heavyMemory:n.min(0).optional(),patient:count.optional(),...bool('elite','enraged','summoned'),entranceKind:z.enum(['nap','drop','run']),bowlHits:ids,bossState:z.enum(['idle','windup','inhale','spin','volley','recover','jammed'])
});
const prop=z.object({id:count,kind:z.enum(['chest','barrel','spring','lever','gate','vent','snack','laundry','bell']),...num('x','y','hp'),active:z.boolean(),link:count.optional(),weapon:weapon.optional(),vx:n.optional(),hazard:count.optional(),machine:count.optional(),flow:count.max(0).optional()});
const upgrades=z.object({strength:count.max(5),vitality:count.max(5),spirit:count.max(5)});
const snapshot=z.object({
  bossMoment:z.object({kind:z.enum(['entrance','rage','defeat']),boss:count,region:count.max(5),...num('clock','duration','x','y')}).nullable(),
  players:z.array(player).min(1).max(2),props:z.array(prop).max(150),enemies:z.array(foe).max(64),
  setpieces:z.array(z.object({id:count,encounter:count,kind:trap,road:z.boolean().optional(),...num('x','y','clock','cycle'),disabled:z.boolean(),hits:tags})).max(12),
  machines:z.array(z.object({encounter:count,region:count.max(5),...num('x','y','controlX','controlY','strikes','clock'),phase:z.enum(['ready','running','wrecked']),bowled:z.boolean(),hits:tags,fired:ids})).max(6),
  scars:z.array(z.object({...num('x','y','seed'),color})).max(90),
  messes:z.array(z.object({id:count,kind:z.enum(['sludge','decoy']),...num('x','y','life','owner','damage','hp'),empowered:z.boolean()})).max(128),
  particles:z.array(z.object({...num('x','y','vx','vy','life','maxLife','size'),color})).max(2048),
  texts:z.array(z.object({...num('x','y','life'),text,color})).max(256),
  projectiles:z.array(z.object({...num('x','y','vx','vy','life','damage'),friendly:z.boolean(),hit:ids,color,z:n.optional(),owner:count.optional(),groundWave:z.boolean().optional(),rewarded:z.boolean().optional(),source:source.optional()})).max(256),
  pickups:z.array(z.object({...num('x','y','value','phase'),kind:z.enum(['gold','health'])})).max(256),
  dangers:z.array(z.object({...num('x','y','radius','timer','damage'),kind:z.enum(['blast','ice','jaw','stamp']).optional(),depth:n.min(1).optional(),resolved:z.boolean().optional(),sac:z.object({returned:z.boolean(),vx:n.min(-620).max(620)}).optional(),color,source:source.optional()})).max(128),
  impacts:z.array(z.object({...num('x','y','face','life','duration'),kind:z.enum(['hit','heavy','launch','slam','guard','death','dash','cast']),color})).max(256),
  cart:z.object({...num('x','y','goal'),...bool('moving','complete'),boost:z.number().min(0).max(1).optional(),cooldown:z.number().min(0).max(2.4).optional(),hits:ids.optional()}).nullable(),
  ...num('xp','earnedXp','level','kills','gold','score','wave','time','camera','sequence','group','groupTimer','comboHits','comboTimer','bestCombo','bowlingHits','juggles','revives','perfectDodges','meltdowns'),
  foundWeapons:z.array(weapon).max(8),ownedWeapons:z.array(weapon).min(1).max(8),rng:z.number().int().min(0).max(0xffffffff),cleared:z.boolean(),
  damageLog:z.array(z.object({source,...num('amount','at','player')})).max(6)
});
const bookmark=z.object({format:z.literal(1),rules:z.literal(1),stage:count.max(STAGES.length-1),upgrades,initialXp:count,style,relaxed:z.boolean(),retries:count,retrySeconds:n.min(0),snapshot});
export type FightBookmark=z.output<typeof bookmark>;
export const stringifyBookmark=(value: FightBookmark) => JSON.stringify(value,(_k,v)=>v instanceof Set?[...v]:v);
export function parseBookmark(raw: unknown): FightBookmark | null {
  if(typeof raw!=='string'||raw.length>750000)return null;
  try {
    const result=bookmark.safeParse(JSON.parse(raw));if(!result.success)return null;
    const b=result.data,s=b.snapshot,chapter=STAGES[b.stage],count=chapterEncounters(b.stage).length;
    if(!Number.isInteger(s.wave)||s.wave < -1||s.wave>=count)return null;
    if(s.cleared && (s.wave<0 || s.wave===count-1))return null;
    if(s.group!==(s.wave<0?0:s.cleared?chapterEncounters(b.stage)[s.wave].groups.length:1))return null;
    if(s.xp!==b.initialXp+s.earnedXp||s.earnedXp<0||s.gold<0||s.level!==levelForXp(s.xp))return null;
    if(s.players.some((p,i)=>p.id!==i||p.x<0||p.x>chapter.length||p.y<300||p.y>600||p.hp<0||p.hp>p.maxHp||p.maxHp<=0||p.mana<0||p.mana>100||!s.ownedWeapons.includes(p.weapon)))return null;
    if(s.players.every(p=>p.downed))return null;
    const owns=(id:number)=>Number.isInteger(id)&&id>=0&&id<s.players.length;
    if(s.messes.some(m=>!owns(m.owner))||s.projectiles.some(p=>p.owner!==undefined&&!owns(p.owner)))return null;
    if(s.enemies.some(e=>e.x<0||e.x>chapter.length||e.y<300||e.y>600||!owns(e.target)))return null;
    if(s.props.some(p=>p.x<0||p.x>chapter.length||p.y<300||p.y>600))return null;
    if(s.props.some(p=>p.link!==undefined&&!s.props.some(q=>q.id===p.link)||p.hazard!==undefined&&!s.setpieces.some(t=>t.id===p.hazard)||p.machine!==undefined&&!s.machines.some(m=>m.encounter===p.machine)))return null;
    const unique=[...s.props,...s.enemies].map(e=>e.id);
    if(new Set(unique).size!==unique.length||unique.some(id=>id>s.sequence))return null;
    if(s.bossMoment && (s.bossMoment.kind!=='entrance'||s.bossMoment.region!==chapter.region))return null;
    if(s.setpieces.some(t=>t.encounter>=count)||s.machines.some(m=>m.encounter>=count||m.region!==chapter.region))return null;
    return b;
  } catch { return null; }
}
