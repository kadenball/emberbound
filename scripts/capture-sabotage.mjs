import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch(),errors=[];
try {
 const page=await browser.newPage({viewport:{width:1440,height:900}});page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173');await page.evaluate(()=>document.fonts.ready);
 for(let region=0;region<6;region++)for(const phase of ['ready','running','wrecked']){
  await page.evaluate(async({region,phase})=>{
   const [{Renderer},{Game},{freshSave}]=await Promise.all([import('/src/render.ts'),import('/src/engine.ts'),import('/src/save.ts')]);
   let canvas=document.querySelector('#inspection');if(!canvas){canvas=document.createElement('canvas');canvas.id='inspection';canvas.style='position:fixed;inset:0;width:100%;height:100%;z-index:1000';document.body.append(canvas);}
   const g=new Game('ember',region*2,freshSave().upgrades),m=g.machines[0];g.wave=m.encounter;g.player.x=m.controlX+60;g.player.y=535;m.phase=phase;m.clock=1.7;g.props.find(p=>p.kind==='bell').active=phase!=='ready';g.spawn('brute',m.x-40,460);g.spawn('flanker',m.x+165,510);g.time=1.7;
   const renderer=new Renderer(canvas);renderer.camera=g.player.x-renderer.width*.36;renderer.draw(g,'ember',region*2,1.7,false);
  },{region,phase});await page.screenshot({path:`artifacts/workplace-${region+1}-${phase}.png`});
 }
 await writeFile('artifacts/workplaces.json',JSON.stringify({note:'Staged art fixtures using production geometry and renderer. See sabotage-*.png for accelerated actual-input UI captures.',pageErrors:errors},null,2));console.log({errors});if(errors.length)process.exitCode=1;
}finally{await browser.close();}
