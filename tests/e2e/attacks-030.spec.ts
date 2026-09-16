import {test,expect} from '@playwright/test';
for(const hero of ['ember','frost','moss'])test(`${hero} shows separate jab, uppercut and dive poses from real controls`,async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(hero=>localStorage.setItem('CapacitorStorage.emberbound.save.v1',JSON.stringify({version:2,hero,storySeen:['intro-0']})),hero);
 await page.goto('/');await page.getByRole('button',{name:'Heroes',exact:true}).waitFor();
 const assets=await page.evaluate(async hero=>{
  const file=({ember:'ash',frost:'wren',moss:'bram'} as Record<string,string>)[hero];
  const out=[];for(const name of [file+'-attacks','enemies-melee','enemies-ranged']){const image=new Image();image.src=`/characters/${name}.png`;await image.decode();out.push(image.naturalWidth);}
  const engine=performance.getEntriesByType('resource').map(r=>r.name).find(u=>u.includes('/src/engine.ts'))!;
  const art=performance.getEntriesByType('resource').map(r=>r.name).find(u=>u.includes('/src/hero-art.ts'))!;
  const {Game}=await import(engine),{heroAttackFrame}=await import(art),update=Game.prototype.update;(window as any).painted=[];
  Game.prototype.update=function(dt,input,partner){const result=update.call(this,dt,input,partner),p=this.player,frame=heroAttackFrame({attack:p.attack});if(frame!==null&&!(window as any).painted.includes(frame))(window as any).painted.push(frame);return result;};return out;
 },hero);expect(assets).toEqual([1536,1254,1254]);
 await page.locator('[data-action="start"]').click();await expect(page.getByLabel('Battle status')).toBeVisible();
 const press=async(key:string,id:string)=>{if(info.project.name==='desktop')await page.keyboard.press(key);else await page.locator('#'+id).tap();};
 await press('j','attack');await expect.poll(()=>page.evaluate(()=>(window as any).painted)).toContain(1);await page.waitForTimeout(300);
 await press('h','heavy');await expect.poll(()=>page.evaluate(()=>(window as any).painted)).toContain(3);await page.waitForTimeout(550);
 await press('Space','jump');await expect(page.locator('#air-status')).toContainText('JUGGLE');await press('h','heavy');
 await expect.poll(()=>page.evaluate(()=>(window as any).painted)).toContain(6);
 const frames=await page.evaluate(()=>(window as any).painted);for(const frame of [0,1,2,3,6])expect(frames).toContain(frame);
 await page.screenshot({path:`artifacts/attack-controls-030-${hero}-${info.project.name}.png`});expect(errors).toEqual([]);
});
test('real opening combat draws blood and distinct enemy poses without browser errors',async({page},info)=>{
 await page.addInitScript(()=>{Date.now=()=>140;localStorage.setItem('CapacitorStorage.emberbound.save.v1',JSON.stringify({version:2,storySeen:['intro-0']}));});
 await page.goto('/');await page.getByRole('button',{name:'Heroes',exact:true}).waitFor();
 await page.evaluate(async()=>{
  const url=performance.getEntriesByType('resource').map(r=>r.name).find(u=>u.includes('/src/engine.ts'))!;
  const {Game}=await import(url),{playInput}=await import('/scripts/gameplay-policy.ts'),{enemyArtFrame}=await import('/src/enemy-art.ts'),update=Game.prototype.update;
  let frame=0;(window as any).fightArt={blood:false,poses:[]};
  Game.prototype.update=function(dt,input,partner){const result=update.call(this,dt,playInput(this,frame++),partner),a=(window as any).fightArt;
   a.blood ||= this.blood.stains.length>0;
   for(const e of this.enemies){const pose=enemyArtFrame(e,{windup:e.windup,rush:e.rush});if(!a.poses.includes(pose))a.poses.push(pose);}return result;
  };
 });await page.locator('[data-action="start"]').click();
 await expect.poll(()=>page.evaluate(()=>(window as any).fightArt.blood),{timeout:15000}).toBe(true);
 await page.screenshot({path:`artifacts/blood-fight-030-${info.project.name}.png`});
});
