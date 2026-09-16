import type { Danger, Prop } from './engine';
import { dangerKind, dangerShape } from './danger-shapes';
import { fabric, line, oval, shape, stitches } from './plush';
type C = CanvasRenderingContext2D;
export function drawProp(c: C, p: Prop, time: number) {
  c.save(); c.translate(p.x, p.y);
  if (p.active && ['chest', 'barrel', 'snack', 'laundry'].includes(p.kind)) {
    for (let i = 0; i < 4; i++) { c.save(); c.translate(i * 16 - 25, -2); c.rotate(i * .8); c.fillStyle = '#ac9878'; c.fillRect(-13, -4, 25, 8); c.restore(); }
    c.restore(); return;
  }
  oval(c, 0, 5, p.kind === 'gate' ? 38 : 43, 12, '#26352e44');
  if (p.kind === 'bell') {
    shape(c,'M-36 0 L-30-24 30-24 36 0Z','#727a6e','#312f39',4);
    shape(c,p.active?'M-39-24 L-43-46-8-39 5-78 32-51 40-24Z':'M-37-24 Q-26-39-27-56 Q0-91 27-56 Q26-39 37-24Z',p.active?'#938b73':'#d6bc71','#312f39',4);
    oval(c,0,-77,7,8,'#e8ce8e','#312f39',3);
    label(c,p.active?'WARRANTY VOID':'3 HEAVY / 1 BOWLED FOE',-101,'#ffeac0');
  } else if (p.kind === 'laundry') {
    for (let i=0;i<3;i++) oval(c,i*20-20,-13-i%2*12,23,18,fabric(c,['#d2a5bc','#a9bec7','#e6d1a3'][i]),'#756273',2);
    stitches(c,-26,-15,50,.1);label(c,'HEAVY → DRUM',-59,'#fff1c9');
  } else if(p.kind === 'snack') {
    line(c,-45,-5,45,-5,'#b5c78a',8); for(let i=0;i<3;i++){oval(c,i*28-28,-22,16,13,'#e5b384','#80666a',2);oval(c,i*28-29,-24,3,4,'#654f58');}label(c,'THEIR LUNCH',-61,'#ffe7bc');
  } else if (p.kind === 'chest') {
    const color = p.weapon ? '#d3aa65' : '#a6b3a0';
    shape(c, 'M-35 0 L-37-43 Q0-73 37-43 L35 0Z', fabric(c, color));
    line(c, -36, -28, 36, -28, '#695b55', 4); stitches(c, -27, -12, 55);
    c.fillStyle = '#514452'; c.fillRect(-8, -37, 16, 18); oval(c, 0, -31, 3, 4, '#f9df95');
    label(c, p.weapon ? 'WEAPON STASH' : 'SNACK STASH', -84, '#ffe7ac');
    const a = time * 2; for (let i = 0; i < 3; i++) oval(c, Math.sin(a + i * 2) * 48, -40 + Math.cos(a + i) * 30, 2, 3, '#fff3c5');
  } else if (p.kind === 'barrel') {
    shape(c, 'M-29 0 Q-43-36-28-72 Q0-83 28-72 Q41-35 29 0Z', fabric(c, '#b29a6e'));
    for (const y of [-61, -10]) { line(c, -30, y, 30, y, '#796579', 7); stitches(c, -26, y, 54); }
    label(c, 'BEANS', -33, '#403b39'); oval(c, 0, -77, 26, 6, '#74815b');
  } else if (p.kind === 'lever') {
    if(p.flow!==undefined){
      shape(c,'M-37 0 L-34-46 34-46 37 0Z','#787864','#30322f',4);
      for(let i=0;i<4;i++)shape(c,`M${-32+i*17} -4 l-2 -12 12 -15 1 13Z`,i%2?'#d8bd79':'#3a4037','#30322f',1);
      line(c,0,-46,0,p.active?-59:-74,'#beb198',12);
      oval(c,0,p.active?-62:-78,32,12,p.active?'#83986a':'#d58a70','#373330',4);
      for(let i=0;i<4;i++)oval(c,-17+i*12,p.active?-64:-80,3,3,'#ead4a2');
      label(c,p.active?'UNPAID BREAK':'BONK: STOP THE LINE',-108,'#fce5b3');
      c.restore();return;
    }
    shape(c, 'M-32 0 L-22-20 22-20 32 0Z', '#788e89');
    line(c, 0, -14, p.active ? 26 : -26, -68, '#dac4a3', 8); oval(c, p.active ? 26 : -26, -68, 12, 12, p.active ? '#accb82' : '#e39d84', '#4b4847', 3);
    label(c, p.flow !== undefined ? (p.active ? 'UNPAID BREAK' : 'BONK: BRAKE') : p.hazard !== undefined ? (p.active ? 'UNEMPLOYED!' : 'BONK: STOP MACHINE') : p.active ? 'OPEN!' : 'BONK TO OPEN', -97, '#fbe5b7');
  } else if (p.kind === 'gate') {
    c.globalAlpha = p.active ? .25 : 1;
    for (const y of [-88, 92]) {
      line(c, 0, y + 10, 0, y - 88, '#a69077', 10); oval(c, 0, y - 95, 15, 16, '#e2c48e', '#5d4f50', 3);
    }
    if (!p.active) {
      line(c, 0, -150, 0, 28, '#e8c9a1', 12);
      for (let i = 0; i < 10; i++) { c.save(); c.translate(0, -146 + i * 18); c.rotate(.45); c.fillStyle = i % 2 ? '#b1756e' : '#f2d9ac'; c.fillRect(-12, -4, 24, 8); c.restore(); }
      label(c, 'NO WEIRDOS', -190, '#ffdfb4');
    }
  } else if (p.kind === 'spring') {
    oval(c, 0, 0, 38, 12, '#a696a3', '#484852', 3);
    for (let i = 0; i < 4; i++) oval(c, 0, -8 - i * 6, 21, 7, '#bfc4c3', '#636b78', 2);
    oval(c, 0, -33, 41, 12, '#d49da2', '#755f75', 3); stitches(c, -27, -35, 53);
    label(c, 'BOING', -58, '#ffdfb8');
  } else {
    oval(c, 0, 0, 65, 35, p.active ? '#cbd57d66' : '#dcb87e33', p.active ? '#d6ee92' : '#d7b591', 3);
    oval(c, 0, 0, 29, 15, '#5e6260', '#a6aa8e', 4);
    for (let i = 0; i < 4; i++) line(c, -20 + i * 12, -9, -20 + i * 12, 9, '#333f3d', 4);
    if (p.active) for (let i = 0; i < 6; i++) oval(c, Math.sin(time * 6 + i) * 23, -20 - (time * 85 + i * 18) % 110, 10 + i, 13, '#d0e19455');
    label(c, p.active ? 'PFFT!' : 'JUMP THE FUMES', -78, '#f3e4b9');
  }
  c.restore();
}
function label(c: C, text: string, y: number, color: string) {
  c.font = 'bold 12px monospace'; c.textAlign = 'center'; c.fillStyle = color; c.fillText(text, 0, y);
}
export function drawDanger(c: C, d: Danger, time: number) {
  const kind=dangerKind(d),s=dangerShape(d),landed=!!d.resolved,fall=Math.min(1,Math.max(0,d.timer)/.6),fade=landed?Math.max(0,1+d.timer/.24):1;
  const ink=d.sac?.returned?'#c7ec91':kind==='blast'?'#ffdb91':'#f6b5de';
  c.save();c.globalAlpha=fade;c.setLineDash(!landed&&d.timer>.25?[9,5]:[]);oval(c,d.x,d.y,s.rx,s.ry,landed?'#ffe6b266':kind==='blast'?'#ffc15d33':'#df68ae33',ink,3);c.setLineDash([]);
  const region=d.source?.kind==='enemy'&&d.source.enemy==='boss'?d.source.region:-1;
  if(d.sac){
    // The physical sac is drawn above actors, so a hero standing over it cannot hide it.
    if(d.sac.returned&&!landed){const face=Math.sign(d.sac.vx)||1;line(c,d.x-face*15,d.y,d.x+face*30,d.y,ink,3);line(c,d.x+face*30,d.y,d.x+face*18,d.y-8,ink,3);line(c,d.x+face*30,d.y,d.x+face*18,d.y+8,ink,3);}
  } else if(kind==='ice'){
    if(!landed){const yy=d.y-17-fall*165;shape(c,`M${d.x-19} ${yy-48} l38 0 -19 65Z`,'#b8d7dc','#354e64',3);line(c,d.x-9,yy-40,d.x,yy+6,'#e5eff0',3);line(c,d.x,d.y-3,d.x,yy+20,'#dbecf288',2);}
    else for(let i=0;i<6;i++){const x=d.x+Math.cos(i*2.4)*(1-fade)*75,y=d.y+Math.sin(i*2.4)*(1-fade)*35;shape(c,`M${x-9} ${y} l7 -23 13 18Z`,'#d1eff3','#557081',2);}
  } else if(kind==='jaw'){
    c.save();c.translate(d.x,d.y-12);c.scale(d.radius/88,d.radius/88);const gap=landed?3:20+fall*65;
    for(const side of [-1,1]){c.save();c.translate(0,side<0?-gap:0);c.scale(1,side);shape(c,'M-61 0 Q-62 32 0 32 Q62 32 61 0 L49-8 Q0 6-49-8Z','#d997a7','#533a4b',4);for(let i=0;i<7;i++){const x=-44+i*14;shape(c,`M${x-6} 2 l2 -17 10 0 1 17Z`,i%3?'#f0dfb2':'#c5ba84','#6c574c',2);}c.restore();}
    if(!landed){line(c,-56,-gap,-56,0,'#ddb292',3);line(c,56,-gap,56,0,'#ddb292',3);}c.restore();
  } else if(kind==='stamp'){
    c.save();c.translate(d.x,d.y-fall*185);shape(c,'M-102 0 L-102-23-32-36-24-76 24-76 32-36 102-23 102 0Z','#867886','#413a4d',4);oval(c,0,-80,42,17,'#bca181','#493c50',4);line(c,-92,-9,92,-9,'#f1c499',5);
    if(landed){c.font='bold 21px monospace';c.textAlign='center';c.fillStyle='#ffe8c5';c.fillText('REPOSSESSED',0,25);}c.restore();
  } else if(region===3){
    c.save();c.translate(d.x,d.y-26);c.rotate(Math.sin(time*8)*.12);shape(c,'M-17-9 L-34-20-29 9-15 5 17 6 30 15 33-16 18-10Z','#ca91a8','#685465',3);oval(c,0,0,20,18,'#d7b486','#6a4d61',3);for(let i=0;i<3;i++)line(c,-13+i*10,-10,-9+i*10,11,'#a8657c',4);oval(c,0,-23,4,5,'#ffe1a1');c.restore();
  } else if(region===0){
    for(let i=0;i<3;i++)oval(c,d.x,d.y,s.rx*(.35+i*.2),s.ry*(.35+i*.2),'#ffffff00',d.color,1.5);
    c.font='bold 15px monospace';c.textAlign='center';c.fillStyle='#ffe1a1';c.fillText('BELLY FLOP',d.x,d.y-22);
  } else {
    oval(c,d.x,d.y-20,15+Math.sin(time*18)*3,18,'#746756',d.color,2);line(c,d.x,d.y-35,d.x+8,d.y-49,'#e7cda0',3);oval(c,d.x+8,d.y-49,5,5,'#ffce73');
  }
  if(!landed){c.font='bold 12px monospace';c.textAlign='center';c.strokeStyle='#292331';c.lineWidth=4;const text=d.sac?(d.sac.returned?'CREW ONLY':'LIGHT / JUMP'):kind==='blast'?'JUMP ↑':'MOVE ↕',y=d.y+s.ry-9;c.strokeText(text,d.x,y);c.fillStyle=ink;c.fillText(text,d.x,y);}
  c.restore();
}
