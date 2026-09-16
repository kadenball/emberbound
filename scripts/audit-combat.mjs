// Matched equipment, actual inputs, no HP/position edits or skipped waves.
import {createServer} from 'vite';
import {readFile,writeFile} from 'node:fs/promises';
const vite=await createServer({server:{middlewareMode:true,watch:null,hmr:false},appType:'custom',logLevel:'error',optimizeDeps:{noDiscovery:true,include:[]}});
try {
 const {Game,idleInput}=await vite.ssrLoadModule('/src/engine.ts'),{HEROES,STAGES}=await vite.ssrLoadModule('/src/content.ts'),{freshSave,buyUpgrade,bankPayout}=await vite.ssrLoadModule('/src/save.ts'),{playInput}=await vite.ssrLoadModule('/scripts/gameplay-policy.ts');
 const output=process.argv[2]??'docs/COMBAT-AUDIT-0.12.json';
 const profiles=process.argv[3]?JSON.parse(await readFile(process.argv[3],'utf8')).profiles:[];
 if(!profiles.length)for(const hero of HEROES){
  const save=freshSave();
  for(let stage=0;stage<STAGES.length;stage++){
   let won=false;
   for(let attempt=0;attempt<3&&!won;attempt++){
    for(const key of ['strength','vitality','spirit'])buyUpgrade(save,key);
    const profile={hero:hero.id,stage,xp:save.xp,weapon:save.equipped,weapons:[...save.weapons],upgrades:{...save.upgrades}};
    if(attempt===0)profiles.push(profile);
    const g=new Game(hero.id,stage,profile.upgrades,140+attempt,profile);
    let retries=0;for(let frame=0;frame<18000&&g.state==='playing';frame++){g.update(1/60,playInput(g,frame));g.events=[];if(g.state==='lost'&&retries<3){g.retryEncounter();retries++;}}
    won=g.state==='won';bankPayout(save,{stage,won,gold:g.gold,earnedXp:g.earnedXp});save.weapons=[...new Set([...save.weapons,...g.foundWeapons])];save.equipped=g.weapon;
    if(won)save.best[stage]=1;
   }
   if(!won)throw new Error(`Profile-building campaign failed for ${hero.id}, stage ${stage}`);
  }
 }
 const rows=[];
 for(const profile of profiles)for(const seed of [7,140,991])for(const policy of ['light','heavy','light-magic','mixed']){
  const g=new Game(profile.hero,profile.stage,profile.upgrades,seed,profile);let frame=0,damage=0,bossActions=0;const phases=new Map();
  for(;frame<18000&&g.state==='playing';frame++){
   const p=g.player,enemies=g.enemies.filter(e=>e.hp>0),target=enemies.sort((a,b)=>Math.hypot(a.x-p.x,(a.y-p.y)*2)-Math.hypot(b.x-p.x,(b.y-p.y)*2))[0];
   // Everyone can complete mandatory props/escorts after a fight. Restricted
   // policies only restrict combat choices, avoiding artificial objective timeouts.
   let input=playInput(g,frame);
   if(target&&policy!=='mixed'){
    input=idleInput();const dx=target.x-p.x,dy=target.y-p.y;
    input.x=Math.abs(dx)>55?Math.sign(dx):Math.abs(dx)>10&&p.face!==Math.sign(dx)?Math.sign(dx)*.2:0;
    input.y=Math.abs(dy)>9?Math.sign(dy):0;
    const close=Math.abs(dx)<100&&Math.abs(dy)<40;
    input.attack=policy!=='heavy'&&close;input.heavy=policy==='heavy'&&close&&frame%40<3;
    input.magic=policy==='light-magic'&&Math.abs(dx)<(p.hero==='ember'?420:170)&&Math.abs(dy)<35;
   }
   g.update(1/60,input);damage+=g.events.filter(e=>e==='hurt').length;
   for(const e of g.enemies)if(e.kind==='boss'){bossActions+=Math.max(0,e.phase-(phases.get(e.id)??0));phases.set(e.id,e.phase);}
   g.events=[];
  }
  rows.push({hero:profile.hero,stage:profile.stage,seed,policy,result:g.state,seconds:+(frame/60).toFixed(1),hpPercent:+(g.player.hp/g.player.maxHp*100).toFixed(1),damageEvents:damage,bossActions,bowling:g.bowlingHits,juggles:g.juggles,perfectDodges:g.perfectDodges});
 }
 const summaries=['light','heavy','light-magic','mixed'].map(policy=>{const group=rows.filter(r=>r.policy===policy);return {policy,runs:group.length,wins:group.filter(r=>r.result==='won').length,losses:group.filter(r=>r.result==='lost').length,timeouts:group.filter(r=>r.result==='playing').length,bossWins:group.filter(r=>r.stage%2&&r.result==='won').length};});
 await writeFile(output,JSON.stringify({date:new Date().toISOString(),method:'Four combat policies × three seeds × three heroes × twelve stages; identical profiles earned by the mixed Scrapper campaign probe (fresh profile generation permits three entry retries per attempt; evaluation runs never retry). Reused baseline profiles when comparing changes. All policies can work mandatory scenery after enemies die. No health edits, teleportation or wave skipping. Scripted steering is not human fun or difficulty evidence.',profiles,summaries,rows},null,2)+'\n');console.log(JSON.stringify(summaries,null,2));
}finally{await vite.close();}
