"""Short original regional cues, derived from each boss score's key and instrumentation."""
import hashlib,json,struct,subprocess
from compose import ROOT,TOOLS,SCORES,vlq
OUT=ROOT/'public/audio/cues';MID=ROOT/'music/cues'
OUT.mkdir(parents=True,exist_ok=True);MID.mkdir(parents=True,exist_ok=True)
manifest=[]
for region in range(6):
 title,bpm,tonic,patches,mode,motif,_=SCORES[region*2+1]
 for kind in ['entrance','rage','victory']:
  tempo=112 if kind=='entrance' else 172 if kind=='rage' else 138
  events=[(0,b'\xff\x51\x03'+int(60000000/tempo).to_bytes(3,'big'))]
  for ch,patch in enumerate([patches[0],patches[2],patches[3],45]):
   events.extend([(0,bytes([0xc0+ch,patch])),(0,bytes([0xb0+ch,7,[105,66,98,79][ch]])),(0,bytes([0xb0+ch,10,[64,92,64,30][ch]]))])
  def note(ch,key,at,length,velocity):
   events.extend([(round(at*480),bytes([0x90+ch,key,velocity])),(round((at+length)*480),bytes([0x80+ch,key,0]))])
  def pitch(degree,octave=0):return tonic+mode[degree%7]+12*(degree//7+octave)
  if kind=='entrance':
   for i,d in enumerate([0,0,4,3,1,0]):note(0,pitch(d),i*.5,.34,95+i*3)
   for i in range(6):note(2,pitch(0,-1),i*.5,.38,100 if i%2==0 else 70)
   for d in [0,2,4]:note(1,pitch(d),3,1.6,83)
   note(9,49,3,.5,100);note(9,36,3,.2,120);beats=5
  elif kind=='rage':
   for i in range(12):note(3,pitch([0,1,4,5][i%4]),i*.25,.17,80+i*3)
   for i,k in enumerate([41,43,45,47,48,50]):note(9,k,i*.5,.2,84+i*6)
   for d in [0,1,4]:note(0,pitch(d),3,.6,105)
   note(2,pitch(0,-1),3,1.5,120);note(9,49,3,.6,115);beats=5
  else:
   # A brief major cadence and a comic high answer, distinct from the minor fight.
   for i,d in enumerate([0,4,7,12,16,19]):note(0,tonic+d,i*.34,.28,99)
   for offset in [0,4,7]:note(1,tonic+offset,2.1,2.1,85)
   note(2,tonic-12,2.1,2.1,108);note(9,49,2.1,.7,105)
   for i,d in enumerate([19,16,12]):note(3,tonic+d,3.2+i*.22,.16,72)
   beats=5
  events.sort(key=lambda e:(e[0],e[1][0]&0xf0!=0x80));data=b'';last=0
  for tick,msg in events:data+=vlq(tick-last)+msg;last=tick
  data+=b'\x00\xff\x2f\x00';name=f'region-{region+1}-{kind}'
  midi=MID/(name+'.mid');midi.write_bytes(b'MThd'+struct.pack('>IHHH',6,0,1,480)+b'MTrk'+struct.pack('>I',len(data))+data)
  duration=beats*60/tempo+1.1;raw=TOOLS/(name+'.f32');out=OUT/(name+'.mp3')
  subprocess.run([str(TOOLS/'render-score'),str(TOOLS/'GeneralUser-GS.sf2'),str(midi),str(raw),str(duration)],check=True)
  subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar','44100','-ac','2','-i',str(raw),'-af',f'aecho=0.8:0.7:47|89:0.1|0.06,loudnorm=I=-18:TP=-2:LRA=8,afade=t=out:st={duration-.3}:d=0.3','-ar','44100','-c:a','libmp3lame','-b:a','160k','-map_metadata','-1',str(out)],check=True)
  raw.unlink();manifest.append({'region':region,'kind':kind,'theme':title,'file':'/audio/cues/'+out.name,'seconds':round(duration,3),'sha256':hashlib.sha256(out.read_bytes()).hexdigest()})
  print(name,flush=True)
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
