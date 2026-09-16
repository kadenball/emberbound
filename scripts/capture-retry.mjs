import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch();const errors=[];
try {
 await Promise.all([{name:'desktop',width:1440,height:900},{name:'mobile',width:844,height:390},{name:'portrait',width:390,height:844}].map(async v=>{
  const page=await browser.newPage({viewport:{width:v.width,height:v.height},isMobile:v.name!=='desktop',hasTouch:v.name!=='desktop'});page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173');await page.locator('[data-action="start"]').click();await page.locator('[data-action="story-skip"]').click();
  await page.keyboard.down('d');await page.waitForTimeout(650);await page.keyboard.up('d');
  await expect(page.getByLabel('Defeat report')).toBeVisible({timeout:55000});await page.screenshot({path:`artifacts/retry-${v.name}.png`});
  await page.locator('[data-action="retry-fight"]').click();await expect(page.getByLabel('Battle status')).toBeVisible();await page.screenshot({path:`artifacts/retry-${v.name}-resumed.png`});
  console.log(`${v.name}: real opening death -> report -> same fight retry`);
 }));
 console.log(JSON.stringify({pageErrors:errors}));if(errors.length)process.exitCode=1;
}finally{await browser.close();}
