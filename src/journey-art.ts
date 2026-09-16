import {EXTRA_ROUTES} from './extended-routes';
import {drawDistrict} from './district-art';
import { chapterEncounters } from './encounters';
import { STAGES } from './content';
import { fabric, line, n, oval, shape, stitches } from './plush';
type C=CanvasRenderingContext2D;
const ink='#252831';
const palettes=[['#344638','#797a51','#b79d74'],['#304756','#6f8d98','#bec6b2'],['#2c4541','#75836a','#b6a784'],['#53353f','#96715e','#d1b18d'],['#343b37','#7b7860','#b9a16f'],['#43363f','#94775e','#c8b58d']];
export const JOURNEY_PLACES=[
 ['THE ROOT OF THE PROBLEM','WEIGH YOUR SINS','SLOP DISPATCH','THE CARRION CANTEEN','KETTLE MUNICIPAL WORKS'],
 ['THE FISH-FINGER CROSSING','SOFT SERVE / HARD TIMES','DEFROST AUTHORITY','THE FROZEN ASSETS OFFICE','PROOF OF LIFE'],
 ['THE DRAIN AQUEDUCT','THE SECOND-HAND GLOVE','HAMPER FREIGHT','THE DAMP STAFF QUARTERS','EXECUTIVE PLUMBING'],
 ['LICORICE LIGAMENTS','THE JAW MOULD','DESSERT LOGISTICS','THE CHOCOLATE CONFESSIONAL','CALORIE CUSTOMS'],
 ['THE UNSAFE CROSSING','THE CUTLERY ARCHIVE','PAYROLL PURGATORY','THE SCRAP CLINIC','UNDECLARED CARGO'],
 ['THE COMPLAINT ARCHIVE','THE COURT OF OVERBITE','THE BANQUET TAX','THE COLLECTION AGENCY','HIS MAJESTY’S WAITING ROOM']
] as const;
const after=[
 ['ROOT CAUSE: VIOLENCE','INSPECTION STAFF: COMPOSTED','THE SOUP HAS ESCAPED','THE CHEF HAS FLED','PRESSURE RELIEVED. RUDELY.'],
 ['FISH HAS LEFT THE FINGERS','SERVICE TEMPERATURE: HOSTILE','DEFROSTED THE WORKFORCE','ASSETS LIQUIDATED','PROOFING CANCELLED'],
 ['PIPE DOWN. PERMANENTLY.','NO HANDS. NO REFUNDS.','FREIGHT HAS LEFT THE CHAT','STAFF ARE AIR-DRYING','MANAGEMENT HAS BEEN FLUSHED'],
 ['SUPPORT GROUP DISBANDED','DENTAL PLAN CANCELLED','DESSERT HAS BEEN SERVED','ABSOLUTELY NO ABSOLUTION','NOTHING LEFT TO DECLARE'],
 ['ACCIDENT QUOTA MET','CUTLERY IS SELF-SERVICE','EVERYONE HAS CLOCKED OUT','BEDS NOW AVAILABLE','DELIVERED TO THE FLOOR'],
 ['COMPLAINTS ARE NOW OPEN','COURT ADJOURNED BY FORCE','BANQUET REDISTRIBUTED','DEBTS WRITTEN OFF. IN TEETH.','YOUR WAIT IS OVER']
];
type Place={encounter:number;x:number;name:string};
const places=new Map<number,readonly Place[]>();
export function journeyPlaces(stage:number):readonly Place[]{
 if(places.has(stage))return places.get(stage)!;
 const chapter=STAGES[stage];if(chapter.bossStage)return [];
 const route=chapterEncounters(stage).slice(1).map((e,i)=>({encounter:i+1,x:e.x+([350,320,440,300,430][i]??350),name:JOURNEY_PLACES[chapter.region][i]??EXTRA_ROUTES[chapter.region][i-5].site}));
 places.set(stage,route);return route;
}
function box(c:C,x:number,y:number,w:number,h:number,fill:string,stroke=ink,lw=4){c.fillStyle=fill;c.fillRect(x,y,w,h);if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.strokeRect(x,y,w,h);}}
function board(c:C,x:number,y:number,text:string,w=340){c.save();c.translate(x,y);c.rotate(-.025);shape(c,`M${-w/2}-20 L${w/2}-17 ${w/2-8} 20 ${-w/2+5} 16Z`,'#c5b083',ink,3);c.font='19px Bangers, sans-serif';c.textAlign='center';c.fillStyle=ink;c.fillText(text,0,6,w-20);c.restore();}
function pipe(c:C,points:[number,number][],color:string,width=22){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.lineJoin='round';c.lineCap='round';c.strokeStyle=ink;c.lineWidth=width+8;c.stroke();c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function wheel(c:C,x:number,y:number,r:number,color:string){oval(c,x,y,r,r,color,ink,5);oval(c,x,y,r*.68,r*.68,'#29352e',color,3);for(let i=0;i<6;i++){const a=i*Math.PI/3;line(c,x,y,x+Math.cos(a)*r*.8,y+Math.sin(a)*r*.8,color,5);}oval(c,x,y,8,8,'#ba9b74',ink,2);}
function teeth(c:C,x:number,y:number,count:number,w:number){for(let i=0;i<count;i++)shape(c,`M${x+i*w/count} ${y} l${w/count-5} 0 -3 ${16+i%3*8} q-9 9-17 0Z`,'#cabfa0',ink,2);}
function sock(c:C,x:number,y:number,s:number,color:string){c.save();c.translate(x,y);c.scale(s,s);shape(c,'M-23-99 L22-94 17-27 47-10 Q62 16 27 26 L-27-8Z',fabric(c,color),ink,4);stitches(c,-16,-82,29,0);shape(c,'M-11-49 l21-4 5 27-24 2Z','#c6ae8c',ink,2);c.restore();}
function glove(c:C,x:number,y:number,s:number,color:string){c.save();c.translate(x,y);c.scale(s,s);shape(c,'M-25-92 L25-92 24-47 41-62 Q58-66 56-48 L37-14 37 19 Q32 35 20 23 L18-4 18 30 Q11 43 4 29 L3 3 0 38 Q-10 49-14 35 L-14 0-18 27 Q-30 38-34 23 L-34-18Z',fabric(c,color),ink,4);stitches(c,-21,-77,42,0);stitches(c,-16,-43,30,.5);c.restore();}
function bag(c:C,x:number,y:number,w:number,h:number,color:string){shape(c,`M${x-w/2} ${y} q-15 ${-h*.6} 7 ${-h} l${w-12} 2 q21 ${h*.5} 4 ${h}Z`,fabric(c,color),ink,4);stitches(c,x-w/2+5,y-h+13,w-10,0);oval(c,x-9,y-h*.55,6,9,'#dbd3ac',ink,2);oval(c,x+12,y-h*.5,7,8,'#dbd3ac',ink,2);}
function frame(c:C,color:string,w=650,h=270){for(const x of [-w/2,w/2])box(c,x-15,-h,30,h,color);box(c,-w/2-30,-h,w+60,29,color);}
function slips(c:C,x:number,y:number,cols:number,rows:number,color:string){for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const xx=x+i*43,yy=y+j*37;shape(c,`M${xx} ${yy} l30-2 2 25-32 3Z`,color,ink,2);line(c,xx+6,yy+7,xx+24,yy+7,'#756b59',2);line(c,xx+6,yy+14,xx+21,yy+14,'#756b59',2);}}

