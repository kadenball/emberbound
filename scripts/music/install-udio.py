"""Master the user's recordings and replace every packaged non-menu score.
Original downloads and the superseded soundtrack remain in music/, outside the app.
"""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import hashlib,json,shutil,subprocess,tempfile
ROOT=Path(__file__).resolve().parents[2]
TRACKS=json.loads((ROOT/'music/source/udio/manifest.json').read_text())['tracks']
# Ten recordings for twelve chapters: the royal approach and finale reprise earlier themes.
CHAPTERS=[1,2,3,4,5,6,7,8,9,10,2,10]
MENU_SHA='a566a24bfbc390e930b95425a2eddd0e4ac40a31e924bb486a9a939cec196907'
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def run(args):return subprocess.run(args,check=True,capture_output=True,text=True)
def duration(path):return float(run(['ffprobe','-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',str(path)]).stdout)
def master(pair):
 track,stage=pair;source=ROOT/track['sourceFile'];out=stage/f'track-{track["index"]:02}.mp3'
 assert sha(source)==track['sha256']
 edges=f'afade=t=in:d=0.08,afade=t=out:st={track["seconds"]-.75}:d=0.75'
 result=run(['ffmpeg','-hide_banner','-nostats','-i',str(source),'-af',edges+',loudnorm=I=-18:TP=-1.5:LRA=14:print_format=json','-f','null','-'])
 stats=json.JSONDecoder().raw_decode(result.stderr[result.stderr.rfind('{'):])[0]
 normalize=f'loudnorm=I=-18:TP=-1.5:LRA=14:measured_I={stats["input_i"]}:measured_TP={stats["input_tp"]}:measured_LRA={stats["input_lra"]}:measured_thresh={stats["input_thresh"]}:offset={stats["target_offset"]}:linear=true'
 run(['ffmpeg','-v','error','-y','-i',str(source),'-af',edges+','+normalize,'-ar','44100','-ac','2','-c:a','libmp3lame','-b:a','160k',str(out)])
 print(f'Mastered {track["index"]}: {track["title"]}',flush=True)
 return {**track,'file':f'/audio/chapters/{out.name}','sha256':sha(out),'sourceSha256':track['sha256'],'seconds':duration(out),'masteringInput':stats}
def install():
 menu=ROOT/'public/audio/menu-theme.mp3';assert sha(menu)==MENU_SHA
 with tempfile.TemporaryDirectory(prefix='emberbound-udio-master-') as temp:
  work=Path(temp);chapters=work/'chapters';cues=work/'cues';chapters.mkdir();cues.mkdir()
  with ThreadPoolExecutor(max_workers=2) as pool:mastered=list(pool.map(master,[(t,chapters) for t in TRACKS]))
  by_id={t['index']:t for t in mastered};manifest=[]
  for chapter,index in enumerate(CHAPTERS):
   t=by_id[index];manifest.append({'chapter':chapter,'title':t['title'],'artist':t['artist'],'songId':t['songId'],'source':t['page'],'seconds':t['seconds'],'file':t['file'],'sha256':t['sha256']})
  (chapters/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
  cue_manifest=[]
  for region in range(6):
   t=by_id[CHAPTERS[region*2+1]];source=chapters/Path(t['file']).name
   for kind,start,seconds in [('entrance',16+region*3,3.4),('rage',55+region*3,2.8),('victory',94+region*2,4.2),('defeat',117-region*2,3.6)]:
    out=cues/f'region-{region+1}-{kind}.mp3'
    run(['ffmpeg','-v','error','-y','-ss',str(start),'-i',str(source),'-t',str(seconds),'-af',f'afade=t=in:d=0.035,afade=t=out:st={seconds-.35}:d=0.35','-ar','44100','-ac','2','-c:a','libmp3lame','-b:a','160k',str(out)])
    cue_manifest.append({'region':region,'kind':kind,'theme':t['title'],'artist':t['artist'],'source':t['page'],'songId':t['songId'],'excerptStart':start,'file':'/audio/cues/'+out.name,'seconds':duration(out),'sha256':sha(out)})
  (cues/'manifest.json').write_text(json.dumps(cue_manifest,indent=2)+'\n')
  archive=ROOT/'music/archive/pre-udio-0.30'
  for name in ['chapters','cues']:
   current=ROOT/'public/audio'/name
   if not (archive/name).exists():shutil.copytree(current,archive/name)
   # This is the explicitly superseded packaged soundtrack; archive before replacement.
   for old in current.iterdir():
    if old.is_file():old.unlink()
   for new in (work/name).iterdir():shutil.copy2(new,current/new.name)
  score='export const CHAPTER_MUSIC='+json.dumps(manifest,indent=2)+';\n'
  (ROOT/'src/soundtrack.ts').write_text(score)
  (ROOT/'music/source/udio/mastering.json').write_text(json.dumps({'menuSha256':MENU_SHA,'target':'-18 LUFS, -1.5 dBTP, stereo 44.1 kHz 160 kbit/s; 80 ms start and 750 ms end fades','tracks':mastered},indent=2)+'\n')
 assert sha(menu)==MENU_SHA
 print('Installed ten recordings across twelve chapters and 24 scene excerpts; menu bytes unchanged.',flush=True)
if __name__=='__main__':install()
