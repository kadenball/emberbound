import {test,expect} from '@playwright/test';
test('the live chain shows three earned hits and accepts the separate directional quake',async({page},info)=>{
 await page.addInitScript(()=>localStorage.setItem('CapacitorStorage.emberbound.save.v1',JSON.stringify({version:2,xp:900,hero:'ember',style:'scrapper',weapons:['starter'],equipped:'starter',storySeen:['intro-0']})));
 await page.goto('/');await page.evaluate(async()=>{
  const url=performance.getEntriesByType('resource').map(r=>r.name).find(url=>url.includes('/src/engine.ts'))!;
  const {Game}=await import(url),update=Game.prototype.update;let foe:any;
  const probe={ready:false,release:false,done:false};(window as any).recipe=probe;
  Game.prototype.update=function(dt,input,partner){
   if(!foe){this.props=[];foe=this.spawn('brute',this.player.x+35,this.player.y);foe.stun=10;foe.hp=foe.maxHp=1000;}
   if(probe.done||probe.ready&&!probe.release)return false;
   const result=update.call(this,dt,input,partner);
   if(this.player.combo===3)probe.ready=true;
   if(this.player.attack?.move.kind==='quake')probe.done=true;
   return result;
  };
 });
 await page.locator('[data-action="start"]').click();await page.keyboard.down('j');
 await expect.poll(()=>page.evaluate(()=>(window as any).recipe.ready)).toBe(true);await page.keyboard.up('j');
 await expect(page.locator('#combo-chain i.filled')).toHaveCount(3);await expect(page.locator('#air-status')).toContainText('HEAVY → SPIN');await expect(page.locator('#air-status')).toContainText('↓ + HEAVY: QUAKE');
 await page.screenshot({path:`artifacts/chain-ready-${info.project.name}.png`});
 if(info.project.name==='android'){
  const cdp=await page.context().newCDPSession(page),stick=(await page.locator('#stick').boundingBox())!,heavy=(await page.locator('#heavy').boundingBox())!;
  const first={id:1,x:stick.x+stick.width/2,y:stick.y+stick.height/2};
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[first]});first.y+=35;
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[first]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[first,{id:2,x:heavy.x+heavy.width/2,y:heavy.y+heavy.height/2}]});
  await page.evaluate(()=>(window as any).recipe.release=true);await expect.poll(()=>page.evaluate(()=>(window as any).recipe.done)).toBe(true);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 }else{
  await page.keyboard.down('s');await page.keyboard.down('h');await page.evaluate(()=>(window as any).recipe.release=true);
  await expect.poll(()=>page.evaluate(()=>(window as any).recipe.done)).toBe(true);await page.keyboard.up('s');await page.keyboard.up('h');
 }
 await page.screenshot({path:`artifacts/chain-quake-${info.project.name}.png`});
});
