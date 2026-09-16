import {loadEnemyArt} from './enemy-art';
import { loadHeroArt } from './hero-art';
import {heavyHint} from './combat';
import { scoreScene } from './score-scene';
import { bookmarkCard } from './bookmark-ui';
import { BOSS_PERFORMANCES } from './boss-performance';
import { bossCue } from './boss-cue';
import { defeatPanel } from './defeat-ui';
import { RunSession, earnedStars } from './run-session';
import './style.css';
import './mischief.css';
import './filth.css';
import './comic-ui.css';
import './defeat-ui.css';
import './boss-ui.css';
import './bookmark-ui.css';
import { CHAPTER_MUSIC } from './soundtrack';
import { CHAPTER_STORY, storyLines, type StoryLine } from './story';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { HEROES, STAGES, REGIONS, WEAPONS, COMBOS, BESTIARY, levelForXp, xpForLevel, weaponById, type WeaponId, UPGRADES, upgradeCost, type HeroId, type Upgrade } from './content';
import { STYLES, styleById, validStyle } from './progression';
import { Game } from './engine';
import { Renderer } from './render';
import { Controls } from './input';
import { MenuInput, type MenuContext } from './menu-input';
import './menu-input.css';
import { Sound } from './audio';
import { plushPortrait, weaponPortrait, enemyPortrait } from './plush';
import { stagePreview } from './scenery';
import { readSave, writeSave, buyUpgrade, surgeryLimit, discardedBookmark, saveReadFailed } from './save';

const root = document.querySelector<HTMLElement>('#ui')!;
const touch = document.querySelector<HTMLElement>('#touch')!;
const renderer = new Renderer(document.querySelector<HTMLCanvasElement>('#game')!);
const controls = new Controls(), sound = new Sound();
const save = await readSave();
let game: Game | null = null, screen = saveReadFailed ? 'save-error' : 'home', selectedStage = save.unlocked, paused = false, resultShown = false, lastTime = 0, accumulator = 0, uiClock = 0;
let story: { id:string; stage:number; lines:StoryLine[]; index:number; done:()=>void; replay:boolean } | null = null;
let session: RunSession | null = null;
let payout = { gold: 0, xp: 0 };
let bookmarkKey='', bookmarkClock=0, savingBookmark=false, pendingStage:number|null=null;
let returnScreen = 'home', partner: HeroId | undefined, practice = false;
const hero = () => HEROES.find(h => h.id === save.hero)!;
const level = () => levelForXp(save.xp);
const persist = () => { void writeSave(save).catch(() => toast('Could not save progress. Check available device storage.')); };
const emblem = `<img src="${import.meta.env.BASE_URL}icon.svg" alt="" width="34" height="34" />`;
const arrow = '<span aria-hidden="true">↗</span>';
let toastTimer: ReturnType<typeof setTimeout>;
function toast(message: string) { const el = document.querySelector<HTMLElement>('#toast')!; el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 3500); }

