import type { Enemy } from './engine';
import { STITCH_TIME, stitchConnected } from './triage';
/** A moving seam links the actual locked patient; it is a heal tell, not a damage area. */
export function drawStitch(c: CanvasRenderingContext2D, jelly: Enemy, patient: Enemy | undefined, time: number) {
 if(jelly.hp<=0 || jelly.windup<=0 || !stitchConnected(jelly,patient))return;
 const x=jelly.x+jelly.face*22,y=jelly.y-jelly.z-68,tx=patient.x,ty=patient.y-patient.z-65;
 const progress=Math.max(0,Math.min(1,1-jelly.windup/STITCH_TIME)),mid=(x+tx)/2,crest=Math.min(y,ty)-45;
 c.save();c.lineCap='round';c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(mid,crest,tx,ty);c.strokeStyle='#253538';c.lineWidth=8;c.stroke();
 c.setLineDash([7,6]);c.lineDashOffset=-time*45;c.strokeStyle='#d6ed9c';c.lineWidth=3;c.stroke();c.setLineDash([]);
 for(let i=0;i<3;i++){
  const t=(time*.7+i/3)%1,u=1-t,px=u*u*x+2*u*t*mid+t*t*tx,py=u*u*y+2*u*t*crest+t*t*ty;
  c.fillStyle='#eaf7bb';c.fillRect(px-3,py-7,6,14);c.fillRect(px-7,py-3,14,6);
 }
 c.beginPath();c.ellipse(patient.x,patient.y+3,36,13,0,0,Math.PI*2);c.strokeStyle='#badc86';c.lineWidth=2;c.stroke();
 c.beginPath();c.ellipse(patient.x,patient.y+3,40,16,0,-Math.PI/2,-Math.PI/2+Math.PI*2*progress);c.strokeStyle='#edffb8';c.lineWidth=4;c.stroke();
 c.font='bold 14px monospace';c.textAlign='center';c.lineWidth=4;c.strokeStyle='#263435';c.strokeText('RESTUFFING · HEAVY TO CUT',jelly.x,jelly.y-jelly.z-132);c.fillStyle='#e0f3ac';c.fillText('RESTUFFING · HEAVY TO CUT',jelly.x,jelly.y-jelly.z-132);c.restore();
}
