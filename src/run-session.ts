import type { Game } from './engine';
import { STAGES } from './content';
import { bankPayout, runPayout, type Save } from './save';
export function earnedStars(game: Game) {
  return game.state === 'won' ? 1 + Number(game.player.hp / game.player.maxHp > .35) + Number(game.retries === 0 && game.totalTime < game.config.par) : 0;
}
/** A failed fight is provisional until the player leaves or starts a new chapter.
 * Retry restores the encounter snapshot; only the final accepted outcome may bank. */
export class RunSession {
  private banked: {gold:number;xp:number} | null = null;
  constructor(readonly game: Game, private save: Save, readonly practice=false) {}
  get settled() { return this.banked !== null; }
  get payout() {
    if(this.banked)return this.banked;
    if(this.practice || this.game.state==='playing')return {gold:0,xp:0};
    return runPayout(this.save,{stage:this.game.stage,won:this.game.state==='won',gold:this.game.gold,earnedXp:this.game.earnedXp});
  }
  bookmark() {
    if(this.practice || this.settled || this.game.state==='won')return false;
    this.save.resume=this.game.exportBookmark();return this.save.resume!==null;
  }
  abandon() { if(!this.practice && !this.settled)this.save.resume=null; }
  retry() { return !this.settled && this.game.retryEncounter(); }
  settle() {
    if(this.settled || this.game.state==='playing')return this.payout;
    const g=this.game,s=this.save;
    this.banked=this.practice?{gold:0,xp:0}:bankPayout(s,{stage:g.stage,won:g.state==='won',gold:g.gold,earnedXp:g.earnedXp});
    if(!this.practice){
      s.resume=null;
      s.weapons=[...new Set([...s.weapons,...g.foundWeapons])];s.equipped=g.weapon;
      if(g.state==='won'){s.unlocked=Math.max(s.unlocked,Math.min(STAGES.length-1,g.stage+1));s.best[g.stage]=Math.max(s.best[g.stage],earnedStars(g));}
    }
    return this.banked;
  }
}
