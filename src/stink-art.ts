import type { Danger } from './engine';
import { line, oval, shape, stitches } from './plush';

/** Physical sacs sit above the feet layer; floor rings still show their blast area. */
export function drawStinkSac(c:CanvasRenderingContext2D,d:Danger,time:number) {
  if(!d.sac)return;
  const returned=d.sac.returned,ink='#302c36',bone='#fff0c5';
  c.save();c.translate(d.x,d.y);
  if(d.resolved){
    const age=Math.max(0,-d.timer)/.24;c.globalAlpha=Math.max(0,1-age);
    for(let i=0;i<5;i++){
      const x=Math.cos(i*2.4)*age*d.radius*.7,y=-12-Math.sin(i*1.7)**2*age*58;
      oval(c,x,y,16+age*17,13+age*19,returned?'#c7ec9177':'#c9ab7777');
    }
    for(const side of [-1,1])shape(c,`M${side*12} -5 l${side*20} -12 ${side*9} 18 -22 1Z`,returned?'#acc482':'#b5967d',ink,2);
  } else {
    if(returned){
      const face=Math.sign(d.sac.vx)||1;
      for(let i=0;i<3;i++)line(c,-face*(34+i*15),-17+i*10,-face*(53+i*18),-17+i*10,'#edf9b8',3);
    }
    // The burn ring shrinks with the actual remaining fuse, not an unrelated clock.
    c.strokeStyle=returned?'#ddff9c':'#ffe4a5';c.lineWidth=4;c.beginPath();
    c.ellipse(0,0,31,12,0,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.min(1,Math.max(0,d.timer)/1.25));c.stroke();
    c.translate(0,-21-Math.abs(Math.sin(time*(returned?20:9)))*3);
    c.rotate(returned?Math.sin(time*28)*.3:Math.sin(time*15)*(1-Math.min(1,d.timer))*.09);
    const swell=1+Math.sin(time*(d.timer<.25?38:17))*.055;c.scale(swell,1/swell);
    oval(c,0,0,25,22,returned?'#b7d58c':'#c1a082',ink,3);
    oval(c,-13,-7,5,7,bone,ink,2);oval(c,9,-9,8,9,bone,ink,2);
    oval(c,-11,-6,2,3,ink);oval(c,11,-7,3,4,ink);
    shape(c,'M-10 6 Q2 0 15 6 L11 17 -7 15Z','#694457',ink,2);
    for(let i=0;i<3;i++)shape(c,`M${-6+i*6} 5 l5 0 -1 7 -3 1Z`,bone,ink,1);
    stitches(c,-19,-17,29,.15);
    for(const [x,y] of [[-18,6],[19,-2],[-5,-15]])oval(c,x,y,3,4,'#d7cc89',ink,1);
    shape(c,'M-6-19 L-11-31 0-27 7-32 8-20Z',returned?'#d5ebae':'#c8ae89',ink,2);
    const fuse=Math.max(3,Math.min(1,d.timer/1.25)*24);
    line(c,3,-28,8,-28-fuse,bone,3);oval(c,8,-28-fuse,4,4,'#ffca6d',ink,1);
    for(let i=0;i<3;i++){const a=time*13+i*2.1;line(c,8+Math.cos(a)*7,-28-fuse+Math.sin(a)*7,8+Math.cos(a)*12,-28-fuse+Math.sin(a)*12,'#ffe9a6',2);}
  }
  c.restore();
}
