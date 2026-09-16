import { journeyPlaces } from './journey-art';
import {ARENA_START,drawArenaBackdrop,drawArenaMotion,drawArenaForeground} from './arena-art';
import { drawGrimeDistrict } from './grime-art';
import { STAGES, REGIONS } from './content';
import { fabric, line, n, oval, shape, stitches } from './plush';
type C = CanvasRenderingContext2D;

function puff(c: C, x: number, y: number, r: number, color: string | CanvasPattern) {
  oval(c, x, y, r, r * .45, color); oval(c, x - r * .45, y - r * .18, r * .52, r * .41, color); oval(c, x + r * .28, y - r * .23, r * .62, r * .5, color);
}
function eyes(c: C, x: number, y: number, scale = 1, t = 0) {
  c.save(); c.translate(x, y); c.scale(scale, scale);
  oval(c, -8, 0, 6, 8, '#f6e6c9', '#4d4d48', 1.2); oval(c, 8, -2, 7, 6, '#f6e6c9', '#4d4d48', 1.2);
  oval(c, -8 + Math.sin(t) * 2, 1, 2, 3, '#3c4144'); oval(c, 7 + Math.sin(t) * 2, -1, 2, 2, '#3c4144'); c.restore();
}
function mushroom(c: C, x: number, y: number, s: number, color: string, t: number, house = false) {
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(Math.sin(t * 1.2 + x) * .012);
  shape(c, 'M-12 0 Q-5-35-14-53 L14-54 Q7-27 15 0Z', fabric(c, '#ead8b2'), '#5e6451', 2);
  oval(c, 0, -49, 43, 11, '#d5aa9f', '#6b5f59', 2);
  shape(c, 'M-47-51 Q-37-105 1-108 Q35-104 46-52 Q12-42-47-51Z', fabric(c, color), '#624e54', 3);
  for (let i = 0; i < 6; i++) oval(c, -25 + (i % 3) * 24, -62 - Math.floor(i / 3) * 23, 4 + n(i) * 3, 3, '#ffe5bca6');
  stitches(c, -23, -51, 52, -.06, '#f5d1ad');
  if (house) {
    shape(c, 'M-9 0 L-9-25 Q0-40 9-25 L9 0Z', '#715955', '#564a46', 2); oval(c, 4, -12, 1.5, 1.5, '#ecc777');
    eyes(c, 0, -77, .8, t); line(c, -7, -65, 7, -63, '#624e54', 2);
  } else eyes(c, 1, -76, .7, t);
  c.restore();
}
function sign(c: C, x: number, y: number, text: string, color = '#d8b787') {
  c.save(); c.translate(x, y); c.rotate(-.06);
  line(c, -9, 5, -9, -65, '#6f6651', 9);
  shape(c, 'M-70-89 L53-89 70-67 53-47-70-47Z', fabric(c, color), '#655455', 2.5);
  line(c, -62, -83, 47, -83, '#f5dfb56b', 1);
  oval(c, -59, -55, 2, 2, '#8a7562');
  c.fillStyle = '#584a48'; c.font = 'bold 12px monospace'; c.textAlign = 'center'; c.fillText(text, -1, -64);
  c.restore();
}
function tree(c: C, x: number, y: number, h: number, stage: number, detail: boolean, t: number) {
  c.save(); c.translate(x, y);
  const color = stage === 1 ? '#769ba4' : '#3f7868';
  shape(c, `M-21 4 Q-6 ${-h * .5} -28 ${-h} L12 ${-h + 7} Q7 ${-h * .5} 25 4 L49 12Z`, fabric(c, detail ? '#7e8970' : '#61857b'), detail ? '#3d655b' : '', 2.5);
  line(c, 0, -h * .46, -55, -h * .67, '#70836b', 13); line(c, 0, -h * .68, 47, -h * .83, '#70836b', 12);
  if (stage === 1) {
    for (let j = 0; j < 4; j++) {
      const yy = -h + j * h * .18, spread = 42 + j * 16;
      shape(c, `M0 ${yy - 35} Q${-spread * .4} ${yy + 13} ${-spread} ${yy + 60} Q0 ${yy + 80} ${spread} ${yy + 56}Z`, fabric(c, detail ? '#dce4e2' : color), detail ? '#738c97' : '', 2);
      if (detail) stitches(c, -spread * .5, yy + 59, spread, 0, '#fdf1e5');
    }
  } else {
    for (let i = 0; i < 5; i++) {
      const xx = (i - 2) * 39, yy = -h + n(i + x) * 33;
      puff(c, xx, yy, 65 + n(i + 29) * 25, detail ? fabric(c, i % 2 ? '#497c5c' : '#698b61') : color);
    }
    if (detail) { stitches(c, -12, -h * .6, 95, Math.PI / 2, '#b9c494'); eyes(c, 3, -99, 1.1, t * .4); line(c, -6, -76, 14, -73, '#485f4d', 3); }
  }
  c.restore();
}
function iceCream(c: C, x: number, y: number, s: number, t: number) {
  c.save(); c.translate(x, y); c.scale(s, s);
  shape(c, 'M-33-61 L5 10 35-61Z', fabric(c, '#c5a888'), '#6f6c75', 3);
  for (let i = 0; i < 4; i++) { line(c, -25 + i * 12, -57, 11 + i * 4, -4 - i * 12, '#937c71', 1.5); line(c, 25 - i * 10, -55, -6 - i * 3, -9 - i * 12, '#ead4b2', 1); }
  puff(c, 0, -73, 49, fabric(c, '#e7c3d1')); eyes(c, -4, -87, 1.3, t);
  oval(c, 3, -63, 7, 9, '#8a6376'); oval(c, 13, -120, 8, 8, '#cc8295', '#86566f', 1.5);
  c.restore();
}
function cardboardKeep(c: C, x: number, y: number, s: number, t: number, distant = false) {
  c.save(); c.translate(x, y); c.scale(s, s);
  if (distant) c.globalAlpha *= .42;
  const wall = fabric(c, '#b6a082'), trim = '#75676e';
  shape(c, 'M-120 0 L-114-172-74-174-68-189-35-180-32-163 28-160 34-181 66-183 68-165 116-165 130 0Z', wall, trim, 3);
  for (let i = -1; i <= 1; i += 2) {
    c.save(); c.translate(i * 111, 0); c.rotate(i * .045);
    shape(c, 'M-36 0 L-35-217-24-217-24-235-8-234-7-216 8-216 8-237 25-233 25-215 36-215 37 0Z', fabric(c, i === 1 ? '#c9b292' : '#ad927d'), trim, 3);
    oval(c, 0, -151, 14, 27, '#746479', '#e3ca9d', 4); eyes(c, 0, -153, .85, t);
    stitches(c, -24, -203, 166, Math.PI / 2, '#eee0b4');
    for (let j = 0; j < 5; j++) line(c, -28, -19 - j * 32, 28, -23 - j * 32, '#7c6c691f', 1.5);
    c.restore();
  }
  shape(c, 'M-48 0 L-46-87 Q0-160 46-87 L49 0Z', '#5c5064', '#e7ce9c', 7);
  for (let j = 0; j < 6; j++) { const xx = -37 + j * 13; shape(c, `M${xx}-87 l1 18 q5 10 10 0 l1-18Z`, '#e9d7b5', '#8f7b74', 1); }
  for (let j = 0; j < 4; j++) line(c, -118, -127 + j * 30, -52, -124 + j * 30, '#7b69733d', 2);
  line(c, 4, -174, 4, -246, '#73687c', 4);
  shape(c, `M6-246 Q31 ${-247 + Math.sin(t * 3) * 5} 57-238 L39-222 59-212 Q29-216 6-216Z`, '#bc819e', '#766076', 2);
  c.fillStyle = '#5c5062'; c.font = 'bold 11px monospace'; c.textAlign = 'center'; c.fillText('KEEP OUT-ish', 0, -144);
  // Tape makes the castle look as if it was made on the kitchen floor.
  c.save(); c.globalAlpha *= .55; c.translate(56, -95); c.rotate(.5); c.fillStyle = '#e9d5a8'; c.fillRect(-10, -35, 20, 65); c.restore();
  c.restore();
}

