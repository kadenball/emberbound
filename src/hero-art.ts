import {atlasBounds,drawAtlas,type Bounds} from './atlas-bounds';
import type { Actor } from './engine';
import type { HeroId, WeaponId } from './content';
import type { PlushPose } from './plush';

type Point = readonly [number, number];
interface Atlas {
  file: string;
  scale: number;
  split?:number;
  bounds?:Bounds[];
  cuts: readonly [readonly number[], readonly number[]];
  feet: readonly Point[];
  hands: readonly Point[];
}
// Measured against the original alpha sheets. Custom cuts retain extended arms;
// feet and hand sockets keep differently shaped poses attached to the simulation.
const atlases: Record<HeroId, Atlas> = {
  ember: {file:'ash',scale:.37,cuts:[[0,395,810,1180,1536],[0,392,856,1195,1536]],
    feet:[[240,458],[617,458],[1023,458],[1372,458],[235,912],[591,912],[1045,912],[1360,912]],
    hands:[[110,363],[483,337],[963,318],[1263,111],[88,637],[812,730],[988,878],[1270,803]]},
  frost: {file:'wren',scale:.40,cuts:[[0,374,775,1184,1536],[0,350,820,1220,1536]],
    feet:[[180,466],[533,466],[948,466],[1360,466],[210,961],[580,961],[925,961],[1415,961]],
    hands:[[117,282],[451,270],[883,282],[1280,135],[72,686],[776,718],[902,784],[1434,728]]},
  moss: {file:'bram',scale:.43,cuts:[[0,382,799,1188,1536],[0,351,796,1178,1536]],
    feet:[[203,448],[600,448],[1000,448],[1370,448],[184,900],[574,900],[983,900],[1359,900]],
    hands:[[124,418],[624,403],[1002,428],[1319,287],[100,708],[756,775],[965,862],[1453,728]]},
};
const attacks: Record<HeroId, Atlas> = {
 ember:{file:'ash-attacks',scale:.37,cuts:[[0,390,790,1180,1536],[0,395,790,1130,1536]],feet:[[225,465],[585,465],[975,465],[1350,465],[235,920],[565,920],[975,920],[1340,920]],hands:[[290,307],[742,286],[902,404],[1315,81],[90,719],[744,846],[1080,888],[1240,719]]},
 frost:{file:'wren-attacks',scale:.40,split:530,cuts:[[0,395,840,1180,1536],[0,395,807,1178,1536]],feet:[[205,500],[565,500],[1045,500],[1350,500],[219,977],[555,977],[949,977],[1340,977]],hands:[[276,273],[777,248],[931,440],[1331,69],[69,763],[754,879],[1103,939],[1237,743]]},
 moss:{file:'bram-attacks',scale:.43,cuts:[[0,375,795,1170,1536],[0,375,830,1165,1536]],feet:[[200,455],[550,455],[1000,455],[1350,455],[214,908],[562,908],[980,908],[1320,908]],hands:[[269,333],[732,327],[907,428],[1336,87],[73,728],[775,852],[1098,874],[1240,721]]}
};
const attackSheets = new Map<HeroId, HTMLImageElement>();
/** Distinct silhouettes for five move families; recovery returns through anticipation. */
export function heroAttackFrame(p:PlushPose):number|null {
 const a=p.attack;if(!a||p.downed||(p.power??0)>0)return null;
 const contact=a.elapsed>=a.move.startup&&a.elapsed<a.move.startup+a.move.active+a.move.recovery*.65;
 if(a.move.kind==='slam')return 6;
 if(a.move.kind==='kick')return 7;
 const pair=a.move.kind==='launcher'?2:['light','air'].includes(a.move.kind)?0:4;
 return pair+(contact?1:0);
}
const sheets = new Map<HeroId, HTMLImageElement>();
let loading: Promise<void> | undefined;

/** Decode packaged art before the first portrait is cached. A missing sheet uses
 * the existing vector creature, so one corrupt asset cannot strand a saved game. */
export function loadHeroArt(): Promise<void> {
  return loading ??= Promise.all([...Object.entries(atlases),...Object.entries(attacks)].map(async ([id, atlas]) => {
    const img = new Image();
    img.src = `/characters/${atlas.file}.png`;
    try {
      await img.decode();
      if(img.naturalWidth===1536 && img.naturalHeight===1024){
        if(atlas.file.endsWith('-attacks')){const bounds=atlasBounds(img);atlas.bounds=Array.from({length:8},(_,f)=>{const row=f>3?1:0,col=f%4,y=row*(atlas.split??500),x=atlas.file==='wren-attacks'&&f===5?360:atlas.file==='bram-attacks'&&f===6?795:atlas.cuts[row][col];return bounds({x,y,w:atlas.cuts[row][col+1]-x,h:row?1024-y:(atlas.split??500)});});}
        (atlas.file.endsWith('-attacks')?attackSheets:sheets).set(id as HeroId,img);
      }
    } catch { /* The procedural renderer remains available offline on asset failure. */ }
  })).then(()=>{});
}

export function heroArtReady(hero: HeroId) { return sheets.has(hero); }

/** Row-major poses: idle, two strides, jump, windup, contact, power, recoil. */
export function heroPoseFrame(actor: Actor, pose: PlushPose): number {
  if(pose.downed || actor.hurt > 0) return 7;
  if((pose.power ?? 0)>0) return 6;
  const attack=pose.attack;
  if(attack) {
    if(attack.elapsed<attack.move.startup) return 4;
    if(attack.elapsed<attack.move.startup+attack.move.active+attack.move.recovery*.6) return 5;
    return 0;
  }
  if((pose.z??0)>5 || (pose.roll??0)>0) return 3;
  if(actor.walk) return Math.sin(actor.walk)>0 ? 1 : 2;
  return 0;
}

