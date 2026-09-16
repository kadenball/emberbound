import {chromium} from '@playwright/test';
const browser=await chromium.launch();
try {
 const page=await browser.newPage({viewport:{width:1500,height:700}});await page.goto('http://127.0.0.1:4173');
 await page.evaluate(async()=>{
  const {drawPlush}=await import('/src/plush.ts'),{Game}=await import('/src/engine.ts');await document.fonts.ready;
  const canvas=document.createElement('canvas');canvas.width=1500;canvas.height=700;canvas.style='position:fixed;inset:0;width:100%;height:100%;z-index:10000';document.body.append(canvas);
  const c=canvas.getContext('2d'),g=new Game('ember',0,{strength:0,vitality:0,spirit:0},140),e=g.spawn('brute',0,0);
  c.fillStyle='#34353b';c.fillRect(0,0,1500,700);
  const frames=[{windup:.65,attack:0,name:'PLANT'},{windup:.35,attack:0,name:'LOAD'},{windup:.05,attack:0,name:'COMMIT'},{windup:0,attack:.4,name:'IMPACT'},{windup:0,attack:.08,name:'FOLLOW THROUGH'}];
  for(let row=0;row<2;row++)for(let col=0;col<5;col++){
   const f=frames[col],x=col*300,y=row*350;e.attackTime=f.attack;e.face=1;
   c.save();c.beginPath();c.rect(x,y,300,350);c.clip();c.fillStyle=row?'#54424d':'#4a4941';c.fillRect(x+4,y+4,292,342);
   c.fillStyle='#ece0b9';c.font='bold 17px monospace';c.textAlign='center';c.fillText(`${row?'HIGH SWAT':'LOW POUND'} · ${f.name}`,x+150,y+32);
   c.strokeStyle='#c2ae8b';c.lineWidth=2;c.beginPath();c.moveTo(x+20,y+300);c.lineTo(x+280,y+300);c.stroke();
   drawPlush(c,x+130,y+295,e,3,1.2,{kind:'brute',windup:f.windup,highAttack:!!row});c.restore();
  }
 });
 await page.screenshot({path:'artifacts/brute-animation-study.png'});
}finally{await browser.close();}
