import type {Game} from './engine';
export type ScoreScene='menu'|'travel'|'combat'|'boss'|'entrance'|'rage'|'victory'|'defeat';
export function scoreScene(game:Game|null,visible:boolean):ScoreScene {
 if(!game||!visible)return 'menu';
 if(game.state==='lost')return 'defeat';
 if(game.state==='won'||game.bossMoment?.kind==='defeat')return 'victory';
 if(game.bossMoment?.kind==='entrance')return 'entrance';
 if(game.bossMoment?.kind==='rage'||game.enemies.some(e=>e.kind==='boss'&&e.hp>0&&e.enraged))return 'rage';
 if(game.enemies.some(e=>e.kind==='boss'&&e.hp>0))return 'boss';
 return game.encounterActive?'combat':'travel';
}
export const SCENE_GAIN:Record<ScoreScene,number>={menu:.45,travel:.29,combat:.46,boss:.5,entrance:.17,rage:.54,victory:.12,defeat:.14};
export const cueFor=(scene:ScoreScene,region:number)=>['entrance','rage','victory','defeat'].includes(scene)?`/audio/cues/region-${region+1}-${scene}.mp3`:null;
