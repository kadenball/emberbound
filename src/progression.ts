export const STYLES = [
  { id: 'scrapper', name: 'Scrapper · Anger Issues', color: '#e9b17b', summary: 'Read an attack, dodge late, answer with a heavy.', techniques: [
    {level:2,name:'Rude reply',input:'Perfect dodge → Heavy',detail:'A close, late dodge primes a powerful counter for 1.2 seconds.'},
    {level:4,name:'Floor complaint',input:'Light ×3 → Down + Heavy',detail:'Hold the stick down (S / ↓) and tap Heavy for a wide ground quake. Ordinary finishers still bowl or spin.'},
    {level:6,name:'Complaint department',input:'Quake → travelling shockwave',detail:'The quake sends a ground wave through the next line of enemies.'},
    {level:8,name:'Entirely unreasonable',input:'Perfect dodge → Down + Heavy',detail:'Counter quakes reach farther and launch their victims.'}
  ]},
  { id: 'acrobat', name: 'Acrobat · Floor Allergy', color: '#a2d9ee', summary: 'Stay mobile. Turn an air dodge into a flying kick.', techniques: [
    {level:2,name:'Flying footwear',input:'Jump → Dodge → Light',detail:'An air dash gains lift and primes a long flying kick. Once per jump.'},
    {level:4,name:'No touching the floor',input:'Heavy connects → Jump',detail:'Jump-cancel any connected ground heavy into an aerial follow-up.'},
    {level:6,name:'Juggle tax',input:'Air follow-ups',detail:'Extend a juggle to five hits. Successful air follow-ups restore extra magic.'},
    {level:8,name:'Double trouble',input:'Second air dash',detail:'Use two lifting air dashes per jump; respect the dodge cooldown.'}
  ]},
  { id: 'hexer', name: 'Hexer · Gut Rot', color: '#c7a4e3', summary: 'Weave magic into melee for elemental finishers.', techniques: [
    {level:2,name:'Seasoned bonk',input:'Magic → Heavy',detail:'Casting primes an elemental finisher for three seconds: flaming arse, puke bind, or intestinal pull.'},
    {level:4,name:'Seconds, please',input:'Infused finisher connects',detail:'One successful infused swing refunds 12 magic. Whiffs do not pay.'},
    {level:6,name:'Party seasoning',input:'Magic → Heavy',detail:'The elemental finisher spreads farther through a crowd.'},
    {level:8,name:'Overseasoned',input:'Magic → Heavy',detail:'Infused finishers also launch ordinary enemies for follow-ups.'}
  ]}
] as const;
export type StyleId = typeof STYLES[number]['id'];
export const styleById = (id: StyleId) => STYLES.find(s => s.id === id)!;
export const validStyle = (value: unknown): value is StyleId => STYLES.some(s => s.id === value);
