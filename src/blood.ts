type Drop={x:number;y:number;z:number;vx:number;vy:number;vz:number;size:number;life:number};
type Stain={x:number;y:number;size:number;angle:number;life:number};
const noise=(n:number)=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
/** Cosmetic only: never consumes the combat RNG or modifies collision/rewards. */
export class Blood {
  drops:Drop[]=[];
  stains:Stain[]=[];
  spray(x:number,y:number,z:number,face:number,heavy:boolean,seed:number){
    const count=heavy?15:7;
    for(let i=0;i<count;i++)this.drops.push({x,y,z:z+40,vx:face*(65+noise(seed+i)*185),vy:(noise(seed+i+30)-.5)*90,vz:80+noise(seed+i+60)*200,size:2+noise(seed+i+90)*(heavy?5:3),life:1.2});
    if(this.drops.length>220)this.drops.splice(0,this.drops.length-220);
  }
  update(dt:number){
    for(const d of this.drops){
      d.life-=dt;d.x+=d.vx*dt;d.y+=d.vy*dt;d.vz-=900*dt;d.z+=d.vz*dt;
      if(d.z<=0&&d.life>0){this.stains.push({x:d.x,y:d.y,size:d.size*1.8,angle:d.vx*.01,life:35});d.life=0;}
    }
    this.drops=this.drops.filter(d=>d.life>0);
    for(const s of this.stains)s.life-=dt;
    this.stains=this.stains.filter(s=>s.life>0).slice(-130);
  }
  clear(){this.drops=[];this.stains=[];}
  draw(c:CanvasRenderingContext2D,air:boolean){
    c.save();
    if(air)for(const d of this.drops){c.fillStyle='#bb283d';c.beginPath();c.ellipse(d.x,d.y-d.z,d.size*1.5,d.size,.4,0,Math.PI*2);c.fill();c.fillStyle='#ef6a70';c.fillRect(d.x-d.size*.4,d.y-d.z-d.size*.5,d.size*.7,d.size*.4);}
    else for(const s of this.stains){c.globalAlpha=Math.min(.75,s.life/5);c.fillStyle='#701f32';c.beginPath();c.ellipse(s.x,s.y,s.size,s.size*.38,s.angle*.07,0,Math.PI*2);c.fill();}
    c.restore();
  }
}
