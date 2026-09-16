import { chromium } from '@playwright/test';
const url=process.argv[2];
if(!url)throw Error('Usage: node scripts/check-built-game.mjs URL');
const browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
try{
 for(const viewport of [{width:1280,height:800},{width:844,height:390}]){
  const page=await browser.newPage({viewport});const errors=[];const audio=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());if(r.url().includes('/audio/'))audio.push(r.url());});
  await page.goto(url);
  await page.getByRole('button',{name:'Adventure',exact:true}).waitFor({timeout:7000});
  await page.getByRole('button',{name:'Adventure',exact:true}).click();
  await page.locator('[data-action="start"]').click();
  await page.locator('[data-action="story-skip"]').click();
  await page.getByLabel('Battle status').waitFor();
  await page.waitForTimeout(1000);
  if(errors.length)throw Error(JSON.stringify(errors));
  if(!audio.length||audio.some(u=>!u.startsWith(new URL('audio/',url).href)))throw Error('Audio paths did not respect deployment directory');
  console.log(JSON.stringify({viewport,combatVisible:true,audioRequests:audio.length,errors}));
  await page.close();
 }
}finally{await browser.close()}
