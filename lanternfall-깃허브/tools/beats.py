"""배경음의 박자를 잰다 → music/beats.json {ch1: {bpm, offset}}.  python3 tools/beats.py
onset 세기(스펙트럼 변화량)의 자기상관으로 BPM을, 빗살(comb) 맞춤으로 첫 박 위치를 찾는다. 곡을 바꾸면 다시 돌린다."""
import numpy as np, subprocess, wave, json, os
os.chdir(os.path.join(os.path.dirname(__file__), '..'))
def load(p):
    subprocess.run(['ffmpeg','-y','-v','error','-i',p,'-ac','1','-ar','22050','-t','60','/tmp/_b.wav'],check=True)
    w=wave.open('/tmp/_b.wav'); return np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(float)/32768, 22050
def onset_env(x,sr,hop=256,n=1024):
    frames=[np.abs(np.fft.rfft(x[i:i+n]*np.hanning(n))) for i in range(0,len(x)-n,hop)]
    S=np.log1p(np.array(frames)*10); flux=np.maximum(S[1:]-S[:-1],0).sum(1)
    flux=flux-np.convolve(flux,np.ones(32)/32,'same'); return np.maximum(flux,0), hop/sr
def analyze(p):
    x,sr=load(p); env,dt=onset_env(x,sr)
    best=None
    for bpm in np.arange(60,181,0.25):
        lag=60/bpm/dt; ac=0
        for m in (1,2):  # 박과 두 박
            L=int(round(lag*m)); ac+=(env[:-L]*env[L:]).sum()/(len(env)-L)*(1 if m==1 else .5)
        if best is None or ac>best[0]: best=(ac,bpm)
    bpm=best[1]; per=60/bpm
    # 첫 박 위치: 빗살을 밀어 가며 onset 합이 최대인 위상
    T=np.arange(len(env))*dt; bestph=None
    for ph in np.arange(0,per,0.005):
        idx=np.round((np.arange(ph,T[-1],per))/dt).astype(int); idx=idx[idx<len(env)]
        s=env[idx].sum()
        if bestph is None or s>bestph[0]: bestph=(s,ph)
    return round(float(bpm),2), round(float(bestph[1]),3)
out={}
for i in range(1,6):
    p=f'music/ch{i}.mp3'
    if os.path.exists(p): out[f'ch{i}']=dict(zip(('bpm','offset'),analyze(p))); print(p,out[f'ch{i}'])
json.dump(out,open('music/beats.json','w'))
