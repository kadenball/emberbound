import { describe, expect, it } from 'vitest';
import { Game, idleInput, type Input } from '../src/engine';
import { freshSave, parseSave, buyUpgrade } from '../src/save';

const makeGame = (hero: 'ember' | 'frost' | 'moss' = 'ember') => new Game(hero, 0, freshSave().upgrades);
function advance(game: Game, seconds: number, input: Partial<Input> = {}) {
  for (let i = 0; i < seconds * 60; i++) game.update(1 / 60, { ...idleInput(), ...input });
}
describe('combat contracts', () => {
  it('opens an ambush without instantly clearing or awarding it', () => {
    const g = makeGame(); advance(g, .8, { x: 1 });
    expect(g.wave).toBe(0); expect(g.enemies.filter(e => e.hp > 0)).toHaveLength(2);
    expect(g.state).toBe('playing'); expect(g.gold).toBe(0);
  });
  it('melee respects depth and damages several targets in one swing', () => {
    const g = makeGame(); const near = g.spawn('raider', 260, 455), beside = g.spawn('raider', 270, 450), wrongLane = g.spawn('raider', 255, 365);
    advance(g, .13, { attack: true });
    expect(near.hp).toBe(near.maxHp - 14.7); expect(beside.hp).toBe(beside.maxHp - 14.7); expect(wrongLane.hp).toBe(wrongLane.maxHp);
    expect(g.comboHits).toBe(2);
  });
  it('prevents attack spam during cooldown', () => {
    const g = makeGame(), e = g.spawn('brute', 260, 455);
    advance(g, .15, { attack: true }); expect(e.hp).toBe(e.maxHp - 14.7);
  });
  it('mana pays once and recovers; an empty bar cannot cast', () => {
    const g = makeGame(); g.update(1 / 60, { ...idleInput(), magic: true }); expect(g.player.mana).toBe(64);
    advance(g, .25, { magic: true }); expect(g.projectiles).toHaveLength(1);
    g.player.mana = 0; g.player.spellCooldown = 0; g.update(1 / 60, { ...idleInput(), magic: true }); expect(g.projectiles).toHaveLength(1);
  });
  it('frost freezes nearby foes and Bram deploys a decoy', () => {
    const frost = makeGame('frost'), e = frost.spawn('brute', 320, 455);
    frost.update(1 / 60, { ...idleInput(), magic: true }); expect(e.stun).toBeGreaterThan(.5); expect(e.hp).toBeLessThan(e.maxHp);
    const moss = makeGame('moss'); moss.player.hp = 50; moss.spawn('brute',310,455);
    moss.update(1 / 60, { ...idleInput(), magic: true }); expect(moss.player.hp).toBe(50); expect(moss.messes[0].kind).toBe('decoy');
  });
  it('dodging grants a finite invulnerability window', () => {
    const g = makeGame(), e = g.spawn('raider', 250, 455); e.windup = .01;
    g.update(1 / 60, { ...idleInput(), dodge: true }); expect(g.player.hp).toBe(g.player.maxHp); expect(g.player.invulnerable).toBeGreaterThan(0);
    advance(g, .8); expect(g.player.invulnerable).toBe(0);
  });
  it('clamps diagonal movement speed and map boundaries', () => {
    const a = makeGame(), b = makeGame(); advance(a, .2, { x: 1 }); advance(b, .2, { x: 1, y: 1 });
    expect(b.player.x - 200).toBeLessThan(a.player.x - 200);
    advance(a, 10, { x: -1, y: -1 }); expect(a.player.x).toBe(60); expect(a.player.y).toBe(360);
  });
  it('finishes only after all boss-wave foes die and collects dropped gold', () => {
    const g = new Game('ember', 1, freshSave().upgrades);
    for (let wave = 0; wave < 3; wave++) {
      g.player.x = g.config.encounters[wave] + 10;
      g.update(1 / 60, idleInput());
      if (wave < 2) {
        for (let frame = 0; frame < 100; frame++) { for (const e of g.enemies) { e.hp = 0; e.dead = .7; } g.update(1 / 60, idleInput()); }
      }
    }
    expect(g.wave).toBe(2); expect(g.state).toBe('playing');
    expect(g.enemies.some(e => e.kind === 'boss')).toBe(true);
    g.skipBossMoment();g.update(1/60,idleInput());
    for (const e of g.enemies) { e.hp = 0; e.dead = .7; }
    g.pickups.push({ x: 2700, y: 455, kind: 'gold', value: 90, phase: 0 });
    g.update(1 / 60, idleInput()); expect(g.state).toBe('won'); expect(g.gold).toBe(90);
    advance(g, 5); expect(g.gold).toBe(90);
  });
  it('ends a lethal hit in defeat and banks loose gold once', () => {
    const g = makeGame(); g.player.hp = 1; const e = g.spawn('shield', 250, 455); e.windup = .01;
    g.pickups.push({ x: 900, y: 455, kind: 'gold', value: 13, phase: 0 });
    g.update(1 / 60, idleInput()); expect(g.state).toBe('lost'); expect(g.gold).toBe(13);
    advance(g, 3); expect(g.gold).toBe(13);
  });
  it('uses seeded randomness for reproducible encounters', () => {
    const a = makeGame(), b = makeGame(); advance(a, 4, { x: 1, attack: true }); advance(b, 4, { x: 1, attack: true });
    expect(a.enemies).toEqual(b.enemies); expect(a.player).toEqual(b.player);
  });
});
describe('durable progression', () => {
  it('recovers from malformed or unsupported saves', () => {
    for (const raw of [null, '{}', 'null', '{nope', '{"version":99}']) expect(parseSave(raw)).toEqual(freshSave());
  });
  it('sanitizes untrusted stored values', () => {
    const s = parseSave(JSON.stringify({ version: 1, gold: -20, xp: 'NaN', unlocked: 500, hero: 'bad', upgrades: { strength: 300, vitality: -1 }, settings: { sound: false } }));
    expect(s.gold).toBe(0); expect(s.unlocked).toBe(4); expect(s.hero).toBe('ember'); expect(s.upgrades.strength).toBe(5); expect(s.upgrades.vitality).toBe(0); expect(s.settings.sound).toBe(false);
  });
  it('charges upgrades atomically and enforces the level cap', () => {
    const s = freshSave(); expect(buyUpgrade(s, 'strength')).toBe(false); expect(s.upgrades.strength).toBe(0);
    s.gold = 100; expect(buyUpgrade(s, 'strength')).toBe(true); expect(s.gold).toBe(30); expect(s.upgrades.strength).toBe(1);
    s.gold = 10000; s.upgrades.strength = 5; expect(buyUpgrade(s, 'strength')).toBe(false); expect(s.gold).toBe(10000);
  });
});