export function drawHeroArt(c:CanvasRenderingContext2D,x:number,y:number,a:Actor,time:number,
  scale:number,p:PlushPose,weapon:(c:CanvasRenderingContext2D,w:WeaponId)=>void): boolean {
  if(!p.hero) return false;
  const attackFrame=a.hurt>0?null:heroAttackFrame(p);
  const paintedAttack=attackFrame!==null&&attackSheets.has(p.hero);
  const image=(paintedAttack?attackSheets:sheets).get(p.hero);
  if(!image) return false;
  const atlas=(paintedAttack?attacks:atlases)[p.hero],frame=paintedAttack?attackFrame!:heroPoseFrame(a,p),row=frame>3?1:0,column=frame%4;
  const crop=atlas.bounds?.[frame];
  const sx=crop?.x??atlas.cuts[row][column],sy=crop?.y??row*(atlas.split??500),sw=crop?.w??atlas.cuts[row][column+1]-sx,sh=crop?.h??(row?1024-sy:(atlas.split??500));
  const [fx,fy]=atlas.feet[frame],[hx,hy]=atlas.hands[frame],s=atlas.scale;
  const move=p.attack?.move,elapsed=p.attack?.elapsed??0;
  const active=!!move && elapsed>=move.startup && elapsed<move.startup+move.active;
  const phase=move?Math.max(0,Math.min(1,(elapsed-move.startup)/move.active)):0;
  const gait=Math.sin(a.walk),breath=Math.sin(time*(p.hero==='moss'?2.6:3.4));
  c.save();
  c.translate(x,y-(p.z??0)); c.scale(scale*a.face,scale);
  if(p.downed){c.translate(0,-24);if(p.hero!=='moss')c.rotate(-1.3);c.translate(0,20);}
  else if((p.roll??0)>0){c.translate(0,-48);c.rotate((.23-(p.roll??0))/.23*Math.PI*2);c.translate(0,48);}
  const landing=p.landing?Math.sin(Math.min(1,p.landing/.17)*Math.PI)*.22:0;
  const runSquash=a.walk && !move && !(p.z??0) ? Math.cos(a.walk*2)*.035 : 0;
  c.scale(1+landing+runSquash,1-landing-runSquash);
  if(!p.downed && !p.roll){
    c.translate(0,-(a.walk?Math.abs(gait)*(p.hero==='frost'?6:2):breath*1.1));
    if(paintedAttack&&move){const load=Math.min(1,elapsed/move.startup),recovery=Math.max(0,1-(elapsed-move.startup-move.active)/move.recovery);c.translate(elapsed<move.startup?-5*load:active?9*Math.sin(phase*Math.PI):4*recovery,0);}
    if(!paintedAttack && move?.kind==='launcher')c.rotate(active?-.28* Math.sin(phase*Math.PI):.08);
    if(!paintedAttack && move?.kind==='slam' && (p.z??0)>5)c.rotate(.5);
    if(move?.kind==='spin')c.scale(Math.cos(elapsed/(move.startup+move.active+move.recovery)*Math.PI*2),1);
  }
  drawAtlas(c,image,crop??{x:sx,y:sy,w:sw,h:sh},fx,fy,s);
  // Equipment stays in front of the torso, including Bram's low mittens. Repaint
  // only the grip over its handle; powers tuck the weapon away entirely.
  if(p.weapon && (paintedAttack?frame!==7:frame!==6) && !p.downed){
    c.save();c.translate((hx-fx)*s,(hy-fy)*s);
    let angle=paintedAttack?(frame%2?1.35:-.8):frame===4?-.8:frame===5?1.35:frame===3?-.4:.12;
    if(move?.kind==='launcher')angle=(paintedAttack?frame===3:frame===5)?-.35:-1;
    if(move?.kind==='slam')angle=paintedAttack?2.5:frame===5?2.5:-.5;
    c.rotate(angle);c.scale(.72,.72);weapon(c,p.weapon);c.restore();
    c.save();c.beginPath();c.arc((hx-fx)*s,(hy-fy)*s,25*s,0,Math.PI*2);c.clip();
    drawAtlas(c,image,crop??{x:sx,y:sy,w:sw,h:sh},fx,fy,s);c.restore();
  }
  if(active && move){
    c.save();c.globalAlpha*=.7;c.strokeStyle=move.kind==='hex'?'#c5ed9c':'#ffe7af';
    c.lineWidth=move.kind==='light'?5:9;c.beginPath();
    if(move.kind==='slam'){for(const dx of [-42,-18,12]){c.moveTo(dx,-140);c.lineTo(dx+45,-45);}}
    else if(move.kind==='kick'){for(const dy of [-62,-44,-27]){c.moveTo(-15,dy);c.lineTo(105+phase*30,dy+8);}}
    else c.ellipse(20,-48,move.reach/scale,move.kind==='launcher'?105:move.depth/scale,
      move.kind==='launcher'?-.9:0,-1.4+phase*.5,1.1+phase*.5);c.stroke();
    c.lineWidth=2;c.strokeStyle='#fff9e4';c.stroke();c.restore();
  }
  c.restore();
  return true;
}
