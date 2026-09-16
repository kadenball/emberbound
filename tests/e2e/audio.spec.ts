import {expect,test,type Page} from '@playwright/test';

test.afterEach(async({page},info)=>{
 if(info.status===info.expectedStatus)return;
 const state=await page.evaluate(()=>{const s=(window as any).mix;return {visibility:document.visibilityState,focused:document.hasFocus(),context:(s?.context??(window as any).battleAudio)&&{state:(s?.context??(window as any).battleAudio).state,time:(s?.context??(window as any).battleAudio).currentTime,sampleRate:(s?.context??(window as any).battleAudio).sampleRate},pending:s?.pending.size,unlocked:s?.userUnlocked,paused:s?.paused,gains:[s?.bus,s?.musicBus,s?.bedGain,s?.cueGain].map(g=>g?.gain.value),tracks:[...document.querySelectorAll('audio')].map(a=>({id:a.id,time:a.currentTime,paused:a.paused,ready:a.readyState,network:a.networkState,duration:a.duration,error:a.error?.message,src:a.getAttribute('src')}))};}).catch(e=>({error:String(e)}));
 await info.attach('audio-state',{body:JSON.stringify(state,null,2),contentType:'application/json'});
});

async function mixer(page:Page){
 await page.route('**/__audio-test',route=>route.fulfill({contentType:'text/html',body:`<button id="unlock">Play</button><script type="module">
 import {Sound} from '/src/audio.ts';
 const sound=new Sound();window.mix=sound;
 document.querySelector('button').onclick=()=>{sound.unlock();const analyser=sound.context.createAnalyser();analyser.fftSize=2048;sound.master.connect(analyser);window.meter=analyser;};
 </script>`}));
 await page.goto('/__audio-test');await page.locator('button').click();
 await expect.poll(()=>page.evaluate(()=>(window as any).mix.context.state)).toBe('running');
}
async function rms(page:Page){return page.evaluate(()=>{const a=(window as any).meter;const samples=new Float32Array(a.fftSize);a.getFloatTimeDomainData(samples);return Math.sqrt(samples.reduce((sum,v)=>sum+v*v,0)/samples.length);});}

test('music reaches the audio graph, scene cues play once, and mute/pause clear the right channels',async({page})=>{
 await mixer(page);await expect.poll(()=>rms(page)).toBeGreaterThan(.001);
 await page.evaluate(()=>{const s=(window as any).mix;s.update(.016,'entrance',1);});
 await expect.poll(()=>page.locator('#score-cue').evaluate((a:HTMLAudioElement)=>!a.paused&&a.currentTime>.1)).toBe(true);
 await expect.poll(()=>rms(page)).toBeGreaterThan(.001);
 const before=await page.locator('#score-cue').evaluate((a:HTMLAudioElement)=>a.currentTime);
 await page.evaluate(()=>{const s=(window as any).mix;for(let i=0;i<60;i++)s.update(.016,'entrance',1);s.setPaused(true);});
 await expect.poll(()=>rms(page)).toBeLessThan(.0001);
 expect(await page.locator('#score-cue').evaluate((a:HTMLAudioElement)=>a.paused&&a.currentTime>=0)).toBe(true);
 await page.evaluate(()=>(window as any).mix.setPaused(false));
 await expect.poll(()=>page.locator('#score-cue').evaluate((a:HTMLAudioElement)=>a.currentTime)).toBeGreaterThan(before);
 await page.evaluate(()=>{const s=(window as any).mix;s.enabled=false;});await expect.poll(()=>rms(page)).toBeGreaterThan(.001);
 await page.evaluate(()=>{const s=(window as any).mix;s.music=false;});await expect.poll(()=>rms(page)).toBeLessThan(.0001);
 // Enabling music later must not resurrect the abandoned entrance cue.
 await page.evaluate(()=>{const s=(window as any).mix;s.update(.016,'rage',1);s.music=true;});
 expect(await page.locator('#score-cue').evaluate((a:HTMLAudioElement)=>a.paused)).toBe(true);
 await expect.poll(()=>rms(page)).toBeGreaterThan(.001);
 await page.evaluate(()=>{const s=(window as any).mix;s.update(.016,'victory',1);});
 await expect.poll(()=>page.locator('#score-cue').evaluate((a:HTMLAudioElement)=>a.currentTime>.1)).toBe(true);
 await expect.poll(()=>page.locator('#score-cue').evaluate((a:HTMLAudioElement)=>a.ended)).toBe(true);
 await page.evaluate(()=>{const s=(window as any).mix;for(let i=0;i<60;i++)s.update(.016,'victory',1);});
 expect(await page.locator('#score-cue').evaluate((a:HTMLAudioElement)=>a.ended)).toBe(true);
 await page.evaluate(()=>{const s=(window as any).mix;s.update(.016,'entrance',3);s.update(.016,'menu',3);});
 await expect.poll(()=>page.locator('#menu-music').evaluate((a:HTMLAudioElement)=>!a.paused)).toBe(true);
 expect(await page.locator('#score-cue').evaluate((a:HTMLAudioElement)=>a.paused)).toBe(true);
 expect(await page.locator('#chapter-music').evaluate((a:HTMLAudioElement)=>a.paused)).toBe(true);
});

