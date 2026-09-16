import {expect,it} from 'vitest';
import {Game,idleInput} from '../src/engine';
import {royalProtected,royalStaff} from '../src/royal-guard';
import {bossCue} from '../src/boss-cue';
const make=()=>{
 const g=new Game('ember',11,{strength:4,vitality:4,spirit:4},140,{xp:9000,weapon:'pan',weapons:['starter','pan']});
 const king=g.spawn('boss',g.player.x+220,g.player.y);king.cooldown=0;
 for(let i=0;i<65&&!king.decree;i++)g.update(1/60,idleInput());
 return {g,king};
};
it('the first staff meeting visibly protects the king, including his apparent recovery',()=>{
 const {g,king}=make();expect(royalStaff(g.enemies)).toHaveLength(2);expect(royalProtected(king,g.enemies)).toBe(true);expect(king.bossState).toBe('recover');
 expect(bossCue(king,5,[])).toContain('CLEAR STAFF');
 const hp=king.hp;for(const impact of ['light','heavy','magic'] as const)expect((g as any).damageEnemy(king,40,0,false,impact,{x:king.x-70,height:80})).toBe(false);
 expect(king.hp).toBe(hp);expect(g.events).toContain('clang');
});
it('clearing both staff releases protection and creates a fresh opening once',()=>{
 const {g,king}=make(),staff=royalStaff(g.enemies);staff[0].hp=0;g.update(1/60,idleInput());expect(king.decree).toBe(true);
 staff[1].hp=0;g.update(1/60,idleInput());expect(king.decree).toBe(false);expect(king.bossState).toBe('recover');expect(king.bossTimer).toBe(2.2);
 g.update(1/60,idleInput());expect(king.bossTimer).toBeLessThan(2.2);
});
it('an actual bowled employee breaks the seal, damages the king and earns a longer opening',()=>{
 const {g,king}=make(),staff=royalStaff(g.enemies)[0];staff.entrance=0;staff.x=king.x-48;staff.y=king.y;
 (g as any).bowl(staff,1,590);const hp=king.hp;
 for(let i=0;i<12&&king.decree;i++)g.update(1/60,idleInput());
 expect(king.decree).toBe(false);expect(king.bossState).toBe('jammed');expect(king.bossTimer).toBeGreaterThan(3);expect(king.hp).toBeLessThan(hp);expect(g.bowlingHits).toBeGreaterThan(0);
 expect(royalStaff(g.enemies).length).toBeGreaterThan(0);expect(bossCue(king,5,[])).toContain('RETURNED TO SENDER');
 const after=king.hp;g.update(1/60,idleInput());expect(king.hp).toBe(after);
});
it('ordinary approaching enemies do not activate protection, and stale staff cannot sustain it',()=>{
 const g=new Game('ember',11,{strength:0,vitality:0,spirit:0},140),king=g.spawn('boss',500,450);g.spawn('shield',450,450);
 expect(royalProtected(king,g.enemies)).toBe(false);king.decree=true;expect(royalProtected(king,g.enemies)).toBe(false);
});

it('a player pan swing bowls a staff member into the seal through normal attack inputs',()=>{
 const {g,king}=make(),staff=royalStaff(g.enemies)[0];g.props=[];
 king.x=460;king.y=455;staff.x=265;staff.y=455;staff.entrance=0;staff.cooldown=3;staff.windup=staff.rush=0;
 g.player.x=205;g.player.y=455;g.player.face=1;
 for(let i=0;i<70&&king.decree;i++)g.update(1/60,{...idleInput(),heavy:i<3});
 expect(king.decree).toBe(false);expect(king.bossState).toBe('jammed');expect(g.bowlingHits).toBeGreaterThan(0);
 expect(g.objective).toContain('RETURN TO SENDER');
});
