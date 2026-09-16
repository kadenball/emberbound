import {chromium} from '@playwright/test';
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1500,height:860}});await page.goto('http://127.0.0.1:4173');
 await page.evaluate(async()=>{
  const {drawSupplyStop}=await import('/src/supply-art.ts'),{Game}=await import('/src/engine.ts');await document.fonts.ready;
  const canvas=document.createElement('canvas');canvas.width=1500;canvas.height=860;canvas.style='position:fixed;inset:0;width:100%;height:100%;z-index:10000';document.body.append(canvas);
  const c=canvas.getContext('2d');c.fillStyle='#2e3037';c.fillRect(0,0,1500,860);
  for(let region=0;region<6;region++){
   const x=region%3*500,y=Math.floor(region/3)*430,g=new Game('ember',region*2,{strength:0,vitality:0,spirit:0}),trap=g.setpieces.find(t=>t.road);
   c.save();c.translate(x,y);c.beginPath();c.rect(0,0,500,425);c.clip();c.fillStyle=['#545946','#52646b','#495d54','#69515d','#5e594d','#5c5164'][region];c.fillRect(5,5,490,415);
   c.fillStyle='#e4d5b0';c.font='bold 18px monospace';c.textAlign='center';c.fillText(['WOODS','FREEZER','LAUNDRY','CANDY','JUNKYARD','KEEP'][region]+' · STAGED ACTIVE POSE',250,35);
   c.translate(250,345);c.scale(1.1,1.1);drawSupplyStop(c,{...trap,x:0,y:0,clock:1.3},region,true,3);c.restore();
  }
 });await page.screenshot({path:'artifacts/supply-roster.png'});
 await page.setViewportSize({width:844,height:390});
 await page.evaluate(async()=>{
  const {Renderer}=await import('/src/render.ts'),{Game}=await import('/src/engine.ts');
  const canvas=document.querySelector('canvas[style*="10000"]'),g=new Game('ember',10,{strength:3,vitality:3,spirit:3},140);
  // Staged lower-edge fixture for layer/floor review, not a played campaign frame.
  const trap=g.setpieces.filter(t=>t.road)[1];Object.assign(g,{wave:3,cleared:true});g.player.x=trap.x-90;g.player.y=450;trap.clock=1.3;
  const renderer=new Renderer(canvas);renderer.camera=g.player.x-renderer.width*.36;renderer.draw(g,'ember',10,3,false);
 });await page.screenshot({path:'artifacts/supply-lower-keep.png'});
}finally{await browser.close();}