test('crowded effects leave warning voices, duck the score and recover without delayed pause sounds',async({page})=>{
 await mixer(page);
 const burst=await page.evaluate(()=>{
  const s=(window as any).mix;s.update(.016,'combat',0);
  for(const e of ['burp','freeze','lawn','magic','revive','coin','heavy','hit','tear','dough','drum','sugar','royal','boss-fall'])s.play(e);
  const ordinary=s.voices.size;s.play('machine-warning');const warning=s.voices.size;
  for(let i=0;i<100;i++)s.play('machine-warning');const repeated=s.voices.size;
  s.update(.016,'combat',0);return {ordinary,warning,repeated};
 });
 expect(burst.ordinary).toBeLessThanOrEqual(48);expect(burst.warning).toBe(burst.ordinary+3);expect(burst.repeated).toBe(burst.warning);expect(burst.warning).toBeLessThanOrEqual(64);
 await expect.poll(()=>page.evaluate(()=>(window as any).mix.bedGain.gain.value)).toBeLessThan(.3);
 await page.waitForTimeout(700);await page.evaluate(()=>(window as any).mix.update(.016,'combat',0));
 await expect.poll(()=>page.evaluate(()=>(window as any).mix.bedGain.gain.value)).toBeGreaterThan(.43);
 await page.evaluate(()=>{const s=(window as any).mix;s.music=false;s.play('revive');});
 await expect.poll(()=>rms(page)).toBeGreaterThan(.001);
 await page.evaluate(()=>{const s=(window as any).mix;s.setPaused(true);});
 expect(await page.evaluate(()=>(window as any).mix.voices.size)).toBe(0);await expect.poll(()=>rms(page)).toBeLessThan(.0001);
 await page.evaluate(()=>(window as any).mix.setPaused(false));await page.waitForTimeout(400);expect(await rms(page)).toBeLessThan(.0001);
 await page.evaluate(()=>{const s=(window as any).mix;s.play('magic');s.enabled=false;});expect(await page.evaluate(()=>(window as any).mix.voices.size)).toBe(0);
});

test('all regional cues decode, are distinct and match their packaged hashes',async({page},info)=>{
 test.skip(info.project.name!=='desktop','Decode the asset roster once; actual mixed playback runs on every browser.');
 await page.goto('/');const result=await page.evaluate(async()=>{
  const manifest=await(await fetch('/audio/cues/manifest.json')).json();const context=new AudioContext();const checks=[];
  for(const cue of manifest){const data=await(await fetch(cue.file)).arrayBuffer();const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),b=>b.toString(16).padStart(2,'0')).join('');const decoded=await context.decodeAudioData(data);checks.push({hash,expected:cue.sha256,duration:decoded.duration,channels:decoded.numberOfChannels});}
  await context.close();return checks;
 });expect(result).toHaveLength(24);expect(new Set(result.map(r=>r.hash)).size).toBe(24);for(const r of result){expect(r.hash).toBe(r.expected);expect(r.duration).toBeGreaterThan(2);expect(r.duration).toBeLessThan(5);expect(r.channels).toBe(2);}
});

