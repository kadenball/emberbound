import type {Game} from '../src/engine';
import {playInput} from './gameplay-policy';
import {trapState} from '../src/setpieces';
export type SupplyPolicy='rush'|'read'|'skip';
/** A local input-only comparison of route choices, not a model of human skill. */
export function supplyInput(g:Game,frame:number,policy:SupplyPolicy) {
 const input=playInput(g,frame),p=g.player;
 if(policy==='rush'||g.enemies.some(e=>e.hp>0)||g.cart&&!g.cart.complete||g.machines.some(m=>m.encounter===g.wave&&m.phase!=='wrecked'))return input;
 const prop=g.props.filter(q=>!q.active&&['lever','chest'].includes(q.kind)&&q.x>p.x-140&&q.x<g.nextEncounterX).sort((a,b)=>a.x-b.x)[0];
 const trap=g.setpieces.find(t=>t.road&&t.id===prop?.hazard);if(!prop||!trap)return input;
 if(policy==='skip') {input.x=1;input.y=Math.abs(p.y-450)>6?Math.sign(450-p.y):0;input.attack=input.heavy=false;return input;}
 const safe=!trapState(trap).warning&&!trapState(trap).active;
 input.x=Math.abs(prop.x-p.x)>55?Math.sign(prop.x-p.x):0;
 const lane=safe?prop.y:450;input.y=Math.abs(p.y-lane)>6?Math.sign(lane-p.y):0;
 input.attack=safe&&Math.abs(p.x-prop.x)<65&&Math.abs(p.y-prop.y)<28;input.heavy=false;
 return input;
}
