import { expect, it } from 'vitest';
import { HEROES, STAGES } from '../src/content';
import { Game } from '../src/engine';
import { freshSave, buyUpgrade, bankPayout } from '../src/save';
import { STYLES } from '../src/progression';
import { playInput } from '../scripts/gameplay-policy';
// Real combat inputs across all twelve chapters, carrying earned rewards and buying
// affordable upgrades. No HP edits, teleportation, skipped waves or debug hooks.
for (const style of STYLES) for (const hero of HEROES) it(`${hero.name} / ${style.name} can finish the campaign using earned progression`, () => {
  const save=freshSave();
  for(let stage=0;stage<STAGES.length;stage++){
    let won=false;
    // Up to three entry-checkpoint retries per attempt, then up to three chapter
    // attempts using the actual capped
    // defeat payout. Losing must not silently become full-reward farming here.
    for(let attempt=0;attempt<3 && !won;attempt++){
      for(const upgrade of ['strength','vitality','spirit'] as const)buyUpgrade(save,upgrade);
      const game=new Game(hero.id,stage,{...save.upgrades},140+attempt,{xp:save.xp,weapon:save.equipped,weapons:save.weapons,style:style.id});
      let checkedPoint='',retries=0;
      for(let frame=0;frame<60*300&&game.state==='playing';frame++){game.update(1/60,playInput(game,frame));game.events=[];
        if(game.state==='lost' && retries<3){expect(game.retryEncounter()).toBe(true);retries++;}
        if(game.state==='playing' && game.bookmarkKey!==checkedPoint){expect(Game.resumeBookmark(game.exportBookmark()!)).not.toBeNull();checkedPoint=game.bookmarkKey;}
      }
      expect(game.state).not.toBe('playing');won=game.state==='won';
      bankPayout(save,{stage,won,gold:game.gold,earnedXp:game.earnedXp});
      save.weapons=[...new Set([...save.weapons,...game.foundWeapons])];save.equipped=game.weapon;
      if(won){expect(game.wave).toBe(game.encounterCount-1);expect(game.gold).toBeGreaterThan(100);save.best[stage]=1;save.unlocked=stage+1;}
    }
    expect({stage,won}).toEqual({stage,won:true});
  }
});

it('two independently controlled partners can finish the authored opening chapter',()=>{
 const game=new Game('ember',0,freshSave().upgrades,7,{partner:'frost'});
 let retries=0;for(let frame=0;frame<60*300&&game.state==='playing';frame++){game.update(1/60,playInput(game,frame,0),playInput(game,frame+15,1));game.events=[];if(game.state==='lost'&&retries<3){expect(game.retryEncounter()).toBe(true);retries++;}}
 expect(game.state).toBe('won');expect(game.wave).toBe(game.encounterCount-1);expect(game.gold).toBeGreaterThan(100);
});
