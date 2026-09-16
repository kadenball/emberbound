import {chromium} from '@playwright/test';
import {writeFile,mkdir,rm} from 'node:fs/promises';
const browser=await chromium.launch();
await mkdir('artifacts/animation-recording',{recursive:true});
try{
 const context=await browser.newContext({viewport:{width:1280,height:720},recordVideo:{dir:'artifacts/animation-recording',size:{width:1280,height:720}}});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173');
 await page.evaluate(async()=>{
  const {drawPlush}=await import('/src/plush.ts'),{moveFor}=await import('/src/combat.ts'),{drawImpact}=await import('/src/impact-art.ts');
  document.querySelector('#ui').style.display='none';document.querySelector('#game').style.display='none';
  const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;canvas.style.cssText='position:fixed;inset:0;width:100%;height:100%;background:#243a36';document.body.append(canvas);const c=canvas.getContext('2d');
  const names=['ember','frost','moss','raider','archer','brute','shield','bomber','charger','healer','flanker'];const labels=['ASH · FIRE LIZARD','WREN · SEWER BIRD','BRAM · SLUG-TOAD','RATCHET RAT','SYRINGE MOSQUITO','KNUCKLE MILDEW','HERMIT BASTARD','BLOAT TICK','ROAD-HOG ROAST','MALPRACTICE JELLY','SOCKTOPEDE'];
  const start=performance.now();
  function draw(now){const t=(now-start)/1000;c.fillStyle='#203934';c.fillRect(0,0,1280,720);c.fillStyle='#def09b';c.font='bold 24px monospace';c.textAlign='center';c.fillText('CREATURE MOTION STUDY · 0.7',640,33);c.font='12px monospace';c.fillStyle='#d3d4bc';c.fillText('Production renderer · staged walk / anticipation / strike / recovery / impact poses',640,55);
   names.forEach((id,i)=>{const hero=i<3,col=hero?i:i<7?i-3:i-7,row=hero?0:i<7?1:2,x=hero?230+col*405:160+col*320,y=hero?245:row===1?453:660;const phase=t%2.1,move=moveFor(['light','launcher','bowl','spin'][Math.floor(t/2.1)%4]),duration=move.startup+move.active+move.recovery;
    const attacking=phase>1.2&&phase<1.2+duration,elapsed=phase-1.2,attack=attacking?{move,elapsed,hit:new Set(),propHit:new Set(),connected:elapsed>=move.startup,face:1}:null;
    const actor={x,y,face:1,hp:100,maxHp:100,hurt:phase>1.85?.12:0,walk:phase<1.1?t*13:0,attackTime:hero?(attacking?duration-elapsed:0):phase>1.6&&phase<1.84?1.84-phase:0};
    drawPlush(c,x,y,actor,t,hero?.96:.88,hero?{hero:id,weapon:'starter',attack}:{kind:id,windup:phase>1.1&&phase<1.6?1.6-phase:0});
    if(phase>1.62&&phase<1.86)drawImpact(c,{x:x+75,y:y-50,kind:i%2?'heavy':'hit',life:1.86-phase,duration:.24,color:'#ffe2a6',face:1});
    c.fillStyle=hero?'#eff1ba':'#bdc9c5';c.font='bold 12px monospace';c.textAlign='center';c.fillText(labels[i],x,y+29);
   });requestAnimationFrame(draw);
  }requestAnimationFrame(draw);
 });
 await page.waitForTimeout(600);await page.screenshot({path:'artifacts/creature-roster.png'});await page.waitForTimeout(8200);
 await context.close();await page.video().saveAs('artifacts/creature-animation.webm');await rm('artifacts/animation-recording',{recursive:true,force:true});
 await writeFile('artifacts/creature-animation.json',JSON.stringify({note:'Staged motion study using the production renderer, not a real fight or human playtest.',errors},null,2));console.log({errors});
}finally{await browser.close();}
