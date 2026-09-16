import {chromium} from '@playwright/test';
import {mkdir,rm,writeFile} from 'node:fs/promises';
const b=await chromium.launch();await mkdir('artifacts/boss-video',{recursive:true});const errors=[];
try {
 const ctx=await b.newContext({viewport:{width:1440,height:1000},recordVideo:{dir:'artifacts/boss-video',size:{width:1440,height:1000}}});const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173');await page.evaluate(()=>document.fonts.ready);
 await page.evaluate(async()=>{
  const {drawPlush}=await import('/src/plush.ts'),{BOSS_PERFORMANCES}=await import('/src/boss-performance.ts');
  document.querySelector('#ui').style.display='none';document.querySelector('#game').style.display='none';const canvas=document.createElement('canvas');canvas.width=1440;canvas.height=1000;canvas.style='position:fixed;inset:0;width:100%;height:100%';document.body.append(canvas);const c=canvas.getContext('2d'),start=performance.now();
  function draw(now){const t=(now-start)/1000;c.fillStyle='#20372f';c.fillRect(0,0,1440,1000);c.textAlign='center';c.font='30px Bangers';c.fillStyle='#d4e795';c.fillText('MANAGEMENT HAS SIX VERY DIFFERENT PROBLEMS',720,42);c.font='12px monospace';c.fillStyle='#c3cbb1';c.fillText('Production boss art · staged entrance / windup / breakdown / recovery / defeat',720,67);
   for(let region=0;region<6;region++){
    const x=240+region%3*480,y=470+Math.floor(region/3)*440,phase=t%12,kind=phase<2?'entrance':phase>5&&phase<6.5?'rage':phase>9.5?'defeat':null;
    const moment=kind?{kind,boss:1,region,clock:kind==='entrance'?phase:kind==='rage'?phase-5:phase-9.5,duration:kind==='rage'?1.5:2.5,x,y}:null;
    const state=phase<3?'idle':phase<4?'windup':phase<5?(region===2?'inhale':region===4?'spin':'recover'):phase<7?'idle':phase<8?'windup':region===2?'jammed':'recover';
    drawPlush(c,x,y,{x,y,hp:phase>5?40:100,maxHp:100,face:1,hurt:0,walk:state==='spin'?t*25:0,attackTime:phase>4&&phase<4.35?4.35-phase:0},t,1.32,{kind:'boss',stage:region,bossState:state,bossTimer:state==='windup'?(phase<4?4-phase:8-phase):1,enraged:phase>5,moment,dead:kind==='defeat'?.85:undefined});
    c.font='24px Bangers';c.fillStyle='#e7d9b8';c.fillText(BOSS_PERFORMANCES[region].title,x,y+44);c.font='11px monospace';c.fillStyle='#b2c4a7';c.fillText(kind??state.toUpperCase(),x,y+64);
   }requestAnimationFrame(draw);
  }requestAnimationFrame(draw);
 });
 await page.waitForTimeout(1000);await page.screenshot({path:'artifacts/boss-roster.png'});await page.waitForTimeout(4700);await page.screenshot({path:'artifacts/boss-breakdowns.png'});await page.waitForTimeout(4700);await page.screenshot({path:'artifacts/boss-defeats.png'});await page.waitForTimeout(1200);await ctx.close();await page.video().saveAs('artifacts/boss-performance.webm');await rm('artifacts/boss-video',{recursive:true,force:true});await writeFile('artifacts/boss-performance.json',JSON.stringify({note:'Staged six-boss motion study using production drawing functions. Not actual gameplay.',pageErrors:errors},null,2));console.log({errors});
}finally{await b.close();}
