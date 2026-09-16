import {chromium} from '@playwright/test';
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});await page.goto('http://127.0.0.1:4173');await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'artifacts/story-home.png'});
 await page.locator('[data-action="start"]').click();await page.screenshot({path:'artifacts/story-prologue.png'});await page.locator('[data-action="story-next"]').click();await page.screenshot({path:'artifacts/story-dialogue.png'});
 const mobile=await browser.newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true});await mobile.goto('http://127.0.0.1:4173');await mobile.locator('[data-action="start"]').click();await mobile.screenshot({path:'artifacts/story-mobile.png'});await mobile.locator('[data-action="story-skip"]').click();await mobile.screenshot({path:'artifacts/story-mobile-battle.png'});
 await page.locator('[data-action="story-skip"]').click();await page.getByRole('button',{name:'Pause game'}).click();await page.getByRole('button',{name:'Return to camp'}).click();await page.getByRole('button',{name:'Adventure',exact:true}).click();await page.screenshot({path:'artifacts/story-campaign.png'});
}finally{await browser.close();}
