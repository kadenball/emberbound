import {test,expect} from '@playwright/test';

test('a real opening chapter shows a planted brute and the mixed player survives the first brute encounter',async({page},info)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{Date.now=()=>140;});await page.goto('/');
  await page.evaluate(async()=>{
    const url=performance.getEntriesByType('resource').map(r=>r.name).find(url=>url.includes('/src/engine.ts'))!;
    const {Game}=await import(url),{playInput}=await import('/scripts/gameplay-policy.ts'),update=Game.prototype.update;
    const probe={ready:false,release:false,finished:false,frame:0,brute:0,wave:-1,pounded:false,result:''};(window as any).bruteProbe=probe;
    Game.prototype.update=function(dt,input,partner){
      if(probe.finished)return false;
      let advanced=false;
      for(let i=0;i<20&&this.state==='playing';i++){
        const brute=this.enemies.find(e=>e.kind==='brute'&&e.hp>0&&e.windup>.25&&e.windup<.5);
        if(brute&&!probe.ready){probe.ready=true;probe.brute=brute.id;probe.wave=this.wave;}
        if(probe.ready&&!probe.release)return advanced;
        advanced=update.call(this,1/60,playInput(this,probe.frame++),partner)||advanced;
        const attacker=this.enemies.find(e=>e.id===probe.brute);
        if(probe.release&&attacker?.attackTime>0)probe.pounded=true;
        if(probe.release && (this.wave>probe.wave || this.wave===probe.wave&&!this.encounterActive)){probe.finished=true;probe.result='survived';break;}
        if(this.state!=='playing'){probe.finished=true;probe.result=this.state;}
      }
      return advanced;
    };
  });
  await page.locator('[data-action="start"]').click();await page.locator('[data-action="story-skip"]').click();
  await expect.poll(()=>page.evaluate(()=>(window as any).bruteProbe.ready),{timeout:25000}).toBe(true);
  await page.screenshot({path:`artifacts/brute-planted-${info.project.name}.png`});
  await page.evaluate(()=>(window as any).bruteProbe.release=true);
  await expect.poll(()=>page.evaluate(()=>(window as any).bruteProbe.finished),{timeout:30000}).toBe(true);
  expect(await page.evaluate(()=>(window as any).bruteProbe)).toMatchObject({pounded:true,result:'survived'});expect(errors).toEqual([]);
});

test('a real Light Light Heavy input recipe breaks planted fists in an isolated fixture',async({page},info)=>{
  await page.goto('/');
  // The isolated fixture holds a healthy brute still for the setup. All three
  // strikes use normal keyboard inputs, attack timing, damage and combo accounting.
  await page.evaluate(async()=>{
    const url=performance.getEntriesByType('resource').map(r=>r.name).find(url=>url.includes('/src/engine.ts'))!;
    const {Game}=await import(url),update=Game.prototype.update;
    const probe={ready:false,release:false,broken:false,combo:0,hp:0};(window as any).comboProbe=probe;
    let brute:any;
    Game.prototype.update=function(dt,input,partner){
      if(!brute){this.props=[];brute=this.spawn('brute',this.player.x+65,this.player.y);brute.stun=10;brute.cooldown=10;}
      if(probe.broken)return false;
      if(probe.ready&&!probe.release)return false;
      const advanced=update.call(this,dt,input,partner);
      if(this.player.combo>=2&&!probe.ready){
        // Start a fresh committed windup; its direction and the two earned hits persist.
        brute.stun=0;brute.cooldown=0;brute.windup=.7;probe.ready=true;probe.combo=this.player.combo;probe.hp=brute.hp;
      }
      if(probe.release&&this.events.includes('brace-break')){probe.broken=true;probe.hp=brute.hp;}
      return advanced;
    };
  });
  await page.locator('[data-action="start"]').click();await page.locator('[data-action="story-skip"]').click();
  await page.keyboard.down('j');await expect.poll(()=>page.evaluate(()=>(window as any).comboProbe.ready)).toBe(true);await page.keyboard.up('j');
  await page.keyboard.down('h');await page.evaluate(()=>(window as any).comboProbe.release=true);
  await expect.poll(()=>page.evaluate(()=>(window as any).comboProbe.broken)).toBe(true);await page.keyboard.up('h');
  await page.screenshot({path:`artifacts/brute-broken-${info.project.name}.png`});
  expect(await page.evaluate(()=>(window as any).comboProbe.combo)).toBe(2);
});
