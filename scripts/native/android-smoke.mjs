// Runs against the dedicated emulator and its installed APK, never the Vite server.
import {_android} from 'playwright';
import {expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFile,mkdir,readFile} from 'node:fs/promises';
const version=JSON.parse(await readFile('package.json','utf8')).version;
const devices=await _android.devices({omitDriverInstall:true});
const device=devices.find(d=>d.serial()===(process.env.EMBERBOUND_ANDROID_SERIAL??'emulator-5554'));
assert(device,'Boot the dedicated emberbound_api36 emulator first.');assert(device.serial().startsWith('emulator-'),'This smoke script is for the dedicated emulator.');
device.setDefaultTimeout(25000);
const pkg='com.emberbound.game',checks=[],errors=[],report={version,serial:device.serial(),checks,errors};
let page,cdp;
const shell=async command=>(await device.shell(command)).toString().trim();
const attach=async()=>{const view=await device.webView({pkg});page=await view.page();page.setDefaultTimeout(20000);cdp=await page.context().newCDPSession(page);page.on('pageerror',e=>errors.push(e.message));return page;};
const tap=async locator=>{
 await locator.waitFor({state:'visible'});await locator.scrollIntoViewIfNeeded();
 const point=await locator.evaluate(el=>{const b=el.getBoundingClientRect();const x=(Math.max(0,b.left)+Math.min(innerWidth,b.right))/2,y=(Math.max(0,b.top)+Math.min(innerHeight,b.bottom))/2;return {x,y,hit:el.contains(document.elementFromPoint(x,y))};});
 assert(point.hit,'Touch target is obscured');
 const control=await locator.evaluate(el=>['jump','magic','attack','heavy','dodge'].includes(el.id));
 await locator.evaluate(el=>{window.__nativeSmokeTap=false;el.addEventListener('click',()=>{window.__nativeSmokeTap=true;},{once:true});});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:point.x,y:point.y}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 // Gameplay buttons consume pointer events; menu navigation completes on click.
 if(!control)await page.waitForFunction(()=>window.__nativeSmokeTap===true);
};
const screenshot=async name=>device.screenshot({path:`artifacts/native-${version}-${name}.png`});
const profile=async()=>{
 const xml=await shell(`run-as ${pkg} cat shared_prefs/CapacitorStorage.xml`);
 return page.evaluate(xml=>JSON.parse([...new DOMParser().parseFromString(xml,'application/xml').querySelectorAll('string')].find(e=>e.getAttribute('name')==='emberbound.save.v1').textContent),xml);
};
try{
 assert((await shell('getprop ro.boot.qemu.avd_name'))==='emberbound_api36','Use the dedicated emberbound_api36 AVD.');
 assert((await shell(`dumpsys package ${pkg}`)).includes(`versionName=${version}`),'Installed APK must match package.json.');
 await mkdir('artifacts',{recursive:true});await shell(`am force-stop ${pkg}`);await shell(`am start -W -n ${pkg}/.MainActivity`);await attach();
 report.platform=await page.evaluate(()=>({platform:window.Capacitor.getPlatform(),url:location.href,width:innerWidth,height:innerHeight,dpr:devicePixelRatio,ua:navigator.userAgent}));
 assert.equal(report.platform.platform,'android');assert.equal(report.platform.url,'https://localhost/');assert(report.platform.width>report.platform.height);
 await expect(page.getByRole('button',{name:'Heroes',exact:true})).toBeVisible();checks.push('Bundled native app launches in landscape');
 report.startupMusicPreference=(await profile()).settings.music;
 if(report.startupMusicPreference){await expect.poll(()=>page.locator('#menu-music').evaluate(a=>!a.paused&&a.currentTime>.15)).toBe(true);checks.push('Menu transport starts on native cold launch before any tap');}
 else {assert(await page.locator('#menu-music').evaluate(a=>a.paused));checks.push('Cold launch honors the saved music-off preference');}
 await screenshot('home');
 await shell('svc wifi disable');await shell('svc data disable');
 report.heroAssets=await page.evaluate(async()=>Promise.all(['ash','wren','bram'].map(async hero=>{
  const image=new Image();image.src=`/characters/${hero}.png`;await image.decode();
  const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
  const c=canvas.getContext('2d');c.drawImage(image,0,0);const pixels=c.getImageData(0,0,canvas.width,canvas.height).data;
  let solid=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>128)solid++;
  return {hero,width:image.width,height:image.height,cornerAlpha:pixels[3],coverage:solid/(image.width*image.height)};
 })));
 for(const sheet of report.heroAssets){assert.equal(sheet.width,1536);assert.equal(sheet.height,1024);assert(sheet.cornerAlpha<=2);assert(sheet.coverage>.15&&sheet.coverage<.6);}
 checks.push('All three packaged hero sheets decode offline with transparency');
 report.attackAssets=await page.evaluate(async()=>Promise.all(['ash-attacks','wren-attacks','bram-attacks','enemies-melee','enemies-ranged'].map(async name=>{
  const img=new Image();img.src=`/characters/${name}.png`;await img.decode();const c=document.createElement('canvas');c.width=c.height=1;const q=c.getContext('2d');q.drawImage(img,0,0);return {name,width:img.width,height:img.height,alpha:q.getImageData(0,0,1,1).data[3]};
 })));
 for(const asset of report.attackAssets){assert.equal(asset.width,asset.name.startsWith('enemies')?1254:1536);assert.equal(asset.height,asset.name.startsWith('enemies')?1254:1024);assert.equal(asset.alpha,0);}
 checks.push('Three attack sheets and both eight-species enemy atlases decode offline');
 report.musicAssets=await page.evaluate(async()=>{
  const manifest=await(await fetch('/audio/chapters/manifest.json')).json();
  const unique=[...new Map(manifest.map(t=>[t.file,t])).values()];
  const checks=[];for(const track of unique){const bytes=await(await fetch(track.file)).arrayBuffer();const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');checks.push({title:track.title,hash,expected:track.sha256});}return checks;
 });
 assert.equal(report.musicAssets.length,10);for(const track of report.musicAssets)assert.equal(track.hash,track.expected);
 checks.push('All ten selected Udio recordings are bundled offline with matching hashes');
 await tap(page.getByRole('button',{name:'Settings',exact:true}));await page.locator('[data-setting="music"]').check();await tap(page.getByRole('button',{name:'All set'}));
 await tap(page.getByRole('button',{name:'Heroes',exact:true}));await tap(page.locator('[data-hero="frost"]'));await expect(page.locator('[data-hero="frost"]')).toHaveClass(/selected/);
 await screenshot('heroes');
 await expect.poll(()=>page.locator('#menu-music').evaluate(a=>!a.paused&&a.currentTime>0)).toBe(true);checks.push('Menu audio transport advances after a gesture');
 await tap(page.getByRole('button',{name:'Settings',exact:true}));await page.locator('[data-setting="music"]').uncheck();await tap(page.getByRole('button',{name:'All set'}));
 await expect.poll(async()=>(await profile()).hero).toBe('frost');assert.equal((await profile()).settings.music,false);checks.push('Hero and sound choice reach Android SharedPreferences');
 await tap(page.getByRole('button',{name:'Settings',exact:true}));await page.locator('[data-setting="music"]').check();await tap(page.getByRole('button',{name:'All set'}));
 await tap(page.getByRole('button',{name:'Adventure',exact:true}));await tap(page.locator('[data-action="start"]'));
 await expect(page.locator('[data-action="story-skip"], [data-action="start-fresh"], [aria-label="Battle status"]')).toBeVisible();
 const replace=page.getByRole('button',{name:'Start new adventure',exact:true});if(await replace.isVisible())await tap(replace);
 await expect(page.locator('[data-action="story-skip"], [aria-label="Battle status"]')).toBeVisible();
 const skip=page.locator('[data-action="story-skip"]');if(await skip.isVisible())await tap(skip);
 await expect(page.getByLabel('Battle status')).toBeVisible();await expect.poll(()=>page.locator('#chapter-music').evaluate(a=>!a.paused&&a.currentTime>0)).toBe(true);await tap(page.locator('#jump'));await expect(page.locator('#air-status')).toContainText('JUGGLE');
 await tap(page.locator('#magic'));await expect(page.locator('#mana-label')).not.toContainText('100 GUTS');checks.push('Offline packaged battle accepts Jump and Power touches');
 await page.keyboard.down('d');await page.waitForTimeout(550);await page.keyboard.up('d');
 await shell('input keyevent 4');await expect(page.getByRole('button',{name:'Keep adventuring'})).toBeVisible();checks.push('Android Back pauses combat');
 await tap(page.getByRole('button',{name:'Keep adventuring'}));await expect(page.getByRole('button',{name:'Keep adventuring'})).toBeHidden();
 await shell('input keyevent 3');await page.waitForTimeout(750);await shell(`am start -W -n ${pkg}/.MainActivity`);
 await expect(page.getByRole('button',{name:'Keep adventuring'})).toBeVisible();await screenshot('foreground-paused');
 expect(await page.locator('#chapter-music').evaluate(a=>a.paused)).toBe(true);checks.push('Home/foreground preserves the pause and stops chapter transport');
 await tap(page.locator('[data-action="save-quit"]'));await expect(page.locator('[data-action="continue-run"]')).toBeVisible();
 const before=await profile();assert(before.resume);report.saved={hero:before.hero,xp:before.xp,gold:before.gold,stage:JSON.parse(before.resume).stage};
 await shell(`am force-stop ${pkg}`);await shell(`am start -W -n ${pkg}/.MainActivity`);await attach();
 await expect(page.locator('[data-action="continue-run"]')).toBeVisible();assert.deepEqual(await profile(),before);checks.push('Native process death preserves the complete saved profile and adventure bookmark');
 await tap(page.locator('[data-action="continue-run"]'));await expect(page.getByRole('button',{name:'Keep adventuring'})).toBeVisible();
 await tap(page.getByRole('button',{name:'Keep adventuring'}));await expect(page.locator('.player-name')).toContainText('Wren');await screenshot('resumed');
 const after=await profile();assert.equal(after.gold,before.gold);assert.equal(after.xp,before.xp);checks.push('Continue resumes the saved hero and grants no duplicate banked rewards');
 await tap(page.getByRole('button',{name:'Pause game'}));await tap(page.locator('[data-action="save-quit"]'));await expect(page.locator('[data-action="continue-run"]')).toBeVisible();
 assert.deepEqual(errors,[]);report.status='passed';
} catch(error){report.status='failed';report.failure=String(error);try{await screenshot('failure');}catch{}throw error;}
finally{
 await shell('svc wifi enable').catch(()=>{});await shell('svc data enable').catch(()=>{});await writeFile(`docs/ANDROID-SMOKE-${version}.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await device.close();
}
