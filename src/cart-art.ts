import type { Cart } from './engine';
import {fabric,line,oval,shape,stitches} from './plush';
type C=CanvasRenderingContext2D;
export const CARGO_NAMES=['SOUP OF THE DAY-OLD','DEAD SOFT SERVE','SOCK WITNESS PROTECTION','DESSERT HAS RIGHTS','FORKS GIVEN: ZERO','ROYAL BOWEL MAIL'] as const;
/** Loads are regional silhouettes; tilt, spills and wheels follow actual cargo motion. */
export function drawCart(c:C,q:Cart,region:number,time:number){
 const ink='#302a35',bone='#d8c59c',boost=(q.boost??0)>0,rolling=q.moving,hop=rolling?Math.sin(time*(boost?24:12))*(boost?4:1.5):0;
 const ellipse=(x:number,y:number,rx:number,ry:number,color:string,stroke=ink,lw=3)=>oval(c,x,y,rx,ry,color,stroke,lw);
 const path=(d:string,color:string|CanvasPattern)=>shape(c,d,color,ink,3);
 c.save();c.translate(q.x,q.y);ellipse(0,8,70,16,'#28263355','',0);
 if(boost)for(let i=0;i<5;i++){const phase=(time*2+i*.2)%1;c.globalAlpha=1-phase;line(c,-55-phase*105,5+i%2*8,-70-phase*105,5+i%2*8,'#d9c598',3);}c.globalAlpha=1;
 for(const x of [-40,40]){c.save();c.translate(x,0);c.rotate(q.x/15);ellipse(0,0,15,15,'#57504f',bone,4);line(c,-10,0,10,0,bone,3);line(c,0,-10,0,10,bone,3);c.restore();}
 c.save();c.translate(0,-hop);c.rotate(boost?-.05:0);
 path('M-65-26 L59-26 66-12-57-12Z','#746254');line(c,-57,-24,-76,-59,bone,6);line(c,-77,-61,-95,-59,ink,6);
 if(region===0){
  path('M-57-70 Q-64-21 0-24 Q62-20 57-70Z',fabric(c,'#8b7659'));ellipse(0,-72,59,17,'#a7aa70');ellipse(0,-75,48,11,'#667747');
  for(let i=0;i<3;i++){const x=-28+i*27;ellipse(x,-78-Math.sin(time*4+i)*3,9,7,'#c7c9a0');ellipse(x+2,-81,2,2,ink);}
  path('M37-80 l10-57 8 3-10 58Z','#a99170');ellipse(51,-137,11,19,'#796347');
 }else if(region===1){
  path('M-58-81 L45-88 60-72 53-27-57-25Z',fabric(c,'#8da3a0'));path('M-63-87 L47-96 65-79-55-70Z','#b7c5ae');
  for(let i=0;i<4;i++)path(`M${-40+i*25}-75 l6 0-3 ${15+i%2*15}-6-8Z`,'#bdd9cf');
  path('M-20-96 Q-35-109-10-122 Q-26-136 3-141 Q16-143 7-159 Q46-126 15-117 Q45-98 15-89Z','#d2b3a0');
  ellipse(-3,-117,5,7,bone);ellipse(14,-113,5,7,bone);line(c,-7,-102,14,-99,ink,3);
 }else if(region===2){
  path('M-59-99 L59-97 48-27-49-27Z',fabric(c,'#96846d'));
  for(let i=0;i<6;i++)line(c,-45+i*18,-87,-39+i*15,-36,'#514b49',3);
  path('M-47-104 Q-55-142-21-137 Q-5-163 20-133 Q64-132 45-100Z',fabric(c,'#a29c79'));
  path('M18-115 l22 0-2 37 19 11 q-5 18-28 3Z','#90778b');stitches(c,24,-106,11,.1);
  ellipse(-23,-120,8,10,bone);ellipse(-22,-119,3,4,ink);path('M-36-104 l24 0-3 10-18-2Z',ink);
 }else if(region===3){
  path('M-59-33 L-52-74 50-74 58-33Z',fabric(c,'#986878'));path('M-46-77 L-37-108 35-108 47-77Z','#bd8a8d');
  for(let i=0;i<6;i++)ellipse(-40+i*16,-72,9,12+i%2*6,'#d4baa0');
  path('M-27-62 Q0-85 27-61 L21-39-21-39Z',ink);for(let i=0;i<4;i++)path(`M${-20+i*11}-63 l9 0-2 14-6-1Z`,bone);
  line(c,0,-110,0,-144,'#b1a267',8);ellipse(Math.sin(time*9)*2,-150,6,10,'#e9ba72');
 }else if(region===4){
  path('M-57-82 L57-82 51-29-49-29Z',fabric(c,'#7c8175'));
  for(let i=0;i<5;i++){c.save();c.translate(-34+i*18,-68);c.rotate((i-2)*.18+(rolling?Math.sin(time*13+i)*.07:0));line(c,0,0,0,-61,'#c0b8a0',6);for(const dx of [-8,0,8])line(c,dx,-79,dx,-55,'#c0b8a0',4);line(c,-8,-55,8,-55,'#c0b8a0',4);c.restore();}
  path('M-36-72 L34-72 26-37-24-37Z','#a99b71');line(c,-11,-67,13,-44,ink,4);line(c,12,-67,-11,-44,ink,4);
 }else{
  path('M-59-73 Q0-111 59-73 L51-28-52-28Z',fabric(c,'#8b626f'));path('M-48-76 L-43-109-24-94 0-123 22-93 43-109 47-76Z','#b6a16b');
  path('M-17-75 Q-32-108-12-118 Q0-123 10-116 Q31-119 21-89 L16-61 3-76-8-61Z',bone);
  for(let i=0;i<3;i++)path(`M${-35+i*26}-55 l22-3-2 37-18-2Z`,'#d2bf91');
 }
 c.restore();
 c.textAlign='center';c.font='14px Bangers, sans-serif';c.lineWidth=4;c.strokeStyle=ink;c.fillStyle='#ead9aa';c.strokeText(CARGO_NAMES[region],0,-178);c.fillText(CARGO_NAMES[region],0,-178);
 const hint=q.complete?'SIGNED. SOILED. DELIVERED.':boost?'EXPRESS DISASTER!':(q.cooldown??0)>0?'AXLE COOLING':q.moving?'HEAVY FROM BEHIND →':'STAY CLOSE · HEAVY FROM BEHIND →';
 c.font='bold 11px monospace';c.strokeText(hint,0,32);c.fillStyle=boost?'#eff4a6':'#dccbaa';c.fillText(hint,0,32);
 if((q.cooldown??0)>0&&!q.complete){line(c,-34,42,34,42,ink,5);line(c,-34,42,-34+68*(1-(q.cooldown??0)/2.4),42,'#c5d394',3);}
 c.restore();
}
