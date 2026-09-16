import {expect,it} from 'vitest';
import {Game,idleInput} from '../src/engine';
import {freshSave} from '../src/save';
import {chapterEncounters} from '../src/encounters';
import {STAGES} from '../src/content';
import {journeyPlaces} from '../src/journey-art';
import {Blood} from '../src/blood';
it('all 18 new districts have reachable landmarks, differing arenas and an interactive checkpoint',()=>{
 const names=new Set();let encounters=0;
 for(const [stageIndex,stage] of STAGES.entries()){const beats=chapterEncounters(stageIndex);encounters+=beats.length;if(stage.bossStage)continue;
  expect(beats).toHaveLength(9);const places=journeyPlaces(stageIndex);expect(places).toHaveLength(8);
  for(const place of places){expect(Number.isFinite(place.x)).toBe(true);expect(place.x).toBeLessThan(stage.length);expect(place.name).toBeTruthy();names.add(place.name);}
  const g=new Game('ember',stageIndex,freshSave().upgrades,7);
  // Isolated late-entry fixture also represents an old bookmark without new machinery.
  for(let index=6;index<9;index++){
   (g as any).startWave(index);const trap=g.setpieces.find(t=>t.encounter===index)!;
   expect(trap).toBeDefined();expect(g.props.some(p=>p.kind==='lever'&&p.hazard===trap.id)).toBe(true);
   expect(trap.y).toBeGreaterThanOrEqual(beats[index].top);expect(trap.y).toBeLessThanOrEqual(beats[index].bottom);
   const restored=Game.resumeBookmark(g.exportBookmark()!)!;expect(restored).not.toBeNull();
   expect(restored.setpieces.filter(t=>t.encounter===index)).toHaveLength(1);
   expect(restored.props.filter(p=>p.kind==='lever'&&p.hazard===trap.id)).toHaveLength(1);
  }
 }
 expect(encounters).toBe(72);expect(names.size).toBe(48);
});
it('blood lands, stays bounded under sustained combat, and clears on retry without changing combat RNG',()=>{
 const blood=new Blood();for(let i=0;i<100;i++)blood.spray(200,455,0,1,true,i);expect(blood.drops.length).toBeLessThanOrEqual(220);
 for(let i=0;i<90;i++)blood.update(1/60);expect(blood.drops).toHaveLength(0);expect(blood.stains.length).toBeGreaterThan(0);expect(blood.stains.length).toBeLessThanOrEqual(130);
 for(let i=0;i<2200;i++)blood.update(1/60);expect(blood.stains).toHaveLength(0);
 const g=new Game('ember',0,freshSave().upgrades,7),other=new Game('ember',0,freshSave().upgrades,7);
 g.blood.spray(200,455,0,1,true,7);expect(g.random()).toBe(other.random());expect(g.retryEncounter()).toBe(false);expect(g.blood.drops.length).toBeGreaterThan(0);
 g.state='lost';expect(g.retryEncounter()).toBe(true);expect(g.blood.drops).toHaveLength(0);
});
it('a damaging hit sprays blood but an armored clang does not',()=>{
 for(const stage of [1,7]){const g=new Game('ember',stage,freshSave().upgrades,7);g.props=[];const boss=g.spawn('boss',260,455);boss.bossState='windup';boss.bossTimer=10;
 for(let i=0;i<20;i++)g.update(1/60,{...idleInput(),heavy:i===0});
 expect(g.blood.drops.length>0).toBe(stage===1);expect(boss.hp<boss.maxHp).toBe(stage===1);
 }
});
