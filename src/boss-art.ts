import { raisedForks } from './danger-shapes';
import {shellClosed} from './boss-defense';
import type { Actor } from './engine';
import type { PlushPose } from './plush';
import { fabric, line, oval, shape, stitches } from './plush';
type C=CanvasRenderingContext2D;
const ink='#29252f',bone='#e9dab2';
/** Six separate silhouettes. Animation reads the same states as combat and its cues. */
export function drawBoss(c:C,x:number,y:number,a:Actor,time:number,scale:number,p:PlushPose) {
 const region=p.stage??0, state=p.bossState??'idle', moment=p.moment, progress=moment?Math.min(1,moment.clock/moment.duration):0;
 const entrance=moment?.kind==='entrance',breaking=moment?.kind==='rage',falling=moment?.kind==='defeat'||p.dead!==undefined;
 const fall=moment?.kind==='defeat'?progress:p.dead!==undefined?1:0;
 const rage=!!p.enraged, wind=state==='windup'?Math.min(1,(region===4?1:.85)-(p.bossTimer??0)):0;
 const pumping=state==='inhale',moving=state==='spin',open=state==='recover'||state==='jammed';
 const breathe=Math.sin(time*3),tremor=breaking?Math.sin(time*65)*4:0,lean=open?Math.sin(time*8)*.05:wind*-.08;
 const ellipse=(xx:number,yy:number,rx:number,ry:number,fill:string,stroke=ink,lw=3)=>oval(c,xx,yy,rx,ry,fill,stroke,lw);
 const path=(d:string,color:string,texture=false,lw=3)=>shape(c,d,texture?fabric(c,color):color,ink,lw);
 const eye=(xx:number,yy:number,r:number,squint=false)=>{ellipse(xx,yy,r,squint?r*.45:r*1.08,bone);if(falling){line(c,xx-r*.45,yy-r*.3,xx+r*.45,yy+r*.3,ink,3);line(c,xx-r*.45,yy+r*.3,xx+r*.45,yy-r*.3,ink,3);}else {ellipse(xx+3,yy+2,r*.34,r*.5,ink,'');ellipse(xx+1,yy-2,2,3,'#fff','');}};
 const teeth=(xx:number,yy:number,count:number,width:number,length=18)=>{for(let i=0;i<count;i++){c.save();c.translate(xx+i*width/count,yy);c.rotate((i%3-1)*.07);shape(c,`M0 0 l${width/count-3} -1 -2 ${length+i%3*4} q-5 5 -10 0Z`,i%4===2?'#b4a37c':bone,ink,1.7);c.restore();}};
 const jaw=(xx:number,yy:number,width:number,height:number)=>{ellipse(xx,yy,width,height,'#512b3a',ink,4);ellipse(xx,yy+6,width*.86,height*.73,'#221e2c','');teeth(xx-width+5,yy-height+4,8,width*2-8,Math.min(20,height*.75));ellipse(xx+12,yy+height-9,width*.35,8,'#ba7587','');};
 const limb=(xx:number,yy:number,ex:number,ey:number,color:string,w=13)=>{line(c,xx,yy,ex,ey,ink,w+5);line(c,xx,yy,ex,ey,color,w);ellipse(ex,ey,w*.85,w*.58,color);};
 c.save();ellipse(x,y+7,scale*(region===4?95:75),scale*16,'#15252266','');c.translate(x+tremor,y-(p.z??0));c.scale(scale*a.face,scale);
 if(!moment&&p.dead!==undefined)c.globalAlpha=Math.max(0,p.dead/.85);
 if(entrance)c.translate(Math.sin(progress*Math.PI)*-18,-Math.sin(Math.min(1,progress*2)*Math.PI)*18);
 if(falling&&region!==4)c.scale(1+fall*.2,1-fall*.42);
 c.rotate(lean+(a.hurt>0?Math.sin(a.hurt*70)*.055:0));
 if(region===0) {
  // A stitched kettle-beast: hinged jaw, fleshy feet, separate pressure lid and spout.
  c.save();c.translate(-63,-93);c.rotate(breathe*.04);ellipse(-11,0,30,48,'#6f6670',ink,7);ellipse(-11,0,16,31,'#8d8d74',ink,3);c.restore();
  for(const side of [-1,1])limb(side*43,-23,side*56,-4+Math.sin(a.walk+side)*5,'#b19083',18);
  path('M-66-118 Q-86-92-71-34 Q-53 1 30-12 Q87-20 77-91 L57-123Z',rage?'#a77879':'#a09583',true,5);
  path('M54-103 Q85-108 91-151 L116-151 Q112-74 69-58Z','#c5aa94',true,4);ellipse(104,-151,15,7,'#38333b',ink,3);
  const lid=(rage?19:0)+(wind*20)+(entrance?Math.sin(progress*Math.PI*3)*14:0)+(breaking?progress*27:0)+(falling?fall*110:0);
  c.save();c.translate(falling?fall*60:0,-lid);c.rotate(falling?fall*2.3:Math.sin(time*14)*(rage?.04:.008));path('M-77-123 Q-42-159 2-150 Q51-158 78-123Z','#c1b094',true,4);ellipse(0,-157,16,9,'#73736b',ink,3);c.restore();
  eye(-28,-114,17,wind>.3);eye(17,-109,13);jaw(9,-64,52,open?21:wind>0?18:30+(a.attackTime>0?13:0));
  stitches(c,-58,-42,33,-.2);stitches(c,47,-106,57,1.6);
  for(let i=0;i<3;i++){const rise=(time*.9+i*.31)%1;if(wind>0||rage||entrance){ellipse(106+rise*17,-168-rise*50,7+rise*12,10+rise*14,'#c3d29555','');}}
  if(falling){for(let i=0;i<4;i++)ellipse(54+fall*(35+i*22),-75-i*11,9+fall*8,7+fall*9,'#b1c57e77','');}
 } else if(region===1) {
  // A huge loaf torso with kneaded fists, a rising skull and broken icicle teeth.
  for(const side of [-1,1]){limb(side*42,-30,side*58,-4,'#a0b2b2',22);limb(side*46,-117,side*(76+wind*10),-66-wind*45+Math.sin(a.walk+side)*8,'#b9c6bd',20);ellipse(side*(79+wind*10),-59-wind*45,27,26,'#d8d7bd',ink,4);stitches(c,side*79-13,-53-wind*45,25);}
  path('M-62-20 Q-91-77-53-137 Q-28-165 25-141 Q77-126 73-28 Q10 1-62-20Z',rage?'#a8b3a0':'#c8cdbb',true,5);
  for(let i=0;i<4;i++)line(c,-36,-126+i*23,-14,-133+i*23,'#8e9d90',5);
  if(rage){path('M-8-126 L15-105 -3-88 18-58 -6-18 -19-59-9-81-22-105Z','#675c65',false,3);for(let i=0;i<4;i++)eye(0,-107+i*21,5);}
  c.save();c.translate(0,-breathe*2-(entrance?progress*8:0));ellipse(0,-158,45,41,'#d8ddc6',ink,5);path('M-40-179 L-33-205 -6-188 11-213 25-186 42-190 43-165Z','#b6d1cf',false,3);eye(-19,-168,13);eye(15,-162,16);jaw(3,-138,36,18+(wind>0?wind*14:0));c.restore();
  for(let i=0;i<5;i++)ellipse(-38+i*19,-18,12,10,'#e2dbbb',ink,2);
  if(falling)for(let i=0;i<6;i++){c.save();c.translate((i-2.5)*fall*41,-(1-fall)*i*30-4);ellipse(0,0,14,11,'#ded4b3');stitches(c,-7,0,14);c.restore();}
 } else if(region===2) {
  // The drum turns independently of the cabinet; laundromat legs keep the hit body readable.
  for(const side of [-1,1])for(let i=0;i<2;i++){const foot=side*(69+i*19);limb(side*58,-47+i*16,foot,-8+Math.sin(a.walk+i*2+side)*9,'#758f88',10);}
  c.save();c.rotate(moving?Math.sin(time*24)*.06:open?Math.sin(time*13)*.025:0);
  path('M-72-156 L65-157 75-10-73-10Z',rage?'#87a79b':'#a1b9aa',true,5);
  path('M-81-158 L70-169 75-147-77-141Z','#c4c8a9',true,4);
  for(let i=0;i<4;i++){ellipse(-50+i*30,-135,8,7,i%2?'#b48f91':'#d5bf81');}
  ellipse(0,-72,57,56,'#c2c7ac',ink,5);ellipse(0,-72,46,45,pumping?'#1e2630':'#415b66',ink,4);
  c.save();c.translate(0,-72);c.rotate(moving?time*24:pumping?time*5:time*.4);for(let i=0;i<8;i++){c.rotate(Math.PI/4);path('M-7-44 L9-44 6-25-3-22Z','#bac4b2',false,2);}c.restore();
  if(pumping) {jaw(0,-72,36,32);path(`M-12-44 Q19-31 ${65+Math.sin(time*7)*12}-52 L69-32 Q14-5-15-27Z`,'#b28299',false,3);}
  if(state==='jammed'||falling){path('M-29-104 L11-103 12-63 39-50 Q39-28 7-34 L-30-68Z','#c399aa',true,3);stitches(c,-22,-95,26);}
  eye(-32,-180,16);eye(25,-179,12);path('M-57-183 L-64-201-35-191Z','#809a8f');
  if(rage){path('M58-125 L76-101 61-81 78-51 62-15 51-38 62-70 48-103Z','#d1b781');line(c,-51,-155,-74,-199,'#b6a57e',3);}
  c.restore();
  for(let i=0;i<4;i++)if(pumping||moving||entrance){const q=(time*.8+i*.23)%1;ellipse(-74+q*141,-162-q*40,4+i,4+i,'#cce6d377','#dcebd477',1);}
 } else if(region===3) {
  // Wafer wings and a layered cake abdomen; the rage state visibly sheds its frosting.
  for(const side of [-1,1]){c.save();c.scale(side,1);c.translate(37,-130);c.rotate(Math.sin(time*(moving?13:4))*.12-wind*.4);path('M0 15 Q50-73 99-49 L91 33 60 15 40 58 20 33Z','#71495d',true,4);for(let i=0;i<4;i++)line(c,8,13,82-i*12,-29+i*19,'#b47e87',3);c.restore();}
  for(const side of [-1,1])limb(side*23,-30,side*30,-2,'#8c5c71',13);
  path('M-55-26 L-49-136 Q0-178 52-136 L63-25Z','#986578',true,5);
  for(let i=0;i<3;i++){path(`M-53 ${-41-i*32} q53 18 112-1 l-3-16 q-50 15-107-2Z`,rage?'#ae9179':'#d1a29b',true,2);}
  ellipse(0,-159,50,37,rage?'#9f7771':'#c6a196',ink,4);
  if(!rage)for(let i=0;i<6;i++)ellipse(-38+i*16,-153,10,18+i%2*8,'#d6b4a0',ink,2);
  for(const side of [-1,1]){line(c,side*22,-184,side*25,-215,'#ae9370',8);ellipse(side*25,-218,6,10,'#e8b869',ink,2);eye(side*23,-168,13);}
  jaw(0,-119,36,state==='volley'?30+Math.sin(time*24)*9:26+(wind>0?12:0));path('M-29-137 l13 0-7 37Z',bone);path('M18-137 l13 0-7 37Z',bone);
  if(state==='volley'){
    // Spit crumbs while the wafer body stays braced; the jaw chatters through the serving.
    for(let i=0;i<5;i++){const q=(time*1.8+i*.2)%1;ellipse(37+q*95,-119+q*q*70,3+i%2,4,'#e3c99b',ink,1);}
  }
  if(rage)for(let i=0;i<3;i++)eye(-17+i*18,-62,6);
  // The folded wafer guard leaves the head visible; it physically opens for recovery.
  const closed=shellClosed(state)&&!falling,fold=closed?1:Math.max(0,1-(1.65-(p.bossTimer??0))*5);
  for(const side of [-1,1]){c.save();c.scale(side,1);c.translate(48,-102);c.rotate((1-fold)*-1.15);path('M0-16 L-46-8-49 60 5 69 17 44Z',closed?'#c9a677':'#ae8c72',true,3);for(let i=0;i<4;i++){line(c,-37+i*12,-1,-40+i*12,53,'#87694f',2);line(c,-40,4+i*14,4,10+i*14,'#e5c597',2);}c.restore();}
  if(closed&&!moment){ellipse(0,-167,59,48,'#ffffff00','#bdeba0',2);line(c,0,-232,0,-221,'#d3f4ad',3);}
  if(falling){ellipse(0,-3,35+fall*77,12,'#b5848f',ink,3);for(let i=0;i<5;i++)ellipse((i-2)*fall*25,-10,13,10,'#c3a294',ink,2);}
 } else if(region===4) {
  // Frank is a fleshy operator welded into a fork-jawed machine. Wheels and forks articulate.
  const burn=rage||breaking, wheel=(xx:number)=>{c.save();c.translate(xx,-11);c.rotate(moving?time*16:a.walk*.3);ellipse(0,0,25,25,'#46484b',ink,4);for(let i=0;i<8;i++){c.rotate(Math.PI/4);line(c,16,0,23,0,'#a09c85',4);}ellipse(0,0,11,11,'#8d9789',ink,3);c.restore();};
  if(falling){c.save();c.translate(-fall*85,fall*7);wheel(-49);c.restore();c.save();c.translate(fall*110,fall*7);wheel(55);c.restore();}
  path('M-75-89 L43-89 82-38 66-14-79-19Z',burn?'#ad8056':'#b49b65',true,5);
  for(let i=0;i<6;i++)line(c,-64+i*13,-67,-64+i*13,-37,'#5e6557',5);
  path('M-47-89 L-42-177 47-177 52-86Z','#697b71',true,4);path('M-58-181 L55-181 64-165-61-162Z','#b8a16d',true,4);
  ellipse(0,-127,32,36,'#ad8580',ink,4);eye(-12,-138,12);eye(13,-134,9);jaw(8,-111,23,14);path('M-30-153 Q0-186 32-153Z','#d4b478');
  limb(-23,-112,-6,-89,'#b68d81',9);limb(25,-110,14,-91,'#b68d81',9);ellipse(8,-84,21,9,'#676661',ink,4);
  const highForks=raisedForks({enraged:rage,phase:p.bossPhase??0,bossState:state});
  const fork=highForks?58+wind*10:wind*10-(moving?11:0);for(const yy of [-34,-10]){path(`M57 ${yy-67-fork} l15 0 0 55 68 0 0 12 -83 0Z`,'#b4b9a2',true,4);teeth(76,yy-fork,4,57,10);}
  // A riveted front plate and an uncovered, pulsating rear engine gland.
  if(!falling){path('M41-88 L66-83 84-39 65-34 43-60Z',open?'#8c9484':'#c5c9ae',true,3);for(const yy of [-73,-49])ellipse(61,yy,3,3,'#5c665d',ink,1);ellipse(-78,-65,18,22,'#644852',ink,3);ellipse(-80,-65,10+Math.sin(time*5)*2,15,'#c9cf88','#e3edac',2);stitches(c,-93,-66,27,.2);}
  if(!falling){wheel(-49);wheel(55);}
  if(burn)for(let i=0;i<3;i++)shape(c,`M${-68+i*16} -89 l-7-${19+(Math.sin(time*15+i)+1)*8} 15 13 9-21 7 34Z`,i%2?'#d4bd6b':'#b2644f',ink,2);
  if(open) {line(c,15,-190,42,-191,'#d9d797',2);ellipse(43,-192,4,4,'#d9d797','');}
 } else {
  // The royal body is a receipt-wrapped rubbish worm; the crown is an independent object.
  for(let i=4;i>=0;i--){const xx=-i*23-15,yy=-23+Math.sin(time*3+i)*8;ellipse(xx,yy,26,28,rage?'#79686c':'#978d7d',ink,4);path(`M${xx-15} ${yy-25} l29 2 -3 22 -8-4 -5 5 -7-4Z`,'#c7b99a',true,2);}
  path('M-53-14 L-72-109 Q-46-159 10-144 Q72-137 64-18 L40-31 18-12-4-36-26-15Z',rage?'#baa88a':'#d2c3a0',true,5);
  for(const side of [-1,1]){const hand=p.royalProtection?-142+Math.sin(time*5+side)*4:-58+wind*26;limb(side*43,-103,side*78,hand,'#918574',13);path(`M${side*78-12} ${hand} l29 6 -9 27 -21-5Z`,'#c3b08f',true,2);if(p.royalProtection){path(`M${side*78-19} ${hand-24} l38 3 -3 34 -9-4 -8 6-7-6-11 3Z`,'#e5d8b1',true,2);line(c,side*78-10,hand-13,side*78+12,hand-10,'#8f7867',2);ellipse(side*78,hand+1,6,6,'#a15361',ink,2);}}
  eye(-24,-125,16);eye(21,-116,19);jaw(7,-75,47,32+(wind>0?10:0));
  for(let i=0;i<4;i++)line(c,-48,-45+i*8,-15,-43+i*8,'#7b7364',2);
  if(rage){path('M-58-117 L-37-104 -48-82 -26-67-42-53-25-20-47-34-59-69Z','#615259',false,3);eye(-39,-85,7);}
  const crownLift=falling?fall*110:entrance?(1-progress)*70:breaking?Math.sin(progress*Math.PI)*35:0;
  c.save();c.translate(falling?fall*70:0,-crownLift);c.rotate(falling?fall*1.7:Math.sin(time*(state==='jammed'?16:2))*(state==='jammed'?.17:.025));path('M-47-156 L-59-199-28-182-4-220 21-180 56-201 47-152Z','#bf9f58',true,5);for(let i=0;i<3;i++)ellipse(-25+i*27,-169,6,8,['#b86870','#8d9f85','#a486a0'][i],ink,2);stitches(c,-38,-155,76);c.restore();
  if(falling){path(`M${-52-fall*20} -1 l${132+fall*10} 0 -33-28 -66 1Z`,'#bbac8b',true,3);}
 }
 // Recovery is a performed beat: stars orbit the head; damage throws stitches loose.
 if(open&&!falling)for(let i=0;i<3;i++){const angle=time*5+i*2.1;const xx=Math.cos(angle)*47,yy=-215+Math.sin(angle)*10;line(c,xx-4,yy,xx+4,yy,'#e4d784',2);line(c,xx,yy-4,xx,yy+4,'#e4d784',2);}
 if(a.hurt>0){line(c,-53,-136,-69,-151,'#fff0bb',4);line(c,45,-128,61,-143,'#fff0bb',4);}
 if(falling){const q=Math.min(1,fall*2);c.save();c.translate(60+q*60,-80-Math.sin(q*Math.PI)*110);c.rotate(q*5);path('M-7-10 L8-10 9 8 4 15 0 7 -4 15-9 7Z',bone,false,2);c.restore();}
 c.restore();
}
