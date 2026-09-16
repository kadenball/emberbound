import {expect,it} from 'vitest';
import {CHAPTER_STORY,storyLines,validStoryId} from '../src/story';
import {STAGES} from '../src/content';
import {freshSave,parseSave} from '../src/save';
it('every chapter has a mission and three opening lines, with boss payoffs and a final ending',()=>{
 expect(CHAPTER_STORY).toHaveLength(STAGES.length);
 CHAPTER_STORY.forEach((chapter,i)=>{expect(chapter.task.length).toBeGreaterThan(30);expect(chapter.intro).toHaveLength(3);expect(chapter.after.length>0).toBe(STAGES[i].bossStage);});
 expect(storyLines(0,'intro','ember')).toHaveLength(7);expect(storyLines(11,'after','ember').at(-1)?.text).toContain('right reasons');
});
it('seen scenes migrate, validate and persist without changing campaign unlocks',()=>{
 const s=freshSave();s.unlocked=3;s.storySeen=['intro-0','after-1'];const restored=parseSave(JSON.stringify(s));expect(restored.storySeen).toEqual(s.storySeen);expect(restored.unlocked).toBe(3);
 expect(parseSave(JSON.stringify({...s,storySeen:['intro-0','intro-0','after-99',{},'javascript:x']})).storySeen).toEqual(['intro-0']);
 expect(parseSave(JSON.stringify({...s,storySeen:undefined})).storySeen).toEqual([]);expect(validStoryId('intro-12')).toBe(false);
});
