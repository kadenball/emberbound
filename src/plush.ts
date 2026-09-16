import {drawEnemyArt} from './enemy-art';
import { drawCreature } from './creature-art';
import { drawHeroArt } from './hero-art';
import { HEROES, weaponById, type WeaponId, type HeroId } from './content';
import type { Actor, EnemyKind, BossState } from './engine';

type C = CanvasRenderingContext2D;
const ink = '#403738';
const fabrics = new Map<string, CanvasPattern>();
export const n = (seed: number) => { const v = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
export function oval(c: C, x: number, y: number, rx: number, ry: number, fill: string | CanvasPattern, stroke = '', width = 2) {
  c.beginPath(); c.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), 0, 0, Math.PI * 2); c.fillStyle = fill; c.fill();
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = width; c.stroke(); }
}
export function line(c: C, x: number, y: number, xx: number, yy: number, color: string, width = 2) {
  c.beginPath(); c.moveTo(x, y); c.lineTo(xx, yy); c.strokeStyle = color; c.lineWidth = width; c.lineCap = 'round'; c.stroke();
}
export function shape(c: C, path: string, fill: string | CanvasPattern, stroke = ink, width = 2.5) {
  const p = new Path2D(path); c.fillStyle = fill; c.fill(p); if (stroke) { c.strokeStyle = stroke; c.lineWidth = width; c.lineJoin = 'round'; c.stroke(p); }
}
export function fabric(c: C, color: string) {
  if (!fabrics.has(color)) {
    const tile = document.createElement('canvas'); tile.width = tile.height = 48;
    const t = tile.getContext('2d')!; t.fillStyle = color; t.fillRect(0, 0, 48, 48);
    for (let i = 0; i < 70; i++) {
      const x = n(i + 1) * 48, y = n(i + 79) * 48;
      line(t, x, y, x + n(i + 33) * 4 - 2, y - 1 - n(i + 4) * 4, i % 2 ? '#ffefd327' : '#33293c20', .7);
    }
    fabrics.set(color, c.createPattern(tile, 'repeat')!);
  }
  return fabrics.get(color)!;
}
export function stitches(c: C, x: number, y: number, length: number, angle = 0, color = '#f1d3a8') {
  c.save(); c.translate(x, y); c.rotate(angle);
  line(c, 0, 0, length, 0, '#40373866', 1.5);
  for (let k = 3; k < length; k += 7) line(c, k - 1, -3, k + 1, 3, color, 1.2);
  c.restore();
}

export interface PlushPose { rush?:number; power?: number; royalProtection?:boolean; highAttack?:boolean; stitching?: boolean; bossTimer?: number; bossPhase?: number; enraged?: boolean; moment?: import('./boss-performance').BossMoment | null; attack?: import('./combat').AttackState | null; downed?: boolean; knockdown?: boolean; bowling?: number; nap?: boolean; guardBroken?: boolean; bossState?: BossState; hero?: HeroId; spin?: boolean; weapon?: WeaponId; kind?: EnemyKind; stage?: number; z?: number; roll?: number; landing?: number; windup?: number; dead?: number; frozen?: boolean; variant?: number }

export function drawPlush(c: C, x: number, y: number, actor: Actor, time: number, scale: number, pose: PlushPose) {
  if(!drawHeroArt(c,x,y,actor,time,scale,pose,(ctx,id)=>drawHeroWeapon(ctx,id,pose.hero)) && !drawEnemyArt(c,x,y,actor,time,scale,pose)) drawCreature(c,x,y,actor,time,scale,pose,drawWeapon);
}

const portraits = new Map<HeroId, string>();
export function plushPortrait(hero: HeroId) {
  if (!portraits.has(hero)) {
    const canvas = document.createElement('canvas'); canvas.width = 400; canvas.height = 340;
    const c = canvas.getContext('2d')!;
    drawPlush(c, 205, 325, { x: 0, y: 0, hp: 100, maxHp: 100, face: 1, hurt: 0, walk: 0, attackTime: 0 }, 1, hero === 'frost' ? 1.65 : 2.2, { hero });
    portraits.set(hero, canvas.toDataURL());
  }
  return portraits.get(hero)!;
}

