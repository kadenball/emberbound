"""Download the user's ten public Udio recordings, preserving their original bytes."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import hashlib,json,re,subprocess,urllib.request
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'music/source/udio'
IDS=['3Yv8yevmFkLLHu44BiJ4XK','hgy6Wcpmyp3538s8kPNAwi','1GsZQvdgSnaL4J53XdfYwi','t77bXLtSx9uiAXhVPSYrd1','jt1g77QDM9x2m45xSzx1VS','oCwuKR4XLUPf1ymyHHYJWJ','7zUw84pciFR76MTUP5EBvW','catXm13jdaMr1mzqkn6Ssr','aDLD6J5RGd6uLPfAProQbn','attHhyK21AqDQRTRq6Dbxr']
def fetch(url):
 return urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=60).read()
def download(entry):
 index,song=entry;url=f'https://www.udio.com/songs/{song}'
 html=fetch(url).decode();track=None
 for raw in re.findall(r'self\.__next_f\.push\((.*?)\)</script>',html):
  try:
   value=json.loads(raw)
   if len(value)>1 and isinstance(value[1],str) and '"track":{' in value[1]:
    payload=value[1].split('"track":',1)[1];candidate=json.JSONDecoder().raw_decode(payload)[0]
    if candidate.get('song_path'):track=candidate;break
  except (ValueError,TypeError):continue
 if not track:raise RuntimeError(f'No public audio in {url}')
 audio=fetch(track['song_path']);path=OUT/f'track-{index:02}.mp3';path.write_bytes(audio)
 probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration:stream=codec_name,sample_rate,channels','-of','json',str(path)]))
 row={'index':index,'songId':song,'page':url,'title':track['title'],'artist':track.get('artist'),'prompt':track.get('prompt'),'tags':track.get('tags'),'sourceUrl':track['song_path'],'sourceFile':str(path.relative_to(ROOT)),'sha256':hashlib.sha256(audio).hexdigest(),'bytes':len(audio),'seconds':float(probe['format']['duration']),'streams':probe['streams']}
 print(json.dumps({k:row[k] for k in ['index','title','seconds','bytes']}),flush=True)
 return row
if __name__=='__main__':
 OUT.mkdir(parents=True,exist_ok=True)
 with ThreadPoolExecutor(max_workers=4) as pool:rows=list(pool.map(download,enumerate(IDS,1)))
 (OUT/'manifest.json').write_text(json.dumps({'source':'User-provided Udio songs, 2026-09-08','tracks':rows},indent=2)+'\n')
