"""Original chapter compositions. Outputs editable MIDI, rendered audio and a manifest.
Requires g++, ffmpeg and the pinned TinySoundFont/GeneralUser bank (see README).
"""
import json,struct,subprocess,hashlib,os
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
TOOLS=Path(os.environ.get('EMBERBOUND_MUSIC_TOOLS', str(Path.home()/'.local/share/emberbound-tools/music')))
OUT=ROOT/'public/audio/chapters'; OUT.mkdir(exist_ok=True,parents=True)
MID=ROOT/'music/midi';MID.mkdir(exist_ok=True,parents=True)
# title, bpm, tonic (MIDI), lead/comp/pad/bass patches, mode, motif, response
SCORES=[
 ('The Picnic Oath',124,62,[73,12,48,43],[0,2,3,5,7,9,10],[0,2,4,2,1,3,5,4,2,0,1,2,4,3,1,0],[4,5,6,5,3,4,2,1,3,5,4,2,1,2,0,0]),
 ('Kettle Rebellion',152,50,[61,45,48,58],[0,2,3,5,7,8,10],[0,0,4,3,2,1,0,4,5,4,2,3,1,0,6,4],[4,6,7,6,5,3,4,2,3,2,1,4,3,1,0,0]),
 ('Cold Feet Warm Crimes',116,64,[8,46,52,42],[0,2,3,5,7,8,10],[4,2,3,1,2,0,4,6,5,3,4,2,1,3,2,0],[7,6,4,5,3,2,4,6,5,4,2,3,1,2,0,4]),
 ('Dough or Die',146,54,[11,45,61,43],[0,2,3,5,7,8,11],[0,4,1,5,2,6,3,4,0,2,5,3,6,4,1,0],[7,4,6,3,5,2,4,1,6,4,3,5,2,1,0,4]),
 ('Rinse Repeat Regret',118,57,[71,24,50,34],[0,2,3,5,7,9,10],[0,2,3,4,2,0,6,4,3,1,2,4,5,3,2,0],[4,6,5,3,4,2,0,2,3,5,6,4,2,1,3,0]),
 ('Spin Cycle Cathedral',158,48,[19,45,52,38],[0,2,3,5,7,8,11],[0,1,4,0,5,4,2,1,0,3,6,4,2,5,1,0],[4,7,6,4,5,3,6,2,4,1,3,5,4,2,1,0]),
 ('Sugar Crash',132,55,[65,11,61,32],[0,2,3,5,7,9,10],[0,2,4,5,3,2,6,4,3,0,2,1,4,5,2,0],[5,6,7,4,2,3,5,4,6,3,2,4,1,2,0,3]),
 ('Blood Sugar Waltz',168,60,[6,19,48,42],[0,2,3,5,7,8,11],[0,4,6,5,3,4,2,1,3,5,4,2,0,1,6,4],[7,6,4,3,5,4,2,6,4,3,1,2,5,3,1,0]),
 ('Forklift Fandango',128,52,[21,12,60,34],[0,2,3,5,7,8,10],[0,0,2,4,3,5,4,2,0,3,2,1,4,3,1,0],[4,6,5,3,4,7,6,4,3,5,2,4,1,3,0,0]),
 ('No Paid Breaks',154,46,[57,29,61,38],[0,1,3,5,7,8,10],[0,0,1,4,0,3,2,1,4,4,3,6,5,2,1,0],[4,5,6,4,3,2,1,0,5,4,2,3,6,4,1,0]),
 ('Cardboard Coronation',126,62,[60,46,48,43],[0,2,3,5,7,8,10],[0,2,4,6,5,3,4,2,1,3,5,7,6,4,2,0],[7,6,4,5,3,4,2,1,6,5,3,4,2,1,0,4]),
 ('Bite the Throne',160,50,[61,19,52,43],[0,2,3,5,7,8,11],[0,2,4,2,1,3,5,4,6,4,2,0,1,4,3,0],[7,6,4,7,5,3,6,4,5,2,4,1,3,6,1,0])
]
def vlq(n):
 out=[n&127];n>>=7
 while n:out.insert(0,(n&127)|128);n>>=7
 return bytes(out)
