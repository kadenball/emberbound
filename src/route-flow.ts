import type {Encounter} from './encounters';
export interface RouteFlow { id:number; control:number; encounter:number; kind:'rinse'|'belt'; x:number; width:number; y:number; depth:number; speed:number }
/** Two authored workplaces, not a repeating hazard on every road. */
export function chapterFlows(stage:number,encounters:readonly Encounter[]):RouteFlow[] {
  if(stage===4)return [{id:0,control:0,encounter:1,kind:'rinse',x:encounters[1].x+120,width:560,y:460,depth:76,speed:110}];
  if(stage===8)return [
    {id:0,control:0,encounter:2,kind:'belt',x:encounters[2].x+90,width:650,y:393,depth:54,speed:125},
    {id:1,control:0,encounter:2,kind:'belt',x:encounters[2].x+90,width:650,y:507,depth:60,speed:-125}
  ];
  return [];
}
export function onFlow(flow:RouteFlow,x:number,y:number,height=0) {
  return height<18&&x>=flow.x&&x<flow.x+flow.width&&Math.abs(y-flow.y)<flow.depth/2;
}
