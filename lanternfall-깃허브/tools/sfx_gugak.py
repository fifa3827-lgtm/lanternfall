"""국악기 녹음에서 한 번 치는 소리를 잘라 sfx/gugak/ 에 넣는다.  python3 tools/sfx_gugak.py <받은 파일들이 있는 폴더>
받은 파일(공유마당 등): 국악기_꽹과리1.mp3 · 전통악기_장구_치다_보통속도_Ver.1_MKH418_ST_192.mp3 · 전통악기_북_치다_빠른속도_MKH418_ST_192.mp3 · 국악 효과음 #705.mp3(징)
각 타격의 시작 시각은 파형을 보고 고른 것. 앞 무음 없이 자르고, 끝은 짧게 페이드, 최고치 -1dB."""
import sys, os, subprocess, numpy as np, wave, io
os.chdir(os.path.join(os.path.dirname(__file__), '..')); SRC = sys.argv[1]
def load(name):
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', os.path.join(SRC, name), '-ac', '1', '-ar', '44100', '/tmp/_g.wav'], check=True)
    w = wave.open('/tmp/_g.wav'); return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
SR = 44100
def cut(x, t0, dur, fade=0.12, hp=0):
    # 시작점을 정확히: t0 앞뒤 30ms 안에서 처음으로 최고치 15%를 넘는 지점
    a = int((t0 - .03) * SR); w = x[a:a + int(.08 * SR)]; pk = np.abs(w).max()
    a += int(np.argmax(np.abs(w) > pk * .15)); a = max(0, a - 44)
    seg = x[a:a + int(dur * SR)].copy()
    if hp: seg = seg - np.convolve(seg, np.ones(hp) / hp, 'same')   # 아주 낮은 울림 덜기
    f = int(fade * SR); seg[-f:] *= np.linspace(1, 0, f) ** 2; seg[:22] *= np.linspace(0, 1, 22)
    return seg / np.abs(seg).max() * 0.89
def save(name, seg):
    os.makedirs('sfx/gugak', exist_ok=True)
    b = io.BytesIO(); w = wave.open(b, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((seg * 32767).astype(np.int16).tobytes()); w.close()
    open('/tmp/_c.wav', 'wb').write(b.getvalue())
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', '/tmp/_c.wav', '-b:a', '112k', f'sfx/gugak/{name}.mp3'], check=True)
    print(f'sfx/gugak/{name}.mp3  {len(seg)/SR:.2f}s')
K = load('국악기_꽹과리1.mp3')
save('kk1', cut(K, 12.118, .75, .3));  save('kk2', cut(K, 9.524, .75, .3))      # 열린 「갱」
save('kks1', cut(K, 12.658, .32, .1)); save('kks2', cut(K, 7.656, .32, .1))     # 막은 「갠」
J = load('전통악기_장구_치다_보통속도_Ver.1_MKH418_ST_192.mp3')
save('deong1', cut(J, 1.936, .45, .15)); save('deong2', cut(J, 3.326, .45, .15))  # 덩
save('deok1', cut(J, 7.112, .35, .12));  save('deok2', cut(J, 8.438, .35, .12))   # 덕(채편)
save('kung1', cut(J, 23.198, .45, .15)); save('kung2', cut(J, 24.486, .45, .15))  # 쿵(궁편)
B = load('전통악기_북_치다_빠른속도_MKH418_ST_192.mp3')
save('buk1', cut(B, .594, .8, .3))
G = load('국악 효과음 #705.mp3')
save('jing', cut(G, .068, 4.6, 1.4))
