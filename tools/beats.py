"""배경음의 박자를 잰다 → music/beats.json {ch1: {bpm, offset, segs:[{from,bpm,offset},...]}}.  python3 tools/beats.py
onset 세기(스펙트럼 변화량)의 자기상관으로 BPM을, 빗살(comb) 맞춤으로 첫 박 위치를 찾는다.
수노 곡은 템포가 1~2% 흔들리므로 40초 창을 30초씩 밀며 구간별로 재고(segs), 게임은 지금 곡 시각의 구간을 쓴다.
bpm 후보는 곡 전체에서 가장 강한 값을 먼저 정하고(예: 3박 스윙에서 2/3배가 잡히는 걸 막기 위해 spec에 적은 템포에 가까운 배수를 고른다), 구간에서는 ±4% 안에서만 다시 맞춘다.
곡을 바꾸면 다시 돌린다."""
import numpy as np, subprocess, wave, json, os
os.chdir(os.path.join(os.path.dirname(__file__), '..'))
WANT = {'ch1': 96, 'ch2': 104, 'ch3': 100, 'ch4': 128, 'ch5': 112}   # 수노 프롬프트에 적은 템포(배수 고를 때만 참고)
def load(p):
    subprocess.run(['ffmpeg','-y','-v','error','-i',p,'-ac','1','-ar','22050','/tmp/_b.wav'],check=True)
    w=wave.open('/tmp/_b.wav'); return np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(float)/32768, 22050
def onset_env(x,sr,hop=256,n=1024):
    frames=[np.abs(np.fft.rfft(x[i:i+n]*np.hanning(n))) for i in range(0,len(x)-n,hop)]
    S=np.log1p(np.array(frames)*10); flux=np.maximum(S[1:]-S[:-1],0).sum(1)
    flux=flux-np.convolve(flux,np.ones(32)/32,'same'); return np.maximum(flux,0), hop/sr
def best_bpm(env,dt,lo,hi,step=0.25):
    best=None
    for bpm in np.arange(lo,hi+1e-9,step):
        lag=60/bpm/dt; ac=0
        for m in (1,2):
            L=int(round(lag*m)); ac+=(env[:-L]*env[L:]).sum()/(len(env)-L)*(1 if m==1 else .5)
        if best is None or ac>best[0]: best=(ac,bpm)
    return best[1]
def phase(env,dt,bpm,t0):
    """구간(env는 t0초부터)의 첫 박 위상을 곡 전체 시각 기준으로"""
    per=60/bpm; T=np.arange(len(env))*dt; bestph=None
    for ph in np.arange(0,per,0.005):
        idx=np.round((np.arange(ph,T[-1],per))/dt).astype(int); idx=idx[idx<len(env)]
        s=env[idx].sum()
        if bestph is None or s>bestph[0]: bestph=(s,ph)
    return round(float((t0+bestph[1])%per),3)
def analyze(p,want):
    x,sr=load(p); env,dt=onset_env(x,sr); dur=len(env)*dt
    raw=best_bpm(env[:int(60/dt)],dt,60,180)
    # 배수 고르기: 프롬프트 템포에 가장 가까운 raw×{2/3,1,3/2,2,1/2}
    cands=[raw*m for m in (1,2/3,1.5,2,.5)]
    bpm=min(cands,key=lambda b:abs(b-want)) if want else raw
    bpm=round(best_bpm(env[:int(60/dt)],dt,bpm*.97,bpm*1.03),2)
    segs=[]; t=0.0
    while t<dur-10:
        a=int(t/dt); b=int(min(dur,t+40)/dt); e=env[a:b]
        sb=round(best_bpm(e,dt,bpm*.96,bpm*1.04),2)
        segs.append({'from':round(t,1),'bpm':sb,'offset':phase(e,dt,sb,t)})
        t+=30
    return {'bpm':bpm,'offset':segs[0]['offset'],'segs':segs}
out={}
for i in range(1,6):
    p=f'music/ch{i}.mp3'
    if os.path.exists(p): out[f'ch{i}']=analyze(p,WANT.get(f'ch{i}')); print(p,out[f'ch{i}'])
json.dump(out,open('music/beats.json','w'))