function header(active = '') {
  return `<header class="topbar"><button class="brand" data-go="home" aria-label="Emberbound home">${emblem}<span>EMBERBOUND<small>THE HOLLOW CROWN</small></span></button><nav aria-label="Main navigation"><button data-go="map" class="${active === 'map' ? 'active' : ''}">Adventure</button><button data-go="heroes" class="${active === 'heroes' ? 'active' : ''}">Heroes</button><button data-go="forge" class="${active === 'forge' ? 'active' : ''}">Back-alley surgery</button></nav><div class="nav-end"><span class="wallet"><i>◈</i> ${save.gold.toLocaleString()}</span><button class="icon-button" data-go="settings" aria-label="Settings">⚙</button></div></header>`;
}
function footer() { return '<footer class="footer"><span><i class="live-dot"></i> POORLY BEHAVED. SURPRISINGLY HEROIC.</span><button data-go="help">How to play <span>↗</span></button><span class="version">SOLO + LOCAL CO-OP · v0.31</span></footer>'; }
function setScreen(next: string) {
  if (next === 'settings' || next === 'help') returnScreen = screen;
  screen = next; controls.clear(); renderUI();
}
function renderUI() {
  const touchDevice = Capacitor.isNativePlatform() || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  touch.hidden = !(screen === 'game' && !paused && (touchDevice || save.settings.touch));
  touch.style.visibility='';
  root.className = `screen-${screen}`;
  if(screen==='save-error'){
    root.innerHTML='<div class="modal-backdrop"><section class="modal save-error"><p class="eyebrow">THE FILING CABINET IS JAMMED</p><h2>Could not open your save.</h2><p>Your adventure has not been replaced. Free up device storage if needed, then try reading it again.</p><button class="primary full" data-action="read-save">Try again →</button></section></div>';
  } else if (screen === 'home') {
    root.innerHTML = `${header()}<section class="home-content"><p class="eyebrow"><span></span> BAD TEETH. GREAT ADVENTURES.</p><h1>Little bastards.<br><em>Massive</em><br>problems.</h1><p class="intro">Six stolen teeth. One royal scam. A lifetime buffet pass.<br>Break the debt collectors. Bite the hand that invoices you.</p><div class="home-actions">${save.resume?'<button class="primary" data-action="continue-run">Continue the mess →</button>':`<button class="primary" data-go="map">Begin adventure ${arrow}</button>`}<button class="text-button" data-go="heroes">Meet your hero <span>→</span></button></div><div class="hero-tag"><span class="tiny-shield" style="--hero:${hero().color}">✦</span><div><strong>${hero().name}</strong><small>${hero().title}</small></div><button data-go="heroes" aria-label="Change hero">⇄</button></div></section>${save.resume?`<aside class="chapter-teaser saved-teaser">${bookmarkCard(save.resume,false)}</aside>`:`<aside class="chapter-teaser"><div><p class="eyebrow">CHAPTER ${String(selectedStage + 1).padStart(2, '0')} / SIX TEETH TO FIND</p><h3>${STAGES[selectedStage].name}</h3><p>A lovely walk. Apart from all the teeth.</p></div><button data-action="start" aria-label="Play selected chapter">→</button></aside>`}${footer()}`;
  } else if (screen === 'replace-run' && pendingStage!==null) {
    root.innerHTML=`<div class="modal-backdrop"><section class="modal resume-choice"><p class="eyebrow">ONE POCKET. TWO TERRIBLE PLANS.</p><h2>Leave this mess behind?</h2><p>Starting <strong>${STAGES[pendingStage].name}</strong> replaces the saved adventure below and drops its unbanked loot. Your banked progress stays yours.</p>${bookmarkCard(save.resume,false)}<button class="primary full" data-action="continue-run">Continue saved adventure →</button><div class="pause-options"><button class="secondary" data-action="start-fresh">Start new adventure</button><button class="text-button" data-go="map">Back to map</button></div></section></div>`;
  } else if (screen === 'story' && story) {
    const line=story.lines[story.index],h=hero(),s=STAGES[story.stage],speaker=line.speaker==='hero'?h.name:line.speaker==='boss'?s.boss:'Molar · former tax rat';
    const portrait=line.speaker==='hero'?plushPortrait(h.id):enemyPortrait(line.speaker==='boss'?'boss':'raider',s.region);
    root.innerHTML=`<section class="comic-scene" aria-label="Chapter story"><div class="comic-heading"><span class="eyebrow">THE EXTREMELY TRUE STORY · CHAPTER ${story.stage+1}</span><button class="text-button" data-action="story-skip">Skip chatter →</button></div><h2>${CHAPTER_STORY[story.stage].title}</h2><div class="comic-panels"><div class="comic-portrait"><img src="${portrait}" alt="${speaker}"/><span>${speaker}</span></div><div class="speech-panel"><p class="eyebrow">${speaker}</p><p class="speech" aria-live="polite">${line.text}</p><div class="comic-controls"><span>${story.index+1} / ${story.lines.length}</span><button class="primary" data-action="story-next">${story.index===story.lines.length-1?'Enough talk. Let’s go.':'And then…'} ${arrow}</button></div></div></div><p class="mission-strip"><strong>YOUR TERRIBLE PLAN</strong> ${CHAPTER_STORY[story.stage].task}</p></section>`;
  } else if (screen === 'map') {
    root.innerHTML = `${header('map')}<section class="panel-page"><p class="eyebrow">SIX REGIONS · TWELVE QUESTIONABLE ADVENTURES</p><h2>Choose your adventure.</h2><p class="page-intro">Recover six stolen crown teeth. Take the long road, raid the stashes, and challenge each region’s boss.</p>${bookmarkCard(save.resume)}<div class="camp-links"><button class="secondary" data-action="story-replay">The story so far</button><button class="secondary" data-go="party">${partner ? `Party: ${HEROES.find(h => h.id === partner)!.name} + you` : 'Bring a friend · Local co-op'}</button><button class="secondary" data-action="practice">Try Madame’s boss fight</button></div><div class="crown-progress" aria-label="Crown teeth recovered">${REGIONS.map((r, i) => `<span class="${save.best[i * 2 + 1] > 0 ? 'recovered' : ''}" title="${r.name}">♜<small>${save.best[i * 2 + 1] > 0 ? 'RECOVERED' : r.name}</small></span>`).join('')}</div><div class="stage-grid">${STAGES.map((s, i) => `<button class="stage-card ${s.bossStage ? 'boss-card' : ''} stage-${i} ${i === selectedStage ? 'selected' : ''} ${i > save.unlocked ? 'locked' : ''}" data-stage="${i}" ${i > save.unlocked ? 'disabled' : ''}><div class="stage-art"><span class="chapter-number">${String(i + 1).padStart(2, '0')}</span><img class="map-preview" src="${stagePreview(i)}" loading="lazy" alt="${s.name} scenery" /><span class="stage-status">${i > save.unlocked ? 'LOCKED' : save.best[i] > 0 ? '★'.repeat(save.best[i]) : 'EXPLORE'}</span></div><div class="stage-copy"><span class="eyebrow">${s.label}</span><h3>${s.name}</h3><div class="stage-meta">${s.bossStage ? '♛ BOSS CHAPTER' : '↝ LONG JOURNEY'} · ${s.encounters.length} encounters</div><small class="track-credit">♫ ${CHAPTER_MUSIC[i].title}</small><p>${i > save.unlocked ? 'Complete the previous chapter to unlock.' : s.subtitle}</p></div></button>`).join('')}</div><div class="page-bottom"><div class="selected-hero"><span style="color:${hero().color}">✦</span><div><strong>${hero().name}, ${hero().element} hero</strong><small>Level ${level()} · ${weaponById(save.equipped).name}</small></div><button class="text-button" data-go="heroes">Change</button></div><button class="primary" data-action="start">Enter ${selectedStage === 0 ? 'the wood' : STAGES[selectedStage].bossStage ? 'the boss arena' : 'the trail'} ${arrow}</button></div></section>${footer()}`;
  } else if (screen === 'party') {
    root.innerHTML = `${header('map')}<section class="panel-page"><p class="eyebrow">DOUBLE THE TEETH. HALF THE COMMON SENSE.</p><h2>Bring a friend.</h2><p class="page-intro">Two players on one screen. Use touch or WASD + J/H/K/L/Space for player one. With one controller connected, it belongs to player two. With two controllers, each player gets one. Player two can also use arrows + numpad 1/2/3/4/0 for light/heavy/magic/dodge/jump.</p><div class="hero-grid">${HEROES.map(h => `<button class="hero-card ${partner === h.id ? 'selected' : ''}" data-partner="${h.id}" style="--hero:${h.color}"><div class="hero-portrait"><img class="plush-portrait" src="${plushPortrait(h.id)}" alt="${h.name}" /></div><div class="hero-copy"><h3>${h.name}</h3><p>${partner === h.id ? 'PLAYER TWO · READY' : 'Choose for player two'}</p></div></button>`).join('')}</div><p class="tip">Hold MAGIC beside a downed friend for two seconds to restuff them. A cleared encounter revives them too. Gold, XP and discovered weapons go into this device’s shared save; the first player’s equipped weapon is saved. Each player can wield a different find during a chapter.</p><div class="page-bottom"><button class="secondary" data-action="solo">Play solo</button><button class="primary" data-go="map">${partner ? 'Party ready' : 'Continue solo'} ${arrow}</button></div></section>${footer()}`;
  } else if (screen === 'heroes') {
    root.innerHTML = `${header('heroes')}<section class="panel-page"><p class="eyebrow">HAND-STITCHED. HOUSE-UNTRAINED.</p><h2>Meet the dental disasters.</h2><p class="page-intro">Three extremely questionable heroes. Absolutely no adult supervision.</p><div class="hero-grid">${HEROES.map(h => `<button class="hero-card ${save.hero === h.id ? 'selected' : ''}" data-hero="${h.id}" style="--hero:${h.color};--hero-dark:${h.dark}"><div class="hero-portrait"><img class="plush-portrait" src="${plushPortrait(h.id)}" alt="${h.name}: ${h.description}" /><span class="hero-element">${h.element.toUpperCase()}</span></div><div class="hero-copy"><div class="hero-title"><h3>${h.name}</h3><span>${save.hero === h.id ? '✓ SELECTED' : 'SELECT HERO'}</span></div><p>${h.description}</p><div class="hero-stats"><span>♥ ${h.hp} HP</span><span>⚔ ${h.power} ATK</span></div><div class="spell-detail"><strong>✦ ${h.spell}</strong><small>${h.detail}</small></div></div></button>`).join('')}</div><div class="page-bottom"><button class="secondary" data-go="journal">Meet the local weirdos →</button><button class="primary" data-go="map">To adventure ${arrow}</button></div></section>${footer()}`;
  } else if (screen === 'forge') {
    root.innerHTML = `${header('forge')}<section class="panel-page forge-page"><p class="eyebrow">QUESTIONABLE EQUIPMENT. EXCELLENT BONKING.</p><h2>Upgrade your bad decisions.</h2><p class="page-intro">Spend loose teeth on permanent upgrades. Each defeated boss grants a surgery permit for the next rank. Existing upgrades stay yours.</p><div class="camp-links"><button class="secondary" data-go="armory">Armory &amp; combos →</button><button class="secondary" data-go="journal">Field guide →</button></div><div class="forge-grid">${UPGRADES.map(u => { const n = save.upgrades[u.id]; return `<article class="upgrade-card"><span class="upgrade-icon">${u.icon}</span><p class="eyebrow">PERMANENT UPGRADE</p><h3>${u.name}</h3><p>${u.description}</p><div class="upgrade-pips" aria-label="Level ${n} of 5">${Array.from({ length: 5 }, (_, i) => `<i class="${i < n ? 'filled' : ''}"></i>`).join('')}</div><button class="secondary" data-upgrade="${u.id}" ${n >= surgeryLimit(save) || save.gold < upgradeCost(n) ? 'disabled' : ''}>${n >= 5 ? 'Medically inadvisable' : n >= surgeryLimit(save) ? 'Beat another boss for a permit' : `Upgrade <span>◈ ${upgradeCost(n)}</span>`}</button></article>`; }).join('')}</div><div class="page-bottom"><p class="muted">SURGERY PERMIT ${surgeryLimit(save)} / 5 · Win to keep loose teeth. Defeat keeps new weapons and 25% of XP beyond your previous best failed haul in that chapter.</p><button class="primary" data-go="map">Back to the wilds ${arrow}</button></div></section>${footer()}`;
  } else if (screen === 'armory') {
    root.innerHTML = `${header('forge')}<section class="panel-page"><p class="eyebrow">THE DRAWER OF TERRIBLE IDEAS</p><h2>Pick your problem.</h2><p class="page-intro">Smash golden weapon stashes along each journey. New finds equip immediately; duplicates become gold. Wins bank the full haul. Defeat keeps weapons and a quarter of XP beyond your previous best failed haul in that chapter. Loose teeth are lost. Repeating the same failed route pays no more XP.</p><div class="equipment-summary"><strong>BAD DECISIONS: LV ${level()} / 10</strong><span>${level() === 10 ? 'MAX LEVEL · ALL COMBOS UNLOCKED' : `${save.xp - xpForLevel(level())} / ${xpForLevel(level() + 1) - xpForLevel(level())} XP to next level`}</span><span>Each level: +2 power · +6 health · a burst of healing in battle</span></div><aside class="filth-manifesto"><strong>MAKE A FUCKING MESS.</strong><p>Connect different attacks, splash sludge and dodge late to fill FILTH. Repeat any of your last three moves and it earns no FILTH. At 100%, your next power becomes a free MELTDOWN.</p><p>Ash: aim a flame fart. Wren: vomit, then Heavy the puddle. Bram: lure small melee enemies to your toothy son, then Heavy to pop him. Orange enemy rings mean MAD AS HELL: they take damage but briefly resist stun and knockdown.</p></aside><h3 class="section-title">Train your own bad habits.</h3><p class="page-intro">Choose a fighting style at level 2. New techniques unlock at levels 4, 6 and 8. Switch freely at camp; both local players use this style.</p><div class="style-grid">${STYLES.map(s => `<article class="style-card ${save.style === s.id ? 'selected' : ''}" style="--style:${s.color}"><p class="eyebrow">${save.style === s.id ? 'YOUR STYLE' : 'FIGHTING STYLE'}</p><h3>${s.name}</h3><p>${s.summary}</p>${s.techniques.map(t=>`<div class="technique ${level()<t.level?'locked-technique':''}"><strong>LV ${t.level} · ${t.name}</strong><kbd>${t.input}</kbd><small>${t.detail}</small></div>`).join('')}<button class="secondary" data-style="${s.id}" ${save.style===s.id||level()<2?'disabled':''}>${save.style===s.id?'Selected':level()<2?'Unlocks at level 2':'Train '+s.name}</button></article>`).join('')}</div><div class="weapon-grid">${WEAPONS.map(w => {
      const owned = save.weapons.includes(w.id), equipped = save.equipped === w.id;
      return `<article class="weapon-card ${owned ? '' : 'undiscovered'} ${equipped ? 'equipped' : ''}"><img src="${weaponPortrait(w.id)}" alt="${w.name}" /><div><p class="eyebrow">${equipped ? 'EQUIPPED' : owned ? 'IN YOUR DRAWER' : 'UNDISCOVERED'}</p><h3>${w.name}</h3><p>${w.perk}</p><small>${w.power >= 0 ? '+' : ''}${w.power} power · ${Math.round(w.speed * 100)}% speed · ${w.reach >= 0 ? '+' : ''}${w.reach} reach</small><button class="secondary" data-weapon="${w.id}" ${!owned || equipped ? 'disabled' : ''}>${equipped ? 'Equipped' : owned ? 'Equip weapon' : w.region === 6 ? 'Defeat His Royal Toothiness' : `Find in ${REGIONS[Math.max(0, w.region)].name}`}</button></div></article>`;
    }).join('')}</div><h2 class="section-title">Learn some bad manners.</h2><div class="combo-grid">${COMBOS.map(c => `<article class="combo-card ${level() < c.level ? 'undiscovered' : ''}"><span class="eyebrow">${level() >= c.level ? '✓ UNLOCKED' : `UNLOCKS AT LEVEL ${c.level}`}</span><h3>${c.name}</h3><kbd>${c.input}</kbd><p>${c.detail}</p></article>`).join('')}</div><div class="page-bottom"><button class="secondary" data-go="forge">Back to the forge</button><button class="primary" data-go="map">Try it on someone ${arrow}</button></div></section>${footer()}`;
  } else if (screen === 'journal') {
    root.innerHTML = `${header('heroes')}<section class="panel-page"><p class="eyebrow">A FIELD GUIDE TO POOR BEHAVIOR</p><h2>Know your nonsense.</h2><p class="page-intro">Their clothes are terrible. Their attack warnings are useful.</p><div class="bestiary-grid">${BESTIARY.map(e => `<article class="bestiary-card"><img src="${enemyPortrait(e.kind)}" alt="${e.name}" /><h3>${e.name}</h3><p>${e.tip}</p></article>`).join('')}</div><h2 class="section-title">The scenery fights back.</h2><div class="combo-grid"><article class="combo-card"><h3>Bonk the furniture</h3><p>Attack a lever to open its striped gate. Smash bean barrels near enemies for a huge blast.</p></article><article class="combo-card"><h3>Rummage &amp; refuel</h3><p>Golden chests contain weapons. Snack chests heal you and hold 25 gold. Search the edges of the road.</p></article><article class="combo-card"><h3>Clock someone out</h3><p>Each journey has a workplace to wreck. Bowl a foe into its bell, or land three Heavy hits. Leave the marked disaster path: it hurts everyone. Bowling earns a bigger one-time bonus.</p></article><article class="combo-card"><h3>Use your surroundings</h3><p>Spring cushions launch you into a higher jump. Timed vents hurt enemies too. Jump over fumes and stink bombs.</p></article></div><div class="page-bottom"><button class="secondary" data-go="heroes">Back to heroes</button><button class="primary" data-go="map">I am adequately concerned ${arrow}</button></div></section>${footer()}`;
  } else if (screen === 'settings') {
    root.innerHTML = `<div class="modal-backdrop"><section class="modal" aria-labelledby="settings-title"><p class="eyebrow">MAKE YOURSELF AT HOME</p><h2 id="settings-title">The little details.</h2>${([{ key: 'sound', title: 'Sound effects', detail: 'Every boing, bonk, and deeply rude burp.' }, { key: 'music', title: 'Music', detail: 'Twelve chapter scores, boss arrangements, and your chosen menu anthem.' }, { key: 'shake', title: 'Screen shake', detail: 'A little extra impact in combat.' }, { key: 'relaxed', title: 'Relaxed battles', detail: '40% less incoming damage, faster magic recovery and more healing. Applies next chapter.' }, { key: 'touch', title: 'Show touch controls', detail: 'Always visible on touch devices.' }] as const).map(s => `<label class="setting"><span><strong>${s.title}</strong><small>${s.detail}</small></span><input type="checkbox" data-setting="${s.key}" ${save.settings[s.key] ? 'checked' : ''}><span class="toggle"></span></label>`).join('')}<p class="privacy-note">Plays offline. No ads, accounts, or analytics.<br>Your progress is stored on this device.</p><button class="primary full" data-action="back">All set <span>✓</span></button></section></div>`;
  } else if (screen === 'help') {
    root.innerHTML = `<div class="modal-backdrop"><section class="modal help-modal"><p class="eyebrow">HOW TO BE A MENACE</p><h2>Jump. Bonk. Repeat.</h2><p>Move along the road and defeat each ambush to open the path. Watch for glowing attack warnings and dodge before they land. Repeat raw ground Heavy and enemies read your shit: they brace and counter. Mix Light into a finisher, attack from behind, or go airborne. A boss’s pink counter ring is a ground blast—jump late or get clear.</p><div class="control-table"><div><strong>Move</strong><span>WASD / Arrow keys / Left stick</span></div><div><strong>Light attack</strong><span>J / Gamepad X</span></div><div><strong>Heavy attack</strong><span>H / Gamepad RB</span></div><div><strong>Jump</strong><span>Space / I / Gamepad A</span></div><div><strong>Power / Meltdown</strong><span>K / Gamepad Y</span></div><div><strong>Dodge</strong><span>L / Shift / Gamepad B</span></div><div><strong>Pause</strong><span>Esc / P / Gamepad Start</span></div></div><p class="tip">Menus: D-pad / arrows move the stitched outline. A / × or Enter selects; B / ○ or Esc goes back. On the map, select a chapter to enter it. Start pauses or resumes. A disconnected controller pauses the adventure.</p><p class="tip">Hold light for quick bonks. Heavy → Jump → Light launches and juggles. Light ×2 → Heavy bowls enemies; the pan bowls on any ground heavy. At level 3, Light ×3 → Heavy spins. Scrapper level 4 adds Light ×3 → Down + Heavy for a quake; hold the stick down, S or ↓ when tapping Heavy. The chain dots and timer show your connected Lights. Jump → Heavy makes a diving flomp. Dodge → Heavy becomes stronger at level 5. Attack levers and stashes. Optional supply booths close during their hazards: wait beside the bay, get close and bonk an open shutter. Claiming supplies stops the booth and saves them between fights. On mobile, use the joystick and five action buttons. Co-op: hold MAGIC beside a downed friend for two seconds to revive. Choose a partner from the world map.</p><p class="tip">Fill FILTH with varied connected attacks and late dodges; your next power at 100% is a free meltdown. Heavy splashes Wren’s puke and pops Bram’s decoy. Enemies glow orange when they shake off prolonged crowd control. At level 2, choose Scrapper, Acrobat, or Hexer in the Armory. Techniques unlock at 2/4/6/8. A late dodge earns magic; alternate connected moves for extra magic. Veterans wear a star. Repeated light hits on a shield provoke a lid slap; a planted brute keeps swinging through frontal hits. Get behind it, use Light ×2 → Heavy, or bowl a body into it. Brutes and archers can aim high. Bosses become more aggressive at half health.</p><p class="muted">Each fight saves a bookmark on this device. Continue restarts that fight with its entry health and loadout; earlier fights stay cleared. Save &amp; quit keeps the bookmark. Returning to camp without saving abandons the run.</p><button class="primary full" data-action="back">Got it ${arrow}</button></section></div>`;
  } else if (screen === 'game' && game) {
    if (paused) {
      root.innerHTML = `<div class="modal-backdrop"><section class="modal pause-modal"><p class="eyebrow">EVEN HEROES NEED A BREATHER</p><h2>A moment by the fire.</h2><p>${STAGES[game.stage].name}</p><button class="primary full" data-action="resume">Keep adventuring <span>▶</span></button>${!practice?`<button class="secondary full bookmark-save" data-action="save-quit">Pocket the mess · Save &amp; quit</button><small class="bookmark-save-note">${game.retryPoint?.between?`Saves the cleared road to fight ${game.retryPoint.encounter}.`:`Saves the start of ${game.retryPoint?.encounter?`fight ${game.retryPoint.encounter}`:'the trail'}. This fight restarts when you continue.`}</small>`:''}<div class="pause-options"><button class="secondary" data-go="settings">Settings</button><button class="secondary" data-go="help">Controls</button></div><button class="text-button full" data-action="leave">Return to camp</button><small class="muted">Return to camp abandons this run and its unbanked loot.</small></section></div>`;
    } else {
      root.innerHTML = `<section class="hud" aria-label="Battle status"><div class="player-hud"><div class="hud-emblem" style="--hero:${hero().color}">✦</div><div class="bars"><div class="player-name"><strong>${hero().name}</strong><span>LV <b id="combat-level">${game.level}</b></span></div><div class="bar health"><i id="health-fill"></i><span id="health-label"></span></div><div class="bar mana"><i id="mana-fill"></i><span id="mana-label"></span></div><div class="bar xp"><i id="xp-fill"></i></div><div class="bar filth"><i id="filth-fill"></i><span id="filth-label"></span></div><small id="weapon-status"></small><small id="style-status"></small><div id="combo-chain" class="combo-chain" hidden><span>BONK CHAIN</span><i></i><i></i><i></i><b></b></div><small id="air-status" class="air-status">READY TO BONK</small></div></div><div class="quest-hud"><span>CHAPTER ${game.stage + 1}</span><strong>${STAGES[game.stage].name}</strong><small id="quest-progress">Follow the old road →</small></div><div class="hud-right"><span class="wallet"><i>◈</i> <b id="run-gold">0</b></span><button class="icon-button" data-action="pause" aria-label="Pause game">Ⅱ</button></div></section><div id="partner-hud" hidden></div><div id="wave-banner"></div><div id="combo-display"></div><aside id="boss-cue" hidden aria-live="polite"></aside><div id="boss-hud" hidden><span>${STAGES[game.stage].boss}</span><div class="bar boss"><i id="boss-fill"></i></div><small id="boss-state"></small></div><div class="keyboard-hint"><span><kbd>W A S D</kbd> Move</span><span><kbd>J</kbd> Light</span><span><kbd>H</kbd> Heavy</span><span><kbd>SPACE</kbd> Jump</span><span><kbd>K</kbd> Power</span><span><kbd>L</kbd> Dodge</span><span><kbd>ESC</kbd> Pause</span></div>`;
      updateHud();
    }
  } else if (screen === 'result' && game?.state === 'lost') {
    root.innerHTML = defeatPanel(game, session?.payout ?? payout, practice);
    root.querySelector<HTMLButtonElement>('[data-action="retry-fight"]')?.focus({preventScroll:true});
  } else if (screen === 'result' && game) {
    const won = game.state === 'won', stars = earnedStars(game), final = won && game.stage === STAGES.length - 1;
    root.innerHTML = `<div class="modal-backdrop"><section class="modal result-modal"><p class="eyebrow">${won ? final ? 'THE HOLLOW CROWN IS WHOLE AGAIN' : 'INCIDENT REPORT: EVERYONE IS UPSET' : 'POST-MORTEM: ENTIRELY PREVENTABLE'}</p><div class="result-symbol">${won ? '✦' : '♧'}</div><h2>${won ? final ? 'You fixed the royal overbite.' : 'Certified public nuisance.' : 'You shat the bed.'}</h2><p>${won ? final ? 'Six crown teeth recovered. Twelve chapters survived. The kingdom owes you a new spatula.' : `${STAGES[game.stage].name} is safe. For now.` : 'The teeth stayed in the ditch. Keep your new weapons and your first scrap of hard-earned experience. Read the windups; make a worse mess next time.'}</p>${won ? `<div class="stars" aria-label="${stars} stars">${'★'.repeat(stars)}<span>${'☆'.repeat(3 - stars)}</span></div>` : ''}<div class="result-stats"><div><strong>◈ ${practice ? game.gold : payout.gold}</strong><small>${practice ? 'PRACTICE GOLD' : 'LOOSE TEETH BANKED'}</small></div><div><strong>${game.kills}</strong><small>FOES DEFEATED</small></div><div><strong>${game.bestCombo}×</strong><small>BEST COMBO</small></div></div><p class="muted">+${practice ? game.earnedXp : payout.xp} XP ${practice ? 'practice' : 'banked'} · Level ${practice ? game.level : level()} · ${Math.floor(game.totalTime / 60)}:${String(Math.floor(game.totalTime % 60)).padStart(2, '0')} adventure time</p><p class="muted">${game.meltdowns} meltdowns · ${game.bowlingHits} bowling hits · ${game.juggles} air juggles · ${game.revives} restuffs · ${game.perfectDodges} perfect dodges · ${game.retries} fight retries${practice ? ' · Practice: progress was not banked' : ''}</p><p class="loot-result">${won && game.config.bossStage ? '♜ CROWN TOOTH RECOVERED · ' : ''}${game.foundWeapons.length ? `NEW IN THE DRAWER: ${game.foundWeapons.map(id => weaponById(id).name).join(' · ')}` : 'Search golden stashes along the road for new weapons.'}</p><button class="primary full" data-action="${won && !final && !practice ? 'next' : 'retry'}">${won && !final && !practice ? 'The adventure continues' : won ? 'Play this chapter again' : 'One more adventure'} ${arrow}</button><div class="pause-options"><button class="secondary" data-go="forge">Visit the forge</button><button class="secondary" data-go="map">World map</button></div></section></div>`;
  }
  controls.setEnabled(combatEnabled());
  sound.enabled = save.settings.sound; sound.music = save.settings.music;
  if(savingBookmark)root.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.disabled=true);
}
function openStory(stage:number,kind:'intro'|'after',done:()=>void,replay=false){
  const lines=storyLines(stage,kind,save.hero);
  if(!lines.length){done();return;}
  story={id:`${kind}-${stage}`,stage,lines,index:0,done,replay};setScreen('story');
}
function finishStory(){
  if(!story)return;const current=story;story=null;
  if(!current.replay && !save.storySeen.includes(current.id)){save.storySeen.push(current.id);persist();}
  controls.clear();current.done();
}
function startGame(stage = selectedStage, rehearsal = false) {
  if ((!rehearsal && stage > save.unlocked) || stage < 0 || stage >= STAGES.length) return;
  if(!rehearsal && save.resume){pendingStage=stage;setScreen('replace-run');return;}
  if(!rehearsal && !save.storySeen.includes(`intro-${stage}`)){openStory(stage,'intro',()=>beginGame(stage,rehearsal));return;}
  beginGame(stage,rehearsal);
}
function beginGame(stage = selectedStage, rehearsal = false) {
  if ((!rehearsal && stage > save.unlocked) || stage < 0 || stage >= STAGES.length) return;
  practice = rehearsal; selectedStage = stage; game = new Game(save.hero, stage, { ...save.upgrades }, Date.now() >>> 0, { xp: save.xp, weapon: save.equipped, weapons: save.weapons, partner, style: save.style, difficulty: save.settings.relaxed ? 'relaxed' : 'normal' });
  session = new RunSession(game,save,practice);
  bookmarkKey='';bookmarkClock=0;captureBookmark(true);
  payout={gold:0,xp:0}; paused = false; resultShown = false; accumulator = 0; renderer.camera = 0;
  sound.unlock(); sound.setPaused(false); setScreen('game');
}
function captureBookmark(force=false) {
  if(!session || !game || practice || session.settled || game.state==='won')return;
  const key=game.bookmarkKey;
  if(!force && key===bookmarkKey && bookmarkClock<8)return;
  if(session.bookmark()){bookmarkKey=key;bookmarkClock=0;persist();}
}
function continueRun() {
  if(!save.resume)return;
  const resumed=Game.resumeBookmark(save.resume);
  if(!resumed){save.resume=null;persist();toast('That bookmark fell apart. Your banked progress is safe.');setScreen('map');return;}
  game=resumed;selectedStage=game.stage;save.hero=game.heroId;partner=game.players[1]?.hero;
  practice=false;pendingStage=null;session=new RunSession(game,save);payout={gold:0,xp:0};
  paused=true;resultShown=false;accumulator=0;bookmarkKey='';captureBookmark(true);
  renderer.camera=Math.max(0,game.cameraFocus-renderer.width*.36);
  sound.unlock();sound.setPaused(true);setScreen('game');
}
async function saveAndQuit() {
  if(!session || practice || savingBookmark)return;
  const current=session;togglePause(true);savingBookmark=true;current.bookmark();renderUI();
  try {
    await writeSave(save);
    if(session!==current)return;
    game=null;session=null;paused=false;sound.setPaused(false);setScreen('home');
    toast('Mess pocketed. Continue from this fight next time.');
  } catch { toast('Could not save. Your adventure is still paused here. Check device storage and try again.'); }
  finally {savingBookmark=false;renderUI();}
}
function bankRun() {
  if(!session || session.settled || game?.state==='playing')return;
  payout=session.settle();if(!practice)persist();
}
function finishRun() {
  if (!game || resultShown) return;
  resultShown = true;
  if(game.state==='won')bankRun();else captureBookmark(true);
  if(!practice&&game.state==='won'&&!save.storySeen.includes(`after-${game.stage}`)&&CHAPTER_STORY[game.stage].after.length)openStory(game.stage,'after',()=>setScreen('result'));else setScreen('result');
}
function leaveRun() {
  bankRun();
  if(session && !session.settled && !practice){session.abandon();persist();}
  if(practice){selectedStage=Math.min(selectedStage,save.unlocked);practice=false;}
  game=null;session=null;paused=false;sound.setPaused(false);
}
function retryFight() {
  if(!session?.retry())return;
  resultShown=false;paused=false;accumulator=0;controls.clear();captureBookmark(true);
  renderer.camera=Math.max(0,game!.cameraFocus-renderer.width*.36);
  sound.unlock();sound.setPaused(false);setScreen('game');
}
function togglePause(force?: boolean) {
  if (screen !== 'game' || !game || game.state !== 'playing' || (savingBookmark && force!==true)) return;
  paused = force ?? !paused;if(paused)captureBookmark(true); controls.clear(); sound.setPaused(paused); accumulator = 0; renderUI();
}
controls.onPause = () => togglePause();
sound.onInterruption = () => {
  if(screen==='game'&&game?.state==='playing'&&!paused){togglePause(true);toast('Audio interrupted · Game paused');}
};

