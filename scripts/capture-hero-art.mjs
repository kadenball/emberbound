// A renderer contact sheet, not evidence of a played fight. Real input coverage
// lives in tests/e2e/hero-art.spec.ts. Run with the Vite preview on port 4173.
import {chromium} from '@playwright/test';
const browser=await chromium.launch({headless:true});
try {
  const page=await browser.newPage({viewport:{width:1760,height:840}});
  await page.goto('http://127.0.0.1:4173');
  await page.getByRole('button',{name:'Heroes',exact:true}).click();
  await page.screenshot({path:'artifacts/heroes-029-desktop.png'});
  await page.evaluate(async()=>{
    const {drawPlush}=await import('/src/plush.ts');
    const {loadHeroArt}=await import('/src/hero-art.ts');
    const {moveFor}=await import('/src/combat.ts');
    await loadHeroArt();
    const canvas=document.createElement('canvas');canvas.width=1760;canvas.height=840;
    document.body.replaceChildren(canvas);document.body.style.cssText='margin:0;background:#263f40';
    const c=canvas.getContext('2d');c.fillStyle='#263f40';c.fillRect(0,0,1760,840);
    const move=moveFor('light'),attack={move,elapsed:move.startup+.02};
    const poses=[{},{walk:1},{walk:4},{z:20},{attack:{...attack,elapsed:.02}},{attack},{power:.5},{hurt:.2}];
    ['ember','frost','moss'].forEach((hero,row)=>poses.forEach((pose,col)=>{
      const a={x:0,y:0,hp:100,maxHp:100,face:1,hurt:pose.hurt??0,walk:pose.walk??0,attackTime:0};
      drawPlush(c,115+col*220,245+row*280,a,1,1.1,{hero,weapon:'starter',...pose});
      c.fillStyle='#fce4b6';c.font='16px sans-serif';
      c.fillText(['idle','stride A','stride B','jump','windup','contact','power','recoil'][col],col*220+70,row*280+274);
    }));
  });
  await page.screenshot({path:'artifacts/hero-poses-029.png'});
} finally {await browser.close();}
