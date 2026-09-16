/// <reference types="vite/client" />
import {atlasBounds,drawAtlas,type Bounds} from './atlas-bounds';
import type {Actor} from './engine';
import type {PlushPose} from './plush';
import type {EnemyKind} from './content';
type Cell=Bounds&{foot:number};
type Sheet={image:HTMLImageElement;cells:Cell[][]};
const sheets:Sheet[]=[];
const species:Partial<Record<EnemyKind,[number,number,number]>>={raider:[0,0,104],shield:[0,1,132],brute:[0,2,178],charger:[0,3,124],archer:[1,0,170],bomber:[1,1,143],healer:[1,2,182],flanker:[1,3,108]};
let loading:Promise<void>|undefined;
/** Bounds are measured from alpha once, never from combat state or RNG. */
export function loadEnemyArt(){return loading??=Promise.all(['melee','ranged'].map(async(name,index)=>{
 const image=new Image();image.src=`${import.meta.env.BASE_URL}characters/enemies-${name}.png`;
 try{await image.decode();const bounds=atlasBounds(image);
 const cells:Cell[][]=[];
 for(let row=0;row<4;row++){cells[row]=[];for(let col=0;col<4;col++){
  const xs=[0,313,627,940,1254];
  const ys=index===0?(col===2?[0,315,576,940,1254]:[0,320,603,940,1254]):[0,332,622,1007,1254];
  const cell=bounds({x:xs[col],y:ys[row],w:xs[col+1]-xs[col],h:ys[row+1]-ys[row]});
  cells[row].push({...cell,foot:cell.x+cell.w/2});
 }}sheets[index]={image,cells};
 }catch{/* Vector creatures remain available if a packaged sheet fails. */}
})).then(()=>{});}
export function enemyArtFrame(a:Actor,p:PlushPose){return p.windup?2:a.attackTime>0||(p.rush??0)>0?3:a.walk&&Math.sin(a.walk)>0?1:0;}
export function drawEnemyArt(c:CanvasRenderingContext2D,x:number,y:number,a:Actor,time:number,scale:number,p:PlushPose):boolean{
 const data=p.kind&&species[p.kind];if(!data)return false;
 const [sheetIndex,row,height]=data,sheet=sheets[sheetIndex];if(!sheet)return false;
 const frame=enemyArtFrame(a,p),cell=sheet.cells[row][frame],s=height/sheet.cells[row][0].h;
 c.save();c.fillStyle='#21273255';c.beginPath();c.ellipse(x,y+4,scale*(p.kind==='brute'?43:35),scale*8,0,0,Math.PI*2);c.fill();c.restore();
 c.save();c.translate(x,y-(p.z??0));c.scale(scale*a.face,scale);
 if(p.dead!==undefined)c.globalAlpha*=Math.max(0,p.dead/.85);
 if(p.knockdown||p.nap||p.dead!==undefined){c.translate(0,-25);c.rotate(-1.5);c.translate(0,30);}
 if(p.bowling){c.translate(0,-45);c.rotate(time*19);c.translate(0,45);}
 const frozen=p.frozen||p.nap||p.knockdown;
 const gait=frozen?0:Math.sin(a.walk),hover=frozen?0:p.kind==='archer'?Math.sin(time*17)*4:p.kind==='healer'?Math.sin(time*5)*7:0;
 c.translate(frame===3?10:0,hover-Math.abs(gait)*(p.kind==='flanker'?1:3));
 if(p.kind==='flanker')c.scale(1+gait*.045,1-gait*.06);
 if(p.kind==='bomber'&&p.windup)c.scale(1.06,1.04);
 if(a.hurt>0)c.rotate(Math.sin(a.hurt*50)*.08);
 if(p.frozen)c.filter='sepia(.6) saturate(.5) hue-rotate(130deg) brightness(1.25)';
 drawAtlas(c,sheet.image,cell,cell.foot,cell.y+cell.h,s);
 if(p.kind==='brute'&&p.windup){c.strokeStyle='#d9efac';c.lineWidth=4;c.beginPath();c.moveTo(-42,-116);c.lineTo(-50,-64);c.stroke();}
 if(p.guardBroken){c.strokeStyle='#ffca83';c.lineWidth=4;c.beginPath();c.moveTo(-38,-114);c.lineTo(-14,-91);c.lineTo(-34,-68);c.stroke();}
 if(p.royalProtection){c.strokeStyle='#f4d58b';c.lineWidth=3;c.beginPath();c.ellipse(0,-height*.5,height*.46,height*.57,0,0,Math.PI*2);c.stroke();}
 c.restore();return true;
}
