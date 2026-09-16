import { SCENE_GAIN, cueFor, type ScoreScene } from './score-scene';
import { CHAPTER_MUSIC } from './soundtrack';
import type { GameEvent } from './engine';

export class Sound {
  private context?: AudioContext;
  private bus?: GainNode;
  private noiseBuffer?: AudioBuffer;
  private chapter = -1;
  private transportRevision = 0;
  private scene:ScoreScene='menu';
  private musicBus?:GainNode;
  private bedGain?:GainNode;
  private cueGain?:GainNode;
  private master?:DynamicsCompressorNode;
  private duckUntil=0;
  private bedTarget=-1;
  private cueTarget=-1;
  private cueActive=false;
  private effectsEnabled=true;
  private voiceLimit=48;
  private pending=new Set<HTMLAudioElement>();
  private voices=new Set<AudioScheduledSourceNode>();
  private lastEvent=new Map<GameEvent,number>();
  paused = false;
  onInterruption?: () => void;
  private musicEnabled = true;
  private menuActive = true;
  private userUnlocked = false;
  private menuTrack = new Audio();
  private chapterTrack = new Audio();
  private cueTrack = new Audio();
  constructor() {
    this.menuTrack.id='menu-music';this.menuTrack.loop=true;this.menuTrack.preload='metadata';this.menuTrack.volume=1;
    this.menuTrack.hidden=true;document.body.append(this.menuTrack);
    this.chapterTrack.id='chapter-music';this.chapterTrack.loop=true;this.chapterTrack.preload='none';this.chapterTrack.volume=1;this.chapterTrack.hidden=true;document.body.append(this.chapterTrack);
    this.cueTrack.id='score-cue';this.cueTrack.preload='none';this.cueTrack.hidden=true;this.cueTrack.volume=1;document.body.append(this.cueTrack);
    this.cueTrack.addEventListener('ended',()=>{this.cueActive=false;});
  }
  get enabled(){return this.effectsEnabled;}
  set enabled(value:boolean){this.effectsEnabled=value;if(!value)this.stopVoices();if(this.bus&&this.context)this.bus.gain.setTargetAtTime(value&&!this.paused?.22:0,this.context.currentTime,.02);}
  get music(){return this.musicEnabled;}
  set music(value:boolean){if(this.musicEnabled!==value){this.musicEnabled=value;if(!value){this.cueActive=false;this.cueTrack.pause();}this.syncMenu();}}
  private syncMenu(){
    const revision=++this.transportRevision;
    const track=this.menuActive?this.menuTrack:this.chapterTrack,other=this.menuActive?this.chapterTrack:this.menuTrack;
    other.pause();
    if(this.musicBus&&this.context)this.musicBus.gain.setTargetAtTime(this.musicEnabled&&!this.paused?1:0,this.context.currentTime,.025);
    for(const media of [track,this.cueTrack]) {
      const wanted=this.musicEnabled&&!this.paused&&this.userUnlocked&&!!media.getAttribute('src')&&(media!==this.cueTrack||this.cueActive);
      if(!wanted){media.pause();continue;}
      if(media.paused&&!this.pending.has(media)){
        this.pending.add(media);
        void media.play().catch(()=>{}).finally(()=>{this.pending.delete(media);if(this.transportRevision!==revision)this.syncMenu();});
      }
    }
  }
  unlock() {
    this.context ??= new AudioContext();
    if (!this.bus) {
      const c=this.context;
      c.addEventListener('statechange',()=>{
        if(this.userUnlocked&&!this.paused&&(this.enabled||this.music)&&(c.state==='interrupted'||c.state==='suspended'))this.onInterruption?.();
      });
      this.master=c.createDynamicsCompressor();this.master.threshold.value=-8;this.master.knee.value=8;this.master.ratio.value=8;this.master.attack.value=.003;this.master.release.value=.16;this.master.connect(c.destination);
      this.bus=c.createGain();this.bus.gain.value=this.enabled&&!this.paused?.22:0;this.bus.connect(this.master);
      this.musicBus=c.createGain();this.musicBus.gain.value=this.musicEnabled&&!this.paused?1:0;this.musicBus.connect(this.master);
      this.bedGain=c.createGain();this.bedGain.gain.value=SCENE_GAIN[this.scene];this.bedGain.connect(this.musicBus);
      this.cueGain=c.createGain();this.cueGain.gain.value=.66;this.cueGain.connect(this.musicBus);
      for(const track of [this.menuTrack,this.chapterTrack])c.createMediaElementSource(track).connect(this.bedGain);
      c.createMediaElementSource(this.cueTrack).connect(this.cueGain);
      // Assign media only after routing: preloaded audio can stall in WebKit.
      this.menuTrack.src='/audio/menu-theme.mp3';
    }
    this.userUnlocked=true;
    if (this.context.state === 'suspended' || this.context.state === 'interrupted') void this.context.resume().catch(() => {});
    this.syncMenu();
  }
  private stopVoices(){for(const source of this.voices){try{source.stop();}catch{}}this.voices.clear();}
  setPaused(paused: boolean) {
    this.paused = paused;if(paused)this.stopVoices();this.syncMenu();
    if (this.bus && this.context) this.bus.gain.setTargetAtTime(!paused&&this.enabled ? .22 : 0, this.context.currentTime, .02);
  }
  private tone(freq: number, duration: number, type: OscillatorType = 'sine', volume = .3, endFreq?: number, delay = 0) {
    const c = this.context; if (!c || !this.bus || c.state !== 'running' || this.voices.size>=this.voiceLimit) return;
    const at = c.currentTime + delay, oscillator = c.createOscillator(), gain = c.createGain();
    oscillator.type = type; oscillator.frequency.setValueAtTime(freq, at);
    if (endFreq) oscillator.frequency.exponentialRampToValueAtTime(endFreq, at + duration);
    gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(volume, at + .01); gain.gain.exponentialRampToValueAtTime(.001, at + duration);
    oscillator.connect(gain); gain.connect(this.bus); this.voices.add(oscillator);oscillator.start(at); oscillator.stop(at + duration + .02);
    oscillator.onended = () => { this.voices.delete(oscillator);oscillator.disconnect(); gain.disconnect(); };
  }
  private noise(frequency:number,duration:number,volume:number){
    const c=this.context;if(!c||!this.bus||c.state!=='running'||this.voices.size>=this.voiceLimit)return;
    if(!this.noiseBuffer){this.noiseBuffer=c.createBuffer(1,c.sampleRate*.6,c.sampleRate);const data=this.noiseBuffer.getChannelData(0);let prev=0;for(let i=0;i<data.length;i++){prev=(prev+Math.random()*2-1)*.55;data[i]=prev;}}
    const src=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();src.buffer=this.noiseBuffer;filter.type='lowpass';filter.frequency.setValueAtTime(frequency,c.currentTime);filter.frequency.exponentialRampToValueAtTime(Math.max(80,frequency*.2),c.currentTime+duration);
    gain.gain.setValueAtTime(volume,c.currentTime);gain.gain.exponentialRampToValueAtTime(.001,c.currentTime+duration);src.connect(filter);filter.connect(gain);gain.connect(this.bus);this.voices.add(src);src.start();src.stop(c.currentTime+duration);src.onended=()=>{this.voices.delete(src);src.disconnect();filter.disconnect();gain.disconnect();};
  }
  play(event: GameEvent) {
    if (!this.enabled || this.paused) return;
    const now=this.context?.currentTime??0;
    const gap=['hit','heavy','slash','tear','coin','bowl'].includes(event)?.07:.12;
    if(now-(this.lastEvent.get(event)??-Infinity)<gap)return;
    this.lastEvent.set(event,now);
    const warning=['retch','hurt','brace','stitch','machine-warning','boss-rage','jam','snip'].includes(event);
    this.voiceLimit=warning?64:48;
    if(warning){
      this.duckUntil=Math.max(this.duckUntil,now+.65);
      // Reserve room for an entire warning even during a crowded impact burst.
      for(const source of this.voices){if(this.voices.size<=48)break;try{source.stop();}catch{}this.voices.delete(source);}
    }
    switch (event) {
      case 'retch': this.noise(380,.22,.16);this.tone(140,.18,'sawtooth',.15,62);this.tone(210,.12,'triangle',.1,80,.13);break;
      case 'punt': this.noise(650,.08,.19);this.tone(190,.16,'triangle',.25,730);this.tone(830,.2,'sine',.14,270,.07);break;
      case 'stink-pop': this.noise(240,.3,.22);this.tone(95,.25,'sawtooth',.18,28);break;
      case 'claim': this.noise(420,.13,.15);this.tone(170,.16,'triangle',.18,440);this.tone(660,.12,'sine',.13,880,.11);break;
      case 'brace': this.tone(75,.16,'triangle',.24,42);this.noise(180,.12,.16);break;
      case 'brace-break': this.noise(1200,.14,.22);this.tone(240,.24,'sawtooth',.12,65);break;
      case 'stitch': [430,520,610].forEach((f,i)=>this.tone(f,.08,'triangle',.13,f+35,i*.14)); break;
      case 'snip': this.noise(2600,.08,.22);this.tone(710,.12,'triangle',.2,160);break;
      case 'restuff': this.tone(180,.2,'sine',.25,430);this.tone(680,.13,'triangle',.12,490,.08);break;
      case 'jump': this.tone(170, .22, 'triangle', .24, 570); this.tone(320, .12, 'sine', .12, 780); break;
      case 'land': this.tone(130, .14, 'triangle', .35, 45); break;
      case 'slash': this.noise(3100,.12,.19); this.tone(250, .12, 'sawtooth', .12, 65); break;
      case 'hit': this.noise(1300,.1,.3); this.tone(230, .09, 'triangle', .6, 55); this.tone(790, .08, 'sine', .13, 340); break;
      case 'heavy': this.noise(850,.23,.42); this.tone(95,.19,'triangle',.65,33); this.tone(440,.06,'square',.08,150); break;
      case 'clang': this.tone(870,.22,'square',.12,740);this.tone(1310,.15,'sine',.17);break;
      case 'launch': this.tone(150,.3,'triangle',.35,820);break;
      case 'bowl': this.tone(180,.21,'sawtooth',.13,65);this.tone(75,.22,'sine',.35,40);break;
      case 'bounce': this.tone(90,.14,'triangle',.5,550);this.tone(550,.24,'triangle',.2,140,.12);break;
      case 'jam': [190,170,95,62].forEach((f,i)=>this.tone(f,.18,'square',.12,undefined,i*.09));break;
      case 'revive': [260,330,440,660].forEach((f,i)=>this.tone(f,.24,'triangle',.22,undefined,i*.1));break;
      case 'hurt': this.tone(150, .25, 'sawtooth', .2, 40); break;
      case 'burp': this.noise(340,.36,.3); [85,110,72,95].forEach((f,i)=>this.tone(f,.14,'sawtooth',.16,32,i*.07));this.tone(330,.3,'triangle',.12,70,.1);break;
      case 'freeze': this.noise(2700,.25,.22); [130,90,165].forEach((f,i)=>this.tone(f,.16,'sawtooth',.1,55,i*.065));this.tone(960,.25,'sine',.12,640,.17);break;
      case 'lawn': this.noise(900,.2,.28); this.tone(65,.25,'triangle',.3,250);[460,320,610].forEach((f,i)=>this.tone(f,.12,'square',.07,180,i*.08));break;
      case 'magic': for (let i = 0; i < 5; i++) this.tone(220 * 2 ** (i / 3), .4, 'triangle', .2, undefined, i * .04); break;
      case 'dodge': this.tone(180, .16, 'triangle', .2, 390); break;
      case 'coin': this.tone(880, .1, 'sine', .25); this.tone(1320, .2, 'sine', .2, undefined, .08); break;
      case 'win': this.noise(1800,.12,.10);break; // Music comes from the selected victory recording.
      case 'tear': this.noise(2200,.32,.35);this.tone(240,.19,'sawtooth',.09,65);break;
      case 'lose': this.noise(350,.25,.22);break; // No legacy defeat melody beneath the user's score.
      case 'kettle': this.noise(430,.45,.24);this.tone(170,.48,'sawtooth',.13,54);this.tone(970,.25,'sine',.12,1300,.12);break;
      case 'dough': this.noise(2700,.35,.24);[330,495,742].forEach((f,i)=>this.tone(f,.38,'sine',.14,f*.8,i*.045));break;
      case 'drum': [95,180,125,260].forEach((f,i)=>this.tone(f,.15,'triangle',.22,60,i*.075));this.noise(1100,.3,.2);break;
      case 'sugar': [659,622,523,415].forEach((f,i)=>this.tone(f,.19,'square',.07,f*.95,i*.065));this.noise(1800,.18,.14);break;
      case 'forklift': this.tone(70,.5,'sawtooth',.16,160);this.tone(640,.14,'square',.06,undefined,.1);this.tone(640,.14,'square',.06,undefined,.3);break;
      case 'royal': [146,220,293].forEach((f,i)=>this.tone(f,.6,'sawtooth',.08,undefined,i*.09));this.noise(600,.25,.15);break;
      case 'boss-rage': this.noise(1700,.5,.35);this.tone(75,.8,'sawtooth',.12,180);this.tone(440,.45,'triangle',.14,110,.2);break;
      case 'boss-fall': this.noise(700,.45,.4);[240,190,140,85].forEach((f,i)=>this.tone(f,.23,'triangle',.23,45,i*.1));this.tone(980,.4,'sine',.12,460,.4);break;
      case 'machine-warning': [880,660,880].forEach((f,i)=>this.tone(f,.15,'square',.08,undefined,i*.2));break;
      case 'machine-break': this.noise(850,.45,.3);[420,280,110].forEach((f,i)=>this.tone(f,.24,'triangle',.22,45,i*.12));break;
      case 'crunch': this.noise(2600,.18,.28);this.tone(190,.13,'triangle',.24,55);this.tone(760,.09,'square',.05,260,.05);break;
      case 'stamp-hit': this.noise(700,.24,.32);this.tone(90,.3,'triangle',.35,32);this.tone(350,.09,'square',.06,110,.08);break;
      case 'wave': this.tone(110, .8, 'triangle', .25); this.tone(164.8, .8, 'sine', .2); break;
    }
  }
  update(_dt:number,scene:ScoreScene='menu',stage=0) {
    let changed=false;
    const playing=scene!=='menu',chapterChanged=playing&&this.chapter!==stage;
    if(chapterChanged){this.chapter=stage;this.chapterTrack.src=CHAPTER_MUSIC[stage].file;this.chapterTrack.dataset.chapter=String(stage);this.chapterTrack.dataset.title=CHAPTER_MUSIC[stage].title;changed=true;}
    if(this.menuActive===playing){this.menuActive=!playing;changed=true;}
    if(scene!==this.scene||chapterChanged){
      const previous=this.scene;this.scene=scene;
      const cue=cueFor(scene,Math.floor(stage/2));
      if(cue&&this.musicEnabled){this.cueTrack.pause();this.cueTrack.src=cue;this.cueTrack.dataset.scene=scene;this.cueActive=true;changed=true;}
      else if(!this.musicEnabled||scene==='menu'||scene==='defeat'||previous==='victory'||previous==='defeat'||chapterChanged){this.cueActive=false;this.cueTrack.pause();changed=true;}
    }
    if(changed)this.syncMenu();
    const c=this.context;if(!c||!this.bedGain||!this.cueGain)return;
    const duck=c.currentTime<this.duckUntil;
    const bed=SCENE_GAIN[scene]*(duck?.48:1)*(this.cueActive?.6:1),cue=duck?.32:.66;
    if(bed!==this.bedTarget){this.bedTarget=bed;this.bedGain.gain.setTargetAtTime(bed,c.currentTime,duck?.025:.22);}
    if(cue!==this.cueTarget){this.cueTarget=cue;this.cueGain.gain.setTargetAtTime(cue,c.currentTime,.04);}
  }
}
