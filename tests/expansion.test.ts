import { describe, expect, it } from 'vitest';
import { COMBOS, levelForXp, STAGES, WEAPONS, xpForLevel } from '../src/content';
import { Game, idleInput, type Input } from '../src/engine';
import { freshSave, parseSave } from '../src/save';
const make = (xp = 0, weapon: typeof WEAPONS[number]['id'] = 'starter', stage = 0) => new Game('ember', stage, freshSave().upgrades, 7, { xp, weapon, weapons: ['starter', weapon] });
function step(g: Game, frames: number, input: Partial<Input> = {}) {
  for (let i = 0; i < frames; i++) g.update(1 / 60, { ...idleInput(), ...input });
}
describe('campaign and progression', () => {
  it('has six long journeys paired with six dedicated boss stages', () => {
    expect(STAGES).toHaveLength(12);
    for (let i = 0; i < 12; i += 2) {
      expect(STAGES[i].length).toBeGreaterThan(6000); expect(STAGES[i].encounters.length).toBeGreaterThanOrEqual(6);
      expect(STAGES[i + 1].bossStage).toBe(true); expect(STAGES[i + 1].region).toBe(STAGES[i].region);
      expect(STAGES[i].encounters.at(-1)! + 850).toBeLessThanOrEqual(STAGES[i].length);
    }
  });
  it('levels at exact XP thresholds and caps combat level at ten', () => {
    for (let level = 2; level <= 10; level++) {
      expect(levelForXp(xpForLevel(level) - 1)).toBe(level - 1);
      expect(levelForXp(xpForLevel(level))).toBe(level);
    }
    expect(levelForXp(999999)).toBe(10); expect(levelForXp(-1)).toBe(1);
  });
  it('earned XP immediately improves health and power during combat', () => {
    const g = make(130), e = g.spawn('raider', 260, 455); e.hp = 1; g.player.hp = 60;
    step(g, 9, { attack: true });
    expect(g.level).toBe(2); expect(g.xp).toBe(150); expect(g.earnedXp).toBe(20);
    expect(g.player.maxHp).toBe(126); expect(g.player.power).toBe(23); expect(g.player.hp).toBeGreaterThan(60);
  });
  it('unlocks an intentional spin and strengthens the dodge launcher at their levels', () => {
    const low=make(),spin=make(xpForLevel(3));
    for(const g of [low,spin]){g.player.combo=3;g.player.comboWindow=.8;g.spawn('brute',100,455);step(g,15,{heavy:true});}
    expect(low.enemies[0].hp).toBe(low.enemies[0].maxHp);
    expect(spin.enemies[0].hp).toBeLessThan(spin.enemies[0].maxHp);
    const upper=make(xpForLevel(5));upper.player.uppercutWindow=.3;
    const guard=upper.spawn('shield',260,455);step(upper,15,{heavy:true});
    expect(guard.guard).toBeGreaterThan(0);expect(guard.z).toBeGreaterThan(0);expect(guard.vz).toBeGreaterThan(0);
    expect(COMBOS.filter(c=>c.level===1)).toHaveLength(4);
  });
  it('migrates old chapter victories and retains currency and upgrades', () => {
    const s = parseSave(JSON.stringify({ version: 1, unlocked: 2, best: [3, 2, 0], xp: 1200, gold: 123, upgrades: { strength: 3 } }));
    expect(s.version).toBe(2); expect(s.unlocked).toBe(4); expect(s.best.slice(0, 4)).toEqual([3, 3, 2, 2]);
    expect(s.gold).toBe(123); expect(s.xp).toBe(1200); expect(s.upgrades.strength).toBe(3); expect(s.weapons).toEqual(['starter']);
  });
  it('round-trips equipment and rejects unknown or unowned weapons', () => {
    const s = freshSave(); s.weapons.push('pan'); s.equipped = 'pan'; s.unlocked = 11; s.best[11] = 3;
    expect(parseSave(JSON.stringify(s))).toEqual(s);
    const dirty = parseSave(JSON.stringify({ ...s, weapons: ['pan', 'pan', 'nuke'], equipped: 'crown' }));
    expect(dirty.weapons).toEqual(['starter', 'pan']); expect(dirty.equipped).toBe('starter');
  });
});
describe('interactive world and loot', () => {
  it('smashing a weapon chest equips its weapon once and duplicates become gold', () => {
    const g = make(); step(g, 30, { attack: true });
    expect(g.weapon).toBe('pan'); expect(g.foundWeapons).toEqual(['pan']); expect(g.player.power).toBe(25);
    step(g, 30, { attack: true }); expect(g.foundWeapons).toHaveLength(1);
    const duplicate = make(0, 'pan'); step(duplicate, 30, { attack: true });
    expect(duplicate.foundWeapons).toHaveLength(0); expect(duplicate.gold).toBe(35);
  });
  it('closed gates block movement until their linked lever is struck', () => {
    const g = make(); const gate = g.props.find(p => p.kind === 'gate')!, lever = g.props.find(p => p.link === gate.id)!;
    // Isolate the road mechanism from encounter triggers.
    gate.x = 305; lever.x = 245; lever.y = 390;
    step(g, 25, { x: 1 }); expect(g.player.x).toBe(gate.x - 30);
    g.player.y = 390; step(g, 9, { attack: true }); expect(gate.active).toBe(true); expect(lever.active).toBe(true);
    step(g, 10, { x: 1 }); expect(g.player.x).toBeGreaterThan(gate.x); expect(g.earnedXp).toBe(20);
  });
  it('bean barrels damage nearby enemies once without hurting the player', () => {
    const g = make(); const barrel = g.props.find(p => p.kind === 'barrel')!; barrel.x = 280; barrel.y = 410;
    const e = g.spawn('brute', 430, 410), before = g.player.hp;
    step(g, 30, { attack: true }); expect(barrel.active).toBe(true); expect(e.hp).toBeLessThan(e.maxHp - 60); expect(g.player.hp).toBe(before);
  });
  it('spring cushions launch a higher jump and vents respect jump height', () => {
    const g = make(), spring = g.props.find(p => p.kind === 'spring')!; spring.x = 200; spring.y = 455;
    step(g, 1); expect(g.player.vz).toBe(850);
    const ground = make(), air = make();
    for (const game of [ground, air]) { const vent = game.props.find(p => p.kind === 'vent')!; vent.x = 200; vent.y = 455; game.time = 3; }
    air.player.z = 100; step(ground, 1); step(air, 1);
    expect(ground.player.hp).toBeLessThan(ground.player.maxHp); expect(air.player.hp).toBe(air.player.maxHp);
  });
});
describe('enemy identities', () => {
  it('shield guards block frontal light attacks and heavy breaks their guard', () => {
    const ground=make(),heavy=make();
    for(const g of [ground,heavy]){g.spawn('shield',260,455);step(g,15,g===heavy?{heavy:true}:{attack:true});}
    expect(ground.enemies[0].hp).toBe(ground.enemies[0].maxHp);
    expect(heavy.enemies[0].hp).toBeLessThan(heavy.enemies[0].maxHp);expect(heavy.enemies[0].guard).toBeGreaterThan(0);
  });
  it('bombers create delayed hazards and support jellies stitch injured allies', () => {
    const g = make(), bomber = g.spawn('bomber', 400, 455); bomber.windup = .01; bomber.targetX = 200; bomber.targetY = 455;
    step(g, 1); expect(g.dangers).toHaveLength(2); expect(g.player.hp).toBe(g.player.maxHp);
    step(g, 65); expect(g.player.hp).toBeLessThan(g.player.maxHp);
    const support = make(), healer = support.spawn('healer', 400, 455), friend = support.spawn('brute', 480, 455);
    friend.hp = 40; friend.stun = 3; healer.cooldown = 0; step(support, 80); expect(friend.hp).toBe(72);
  });
  it('chargers commit to their telegraphed direction', () => {
    const g = make(), e = g.spawn('charger', 600, 455); e.windup = .01; e.face = -1;
    step(g, 1); expect(e.rush).toBeGreaterThan(0); const x = e.x;
    g.player.x = 700; step(g, 5); expect(e.x).toBeLessThan(x); expect(e.face).toBe(-1);
  });
  it('each boss adds its own hazards, volleys, reinforcements or charge', () => {
    const signatures = STAGES.filter(s => s.bossStage).map((_, region) => {
      const g = make(0, 'starter', region * 2 + 1), e = g.spawn('boss', 500, 455);
      e.hp = e.maxHp * .4; e.enraged = true; e.phase = 2; e.bossState = 'windup'; e.bossTimer = .01; e.windup = .01; e.targetX = 200; e.targetY = 455;
      step(g, 1);
      return [g.dangers.length, g.projectiles.length, g.enemies.length, e.bossState, g.props.filter(p=>p.kind==='laundry').length].join(':');
    });
    expect(new Set(signatures).size).toBe(6);
  });
});