test('an interrupted context accepts a new gesture without unmuting or unpausing the game',async({page})=>{
 await mixer(page);
 await page.evaluate(async()=>{
  const s=(window as any).mix,c=s.context; s.music=false;s.setPaused(true);await c.suspend();
  // Controlled contract fixture: the renderer really suspends, while its state
  // getter exposes the interrupted value used by affected audio sessions.
  Object.defineProperty(c,'state',{configurable:true,get:()=> 'interrupted'});
  const resume=c.resume.bind(c);(window as any).resumeCalls=0;
  c.resume=()=>{(window as any).resumeCalls++;delete c.state;return resume();};
 });
 await page.locator('button').click();
 await expect.poll(()=>page.evaluate(()=>(window as any).resumeCalls)).toBe(1);
 await expect.poll(()=>page.evaluate(()=>(window as any).mix.context.state)).toBe('running');
 expect(await page.evaluate(()=>{const s=(window as any).mix;return {music:s.music,paused:s.paused};})).toEqual({music:false,paused:true});
 expect(await page.locator('#menu-music').evaluate((a:HTMLAudioElement)=>a.paused)).toBe(true);
});

test('an unexpected audio suspension pauses a live battle and waits for explicit resume',async({page},info)=>{
 await page.addInitScript(()=>{const Original=window.AudioContext;window.AudioContext=class extends Original{constructor(...args:ConstructorParameters<typeof AudioContext>){super(...args);(window as any).battleAudio=this;}};});
 await page.goto('/');await page.locator('[data-action="start"]').click();await page.locator('[data-action="story-skip"]').click();
 await expect(page.getByLabel('Battle status')).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>(window as any).battleAudio.state)).toBe('running');
 await page.evaluate(()=>(window as any).battleAudio.suspend());
 await expect(page.getByRole('button',{name:'Keep adventuring'})).toBeVisible();
 // Recovering the browser audio device itself must not restart combat.
 await page.evaluate(()=>(window as any).battleAudio.resume());await page.waitForTimeout(300);
 await expect(page.getByRole('button',{name:'Keep adventuring'})).toBeVisible();
 expect(await page.locator('#chapter-music').evaluate((a:HTMLAudioElement)=>a.paused)).toBe(true);
 await page.screenshot({path:`artifacts/audio-interruption-${info.project.name}.png`});
 await page.getByRole('button',{name:'Keep adventuring'}).click();
 await expect(page.getByRole('button',{name:'Keep adventuring'})).toBeHidden();
 await expect.poll(()=>page.locator('#chapter-music').evaluate((a:HTMLAudioElement)=>!a.paused&&a.currentTime>0)).toBe(true);
 await page.getByRole('button',{name:'Pause game'}).click();await page.getByRole('button',{name:'Settings',exact:true}).click();
 await page.locator('[data-setting="sound"]').uncheck();await page.locator('[data-setting="music"]').uncheck();
 await page.getByRole('button',{name:'All set'}).click();await page.getByRole('button',{name:'Keep adventuring'}).click();
 await page.evaluate(()=>(window as any).battleAudio.suspend());await page.waitForTimeout(300);
 await expect(page.getByLabel('Battle status')).toBeVisible();await expect(page.getByRole('button',{name:'Keep adventuring'})).toBeHidden();
});

test('the selected defeat excerpt plays once and music mute silences it',async({page})=>{
 await mixer(page);await page.evaluate(()=>(window as any).mix.update(.016,'defeat',2));
 await expect.poll(()=>page.locator('#score-cue').evaluate((a:HTMLAudioElement)=>a.currentTime>.1&&!a.paused)).toBe(true);
 await expect(page.locator('#score-cue')).toHaveAttribute('src','/audio/cues/region-2-defeat.mp3');
 await expect.poll(()=>rms(page)).toBeGreaterThan(.001);
 await expect.poll(()=>page.locator('#score-cue').evaluate((a:HTMLAudioElement)=>a.ended)).toBe(true);
 await page.evaluate(()=>{const s=(window as any).mix;for(let i=0;i<50;i++)s.update(.016,'defeat',2);});
 expect(await page.locator('#score-cue').evaluate((a:HTMLAudioElement)=>a.ended)).toBe(true);
 await page.evaluate(()=>{const s=(window as any).mix;s.music=false;s.play('lose');});
 await page.waitForTimeout(350);await expect.poll(()=>rms(page)).toBeLessThan(.0001);
});
