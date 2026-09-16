import type {Enemy} from './engine';
export const royalStaff=(enemies:Enemy[])=>enemies.filter(e=>e.summoned&&e.hp>0&&e.kind!=='boss');
export const royalProtected=(boss:Enemy,enemies:Enemy[])=>boss.hp>0&&!!boss.decree&&royalStaff(enemies).length>0;
