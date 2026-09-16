import {test,expect,chromium} from '@playwright/test';
test('menu starts itself when the host permits audible autoplay',async({},info)=>{
 test.skip(info.project.name!=='desktop','Chromium host-policy fixture');
 const browser=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
 try{const page=await browser.newPage();await page.goto('http://127.0.0.1:4173');
 await expect.poll(()=>page.locator('#menu-music').evaluate((a:HTMLAudioElement)=>!a.paused&&a.currentTime>.15)).toBe(true);
 }finally{await browser.close();}
});

test('a saved music-off preference stays silent even in an autoplay-permitting host',async({},info)=>{
 test.skip(info.project.name!=='desktop','Chromium host-policy fixture');
 const browser=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
 try{const page=await browser.newPage();await page.addInitScript(()=>localStorage.setItem('CapacitorStorage.emberbound.save.v1',JSON.stringify({version:2,settings:{music:false}})));
 await page.goto('http://127.0.0.1:4173');await expect(page.getByRole('button',{name:'Heroes',exact:true})).toBeVisible();
 await page.waitForTimeout(400);expect(await page.locator('#menu-music').evaluate((a:HTMLAudioElement)=>a.paused&&a.currentTime===0)).toBe(true);
 }finally{await browser.close();}
});
test('a browser that blocks autoplay starts music on the first real menu gesture',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Heroes',exact:true}).click();
 await expect.poll(()=>page.locator('#menu-music').evaluate((a:HTMLAudioElement)=>!a.paused&&a.currentTime>.15)).toBe(true);
});
