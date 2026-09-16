import type { Impact } from './engine';
export function drawImpact(c:CanvasRenderingContext2D,e:Impact){
 const t=1-e.life/e.duration,fade=Math.min(1,e.life/e.duration*3),size=e.kind==='heavy'?46:e.kind==='death'?60:28;
 c.save();c.translate(e.x,e.y);c.globalAlpha=fade;c.strokeStyle=e.color;c.fillStyle=e.color;c.lineCap='round';
 if(e.kind==='slam'||e.kind==='cast'){
  for(let i=0;i<2;i++){const r=12+t*(e.kind==='slam'?155:85)+i*15;c.beginPath();c.ellipse(0,0,r,r*.3,0,0,Math.PI*2);c.lineWidth=(1-t)*(i?3:7);c.stroke();}
  for(let i=0;i<9;i++){const a=i/9*Math.PI*2,x=Math.cos(a)*(35+t*90),y=Math.sin(a)*(12+t*25);c.fillRect(x,y-t*(1-t)*60,7*(1-t),5*(1-t));}
 }else if(e.kind==='dash'){
  c.scale(e.face,1);for(let i=0;i<6;i++){c.lineWidth=2+(i%3);c.beginPath();c.moveTo(-25-t*65,-35+i*13);c.lineTo(25-t*40,-35+i*13);c.stroke();}
 }else if(e.kind==='death'){
  for(let i=0;i<11;i++){const a=i*2.4,r=15+t*75;c.save();c.translate(Math.cos(a)*r,Math.sin(a)*r-t*(1-t)*130+t*t*60);c.rotate(t*8+i);c.fillStyle=i%3?'#e5d6ba':'#fff3d7';c.beginPath();if(i%3)c.ellipse(0,0,7,4,0,0,7);else c.roundRect(-4,-6,8,13,2);c.fill();c.restore();}
 }else if(e.kind==='guard'){
  for(let i=0;i<7;i++){c.save();c.rotate(i*.9);c.translate(20+t*45,0);c.fillStyle=i%2?'#adc6cf':'#f3dfbb';c.fillRect(-5,-8,10,16);c.restore();}
 }else if(e.kind==='launch'){
  c.lineWidth=5;for(const x of [-22,0,22]){c.beginPath();c.moveTo(x,30-t*25);c.quadraticCurveTo(x-15,-t*70,x,-35-t*110);c.stroke();}
 }else{
  // A short white core, jagged colored star and separate directional flecks.
  c.rotate(t*.5*e.face);c.beginPath();for(let i=0;i<16;i++){const a=i/16*Math.PI*2,r=(i%2?size*.35:size)*(1+t*.65);const x=Math.cos(a)*r,y=Math.sin(a)*r;if(i===0)c.moveTo(x,y);else c.lineTo(x,y);}c.closePath();c.fillStyle=e.color;c.fill();
  c.beginPath();c.ellipse(0,0,Math.max(1,12*(1-t)),Math.max(1,15*(1-t)),0,0,7);c.fillStyle='#fffdf2';c.fill();
  c.lineWidth=3;for(let i=0;i<5;i++){const a=i*1.3,r=size*(1+t);c.beginPath();c.moveTo(Math.cos(a)*r,Math.sin(a)*r);c.lineTo(Math.cos(a)*(r+16),Math.sin(a)*(r+16));c.stroke();}
 }c.restore();
}
