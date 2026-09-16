// A staged sequence through the production mixer, for listening review; not a playtest.
import {chromium} from 'playwright';
import {writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();
 await page.route('**/__audio-review',route=>route.fulfill({contentType:'text/html',body:`<button>Record</button><script type="module">
 import {Sound} from '/src/audio.ts';const sound=new Sound();window.sound=sound;
 document.querySelector('button').onclick=()=>{sound.unlock();const destination=sound.context.createMediaStreamDestination();sound.master.connect(destination);window.recorder=new MediaRecorder(destination.stream);window.chunks=[];recorder.ondataavailable=e=>chunks.push(e.data);recorder.start();};
 </script>`}));
 await page.goto('http://127.0.0.1:4173/__audio-review');await page.locator('button').click();
 const bytes=await page.evaluate(async()=>{
  const s=window.sound;let scene='combat';s.update(.016,scene,1);
  const ticking=setInterval(()=>s.update(.016,scene,1),16);const wait=ms=>new Promise(r=>setTimeout(r,ms));
  await wait(2000);scene='entrance';s.play('kettle');await wait(3500);scene='boss';
  for(const event of ['heavy','hit','tear','burp','machine-warning'])s.play(event);
  await wait(1300);scene='rage';s.play('boss-rage');await wait(3200);scene='victory';s.play('boss-fall');
  await wait(4200);clearInterval(ticking);
  await new Promise(r=>{recorder.onstop=r;recorder.stop();});
  return Array.from(new Uint8Array(await new Blob(chunks,{type:'audio/webm'}).arrayBuffer()));
 });
 await mkdir('artifacts',{recursive:true});await writeFile('artifacts/audio-review-0.31.webm',Buffer.from(bytes));
 execFileSync('ffmpeg',['-v','error','-y','-i','artifacts/audio-review-0.31.webm','-c:a','libmp3lame','-b:a','192k','artifacts/audio-review-0.31.mp3']);
 console.log('Recorded staged combat → entrance → warning burst → rage → victory, using the production mixer.');
}finally{await browser.close();}