export function drawBackdrop(c: C, w: number, h: number, cam: number, offset: number, stage: number, t: number) {
  const sky = c.createLinearGradient(0, -offset, 0, 400); sky.addColorStop(0, ['#374e47', '#424e67', '#344c49', '#694754', '#514f41', '#4e3b50'][stage]); sky.addColorStop(1, ['#aca97a', '#a5b3b7', '#a5ab79', '#cca593', '#b6a279', '#bea285'][stage]);
  c.fillStyle = sky; c.fillRect(0, -offset, w, h + 500);
  const sunX = w * .72 - cam * .025;
  oval(c, sunX, 119, 50, 50, '#f4d5a68a'); eyes(c, sunX, 115, .8, t * .2);
  for (let i = -1; i < w / 230 + 2; i++) {
    const x = i * 240 - (cam * .08 % 240);
    puff(c, x + 30, 75 + n(i + 10) * 75, 60 + n(i + 39) * 33, '#fff1d352');
  }
  // Three layers of soft, stitched landscape give the diorama real depth.
  for (let layer = 0; layer < 3; layer++) {
    const factor = .09 + layer * .1, spacing = 390 - layer * 50;
    const color = [['#95b6a2', '#79a18b', '#648e7b'], ['#a9b2ca', '#929fbf', '#7b95b0'], ['#9db3a3', '#779b96', '#608880'], ['#dcafc7', '#c994b2', '#ac84a4'], ['#b7ae8d', '#9a9275', '#7f8272'], ['#b899ae', '#a2839e', '#887b98']][stage][layer];
    for (let i = -1; i < (w + cam * factor) / spacing + 1; i++) {
      const x = i * spacing - cam * factor, peak = 143 + n(i + layer * 77) * 90 + layer * 25;
      const path = stage === 1 ? `M${x-160} 390 Q${x-45} ${peak+10} ${x+20} ${peak-70} Q${x+85} ${peak-80} ${x+230} 390Z` : `M${x-100} 396 Q${x-30} ${peak-40} ${x+140} ${peak} Q${x+300} ${peak+25} ${x+390} 396Z`;
      shape(c, path, fabric(c, color), '', 0);
      if (stage === 1) shape(c, `M${x-42} ${peak+24} Q${x+13} ${peak-105} ${x+40} ${peak-66} L${x+88} ${peak+3} ${x+49} ${peak-4} ${x+27} ${peak+20} ${x+5} ${peak-1}Z`, '#e4e2df', '', 0);
      if (layer === 1) stitches(c, x + 83, peak + 40, 100, .42, stage === 1 ? '#cfd9e1' : '#b9c3a5');
    }
  }
  if (stage === 5) cardboardKeep(c, w * .71 - cam * .13, 343, 1.0, t, true);
  else if (stage >= 2) {c.save();c.globalAlpha=.35;for (let i = -1; i < w / 360 + 2; i++) landmark(c, i * 360 - cam * .2, 350, stage, .9, t);c.restore();}
  else for (let i = -1; i < (w + cam * .45) / 240 + 1; i++) tree(c, i * 240 - cam * .45, 355, 140 + n(i) * 80, stage, false, t);
}

