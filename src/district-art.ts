import {fabric,line,oval,shape,stitches} from './plush';
type C=CanvasRenderingContext2D;
const ink='#252831',bone='#c5b99b',rust='#82584b',slime='#687a43';
function box(c:C,x:number,y:number,w:number,h:number,color:string){c.fillStyle=color;c.fillRect(x,y,w,h);c.strokeStyle=ink;c.lineWidth=5;c.strokeRect(x,y,w,h);}
function tube(c:C,x:number,y:number,w:number,h:number,color:string){box(c,x-w/2,y-h,w,h,color);oval(c,x,y-h,w/2,18,color,ink,4);oval(c,x,y,w/2,14,color,ink,4);}
function chain(c:C,x:number,y:number,h:number){line(c,x,y,x,y+h,bone,3);for(let j=0;j<h;j+=14)oval(c,x,y+j,4,8,'#0000',ink,2);}
function tooth(c:C,x:number,y:number,s=1){c.save();c.translate(x,y);c.scale(s,s);shape(c,'M-20-33 Q-29-54-5-49 Q17-61 25-35 L15 13 2-5-9 13Z',bone,ink,3);c.restore();}
function organ(c:C,x:number,y:number,s=1){c.save();c.translate(x,y);c.scale(s,s);shape(c,'M0-24 Q-42-59-47-17 Q-49 16-9 32 Q41 20 37-9 Q35-44 0-24Z',fabric(c,'#95616e'),ink,4);line(c,-7,-23,-10,17,'#513d49',4);stitches(c,0,-6,23,.5);c.restore();}
function rib(c:C,x:number,y:number,s=1){c.save();c.translate(x,y);c.scale(s,s);line(c,0,-90,0,20,bone,10);for(let i=0;i<4;i++)for(const side of [-1,1]){c.beginPath();c.moveTo(0,-80+i*23);c.quadraticCurveTo(side*75,-95+i*23,side*53,-48+i*23);c.strokeStyle=ink;c.lineWidth=14;c.stroke();c.strokeStyle=bone;c.lineWidth=8;c.stroke();}c.restore();}
function gear(c:C,x:number,y:number,r:number){oval(c,x,y,r,r,rust,ink,6);for(let i=0;i<12;i++){const a=i*Math.PI/6;line(c,x+Math.cos(a)*r*.8,y+Math.sin(a)*r*.8,x+Math.cos(a)*(r+12),y+Math.sin(a)*(r+12),bone,9);}oval(c,x,y,r*.3,r*.3,ink,bone,4);}
function bed(c:C,x:number,y:number){box(c,x-85,y-25,170,23,bone);for(const side of [-1,1])line(c,x+side*76,y-1,x+side*76,y+30,rust,9);organ(c,x,y-45,.8);shape(c,`M${x-67} ${y-51} q57-23 111 5 l-5 22-104-4Z`,fabric(c,'#75847a'),ink,3);}
function crown(c:C,x:number,y:number,s=1){c.save();c.translate(x,y);c.scale(s,s);shape(c,'M-61 5 L-74-55-26-26 0-72 30-26 70-54 57 5Z','#aa9160',ink,5);for(const xx of [-40,0,40])oval(c,xx,-9,7,10,'#804453',ink,2);c.restore();}
/** Eighteen physical destinations, each built around its own material and purpose. */
export function drawDistrict(c:C,region:number,stop:number,p:string[]){
 const n=stop-6;
 if(region===0){
  if(n===0){ // A butcher operating inside a split root, with hanging picnic cuts.
   shape(c,'M-368 0 Q-302-104-349-279 L-284-358 Q-166-308-95-162 Q-8-88 356-3Z',fabric(c,p[0]),ink,7);
   line(c,-277,-306,303,-274,rust,17);for(let i=0;i<5;i++){const x=-220+i*115;chain(c,x,-292,60+i%2*50);organ(c,x,-181+i%2*47,.9);}
   box(c,-89,-68,418,50,p[1]);tooth(c,234,-71,1.6);
  }else if(n===1){ // Rotten stacked motel rooms, each occupied by a toothy larva.
   for(let j=0;j<2;j++)for(let i=0;i<3;i++){const x=-305+i*213,y=-161-j*164;box(c,x,y,192,147,p[0]);oval(c,x+95,y+77,67,42,slime,ink,5);for(let k=0;k<4;k++)line(c,x+54+k*23,y+48,x+48+k*23,y+98,p[1],5);tooth(c,x+112,y+110,.55);}
   line(c,-354,-12,349,-12,rust,18);chain(c,348,-326,318);
  }else{ // Rib-organ compost cathedral.
   shape(c,'M-358 0 L-308-136-217-293 0-371 231-288 331-121 359 0Z',fabric(c,p[0]),ink,7);
   for(let i=0;i<7;i++)tube(c,-260+i*87,-32,57,135+Math.sin(i/6*Math.PI)*151,slime);
   rib(c,0,-105,1.45);for(const x of [-278,277])organ(c,x,-20,1.1);
  }
 }else if(region===1){
  if(n===0){ // Refrigerated body drawers; pulled trays project into the room.
   box(c,-347,-329,693,316,p[0]);for(let j=0;j<3;j++)for(let i=0;i<3;i++){const x=-325+i*223,y=-306+j*96;box(c,x,y,200,76,p[1]);line(c,x+75,y+34,x+125,y+34,bone,7);if((i+j)%3===0){box(c,x+12,y+50,175,45,'#394f56');organ(c,x+98,y+45,.6);}}
   for(let i=0;i<10;i++)shape(c,`M${-334+i*69}-325 l41 0-18 ${40+i%3*17}Z`,'#b6d7d5',ink,2);
  }else if(n===1){ // Ice-lolly sawmill with a huge circular blade and frozen teeth.
   box(c,-343,-121,688,97,p[0]);for(let i=0;i<6;i++){const x=-290+i*109;line(c,x,-139,x,-45,rust,11);box(c,x-36,-233-i%2*53,72,113,p[1]);tooth(c,x,-157-i%2*53,.8);}
   gear(c,201,-162,124);line(c,199,-285,199,-360,bone,20);line(c,-348,-351,343,-351,rust,20);
  }else{ // A coffin made from a defrosting ice block, ringed with melted wreaths.
   shape(c,'M-179-4 L-224-250-137-339 136-339 225-250 180-4Z',p[1],ink,7);shape(c,'M-133-28 L-159-250-94-284 98-283 166-246 133-27Z',p[0],bone,6);rib(c,0,-125,1.35);
   for(const x of [-294,294]){oval(c,x,-136,57,87,'#748f86',ink,6);oval(c,x,-137,26,51,p[0]);chain(c,x,-50,39);}oval(c,0,-6,232,12,'#9ed0ce77');
  }
 }else if(region===2){
  if(n===0){ // Operating theatre where washing drums double as surgical equipment.
   for(const x of [-242,236]){box(c,x-100,-272,200,252,p[0]);oval(c,x,-167,77,84,p[1],ink,6);oval(c,x,-167,53,60,'#253835',bone,4);organ(c,x,-155,.8);}
   bed(c,0,-45);chain(c,0,-368,80);oval(c,0,-274,81,27,bone,ink,5);line(c,-347,-350,348,-350,p[1],22);
  }else if(n===1){ // Raised hairball reservoir with tangled siphons.
   tube(c,0,-15,412,298,p[0]);oval(c,0,-305,203,42,p[1],ink,5);oval(c,0,-308,171,25,'#302e36');
   for(let i=0;i<14;i++){c.beginPath();c.moveTo(-160+i*25,-301);c.bezierCurveTo(-300+i*44,-150,290-i*31,-164,-198+i*29,-21);c.strokeStyle=i%2?'#685759':'#938371';c.lineWidth=7;c.stroke();}
   for(const x of [-296,296])tube(c,x,-20,65,179,rust);
  }else{ // Numbered lost-limb counter with appendages behind glass.
   box(c,-348,-330,696,314,p[0]);for(let i=0;i<5;i++){const x=-321+i*132;box(c,x,-305,108,169,p[1]);line(c,x+54,-281,x+37,-189,bone,15);for(let k=0;k<4;k++)line(c,x+37,-190,x+18+k*15,-151,bone,7);}
   box(c,-369,-112,738,92,rust);for(let i=0;i<6;i++)tooth(c,-284+i*114,-76,.8);
  }
 }else if(region===3){
  if(n===0){ // Gelatin sewer gutter, huge translucent organ moulds.
   box(c,-350,-83,700,60,p[0]);for(let i=0;i<3;i++){const x=-234+i*231;shape(c,`M${x-98}-96 l17-174 q81-100 163 0 l18 174Z`,i%2?'#966b7977':'#9a865f99',ink,5);organ(c,x,-170,1.2);for(let k=0;k<5;k++)line(c,x-68+k*35,-247,x-81+k*41,-105,p[2],3);}
  }else if(n===1){ // Pulling rollers stretch an enormous tooth between taffy ropes.
   for(const x of [-282,282]){box(c,x-57,-323,114,304,p[0]);gear(c,x,-195,66);}
   for(const y of [-234,-162]){line(c,-280,y,280,y,'#ba8c91',25);line(c,-270,y-5,277,y-5,p[2],6);}tooth(c,0,-177,2.9);box(c,-355,-29,710,20,rust);
  }else{ // Hospital cots under an IV of syrup, with fallen lollipop monitors.
   box(c,-350,-338,700,55,p[0]);for(let i=0;i<3;i++){const x=-237+i*237;bed(c,x,-42);chain(c,x,-281,85);tube(c,x,-172,51,75,'#a67f73');line(c,x,-164,x+55,-66,'#bd9291',5);oval(c,x+56,-70,21,21,p[2],ink,3);}
  }
 }else if(region===4){
  if(n===0){ // Organ sorting hopper with separate output bins.
   shape(c,'M-336-345 L337-345 184-125-185-125Z',rust,ink,7);for(let i=0;i<5;i++)organ(c,-252+i*125,-289,.8+i%2*.3);
   for(let i=0;i<3;i++){const x=-232+i*232;box(c,x-91,-105,182,88,p[0]);tube(c,x,-118,57,88,p[1]);organ(c,x,-40,.7);}
  }else if(n===1){ // A massive rib press, suspended jaw above a crushed rib cage.
   for(const x of [-308,308])box(c,x-27,-362,54,351,p[1]);box(c,-340,-363,680,42,rust);box(c,-228,-297,456,62,p[0]);for(let i=0;i<10;i++)tooth(c,-199+i*44,-231,.7);rib(c,0,-48,1.5);box(c,-285,-24,570,24,rust);chain(c,0,-318,25);
  }else{ // Industrial shredder with a tie and paperwork caught in toothed rollers.
   box(c,-345,-309,690,292,p[0]);for(const x of [-151,151]){gear(c,x,-170,131);for(let i=0;i<7;i++)tooth(c,x-88+i*28,-136,.6);}
   shape(c,'M-40-355 L45-350 16-288 35-124 0-90-34-128-11-289Z','#916a7a',ink,4);for(let i=0;i<11;i++)box(c,-318+i*59,-29-i%3*12,37,16,bone);
  }
 }else{
  if(n===0){ // Disposal yard: overturned thrones and discarded royal organs.
   for(let i=0;i<3;i++){c.save();c.translate(-244+i*247,-20);c.rotate((i-1)*.17);box(c,-70,-248,140,200,p[0]);box(c,-92,-65,184,38,rust);for(const x of [-66,66])line(c,x,-25,x,3,bone,15);crown(c,0,-266,.8);organ(c,0,-105,1);c.restore();}
  }else if(n===1){ // Family tree feeds a crowned grinder.
   box(c,-334,-174,668,151,p[0]);for(let i=0;i<3;i++)gear(c,-216+i*216,-109,65);
   line(c,0,-169,0,-353,bone,16);line(c,-263,-280,263,-280,bone,12);for(const x of [-255,-85,85,255]){chain(c,x,-276,64);oval(c,x,-205,47,54,p[1],ink,5);tooth(c,x,-185,.7);}crown(c,0,-359,.5);
  }else{ // A courthouse mouth swallows appeal letters beneath a crooked scale.
   shape(c,'M-350 0 L-319-243 0-359 325-239 355 0Z',p[1],ink,7);oval(c,0,-118,191,100,p[0],ink,7);for(let i=0;i<9;i++)tooth(c,-151+i*39,-173,.7);
   line(c,-220,-269,226,-285,bone,12);for(const x of [-218,224]){chain(c,x,-280,94);shape(c,`M${x-70}-185 l140 0-27 28-87 0Z`,rust,ink,4);}for(let i=0;i<7;i++)box(c,-107+i*32,-64-i%3*13,25,34,bone);
  }
 }
}
