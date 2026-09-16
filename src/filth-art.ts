import type { Mess } from './engine';
export function drawMess(c: CanvasRenderingContext2D, m: Mess, time: number) {
  c.save();c.translate(m.x,m.y);c.globalAlpha=Math.min(1,m.life*2);
  const ellipse=(x:number,y:number,rx:number,ry:number,color:string)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();c.stroke();};
  c.strokeStyle='#34313c';c.lineWidth=3;
  if(m.kind==='sludge') {
    ellipse(0,2,m.empowered?95:65,22,'#79bcab');
    for(let i=0;i<6;i++){const x=Math.sin(i*12)*47,y=Math.cos(i*7)*9;ellipse(x,y,12+Math.sin(time*5+i)*3,6,'#c0f2b1');}
    c.fillStyle='#e4f7ed';for(let i=0;i<4;i++){c.save();c.translate(i*25-40,0);c.rotate(i*.9);c.fillRect(-3,-14,6,16);c.restore();}
  } else {
    ellipse(0,4,40,10,'#272e3c44');
    c.save();c.rotate(Math.sin(time*8)*.06);ellipse(0,-29,35,30,m.empowered?'#f4bad2':'#cc8599');
    ellipse(-22,-49,13,13,'#de9aab');ellipse(24,-17,15,13,'#de9aab');
    ellipse(-11,-43,9,10,'#fff4d5');ellipse(14,-39,11,10,'#fff4d5');
    ellipse(-8,-42,3,4,'#312e39');ellipse(11,-37,3,4,'#312e39');
    ellipse(0,-19,21,12,'#563440');
    c.fillStyle='#ffe7bb';for(let i=0;i<5;i++){c.save();c.translate(-15+i*8,-25);c.rotate((i%2-.5)*.35);c.fillRect(-3,0,6,i%2?15:10);c.restore();}
    c.beginPath();c.moveTo(-27,-35);c.lineTo(-23,-15);for(let i=0;i<3;i++){c.moveTo(-30,-30+i*6);c.lineTo(-20,-34+i*6);}c.stroke();c.restore();
  }
  c.font='bold 11px monospace';c.textAlign='center';c.strokeStyle='#26332e';c.lineWidth=3;c.fillStyle='#fff5ce';const text=m.kind==='sludge'?'HEAVY → SPLASH':'HEAVY → POP';c.strokeText(text,0,32);c.fillText(text,0,32);c.restore();
}