export function drawTerrain(c: C, w: number, h: number, cam: number, stage: number, t: number,landmarkEnd=Infinity,authoredRoute=false) {
  const pal = REGIONS[stage];
  // A winding stream behind the road, with stitched banks and reflections.
  shape(c, `M0 315 L${w} 315 ${w} 350 0 350Z`, ['#607453','#8cafb8','#526f60','#86606a','#535e4b','#6d5b67'][stage], '#537e7980', 2);
  for (let i = 0; i < 24; i++) { const x = (i * 79 + Math.sin(t + i) * 7 - cam * .25) % (w + 100); line(c, x, 326 + n(i) * 13, x + 18 + n(i + 8) * 20, 325 + n(i) * 13, '#e2edd052', 1.5); }
  c.fillStyle = fabric(c, pal.ground); c.fillRect(0, 350, w, h + 340);
  shape(c, `M0 350 L${w} 350 ${w} 562 0 562Z`, fabric(c, ['#b6b58c', '#c7d0d7', '#adb89c', '#dbc0bc', '#bcb093', '#bca896'][stage]), '#365e5a55', 3);
  c.save(); c.translate(-cam, 0);
  for (let i = 0; i < 560; i++) {
    const x = n(i + 12) * 8400; if (x < cam - 30 || x > cam + w + 30) continue;
    const y = 420 + n(i + 129) * 130;
    if (i % 5 === 0) oval(c, x, y, 5 + n(i) * 6, 2 + n(i + 4) * 2, ['#84997c', '#a2b6c3', '#7c9990', '#b69da9', '#918c77', '#9e8c89'][stage]);
    else line(c, x, y, x + 4, y - 1, '#efe4bf42', 1.5);
  }
  if(!authoredRoute){
  // Wooden plank crossings and stone patches are beneath the collision plane.
  for (const xx of [1270, 2370, 3470, 4570, 5670, 6770, 7770]) if (xx + 110 > cam && xx - 110 < cam + w) {
    if (stage === 5) {
      for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) {
        const x = xx - 100 + i * 34, y = 421 + j * 34;
        shape(c, `M${x+2} ${y} l28 2 1 23-29 2Z`, ['#bbaa99', '#cec0ac', '#ae9b93'][(i+j)%3], '#958682', 1);
      }
    } else {
      for (let i = 0; i < 23; i++) {
        const x = xx - 90 + i * 23;
        shape(c, `M${x} 405 l20 2 4 151-22 2Z`, fabric(c, stage === 1 ? '#b6afb0' : '#b1a280'), '#807e6b', 1.5);
        line(c, x + 5, 418, x + 7, 536, '#e2cea155', 1);
        oval(c, x + 10, 416, 2, 2, '#6e746b'); oval(c, x + 11, 545, 2, 2, '#6e746b');
      }
    }
  }
  for (let i = -1; i < 23; i++) {
    const x = i * 410 + 55; if (x < cam - 230 || x > cam + w + 230) continue;
    if(x+300>landmarkEnd)continue;
    if (i % 3 !== 0) continue;
    const y = 345;
    if (stage === 0) {
      tree(c, x, y - 8, 295 + n(i+7) * 85, 0, true, t);
      mushroom(c, x + 155, y - 8, .55 + n(i) * .25, i % 2 ? '#d799a1' : '#c4a0b6', t, true);
      for (let j = 0; j < 3; j++) puff(c, x - 65 + j * 55, y, 35, fabric(c, j % 2 ? '#699772' : '#8aa278'));
    } else if (stage === 1) {
      tree(c, x, y - 10, 242 + n(i) * 130, 1, true, t);
      iceCream(c, x + 174, y - 17, .7 + n(i) * .3, t);
      oval(c, x + 125, y - 8, 64, 13, '#dce3df');
    } else if (stage >= 2 && stage <= 4) {
      landmark(c, x + 30, y - 6, stage, 1.1, t);
      landmark(c, x + 220, y - 5, stage, .5, t + 2);
    } else {
      // Boxes, crooked chimneys, and lamps make this a citadel, not a recolored forest.
      if (i % 2 === 0) cardboardKeep(c, x + 80, y - 14, .58, t);
      else {
        shape(c, `M${x-25} ${y} l-3-109 116-7 10 116Z`, fabric(c, '#b5a08e'), '#7f7080', 3);
        shape(c, `M${x-47} ${y-109} l-5-23 142-8 19 27Z`, fabric(c, '#c2a78c'), '#7f7080', 3);
        eyes(c, x + 32, y - 67, 1.5, t); stitches(c, x - 18, y - 105, 106, -.04);
        c.fillStyle = '#765969'; c.font = 'bold 12px monospace'; c.textAlign = 'center'; c.fillText('FRAGILE EGO', x + 36, y - 32);
      }
      line(c, x - 85, y, x - 85, y - 152, '#746676', 7); oval(c, x - 85, y - 135, 12, 20, '#efc88c', '#7b6c74', 3);
      const glow = c.createRadialGradient(x-85, y-135, 2, x-85, y-135, 60); glow.addColorStop(0, '#ffd79844'); glow.addColorStop(1, '#ffd79800'); c.fillStyle = glow; c.fillRect(x-145, y-195, 120, 120);
    }
  }
  const labels = [['NO NIBBLING', 'MIND THE MOSS', 'TEETH AHEAD'], ['DO NOT LICK', 'BRAIN FREEZE →', 'SOUP WEATHER'], ['SOCKS GO HERE', 'RINSE & REGRET', 'ODD SOCKS ONLY'], ['NO FREE BITES', 'SUGAR COMA →', 'MIND THE CRUMBS'], ['FRANK WAS HERE', 'SORT OF SAFE', 'SHARP BITS →'], ['NO REFUNDS', 'ROYAL NONSENSE', 'MIND THE EGO']][stage];
  for (let i = 0; i < 10; i++) { const x = 325 + i * 875; if (x > cam - 100 && x < cam + w + 100) sign(c, x, 350, labels[i % 3]); }
  if (stage === 5 && cam + w > 2230 && landmarkEnd>2800) cardboardKeep(c, 2590, 345, 1.32, t);
  // Bunting is sewn from mismatched scraps, not a repeated flat canopy.
  for (const start of [970, 2070, 3170, 4270, 5370, 6470, 7570]) if (start + 340 > cam && start < cam + w) {
    if(start+340>landmarkEnd)continue;
    c.strokeStyle = '#675c6977'; c.lineWidth = 2; c.beginPath(); c.moveTo(start, 220); c.quadraticCurveTo(start+160, 290, start+330, 215); c.stroke();
    for (let i = 0; i < 8; i++) {
      const x = start + i * 40 + 10, y = 223 + Math.sin(i / 7 * Math.PI) * 34;
      shape(c, `M${x} ${y} l28 3-12 ${25+Math.sin(t*2+i)*3}Z`, ['#d6a078','#a8bcc3','#c49daf','#c9c69a'][i%4], '#776e6b', 1);
    }
  }
  }
  c.restore();
}

