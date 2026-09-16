import { EXTRA_ROUTES } from './extended-routes';
import { STAGES, type EnemyKind } from './content';
import { WORKPLACES } from './sabotage';
export type BeatKind = 'picnic' | 'brawl' | 'bridge' | 'bowling' | 'cart' | 'ambush' | 'sabotage' | 'boss';
export interface Encounter { x: number; title: string; hint: string; kind: BeatKind; groups: EnemyKind[][]; entrance: 'nap' | 'drop' | 'run'; top: number; bottom: number }
const beat = (x: number, title: string, hint: string, kind: BeatKind, groups: EnemyKind[][], entrance: Encounter['entrance'] = 'run'): Encounter => ({ x, title, hint, kind, groups, entrance, top: kind === 'bridge' ? 420 : 360, bottom: kind === 'bridge' ? 500 : 543 });
// Authored compositions teach one idea, then combine it with another. No modulo enemy pools.
const routes: Encounter[][] = [
 [beat(320, 'YOU ARE NOT ON THE PICNIC LIST', 'Light to slap · Heavy to launch · Jump and follow!', 'picnic', [['raider','raider'], ['brute']], 'nap'),
  beat(1380, 'THE BRIDGE HAS A WEIGHT LIMIT', 'Brutes commit to a swing. Dodge behind them.', 'bridge', [['brute','flanker'],['raider','flanker']]),
  beat(2500, 'PLUSH BOWLING CLUB', 'Light × 2 → Heavy rolls a foe into its friends.', 'bowling', [['raider','raider','shield'],['brute','raider']], 'nap'),
  beat(3650, 'SNACKS ON THE RUN', 'Stay beside the snack cart. Clear the road to keep it moving.', 'cart', [['flanker','raider'],['archer','raider'],['brute']]),
  beat(4850, 'THE BUSHES HAVE OPINIONS', 'Watch both sides. Ranged foes cannot cover every lane.', 'ambush', [['archer','flanker','raider'],['shield','brute']], 'drop'),
  beat(5940, 'ONE LAST TERRIBLE PICNIC', 'Use the spring and bean barrel. Make a mess.', 'bowling', [['brute','shield','raider'],['flanker','raider','archer']], 'nap')],
 [beat(340,'SLIPPERY CUSTOMERS','Jump-attack or use Heavy to open a shield guard.', 'picnic',[['shield','raider'],['archer','raider']],'nap'),
  beat(1500,'CUTLERY ON ICE','The bridge is narrow. Bowl them into one another.', 'bridge',[['shield','archer'],['flanker','brute']]),
  beat(2660,'FROZEN FOOD FIGHT','Launch a foe, jump, then slap it again before it lands.', 'bowling',[['raider','raider','brute'],['charger','shield']]),
  beat(3840,'ICE-CREAM DELIVERY','Escort the cart. The charging lane is marked before the rush.', 'cart',[['charger','raider'],['shield','archer'],['brute']]),
  beat(5060,'SNOW MUCH FOR THAT','Step out of a charge, then punish the recovery.', 'ambush',[['charger','flanker'],['shield','archer','raider']],'drop'),
  beat(6160,'COLD FEET, HOT TEMPERS','Mix heavy finishers and air follow-ups.', 'bowling',[['brute','shield','charger'],['archer','flanker']])],
 [beat(320,'THE SOCKS ARE UNIONISING','The laundry is waking up. Pick a lane.', 'picnic',[['raider','flanker'],['bomber']],'nap'),
  beat(1450,'DO NOT DRINK THE RINSE WATER','Rinse carries grounded feet and stink sacs. Jump or bonk the drain brake.', 'bridge',[['bomber','brute'],['healer','raider']]),
  beat(2600,'ODD SOCK OUT','Use the stretchy sock to pull a threat out of its group.', 'bowling',[['shield','healer','raider'],['bomber','flanker']],'drop'),
  beat(3810,'EXPRESS LAUNDRY','Escort the hamper. Knock attackers away from it.', 'cart',[['flanker','raider'],['bomber','raider'],['brute','healer']]),
  beat(5100,'THE SUPPORT GROUP','The gremlin heals its friends. Separate it with the sock.', 'ambush',[['healer','shield','brute'],['bomber','flanker']],'nap'),
  beat(6430,'RINSE AND REGRET','Bowl a foe through the springs. Madame is listening.', 'bowling',[['shield','bomber','raider'],['brute','healer','flanker']])],
 [beat(320,'NO FREE SAMPLES','Quick feet beat a charging sweet tooth.', 'picnic',[['charger','raider'],['bomber']],'nap'),beat(1450,'THE LICORICE BRIDGE','One lane, several bad decisions.', 'bridge',[['shield','charger'],['archer','flanker']]),beat(2660,'JAWBREAKER LANE','Heavy candy swings trade speed for knockback.', 'bowling',[['brute','raider','raider'],['shield','bomber']]),beat(3880,'DESSERT FIRST','Protect the dessert trolley while it moves.', 'cart',[['flanker','charger'],['archer','raider'],['bomber']]),beat(5170,'AFTER-DINNER MINTS','Bombs and chargers leave space to punish.', 'ambush',[['bomber','charger'],['shield','archer','flanker']],'drop'),beat(6460,'THE BILL HAS TEETH','Use the whole move set. Dessert is fighting back.', 'bowling',[['brute','shield','bomber'],['charger','flanker','raider']])],
 [beat(340,'HEALTH AND SAFETY-ISH','A lid is not a personality. Heavy opens guards.', 'picnic',[['shield','raider'],['healer']],'nap'),beat(1530,'THE FORKLIFT CROSSING','Let the brute miss. Take its back.', 'bridge',[['brute','shield'],['archer','flanker']]),beat(2790,'JUNKDRAWER PINBALL','Two belts, opposite directions. Ride a lane, jump, or bonk the shared brake.', 'bowling',[['shield','shield','raider'],['healer','brute']]),beat(4070,'SPECIAL DELIVERY','Stay with the trolley. It stops when left behind.', 'cart',[['flanker','raider'],['bomber','shield'],['charger']]),beat(5410,'FRANK LEFT THESE HERE','Support gremlins make brutes harder to ignore.', 'ambush',[['healer','brute','bomber'],['shield','flanker']],'drop'),beat(6770,'CLOCKING OUT','Bowl the workers through their own supplies.', 'bowling',[['brute','shield','healer'],['charger','bomber','raider']])],
 [beat(320,'A ROYAL WELCOME','Everyone brought their worst manners.', 'picnic',[['shield','flanker'],['archer','brute']],'nap'),beat(1510,'THE DRAWBRIDGE COMMITTEE','Watch the flank while breaking the guard.', 'bridge',[['shield','flanker','brute'],['healer','archer']]),beat(2820,'THE COURT OF BONK','A toothy finisher makes room for the next hit.', 'bowling',[['raider','brute','shield'],['bomber','charger']]),beat(4150,'THE CROWN CARRIAGE','Escort the royal snacks to the keep.', 'cart',[['flanker','shield'],['bomber','archer'],['charger','healer']]),beat(5550,'THE KING IS NOT IN','The curtains disagree.', 'ambush',[['healer','brute','flanker'],['shield','bomber','archer']],'drop'),beat(7010,'AUDIENCE WITH DISASTER','Everything you learned, one spectacular mess.', 'bowling',[['brute','shield','charger'],['healer','flanker','bomber']])]
];
export function chapterEncounters(stage: number): Encounter[] {
 const s = STAGES[stage];
 if (!s.bossStage) {
   // Specific later fights gain complementary reinforcements; opening lessons stay small.
   const additions: Partial<Record<number, EnemyKind>>[] = [
     {3:'shield',5:'archer'}, {2:'flanker',4:'brute'}, {1:'flanker',4:'archer'},
     {1:'bomber',3:'shield',5:'flanker'}, {0:'archer',3:'healer',5:'flanker'}, {1:'charger',3:'brute',5:'archer'}
   ];
   const sabotageAt = [2,3,5,4,3,1][s.region];
   const cartAt = [3,2,3,3,5,3][s.region];
   return [...routes[s.region],...EXTRA_ROUTES[s.region]].map((original,index) => {
     const machine = WORKPLACES[s.region];
     const encounter = index === sabotageAt ? {...original,kind:'sabotage' as const,title:machine.order,hint:'Bowl a foe into the bell, or land 3 Heavy hits · Then get clear!',top:360,bottom:543} : index === cartAt ? {...original,kind:'cart' as const,hint:'Heavy from behind launches the cart · Braced brutes stop it.'} : original;
     return {...encounter,groups:encounter.groups.map((group,g) => [...group,...(g === encounter.groups.length-1 && additions[s.region][index] ? [additions[s.region][index]!] : [])])};
   });
 }
 return [beat(380,'MANAGEMENT IS EXPECTING YOU','A final rehearsal: choose your targets.', 'brawl',[[s.enemies[0],'flanker'],[s.enemies[1],'raider']]),beat(1200,'PLEASE WIPE YOUR FEET','Use the supplies before meeting the boss.', 'bowling',[['brute','shield'],[s.enemies[2],'raider']],'nap'),beat(1980,s.boss, s.region===2?'Bowl laundry into the open drum while she inhales.':'Watch the wind-up. Strike during recovery.', 'boss',[['boss']])];
}
