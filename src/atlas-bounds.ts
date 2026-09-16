type Point=[number,number];
export interface Bounds{x:number;y:number;w:number;h:number;outline?:Point[]}
function hull(points:Point[]):Point[]{
 points.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
 const cross=(a:Point,b:Point,c:Point)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 const half=(list:Point[])=>{const out:Point[]=[];for(const p of list){while(out.length>1&&cross(out.at(-2)!,out.at(-1)!,p)<=0)out.pop();out.push(p);}return out.slice(0,-1);};
 return [...half(points),...half([...points].reverse())];
}
/** Locate the connected sprite inside a loose atlas cell. Only source coordinates
 * change: the packaged pixels and alpha remain untouched. This excludes fragments
 * of a neighbouring extended pose at the edge of a hand-drawn sheet. */
export function atlasBounds(image:HTMLImageElement){
 const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
 const c=canvas.getContext('2d')!;c.drawImage(image,0,0);
 const pixels=c.getImageData(0,0,image.width,image.height).data;
 return (rect:Bounds):Bounds=>{
  const visited=new Uint8Array(rect.w*rect.h),queue=new Int32Array(rect.w*rect.h);
  const alpha=(k:number)=>pixels[((rect.y+Math.floor(k/rect.w))*image.width+rect.x+k%rect.w)*4+3];
  let best=0,result=rect;
  for(let i=0;i<visited.length;i++){
   if(visited[i])continue;visited[i]=1;
   if(alpha(i)<40)continue;
   let head=0,tail=1,minX=rect.w,minY=rect.h,maxX=0,maxY=0;queue[0]=i;
   while(head<tail){const k=queue[head++],x=k%rect.w,y=Math.floor(k/rect.w);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
    for(const next of [x>0?k-1:-1,x<rect.w-1?k+1:-1,y>0?k-rect.w:-1,y<rect.h-1?k+rect.w:-1])if(next>=0&&!visited[next]){visited[next]=1;if(alpha(next)>=40)queue[tail++]=next;}
   }
   if(tail>best){best=tail;const x=Math.max(0,minX-2),y=Math.max(0,minY-2);const left=new Int32Array(rect.h).fill(rect.w),right=new Int32Array(rect.h).fill(-1);
    for(let q=0;q<tail;q++){const xx=queue[q]%rect.w,yy=Math.floor(queue[q]/rect.w);left[yy]=Math.min(left[yy],xx);right[yy]=Math.max(right[yy],xx);}
    const points:Point[]=[];for(let yy=0;yy<rect.h;yy++)if(right[yy]>=0){points.push([rect.x+left[yy]-2,rect.y+yy],[rect.x+right[yy]+2,rect.y+yy]);}
    result={x:rect.x+x,y:rect.y+y,w:Math.min(rect.w-1,maxX+2)-x+1,h:Math.min(rect.h-1,maxY+2)-y+1,outline:hull(points)};}
  }return result;
 };
}

/** Clip the source's outline envelope as well as its rectangle: a long leg or
 * diagonal dive can otherwise leave an unrelated corner fragment inside the cell. */
export function drawAtlas(c:CanvasRenderingContext2D,image:HTMLImageElement,b:Bounds,fx:number,fy:number,scale:number){
 c.save();if(b.outline?.length){c.beginPath();b.outline.forEach(([x,y],i)=>{const xx=(x-fx)*scale,yy=(y-fy)*scale;i?c.lineTo(xx,yy):c.moveTo(xx,yy);});c.closePath();c.clip();}
 c.drawImage(image,b.x,b.y,b.w,b.h,(b.x-fx)*scale,(b.y-fy)*scale,b.w*scale,b.h*scale);c.restore();
}
