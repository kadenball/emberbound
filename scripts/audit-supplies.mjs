import {createServer} from 'vite';import {readFile,writeFile} from 'node:fs/promises';
const v=await createServer({server:{middlewareMode:true},appType:'custom',logLevel:'error',optimizeDeps:{noDiscovery:true,include:[]}});
try{
 const {Game}=await v.ssrLoadModule('/src/engine.ts'),{supplyInput}=await v.ssrLoadModule('/scripts/supply-policy.ts');
 const profiles=JSON.parse(await readFile('docs/COMBAT-AUDIT-0.19.json','utf8')).profiles.filter(p=>p.stage%2===0),rows=[];
 for(const p of profiles)for(const seed of [7,140,991])for(const policy of ['rush','read','skip']){
  const g=new Game(p.hero,p.stage,p.upgrades,seed,p);let f=0,supplyDamage=0,lastReceipt;
  for(;f<18000&&g.state==='playing';f++){
   g.update(1/60,supplyInput(g,f,policy));
   const receipt=g.damageLog.at(-1);if(receipt&&receipt!==lastReceipt&&receipt.source.kind==='machine'&&receipt.source.supply)supplyDamage+=receipt.amount;lastReceipt=receipt;g.events=[];
  }
  rows.push({hero:p.hero,stage:p.stage,seed,policy,result:g.state,seconds:+(f/60).toFixed(1),claims:g.setpieces.filter(t=>t.road&&t.disabled).length,supplyDamage,hpPercent:+(g.player.hp/g.player.maxHp*100).toFixed(1)});
 }
 const summaries=['rush','read','skip'].map(policy=>{const r=rows.filter(r=>r.policy===policy);return {policy,runs:r.length,wins:r.filter(r=>r.result==='won').length,timeouts:r.filter(r=>r.result==='playing').length,claims:r.reduce((s,r)=>s+r.claims,0),supplyDamage:r.reduce((s,r)=>s+r.supplyDamage,0)};});
 await writeFile('docs/SUPPLY-AUDIT-0.20.json',JSON.stringify({method:'162 normal-input journey runs: three supply policies, three seeds, three heroes, six journeys. Identical earned profiles from 0.19. Combat steering unchanged; only the choice at a supply detour differs. No HP/position edits or wave skipping. Scripted input is not human enjoyment evidence.',summaries,rows},null,2)+'\n');console.log(summaries);
}finally{await v.close();}
