import {drawCart} from './cart-art';
import {drawRouteFlow} from './route-flow-art';
import {drawStinkSac} from './stink-art';
import {drawRoyalProtection} from './royal-guard-art';
import { drawSupplyStop } from './supply-art';
import { setpieceRunning } from './setpieces';
import { drawBruteTell } from './brute-art';
import { drawJourneyMotion } from './journey-art';
import { drawStitch } from './triage-art';
import {ARENA_START,drawArenaBackdrop,drawArenaForeground} from './arena-art';
import { drawWorkplace, drawMachineDisaster } from './sabotage-art';
import { drawGrimeDistrict, drawScars, drawSetpiece } from './grime-art';
import { HEROES, STAGES, type HeroId } from './content';
import { Game, clamp, type Actor, type Enemy, type Player } from './engine';
import { drawImpact } from './impact-art';
import { drawMess } from './filth-art';
import { drawPlush } from './plush';
import { drawProp, drawDanger } from './world-art';
import { bossChargeBounds, FORK_DEPTH, raisedForks } from './danger-shapes';
import { drawBackdrop, drawArena, drawTerrain, drawAmbient, drawForeground } from './scenery';

// All artwork is drawn locally. No remote textures, fonts, or asset requests.
export class Renderer {
  ctx: CanvasRenderingContext2D;
  width = 1200; height = 675; offsetY = 0; camera = 0;
  private pixelRatio = 1;
  private sceneryCache: { key: string; sky: HTMLCanvasElement; terrain: Map<number, HTMLCanvasElement> } | null = null;
  constructor(public canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.resize(); window.addEventListener('resize', () => this.resize());
  }
  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.width = Math.max(1100, w / h * 780); this.height = this.width * h / w;
    this.offsetY = (this.height - 675) / 2;
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2) * w / this.width;
    this.canvas.width = Math.round(this.width * this.pixelRatio); this.canvas.height = Math.round(this.height * this.pixelRatio);
  }
  draw(game: Game | null, hero: HeroId, stage: number, time: number, shake: boolean) {
    const c = this.ctx;
    c.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    c.fillStyle = STAGES[stage].sky; c.fillRect(0, 0, this.width, this.height);
    c.save(); c.translate(0, this.offsetY);
    if (game && shake && game.shake > 0) c.translate(Math.sin(time * 130) * game.shake * 18, Math.cos(time * 97) * game.shake * 10);
    const target = game ? clamp(game.bossMoment ? (game.cameraFocus+game.bossMoment.x)/2-this.width*.5 : game.cameraFocus - this.width * (game.players.length > 1 ? .5 : .36), 0, Math.max(0, STAGES[stage].length - this.width)) : 50;
    this.camera += (target - this.camera) * .16;
    this.landscape(stage, time);
    if (game) {
      c.save(); c.translate(-this.camera, 0);
      if (game.config.bossStage && this.camera + this.width > ARENA_START) drawArena(c,game.config.region,time,game.state==='won'||game.enemies.some(e=>e.kind==='boss'&&e.hp<=0));
      drawJourneyMotion(c,this.width,this.camera,game.stage,time,game.wave-(game.encounterActive?1:0));
      this.encounterScenery(game, time);
      for(const flow of game.flows)if(flow.x+flow.width>this.camera-40&&flow.x<this.camera+this.width+40)drawRouteFlow(c,flow,game.flowRunning(flow),game.time);
      for (const m of game.machines) if(m.x>this.camera-350 && m.x<this.camera+this.width+350) drawWorkplace(c,m,time);
      drawScars(c,game.scars,this.camera,this.width);game.blood.draw(c,false);
      for (const trap of game.setpieces) if (trap.x > this.camera-240 && trap.x < this.camera+this.width+240) { const running=setpieceRunning(trap,game.wave,game.encounterActive,game.players);if(trap.road)drawSupplyStop(c,trap,game.config.region,running,game.time);else drawSetpiece(c,trap,running,game.time); }
      for (const prop of game.props) if (!(prop.kind==='chest'&&prop.hazard!==undefined) && prop.x > this.camera - 100 && prop.x < this.camera + this.width + 100) drawProp(c, prop.kind === 'vent' ? { ...prop, active: game.time % 4 > 2.8 } : prop, time);
      for (const mess of game.messes) drawMess(c,mess,time);
      for (const danger of game.dangers) drawDanger(c, danger, time);
      if(game.config.region===5)drawRoyalProtection(c,game.enemies,game.time);
      for (const e of game.enemies) if (e.hp > 0 && (e.windup > 0 || ['inhale','spin','recover','jammed'].includes(e.bossState))) this.telegraph(e, game);
      if (game.spellRing > 0) {
        c.save(); c.globalAlpha = game.spellRing; c.strokeStyle = HEROES.find(h => h.id === hero)!.color; c.lineWidth = 10 * game.spellRing;
        c.beginPath(); c.ellipse(game.spellX, game.spellY, (1 - game.spellRing) * 310, (1 - game.spellRing) * 115, 0, 0, Math.PI * 2); c.stroke(); c.restore();
      }
      for (const item of game.pickups) {
        this.ellipse(item.x, item.y + 3, 12, 4, '#132c3044');
        const y = item.y - 14 + Math.sin(item.phase) * 4;
        if (item.kind === 'gold') { this.ellipse(item.x, y, 8, 10, '#edba59', '#574c36', 2); this.line(item.x, y - 5, item.x, y + 5, '#fff0a3', 2); }
        else { this.ellipse(item.x, y, 11, 10, '#dc7459', '#643d34', 2); this.line(item.x, y - 8, item.x + 4, y - 14, '#9ebb76', 3); }
      }
      const actors: { actor: Actor; enemy?: Enemy; player?: Player }[] = [...game.players.map(player => ({actor:player,player})), ...game.enemies.map(enemy => ({actor:enemy,enemy}))];
      // Large boss feet need a small depth allowance so a same-lane hero stays visible.
      const depth=(entry:typeof actors[number])=>entry.actor.y-(entry.enemy?.kind==='boss'?36:0);
      actors.sort((a,b) => depth(a)-depth(b)||Number(!!a.player)-Number(!!b.player));
      for (const {actor,enemy,player:p} of actors) {
        if(actor.x<this.camera-160||actor.x>this.camera+this.width+160)continue;
        if(enemy){this.enemy(enemy,stage,time,game.bossMoment);if(enemy.defiance>0 && enemy.hp>0){this.ellipse(enemy.x,enemy.y+4,35,12,'#fa893c33','#ffbc76',3);c.font='bold 13px monospace';c.textAlign='center';c.fillStyle='#ffdf9a';c.fillText('MAD AS HELL',enemy.x,enemy.y-enemy.z-112);}}
        else if(p){
          this.ellipse(p.x,p.y+3,28,9,'#fff0c711',p.id===0?'#ffe7a4':'#96e8fa',2.5);
          if(game.players.length>1){c.font='bold 14px sans-serif';c.textAlign='center';c.fillStyle=p.id===0?'#ffe7a4':'#96e8fa';c.fillText(`P${p.id+1}`,p.x,p.y+29);}
          c.save();if(p.invulnerable>0&&Math.floor(time*16)%2===0)c.globalAlpha=.55;
          drawPlush(c,p.x,p.y,p.powerPose>0 && p.hero==='ember'?{...p,face:-p.face}:p,time,.76,{hero:p.hero,weapon:p.weapon,z:p.z,roll:p.roll,landing:p.landing,attack:p.attack,spin:p.attack?.move.kind==='spin',downed:p.downed,power:p.powerPose});c.restore();
          if(p.powerPose>0 && p.hero==='frost'){c.save();c.globalAlpha=Math.min(1,p.powerPose*3);c.strokeStyle='#aff1c0';c.lineWidth=13;c.lineCap='round';c.beginPath();c.moveTo(p.x+p.face*79,p.y-p.z-69);c.quadraticCurveTo(p.x+p.face*90,p.y-p.z-55,p.x+p.face*95,p.y);c.stroke();c.restore();}
          if(p.downed){this.box(p.x-35,p.y-35,70,7,3,'#343340');this.box(p.x-35,p.y-35,p.revive/2*70,7,3,'#a8e4c0');}
        }
      }
      game.blood.draw(c,true);
      for (const e of game.enemies) if(e.kind==='healer' && e.patient!==undefined) drawStitch(c,e,game.enemies.find(q=>q.id===e.patient),time);
      for (const m of game.machines) drawMachineDisaster(c,m,time);
      for (const d of game.dangers) if(d.sac)drawStinkSac(c,d,time);
      for (const b of game.projectiles) {
        if (b.groundWave) { this.ellipse(b.x,b.y,35,14,'#e0c09055','#ffe6b1',3); this.path([[b.x-25,b.y],[b.x-10,b.y-48],[b.x+6,b.y-15],[b.x+20,b.y-35],[b.x+34,b.y]],b.friendly?'#ecd5a8':'#eb947d','#7a6c62',2); }
        else if (b.friendly) {
          c.save(); c.translate(b.x, b.y - 35 - (b.z ?? 0)); c.scale(Math.sign(b.vx), 1);
          this.path([[-78, -24], [-40, -8], [-63, 10], [-22, 8], [-40, 28], [12, 20], [40, 0], [8, -28]], '#f18546');
          this.path([[-34, -12], [3, -20], [29, 0], [-6, 14], [-50, 12], [-17, 0]], '#ffe3a2'); c.restore();
        } else {
          this.line(b.x - b.vx * .07, b.y - 30 - (b.z ?? 0) - b.vy * .07, b.x, b.y - 30 - (b.z ?? 0), b.color, 5);
          this.ellipse(b.x, b.y - 30 - (b.z ?? 0), 5, 5, '#ffdfc1');
        }
      }
      for (const effect of game.impacts) drawImpact(c,effect);
      for (const q of game.particles) { c.globalAlpha = Math.max(0, q.life / q.maxLife); c.fillStyle = q.color; c.fillRect(q.x, q.y, q.size, q.size); }
      c.globalAlpha = 1;
      for (const t of game.texts) { c.globalAlpha = Math.min(1, t.life * 3); c.font = 'bold 23px monospace'; c.textAlign = 'center'; c.strokeStyle = '#263733'; c.lineWidth = 4; c.strokeText(t.text, t.x, t.y); c.fillStyle = t.color; c.fillText(t.text, t.x, t.y); }
      c.globalAlpha = 1;
      if (!game.bossMoment && !game.cart && !game.machines.some(m => m.encounter === game.wave && m.phase !== 'wrecked') && !game.enemies.some(e => e.hp > 0) && game.state === 'playing') {
        const x = Math.min(game.player.x + 270, game.worldWidth - 100), y = 405 + Math.sin(time * 3) * 6;
        c.font = 'bold 16px sans-serif'; c.textAlign = 'center'; c.fillStyle = '#fff2c8'; c.fillText('LEG IT!', x, y - 23);
        this.path([[x - 12, y - 9], [x + 2, y - 9], [x + 2, y - 17], [x + 19, y], [x + 2, y + 17], [x + 2, y + 9], [x - 12, y + 9]], '#fff2c8');
      }
      c.restore();
    } else {
      const actor = { hp: 100, maxHp: 100, hurt: 0, face: -1, walk: 0, attackTime: 0, x: 0, y: 0 };
      this.plush(this.width * .71, 493, hero, actor, time, 2.05);
      this.plush(this.width * .84, 460, HEROES[(HEROES.findIndex(h => h.id === hero) + 1) % 3].id, { ...actor, face: 1 }, time + 1, 1.35);
      this.fire(this.width * .60, 511, time);
    }
    this.foreground(stage, time);
    c.restore();
    const vignette = c.createRadialGradient(this.width / 2, this.height / 2, this.width * .16, this.width / 2, this.height / 2, Math.max(this.width, this.height) * .72);
    vignette.addColorStop(0, '#061b1700'); vignette.addColorStop(1, '#20203866'); c.fillStyle = vignette; c.fillRect(0, 0, this.width, this.height);
  }
  private encounterScenery(g: Game, time: number) {
    const c=this.ctx;
    for(const beat of g.encounters){
      if(beat.x+1000<this.camera||beat.x>this.camera+this.width)continue;
      if(beat.kind==='bridge'){
        c.fillStyle=['#303c30','#354a56','#263f38','#4c303d','#313837','#3e313a'][g.config.region];c.fillRect(beat.x-145,350,1030,210);
        for(let x=beat.x-145;x<beat.x+885;x+=35){this.box(x,414,32,96,3,['#918668','#9bb0b3','#687c6a','#b18b80','#717567','#aa937e'][g.config.region],'#3c403c',2);this.line(x+8,428,x+8,495,'#dbc3a155',1);if(g.config.region===2||g.config.region===4){for(let y=426;y<503;y+=16)this.line(x+5,y,x+25,y,'#293d36',4);}if(g.config.region===3){this.ellipse(x+16,425,12,16,'#ddc7a1','#614b4b',2);}}
        for(const y of [408,519]){this.line(beat.x-150,y-28,beat.x+890,y-28,'#d6bb95',6);for(let x=beat.x-150;x<beat.x+900;x+=180)this.line(x,y+4,x,y-45,'#756558',9);}
      }
      if(beat.kind==='picnic'||beat.kind==='bowling'){
        c.fillStyle='#cb9fa366';c.fillRect(beat.x+480,380,140,80);
        for(let i=0;i<7;i++)for(let j=0;j<4;j++)if((i+j)%2===0){c.fillStyle='#eee0bc55';c.fillRect(beat.x+480+i*20,380+j*20,20,20);}
      }
      this.line(beat.x+35,361,beat.x+35,295,'#806c58',7);this.box(beat.x-55,277,185,34,4,'#dfccaa','#74624d',2);
      c.font='bold 12px monospace';c.textAlign='center';c.fillStyle='#504447';c.fillText(beat.title.toUpperCase().slice(0,24),beat.x+37,299);
    }
    if(g.cart)drawCart(c,g.cart,g.config.region,time);
  }
  private landscape(stage: number, time: number) {
    const region = STAGES[stage].region, ratio = this.pixelRatio;
    const key = `${stage}:${this.width}:${this.height}:${ratio}`;
    const make = (width: number) => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(width * ratio); canvas.height = Math.ceil(this.height * ratio);
      const ctx = canvas.getContext('2d')!; ctx.scale(ratio, ratio); ctx.translate(0, this.offsetY);
      return { canvas, ctx };
    };
    if (this.sceneryCache?.key !== key) {
      const sky = make(this.width + 1600);
      drawBackdrop(sky.ctx, this.width + 1600, this.height, 0, this.offsetY, region, 3);
      this.sceneryCache = { key, sky: sky.canvas, terrain: new Map() };
    }
    const cache = this.sceneryCache, c = this.ctx, chunk = 1024;
    c.drawImage(cache.sky, -this.camera * .18, -this.offsetY, cache.sky.width / ratio, cache.sky.height / ratio);
    const first = Math.floor(this.camera / chunk), last = Math.floor((this.camera + this.width) / chunk);
    // Retain only visible terrain chunks, so longer chapters do not allocate larger textures.
    for (const index of cache.terrain.keys()) if (index < first || index > last) cache.terrain.delete(index);
    for (let index = first; index <= last; index++) {
      if (!cache.terrain.has(index)) {
        const tile = make(chunk + 2); drawTerrain(tile.ctx, chunk + 2, this.height, index * chunk, region, 3,STAGES[stage].bossStage?ARENA_START:Infinity,!STAGES[stage].bossStage);
        drawGrimeDistrict(tile.ctx,chunk+2,index*chunk,stage,3);
        if(STAGES[stage].bossStage){tile.ctx.save();tile.ctx.translate(-index*chunk,0);drawArenaBackdrop(tile.ctx,region);tile.ctx.restore();}
        cache.terrain.set(index, tile.canvas);
      }
      const tile = cache.terrain.get(index)!;
      c.drawImage(tile, index * chunk - this.camera, -this.offsetY, tile.width / ratio, tile.height / ratio);
    }
    drawAmbient(c, this.width, region, time);
  }
  private foreground(stage: number, time: number) {
    const region=STAGES[stage].region;
    if(STAGES[stage].bossStage){this.ctx.save();this.ctx.beginPath();this.ctx.rect(0,-1000,Math.max(0,ARENA_START-this.camera),this.height+2000);this.ctx.clip();drawForeground(this.ctx,this.width,this.camera,this.offsetY,region,time);this.ctx.restore();drawArenaForeground(this.ctx,this.camera,this.width,this.offsetY,region);}
    else drawForeground(this.ctx,this.width,this.camera,this.offsetY,region,time);
  }
  private plush(x: number, y: number, hero: HeroId, actor: Actor, time: number, scale = 1, roll = 0, z = 0, landing = 0, weapon: import('./content').WeaponId = 'starter', spin = false) {
    drawPlush(this.ctx, x, y, actor, time, scale, { hero, roll, z, landing, weapon, spin });
  }
  private enemy(e: Enemy, stage: number, time: number, moment: import('./boss-performance').BossMoment | null = null) {
    const size = e.kind === 'boss' ? 1.34 : e.kind === 'brute' ? .94 : e.kind === 'charger' ? .64 : e.kind === 'healer' ? .61 : .70;
    drawPlush(this.ctx, e.x, e.y, e, time, size, {
      kind: e.kind, rush:e.rush, royalProtection:!!e.decree&&e.hp>0, highAttack:e.targetZ>40, stitching: e.patient!==undefined && e.windup>0, z: e.z, stage: STAGES[stage].region, windup: e.windup, variant: e.id + 3,
      dead: e.hp <= 0 ? e.dead : undefined, frozen: e.frozen > 0, knockdown: e.knockdown > 0 && e.z === 0, bowling: e.bowlTime, nap: e.entrance > 0 && e.entranceKind === 'nap', guardBroken: e.guard > 0, bossState: e.bossState, bossTimer:e.bossTimer, bossPhase:e.phase, enraged:e.enraged, moment:moment?.boss===e.id?moment:null
    });
    if (e.elite && e.hp > 0) { this.ctx.font='bold 13px sans-serif'; this.ctx.textAlign='center'; this.ctx.fillStyle='#ffe3a1'; this.ctx.fillText('★ VETERAN',e.x,e.y-190*size-e.z); }
    if (e.hp > 0 && e.hp < e.maxHp && e.kind !== 'boss') {
      this.box(e.x - 23, e.y - 174 * size, 46, 5, 2, '#233a34');
      this.box(e.x - 23, e.y - 174 * size, 46 * Math.max(0, e.hp / e.maxHp), 5, 2, '#edba98');
    }
    if (e.frozen > 0 && e.hp > 0) {
      this.ctx.fillStyle = '#d3f8ff'; this.ctx.font = '22px Georgia'; this.ctx.textAlign = 'center';
      this.ctx.fillText('❄', e.x, e.y - 184 * size + Math.sin(time * 4) * 3);
    }
  }
  private telegraph(e: Enemy, game: Game) {
    const c = this.ctx,region=game.config.region; c.save();
    if(e.kind==='brute'){drawBruteTell(c,e,game.time);c.restore();return;}
    if(e.kind==='healer' && e.patient!==undefined){c.restore();return;}
    if (e.kind === 'boss') {
      if (['recover','jammed'].includes(e.bossState)) {
        if(region===5&&e.decree){c.restore();return;}
        this.ellipse(e.x,e.y,83,32,'#acdfad22','#b8eda6',3);c.font='bold 15px sans-serif';c.fillStyle='#e4f8bc';c.textAlign='center';c.fillText(e.bossState==='jammed'?(region===5?'RETURN TO SENDER!':'JAMMED!'):'OPENING!',e.x,e.y-240);c.restore();return;
      }
      if(e.bossState==='spin'){const depth=region===4?FORK_DEPTH:65;c.fillStyle='#efb08333';c.strokeStyle=region===4&&raisedForks(e)?'#f6b5de':'#ffe1a1';c.lineWidth=3;c.fillRect(e.x-85,e.y-depth,170,depth*2);c.strokeRect(e.x-85,e.y-depth,170,depth*2);this.line(e.x,e.y,e.x+e.face*150,e.y,c.strokeStyle,3);}
      else if(region===2){this.path([[e.x,e.y],[e.x+e.face*480,e.y-85],[e.x+e.face*480,e.y+85]],'#a9e5e533','#d3f3ed',2);}
      else if(region===4){const ink=raisedForks(e)?'#f6b5de':'#ffdb91',{low,high}=bossChargeBounds(game.worldWidth,game.currentEncounter?.x);c.fillStyle=raisedForks(e)?'#df68ae33':'#ed9c6333';c.fillRect(low-85,e.targetY-FORK_DEPTH,high-low+170,FORK_DEPTH*2);for(const y of [-FORK_DEPTH,FORK_DEPTH])this.line(low-85,e.targetY+y,high+85,e.targetY+y,ink,2);c.font='bold 15px monospace';c.textAlign='center';c.fillStyle=ink;c.fillText(raisedForks(e)?'FORKS UP · MOVE ↕':'FORKS LOW · JUMP ↑',e.targetX,e.targetY+FORK_DEPTH-9);}
      else if(region===0&&(e.phase+1)%2===1){const z=e.targetZ>45?e.targetZ:22;c.setLineDash([8,7]);for(const offset of e.enraged?[-120,-60,0,60,120]:[-85,0,85])this.line(e.x,e.y-30-z,e.targetX,e.targetY+offset-30-z,z>45?'#f6b5de':'#ffdb91',2);c.setLineDash([]);c.font='bold 14px monospace';c.textAlign='center';c.fillStyle='#ffe5b6';c.fillText(z>45?'HIGH BURP · STAY LOW':'LOW BURP · JUMP / SIDESTEP',e.x,e.y-205);}
      else if(region!==5||(e.phase+1)%3===0){this.ellipse(e.targetX,e.targetY,region===5?180:125,region===5?48:70,'#dd765044','#ffb88f',3);}
    } else if(e.kind==='healer'){
      c.save();c.translate(e.x,e.y);c.scale(e.face,1);c.fillStyle='#b8543d55';c.fillRect(-15,-40,115,80);
      c.strokeStyle='#342e37';c.lineWidth=7;c.strokeRect(-15,-40,115,80);c.setLineDash([8,5]);c.lineDashOffset=-game.time*20;c.strokeStyle='#ffe1a1';c.lineWidth=3;c.strokeRect(-15,-40,115,80);c.restore();
      c.font='bold 17px monospace';c.textAlign='center';c.lineWidth=4;c.strokeStyle='#302c36';c.strokeText('SLAP!',e.x,e.y-130);c.fillStyle='#ffe1a1';c.fillText('SLAP!',e.x,e.y-130);c.restore();return;
    } else if (['archer', 'bomber', 'charger','raider','flanker'].includes(e.kind)) {
      const elevation = e.kind === 'archer' ? e.targetZ : 0;
      c.setLineDash([8, 7]); this.line(e.x, e.y - 30 - elevation, e.targetX, e.targetY - 30 - elevation, elevation > 40 ? '#f5a2d6' : '#ffb6a288', 2);
    } else {
      this.ellipse(e.x + e.face * 35, e.y, 55, 28, '#dc815d33', '#efb289', 2);
    }
    c.setLineDash([]); c.fillStyle = '#ffdaa8'; c.font = 'bold 28px Georgia'; c.textAlign = 'center'; c.fillText('!', e.x, e.y - (e.kind === 'boss' ? 235 : 138)); c.restore();
  }
  private fire(x: number, y: number, time: number) {
    const c = this.ctx, glow = c.createRadialGradient(x, y - 16, 0, x, y - 16, 100);
    glow.addColorStop(0, '#ffcb6b44'); glow.addColorStop(1, '#ffcb6b00'); c.fillStyle = glow; c.fillRect(x - 100, y - 116, 200, 200);
    this.line(x - 26, y + 3, x + 25, y - 4, '#564935', 10); this.line(x - 22, y - 6, x + 24, y + 6, '#776044', 9);
    this.path([[x - 19, y - 6], [x - 23, y - 25], [x - 11, y - 21], [x - 3 + Math.sin(time * 7) * 4, y - 67], [x + 10, y - 32], [x + 21, y - 43], [x + 19, y - 6], [x, y + 3]], '#f09f55');
    this.path([[x - 11, y - 5], [x - 4, y - 36], [x + 3, y - 21], [x + 10, y - 29], [x + 11, y - 3]], '#ffe9a2');
  }
  private box(x: number, y: number, w: number, h: number, r: number, fill: string, stroke?: string, lw = 1) {
    const c = this.ctx; c.beginPath(); c.roundRect(x, y, Math.max(0, w), h, r); c.fillStyle = fill; c.fill(); if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); }
  }
  private ellipse(x: number, y: number, rx: number, ry: number, fill: string, stroke?: string, lw = 1) {
    const c = this.ctx; c.beginPath(); c.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), 0, 0, Math.PI * 2); c.fillStyle = fill; c.fill(); if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); }
  }
  private path(points: number[][], fill: string, stroke?: string, lw = 1) {
    const c = this.ctx; c.beginPath(); points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fillStyle = fill; c.fill(); if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke(); }
  }
  private line(x: number, y: number, x2: number, y2: number, color: string, width: number) {
    const c = this.ctx; c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.strokeStyle = color; c.lineWidth = width; c.lineCap = 'round'; c.stroke();
  }
}
