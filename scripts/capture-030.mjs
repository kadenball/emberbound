// Staged rendering review; combat and campaign tests separately exercise real inputs.
import {chromium} from '@playwright/test';
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1760,height:960}});await page.goto('http://127.0.0.1:4173');
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.evaluate(async()=>{
  const {drawPlush}=await import('/src/plush.ts'),{loadHeroArt}=await import('/src/hero-art.ts'),{loadEnemyArt}=await import('/src/enemy-art.ts'),{moveFor}=await import('/src/combat.ts');await Promise.all([loadHeroArt(),loadEnemyArt(),document.fonts.ready]);
  const canvas=document.createElement('canvas');canvas.width=1760;canvas.height=960;canvas.id='review';canvas.style='position:fixed;inset:0;z-index:1000;width:100%;height:100%';document.body.append(canvas);
  const c=canvas.getContext('2d');c.fillStyle='#263f40';c.fillRect(0,0,1760,960);
  const kinds=['light','light','launcher','launcher','bowl','bowl','slam','kick'];
  ['ember','frost','moss'].forEach((hero,row)=>kinds.forEach((kind,col)=>{
   const move=moveFor(kind),attack={move,elapsed:col%2||col>5?move.startup+.02:.02};
   drawPlush(c,105+col*220,250+row*300,{x:0,y:0,hp:100,maxHp:100,face:1,hurt:0,walk:0,attackTime:1},1,1.1,{hero,weapon:'starter',attack});
   c.fillStyle='#fce4b6';c.font='16px sans-serif';c.fillText(kind+(col%2?' contact':' load'),col*220+35,row*300+285);
  }));
 });await page.screenshot({path:'artifacts/attacks-030.png'});
 await page.evaluate(async()=>{
  const {drawPlush}=await import('/src/plush.ts');const c=document.querySelector('#review').getContext('2d');c.fillStyle='#263f40';c.fillRect(0,0,1760,960);
  ['raider','shield','brute','charger','archer','bomber','healer','flanker'].forEach((kind,index)=>{
   const row=index%4,offset=index<4?0:880;
   for(let frame=0;frame<4;frame++){
    drawPlush(c,offset+110+frame*215,203+row*230,{x:0,y:0,hp:100,maxHp:100,face:1,hurt:0,walk:frame===1?1:0,attackTime:frame===3?.2:0},1,1,{kind,windup:frame===2?.4:0});
    c.fillStyle='#fce4b6';c.font='15px sans-serif';c.fillText(`${kind} ${frame}`,offset+frame*215+45,row*230+224);
   }
  });
 });await page.screenshot({path:'artifacts/enemies-030.png'});
 await page.setViewportSize({width:1760,height:480});
 for(let region=0;region<6;region++){
  await page.evaluate(async region=>{
   const {drawScenery}=await import('/src/scenery.ts'),{drawGrimeDistrict}=await import('/src/grime-art.ts'),{journeyPlaces}=await import('/src/journey-art.ts');
   const canvas=document.querySelector('#review');canvas.height=480;const c=canvas.getContext('2d');c.fillStyle='#20282a';c.fillRect(0,0,1760,480);
   const stops=journeyPlaces(region*2).slice(-3);
   for(let i=0;i<3;i++){
    const cam=stops[i].x-555;c.save();c.translate(i*586,40);c.beginPath();c.rect(0,0,586,435);c.clip();c.scale(.53,.53);
    drawScenery(c,1106,820,cam,55,region,3,true);drawGrimeDistrict(c,1106,cam,region*2,3);c.restore();
    c.fillStyle='#fce4b6';c.font='20px sans-serif';c.fillText(stops[i].name,20+i*586,27);
   }
  },region);await page.screenshot({path:`artifacts/districts-030-${region}.png`});
 }
 await page.setViewportSize({width:844,height:390});
 for(let region=0;region<6;region++){
  await page.evaluate(async region=>{
   const {Game}=await import('/src/engine.ts'),{Renderer}=await import('/src/render.ts');
   const canvas=document.querySelector('#review');canvas.width=844;canvas.height=390;
   const g=new Game(['ember','frost','moss'][region%3],region*2,{strength:2,vitality:2,spirit:2},140);g.startWave(6+region%3);g.bannerTime=0;
   g.player.x=g.currentEncounter.x+310;g.player.y=g.currentEncounter.top+55;
   for(const e of g.enemies){e.entrance=0;e.z=0;e.windup=.4;}
   const renderer=new Renderer(canvas);renderer.camera=g.player.x-renderer.width*.36;renderer.draw(g,g.hero,region*2,3,false);
  },region);await page.screenshot({path:`artifacts/district-fight-030-${region}.png`});
 }
 if(errors.length)throw new Error(errors.join('\n'));
}finally{await browser.close();}
