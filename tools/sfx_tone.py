"""국악기 대신 쓸 「음정 있는 팡」 후보 세 가지를 미리듣기 mp3로 만든다.  python3 tools/sfx_tone.py
A 마림바(나무 울림) · B 칼림바(금속 손가락 피아노) · C 유리 종/물방울.  각 후보마다 한지 터짐 노이즈를 살짝 섞는다.
미리듣기: 1장 배경음 12초 위에, 연쇄 3번(작은→큰 등불, 파도마다 음이 5음계로 오름) + 마지막 등불 화음 + 판 깨기 아르페지오."""
import numpy as np, subprocess, os, wave
os.chdir(os.path.join(os.path.dirname(__file__), '..'))
SR = 44100
PENT = [1, 9/8, 5/4, 3/2, 5/3, 2, 9/4, 5/2]        # 도 레 미 솔 라 도 레 미
def env(n, a, d, curve=4):
    t = np.arange(n) / SR; e = np.minimum(t / a, 1) * np.exp(-t / d * curve); return e
def paper(dur=.06, vol=.25):
    n = int(SR * dur); x = np.random.randn(n) * env(n, .002, dur, 5)
    # 한지 결: 1.5~5kHz 대역
    X = np.fft.rfft(x); f = np.fft.rfftfreq(n, 1 / SR); X *= np.exp(-((np.log(f + 1) - np.log(2600)) ** 2) / .5); return np.fft.irfft(X, n) * vol * 6
def marimba(f0, dur=.55, vol=.5):
    n = int(SR * dur); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f0 * t) * env(n, .002, dur, 5) + .35 * np.sin(2 * np.pi * f0 * 4 * t) * env(n, .001, dur * .35, 6) + .15 * np.sin(2 * np.pi * f0 * 10.1 * t) * env(n, .001, dur * .15, 6)
    x += .3 * np.sin(2 * np.pi * f0 * 2 * t) * env(n, .001, .03, 3)           # 나무 때리는 톡
    return x * vol
def kalimba(f0, dur=.9, vol=.45):
    n = int(SR * dur); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f0 * t + .6 * np.sin(2 * np.pi * f0 * 2.01 * t) * np.exp(-t * 9)) * env(n, .001, dur, 4)
    x += .25 * np.sin(2 * np.pi * f0 * 5.4 * t) * env(n, .001, .12, 5)        # 금속 손톱 소리
    return x * vol
def glass(f0, dur=1.1, vol=.4):
    n = int(SR * dur); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f0 * 2 * t) * env(n, .001, dur, 3) + .5 * np.sin(2 * np.pi * f0 * 2 * 2.76 * t) * env(n, .001, dur * .6, 4) + .3 * np.sin(2 * np.pi * f0 * 2 * 5.4 * t) * env(n, .001, dur * .3, 4)
    x += .2 * np.sin(2 * np.pi * (f0 * 2) * t * (1 + .015 * np.exp(-t * 40))) * env(n, .001, .08, 3)  # 물방울 「똑」
    return x * vol
INST = {'A_marimba': marimba, 'B_kalimba': kalimba, 'C_glass': glass}
def mix(buf, x, at, pan=0):
    i = int(at * SR); n = min(len(x), buf.shape[1] - i)
    l, r = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)
    buf[0, i:i + n] += x[:n] * l; buf[1, i:i + n] += x[:n] * r
def render(name, inst):
    bpm = 95.38; half = 30 / bpm; root = 261.6
    buf = np.zeros((2, int(SR * 14)))
    t = 1.0
    for chain in range(3):                       # 연쇄 셋: 파도 4·5·6개
        waves = 4 + chain
        for w in range(waves):
            size = 1 + (w % 3)                   # 작은→큰
            f = root * PENT[min(w, 7)] * (2 if size == 1 else 1) / (2 if size == 3 else 1)
            for k in range(1 + (w > 1)):         # 뒤 파도는 등불 둘
                at = t + w * half + k * .02
                mix(buf, paper(.05 + size * .01, .18 + size * .04), at, (k - .5) * .6)
                mix(buf, inst(f * (1 if k == 0 else 3 / 2), vol=.32 + size * .06), at, (k - .5) * .6)
        # 마지막 등불: 화음
        at = t + waves * half
        mix(buf, paper(.09, .35), at)
        for m, p in zip((1, 5 / 4, 3 / 2, 2), (-.4, -.1, .2, .5)): mix(buf, inst(root * 2 * m, vol=.3), at + .01, p)
        t += (waves + 3) * half
    # 판 깨기: 아르페지오 위로
    for i, d in enumerate([0, 1, 2, 3, 4, 5, 6, 7]): mix(buf, inst(root * PENT[d] * 2, vol=.35), t + i * half / 2, (i / 7 - .5))
    mix(buf, inst(root * 4, dur=1.6, vol=.4), t + 8 * half / 2)
    buf = np.tanh(buf * 1.2) * .9
    pcm = (buf.T * 32767).astype(np.int16)
    w = wave.open(f'/tmp/{name}.wav', 'w'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()
    # 배경음 1장 위에 얹기(배경음은 -8dB)
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', 'music/ch1.mp3', '-i', f'/tmp/{name}.wav', '-filter_complex',
                    '[0:a]atrim=20:34,asetpts=PTS-STARTPTS,volume=-8dB[b];[b][1:a]amix=inputs=2:duration=shortest:normalize=0',
                    '-c:a', 'libmp3lame', '-b:a', '160k', f'/mnt/user-data/outputs/효과음후보_{name}.mp3'], check=True)
    print(name, 'ok')
for k, v in INST.items(): render(k, v)
