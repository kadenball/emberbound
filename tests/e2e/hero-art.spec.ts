import {test,expect} from '@playwright/test';

for(const hero of ['ember','frost','moss']) test(`${hero} loads transparent art and animates actual movement, Jump, Light and Power`,async({page},info)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  await page.getByRole('button',{name:'Heroes',exact:true}).click();
  await page.locator(`[data-hero="${hero}"]`).click();
  await expect(page.locator(`[data-hero="${hero}"] img`)).toBeVisible();
  const decoded=await page.evaluate(async hero=>{
    const url=performance.getEntriesByType('resource').map(r=>r.name).find(u=>u.includes('/src/hero-art.ts'))!;
    const {heroArtReady,heroPoseFrame}=await import(url);
    const engine=performance.getEntriesByType('resource').map(r=>r.name).find(u=>u.includes('/src/engine.ts'))!;
    const {Game}=await import(engine),original=Game.prototype.update;
    (window as any).heroFrames=[];
    Game.prototype.update=function(dt,input,partner){
      const result=original.call(this,dt,input,partner),p=this.player;
      const frame=heroPoseFrame(p,{attack:p.attack,z:p.z,roll:p.roll,downed:p.downed,power:p.powerPose});
      if(!(window as any).heroFrames.includes(frame))(window as any).heroFrames.push(frame);
      return result;
    };
    const image=new Image();image.src=`/characters/${({ember:'ash',frost:'wren',moss:'bram'})[hero]}.png`;await image.decode();
    const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const ctx=c.getContext('2d')!;ctx.drawImage(image,0,0);
    const pixels=ctx.getImageData(0,0,c.width,c.height).data;let solid=0;
    for(let i=3;i<pixels.length;i+=4)if(pixels[i]>128)solid++;
    return {ready:heroArtReady(hero),width:image.width,height:image.height,corner:pixels[3],coverage:solid/(c.width*c.height)};
  },hero);
  expect(decoded.ready).toBe(true);expect(decoded.width).toBe(1536);expect(decoded.height).toBe(1024);
  expect(decoded.corner).toBeLessThanOrEqual(2);expect(decoded.coverage).toBeGreaterThan(.15);expect(decoded.coverage).toBeLessThan(.6);
  await page.screenshot({path:`artifacts/heroes-029-${hero}-${info.project.name}.png`});
  await page.getByRole('button',{name:'To adventure'}).click();
  await page.locator('[data-action="start"]').click();
  const skip=page.locator('[data-action="story-skip"]');if(await skip.isVisible())await skip.click();
  await expect(page.getByLabel('Battle status')).toBeVisible();
  await page.keyboard.down('d');await page.waitForTimeout(420);await page.keyboard.up('d');
  if(info.project.name==='desktop')await page.keyboard.press('Space');else await page.locator('#jump').tap();
  await expect.poll(()=>page.evaluate(()=>(window as any).heroFrames)).toContain(3);
  await page.screenshot({path:`artifacts/hero-jump-029-${hero}-${info.project.name}.png`});
  await expect(page.locator('#air-status')).not.toContainText('LIGHT: JUGGLE');
  if(info.project.name==='desktop')await page.keyboard.press('j');else await page.locator('#attack').tap();
  await expect.poll(()=>page.evaluate(()=>(window as any).heroFrames)).toContain(5);
  if(info.project.name==='desktop')await page.keyboard.press('k');else await page.locator('#magic').tap();
  await expect.poll(()=>page.evaluate(()=>(window as any).heroFrames)).toContain(6);
  await page.screenshot({path:`artifacts/hero-power-029-${hero}-${info.project.name}.png`});
  const frames=await page.evaluate(()=>(window as any).heroFrames);
  for(const frame of [0,1,2,3,4,5,6])expect(frames).toContain(frame);
  expect(errors).toEqual([]);
});

test('a failed character asset still permits menus and a real jump',async({page})=>{
  await page.route('**/characters/ash.png',route=>route.abort());
  await page.goto('/');
  await page.locator('[data-action="start"]').click();
  const skip=page.locator('[data-action="story-skip"]');if(await skip.isVisible())await skip.click();
  await page.keyboard.press('Space');
  await expect(page.locator('#air-status')).toContainText('LIGHT: JUGGLE');
});
