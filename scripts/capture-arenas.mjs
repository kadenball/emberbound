import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch(),errors=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173');await page.evaluate(()=>document.fonts.ready);
 const measurements=[];
 for(let region=0;region<6;region++){
  const result=await page.evaluate(async region=>{
   const {Renderer}=await import('/src/render.ts'),{Game}=await import('/src/engine.ts'),{stagePreview}=await import('/src/scenery.ts');
   let canvas=document.querySelector('#arena-study');if(!canvas){canvas=document.createElement('canvas');canvas.id='arena-study';canvas.style='position:fixed;inset:0;width:100%;height:100%;z-index:1000';document.body.append(canvas);}
   // Explicit visual fixture, not a real-play screenshot or balance test.
   const stage=region*2+1,g=new Game('ember',stage,{strength:1,vitality:1,spirit:1},140);g.wave=2;g.player.x=2180;g.player.y=480;
   const boss=g.spawn('boss',2400,455);boss.bossState='windup';boss.bossTimer=.6;boss.windup=.6;boss.targetX=2180;boss.targetY=480;boss.targetZ=0;
   const renderer=new Renderer(canvas);renderer.camera=1552;const times=[];
   for(let frame=0;frame<36;frame++){await new Promise(requestAnimationFrame);const start=performance.now();renderer.draw(g,'ember',stage,frame/60+3,false);if(frame>=6)times.push(performance.now()-start);}
   times.sort((a,b)=>a-b);return {region,medianDrawMs:times[15],p95DrawMs:times[28],terrainChunks:renderer.sceneryCache.terrain.size,preview:stagePreview(stage)};
  },region);
  await page.screenshot({path:`artifacts/arena-region-${region+1}.png`});await writeFile(`artifacts/arena-preview-${region+1}.png`,Buffer.from(result.preview.split(',')[1],'base64'));delete result.preview;measurements.push(result);
 }
 await page.setViewportSize({width:1440,height:1050});
 await page.evaluate(async()=>{
  const {ARENA_START,drawArenaBackdrop,drawArenaMotion}=await import('/src/arena-art.ts');const canvas=document.querySelector('#arena-study');canvas.width=1440;canvas.height=1050;const c=canvas.getContext('2d');c.fillStyle='#20262a';c.fillRect(0,0,1440,1050);
  for(let region=0;region<6;region++){const x=region%2*720,y=Math.floor(region/2)*350;c.save();c.translate(x+9,y+17);c.beginPath();c.rect(0,0,702,326);c.clip();c.scale(.575,.575);c.translate(-ARENA_START,0);drawArenaBackdrop(c,region);drawArenaMotion(c,region,3);c.restore();}
 });
 await page.screenshot({path:'artifacts/arena-roster.png'});
 await writeFile('artifacts/arena-render-timings.json',JSON.stringify({note:'Staged production-renderer visual fixtures. Headless desktop Chromium cached Canvas submission timings, not physical-device FPS, GPU completion or human play evidence. Real boss UI captures are produced separately by the existing browser suite.',measurements,pageErrors:errors},null,2)+'\n');
 console.log(JSON.stringify({measurements,pageErrors:errors}));if(errors.length)process.exitCode=1;
}finally{await browser.close();}