export function drawAmbient(c: C, w: number, stage: number, t: number) {
  for (let i = 0; i < 20; i++) {
    const x = (n(i+60) * w + t * (stage === 1 ? 9 : 4)) % w, y = 175 + n(i+93) * 340;
    oval(c, x, y + Math.sin(t+i) * 7, stage === 1 ? 2 : 1.7, stage === 1 ? 2 : 1.7, '#fff1c47a');
  }
}

export function drawForeground(c: C, w: number, cam: number, offset: number, stage: number, t: number) {
  const y = 602 + Math.max(0, offset) * .7;
  for (let i = -1; i < w / 180 + 2; i++) {
    const x = i * 180 - (cam * 1.1 % 180);
    puff(c, x, y + n(i) * 14, 106, fabric(c, ['#315f58', '#566f8c', '#385d5d', '#745070', '#565e50', '#5e4c69'][stage]));
    stitches(c, x - 25, y - 21, 60, -.08, ['#779a78','#b2bccd','#83a398','#c297b9','#a7a082','#ac8caa'][stage]);
    if (stage === 0 && i % 3 === 0) mushroom(c, x + 60, y - 6, .39, '#b08d9b', t);
    if (stage === 1 && i % 2 === 0) shape(c, `M${x} ${y-10} l12-41 17 45Z`, '#aec6cf', '#708ca1', 2);
    if (stage === 5 && i % 3 === 0) {
      oval(c, x + 30, y - 9, 17, 9, '#cab797', '#8e7e87', 2); line(c, x + 22, y - 10, x + 26, y - 5, '#8e7e87', 2); line(c, x + 34, y - 13, x + 36, y - 7, '#8e7e87', 2);
    }
  }
}

