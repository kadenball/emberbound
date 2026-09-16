type Actionable=HTMLButtonElement|HTMLInputElement;
type Direction='up'|'down'|'left'|'right'|'';
export interface MenuContext {key:string;active:boolean;scope:HTMLElement|null;preferred?:string;backLabel?:string;canPause?:boolean}
interface PadHistory {buttons:Set<number>;direction:Direction;repeatAt:number;blockDirection:boolean}
const selector='button:not(:disabled),input[type="checkbox"]:not(:disabled)';
const attributes=['data-action','data-stage','data-hero','data-partner','data-weapon','data-style','data-upgrade','data-setting','data-go'];
const identity=(el:Actionable)=>attributes.filter(a=>el.hasAttribute(a)).map(a=>`${a}=${el.getAttribute(a)}`).join('|')||el.id;
const focusBox=(el:Actionable)=>el.closest<HTMLElement>('.setting')??el;

/** One UI action per poll, stable focus across redraws, and no held-button activation. */
export class MenuInput {
 private pads=new Map<number,PadHistory>();
 private contextKey='';private focused:Actionable|null=null;private ordinal=0;private savedKey='';
 private memories=new Map<string,{key:string;ordinal:number}>();
 private engaged=false;private suspended=false;private resetPads=false;
 private hint=document.createElement('div');
 constructor(private context:()=>MenuContext,private activate:(el:Actionable)=>void,private back:()=>void,private start:()=>void){
  this.hint.id='controller-help';this.hint.hidden=true;this.hint.setAttribute('aria-hidden','true');document.body.append(this.hint);
  window.addEventListener('keydown',e=>{
   const ctx=this.sync();if(!ctx.active||this.suspended||e.altKey||e.metaKey||e.ctrlKey)return;
   const direction=({ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'} as Record<string,Direction>)[e.code];
   const pause=e.code==='KeyP'&&ctx.canPause;
   if(!direction&&!pause&&!['Enter','Space','Escape'].includes(e.code))return;
   e.preventDefault();e.stopImmediatePropagation();this.engaged=true;
   if(direction)this.move(direction);else if(!e.repeat){if(pause)this.start();else if(e.code==='Escape')this.back();else this.choose();}
  },true);
  window.addEventListener('pointerdown',()=>{this.engaged=false;this.unmark();this.hint.hidden=true;},true);
  window.addEventListener('blur',()=>{this.suspended=true;this.unmark();this.hint.hidden=true;});
  window.addEventListener('focus',()=>{this.suspended=false;this.resetPads=true;});
 }
 private candidates(ctx=this.context()):Actionable[]{
  return ctx.scope?Array.from(ctx.scope.querySelectorAll<Actionable>(selector)).filter(el=>el.getClientRects().length>0&&!el.closest('[hidden]')&&getComputedStyle(el).visibility!=='hidden'):[];
 }
 private unmark(){document.querySelectorAll('.menu-focus').forEach(el=>el.classList.remove('menu-focus'));}
 private remember(el:Actionable,items=this.candidates()){
  this.savedKey=identity(el);this.ordinal=items.filter(item=>identity(item)===this.savedKey).indexOf(el);
  this.memories.set(this.contextKey,{key:this.savedKey,ordinal:this.ordinal});
 }
 private sync(){
  const ctx=this.context();
  if(ctx.key!==this.contextKey){
   this.contextKey=ctx.key;const memory=this.memories.get(ctx.key);this.savedKey=memory?.key??'';this.ordinal=memory?.ordinal??0;this.focused=null;
   for(const pad of this.pads.values())pad.blockDirection=true;
  }
  if(!ctx.active||this.suspended){this.unmark();this.hint.hidden=true;return ctx;}
  const items=this.candidates(ctx), active=items.find(el=>el===document.activeElement);
  let changed=false;
  if(active&&active!==this.focused){this.focused=active;this.remember(active,items);}
  if(!this.focused||!items.includes(this.focused)){
   const current=document.activeElement instanceof HTMLElement?items.find(el=>el===document.activeElement):undefined;
   this.focused=current??items.filter(el=>identity(el)===this.savedKey)[this.ordinal]??items.find(el=>ctx.preferred&&el.matches(ctx.preferred))??items[0]??null;
   changed=true;if(this.focused)this.remember(this.focused,items);
  }
  if(this.engaged&&this.focused)this.mark(this.focused,changed);
  return ctx;
 }
 private mark(el:Actionable,scroll=true){
  this.unmark();focusBox(el).classList.add('menu-focus');
  el.focus({preventScroll:true});if(scroll)focusBox(el).scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
  this.hint.hidden=false;this.hint.textContent=`D-pad / arrows: move · A / ×: ${el.hasAttribute('data-stage')?'enter chapter':'choose'} · B / ○: ${this.context().backLabel??'back'}`;
 }
 focus(selector:string){const el=this.candidates().find(el=>el.matches(selector));if(el){this.engaged=true;this.focused=el;this.remember(el);this.mark(el);}}
 private move(direction:Direction){
  this.sync();const items=this.candidates();if(!items.length)return;
  const current=items.find(el=>el===document.activeElement)??this.focused??items[0],box=focusBox(current).getBoundingClientRect();
  const horizontal=direction==='left'||direction==='right',sign=direction==='left'||direction==='up'?-1:1;
  const options=items.filter(el=>el!==current).map(el=>{const b=focusBox(el).getBoundingClientRect(),dx=b.x+b.width/2-box.x-box.width/2,dy=b.y+b.height/2-box.y-box.height/2;
   const ahead=(horizontal?dx:dy)*sign,across=Math.abs(horizontal?dy:dx),overlap=horizontal?Math.min(box.bottom,b.bottom)-Math.max(box.top,b.top):Math.min(box.right,b.right)-Math.max(box.left,b.left);
   return {el,ahead,score:ahead+across*.35+(overlap>0?0:1000)};
  }).filter(o=>o.ahead>8).sort((a,b)=>a.score-b.score);
  this.focused=options[0]?.el??current;this.remember(this.focused,items);this.mark(this.focused);
 }
 private choose(){
  this.sync();const items=this.candidates(),el=items.find(el=>el===document.activeElement)??this.focused;
  if(el&&items.includes(el)){this.remember(el,items);this.activate(el);}
 }
 poll(now:number){
  const ctx=this.sync(),pads=Array.from(navigator.getGamepads?.()??[]).filter((p):p is Gamepad=>!!p?.connected);let action:(()=>void)|undefined;
  const connected=new Set(pads.map(p=>p.index));for(const index of this.pads.keys())if(!connected.has(index))this.pads.delete(index);
  for(const pad of pads){
   const buttons=new Set(pad.buttons.flatMap((b,i)=>b.pressed?[i]:[]));
   const x=Number(buttons.has(15))-Number(buttons.has(14))+(pad.axes[0]??0),y=Number(buttons.has(13))-Number(buttons.has(12))+(pad.axes[1]??0);
   const direction:Direction=Math.max(Math.abs(x),Math.abs(y))<.55?'':Math.abs(x)>Math.abs(y)?x>0?'right':'left':y>0?'down':'up';
   const previous=this.pads.get(pad.index)??{buttons:new Set<number>(),direction:'',repeatAt:0,blockDirection:false};
   if(this.resetPads)previous.blockDirection=true;
   const fresh=(button:number)=>buttons.has(button)&&!previous.buttons.has(button);
   if(!this.suspended&&!this.resetPads&&!action){
    if(fresh(9))action=()=>this.start();
    else if(ctx.active){
     if(fresh(1))action=()=>this.back();
     else if(fresh(0))action=()=>this.choose();
     else if(direction&&!previous.blockDirection&&(direction!==previous.direction||now>=previous.repeatAt)){
      action=()=>this.move(direction);previous.repeatAt=now+(direction!==previous.direction?380:125);
     }
    }
   }
   this.pads.set(pad.index,{buttons,direction,repeatAt:previous.repeatAt,blockDirection:direction?previous.blockDirection:false});
  }
  this.resetPads=false;
  if(action){this.engaged=true;action();this.sync();}
  if(!pads.length&&!this.engaged)this.hint.hidden=true;
 }
}
