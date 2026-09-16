import { drawJourneyPlaces } from './journey-art';
import { fabric, line, n, oval, shape, stitches } from './plush';
import { STAGES } from './content';
import { trapState, TRAP_NAMES, type Setpiece } from './setpieces';
type C = CanvasRenderingContext2D;
const INK = '#211f29';
const PALETTES = [ ['#3c5443','#919663','#bf684e'], ['#394f62','#8ba5a4','#c17471'], ['#384b48','#8a9560','#c2ae5c'], ['#69444c','#bb8a76','#aab36c'], ['#444b43','#ab956d','#d18a4c'], ['#51454a','#ad9470','#bb6372'] ];
const SIGNS = [ ['THE LAST SUPPER. AGAIN.','MEAT OF UNKNOWN ORIGIN','THE COMPOST HAS TEETH'], ['COLD STORAGE / WARM REGRETS','EMPLOYEE OF THE MONTH: MOULD','FRESH UNTIL YESTERDAY'], ['SOCK AMNESTY / NO QUESTIONS','THE GREAT UNWASHED','RINSE YOUR SINS'], ['DENTIST NOT INCLUDED','YOU ARE THE FREE SAMPLE','SUGAR IS A SOCIAL DISEASE'], ['0 DAYS WITHOUT A FLATTENING','MANAGEMENT REGRETS NOTHING','YOUR REPLACEMENT IS CHEAPER'], ['PAY PER BREATH','ROYAL WASTE / PEASANT PROBLEM','YOUR MAJESTY IS A BIN'] ];
function placard(c:C,x:number,y:number,text:string,width=340) { c.save();c.translate(x,y);c.rotate(-.035);shape(c,`M${-width/2} -25 L${width/2} -21 ${width/2-6} 24 ${-width/2+4} 20Z`,'#d4bc87',INK,4);c.font='18px Bangers, sans-serif';c.textAlign='center';c.fillStyle=INK;c.fillText(text,0,6,width-20);c.restore(); }
function teeth(c:C,x:number,y:number,count:number,width:number) { for(let i=0;i<count;i++) shape(c,`M${x+i*width/count} ${y} l${width/count-3} -2 -2 ${17+i%3*7} q-8 8 -13 0Z`,'#d3c99d',INK,2); }
function pipe(c:C,x:number,y:number,r:number,t:number) { oval(c,x,y,r,r*.55,'#777861',INK,7);oval(c,x,y,r*.7,r*.34,'#242f2c');for(let i=0;i<5;i++)oval(c,x-25+i*12,y+14+(t*34+i*19)%58,5,10,'#98ab5c99'); }
// Large authored silhouettes sit behind the walkable lane. Dirt never hides attack tells.
export function drawGrimeDistrict(c:C,w:number,cam:number,stage:number,t:number) {
  const chapter=STAGES[stage],region=chapter.region,p=PALETTES[region];
  c.save();c.translate(-cam,0);
  // Grease stains and torn lane edges stay world-anchored and outside the clear central fighting strip.
  for(let k=Math.floor(cam/105)-1;k<(cam+w)/105+1;k++) {
    const xx=k*105,seed=k+region*31;
    for(const edge of [361,552]) {const yy=edge+n(seed+13)*6;if(n(seed+37)<.35)continue;oval(c,xx+n(seed)*60,yy,27+n(seed+1)*35,4+n(seed+3)*7,'#393d303d');line(c,xx,yy+3,xx+34,yy+7,'#e6d5a130',2);}
    if(k%3===0){line(c,xx,547,xx+24,536,'#4d4e3c44',2);line(c,xx+24,536,xx+44,541,'#4d4e3c44',2);}
  }
  const x=570, i=0, act=0;
  if(x+330>=cam && x-330<=cam+w) {
    c.save();c.translate(x,344);
    // Foundations, grease leaks and torn warning posters connect each building to its ground.
    oval(c,0,1,290,13,'#222c2866');
    if(region===0) {
      shape(c,'M-230 0 L-224-152 -172-180 191-167 234-116 233 0Z',fabric(c,p[0]),INK,5);
      shape(c,'M-259-151 L-225-207 212-194 257-136Z',fabric(c,p[1]),INK,5);
      for(let j=0;j<12;j++)line(c,-217+j*39,-192,-242+j*40,-147,'#3d463b',5);
      oval(c,10,-91,116,62,'#25252a',INK,7);teeth(c,-98,-133,10,215);
      shape(c,'M-62-63 Q2-95 68-57 Q76-24 43-8 -13-17-62-63Z','#987763',INK,4);stitches(c,-40,-49,93,.22);
      for(const side of [-1,1]) {line(c,side*166,-174,side*166,-274,INK,7);oval(c,side*166,-242,29,38,fabric(c,'#a69d77'),INK,4);oval(c,side*161,-237,9,15,INK);}
      for(let j=0;j<5;j++)oval(c,-190+j*89,-18,35,16,'#657146');
      placard(c,0,-190,SIGNS[region][act],385);
    } else if(region===1) {
      shape(c,'M-211 0 L-215-270 206-261 214 0Z',fabric(c,p[0]),INK,6);
      for(const side of [-1,1]) {shape(c,`M${side*101-82} -20 l0-218 162 0 0 218Z`,fabric(c,p[1]),INK,5);line(c,side*101+55,-123,side*101+55,-81,INK,8);oval(c,side*101,-160,50,45,'#43545b',INK,5);teeth(c,side*101-39,-186,4,80);}
      for(let j=0;j<10;j++)shape(c,`M${-216+j*46} -259 l33 0 -17 ${45+(j%3)*24}Z`,'#b2c3b8',INK,2);
      shape(c,'M-55-24 Q-20-92 41-50 L99-18Z','#aa8d82',INK,3);oval(c,6,-57,12,12,'#e0d4a9');oval(c,10,-57,4,5,INK);
      placard(c,0,-294,SIGNS[region][act],410);
    } else if(region===2) {
      shape(c,'M-242 0 L-235-239 228-246 239 0Z',fabric(c,p[0]),INK,6);
      for(let j=0;j<3;j++) {const xx=-150+j*151;shape(c,`M${xx-65} -13 l0-178 127 0 0 178Z`,fabric(c,p[1]),INK,4);oval(c,xx,-103,51,60,'#252d30',INK,7);pipe(c,xx,-92,40,t);line(c,xx-39,-164,xx+31,-164,'#d6bb7e',5);}
      line(c,-269,-231,262,-244,INK,5);
      for(let j=0;j<5;j++)shape(c,`M${-222+j*93} -233 l34 2 -4 49 24 15 q4 24 -24 19 l-38-22Z`,fabric(c,j%2?'#ad877c':'#98a198'),INK,3);
      placard(c,0,-272,SIGNS[region][act],390);
    } else if(region===3) {
      shape(c,'M-221 0 L-226-191 212-198 230 0Z',fabric(c,p[0]),INK,6);
      shape(c,'M-245-194 Q-210-289-145-242 Q-65-332 8-251 Q99-309 156-243 Q223-270 248-196Z',fabric(c,p[1]),INK,6);
      for(let j=0;j<10;j++)oval(c,-208+j*46,-189,22,25+j%3*12,'#aa8c70',INK,2);
      oval(c,0,-99,101,77,'#30232c',INK,7);teeth(c,-86,-148,8,175);teeth(c,-74,-51,7,153);
      for(const side of [-1,1]) {oval(c,side*160,-111,32,38,'#bcb996',INK,4);oval(c,side*160+5,-101,8,13,INK);}
      placard(c,0,-267,SIGNS[region][act],385);
    } else if(region===4) {
      for(const side of [-1,1]) {shape(c,`M${side*204-23} 0 l-9-297 60 0 -4 297Z`,fabric(c,p[1]),INK,5);for(let j=0;j<8;j++)line(c,side*204-17,-28-j*34,side*204+22,-50-j*34,'#34352e',9);}
      shape(c,'M-249-300 L249-300 243-250-245-248Z',fabric(c,p[0]),INK,6);
      line(c,-64,-250,-64,-121,'#a29c84',8);line(c,64,-250,64,-121,'#a29c84',8);
      shape(c,'M-137-142 L135-142 156-85-150-85Z',fabric(c,p[1]),INK,6);teeth(c,-136,-83,12,273);
      for(let j=0;j<5;j++)shape(c,`M${-154+j*71} -5 l-12-31 38-14 27 35Z`,fabric(c,j%2?'#80736a':'#97977d'),INK,3);
      placard(c,0,-276,SIGNS[region][act],387);
    } else {
      shape(c,'M-230 0 L-235-249 -168-261 -131-205 145-219 165-280 230-267 243 0Z',fabric(c,p[1]),INK,6);
      for(let j=0;j<7;j++)line(c,-223,-31-j*31,230,-40-j*31,'#75635455',3);
      oval(c,0,-106,88,92,'#3c3037',INK,7);teeth(c,-71,-171,7,146);
      for(const side of [-1,1]) {shape(c,`M${side*175-25} -165 l0-59 51 0 0 59Z`,INK);shape(c,`M${side*174-29} -56 l60-5 0 41 -53 0Z`,'#a96466',INK,3);}
      shape(c,'M-72-251 L-98-304-30-278 0-326 31-278 98-305 70-247Z','#b9a16a',INK,5);
      placard(c,0,-227,SIGNS[region][act],360);
    }
    // Leaks, mould, flies and discarded stuffing: stable positions prevent visual swimming.
    for(let j=0;j<15;j++){ const xx=-220+n(i*71+j)*440;line(c,xx,-17,xx+3,-40-n(j+i)*48,'#27352b44',4);oval(c,xx,-7,10+n(j)*14,3,'#34352c88'); }
    c.restore();
  }
  for(let i=Math.floor(cam/170);i<(cam+w)/170+1;i++) { const x=i*170+32,y=568+n(i+44)*18;oval(c,x,y,46,8,'#272b2966');for(let j=0;j<4;j++)oval(c,x+j*11-15,y-3,5,3,'#bbb390');shape(c,`M${x+31} ${y} l-7-17 11-8 7 23Z`,'#9f826a',INK,2); }
  c.restore();
  drawJourneyPlaces(c,w,cam,stage);
}
export function drawSetpiece(c:C,trap:Setpiece,running:boolean,t:number) {
  const s=trapState(trap), live=running&&!trap.disabled, warn=live&&s.warning, active=live&&s.active;
  c.save();c.translate(trap.x,trap.y);
  oval(c,0,0,92,40,'#252c2bc9','#151d21',4);
  for(let i=0;i<9;i++)line(c,-67+i*17,-21,-61+i*17,21,'#5b6657',4);
  if(warn||active) {
    c.setLineDash(warn?[10,6]:[]);oval(c,0,0,trap.kind==='cutter'?195:s.rx,s.ry+5,active?'#e584413d':'#f3ca5833',active?'#fff0b4':'#ffce62',4);c.setLineDash([]);
    c.fillStyle='#1e2028';c.fillRect(-106,-86,212,27);c.fillStyle='#ffe6a3';c.textAlign='center';c.font='bold 15px monospace';c.fillText(trap.kind==='press'||trap.kind==='stamp'?'MOVE TO ANOTHER LANE':'JUMP / BAIT THEM IN',0,-67);
  }
  if(active) {
    if(trap.kind==='press'||trap.kind==='stamp'){const drop=Math.min(1,s.activeAge*12);shape(c,`M-82 ${-225+drop*198} l164 0 10 48 -184 0Z`,fabric(c,trap.kind==='stamp'?'#b98476':'#a7a07c'),INK,5);teeth(c,-78,-177+drop*198,8,156);line(c,-48,-255,-48,-225+drop*198,'#73776b',8);line(c,48,-255,48,-225+drop*198,'#73776b',8);}
    else if(trap.kind==='cutter'){c.save();c.translate(s.x-trap.x,-21);c.rotate(t*13);for(let i=0;i<10;i++){c.rotate(Math.PI/5);shape(c,'M-9-27 L-3-48 14-29Z','#bfbaa2',INK,2);}oval(c,0,0,25,25,'#747e76',INK,3);oval(c,0,0,7,7,'#cf9271');c.restore();}
    else if(trap.kind==='taffy') {for(let j=0;j<6;j++){const xx=-60+j*24;line(c,xx,4,xx+Math.sin(t*8+j)*15,-55,'#ba8197',7);oval(c,xx+Math.sin(t*8+j)*15,-55,10,8,'#d1a0a6',INK,2);}}
    else for(let j=0;j<9;j++){const rise=((t*1.8+j*.13)%1);oval(c,Math.sin(j*8)*s.rx*.8,-rise*88,12+rise*13,14+rise*17,'#a1b9638a');}
  }
  if(trap.disabled){c.font='bold 12px monospace';c.textAlign='center';c.fillStyle='#b7c6a0';c.fillText('OUT OF DISORDER',0,4);}
  else {c.font='13px Bangers, sans-serif';c.textAlign='center';c.fillStyle='#ddcba2';c.fillText(TRAP_NAMES[trap.kind],0,55);}
  c.restore();
}
export function drawScars(c:C,scars:{x:number;y:number;color:string;seed:number}[],cam:number,w:number) {
  for(const scar of scars){if(scar.x<cam-70||scar.x>cam+w+70)continue;for(let j=0;j<7;j++){oval(c,scar.x+(n(scar.seed+j)-.5)*90,scar.y+(n(scar.seed+j+31)-.5)*30,4+n(j)*10,2+n(j+8)*4,'#51403c66');}stitches(c,scar.x-8,scar.y,25,.15,'#c8b98b');oval(c,scar.x+17,scar.y+2,5,3,'#d7c79d',INK,1);}
}
