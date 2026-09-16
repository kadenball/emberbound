// Matched, normal-input chapter timing. An optional source root loads an archived build.
import {createServer} from 'vite';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const output=process.argv[2],root=resolve(process.argv[3]??'.');
if(!output)throw new Error('Provide an output JSON path.');
const v=await createServer({root,server:{middlewareMode:true,watch:null,hmr:false},appType:'custom',logLevel:'error',optimizeDeps:{noDiscovery:true,include:[]}});
try{
 const {Game}=await v.ssrLoadModule('/src/engine.ts'),{playInput}=await v.ssrLoadModule('/scripts/gameplay-policy.ts');
 const profiles=JSON.parse(await readFile('docs/COMBAT-AUDIT-0.28.json','utf8')).profiles.filter(p=>[4,8].includes(p.stage)),rows=[];
 for(const p of profiles)for(const seed of [7,140,991]){
  const g=new Game(p.hero,p.stage,p.upgrades,seed,p),fights=Array(6).fill(0);let frames=0,road=0,riding=0,brakeAt=null;
  for(;frames<18000&&g.state==='playing';frames++){
   if(g.encounterActive)fights[g.wave]++;else road++;
   const actor=g.player;
   if(g.flows?.some(f=>g.flowRunning(f)&&actor.z<18&&actor.x>=f.x&&actor.x<f.x+f.width&&Math.abs(actor.y-f.y)<f.depth/2))riding++;
   g.update(1/60,playInput(g,frames));g.events=[];
   if(brakeAt===null&&g.props.some(q=>q.flow!==undefined&&q.active))brakeAt=(frames+1)/60;
  }
  rows.push({hero:p.hero,stage:p.stage,seed,result:g.state,seconds:+(frames/60).toFixed(2),encounterSeconds:fights.map(n=>+(n/60).toFixed(2)),roadSeconds:+(road/60).toFixed(2),onMovingFloorSeconds:+(riding/60).toFixed(2),brakeAtSeconds:brakeAt===null?null:+brakeAt.toFixed(2),hp:+g.player.hp.toFixed(2)});
 }
 await writeFile(output,JSON.stringify({method:'18 normal-input journeys: three heroes, three seeds, chapters 5 and 9, identical earned 0.28 profiles. Same playInput policy, no position/HP/wave edits. Durations include hit-stop frames; fight means encounterActive, road means outside encounters (including props and supplies). Floor occupancy is geometric, not an intentional choice metric. Scripted timings are not human pacing or enjoyment evidence.',rows},null,2)+'\n');
 console.log(`${rows.length} journeys recorded; ${rows.filter(r=>r.result==='won').length} wins, ${rows.filter(r=>r.result==='playing').length} timeouts.`);
}finally{await v.close();}
