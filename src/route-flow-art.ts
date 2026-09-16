import type {RouteFlow} from './route-flow';
import {line,oval,shape} from './plush';
type C=CanvasRenderingContext2D;
const ink='#26302f';
export function drawRouteFlow(c:C,f:RouteFlow,running:boolean,time:number) {
  const left=f.x,right=f.x+f.width,top=f.y-f.depth/2,bottom=f.y+f.depth/2;
  const t=running?time:0,dir=Math.sign(f.speed),phase=((t*f.speed)%60+60)%60;
  c.save();
  c.fillStyle=f.kind==='rinse'?'#325e58':'#454c48';c.fillRect(left,top,f.width,f.depth);
  c.save();c.beginPath();c.rect(left,top,f.width,f.depth);c.clip();
  if(f.kind==='rinse'){
    for(let row=0;row<4;row++)for(let x=left-60+phase;x<right+60;x+=60){
      const y=top+10+row*18;line(c,x,y,x+35,y+Math.sin(t*3+row)*3,running?'#97c6ab77':'#6c928177',3);
    }
    for(let i=0;i<8;i++){
      const x=left+((i*91+t*f.speed)%f.width+f.width)%f.width,y=top+11+(i*19)%(f.depth-20);
      oval(c,x,y,9+i%3*2,4,'#aac0a37a');
      if(i%3===0){shape(c,`M${x-9} ${y-7} l12 1 -1 7 9 4 -3 6 -17 -5Z`,'#bdb092',ink,1.5);}
    }
  }else{
    for(let x=left-60+phase;x<right+60;x+=60){
      line(c,x,top+3,x,bottom-3,'#838779',5);line(c,x+5,top+4,x+5,bottom-4,'#252d2b',2);
      oval(c,x+30,top+7,2,2,'#c3b79a');oval(c,x+30,bottom-7,2,2,'#c3b79a');
      line(c,x+11,top+20,x+27,top+16,'#b2936677',3);line(c,x+24,bottom-10,x+45,bottom-20,'#a28e6577',2);
      oval(c,x+43,f.y+6,7,4,'#252e29aa');
    }
  }
  // Large fixed arrows describe direction even if the eye misses the moving slats.
  for(let x=left+65;x<right-20;x+=145){
    c.save();c.translate(x,f.y);c.scale(dir,1);
    shape(c,'M-26-5 L7-5 7-13 27 0 7 13 7 5-26 5Z',running?'#e6d497bb':'#94927b66',ink,2);c.restore();
  }
  c.restore();
  for(const y of [top,bottom]){line(c,left,y,right,y,ink,7);line(c,left,y,right,y,f.kind==='rinse'?'#8e9d83':'#baa16c',3);}
  for(const x of [left,right]){
    oval(c,x,f.y,12,f.depth/2+7,f.kind==='rinse'?'#647b6c':'#877e64',ink,4);
    if(f.kind==='belt')for(let i=0;i<4;i++){const a=t*5*dir+i*Math.PI/2;line(c,x,f.y,x+Math.cos(a)*9,f.y+Math.sin(a)*(f.depth/2-2),'#d4b98a',3);}
    else for(let yy=top+7;yy<bottom;yy+=14)line(c,x-6,yy,x+6,yy,'#c4c5a1',3);
  }
  // The archive's dry center lane remains a clear passing route between its belts.
  c.font='bold 13px monospace';c.textAlign='center';c.strokeStyle=ink;c.lineWidth=4;
  const text=running?(f.kind==='rinse'?'RINSE EXPRESS → JUMP / BRAKE':dir>0?'FORKS →':'← SPOONS, PROBABLY'):'UNPAID BREAK';
  const yy=f.kind==='rinse'?top-12:f.speed>0?top-13:bottom+20;
  c.strokeText(text,left+f.width/2,yy);c.fillStyle='#f3dfb4';c.fillText(text,left+f.width/2,yy);
  c.restore();
}
