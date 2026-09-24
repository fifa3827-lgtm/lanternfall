"""폭죽 녹음에서 효과음을 잘라 낸다.  python3 tools/sfx_cut.py <녹음.mp3> <묶음이름>
묶음: fireworks(「불꽃놀이 소리 ASMR」, 웅웅해서 꺼 둠) · hq(「HQ fire work sound, 고음질 폭죽소리」, 7초 뒤 펑들)
원칙: 팡은 펑의 머리만 0.25~0.4초로 짧게(타닥거리는 꼬리는 지저분하다), 150Hz 아래 울림은 걸러내고 큰 등불에만 정해진 쿵을 더한다."""
import sys, os, subprocess, numpy as np, wave, io
os.chdir(os.path.join(os.path.dirname(__file__), '..'))
src, SET = sys.argv[1], sys.argv[2]
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', src, '-ac', '1', '-ar', '44100', '-af', 'highpass=f=150', '/tmp/_fw.wav'], check=True)
w = wave.open('/tmp/_fw.wav'); SR = w.getframerate(); X = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
def cut(t0, dur, pitch=1.0, fade_in=0.002, fade_out=0.15, gain=1.0, lowboost=0):
    seg = X[int(t0 * SR):int((t0 + dur) * SR)].copy()
    if pitch != 1.0:
        n = int(len(seg) / pitch); seg = np.interp(np.linspace(0, len(seg) - 1, n), np.arange(len(seg)), seg)
    if lowboost:
        t = np.arange(len(seg)) / SR; seg += lowboost * np.sin(2 * np.pi * 64 * t) * np.exp(-t * 11)
    fi, fo = int(fade_in * SR), int(fade_out * SR)
    seg[:fi] *= np.linspace(0, 1, fi); seg[-fo:] *= np.linspace(1, 0, fo) ** 2
    seg = seg / np.abs(seg).max() * 0.89 * gain
    return seg
def save(name, seg):
    os.makedirs(f'sfx/{SET}', exist_ok=True)
    b = io.BytesIO(); ww = wave.open(b, 'wb'); ww.setnchannels(1); ww.setsampwidth(2); ww.setframerate(SR); ww.writeframes((np.clip(seg, -1, 1) * 32767).astype(np.int16).tobytes()); ww.close()
    open('/tmp/_c.wav', 'wb').write(b.getvalue())
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', '/tmp/_c.wav', '-b:a', '96k', f'sfx/{SET}/{name}.mp3'], check=True)
    print(f'sfx/{SET}/{name}.mp3  {len(seg)/SR:.2f}s  {os.path.getsize(f"sfx/{SET}/{name}.mp3")} bytes')
ON = 0.004
if SET == 'fireworks':
    save('pop1',  cut(14.400 - ON, 0.55, pitch=1.18, fade_out=0.12)); save('pop1b', cut(18.482 - ON, 0.55, pitch=1.22, fade_out=0.12))
    save('pop2',  cut(19.800 - ON, 0.65)); save('pop2b', cut(18.482 - ON, 0.65, pitch=0.96))
    save('pop3',  cut(16.192 - ON, 0.85, pitch=0.86, lowboost=0.35, fade_out=0.25)); save('pop3b', cut(19.800 - ON, 0.85, pitch=0.78, lowboost=0.3, fade_out=0.25))
    save('final', cut(18.482 - ON, 2.9, lowboost=0.25, fade_out=0.9)); save('fuse', cut(5.0, 0.55, gain=0.55, fade_in=0.03, fade_out=0.2))
elif SET == 'hq':
    # 펑 머리만. 짧을수록 마른 팡이 된다
    save('pop1',  cut(16.042 - ON, 0.26, pitch=1.12, fade_out=0.10))          # 높은 펑(2940Hz)
    save('pop1b', cut(21.340 - ON, 0.26, pitch=1.10, fade_out=0.10))
    save('pop2',  cut(10.822 - ON, 0.32, fade_out=0.13))                      # 가운데(2139Hz)
    save('pop2b', cut(13.328 - ON, 0.32, fade_out=0.13))
    save('pop3',  cut(8.306 - ON, 0.42, pitch=0.9, lowboost=0.3, fade_out=0.18))   # 낮은 펑(1691Hz) + 쿵
    save('pop3b', cut(18.696 - ON, 0.42, pitch=0.86, lowboost=0.3, fade_out=0.18))
    save('final', cut(38.212 - ON, 2.4, lowboost=0.22, fade_out=1.0))         # 마지막: 펑 + 타닥거리는 꼬리는 여기만
    save('fuse',  cut(11.35, 0.5, gain=0.5, fade_in=0.03, fade_out=0.2))      # 펑 뒤 타닥거림 한 조각
