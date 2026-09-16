import type {Enemy} from './engine';
import {royalProtected,royalStaff} from './royal-guard';
import {line,oval,shape} from './plush';
export function drawRoyalProtection(c:CanvasRenderingContext2D,enemies:Enemy[],time:number){
 const king=enemies.find(e=>e.kind==='boss'&&royalProtected(e,enemies));if(!king)return;
 c.save();
 for(const staff of royalStaff(enemies)){
  const sx=staff.x,sy=staff.y-staff.z-100,kx=king.x,ky=king.y-265;
  c.beginPath();c.moveTo(sx,sy);c.quadraticCurveTo((sx+kx)/2,Math.min(sy,ky)-32,kx,ky);c.strokeStyle='#302c36';c.lineWidth=7;c.stroke();
  c.strokeStyle='#d9c188';c.lineWidth=4;c.setLineDash([12,5]);c.lineDashOffset=-time*22;c.stroke();c.setLineDash([]);
  c.save();c.translate(sx,sy);c.rotate(Math.sin(time*3+staff.id)*.08);
  shape(c,'M-16-17 L16-17 16 15 8 11 0 17-8 11-16 15Z','#eee0bc','#302c36',2.5);
  line(c,-9,-10,9,-10,'#8d7867',2);line(c,-9,-5,5,-5,'#8d7867',2);oval(c,0,5,7,7,'#9c5262','#302c36',2);c.restore();
 }
 c.save();c.translate(king.x,king.y-265);oval(c,0,0,32,30,'#b39053','#302c36',4);
 shape(c,'M-19-10 L-15 15 15 15 19-10 8-3 0-18-8-3Z','#f0d391','#302c36',3);
 c.restore();c.restore();
}
