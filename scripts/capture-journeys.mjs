import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch(),errors=[];
try{
 const page=await browser.newPage({viewport:{width:1920,height:840}});page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173');await page.evaluate(()=>document.fonts.ready);
 for(let region=0;region<6;region++){
  const result=await page.evaluate(async region=>{
   const {drawScenery,stagePreview}=await import('/src/scenery.ts'),{drawGrimeDistrict}=await import('/src/grime-art.ts'),{journeyPlaces,drawJourneyMotion}=await import('/src/journey-art.ts');
   let canvas=document.querySelector('#journey-study');if(!canvas){canvas=document.createElement('canvas');canvas.id='journey-study';canvas.style='position:fixed;inset:0;width:100%;height:100%;z-index:1000';document.body.append(canvas);}
   canvas.width=1920;canvas.height=840;const c=canvas.getContext('2d');c.fillStyle='#20282a';c.fillRect(0,0,1920,840);
   const stage=region*2,stops=[{x:570,name:'THE REGION ENTRANCE',encounter:0},...journeyPlaces(stage)];
   for(let i=0;i<stops.length;i++){
    const x=i%3*640,y=Math.floor(i/3)*420,cam=stops[i].x-582;
    c.save();c.translate(x,y+23);c.beginPath();c.rect(0,0,640,391);c.clip();c.scale(.55,.55);c.translate(0,55);
    drawScenery(c,1164,711,cam,55,region,3,true);drawGrimeDistrict(c,1164,cam,stage,3);c.save();c.translate(-cam,0);drawJourneyMotion(c,1164,cam,stage,3);c.restore();c.restore();
    c.fillStyle='#e1dab4';c.font='14px monospace';c.textAlign='left';c.fillText(`${i+1}. ${stops[i].name}`,x+9,y+17);
   }
   return {preview:stagePreview(stage)};
  },region);
  await page.screenshot({path:`artifacts/journey-roster-${region+1}.png`});await writeFile(`artifacts/journey-preview-${region+1}.png`,Buffer.from(result.preview.split(',')[1],'base64'));
 }
 await page.setViewportSize({width:844,height:390});const timings=[];
 for(let region=0;region<6;region++){
  const result=await page.evaluate(async region=>{
   const {Renderer}=await import('/src/render.ts'),{Game}=await import('/src/engine.ts'),{journeyPlaces}=await import('/src/journey-art.ts');
   const canvas=document.querySelector('#journey-study'),stage=region*2,place=journeyPlaces(stage)[[0,3,1,1,3,4][region]];
   // Staged full-renderer fixture. No claims of actual campaign play or native FPS.
   const g=new Game('ember',stage,{strength:1,vitality:1,spirit:1},140);g.wave=place.encounter;g.player.x=place.x-70;g.player.y=g.currentEncounter.top;
   const foe=g.spawn('brute',place.x+130,g.currentEncounter.top+45);foe.windup=.4;foe.targetX=g.player.x;foe.targetY=g.player.y;
   const renderer=new Renderer(canvas),times=[];renderer.camera=Math.max(0,g.cameraFocus-renderer.width*.36);
   for(let i=0;i<24;i++){await new Promise(requestAnimationFrame);const start=performance.now();renderer.draw(g,'ember',stage,3+i/60,false);if(i>3)times.push(performance.now()-start);}
   times.sort((a,b)=>a-b);const medianMs=times[10],p95Ms=times[18],initialX=g.player.x,initialCamera=renderer.camera,cold=[];let maxChunks=0;
   for(let i=0;i<110;i++){
    await new Promise(requestAnimationFrame);g.player.x=200+i*(g.worldWidth-550)/110;
    const before=[...renderer.sceneryCache.terrain.keys()],start=performance.now();renderer.draw(g,'ember',stage,4+i/60,false);const elapsed=performance.now()-start;
    if([...renderer.sceneryCache.terrain.keys()].some(k=>!before.includes(k)))cold.push(elapsed);
    maxChunks=Math.max(maxChunks,renderer.sceneryCache.terrain.size);
   }
   cold.sort((a,b)=>a-b);g.player.x=initialX;renderer.camera=initialCamera;renderer.draw(g,'ember',stage,3,false);
   window.journeyFixture={g,renderer,stage};return {region,medianMs,p95Ms,maxChunks,coldTileBuilds:cold.length,coldMedianMs:cold[Math.floor(cold.length/2)],coldMaxMs:cold.at(-1)};
  },region);
  timings.push(result);await page.screenshot({path:`artifacts/journey-fight-${region+1}.png`});
  await page.evaluate(()=>{const {g,renderer,stage}=window.journeyFixture;g.cleared=true;g.enemies=[];renderer.draw(g,'ember',stage,3,false);});
  await page.screenshot({path:`artifacts/journey-after-${region+1}.png`});
 }
 await writeFile('artifacts/journey-render-timings.json',JSON.stringify({note:'Staged art fixtures with headless desktop Chromium at a phone-sized viewport; Canvas submission timing excludes GPU completion, thermals and native-device frame pacing.',timings,pageErrors:errors},null,2)+'\n');console.log(JSON.stringify({timings,pageErrors:errors}));if(errors.length)process.exitCode=1;
}finally{await browser.close();}
