// Offline SoundFont render only; the mobile game plays compressed audio.
#define TSF_IMPLEMENTATION
#include "tsf.h"
#define TML_IMPLEMENTATION
#include "tml.h"
#include <cstdio>
#include <cstdlib>
int main(int argc,char** argv){
 if(argc!=5)return 2;
 tsf* synth=tsf_load_filename(argv[1]);tml_message* first=tml_load_filename(argv[2]);
 if(!synth||!first)return 3;
 tsf_set_output(synth,TSF_STEREO_INTERLEAVED,44100,-8);
 for(int i=0;i<16;i++)tsf_channel_set_presetnumber(synth,i,0,i==9);
 FILE* file=fopen(argv[3],"wb");if(!file)return 4;
 const int frames=(int)(atof(argv[4])*44100);float buffer[256*2];auto event=first;
 for(int frame=0;frame<frames;){
  while(event && event->time<=frame*1000.0/44100){const int channel=event->channel;
   switch(event->type){
    case TML_PROGRAM_CHANGE:if(!tsf_channel_set_presetnumber(synth,channel,event->program,channel==9))return 5;break;
    case TML_NOTE_ON:tsf_channel_note_on(synth,channel,event->key,event->velocity/127.f);break;
    case TML_NOTE_OFF:tsf_channel_note_off(synth,channel,event->key);break;
    case TML_CONTROL_CHANGE:tsf_channel_midi_control(synth,channel,event->control,event->control_value);break;
    case TML_PITCH_BEND:tsf_channel_set_pitchwheel(synth,channel,event->pitch_bend);break;
   }event=event->next;
  }
  int count=frames-frame<256?frames-frame:256;
  if(event){int next=(int)(event->time*44.1)-frame;if(next>0 && next<count)count=next;}
  tsf_render_float(synth,buffer,count,0);if(fwrite(buffer,sizeof(float)*2,count,file)!=(size_t)count)return 6;frame+=count;
 }
 fclose(file);tml_free(first);tsf_close(synth);return 0;
}
