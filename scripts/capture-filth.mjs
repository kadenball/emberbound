import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173');await page.getByRole('button',{name:'Heroes',exact:true}).click();await page.screenshot({path:'artifacts/filth-heroes.png'});
 await page.getByRole('button',{name:'Back-alley surgery',exact:true}).click();await page.screenshot({path:'artifacts/filth-surgery.png'});
 await page.getByRole('button',{name:'Armory & combos'}).click();await page.screenshot({path:'artifacts/filth-progression.png',fullPage:true});
 const scenes=await page.evaluate(async()=>{
  const {Game,idleInput}=await import('/src/engine.ts'),{Renderer}=await import('/src/render.ts');const canvas=document.createElement('canvas'),r=new Renderer(canvas),images=[];
  for(const hero of ['ember','frost','moss']){
   const g=new Game(hero,0,{strength:0,vitality:0,spirit:0},7);g.props=[];g.player.x=600;g.player.y=460;
   g.spawn('brute',780,455).cooldown=10;g.spawn('shield',875,470).cooldown=10;g.spawn('archer',1000,400).cooldown=10;
   if(hero==='ember')g.player.filth=100;
   g.update(1/60,{...idleInput(),magic:true});r.camera=100;r.draw(g,hero,0,2,false);images.push({hero,image:canvas.toDataURL()});
  }return images;
 });
 for(const s of scenes)await writeFile(`artifacts/filth-${s.hero}.png`,Buffer.from(s.image.split(',')[1],'base64'));
 const mobile=await browser.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true});await mobile.goto('http://127.0.0.1:4173');await mobile.locator('[data-action="start"]').click();await mobile.screenshot({path:'artifacts/filth-mobile.png'});
 await writeFile('artifacts/filth-captures.json',JSON.stringify({version:'0.6.0',note:'Heroes, surgery, progression and mobile are real UI. Three isolated power images are staged simulation fixtures rendered by production Canvas code; not human playtest evidence.',errors},null,2));console.log({errors});
}finally{await browser.close();}
