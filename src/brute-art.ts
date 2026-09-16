import type { Enemy } from './engine';
/** A committed direction and height, matching the brute's melee and low-wave attacks. */
export function drawBruteTell(c:CanvasRenderingContext2D,e:Enemy,time:number) {
  const high=e.targetZ>40,color=high?'#f6b5de':'#ffe1a1',progress=Math.max(0,Math.min(1,1-e.windup/.7));
  c.save();c.translate(e.x,e.y);c.scale(e.face,1);
  c.fillStyle=high?'#b9548455':'#b8543d44';c.fillRect(-15,-62,140,124);
  c.strokeStyle='#302c36';c.lineWidth=7;c.strokeRect(-15,-62,140,124);
  c.setLineDash([9,6]);c.lineDashOffset=-time*25;c.strokeStyle=color;c.lineWidth=3;c.strokeRect(-15,-62,140,124);
  if(!high){
    c.fillStyle='#b8543d22';c.fillRect(125,-40,285,80);
    c.beginPath();c.moveTo(125,-40);c.lineTo(410,-40);c.moveTo(125,40);c.lineTo(410,40);c.stroke();
    for(let x=160;x<360;x+=65){c.beginPath();c.moveTo(x,-12);c.lineTo(x+16,0);c.lineTo(x,12);c.stroke();}
  }
  c.setLineDash([]);
  // A green stitched opening is behind the creature, separate from the damaging floor.
  c.beginPath();c.moveTo(-80,-20);c.lineTo(-60,-20);c.lineTo(-60,20);c.lineTo(-80,20);c.strokeStyle='#283833';c.lineWidth=8;c.stroke();c.strokeStyle='#d9efac';c.lineWidth=3;c.stroke();
  c.restore();c.save();
  for(const side of [-1,1]){
    c.beginPath();c.ellipse(e.x+side*38,e.y+4,23,9,0,0,Math.PI*2);c.strokeStyle='#302c36';c.lineWidth=7;c.stroke();c.strokeStyle=color;c.lineWidth=3;c.stroke();
    c.beginPath();c.ellipse(e.x+side*38,e.y+4,27,12,0,-Math.PI/2,-Math.PI/2+Math.PI*2*progress);c.strokeStyle=color;c.lineWidth=4;c.stroke();
  }
  c.font='bold 14px monospace';c.textAlign='center';c.lineWidth=4;c.strokeStyle='#302c36';c.fillStyle=color;
  const text=high?'HIGH SWAT · MOVE ↕':'PLANTED · JUMP / GET BEHIND';
  c.strokeText(text,e.x,e.y-182);c.fillText(text,e.x,e.y-182);c.restore();
}
