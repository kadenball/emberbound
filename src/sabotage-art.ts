import { machineZones, WORKPLACES, type Sabotage } from './sabotage';
import { fabric, line, oval, shape, stitches } from './plush';
type C = CanvasRenderingContext2D;
const ink = '#312f39';
function plate(c: C, text: string, x: number, y: number, width = 250) {
  c.fillStyle = '#ead9b3'; c.strokeStyle = ink; c.lineWidth = 4;
  c.fillRect(x-width/2,y-23,width,34); c.strokeRect(x-width/2,y-23,width,34);
  c.font = '19px Bangers, sans-serif'; c.textAlign = 'center'; c.fillStyle = ink; c.fillText(text,x,y,width-12);
}
// Background machinery ends above the feet. Its dangerous parts are drawn separately
// after actors, with exactly the same ellipses and moving positions as collision.
export function drawWorkplace(c: C, m: Sabotage, time: number) {
  const def = WORKPLACES[m.region], broken = m.phase === 'wrecked', running = m.phase === 'running';
  c.save();
  line(c,m.controlX,m.controlY+8,m.x,352,'#211f28',9);
  line(c,m.controlX,m.controlY+8,m.x,352,running?'#f5d686':'#8d846e',4);
  c.translate(m.x,348);
  oval(c,0,12,168,26,'#201e2d55');
  if (broken) { c.translate(0,38); c.rotate(m.region % 2 ? .16 : -.12); }
  else if (running) c.translate(Math.sin(time*53)*3, Math.cos(time*37)*2);
  if (m.region === 0) {
    // An inspector living in a tea urn. His rubber stamp approves the wreck.
    shape(c,'M-104 0 L-119-113 Q-103-182 0-181 Q112-178 113-109 L99 0Z',fabric(c,'#a0a67c'),ink,6);
    shape(c,'M110-123 Q183-146 154-78 L109-52 112-84 Q138-92 128-104Z','#b8b78d',ink,6);
    const lid = running ? Math.sin(Math.min(1,m.clock/2.8)*Math.PI)*62 : 0;
    oval(c,0,-179-lid,99,20,'#d4c49c',ink,5); oval(c,0,-204-lid,26,18,'#706d61',ink,5);
    oval(c,-32,-119,25,27,'#eee3bc',ink,4); oval(c,32,-121,19,24,'#eee3bc',ink,4);
    oval(c,broken?-40:-26,-117,6,9,ink); oval(c,broken?38:29,-119,6,9,ink);
    shape(c,'M-49-70 Q0-39 50-71 L41-39 Q0-11-41-38Z',ink);
    for(let i=0;i<6;i++)shape(c,`M${-39+i*13}-66 l11 0 -3 20 -8-3Z`,'#ead9ae',ink,1);
    line(c,-80,-55,-139,-100,'#737955',15);line(c,-139,-100,-172,broken?8:-108,'#737955',12);
    c.save();c.translate(-173,broken?8:-108);c.rotate(broken?-.3:.2);plate(c,broken?'PASSED':'INSPECTED',0,0,104);c.restore();
  } else if (m.region === 1) {
    shape(c,'M-116 0 L-121-219 97-229 118 0Z',fabric(c,'#9eafb0'),ink,6);
    shape(c,'M-97-198 L76-204 89-28-90-24Z','#435467',ink,5);
    for(let i=0;i<5;i++)shape(c,`M${-93+i*36}-198 l30 0 -13 ${35+i%3*21}Z`,'#c4e2dd',ink,2);
    oval(c,-3,-99,65,72,fabric(c,'#c3c3a0'),ink,5);
    oval(c,-29,-117,13,18,'#f4e6bd',ink,3);oval(c,20,-111,20,24,'#f4e6bd',ink,3);
    line(c,-33,-121,-24,-110,ink,4);line(c,15,-117,25,-106,ink,4);
    shape(c,'M-45-71 Q-5-89 47-67 L34-41-35-43Z',ink);stitches(c,-43,-71,84,.03);
    const door = broken ? .18 : running ? .2+Math.abs(Math.cos(m.clock*2.8))*.7 : 1;
    shape(c,`M-121-219 l${-58*door}-13 0 223 ${58*door} 9Z`,'#a7bdb7',ink,5);
    line(c,-111,-83,-158,broken?7:-97,'#d5d9cd',13);
    plate(c,'DEFROST THE DECEASED',0,-249,256);
  } else if (m.region === 2) {
    shape(c,'M-95-96 L-105-205 Q0-232 97-201 L93-87Z',fabric(c,'#b4b9a1'),ink,6);
    oval(c,0,-108,137,53,'#d0d0af',ink,6);oval(c,0,-113,99,29,'#414b41',ink,5);
    shape(c,'M-115-83 Q-92-25-33-27 L-44 0 52 0 43-33 Q109-51 118-89Z',fabric(c,'#c2c4a7'),ink,6);
    for(let i=0;i<4;i++){
      const angle=running?m.clock*7+i*1.57:0,xx=running?Math.cos(angle)*58:-49+i*34,yy=running?-113+Math.sin(angle)*13:-122-i%2*8;
      if(!broken){oval(c,xx,yy,18,15,['#9cab77','#aa879b','#c5ad89'][i%3],ink,2);line(c,xx-6,yy-1,xx+4,yy+1,ink,3);}
    }
    line(c,63,-183,112,-188,'#d8c097',12);oval(c,114,-187,13,10,'#e9d7b2',ink,3);
    plate(c,'PLEASE FLUSH YOUR STAFF',0,-247,268);
  } else if (m.region === 3) {
    shape(c,'M-150 0 L-124-30 122-30 153 0Z','#957577',ink,5);
    for(let i=0;i<3;i++){const y=-37-i*55,w=113-i*32;oval(c,0,y,w,20,'#c9a49c',ink,5);shape(c,`M${-w} ${y} Q0 ${y+49} ${w} ${y} L${w-12} ${y+23} Q0 ${y+48} ${-w+12} ${y+23}Z`,'#866256',ink,4);}
    line(c,0,-23,0,-188,'#957764',24);oval(c,0,-198,32,32,fabric(c,'#d6b090'),ink,5);
    oval(c,-12,-204,10,12,'#f1dcb8',ink,2);oval(c,12,-202,10,12,'#f1dcb8',ink,2);oval(c,0,-183,14,10,ink);
    if(running)for(let i=0;i<7;i++){const t=(m.clock*2+i/7)%1;oval(c,Math.sin(i*2.7)*t*125,-183-95*Math.sin(t*Math.PI)+t*155,6+t*6,10,'#c29980',ink,2);}
    for(const x of [-139,139]){line(c,x,0,x,-150,'#a7977a',14);shape(c,`M${x-10}-152 Q${x-19}-178 ${x}-186 Q${x+18}-173 ${x+10}-152Z`,'#dabc77',ink,3);}
    plate(c,'DO NOT LICK THE FONT',0,-258,260);
  } else if (m.region === 4) {
    shape(c,'M-158 0 L-155-207 142-207 156 0 111 0 103-167-104-167-111 0Z',fabric(c,'#a69567'),ink,6);
    for(const x of [-137,126])for(let i=0;i<5;i++)line(c,x-10,-34-i*28,x+12,-46-i*28,'#34383a',9);
    oval(c,0,-218,50,42,'#c6b98a',ink,5);oval(c,0,-218,34,29,'#e8ddba',ink,3);
    const tick=running?m.clock*16:0;
    line(c,0,-218,Math.cos(tick)*20,-218+Math.sin(tick)*20,ink,4);line(c,0,-218,-13,-233,ink,4);
    line(c,-41,-116,39,-116,'#596563',10);plate(c,broken?'YOU ARE FIRED':'TIME IS TEETH',0,-100,186);
  } else {
    shape(c,'M-152 0 L-144-213-109-238-77-199 83-199 112-244 145-212 156 0 119 0 111-162-110-162-116 0Z',fabric(c,'#99828b'),ink,6);
    shape(c,'M-68-238 L-75-283-32-254 0-294 28-255 72-283 64-238Z','#c6af79',ink,5);
    line(c,0,-197,0,-83,'#bba17f',22);plate(c,'DENIED',0,-63,213);
    for(const x of [-131,131])stitches(c,x,-154,111,Math.PI/2);
  }
  // Dirt and loose seams belong to the object, rather than a screen-wide filter.
  for(let i=0;i<9;i++)oval(c,-91+i*22,-12-(i*37)%93,3+i%4,5+i%6,'#332f3544');
  if(broken){shape(c,'M-72-158 L-23-122-51-78 21-39-2 4','#00000000',ink,7);plate(c,def.payoff,0,50,322);}
  c.restore();
}
export function drawMachineDisaster(c: C, m: Sabotage, time: number) {
  const def = WORKPLACES[m.region];
  for(const z of machineZones(m)) {
    if(!z.warning && !z.active)continue;
    c.save();
    // The complete travel corridor is visible before the roller/rinse starts.
    if(z.warning && (m.region===2||m.region===4)) {
      c.fillStyle='#f3c97e16';c.strokeStyle='#f8d38c';c.lineWidth=2;c.setLineDash([10,7]);
      c.fillRect(m.x-210-z.rx,z.y-z.ry,525+z.rx*2,z.ry*2);c.strokeRect(m.x-210-z.rx,z.y-z.ry,525+z.rx*2,z.ry*2);c.setLineDash([]);
      c.setLineDash([12,8]);line(c,m.x-210,z.y,m.x+315,z.y,def.color,4);c.setLineDash([]);
      for(let i=0;i<5;i++)shape(c,`M${m.x-175+i*105} ${z.y-8} l13 8 -13 8`,'#f4d491',ink,1);
    }
    c.setLineDash(z.warning?[9,6]:[]);
    oval(c,z.x,z.y,z.rx,z.ry,z.warning?'#f3c97e25':'#e6816555',z.warning?'#f8d38c':def.color,3);
    c.setLineDash([]);
    if(z.warning){c.font='15px Bangers, sans-serif';c.textAlign='center';c.fillStyle='#fff0c3';c.fillText(def.label,z.x,z.y-5);}
    if(z.active){
      if(m.region===0){for(let i=0;i<5;i++)oval(c,z.x+Math.sin(time*9+i)*36,z.y-22-i*22,13+i*5,22,def.color+'99',ink+'44',2);}
      else if(m.region===1){for(let i=0;i<3;i++)shape(c,`M${z.x-49+i*37} ${z.y-143} l31 8 -12 133Z`,def.color,ink,3);}
      else if(m.region===2){for(let i=0;i<6;i++)oval(c,z.x+Math.sin(time*17+i)*16,z.y-65+i*25,28,22,'#b9cbaaaa',ink+'88',2);}
      else if(m.region===3){oval(c,z.x,z.y,z.rx-5,z.ry-4,'#ad806ecc',ink,3);for(let i=0;i<5;i++)oval(c,z.x-59+i*29,z.y-9+Math.sin(time*9+i)*6,9,8,def.color,ink,2);}
      else if(m.region===4){shape(c,`M${z.x-48} ${z.y-99} l91 0 0 104 -91 0Z`,'#85918c',ink,6);oval(c,z.x,z.y-100,46,15,'#bdbaa0',ink,5);oval(c,z.x,z.y+5,46,15,'#5b6561',ink,5);for(let i=0;i<5;i++){const xx=z.x+Math.sin(time*15+i*1.25)*37;line(c,xx,z.y-91,xx,z.y-6,'#343e3b',6);}}
      else {shape(c,`M${z.x-z.rx} ${z.y-79} l${z.rx*2} 0 0 95 -${z.rx*2} 0Z`,'#b7988b',ink,6);plate(c,'DENIED. ALSO: BONK.',z.x,z.y-23,320);}
    }
    c.restore();
  }
}
