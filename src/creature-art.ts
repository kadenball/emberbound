import { drawBoss } from './boss-art';
import type { Actor } from './engine';
import type { PlushPose } from './plush';
import type { WeaponId } from './content';
type C=CanvasRenderingContext2D;
const ink='#302c36', bone='#fff0c5';
// Each species owns its anatomy; motion is driven by the simulation's attack phases.
export function drawCreature(c:C,x:number,y:number,a:Actor,time:number,scale:number,p:PlushPose,weapon:(c:C,w:WeaponId)=>void){
 if(p.kind==='boss'){drawBoss(c,x,y,a,time,scale,p);return;}
 const id=p.hero??p.kind??'raider', z=p.z??0,w=a.walk;
 const ellipse=(x:number,y:number,rx:number,ry:number,fill:string,stroke=ink,lw=3)=>{c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}};
 const path=(d:string,fill:string,stroke=ink,lw=3)=>{const q=new Path2D(d);c.fillStyle=fill;c.fill(q);if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke(q);}};
 const line=(x:number,y:number,xx:number,yy:number,color:string,width=3)=>{c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.stroke();};
 const limb=(x:number,y:number,xx:number,yy:number,color:string,width=13)=>{line(x,y,xx,yy,ink,width+5);line(x,y,xx,yy,color,width);ellipse(xx,yy,width*.68,width*.5,color);};
 const eye=(x:number,y:number,r=12)=>{ellipse(x,y,r,r*1.15,bone);ellipse(x+3,y+2,r*.35,r*.48,ink,'');ellipse(x+2,y-1,2,2,'#fff','');};
 const seam=(x:number,y:number,n:number)=>{line(x,y,x+n,y,ink,1.5);for(let i=4;i<n;i+=8)line(x+i-2,y-3,x+i+2,y+3,bone,1.5);};
 const mouth=(x:number,y:number,rx:number,ry:number)=>{ellipse(x,y,rx,ry,'#9c5265');ellipse(x,y+2,rx-4,Math.max(3,ry-4),'#372a35','');for(let i=0;i<6;i++){const xx=x-rx+5+i*(rx*2-10)/6;c.save();c.translate(xx,y-ry+2);c.rotate((i%3-1)*.12);path('M0 0 L8 0 7 12 2 15Z',i===2?'#d4c193':bone,ink,1);c.restore();}ellipse(x+5,y+ry-3,9,5,'#df929f','');};
 const move=p.attack?.move,elapsed=p.attack?.elapsed??0;
 const anticipation=move?Math.min(1,elapsed/move.startup):p.windup?Math.min(1,p.windup/.5):0;
 const active=move?elapsed>=move.startup&&elapsed<move.startup+move.active:a.attackTime>0;
 const progress=move?Math.max(0,Math.min(1,(elapsed-move.startup)/move.active)):1-a.attackTime/.24;
 const follow=move?Math.max(0,1-(elapsed-move.startup-move.active)/move.recovery):Math.max(0,a.attackTime/.24);
 const thrust=move?(elapsed<move.startup?-anticipation*.22:active?Math.sin(progress*Math.PI)*.38:follow*.18):p.windup?-.18:active?.28:0;
 const gait=Math.sin(w),breath=Math.sin(time*3+x*.01),hit=a.hurt>0?Math.sin(a.hurt*65)*.12:0;
 ellipse(x,y+4,scale*(id==='moss'?55:38),scale*9,'#21273255','');
 c.save();c.translate(x,y-z);c.scale(scale*a.face,scale);
 if(p.dead!==undefined)c.globalAlpha*=Math.max(0,p.dead/.85);
 if(p.downed||p.knockdown||p.nap||p.dead!==undefined){c.translate(0,-25);c.rotate(-1.5);c.translate(0,30);}
 if(p.bowling||p.roll){c.translate(0,-45);c.rotate(p.bowling?time*19:(.23-(p.roll??0))/.23*Math.PI*2);c.translate(0,45);}
 const squash=p.landing?Math.sin(Math.min(1,p.landing/.17)*Math.PI)*.23:0;
 c.scale(1+squash,1-squash);c.rotate(id==='brute'?hit*.25:thrust+hit);
 if(move?.kind==='spin'){const duration=move.startup+move.active+move.recovery;c.scale(Math.cos(elapsed/duration*Math.PI*2),1);}
 if(z>5)c.rotate(move?.kind==='slam'?.55:-.1);
 const hover=['archer','healer'].includes(id)?Math.sin(time*7+x)*8:0;
 c.translate(0,-(w?Math.abs(gait)*(id==='frost'?9:3):breath*1.4)+hover);
 const skin=p.frozen?'#a5dee3':({ember:'#e99863',frost:'#afd3e4',moss:'#9bab62',raider:'#b590a5',archer:'#bf8898',brute:'#887eb1',shield:'#db916d',bomber:'#aebc6f',charger:'#bd777b',healer:'#c39cdd',flanker:'#92ada4',boss:'#b791aa'}[id]);
 if(id==='ember'){
  c.save();c.translate(-39,-33);c.rotate(gait*.13+breath*.07);path('M8 6 Q-70 24-83-24 Q-50-8-25-39Z',skin);for(let i=0;i<4;i++)path(`M${-64+i*16} -14 l7 -15 10 19Z`,'#a6524d');c.restore();
  for(const side of [-1,1])limb(side*27,-28,side*34+gait*side*10,-7,skin,17);
  path('M-43-18 Q-61-46-45-79 Q-31-103 7-98 Q56-94 55-56 Q68-17 15-13Z',skin);
  ellipse(12,-57,49,30,skin);ellipse(13,-31,26,16,'#efc18c');seam(-8,-27,37);
  eye(-15,-94,14);eye(24,-90,11);mouth(19,-63,34,17+(active?5:0));
  path('M-34-99 L-31-119-16-102Z','#f1c386');path('M16-104 L31-119 32-97Z','#f1c386');seam(-39,-53,22);
 } else if(id==='frost'){
  for(const side of [-1,1]){const foot=gait*side*17;limb(side*14,-52,side*24+foot,-8,'#be8995',7);path(`M${side*24+foot-13} -6 l28 0 -7 -9Z`,'#e8b585');}
  ellipse(-8,-65,29,34,skin);c.save();c.translate(-15,-68);c.rotate(gait*.3+(z>0?-.8:0));path('M0-15 Q-47-5-32 30 L-16 14-7 25 9 6Z','#829bbd');c.restore();
  path('M4-68 Q43-88 11-114 Q-7-135 12-148 L32-143 Q16-128 39-108 Q56-79 20-58Z',skin);
  ellipse(24,-148,28,23,skin);eye(22,-154,17);path('M42-154 L78-140 43-130Z','#d7b4c5');mouth(53,-140,20,8+(active?4:0));
  for(let i=0;i<3;i++)path(`M${5+i*9}-168 l-9 -${18+i*5} 17 17Z`,'#829bbd');seam(-25,-61,29);
 } else if(id==='moss'){
  for(let i=0;i<5;i++){const xx=i*25-53,yy=-8+Math.sin(w+i*1.9)*6;limb(xx,-28,xx+Math.sin(w+i)*13,yy,skin,12);}
  path('M-66-20 Q-78-80-26-90 Q3-117 35-81 Q79-64 66-16 Q10 10-66-20Z',skin);
  for(let i=0;i<5;i++)ellipse(-48+i*22,-68-Math.sin(i)*14,12,14,'#677e58');
  for(const side of [-1,1]){limb(side*28,-76,side*35+Math.sin(time*4+side)*5,-111,skin,8);eye(side*35+Math.sin(time*4+side)*5,-119,15);}
  mouth(4,-48,49,27+(active?7:0));seam(-54,-24,37);ellipse(48,-24,12,9,'#bc92a0');
 } else if(id==='raider'){
  c.save();c.rotate(Math.sin(w)*.1);line(-40,-25,-78,-40,'#d59dba',7);c.restore();
  for(const side of [-1,1])for(const leg of [-1,1])limb(side*25,-28,side*38+gait*leg*11,-7,skin,8);
  ellipse(-14,-40,41,29,skin);ellipse(26,-51,30,24,skin);ellipse(8,-80,19,23,'#d5adbc');ellipse(10,-79,10,14,'#96728a');eye(33,-64,12);mouth(44,-43,24,active?21:12);path('M55-63 L69-54 55-47Z',ink);seam(-38,-42,33);
 } else if(id==='archer'){
  for(const side of [-1,1]){c.save();c.translate(-8,-92);c.rotate(side*(.3+Math.sin(time*45)*.45));ellipse(-side*29,-25,35,13,'#cde9e5aa');line(-side*4,-13,-side*52,-35,'#f2eacaaa',1);c.restore();}
  ellipse(-19,-72,18,39,skin);for(let i=0;i<4;i++)line(-33,-92+i*15,-8,-94+i*15,'#624c67',5);
  for(let i=0;i<3;i++){limb(-16+i*9,-57,-42+i*32,-20+Math.sin(time*6+i)*6,skin,3);}
  ellipse(15,-109,25,20,skin);eye(22,-111,15);path(`M34-111 L${active?108:84}-98 34-100Z`,'#eed5b1');line(4,-123,-3,-147,ink,3);ellipse(-3,-147,5,5,'#eac68a');
 } else if(id==='brute'){
  const braced=!!p.windup,load=braced?Math.max(0,1-p.windup!/.7):0;
  const swing=active?Math.min(1,a.attackTime/.3):0;
  for(const side of [-1,1]){limb(side*24,-35,side*(braced?39:27)+(braced?0:gait*side*5),-9,skin,15);ellipse(side*(braced?39:27),-6,22,9,'#645b83');}
  path('M-38-17 Q-67-84-37-119 Q0-142 39-113 Q66-86 41-19Z',skin);ellipse(0,-65,28,34,'#b0a0c8');
  // Strained back seam opens while both fists are committed in front.
  path('M-38-106 Q-58-83-43-44 L-28-51 Q-41-79-26-100Z',braced?'#637b52':'#756787');
  for(let i=0;i<5;i++){const yy=-98+i*10;line(-44,yy,-29,yy+4,braced?'#e3f1b8':'#c5b5c9',2);}
  for(const side of [-1,1]){
    const xx=braced?(p.highAttack?(side>0?55-20*load:-50):side*44-12*load):active?side*31+60*swing:side*61+thrust*35;
    const yy=braced?(p.highAttack?(side>0?-105-load*65:-60-load*45):-77-load*43):active?-23+(p.highAttack?-102:-4)*swing:-23+Math.sin(w+side)*8;
    limb(side*42,-90,xx,yy,skin,21);ellipse(xx,yy+6,27,20,skin);
    for(let k=0;k<3;k++)ellipse(xx-15+k*12,yy+11,7,8,'#a897c3');
    line(xx-18,yy-9,xx+18,yy-9,'#ded1aa',7);line(xx-10,yy-12,xx-4,yy-6,'#4d4655',3);line(xx+5,yy-12,xx+11,yy-6,'#4d4655',3);
  }
  ellipse(0,-111,37,29,skin);eye(-15,-123,10);eye(14,-119,8);mouth(5,-101,28,16+(active?7:0));path('M-28-141 L-24-153 21-152 30-133Z','#bfb8aa');
  if(braced){line(-24,-132,-7,-129,ink,4);line(8,-128,23,-132,ink,4);}
 } else if(id==='shield'){
  for(let side=-1;side<=1;side+=2)for(let i=0;i<3;i++)limb(side*23,-25,side*(40+i*10),-5-Math.abs(Math.sin(w*1.8+i))*12,skin,6);
  ellipse(-12,-52,43,45,'#6e9199');for(let i=0;i<4;i++)line(-42+i*18,-83,-44+i*18,-28,'#a8c4bd',4);ellipse(-12,-52,29,31,'#899ba3');seam(-31,-51,38);
  ellipse(30,-34,25,21,skin);limb(19,-47,24,-80,skin,5);limb(43,-42,49,-70,skin,5);eye(24,-83,10);eye(49,-73,9);mouth(35,-31,18,11);
  const claw=p.guardBroken?28:57;limb(24,-23,claw,-43+thrust*60,skin,11);path(`M${claw}-44 q-10-30 10-32 l8 20 12-15 q16 29-17 39Z`,'#dcaa7c');
 } else if(id==='bomber'){
  const inflate=p.windup?1-Math.min(1,p.windup/.65):0,retch=Math.max(0,a.attackTime/.24);
  for(let i=0;i<4;i++)for(const side of [-1,1])limb(side*30,-28-i*8,side*(48+i*5),-5+Math.sin(w*2+i)*9,skin,5);
  ellipse(-10,-55,43+inflate*13-retch*8,47+inflate*7,skin);for(let i=0;i<7;i++)ellipse(Math.sin(i*3)*(28+inflate*8)-10,-58+Math.cos(i*2)*30,6,8,'#d6b36d');
  ellipse(30,-25,25+inflate*7,20,'#857295');eye(30,-36,11);mouth(43+retch*12,-17,18+retch*8,10+inflate*6+retch*9);line(-13,-100,-9,-124,'#cfab83',7);ellipse(-9,-128,7+Math.sin(time*16)*2,8,'#efbd65');seam(-39,-68,49);
  if(p.windup){ellipse(51,-12,10+inflate*5,9+inflate*5,'#c1a082');line(50,-21,57,-29,bone,2);}
  if(retch>0){line(48,-10,78+retch*15,-7,'#bdb97b',5);for(let i=0;i<3;i++)ellipse(76+i*10+(1-retch)*22,-8+i*7,4,3,'#d6cd8e');}
 } else if(id==='charger'){
  for(const side of [-1,1])for(const leg of [-1,1])limb(side*26,-27,side*33+gait*leg*12,-5,skin,11);
  ellipse(-7,-46,49,34,skin);ellipse(35,-48,31,29,skin);ellipse(57,-44,23,19,'#d7979b');for(const yy of [-49,-39])ellipse(62,yy,5,4,ink);
  eye(35,-69,10);for(const side of [-1,1])path(`M${39+side*17}-27 q13 1 14-28 q15 36-9 42Z`,bone);path('M-13-76 L-3-103 7-75 17-100 26-76Z','#513d57');line(-52,-42,-64,-54,skin,8);seam(-37,-45,33);
 } else if(id==='healer'){
  const stitch=p.stitching, jab=active?Math.sin(Math.max(0,1-a.attackTime/.3)*Math.PI)*115:p.windup&&!stitch?-25:0;
  for(let i=0;i<7;i++){c.beginPath();c.moveTo(-34+i*11,-71);c.bezierCurveTo(-48+i*14,-33,Math.sin(time*5+i)*20-30+i*10,-24,-37+i*12,-8+Math.cos(time*4+i)*7);c.strokeStyle=ink;c.lineWidth=8;c.stroke();c.strokeStyle=i%2?'#d1b0d9':'#9f86bd';c.lineWidth=5;c.stroke();}
  path('M-50-69 Q-47-137 0-141 Q51-132 51-69 Q34-53 19-71 Q4-54-12-69 Q-29-54-50-69Z',skin);eye(-16,-103,12);eye(18,-108,16);mouth(0,-78,22,12);ellipse(0,-130,11,8,'#d7f68b');
  path('M-39-130 L-32-154 34-149 40-130Z','#eee4c7');line(-17,-140,16,-140,'#788653',4);line(0,-147,0,-134,'#788653',4);
  if(stitch){const sy=-71+Math.sin(time*22)*7;limb(20,-76,77,sy,'#d1b0d9',7);line(75,sy-16,88,sy+14,bone,3);ellipse(73,sy-19,4,6,'#647356',bone,2);}
  else if(jab||p.windup){limb(20,-75,54+jab,-51,'#d1b0d9',9);ellipse(65+jab,-49,19,14,'#e2bddb');}
  if(stitch){ellipse(0,-40,65+Math.sin(time*10)*5,22,'#bcf39122','#d8f8a0',2);}
 } else if(id==='flanker'){
  for(let i=5;i>=0;i--){const xx=-i*20+30,yy=-27+Math.sin(w+i*.9)*9;for(const side of [-1,1])limb(xx,yy,xx+side*13,yy+21+Math.sin(w*2+i+side)*5,skin,4);ellipse(xx,yy,19,22,skin);seam(xx-10,yy,20);}
  ellipse(40,-34,27,29,skin);eye(42,-47,13);mouth(54,-25,23,15);for(const side of [-1,1])line(38+side*13,-57,44+side*27,-82,skin,5);
 }
 if(p.hero){
  const arm=move?(elapsed<move.startup?-1.6*anticipation:active?-1.6+progress*3.4:follow*1.8):.25+gait*.3;
  c.save();c.translate(p.hero==='moss'?57:p.hero==='frost'?15:42,p.hero==='frost'?-76:-44);c.rotate(move?.kind==='launcher'?1.4-arm:move?.kind==='slam'?2.7:arm);
  if((!p.weapon||p.weapon==='starter') && p.hero!=='ember'){
    line(0,14,0,-65,'#a98665',7);
    if(p.hero==='moss'){path('M-24-47 Q-24-85 0-84 Q24-85 24-47Z','#c9858c');ellipse(0,-47,27,8,'#ad6375');}
    else {ellipse(0,-68,22,25,'#e3e5e0');c.beginPath();for(let a=0;a<13;a+=.12){const xx=Math.cos(a)*a*1.3,yy=-68+Math.sin(a)*a*1.3;if(a===0)c.moveTo(xx,yy);else c.lineTo(xx,yy);}c.strokeStyle='#8f92c0';c.lineWidth=4;c.stroke();}
  }else weapon(c,p.weapon??'starter');ellipse(0,3,12,10,skin);c.restore();
 }
 if(active && move){c.save();c.globalAlpha*=.65;c.lineWidth=move.kind==='light'?7:12;c.strokeStyle=move.kind==='hex'?'#c5ed9c':'#ffe7af';c.beginPath();const vertical=move.kind==='launcher';c.ellipse(20,-48,move.reach/scale,vertical?105:move.depth/scale,vertical?-.9:0,-1.4+progress*.5,1.1+progress*.5);c.stroke();c.lineWidth=3;c.strokeStyle='#fff9e4';c.stroke();c.restore();}
 if(move?.kind==='kick'){limb(12,-20,105,-38,skin,15);}
 if(p.frozen){path('M-55-3 L-58-55-35-88-12-71 20-100 53-47 56-3Z','#bdefff33','#d2f7ff',2);}
 if(a.hurt>0){c.globalAlpha*=.65;line(-28,-105,-39,-116,'#fff6d5',5);line(20,-98,35,-110,'#fff6d5',4);}
 c.restore();
}