def write_score(index,score):
 title,bpm,tonic,patches,mode,motif,response=score;beats=3 if index==7 else 4;bar_ticks=beats*480;duration=32*beats*60/bpm
 events=[(0,b'\xff\x51\x03'+int(60000000/bpm).to_bytes(3,'big'))]
 for ch,patch in enumerate(patches+[45,60]):
  events.extend([(0,bytes([0xc0+ch,patch])),(0,bytes([0xb0+ch,10,[64,30,90,64,105,40][ch]])),(0,bytes([0xb0+ch,7,[100,74,53,96,65,66][ch]]))])
 events.append((0,bytes([0xc9,0])))
 def note(ch,key,start,length,vel):
  events.extend([(round(start*480),bytes([0x90+ch,max(0,min(127,key)),vel])),(round((start+length)*480),bytes([0x80+ch,max(0,min(127,key)),0]))])
 def pitch(degree,octave=0):return tonic+mode[degree%7]+12*(degree//7+octave)
 for cycle in range(2):
  for bar in range(32):
   start=(cycle*32+bar)*beats;section=bar//8;boss=index%2==1
   root=([0,5,3,4,0,2,5,4] if section!=2 else [5,3,0,4,5,1,3,4])[bar%8]
   # Root/fifth bass pulse, offset upper-string ostinato and sustained harmony.
   for beat in range(beats):
    note(3,pitch(root if beat%2==0 else root+4,-2),start+beat,.75,91 if beat==0 else 73)
    if section!=2 or bar%2:
     for sub in range(2):note(1,pitch(root+[0,2,4,2][(beat*2+sub)%4]),start+beat+sub*.5,.38,63+sub*8)
   for interval in [0,2,4]:note(2,pitch(root+interval,-1),start,beats-.12,61 if section in [1,3] else 46)
   phrase=motif if section in [0,3] else response
   # Authored melodic contour; alternating short answers and held phrase cadences.
   for beat in range(beats):
    n=(bar%4*beats+beat)%16;degree=phrase[n]+(7 if section==3 and bar%4==3 else 0)
    note(0,pitch(degree),start+beat,.78 if beat!=beats-1 else .93,92 if section!=2 else 70)
    if (n+index)%5==2 and section!=2:note(0,pitch(degree+1),start+beat+.5,.24,72)
   if section in [1,3]:
    for beat in [0,2] if beats==4 else [0]:note(5,pitch(root+4,-1),start+beat,1.6,75)
   if section==3:
    for beat in range(beats):note(4,pitch(root+[4,2,0,2][beat]),start+beat+.25,.32,67)
   # Orchestral kit, syncopated toms and a restrained bridge.
   if section!=2 or bar%2:
    for beat in range(beats):
     note(9,36 if beat%2==0 else 38,start+beat,.12,102 if boss else 79)
     for sub in range(2):note(9,42,start+beat+sub*.5,.09,43+sub*12)
    if boss:note(9,41,start+beats-.5,.18,84)
   if bar%8==0:note(9,49,start,.5,82 if boss else 61)
   if bar%8==7:
    for sub in range(4):note(9,[45,47,48,50][sub],start+beats-1+sub*.25,.15,75+sub*6)
 events.sort(key=lambda item:(item[0],item[1][0]&0xf0!=0x80))
 data=b'';last=0
 for tick,msg in events:data+=vlq(tick-last)+msg;last=tick
 data+=b'\x00\xff\x2f\x00';path=MID/f'chapter-{index+1:02}.mid';path.write_bytes(b'MThd'+struct.pack('>IHHH',6,0,1,480)+b'MTrk'+struct.pack('>I',len(data))+data)
 return path,duration
def main():
 subprocess.run(['g++','-O2','-I'+str(TOOLS),str(ROOT/'scripts/music/render.cpp'),'-o',str(TOOLS/'render-score')],check=True)
 manifest=[]
 for i,score in enumerate(SCORES):
  midi,duration=write_score(i,score);raw=TOOLS/f'chapter-{i+1:02}.f32';out=OUT/f'chapter-{i+1:02}.mp3'
  subprocess.run([str(TOOLS/'render-score'),str(TOOLS/'GeneralUser-GS.sf2'),str(midi),str(raw),str(duration*2+2)],check=True)
  # Render two cycles to warm sample releases/reverb; retain the second musical cycle.
  filters=f'aecho=0.8:0.7:47|89:0.13|0.08,atrim=start={duration}:duration={duration},asetpts=PTS-STARTPTS,loudnorm=I=-18:TP=-1.5:LRA=9,afade=t=in:d=0.008,afade=t=out:st={duration-.008}:d=0.008'
  subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar','44100','-ac','2','-i',str(raw),'-af',filters,'-ar','44100','-c:a','libmp3lame','-b:a','160k','-map_metadata','-1',str(out)],check=True)
  raw.unlink();manifest.append({'chapter':i,'title':score[0],'bpm':score[1],'beatsPerBar':3 if i==7 else 4,'bars':32,'seconds':round(duration,3),'file':'/audio/chapters/'+out.name,'sha256':hashlib.sha256(out.read_bytes()).hexdigest()});print(f'{i+1:02} {score[0]} {duration:.1f}s',flush=True)
 (OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')

if __name__=='__main__':main()
