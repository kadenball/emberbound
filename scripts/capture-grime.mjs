import {chromium} from '@playwright/test';
const browser=await chromium.launch();const errors=[];
try {
 const page=await browser.newPage({viewport:{width:1440,height:900}});page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173');await page.evaluate(()=>document.fonts.ready);
 await page.locator('[data-action="start"]').click();await page.locator('[data-action="story-skip"]').click();await page.screenshot({path:'artifacts/grime-woods-game.png'});
 // Art inspection fixtures: actual renderer and engine, placed at the region's first machinery encounter.
 for(let region=0;region<6;region++){
  await page.evaluate(async(region)=>{
   const [{Renderer},{Game},{freshSave}]=await Promise.all([import('/src/render.ts'),import('/src/engine.ts'),import('/src/save.ts')]);
   let canvas=document.querySelector('#inspection');if(!canvas){canvas=document.createElement('canvas');canvas.id='inspection';canvas.style='position:fixed;inset:0;width:100%;height:100%;z-index:1000';document.body.append(canvas);}
   const g=new Game('ember',region*2,freshSave().upgrades);g.wave=1;g.player.x=g.encounters[1].x+260;g.player.y=490;g.setpieces[0].clock=2.1;g.spawn('brute',g.player.x+180,460);g.spawn('archer',g.player.x+380,430);g.time=2.1;
   const renderer=new Renderer(canvas);renderer.camera=g.player.x-renderer.width*.36;renderer.draw(g,'ember',region*2,2.1,false);
  },region);await page.screenshot({path:`artifacts/grime-region-${region+1}.png`});
 }
 const mobile=await browser.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true});mobile.on('pageerror',e=>errors.push(e.message));await mobile.goto('http://127.0.0.1:4173');await mobile.locator('[data-action="start"]').click();await mobile.locator('[data-action="story-skip"]').click();await mobile.screenshot({path:'artifacts/grime-mobile.png'});
 console.log(JSON.stringify({pageErrors:errors}));if(errors.length)process.exitCode=1;
}finally{await browser.close();}