function combatEnabled() { return screen === 'game' && !paused && !game?.bossMoment; }
function menuContext(): MenuContext {
  const moment = screen === 'game' && !paused ? game?.bossMoment : null;
  const preferred: Record<string, string> = {
    home: '.home-actions .primary', map: '.stage-card.selected', heroes: `[data-hero="${save.hero}"]`,
    party: partner ? `[data-partner="${partner}"]` : '[data-partner]', armory: '[data-style]:not(:disabled),[data-weapon]:not(:disabled),.page-bottom .primary',
    forge: root.querySelector('[data-upgrade]:not(:disabled)') ? '[data-upgrade]:not(:disabled)' : '[data-go="armory"]', journal: '.page-bottom .primary', story: '[data-action="story-next"]',
    result: game?.state === 'lost' ? '[data-action="retry-fight"]' : '.result-modal > .primary',
    'replace-run': '[data-action="continue-run"]', settings: '[data-setting]', help: '.primary',
    'save-error': '[data-action="read-save"]'
  };
  return {
    key: `${screen}:${paused}:${moment ? `${moment.boss}:${moment.kind}` : ''}:${screen === 'story' ? story?.id : ''}`,
    active: !combatEnabled(), canPause: screen === 'game', scope: moment ? root.querySelector('#boss-cue') : root,
    preferred: paused && screen === 'game' ? '[data-action="resume"]' : moment ? '[data-action="skip-boss"]' : preferred[screen],
    backLabel: screen === 'result' && game?.state === 'lost' ? 'exit options' : paused && screen === 'game' ? 'resume' : 'back'
  };
}
function menuBack() {
  if (savingBookmark) return;
  if (screen === 'game') { togglePause(); return; }
  if (screen === 'settings' || screen === 'help') { setScreen(returnScreen); return; }
  if (screen === 'story' && story) {
    if (story.index > 0) { story.index--; renderUI(); }
    else if (story.id.startsWith('after-') && !story.replay) finishStory();
    else { story = null; setScreen('map'); }
    return;
  }
  if (screen === 'result' && game?.state === 'lost') { menus.focus('[data-action="cash-out"]'); return; }
  if (screen === 'replace-run') { pendingStage = null; setScreen('map'); return; }
  const destination: Record<string, string> = { map: 'home', heroes: 'map', party: 'map', forge: 'map', armory: 'forge', journal: 'heroes', result: 'map' };
  if (destination[screen]) { leaveRun(); setScreen(destination[screen]); }
}
const menus = new MenuInput(menuContext, element => {
  if (savingBookmark) return;
  sound.unlock();
  if (element.dataset.stage) { selectedStage = Number(element.dataset.stage); startGame(); }
  else element.click();
}, menuBack, () => togglePause());

