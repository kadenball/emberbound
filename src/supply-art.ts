import {trapState,type Setpiece} from './setpieces';
import {fabric,line,oval,shape,stitches} from './plush';
type C=CanvasRenderingContext2D;
function teeth(c:C,x:number,y:number,count:number,width:number) {for(let i=0;i<count;i++)shape(c,`M${x+i*width/count} ${y} l${width/count-3} 0 -2 ${11+i%3*3} -8 3Z`,'#ddd0a9','#302c36',2);}
const names=['COMPLIMENTARY TEA BAGS','EXPIRED STAFF BENEFITS','LUNCH LOST PROPERTY','COMMUNION SNACKS','COMPENSATION STATION','YOUR TAXES, REHEATED'];
/** The reward cabinet and its machinery form one optional, visibly timed stop. */
export function drawSupplyStop(c:C,trap:Setpiece,region:number,running:boolean,time:number) {
 const s=trapState(trap),live=running&&!trap.disabled,warn=live&&s.warning,active=live&&s.active,high=['press','stamp'].includes(trap.kind);
 const ink='#302c36',cream='#f2e1b3',color=['#aeb679','#b9d2d6','#91a896','#c496a8','#aaa18c','#b3a2bd'][region];
 c.save();c.translate(trap.x,trap.y);
 const rx=trap.kind==='cutter'?107:s.rx;
 const bay=(fill:string,stroke:string,width:number)=>{
  if(trap.kind!=='cutter'){oval(c,0,0,rx,s.ry,fill,stroke,width);return;}
  c.beginPath();c.moveTo(-70,-25);c.lineTo(70,-25);c.ellipse(70,0,37,25,0,-Math.PI/2,Math.PI/2);c.lineTo(-70,25);c.ellipse(-70,0,37,25,0,Math.PI/2,Math.PI*1.5);c.closePath();c.fillStyle=fill;c.fill();c.strokeStyle=stroke;c.lineWidth=width;c.stroke();
 };
 bay('#252a3044',ink,5);
 c.setLineDash(warn?[8,5]:[]);bay(active?'#bc684f55':warn?'#ead59a33':'#afc79322',active?'#ffb091':warn?cream:'#b7d398',3);c.setLineDash([]);
 if(active&&trap.kind==='cutter')oval(c,s.x-trap.x,0,37,25,'#edaa8244',cream,2);
 if(warn){c.beginPath();c.ellipse(0,0,rx+6,s.ry+5,0,-Math.PI/2,-Math.PI/2+Math.PI*2*s.phase);c.strokeStyle=cream;c.lineWidth=4;c.stroke();}
 // A physically separate service counter; its floor ring identifies the risk.
 for(const x of [-48,48])line(c,x,-5,x,-150,'#645e59',7);
 shape(c,'M-116-163 L111-169 118-142-112-138Z',fabric(c,color),ink,3);
 c.fillStyle=ink;c.font='15px Bangers, sans-serif';c.textAlign='center';c.fillText(names[region],0,-147);
 shape(c,'M-42-18 L-44-90 42-90 45-18Z',fabric(c,color),ink,4);
 shape(c,'M-32-31 L-32-77 32-77 32-31Z','#34313b',ink,2);
 if(!trap.disabled){
  shape(c,'M-16-34 L-19-61 17-66 22-35Z','#d5b185',ink,2);oval(c,0,-50,5,5,'#b7737f',ink,1);stitches(c,-11,-41,25);
  if(active){for(let x=-26;x<33;x+=12)line(c,x,-76,x,-31,'#b9b09b',5);}
 }else{shape(c,'M-13-66 L17-65 13-6 5-11-4-4-14-10Z','#ddd6bd',ink,2);for(let y=-55;y<-20;y+=9)line(c,-6,y,10,y,'#8a8b78',2);}
 teeth(c,-33,-83,5,66);stitches(c,-31,-22,62);
 if(high){
  const drop=active?1:warn?Math.max(0,(s.phase-.8)/.2):live?Math.max(0,1-(s.phase-1.75)/.3):0;
  for(const x of [-65,65])line(c,x,-210,x,-45,'#817b74',8);
  shape(c,`M-77 ${-206+drop*175} l154 0 6 24 -166 0Z`,fabric(c,color),ink,4);
  teeth(c,-70,-182+drop*175,8,140);
  if(trap.kind==='stamp'){c.fillStyle=ink;c.font='14px Bangers, sans-serif';c.fillText('DENIED',0,-190+drop*175);}
 }else if(trap.kind==='cutter'){
  line(c,-108,-7,108,-7,'#a1a9a1',5);
  const x=active?s.x-trap.x:-86;
  c.save();c.translate(x,-18);c.rotate(active?time*17:0);
  for(let i=0;i<9;i++){c.rotate(Math.PI*2/9);shape(c,'M-7-20 L0-37 11-20Z','#c9d7cf',ink,2);}oval(c,0,0,21,21,'#849591',ink,3);c.restore();
 }else if(trap.kind==='taffy'){
  for(let x=-65;x<=65;x+=26){const height=active?30+Math.sin(time*10+x)*12:5;line(c,x,2,x+Math.sin(time*7+x)*7,-height,'#c98fa5',8);oval(c,x,-height,7,5,'#ebc4ba',ink,1);}
 }else{
  for(const x of [-66,66]){
   shape(c,`M${x-12} 1 l0-28 24 0 0 28Z`,fabric(c,color),ink,3);oval(c,x,-28,12,5,'#383c37',ink,2);
   if(active)for(let i=0;i<5;i++){const rise=(time*1.7+i*.19)%1;oval(c,x+Math.sin(i*8+time)*12,-28-rise*67,7+rise*9,7+rise*11,'#c3d98977');}
  }
  if(trap.kind==='drain'){oval(c,0,6,29,10,'#34463e',ink,3);if(warn){c.setLineDash([5,6]);oval(c,0,6,46+Math.sin(time*8)*7,16,'#b7d39822',cream,2);c.setLineDash([]);}}
 }
 const text=trap.disabled?'BENEFITS CLAIMED':active?(high?'PRESS DOWN · WAIT':'LOW HAZARD · JUMP / WAIT'):warn?'CLOSING!':live?'OPEN! GET CLOSE + BONK':'OPTIONAL · 25 HP + 25 TEETH';
 c.font='bold 18px monospace';c.textAlign='center';c.lineWidth=4;c.strokeStyle=ink;c.strokeText(text,0,-112);c.fillStyle=trap.disabled?'#cee2ab':active?'#ffbfa2':cream;c.fillText(text,0,-112);
 c.restore();
}
