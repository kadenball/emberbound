// Research probe: scripted steering is precise, so these are not human difficulty ratings.
// No production state mutation, damage overrides, private-method calls, or skipped waves.
import { createServer } from 'vite';
import { writeFile } from 'node:fs/promises';
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error', optimizeDeps: { noDiscovery: true, include: [] } });
try {
  const { Game, idleInput } = await vite.ssrLoadModule('/src/engine.ts');
  const { HEROES, STAGES } = await vite.ssrLoadModule('/src/content.ts');
  const { playInput } = await vite.ssrLoadModule('/scripts/gameplay-policy.ts');
  const rows = [];
  for (const policy of ['attack-only', 'attack-magic', 'attack-magic-dodge', 'deliberate-moves']) for (const seed of [7, 140, 991]) for (const hero of HEROES) for (let stage = 0; stage < STAGES.length; stage++) {
    const g = new Game(hero.id, stage, { strength: 0, vitality: 0, spirit: 0 }, seed);
    let combatFrames = 0, quietFrames = 0, damageEvents = 0, defensiveActions = 0, bossAttacks = 0;
    const bossPhases = new Map();
    for (let frame = 0; frame < 60 * 600 && g.state === 'playing'; frame++) {
      const p = g.player, input = idleInput(), enemies = g.enemies.filter(e => e.hp > 0);
      const target = enemies.sort((a, b) => Math.hypot(a.x - p.x, (a.y - p.y) * 2) - Math.hypot(b.x - p.x, (b.y - p.y) * 2))[0];
      if (!target) {
        quietFrames++;
        const prop = g.props.filter(q => !q.active && ['lever', 'chest'].includes(q.kind) && q.x > p.x - 140 && q.x < g.nextEncounterX).sort((a, b) => a.x - b.x)[0];
        if (g.cart && !g.cart.complete) { input.x = Math.abs(g.cart.x + 70 - p.x) > 15 ? Math.sign(g.cart.x + 70 - p.x) : 0; input.y = Math.abs(g.cart.y - p.y) > 10 ? Math.sign(g.cart.y - p.y) : 0; }
        else if (prop) {
          input.x = Math.abs(prop.x - p.x) > 70 ? Math.sign(prop.x - p.x) : 0;
          input.y = Math.abs(prop.y - p.y) > 15 ? Math.sign(prop.y - p.y) : 0;
          input.attack = Math.abs(prop.x - p.x) < 120 && Math.abs(prop.y - p.y) < 65;
        } else input.x = 1;
      } else {
        combatFrames++;
        const dx = target.x - p.x, dy = target.y - p.y;
        input.x = Math.abs(dx) > 60 ? Math.sign(dx) : 0;
        input.y = Math.abs(dy) > 10 ? Math.sign(dy) : 0;
        input.attack = Math.abs(dx) < 118 && Math.abs(dy) < 45;
        input.magic = policy !== 'attack-only' && Math.abs(dx) < (hero.id === 'ember' ? 500 : 170) && Math.abs(dy) < 35;
        if (policy === 'attack-magic-dodge') {
          const danger = enemies.find(e => e.windup > 0 && e.windup < .3 && Math.abs(e.x - p.x) < 110 && Math.abs(e.y - p.y) < 46);
          if (danger && p.dodgeCooldown <= 0) { input.dodge = true; input.x = Math.sign(danger.x - p.x); input.y = 0; }
          const boss = enemies.find(e => e.kind === 'boss' && e.windup > 0);
          if (boss && Math.hypot(p.x - boss.targetX, (p.y - boss.targetY) * 1.4) < 158) {
            input.x = p.x < boss.targetX ? -1 : 1; input.y = p.y < 450 ? -1 : 1;
            if (boss.windup < .3) input.dodge = true;
          }
        }
      }
      g.update(1 / 60, policy === 'deliberate-moves' ? playInput(g, frame) : input);
      damageEvents += g.events.filter(e => e === 'hurt').length;
      defensiveActions += g.events.filter(e => e === 'dodge' || e === 'jump').length;
      for (const e of g.enemies) if (e.kind === 'boss') { bossAttacks += Math.max(0, e.phase - (bossPhases.get(e.id) ?? 0)); bossPhases.set(e.id, e.phase); }
      g.events = [];
    }
    rows.push({ policy, seed, hero: hero.id, stage, name: STAGES[stage].name, bossStage: STAGES[stage].bossStage, result: g.state, secondsIncludingHitstop: +( (combatFrames + quietFrames) / 60 ).toFixed(2), simulationSeconds: +g.time.toFixed(2), combatSeconds: +(combatFrames / 60).toFixed(2), noncombatSeconds: +(quietFrames / 60).toFixed(2), hpPercent: +((g.player.hp / g.player.maxHp) * 100).toFixed(1), damageEvents, defensiveActions, bossAttacks, finalLevel: g.level, foundWeapons: g.foundWeapons });
  }
  const summaries = [...new Set(rows.map(r => r.policy))].map(policy => {
    const group = rows.filter(r => r.policy === policy), wins = group.filter(r => r.result === 'won');
    return { policy, runs: group.length, wins: wins.length, losses: group.filter(r => r.result === 'lost').length, timeouts: group.filter(r => r.result === 'playing').length, averageWonSeconds: +(wins.reduce((n, r) => n + r.secondsIncludingHitstop, 0) / wins.length).toFixed(1), medianWonHpPercent: wins.map(r => r.hpPercent).sort((a, b) => a - b)[Math.floor(wins.length / 2)] };
  });
  const output = { date: '2026-09-07', build: '0.7.0', method: 'Four scripted policies × three seeds × three heroes × twelve stages. Fresh base equipment each run, normal loot/XP/regen, nearest-target alignment. First three policies have no jump/heavy input; spring pads may auto-launch. Fourth policy uses heavy, jump, danger avoidance and laundry bowling. All policies steer the new cart objective to avoid artificial cart timeouts. Perfect steering, not human playtesting. Attack-only still steers, attacks props, and collects loot; it is not a stationary hold-button test.', summaries, rows };
  await writeFile('docs/GAMEPLAY-AUDIT-0.7.json', JSON.stringify(output, null, 2) + '\n');
  console.log(JSON.stringify(summaries, null, 2));
} finally { await vite.close(); }