root.addEventListener('click', event => {
  const button = (event.target as Element).closest<HTMLElement>('button'); if (savingBookmark || !button || button.hasAttribute('disabled')) return;
  sound.unlock();
  if (button.dataset.go) {
    if (button.dataset.go === 'home' || button.dataset.go === 'map' || button.dataset.go === 'forge' || button.dataset.go === 'heroes' || button.dataset.go === 'armory' || button.dataset.go === 'journal' || button.dataset.go === 'party') { leaveRun(); }
    setScreen(button.dataset.go); return;
  }
  if (validStyle(button.dataset.style) && level() >= 2) { save.style = button.dataset.style; persist(); renderUI(); sound.play('coin'); return; }
  if (button.dataset.partner) { partner = button.dataset.partner as HeroId; renderUI(); return; }
  if (button.dataset.weapon && save.weapons.includes(button.dataset.weapon as WeaponId)) { save.equipped = button.dataset.weapon as WeaponId; persist(); renderUI(); sound.play('coin'); return; }
  if (button.dataset.hero) { save.hero = button.dataset.hero as HeroId; persist(); renderUI(); sound.play('coin'); return; }
  if (button.dataset.stage) { selectedStage = Number(button.dataset.stage); renderUI(); return; }
  if (button.dataset.upgrade) { if (buyUpgrade(save, button.dataset.upgrade as Upgrade)) { persist(); sound.play('coin'); renderUI(); toast('A little stronger. Upgrade equipped!'); } return; }
  switch (button.dataset.action) {
    case 'read-save': window.location.reload();break;
    case 'story-skip': finishStory(); break;
    case 'story-next': if(story){if(story.index+1>=story.lines.length)finishStory();else {story.index++;renderUI();}} break;
    case 'story-replay': openStory(selectedStage,'intro',()=>setScreen('map'),true); break;
    case 'solo': partner = undefined; setScreen('map'); break;
    case 'practice': startGame(5, true); break;
    case 'continue-run': continueRun();break;
    case 'save-quit': void saveAndQuit();break;
    case 'start-fresh': {const stage=pendingStage;pendingStage=null;save.resume=null;persist();if(stage!==null)startGame(stage);break;}
    case 'start': startGame(); break;
    case 'next': startGame(Math.min(STAGES.length - 1, selectedStage + 1)); break;
    case 'skip-boss': game?.skipBossMoment();controls.clear();break;
    case 'retry-fight': retryFight(); break;
    case 'cash-out': leaveRun();setScreen('home');break;
    case 'retry': bankRun();startGame(selectedStage, practice); break;
    case 'pause': togglePause(true); break;
    case 'resume': togglePause(false); break;
    case 'leave': leaveRun(); setScreen('home'); break;
    case 'back': setScreen(returnScreen); break;
  }
});
root.addEventListener('change', event => {
  const input = event.target as HTMLInputElement;
  if (input.dataset.setting) { save.settings[input.dataset.setting as keyof typeof save.settings] = input.checked; sound.enabled = save.settings.sound; sound.music = save.settings.music; persist(); }
});
function updateHud() {
  if (!game || screen !== 'game' || paused) return;
  const p = game.player;
  const moment=game.bossMoment,cue=document.querySelector<HTMLElement>('#boss-cue')!;
  cue.hidden=!moment;root.classList.toggle('boss-moment',!!moment);touch.style.visibility=moment?'hidden':'';
  if(moment){const show=BOSS_PERFORMANCES[moment.region],key=`${moment.boss}:${moment.kind}`;
    if(cue.dataset.key!==key){cue.dataset.key=key;cue.innerHTML=`<p class="eyebrow">${moment.kind==='entrance'?'MANAGEMENT WOULD LIKE A WORD':moment.kind==='rage'?'PHASE TWO · THE SEAMS GIVE WAY':'INCIDENT RESOLVED. BADLY.'}</p><h2>${moment.kind==='entrance'?show.title:moment.kind==='rage'?show.rage:show.defeat}</h2><p>${moment.kind==='entrance'?`${show.subtitle} ${show.entrance}`:moment.kind==='rage'?show.breakdown:show.exit}</p><button class="text-button" data-action="skip-boss">${moment.kind==='defeat'?'Collect the mess':'Let’s fight'} →</button>`;}
  } else cue.dataset.key='';
  document.querySelector<HTMLElement>('#health-fill')!.style.width = `${p.hp / p.maxHp * 100}%`;
  document.querySelector('#health-label')!.textContent = `${Math.ceil(p.hp)} / ${p.maxHp}`;
  document.querySelector<HTMLElement>('#mana-fill')!.style.width = `${p.mana}%`;
  document.querySelector<HTMLElement>('#filth-fill')!.style.width = `${p.filth}%`;
  document.querySelector('#filth-label')!.textContent = p.filth>=100 ? 'MELTDOWN READY · POWER!' : `FILTH ${p.filth}% · MIX MOVES`;
  document.querySelector('#mana-label')!.textContent = `${Math.floor(p.mana)} GUTS · POWER 36`;
  document.querySelector('#air-status')!.textContent=heavyHint(p,game.level,game.style);
  const chain=document.querySelector('#combo-chain') as HTMLElement;const count=p.comboWindow>0?p.combo:0;chain.hidden=count===0||p.downed;chain.setAttribute('aria-label',`${count} connected Lights; chain window open`);chain.querySelectorAll('i').forEach((pip,i)=>pip.classList.toggle('filled',i<count));chain.style.setProperty('--chain-time',String(Math.min(1,p.comboWindow/.95)));
  document.querySelector('#jump')!.classList.toggle('cooldown', p.z > 0);
  document.querySelector('#combat-level')!.textContent = String(game.level);
  document.querySelector('#weapon-status')!.textContent = game.equippedWeapon.name;
  document.querySelector('#style-status')!.textContent = `${styleById(game.style).name}${game.level < 2 ? ' · Techniques at LV 2' : p.variety > 0 ? ` · MIX ${p.variety+1} · bonus guts` : ''}`;
  document.querySelector<HTMLElement>('#xp-fill')!.style.width = `${game.level === 10 ? 100 : (game.xp - xpForLevel(game.level)) / (xpForLevel(game.level + 1) - xpForLevel(game.level)) * 100}%`;
  document.querySelector('#run-gold')!.textContent = String(game.gold);
  document.querySelector('#quest-progress')!.textContent = game.props.some(q => q.kind === 'gate' && !q.active && q.x > p.x && q.x - p.x < 155) ? 'Bonk the lever to open the gate ↑' : game.objective;
  const ally = game.players[1], allyHud = document.querySelector<HTMLElement>('#partner-hud')!; allyHud.hidden = !ally;
  if (ally) allyHud.textContent = `P2 ${HEROES.find(h => h.id === ally.hero)!.name} · ${ally.downed ? `RESTUFF ${Math.round(ally.revive / 2 * 100)}%` : `${Math.ceil(ally.hp)}/${ally.maxHp} HP · ${Math.floor(ally.mana)} GUTS · ${ally.filth>=100 ? 'MELTDOWN READY' : `FILTH ${ally.filth}%`}`} · ${weaponById(ally.weapon).name}`;
  const banner = document.querySelector<HTMLElement>('#wave-banner')!;
  banner.textContent = game.bannerTime > 0 ? game.banner : ''; banner.style.opacity = String(Math.min(1, game.bannerTime));
  document.querySelector('#combo-display')!.innerHTML = game.comboHits > 2 ? `<strong>${game.comboHits}<span>×</span></strong><small>${game.comboHits > 12 ? 'LEGENDARY!' : game.comboHits > 6 ? 'ON FIRE!' : 'COMBO'}</small>` : '';
  const boss = game.enemies.find(e => e.kind === 'boss' && e.hp > 0), bossHud = document.querySelector<HTMLElement>('#boss-hud')!;
  bossHud.hidden = !boss;
  if (boss) {document.querySelector<HTMLElement>('#boss-fill')!.style.width = `${boss.hp / boss.maxHp * 100}%`;
    document.querySelector('#boss-state')!.textContent=`${boss.enraged?'UNRAVELLING · ':''}${bossCue(boss,game.config.region,game.dangers)}`;
  }
  document.querySelector('#magic')!.classList.toggle('cooldown', (p.mana < 36 && p.filth < 100) || p.spellCooldown > 0);
  document.querySelector('#dodge')!.classList.toggle('cooldown', p.dodgeCooldown > 0);
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { togglePause(true); controls.clear(); sound.setPaused(true); persist(); }
  else if (!paused) sound.setPaused(false);
});
window.addEventListener('gamepaddisconnected', () => { if (screen === 'game' && game?.state === 'playing') { togglePause(true); toast('Controller disconnected. Reconnect, then resume.'); } });
window.addEventListener('blur', () => togglePause(true));
if (Capacitor.isNativePlatform()) {
  // Android can resume from onPause before onStop emits an inactive state.
  // Interrupt immediately, including short Home/task-switcher visits.
  void App.addListener('pause', () => { togglePause(true); controls.clear(); sound.setPaused(true); persist(); });
  void App.addListener('appStateChange', ({ isActive }) => { if (!isActive) { togglePause(true); controls.clear(); sound.setPaused(true); persist(); } else if (!paused) sound.setPaused(false); });
  void App.addListener('backButton', menuBack);
}
function frame(timestamp: number) {
  const dt = lastTime ? Math.min((timestamp - lastTime) / 1000, .1) : 0; lastTime = timestamp;
  controls.setEnabled(combatEnabled());
  menus.poll(timestamp);
  controls.setEnabled(combatEnabled());
  const coop = (game?.players.length ?? 1) > 1;
  const input = controls.sample(0, coop), second = coop ? controls.sample(1, true) : undefined;
  if (screen === 'game' && game && !paused) {
    accumulator += dt;
    while (accumulator >= 1 / 60) { if (game.update(1 / 60, input, second)) controls.consumeActions(); accumulator -= 1 / 60; }
    bookmarkClock+=dt;captureBookmark();
    for (const event of game.events.splice(0)) sound.play(event);
    if (game.state !== 'playing') finishRun();
  } else accumulator = 0;
  const scoreVisible=['game','result'].includes(screen)||['settings','help'].includes(screen)&&['game','result'].includes(returnScreen)||screen==='story'&&!!story?.id.startsWith('after-');
  sound.update(dt,scoreScene(game,scoreVisible),game?.stage??selectedStage);
  renderer.draw(game, save.hero, game?.stage ?? selectedStage, timestamp / 1000, save.settings.shake && !paused);
  uiClock += dt; if (uiClock >= .08) { updateHud(); uiClock = 0; }
  requestAnimationFrame(frame);
}
await Promise.all([loadHeroArt(),loadEnemyArt(), document.fonts.load('20px Bangers').catch(()=>[])]);
renderUI();sound.unlock();if(discardedBookmark)toast('That bookmark could not be read. Your banked progress is still here.');requestAnimationFrame(frame);