function drawHeroWeapon(c:C,id:WeaponId,hero?:HeroId) {
  if(id!=='starter' || hero==='ember' || !hero){drawWeapon(c,id);return;}
  line(c,0,14,0,-65,'#a98665',7);
  if(hero==='moss'){
    shape(c,'M-24-47 Q-24-85 0-84 Q24-85 24-47Z','#c9858c');
    oval(c,0,-47,27,8,'#ad6375',ink,2);
  } else {
    oval(c,0,-68,22,25,'#e3e5e0',ink,2);
    c.beginPath();for(let a=0;a<13;a+=.12){const x=Math.cos(a)*a*1.3,y=-68+Math.sin(a)*a*1.3;if(!a)c.moveTo(x,y);else c.lineTo(x,y);}
    c.strokeStyle='#8f92c0';c.lineWidth=4;c.stroke();
  }
}
export function drawWeapon(c: C, id: WeaponId) {
  const color = weaponById(id).color;
  line(c, 0, 14, 0, -60, '#9e8063', 7);
  if (id === 'starter') { shape(c, 'M-15-45 L-20-79 Q-1-87 18-78 L13-44Z', color); for (const x of [-9, -1, 7]) line(c, x, -74, x + 1, -54, '#748785', 3); }
  else if (id === 'pan') { oval(c, 0, -67, 26, 28, color, '#51555c', 4); oval(c, 0, -67, 20, 22, '#7b8b8b', '#c7d0bf', 2); }
  else if (id === 'fork') { shape(c, 'M-19-101 L-18-60 Q0-43 18-60 L19-101 11-101 10-68 4-68 4-101-4-101-4-68-10-68-11-101Z', color); }
  else if (id === 'sock') { shape(c, 'M-13-92 L14-88 10-56 32-45 Q44-26 17-29 L-12-42Z', fabric(c, color)); stitches(c, -10, -82, 23); oval(c, 22, -38, 5, 4, '#69856c'); }
  else if (id === 'popsicle') { shape(c, 'M-17-44 L-18-91 Q0-117 18-91 L17-44Z', color); line(c, -8, -89, -8, -56, '#e2faf2', 4); }
  else if (id === 'candy') { oval(c, 0, -70, 27, 28, color, '#74596c', 3); for (let i = 0; i < 7; i++) oval(c, Math.cos(i) * 17, -70 + Math.sin(i) * 17, 4, 5, '#ffe7b6'); }
  else if (id === 'tooth') { shape(c, 'M-22-97 Q-11-110 0-99 Q19-111 26-94 L21-62 11-38 0-66-11-38-20-63Z', color); line(c, -12, -93, -10, -74, '#fffdf1', 4); }
  else { oval(c, 0, -67, 22, 27, '#d4c6a3', '#695e66', 3); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; line(c, Math.cos(a) * 18, -67 + Math.sin(a) * 23, Math.cos(a) * 28, -67 + Math.sin(a) * 32, color, 3); } }
}
const weaponPictures = new Map<WeaponId, string>();
export function weaponPortrait(id: WeaponId) {
  if (!weaponPictures.has(id)) {
    const canvas = document.createElement('canvas'); canvas.width = 180; canvas.height = 140;
    const c = canvas.getContext('2d')!; c.translate(88, 116); c.rotate(.4); drawWeapon(c, id); weaponPictures.set(id, canvas.toDataURL());
  }
  return weaponPictures.get(id)!;
}
export function enemyPortrait(kind: EnemyKind, stage = 0) {
  const canvas = document.createElement('canvas'); canvas.width = kind==='boss'?360:280; canvas.height = kind==='boss'?320:260;
  drawPlush(canvas.getContext('2d')!, 165, kind==='boss'?302:240, { x: 0, y: 0, hp: 100, maxHp: 100, face: 1, hurt: 0, walk: 0, attackTime: 0 }, 1, 1.25, { kind, variant: 4, stage });
  return canvas.toDataURL();
}