export function drawScenery(c: C, w: number, h: number, cam: number, offset: number, stage: number, t: number,authoredRoute=false) {
  drawBackdrop(c, w, h, cam, offset, stage, t);
  drawTerrain(c, w, h, cam, stage, t,Infinity,authoredRoute);
  drawAmbient(c, w, stage, t);
}

const previews = new Map<number, string>();
export function stagePreview(stage: number) {
  if (!previews.has(stage)) {
    const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 360;
    const c = canvas.getContext('2d')!; c.scale(.55, .55);
    const region = STAGES[stage].region;
    const cam=STAGES[stage].bossStage?ARENA_START:journeyPlaces(stage)[[0,3,1,1,3,4][region]].x-582;
    drawScenery(c,1164,655,cam,0,region,3,!STAGES[stage].bossStage);
    drawGrimeDistrict(c,1164,cam,stage,3);
    if(STAGES[stage].bossStage){c.save();c.translate(-cam,0);drawArenaBackdrop(c,region);drawArenaMotion(c,region,3);c.restore();drawArenaForeground(c,cam,1164,0,region);}
    else drawForeground(c,1164,cam,0,region,3);
    previews.set(stage, canvas.toDataURL());
  }
  return previews.get(stage)!;
}

function landmark(c: C, x: number, y: number, region: number, scale: number, t: number) {
  c.save(); c.translate(x, y); c.scale(scale, scale);
  if (region === 2) {
    // Abandoned washing machines and enormous socks make the marsh its own place.
    shape(c, 'M-63 0 L-65-149 Q0-168 64-148 L67 0Z', fabric(c, '#a6bdb2'), '#536b69', 3);
    oval(c, 0, -71, 44, 48, '#d7d8b6', '#738d88', 6); oval(c, 0, -71, 33, 36, '#668e91'); eyes(c, 0, -73, 1.8, t);
    for (let i = 0; i < 3; i++) oval(c, -35 + i * 27, -135, 7, 6, ['#b98a9f', '#d5c496', '#71989a'][i]);
    shape(c, 'M-80-123 L-91-192-56-200-47-151-23-135 Q-12-115-36-116Z', fabric(c, '#bc9bb2'), '#6a6072', 3); stitches(c, -85, -182, 27);
    for (let i = 0; i < 4; i++) { line(c, -100 + i * 67, 0, -95 + i * 67, -36, '#6f915c', 4); oval(c, -94 + i * 67, -39, 5, 15, '#b8bc80'); }
  } else if (region === 3) {
    shape(c, 'M-74 0 L-75-147 71-147 73 0Z', fabric(c, '#b988a6'), '#785970', 3);
    shape(c, 'M-87-143 L-90-170 88-170 91-143Z', '#e5bccc', '#88667e', 3);
    for (let i = 0; i < 6; i++) oval(c, -68 + i * 27, -144, 15, 25 + i % 2 * 10, '#e7c3d0');
    oval(c, 0, -88, 49, 49, fabric(c, '#dcb286'), '#8a6674', 3); oval(c, 0, -88, 17, 20, '#805e7d');
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; line(c, Math.cos(a) * 33, -88 + Math.sin(a) * 33, Math.cos(a) * 36, -84 + Math.sin(a) * 33, i % 2 ? '#e6d19a' : '#a6c8c5', 4); }
    eyes(c, 0, -16, 1, t); line(c, 55, -170, 55, -235, '#d8c8aa', 18); oval(c, 55, -243, 18, 11, '#dfb1c1');
  } else {
    for (let i = 0; i < 3; i++) {
      c.save(); c.translate(-50 + i * 48, -18 - i % 2 * 58); c.rotate((i - 1) * .13);
      shape(c, 'M-35 0 L-34-61 35-61 35 0Z', fabric(c, ['#a6a990', '#ac9179', '#b2aaa0'][i]), '#64695d', 3); stitches(c, -27, -53, 51); eyes(c, 0, -27, 1, t); c.restore();
    }
    line(c, -76, 0, -76, -181, '#717e75', 11); line(c, -76, -181, 79, -181, '#717e75', 11); line(c, 59, -181, 59, -107, '#b5bba2', 4);
    shape(c, 'M47-107 Q39-79 59-79 Q78-79 73-100', '#b9bbaa', '#666f69', 4);
    oval(c, -25, -92, 29, 31, '#bba578', '#6f7365', 6); oval(c, -25, -92, 11, 12, '#667870');
  }
  c.restore();
}

export {drawArenaMotion as drawArena} from './arena-art';
