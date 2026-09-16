import { parseBookmark } from './fight-bookmark';
import { HEROES, STAGES, weaponById } from './content';
import { chapterEncounters } from './encounters';
import { plushPortrait } from './plush';
export function bookmarkCard(raw: string | null, action=true) {
  const b=parseBookmark(raw);if(!b)return '';
  const s=b.snapshot,chapter=STAGES[b.stage],encounters=chapterEncounters(b.stage),p=s.players[0],next=s.wave+(s.cleared?1:0);
  return `<section class="bookmark-card" aria-label="Saved adventure"><div class="bookmark-heading"><img src="${plushPortrait(p.hero)}" alt=""/><div><p class="eyebrow">YOUR MESS IS STILL HERE</p><h3>${chapter.name}</h3><small>${s.players.map(p=>HEROES.find(h=>h.id===p.hero)!.name).join(' + ')} · ${b.relaxed?'Relaxed':'Normal'} · ${s.wave<0?'Trailhead':`${s.cleared?'Road to fight':'Fight'} ${next+1} / ${encounters.length}`}</small></div></div><p class="bookmark-fight">${encounters[next]?.title ?? 'A fresh set of terrible decisions'}</p><p class="bookmark-detail">${s.players.map((p,i)=>`${s.players.length>1?`P${i+1}: `:''}${Math.ceil(p.hp)} stuffing`).join(' · ')} · ${weaponById(p.weapon).name}</p><p class="bookmark-detail">${s.gold} loose teeth carried · ${s.earnedXp} XP unbanked</p>${action?'<button class="primary full" data-action="continue-run">Continue the mess →</button>':''}<small class="bookmark-rule">${s.cleared?'Returns to the cleared road with your saved loadout.':'Restarts this fight with its saved loadout.'} Earlier fights stay cleared. Counts as a retry.</small></section>`;
}
