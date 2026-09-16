import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch();
try {
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:4173');await page.getByRole('button',{name:'Begin adventure'}).click();await page.getByRole('button',{name:/Bring a friend/}).click();
 await page.locator('[data-partner="frost"]').click();await page.screenshot({path:'artifacts/local-coop.png'});
 await page.getByRole('button',{name:'Party ready'}).click();await page.locator('[data-action="start"]').click();await page.keyboard.down('d');await page.waitForTimeout(1400);await page.keyboard.up('d');
 await page.screenshot({path:'artifacts/redesigned-gameplay.png'});
 const scenes=await page.evaluate(async()=>{
  const {Game}=await import('/src/engine.ts'),{Renderer}=await import('/src/render.ts');const canvas=document.createElement('canvas'),r=new Renderer(canvas),result=[];
  for(const scene of ['bridge','bowling','laundry']){
   const g=new Game('ember',scene==='laundry'?5:0,{strength:0,vitality:0,spirit:0},7,{xp:500,weapon:'pan',partner:'frost'});
   const x=scene==='bridge'?1600:scene==='bowling'?2700:2250;g.player.x=x;g.player.y=470;g.players[1].x=x-160;g.players[1].y=425;g.wave=scene==='bridge'?1:2;
   if(scene==='laundry'){
    const e=g.spawn('boss',2500,455);e.bossState='jammed';e.bossTimer=2;e.hp=e.maxHp*.55;g.label(e.x,e.y-245,'SOCK BLOCKED!');
    for(let i=0;i<2;i++)g.props.push({id:800+i,kind:'laundry',x:2350-i*105,y:465+i*50,hp:1,active:false});
   }else{
    const e=g.spawn('brute',x+170,460);e.windup=.5;e.targetX=x;e.targetY=470;
    g.spawn('flanker',x-95,430);g.spawn('shield',x+330,445);
    if(scene==='bowling'){const b=g.spawn('raider',x+80,465);b.bowlTime=.6;b.vx=650;b.knockdown=.6;g.props.push({id:800,kind:'spring',x:x+155,y:480,hp:1,active:false});g.label(x+90,330,'STUFFING STRIKE!');}
    else g.cart={x:x+470,y:480,goal:x+550,moving:false,complete:false};
   }
   r.camera=x-550;const times=[];
   for(let i=0;i<40;i++){await new Promise(requestAnimationFrame);const t=performance.now();r.draw(g,'ember',g.stage,3,false);if(i>5)times.push(performance.now()-t);}
   times.sort((a,b)=>a-b);result.push({scene,median:times[17],p95:times[32],image:canvas.toDataURL()});
  }return result;
 });
 for(const s of scenes){await writeFile(`artifacts/redesign-${s.scene}.png`,Buffer.from(s.image.split(',')[1],'base64'));delete s.image;}
 await page.getByRole('button',{name:'Pause game'}).click();await page.getByRole('button',{name:'Return to camp'}).click();
 await page.setViewportSize({width:844,height:390});await page.getByRole('button',{name:'Settings',exact:true}).click();await page.locator('[data-setting="touch"]').check();await page.getByRole('button',{name:'All set'}).click();await page.locator('[data-action="start"]').click();
 await page.keyboard.down('d');await page.waitForTimeout(1100);await page.keyboard.up('d');await page.screenshot({path:'artifacts/redesign-mobile.png'});
 await writeFile('artifacts/redesign-render-timings.json',JSON.stringify({note:'Staged visual fixtures, headless desktop Canvas submission timings; not physical-device FPS or real-play screenshots. Menu/mobile captures use real UI/input.',scenes,errors},null,2));console.log({scenes,errors});
}finally{await browser.close();}
