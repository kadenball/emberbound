import type { Encounter } from './encounters';
type District = Encounter & {site:string};
const district=(x:number,site:string,title:string,hint:string,groups:Encounter['groups'],top=360,bottom=543):District=>({x,site,title,hint,groups,top,bottom,kind:'brawl',entrance:'drop'});
/** Late-journey districts have authored compositions and different lane shapes. */
export const EXTRA_ROUTES:District[][]=[
 [district(7300,'THE ROOT BUTCHER','FRESHLY MURDERED PICNIC','The rats bait your swing. Watch the mosquito behind the brute.',[['raider','flanker','archer'],['brute','raider','archer']],375,525),
  district(8420,'MAGGOT MOTEL','NO VACANCY. LOTS OF BODIES.','Separate the healer from its shield. A bowled guest does the job.',[['healer','shield','raider'],['flanker','flanker','brute']]),
  district(9430,'THE COMPOST CHOIR','EVERYBODY GETS MULCHED','Sacs, planted fists and flanks. Make their attacks hit their own crew.',[['bomber','brute','raider'],['archer','shield','flanker'],['brute','raider']],365,535)],
 [district(7700,'THE FREEZER MORGUE','BEST BEFORE: YESTERDAY','Do not stand in the charging lane. Punish the boar after it passes.',[['charger','archer','shield'],['charger','brute']],405,525),
  district(9230,'THE ICE-LOLLY SAWMILL','BRAIN FREEZE / BODY THAW','Open the crab from behind while the mosquitoes aim.',[['shield','archer','flanker'],['shield','shield','brute']]),
  district(10220,'THE DEFROST FUNERAL','OPEN CASKET. CLOSED FREEZER.','The nurse will undo careless damage. Break the stitch first.',[['healer','brute','charger'],['archer','bomber','flanker'],['shield','charger']],370,535)],
 [district(7850,'THE SURGICAL SPIN WARD','YOUR INSIDES ARE DELICATES','Separate the stitchers. Punt a stink sac through the staff.',[['healer','bomber','raider'],['healer','shield','brute']]),
  district(8970,'THE HAIRBALL RESERVOIR','THE DRAIN HAS A PULSE','A narrow wet lane rewards jumping and a deliberate bowl.',[['bomber','flanker','shield'],['brute','bomber']],415,510),
  district(10460,'THE LOST LIMB COUNTER','KEEP THE RECEIPT. AND THE ARM.','Do not repeat raw Heavy into an angry crew. Set up a finisher.',[['healer','brute','flanker'],['bomber','shield','charger'],['healer','brute']])],
 [district(7900,'THE GELATIN GUTTERY','MADE WITH REAL BAD DECISIONS','The ticks serve two courses. Return one; leave the other.',[['bomber','charger','raider'],['bomber','shield','brute']],375,535),
  district(9600,'THE TOOTH-PULL TAFFY LINE','DENTAL WORK WHILE YOU WAIT','Follow the flankers, then bowl through the thin service lane.',[['flanker','archer','shield'],['charger','brute']],410,515),
  district(11020,'THE SUGAR CRASH WARD','ONE LAST FUCKING SAMPLE','Support, ranged fire and charging teeth. Choose which threat stops first.',[['healer','charger','shield'],['bomber','archer','brute'],['charger','flanker']])],
 [district(8150,'THE ORGAN RECYCLER','USED PARTS. STILL SCREAMING.','Braced fists stop crowd control. Take the exposed back.',[['brute','healer','shield'],['brute','flanker']]),
  district(9760,'THE RUSTED RIB PRESS','CRUNCH TIME IS LITERAL','The narrow press lane demands a response to aimed attacks.',[['archer','charger','shield'],['bomber','brute']],405,520),
  district(11420,'THE REDUNDANCY SHREDDER','YOUR POSITION HAS BEEN DISMEMBERED','Break the support crew, then use bodies to open the line.',[['healer','shield','brute'],['bomber','charger','flanker'],['archer','brute']])],
 [district(8370,'THE ROYAL DISPOSAL YARD','THE KING REGRETS YOUR EXISTENCE','The court sent its best counterpunchers. Earn your Heavy.',[['shield','flanker','brute'],['healer','charger']]),
  district(10110,'THE INHERITANCE GRINDER','NEXT OF KIN. NEXT IN LINE.','Keep moving through the shooting lanes and punish the charge.',[['archer','bomber','charger'],['shield','brute','flanker']],390,530),
  district(12080,'THE LAST APPEAL','YOUR COMPLAINT HAS BEEN EATEN','No single move solves the whole crew. Interrupt, launch, evade, finish.',[['healer','shield','brute'],['archer','charger','bomber'],['brute','flanker','shield']])]
];