function woods(c:C,stop:number,p:string[]){
 if(stop===1){
  shape(c,'M-365-8 Q-327-77-314-149 Q-109-195 109-176 Q260-199 350-103 L366-5Z',fabric(c,p[1]),ink,6);
  for(let i=0;i<9;i++)line(c,-290+i*72,-30,-278+i*69,-142,'#3f4c39',6);
  oval(c,21,-84,154,82,p[0],ink,9);oval(c,27,-77,116,66,'#1e2c28',p[2],3);teeth(c,-94,-130,9,226);
  for(const side of [-1,1]){pipe(c,[[side*258,-90],[side*322,-219],[side*273,-251]],p[1],25);oval(c,side*287,-187,24,35,'#566844',ink,3);}
  board(c,0,-225,'THIS BRIDGE IS TECHNICALLY DEAD',380);
 }else if(stop===2){
  frame(c,p[1],650,285);box(c,-295,-246,215,224,p[0]);slips(c,-273,-218,4,4,p[2]);
  pipe(c,[[185,-10],[185,-204],[295,-204],[295,-88]],'#997a55',28);wheel(c,185,-156,39,'#ac925f');
  line(c,-39,-230,-39,-57,p[2],5);shape(c,'M-121-61 L49-61 17-36-90-36Z','#929177',ink,4);bag(c,-44,-64,54,76,'#9d846b');
  board(c,208,-55,'HUMAN CONTENT: TRACE',220);
 }else if(stop===3){
  box(c,-282,-175,390,151,p[0]);oval(c,-90,-175,192,56,p[1],ink,6);oval(c,-90,-186,153,28,'#374f2d');
  teeth(c,-220,-175,10,263);pipe(c,[[78,-157],[189,-157],[232,-73],[313,-73]],p[2],49);
  frame(c,p[1],690,294);line(c,-210,-270,-210,-214,p[2],6);shape(c,'M-247-215 q36-75 72 0 l-8 47-53 0Z','#b3a68c',ink,4);
  board(c,205,-204,'SOUP IS A LEGAL TERM',260);
 }else if(stop===4){
  shape(c,'M-49 0 Q-109-112-49-330 L37-354 Q12-170 91 0Z',fabric(c,p[0]),ink,7);
  for(const side of [-1,1]){pipe(c,[[side*22,-115],[side*159,-189],[side*273,-260]],p[1],29);oval(c,side*187,-187,94,27,'#6f6d48',ink,5);for(let i=0;i<6;i++)line(c,side*187-72+i*27,-182,side*187-48+i*20,-204,p[2],3);bag(c,side*180,-190,61,70,'#8e8278');}
  teeth(c,-27,-273,3,67);board(c,0,-81,'WE ONLY SERVE PEOPLE',300);
 }else{
  frame(c,p[1],730,316);for(const x of [-260,250]){box(c,x-65,-232,130,215,p[0]);oval(c,x,-232,65,29,p[1],ink,5);pipe(c,[[x,-228],[x,-304],[x/2,-304]],'#9b7850',28);wheel(c,x,-121,44,'#a58b58');}
  pipe(c,[[-165,-16],[-165,-196],[160,-196],[160,-12]],p[2],34);teeth(c,-120,-172,9,244);board(c,0,-67,'MANAGEMENT BOILS OVER →',295);
 }
}
function freezer(c:C,stop:number,p:string[]){
 if(stop===1){
  pipe(c,[[-353,-42],[-281,-192],[-64,-248],[151,-226],[346,-59]],p[2],30);
  for(let i=0;i<7;i++){const x=-260+i*83;shape(c,`M${x}-218 q-25 75-4 174 l24-1 q-12-107 20-158Z`,'#a8b8b1',ink,4);}
  shape(c,'M277-230 L376-181 313-135 253-169Z',p[1],ink,5);oval(c,318,-189,13,17,'#ded7b3',ink,3);teeth(c,294,-161,4,81);board(c,-120,-287,'MAY CONTAIN FISH',285);
 }else if(stop===2){
  box(c,-313,-239,207,221,p[0]);oval(c,-209,-200,55,27,p[2],ink,4);pipe(c,[[-207,-162],[-207,-114],[-105,-114]],p[1],35);
  for(let i=0;i<4;i++){box(c,-64+i*91,-72-i%2*42,80,65,p[1]);teeth(c,-58+i*91,-61-i%2*42,4,70);}
  frame(c,p[1],710,289);board(c,144,-225,'TAKE A NUMBER. LOSE A TOE.',330);
 }else if(stop===3){
  box(c,-337,-287,674,270,p[0]);for(const x of [-240,240]){box(c,x-63,-251,126,220,p[1]);for(let i=0;i<5;i++)line(c,x-45,-209+i*35,x+42,-213+i*35,p[2],4);}
  shape(c,'M-139 0 L-144-252 139-245 153 0Z','#172d37',ink,6);teeth(c,-131,-239,9,268);pipe(c,[[-311,-291],[-311,-338],[299,-338],[299,-256]],'#829eaa',23);
  board(c,0,-295,'EMERGENCY THAW / NOT A SPA',385);
 }else if(stop===4){
  for(let i=0;i<5;i++){c.save();c.translate(-263+i*124,0);c.rotate((i%2?.06:-.05));box(c,-53,-205-i%2*80,109,205+i%2*80,p[0]);for(let j=0;j<4+i%2;j++){box(c,-43,-44-j*48,90,36,p[1]);line(c,-13,-26-j*48,17,-26-j*48,p[2],6);}c.restore();}
  for(let i=0;i<12;i++)shape(c,`M${-316+i*52}-252 l37 0-18 ${49+i%3*19}Z`,'#b5d3d4',ink,2);board(c,0,-330,'ALL ACCOUNTS FROZEN',330);
 }else{
  shape(c,'M-332 0 L-331-171 Q-326-326 0-326 Q329-331 338-160 L340 0Z',p[1],ink,7);
  shape(c,'M-213 0 L-210-158 Q-205-244 0-243 Q213-250 219-155 L219 0Z',p[0],ink,6);
  for(let i=0;i<5;i++)bag(c,-154+i*77,-19,57,90+i%2*55,'#bcb7a1');teeth(c,-202,-190,11,408);board(c,0,-287,'DOUGH NOT ENTER',305);
 }
}
function laundry(c:C,stop:number,p:string[]){
 if(stop===1){
  frame(c,p[1],710,265);pipe(c,[[-347,-193],[347,-193]],'#8a9881',83);
  for(const x of [-225,0,225]){oval(c,x,-193,57,59,p[0],ink,7);oval(c,x,-193,35,37,'#182e2c',p[2],4);pipe(c,[[x,-137],[x,-32]],p[1],36);}
  board(c,0,-304,'WATER WITH PREVIOUS OWNERS',400);
 }else if(stop===2){
  shape(c,'M-273 0 L-266-199-181-243 217-222 284-163 284 0Z',fabric(c,p[0]),ink,6);
  for(let i=0;i<3;i++){box(c,-226+i*162,-170,133,139,p[1]);glove(c,-158+i*162,-56,.85,['#a99875','#998eaa','#b2a28a'][i]);}
  shape(c,'M-297-212 L-261-268 264-251 304-193Z',p[2],ink,5);board(c,0,-247,'BUY ONE. LOSE THE OTHER.',370);
 }else if(stop===3){
  frame(c,p[2],733,311);for(let j=0;j<2;j++){line(c,-353,-264+j*118,344,-253+j*118,p[1],8);for(let i=0;i<6;i++)sock(c,-278+i*105,-175+j*120,.77+i%2*.2,i%2?'#9585a0':'#afa682');}
  box(c,-322,-27,645,23,p[0]);board(c,0,-337,'NEXT STOP: SOMEONE ELSE’S BOTTOM',450);
 }else if(stop===4){
  for(let i=0;i<3;i++){const x=-240+i*230;box(c,x-91,-237,182,228,p[0]);for(let j=0;j<2;j++){box(c,x-75,-112-j*106,153,32,p[1]);bag(c,x,-118-j*106,125,45,'#97947c');}sock(c,x+76,-17,.48,'#bd9cac');}
  pipe(c,[[-324,-270],[333,-270]],p[2],17);board(c,0,-299,'HOT BUNKING / COLD EVERYTHING',430);
 }else{
  frame(c,p[1],700,315);for(const x of [-268,268]){pipe(c,[[x,-5],[x,-225],[x/2,-225],[x/2,-310]],'#adab8d',35);wheel(c,x,-132,38,p[2]);}
  shape(c,'M-187-57 L-199-171 175-168 160-64Z','#263832',ink,5);teeth(c,-156,-147,10,310);board(c,0,-290,'THE BOARDROOM HAS BLOCKED AGAIN',445);
 }
}
function candy(c:C,stop:number,p:string[]){
 if(stop===1){
  for(const side of [-1,1]){pipe(c,[[side*337,-10],[side*293,-247],[side*217,-309]],'#785063',34);for(let i=0;i<7;i++)line(c,side*295-13,-41-i*29,side*295+17,-52-i*29,p[2],8);}
  pipe(c,[[-320,-186],[-197,-234],[0,-112],[186,-224],[322,-177]],'#bd9294',19);
  for(let i=0;i<7;i++)line(c,-236+i*77,-178+Math.sin(i/6*Math.PI)*46,-236+i*77,-17,p[1],8);board(c,0,-281,'DO NOT EAT THE SUPPORTS',375);
 }else if(stop===2){
  frame(c,p[1],650,304);box(c,-306,-116,613,93,p[0]);
  for(const x of [-187,0,187]){oval(c,x,-148,81,51,p[2],ink,5);oval(c,x,-140,62,30,p[0],ink,3);teeth(c,x-52,-156,5,108);line(c,x,-196,x,-279,p[2],13);}
  board(c,0,-334,'MADE TO MEASURE YOUR REGRET',423);
 }else if(stop===3){
  frame(c,p[2],728,318);for(const x of [-270,270])wheel(c,x,-29,29,p[1]);
  box(c,-267,-121,536,74,p[1]);for(let i=0;i<6;i++)oval(c,-220+i*89,-139,43,42,i%2?'#b19a76':'#bd8f95',ink,4);
  pipe(c,[[0,-298],[0,-203],[-87,-179],[88,-179]],p[2],13);shape(c,'M-119-159 L127-159 93-129-85-129Z',p[0],ink,4);board(c,0,-349,'CONTENTS MAY HAVE FEELINGS',400);
 }else if(stop===4){
  for(const side of [-1,1]){box(c,side*258-58,-247,116,232,p[0]);oval(c,side*258,-247,58,25,p[1],ink,4);pipe(c,[[side*258,-179],[side*151,-179],[side*151,-18]],'#ad8171',36);}
  shape(c,'M-175-19 L-177-206 0-295 177-204 174-20Z',p[1],ink,6);shape(c,'M-115-18 L-115-181 0-244 114-181 114-18Z',p[0],ink,4);teeth(c,-97,-179,7,198);board(c,0,-323,'CONFESS YOUR INGREDIENTS',380);
 }else{
  frame(c,p[1],730,332);for(let i=0;i<9;i++)shape(c,`M${-285+i*72}-291 l43 0-8 ${139+i%3*19}-22 13Z`,p[2],ink,4);
  for(const side of [-1,1]){box(c,side*303-56,-127,112,116,p[0]);oval(c,side*303,-83,25,36,'#baa291',ink,4);teeth(c,side*303-21,-101,3,48);}
  board(c,0,-351,'DECLARE ALL EMOTIONAL BAGGAGE',442);
 }
}
function junk(c:C,stop:number,p:string[]){
 if(stop===1){
  frame(c,p[1],710,305);for(let i=0;i<3;i++){line(c,-241+i*237,-281,-241+i*237,-110,p[2],5);wheel(c,-241+i*237,-116,58,p[0]);}
  shape(c,'M-343-16 L-318-92 289-98 346-16Z',p[0],ink,5);for(let i=0;i<10;i++)box(c,-305+i*64,-73,44,34,p[1]);board(c,0,-336,'THE SHORTCUT IS MOSTLY TETANUS',445);
 }else if(stop===2){
  for(let i=0;i<4;i++){const x=-258+i*170;box(c,x-75,-223-i%2*70,153,212+i%2*70,p[0]);for(let j=0;j<4;j++){box(c,x-59,-55-j*55,120,43,p[1]);line(c,x-20,-35-j*55,x+19,-35-j*55,p[2],5);}}
  for(let i=0;i<6;i++){const x=-259+i*103;line(c,x,-237,x+9,-339,p[2],9);shape(c,`M${x-16}-342 l38-3-2 35-33 3Z`,'#abb1a1',ink,3);}board(c,0,-364,'SHARP OBJECTS / DULL STAFF',400);
 }else if(stop===3){
  box(c,-339,-274,681,257,p[0]);slips(c,-314,-237,6,5,p[2]);
  wheel(c,176,-155,111,p[1]);line(c,176,-155,134,-217,p[2],8);line(c,176,-155,235,-151,p[2],8);
  pipe(c,[[-53,-18],[-53,-292],[304,-292]],'#97845d',21);board(c,0,-317,'TIME IS MONEY. YOURS IS OURS.',428);
 }else if(stop===4){
  shape(c,'M-336 0 L-312-183 7-291 313-177 337 0Z',fabric(c,p[0]),ink,6);
  for(const x of [-214,200]){box(c,x-68,-132,136,118,p[1]);bag(c,x,-142,108,73,'#aea083');}
  pipe(c,[[-67,-14],[-67,-191],[76,-191],[76,-19]],'#b1af95',20);line(c,-21,-197,21,-197,p[2],13);line(c,0,-218,0,-175,p[2],13);board(c,0,-312,'WE ACCEPT MOST SCRAP METAL',420);
 }else{
  frame(c,p[1],735,326);for(let i=0;i<3;i++){const x=-248+i*232;box(c,x-104,-191+i%2*59,204,169-i%2*59,p[0]);for(let j=0;j<7;j++)line(c,x-87+j*28,-175+i%2*59,x-87+j*28,-36,p[1],5);slips(c,x-39,-94,2,1,p[2]);}
  line(c,251,-298,251,-229,p[2],8);shape(c,'M228-232 q-10 47 23 43 q35-4 19-31Z',p[1],ink,5);board(c,0,-351,'NOTHING TO DECLARE. MANY TEETH.',450);
 }
}
function royal(c:C,stop:number,p:string[]){
 if(stop===1){
  for(const x of [-239,221]){box(c,x-95,-289,190,271,p[0]);slips(c,x-77,-264,3,6,p[2]);}
  shape(c,'M-135-15 L-113-167 114-181 145-16Z',p[1],ink,4);for(let i=0;i<9;i++)shape(c,`M${-106+i*24}-152 l47-17 14 31-49 12Z`,p[2],ink,2);board(c,0,-324,'PLEASE FILE YOURSELF',355);
 }else if(stop===2){
  frame(c,p[1],732,309);box(c,-311,-131,625,118,p[0]);teeth(c,-281,-134,13,565);
  for(let i=0;i<5;i++){const x=-252+i*126;oval(c,x,-215,48,59,p[2],ink,4);oval(c,x+6,-211,13,22,p[0]);line(c,x,-157,x,-135,p[1],10);}
  board(c,0,-341,'GUILTY UNTIL YOU PAY',370);
 }else if(stop===3){
  frame(c,p[1],740,313);for(const side of [-1,1]){shape(c,`M${side*279-62}-278 l125 0-13 156-98 24Z`,'#ad6e78',ink,4);teeth(c,side*279-48,-150,5,96);}
  box(c,-163,-148,325,121,p[0]);oval(c,0,-148,162,48,p[2],ink,5);bag(c,0,-168,95,90,'#ab9279');pipe(c,[[163,-135],[274,-135],[274,-26]],p[2],42);board(c,0,-348,'THE KING EATS YOUR SHARE',415);
 }else if(stop===4){
  for(let i=0;i<4;i++){c.save();c.translate(-268+i*179,0);c.rotate((i-1.5)*.04);shape(c,'M-58-2 L-62-225 56-226 52-80 100-50 Q121 3 63 0Z',fabric(c,i%2?p[0]:p[1]),ink,5);for(let j=0;j<5;j++)line(c,-27,-195+j*22,29,-202+j*22,p[2],4);oval(c,15,-164,17,24,'#d0bea0',ink,3);oval(c,19,-158,6,10,p[0]);c.restore();}
  board(c,0,-291,'THE BOOT IS ON THE OTHER FACE',440);
 }else{
  frame(c,p[1],743,339);for(const side of [-1,1]){box(c,side*292-50,-268,101,252,p[2]);for(let j=0;j<7;j++)line(c,side*292-40,-29-j*34,side*292+38,-35-j*34,'#89795f',3);}
  shape(c,'M-211-14 L-214-187 0-287 217-188 213-16Z',p[0],ink,5);teeth(c,-157,-148,11,320);
  shape(c,'M-124-294 L-149-358-65-328 0-380 66-330 146-360 123-295Z',p[2],ink,5);board(c,0,-237,'YOUR AUDIENCE IS NON-REFUNDABLE',420);
 }
}
const artists=[woods,freezer,laundry,candy,junk,royal];
let scratch:HTMLCanvasElement|undefined;
function weatheredPlace(c:C,region:number,stop:number,p:string[]){
 scratch??=document.createElement('canvas');const ratio=Math.min(2,Math.max(1,Math.abs(c.getTransform().a))),width=Math.ceil(900*ratio),height=Math.ceil(430*ratio);
 if(scratch.width!==width||scratch.height!==height){scratch.width=width;scratch.height=height;}
 const q=scratch.getContext('2d')!;q.setTransform(1,0,0,1,0,0);q.clearRect(0,0,width,height);q.setTransform(ratio,0,0,ratio,450*ratio,406*ratio);
 if(stop>=6)drawDistrict(q,region,stop,p);else artists[region](q,stop,p);q.save();q.globalCompositeOperation='source-atop';
 const seed=region*101+stop*31;
 for(let i=0;i<180;i++){
  const x=-390+n(seed+i)*780,y=-370+n(seed+i+237)*365;
  oval(q,x,y,1+n(i+14)*4,1+n(i+18)*2,i%3?'#ded0a21c':'#121e2555');
  if(i%8===0)line(q,x,y,x+3,y+15+n(i)*57,region===1?'#cee4df22':'#151e2355',2+n(i+19)*4);
  if(i%13===0){line(q,x,y,x+18,y+4,'#d8caa633',1.5);line(q,x+18,y+4,x+10,y+11,'#1b252a55',2);}
 }
 const damp=q.createLinearGradient(0,-105,0,8);damp.addColorStop(0,'#172c2600');damp.addColorStop(1,region===1?'#d1e2d144':'#172c2666');q.fillStyle=damp;q.fillRect(-450,-105,900,120);
 for(let i=0;i<16;i++)oval(q,-361+n(seed+i)*722,-8-n(i+43)*26,13+n(i)*38,5+n(i+2)*9,region===3?'#4b283744':region===1?'#b4d1c955':'#51663e66');
 q.restore();c.drawImage(scratch,-450,-406,900,430);
}
/** One physical premise per stop; all foundations end above the top movement lane. */
export function drawJourneyPlaces(c:C,w:number,cam:number,stage:number){
 const chapter=STAGES[stage];if(chapter.bossStage)return;const p=palettes[chapter.region];
 c.save();c.translate(-cam,0);
 for(const place of journeyPlaces(stage)){
  if(place.x+420<cam||place.x-420>cam+w)continue;
  c.save();c.translate(place.x,344);oval(c,0,1,390,7,'#162c2766');weatheredPlace(c,chapter.region,place.encounter,p);
  for(let i=0;i<15;i++){const x=-314+n(i+place.encounter*39)*622;line(c,x,-8,x+4,-20-n(i+1)*37,'#15272255',4);oval(c,x,-5,10+n(i+7)*14,3,'#22302988');}
  // Site names belong to small physical plaques, separate from combat instructions.
  board(c,-211,-39,place.name,270);c.restore();
 }
 c.restore();
}
/** Small high-mounted lamps and a worker shutter respond to clearing each stop. */
export function drawJourneyMotion(c:C,w:number,cam:number,stage:number,t:number,clearedThrough=-1){
 const region=STAGES[stage].region;if(STAGES[stage].bossStage)return;
 for(const p of journeyPlaces(stage)){
  if(p.x+420<cam||p.x-420>cam+w)continue;
  const cleared=p.encounter<=clearedThrough;c.save();c.translate(p.x,344);
  const light=cleared?'#4e5745':Math.sin(t*3+p.encounter)>.8?'#c3bd86':'#9d9f67';
  line(c,332,-62,332,-123,'#353935',7);oval(c,332,-122,15,19,light,ink,4);
  line(c,250,-6,250,-73,'#585b46',10);box(c,223,-93,53,43,cleared?'#566257':'#26302b');
  if(cleared){for(let i=0;i<4;i++)line(c,226,-85+i*9,273,-85+i*9,'#879078',2);board(c,0,-67,after[region][p.encounter-1]??'STAFF DISMEMBERED. COME BACK NEVER.',295);}
  else {const dx=Math.sin(t*.9+p.encounter)*3;for(const x of [-10,12]){oval(c,243+x,-73,7,10,'#e4d6a5',ink,2);oval(c,243+x+dx,-72,2.5,4,ink);}}
  c.restore();
 }
}
