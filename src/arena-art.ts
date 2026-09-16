import {fabric,line,n,oval,shape,stitches} from './plush';
type C=CanvasRenderingContext2D;
export const ARENA_START=1660,ARENA_WIDTH=1220;
const ink='#24242b';
const palettes=[['#26352f','#526047','#97735b'],['#233441','#405b68','#91adb2'],['#223a38','#496258','#899471'],['#382630','#614049','#ad8570'],['#282d2a','#4e5248','#a48c5b'],['#302b38','#645052','#baa78a']];
const names=['BOIL BEFORE BURYING','USE BY: THE APOCALYPSE','CONFESS. RINSE. REPEAT.','THE CHAPEL OF CAVITIES','YOUR REPLACEMENT IS CHEAPER','FLUSH YOUR COMPLAINTS'];
const endings=['KETTLE’S OFF. MANNERS STILL MISSING.','EXPIRED. PERMANENTLY.','CYCLE CANCELLED. KEEP THE SOCK.','FREE SAMPLES. TERRIBLE IDEA.','SHIFT OVER. KEEP THE TEETH.','ROYAL FLUSH. NO REFUNDS.'];
function box(c:C,x:number,y:number,w:number,h:number,color:string,stroke=ink,lw=4){c.fillStyle=color;c.fillRect(x,y,w,h);if(stroke&&lw>0){c.strokeStyle=stroke;c.lineWidth=lw;c.strokeRect(x,y,w,h);}}
function sign(c:C,x:number,y:number,text:string,w=380){c.save();c.translate(x,y);c.rotate(-.025);shape(c,`M${-w/2} -21 L${w/2} -17 ${w/2-7} 22 ${-w/2+4} 17Z`,'#beaa7d',ink,4);c.font='20px Bangers, sans-serif';c.textAlign='center';c.fillStyle='#322c32';c.fillText(text,0,7,w-24);c.restore();}
function rivets(c:C,x:number,y:number,w:number,count=7){for(let i=0;i<count;i++)oval(c,x+i*w/(count-1),y,3,3,'#aeaa8a',ink,1.5);}
function pipe(c:C,points:[number,number][],color:string,width=20){c.strokeStyle=ink;c.lineWidth=width+8;c.lineJoin='round';c.lineCap='round';c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function tooth(c:C,x:number,y:number,s=1){c.save();c.translate(x,y);c.scale(s,s);shape(c,'M-13-15 Q-25-29-18-41 Q-6-53 0-45 Q14-54 23-39 Q28-23 16-12 L12 9 Q4 14 2-6 Q-6-1-10 11 L-16 8Z','#c8c4a0',ink,3);line(c,-13,-28,-4,-30,'#ede0b6',2);c.restore();}
function stains(c:C,region:number){for(let i=0;i<32;i++){const x=45+n(i+region*71)*1110,y=80+n(i+9)*290;c.globalAlpha=.12;oval(c,x,y,10+n(i+3)*45,3+n(i+4)*14,i%2?'#131c20':'#988766');if(i%3===0)line(c,x,y,x+4,y+35+n(i)*50,'#151b1c',3);}c.globalAlpha=1;}
function sock(c:C,x:number,y:number,s:number,color:string){c.save();c.translate(x,y);c.scale(s,s);shape(c,'M-23-80 L22-80 18-14 44 4 Q51 27 21 29 L-28 3Z',fabric(c,color),ink,4);stitches(c,-18,-65,34,0);shape(c,'M-10-42 l18-3 6 23-21 3Z','#c5af91',ink,2);c.restore();}
function stripes(c:C,x:number,y:number,w:number){box(c,x,y,w,13,'#aa9766',ink,2);c.save();c.beginPath();c.rect(x,y,w,13);c.clip();for(let xx=x-20;xx<x+w;xx+=30)shape(c,`M${xx} ${y} l14 0 13 13-14 0Z`,'#3c3d32','',0);c.restore();}

/** Static authored rooms are rendered into the existing bounded terrain cache. */
export function drawArenaBackdrop(c:C,region:number){
 const p=palettes[region];c.save();c.translate(ARENA_START,0);c.beginPath();c.rect(0,-1200,ARENA_WIDTH,2400);c.clip();
 const wall=c.createLinearGradient(0,0,0,405);wall.addColorStop(0,p[0]);wall.addColorStop(.7,p[1]);wall.addColorStop(1,p[0]);
 c.fillStyle=wall;c.fillRect(0,-1200,ARENA_WIDTH,1605);
 // Recessed wall panels and heavy framing establish an enclosed destination.
 for(let i=0;i<6;i++){box(c,30+i*204,43,187,336,p[0],p[1],3);line(c,35+i*204,69,205+i*204,69,'#c4ba9220',2);}
 box(c,0,334,ARENA_WIDTH,16,p[1],ink,3);
 c.fillStyle=fabric(c,['#9a9474','#abbac0','#8f9f8b','#b79b93','#9d9981','#aaa091'][region]);c.fillRect(0,350,ARENA_WIDTH,219);
 // Quiet, continuous floor: seams are muted and never resemble damaging markers.
 for(let x=0;x<ARENA_WIDTH;x+=110){line(c,x,407,x-22,559,'#29333320',1);line(c,x,477,x+110,477,'#29333318',1);}
 for(let i=0;i<34;i++)oval(c,n(i+50)*ARENA_WIDTH,410+n(i+7)*142,4+n(i)*8,2,'#29322b18');
 c.fillStyle=p[0];c.fillRect(0,560,ARENA_WIDTH,1600);box(c,0,560,ARENA_WIDTH,40,p[0],ink,3);
 c.save();c.globalAlpha=.17;
 for(let i=0;i<15;i++){const x=43+i*81;
  if(region===0){shape(c,`M${x} 410 l18 8-10 7-19-7Z`,'#3e4d38','',0);line(c,x,544,x+30,552,'#48503a',5);}
  if(region===1){line(c,x,414,x+29,423,'#315063',2);line(c,x+29,423,x+17,436,'#315063',2);line(c,x+29,423,x+49,420,'#315063',2);}
  if(region===2)oval(c,x,555,31,7,'#405e43');
  if(region===3){for(let j=0;j<3;j++)box(c,x+j*10,414+j%2*6,7,5,'#78574d','',0);}
  if(region===4){for(let j=0;j<3;j++)line(c,x+j*9,535,x+j*9+13,546,'#333d32',4);}
  if(region===5){box(c,x,411,67,25,'#d5cbb1','#5f5552',1);box(c,x+23,520,67,25,'#d5cbb1','#5f5552',1);}
 }
 c.restore();
 c.save();c.scale(1,.9);
 if(region===0){
  // A municipal boiler grown into a clearing, with roots threaded through copper pipes.
  for(const side of [140,1090]){shape(c,`M${side-40} 386 Q${side-15} 170 ${side-38} -30 L${side+11} -40 Q${side+2} 221 ${side+38} 386Z`,'#394339',ink,6);for(let i=0;i<4;i++)pipe(c,[[side,290+i*17],[side-50+i*28,340],[side-91+i*59,388]],'#4e5940',12);}
  pipe(c,[[0,145],[225,145],[225,302],[475,302]],'#846852',32);
  pipe(c,[[810,268],[1000,268],[1000,62],[1220,62]],'#75684f',30);
  shape(c,'M450 367 Q400 251 435 156 Q478 77 632 82 Q790 87 825 162 L845 354 Q660 401 450 367Z',fabric(c,'#776150'),ink,8);
  for(const y of [170,311]){line(c,439,y,821,y,'#a18863',13);rivets(c,461,y,335,9);}
  oval(c,630,228,106,84,'#302e2b',ink,8);oval(c,630,228,87,67,'#495044','#948769',6);
  for(let i=0;i<7;i++)line(c,568+i*20,174,568+i*20,282,'#29362f',7);
  pipe(c,[[752,121],[759,33],[874,33],[874,115]],'#978367',24);
  box(c,475,45,100,64,'#a8946f',ink,5);oval(c,525,76,28,24,'#c0b58c',ink,3);
  for(let i=0;i<3;i++){const x=283+i*66;line(c,x,31,x,190+i%2*23,'#aa9b78',3);shape(c,`M${x-24} ${190+i%2*23} l45-3 9 76-51 4Z`,fabric(c,'#a79571'),ink,4);stitches(c,x-14,245+i%2*23,30);}
  for(const x of [70,951]){box(c,x,346,109,34,'#655340');oval(c,x+56,345,52,10,'#9f8861',ink,3);for(let i=0;i<4;i++)oval(c,x+22+i*22,340,9,8,'#a9a47b');}
 }else if(region===1){
  // A freezer mortuary: labelled dough shrouds, ventilation and a shattered cold-store window.
  box(c,95,69,360,287,'#526b76',ink,8);box(c,115,88,321,248,'#233c4d','#829b9e',5);
  for(let row=0;row<3;row++){const y=126+row*91;for(let j=0;j<3;j++){const x=145+j*98;shape(c,`M${x-24} ${y+40} Q${x-40} ${y-7} ${x-7} ${y-22} Q${x+29} ${y-28} ${x+28} ${y+34}Z`,fabric(c,j%2?'#8caaa9':'#a1b4ae'),ink,3);line(c,x-15,y+6,x+20,y+2,'#e0d7b1',3);box(c,x+12,y+8,18,28,'#bcba9a',ink,1);c.font='11px monospace';c.fillStyle='#425661';c.fillText('?',x+17,y+27);}line(c,112,y+43,436,y+43,'#8b9b9c',7);}
  box(c,556,106,262,229,'#253947','#627c83',9);for(const x of [560,650,740])for(let i=0;i<5;i++)line(c,x,133+i*37,x+72,125+i*37,'#7c959040',2);
  shape(c,'M568 117 L626 179 601 192 669 239 637 260 708 322 M781 115 L722 174 735 185 681 223 M812 265 L742 248 718 266','#ffffff00','#acc3c3',3);
  box(c,899,52,230,236,'#536c75',ink,7);oval(c,1014,166,97,96,'#253d49','#8ba1a2',7);oval(c,1014,166,29,29,'#657d84',ink,4);
  for(let i=0;i<9;i++){const x=92+i*43;shape(c,`M${x} 63 l30 0-13 ${27+i%3*16}Z`,'#9dbab8','#425965',2);}
  for(let i=0;i<6;i++)shape(c,`M${902+i*35} 288 l23 0-13 ${24+i%3*10}Z`,'#99b8ba','#354c5a',2);
  pipe(c,[[886,334],[1097,334],[1097,365]],'#627e86',15);
 }else if(region===2){
  // A drowned laundry shrine, with mismatched drums and enormous votive socks.
  for(let i=0;i<3;i++){const x=111+i*145,y=115+(i%2)*39;box(c,x-53,y-55,120,244,['#637b70','#828d6e','#526e69'][i],ink,6);oval(c,x+7,y+72,47,62,'#233a3b','#99a08a',9);oval(c,x+7,y+72,32,44,'#315451');box(c,x-29,y-30,67,21,'#273e3b',ink,2);for(let j=0;j<3;j++)oval(c,x-20+j*25,y+1,6,6,j===0?'#aa7d6c':'#aba179',ink,2);}
  pipe(c,[[550,367],[550,78],[794,78],[794,355]],'#7b8e79',35);
  pipe(c,[[823,195],[1087,195],[1087,28]],'#6b8074',25);
  oval(c,675,228,92,106,'#2b4441','#8b9b80',10);oval(c,675,228,68,79,'#263a3b','#4d6d62',5);
  for(const [x,y,s,color] of [[920,260,1.6,'#9d817e'],[1050,323,1.2,'#8da293'],[843,131,.7,'#b8ad83']] as [number,number,number,string][]){line(c,x,19,x,y-80*s,'#b9b28c',3);sock(c,x,y,s,color);}
  box(c,40,354,1130,32,'#263d37','#506e54',6);for(let i=0;i<12;i++)oval(c,80+i*91,369,24,6,'#708459');
  sign(c,669,119,'LOST SOCKS / FOUND RELIGION',234);
 }else if(region===3){
  // A candy chapel: broken sugar glass, wafer buttresses, syrup vats and tooth candles.
  shape(c,'M411 360 L411 155 Q590-74 780 155 L780 360Z','#251e2a','#876556',14);
  const panes=['#5c4253','#87734e','#795154','#50675b'];
  for(let i=0;i<6;i++){const x=431+i*55;shape(c,`M${x} 322 L${x} ${166-Math.sin(i/5*Math.PI)*100} l47-5 0 ${167+Math.sin(i/5*Math.PI)*100}Z`,panes[i%4],'#30262c',5);}
  tooth(c,597,234,2.6);line(c,597,85,597,146,'#b69b69',5);
  for(const x of [286,869]){shape(c,`M${x-42} 378 L${x-25} 112 ${x+2} 64 ${x+33} 118 ${x+44} 378Z`,fabric(c,'#856550'),ink,5);for(let i=0;i<9;i++)line(c,x-29,139+i*25,x+30,150+i*25,'#bd9666',3);for(let i=0;i<3;i++)line(c,x-19+i*20,135,x-21+i*24,375,'#a98561',2);}
  for(const x of [114,1090]){oval(c,x,231,65,104,'#705342',ink,6);oval(c,x,158,58,21,'#9b7859',ink,4);pipe(c,[[x,297],[x,363],[x+(x<600?81:-81),363]],'#947059',17);line(c,x-51,211,x+51,211,'#a38663',7);}
  for(const side of [95,880]){box(c,side,329,204,26,'#64434b',ink,5);for(let i=0;i<5;i++)line(c,side+17+i*39,299,side+17+i*39,333,'#76594c',8);}
  line(c,451,14,450,54,'#ab946d',4);line(c,739,12,744,52,'#ab946d',4);pipe(c,[[450,52],[489,69],[703,69],[744,52]],'#967a56',11);
  for(let i=0;i<6;i++)tooth(c,483+i*46,105,.65);
 }else if(region===4){
  // A compactor bay with a suspended magnetic load, rear conveyor and an abandoned punch clock.
  for(const x of [45,1110]){box(c,x,10,61,368,'#8f805a',ink,7);for(let i=0;i<11;i++)shape(c,`M${x+5} ${30+i*32} l50 13 0 16-50-13Z`,'#393e35','',0);}
  box(c,26,29,1152,47,'#5c6451',ink,7);rivets(c,59,52,1084,21);
  box(c,125,141,370,178,'#343c34','#75806a',8);for(let i=0;i<8;i++)line(c,143,159+i*20,476,159+i*20,'#566151',8);
  box(c,528,307,530,58,'#2b332d','#6b7460',7);for(let i=0;i<10;i++)oval(c,552+i*52,336,19,21,'#616851',ink,4);
  for(let i=0;i<7;i++){const x=565+i*66;shape(c,`M${x-19} 299 l-12-38 35-22 31 23-4 39Z`,fabric(c,i%2?'#8f765d':'#778071'),ink,4);}
  box(c,954,97,104,134,'#796b55',ink,6);oval(c,1006,140,32,32,'#aca584',ink,4);line(c,1006,140,993,123,'#463e38',4);line(c,1006,140,1026,144,'#463e38',3);box(c,975,191,64,14,'#302f2d',ink,2);
  stripes(c,127,372,965);sign(c,308,193,'0 DAYS WITHOUT A FLATTENING',310);
 }else{
  // A royal bathroom built from tissue and cardboard, with a monumental porcelain throne.
  for(const side of [174,1045]){box(c,side-61,87,122,275,'#9d9180',ink,5);oval(c,side,88,62,23,'#d0c6a5',ink,5);oval(c,side,88,20,10,'#6e625c',ink,3);for(let y=124;y<355;y+=30)line(c,side-56,y,side+55,y+3,'#c8bea02f',2);shape(c,`M${side-55} 127 l-8 117 40 13 13-12 10 14 18-13 25 4-5-128Z`,fabric(c,'#c5bda3'),'#81726b',2);}
  shape(c,'M452 358 Q393 330 442 288 L477 276 463 131 Q600 69 741 130 L727 276 Q811 321 749 354Z',fabric(c,'#a6a795'),ink,9);
  box(c,477,129,249,118,'#a9a38e','#484342',6);box(c,460,110,281,27,'#c2b99b',ink,5);line(c,680,156,710,156,'#716453',8);
  oval(c,596,287,150,65,'#beb7a0',ink,8);oval(c,596,284,119,43,'#514e48','#8d8f79',6);oval(c,596,289,90,24,'#777f56');
  for(const x of [366,831]){pipe(c,[[x,373],[x,112],[x+(x<600?63:-63),112]],'#8e7658',17);box(c,x-31,350,62,27,'#74565b',ink,4);}
  for(let i=0;i<7;i++){const x=345+i*77;shape(c,`M${x} 21 l65 0-8 62-19-8-12 9-13-7-10 10Z`,fabric(c,'#aa9e86'),'#69565b',2);c.font='12px monospace';c.fillStyle='#6c4b52';c.fillText('DUE',x+15,44);}
  tooth(c,596,86,1.2);sign(c,596,191,'HIS MAJESTY’S LAST RESORT',218);
 }
 stains(c,region);sign(c,610,21,names[region],480);c.restore();
 // An open threshold, not a fake wall across the walkable lane.
 box(c,0,-80,28,428,p[2],ink,6);box(c,1189,-80,31,428,p[2],ink,6);
 stripes(c,0,337,ARENA_WIDTH);c.restore();
}

/** Motion stays behind the characters and is visual only; combat hazards keep their own shapes. */
export function drawArenaMotion(c:C,region:number,time:number,defeated=false){
 c.save();c.translate(ARENA_START,0);c.scale(1,.9);const t=defeated?0:time;
 if(region===0){for(let i=0;i<7;i++){const q=(t*.25+i/7)%1;oval(c,874+Math.sin(q*8+i)*14,108-q*99,9+q*17,10+q*23,'#b8b89122');}line(c,525,76,525+Math.cos(t*2)*18,76-Math.sin(t*2)*16,'#684c40',3);}
 if(region===1){c.save();c.translate(1014,166);c.rotate(t*1.4);for(let i=0;i<4;i++){c.rotate(Math.PI/2);shape(c,'M13-7 Q58-60 79-24 Q87 6 19 14Z','#67838b','#344d5b',3);}c.restore();for(let i=0;i<7;i++){const x=577+i*31,y=129+(t*24+i*29)%183;line(c,x,y,x+15,y-7,'#b6cfcd44',2);}}
 if(region===2){c.save();c.translate(675,228);c.rotate(t*.65);for(let i=0;i<3;i++){c.rotate(Math.PI*2/3);sock(c,0,22,.48,['#ac8794','#a9b398','#ab9878'][i]);}c.restore();for(let i=0;i<8;i++)oval(c,72+(t*32+i*147)%1090,365,8+i%3*4,4,'#adba882e');}
 if(region===3){for(const x of [179,1025])for(let i=0;i<3;i++){const y=250+(t*32+i*36)%117;oval(c,x,y,4,10,'#bd926455');}for(let i=0;i<6;i++)oval(c,483+i*46,58,3,6+Math.sin(t*8+i)*2,'#d8b87988');}
 if(region===4){const sway=Math.sin(t*.7)*17;c.save();c.translate(739+sway,0);pipe(c,[[-34,71],[-34,137],[34,137],[34,71]],'#b0aa88',5);shape(c,'M-77 134 L77 134 83 158 42 177-47 175-85 154Z','#88785d',ink,6);for(let i=0;i<4;i++){c.save();c.translate(-52+i*34,187+i%2*22);c.rotate((i-1.5)*.19);box(c,-21,-18,43,34,['#7d897b','#9a8668'][i%2],ink,3);oval(c,-15,21,9,9,'#454e42',ink,3);oval(c,15,21,9,9,'#454e42',ink,3);c.restore();}c.restore();}
 if(region===5){for(let i=0;i<6;i++){const q=(t*.36+i/6)%1;oval(c,551+i*19,286-q*17,3+q*6,3+q*4,'#a5ad7740');}for(const side of [-1,1]){line(c,596+side*143,315,596+side*(158+Math.sin(t*2)*3),360,'#838b6255',7);}}
 if(defeated)sign(c,610,82,endings[region],445);
 c.restore();
}

export function drawArenaForeground(c:C,cam:number,w:number,offset:number,region:number){
 const left=Math.max(0,ARENA_START-cam),right=Math.min(w,ARENA_START+ARENA_WIDTH-cam);if(right<=left)return;
 const y=599+Math.max(0,offset)*.7;c.save();c.beginPath();c.rect(left,y-13,right-left,1200);c.clip();
 c.fillStyle=palettes[region][0];c.fillRect(left,y,right-left,1200);line(c,left,y,right,y,palettes[region][1],14);
 for(let x=ARENA_START+30;x<ARENA_START+ARENA_WIDTH;x+=169){const xx=x-cam;if(xx<left-60||xx>right+60)continue;pipe(c,[[xx,y+60],[xx,y+13],[xx+57,y+13]],palettes[region][1],18);stitches(c,xx+72,y+27,55,.03,'#9b967255');}c.restore();
}
