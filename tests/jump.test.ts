import { describe, expect, it } from 'vitest';
import { Game, idleInput, type Input } from '../src/engine';
import { freshSave } from '../src/save';

const game = () => new Game('ember', 0, freshSave().upgrades);
const step = (g: Game, count: number, input: Partial<Input> = {}) => {
  for (let i = 0; i < count; i++) g.update(1 / 60, { ...idleInput(), ...input });
};

describe('jumping and aerial combat', () => {
  it('jumps above the ground plane, reaches an apex, and lands without changing lanes', () => {
    const g = game(), y = g.player.y;
    step(g, 1, { jump: true }); expect(g.player.z).toBeGreaterThan(0);
    step(g, 18); expect(g.player.z).toBeGreaterThan(95); expect(g.player.y).toBe(y);
    step(g, 35); expect(g.player.z).toBe(0); expect(g.player.vz).toBe(0); expect(g.player.y).toBe(y);
    expect(g.events.filter(e => e === 'jump')).toHaveLength(1);
    expect(g.events.filter(e => e === 'land')).toHaveLength(1);
  });
  it('does not fly or auto-hop when jump is held, and another press rearms it', () => {
    const g = game(); step(g, 120, { jump: true });
    expect(g.player.z).toBe(0); expect(g.events.filter(e => e === 'jump')).toHaveLength(1);
    step(g, 1); step(g, 1, { jump: true }); expect(g.player.z).toBeGreaterThan(0);
    expect(g.events.filter(e => e === 'jump')).toHaveLength(2);
  });
  it('keeps horizontal control in the air', () => {
    const g = game(); step(g, 1, { jump: true }); const x = g.player.x;
    step(g, 12, { x: 1 }); expect(g.player.x - x).toBeGreaterThan(60); expect(g.player.z).toBeGreaterThan(0);
  });
  it('evades a grounded melee attack at altitude, but can be hit after landing', () => {
    const g = game(); step(g, 12, { jump: true });
    const e = g.spawn('shield', 250, 455); e.windup = .01;
    step(g, 1); expect(g.player.hp).toBe(g.player.maxHp);
    step(g, 34); e.x = g.player.x + 20; e.y = g.player.y; e.windup = .01;
    step(g, 1); expect(g.player.hp).toBeLessThan(g.player.maxHp);
  });
  it('jumps over a boss ground slam', () => {
    const g = game(); step(g, 12, { jump: true }); const e = g.spawn('boss', 300, 455);
    e.targetX = g.player.x; e.targetY = g.player.y; e.windup = .01;
    step(g, 1); expect(g.player.hp).toBe(g.player.maxHp);
  });
  it('lets a low projectile pass underneath instead of deleting it', () => {
    const g = game(); step(g, 12, { jump: true });
    g.projectiles.push({ x: g.player.x, y: g.player.y, vx: 0, vy: 0, life: 1, friendly: false, damage: 10, hit: new Set(), color: '#fff' });
    step(g, 1); expect(g.player.hp).toBe(g.player.maxHp); expect(g.projectiles).toHaveLength(1);
  });
  it('uses a deliberate heavy dive for one landing attack, while respecting depth', () => {
    const g = game(); step(g, 12, { jump: true });
    const target = g.spawn('brute', 260, 455), anotherLane = g.spawn('raider', 260, 360);
    target.cooldown = anotherLane.cooldown = 10;
    step(g, 1, { heavy: true }); expect(g.player.slam).toBe(true);
    step(g, 15);
    expect(g.player.z).toBe(0); expect(g.player.slam).toBe(false);
    expect(target.hp).toBeCloseTo(target.maxHp - g.player.power * 1.15);
    expect(anotherLane.hp).toBe(anotherLane.maxHp);
    const hp = target.hp; step(g, 12); expect(target.hp).toBe(hp);
  });
  it('makes the opening approach and attack chain quicker than the first version', () => {
    const g = game(); step(g, 24, { x: 1 }); expect(g.wave).toBe(0);
    const melee = game(); const e = melee.spawn('brute', 260, 455);
    step(melee, 29, { attack: true }); expect(e.hp).toBeLessThan(e.maxHp - melee.player.power);
    expect(melee.player.speed).toBe(320);
  });
});
