"""효과음 파일 손질.  python3 tools/sfx.py <받은파일> <이름>   예) python3 tools/sfx.py ~/Downloads/paper_pop.mp3 pop2
앞의 무음을 잘라 팡이 탭과 동시에 나게 하고, 뒤는 1.6초까지만, 최고 크기를 -1dB로 맞춰 sfx/<이름>.mp3 로 저장한다."""
import subprocess, sys, os
src, name = sys.argv[1], sys.argv[2]
os.chdir(os.path.join(os.path.dirname(__file__), '..'))
out = f'sfx/{name}.mp3'
maxlen = '3.0' if name == 'final' else '1.6'
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', src,
  '-af', f'silenceremove=start_periods=1:start_threshold=-40dB:start_silence=0.02,atrim=0:{maxlen},afade=t=out:st={float(maxlen)-0.25}:d=0.25,loudnorm=I=-14:TP=-1:LRA=7',
  '-ac', '1', '-ar', '44100', '-b:a', '96k', out], check=True)
d = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out], capture_output=True, text=True).stdout.strip()
print(out, f'{float(d):.2f}s', os.path.getsize(out), 'bytes')
