(() => {
const LEVELS = __LEVELS__;
const $ = id => document.getElementById(id);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const DIRS = [[1,0],[-1,0],[0,1],[0,-1]], DIAG = [[1,1],[1,-1],[-1,1],[-1,-1]];
// 종류: 0 보통 · 1 가로 금띠 · 2 세로 금띠 · 3 심지 · 4 쌍둥이 · 5 별꽃(여덟 방향)
const dirsFor = t => t === 5 ? DIRS.concat(DIAG) : DIRS.filter(([dr,dc]) => (t !== 1 || dr === 0) && (t !== 2 || dc === 0));
const bend = (kind, dr, dc) => kind === 0 ? [-dc, -dr] : [dc, dr];   // 거울 '/'(0) · '\\'(1)
(() => { const s = $('dust'); for (let i = 0; i < 16; i++) { const d = document.createElement('i'); d.style.left = Math.random()*100+'%'; d.style.top = Math.random()*55+'%'; s.appendChild(d); } })();

// ---------- chapters & constellations ----------
const CH = [
  { name: '첫 밤', sky: '초롱자리',
    stars: [[50,4],[38,10],[33,20],[38,30],[50,34],[62,30],[67,20],[62,10],[50,39],[50,19]],
    edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0],[4,8]] },
  { name: '바람 부는 밤', sky: '연자리',
    stars: [[50,3],[39,13],[50,24],[61,13],[53,28],[47,31],[54,34],[48,37],[55,40],[75,5]],
    edges: [[0,1],[1,2],[2,3],[3,0],[0,2],[1,3],[2,4],[4,5],[5,6],[6,7],[7,8]] },
  { name: '깊은 밤', sky: '풍경자리',
    stars: [[50,3],[43,10],[57,10],[39,20],[61,20],[36,29],[64,29],[50,25],[47,36],[53,41]],
    edges: [[0,1],[0,2],[1,3],[2,4],[3,5],[4,6],[5,6],[0,7],[7,8],[8,9]] },
  { name: '축제의 밤', sky: '부채자리',
    stars: [[50,37],[30,22],[34,12],[42,6],[50,4],[58,6],[66,12],[70,22],[50,20],[50,41]],
    edges: [[0,1],[0,7],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[0,8],[8,4],[0,9]] },
  { name: '새벽', sky: '학자리',
    stars: [[20,12],[28,17],[38,21],[50,22],[46,10],[58,4],[72,6],[62,27],[76,31],[86,34]],
    edges: [[0,1],[1,2],[2,3],[2,4],[4,5],[5,6],[3,7],[7,8],[8,9]] },
];
const chOf = idx => Math.floor(idx / 10);

// ---------- sound ----------
// 버스: 효과음(OUT) · 배경음(MUS) · 밤소리(AMB) → 마스터 → 압축기. 소리는 기본 켜짐, 첫 터치에 시작한다(브라우저 규칙).
let SAM = null, AC = null, OUT = null, MUS = null, AMB = null, MASTER = null, VERB = null, NOISE = null;
function audio() {
  if (!AC) { try {
    AC = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' });
    const comp = AC.createDynamicsCompressor(); comp.threshold.value = -12; comp.knee.value = 14; comp.ratio.value = 3; comp.attack.value = .002; comp.release.value = .12; comp.connect(AC.destination);
    MASTER = AC.createGain(); MASTER.gain.value = soundOn() ? 1 : 0; MASTER.connect(comp);
    OUT = AC.createGain(); OUT.gain.value = 1; OUT.connect(MASTER);
    SAM = AC.createGain(); SAM.gain.value = .45; SAM.connect(OUT);   // 사물놀이 효과음 버스
    MUS = AC.createGain(); MUS.gain.value = .0001; MUS.connect(MASTER);
    AMB = AC.createGain(); AMB.gain.value = .0001; AMB.connect(MASTER);
    // 잔향: 소리를 밤공기에 퍼지게 한다 (만든 임펄스, 2.8초)
    const len = AC.sampleRate * 1.4, ir = AC.createBuffer(2, len, AC.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
    VERB = AC.createConvolver(); VERB.buffer = ir; const vg = AC.createGain(); vg.gain.value = .32; VERB.connect(vg).connect(MASTER);
    NOISE = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate); const nd = NOISE.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    setInterval(tickSound, 120); loadSfx(); loadGugak();
  } catch (e) {} }
  if (AC && AC.state === 'suspended') AC.resume();
  if (AC && !bed) setScene(SCENE);      // 처음 한 번만. 장이 바뀔 때는 load()/showTitle()이 setScene을 부른다
}
const soundOn = () => save.sound !== false;
function setSound(on) {
  save.sound = on; persist(); audio();
  if (MASTER) MASTER.gain.setTargetAtTime(on ? 1 : 0, AC.currentTime, .15);
  document.querySelectorAll('.snd').forEach(b => { b.classList.toggle('off', !on); b.setAttribute('aria-label', on ? '소리 끄기' : '소리 켜기'); });
}
document.addEventListener('pointerdown', () => audio(), { capture: true });
const PENT = [1, 9/8, 5/4, 3/2, 5/3, 2, 9/4, 5/2, 3, 10/3, 4];
function tone(type, f0, f1, t, dur, vol, bus = OUT, pan = 0) {
  const o = AC.createOscillator(), g = AC.createGain(); o.type = type;
  o.frequency.setValueAtTime(f0, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur * .3);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let n = o.connect(g); if (pan && AC.createStereoPanner) { const p = AC.createStereoPanner(); p.pan.value = pan; n = n.connect(p); }
  n.connect(bus); o.start(t); o.stop(t + dur + .05); return n;
}
function noise(t, dur, freq, vol, type = 'bandpass', bus = OUT) {
  const n = AC.createBufferSource(), g = AC.createGain(), f = AC.createBiquadFilter();
  n.buffer = NOISE; f.type = type; f.frequency.value = freq; f.Q.value = .7;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  n.connect(f).connect(g).connect(bus); n.start(t, Math.random()); n.stop(t + dur + .05);
}
// ---------- 효과음 파일 ----------
// sfx/pop1.mp3 pop2 pop3(등불 크기별) · final.mp3(마지막 등불) · 변주는 pop1b, pop2b … (있으면 번갈아 씀)
// 파일이 있으면 그것을, 없으면 아래 합성음을 낸다. 연쇄가 이어질수록 살짝 높아지는 것은 파일에도 재생 속도로 건다.
// SFX_DIR: 쓸 효과음 묶음 폴더. '' 이면 파일을 쓰지 않고 합성음만 낸다. (불꽃놀이 조각은 sfx/fireworks 에 있으나 등불 느낌이 아니라 꺼 둠)
const SFX_DIR = '', SFX = {}, SFX_NAMES = ['pop1','pop2','pop3','final','pop1b','pop2b','pop3b','peel','fuse'];
function loadSfx() {
  if (!AC || SFX._loading || !SFX_DIR) return; SFX._loading = true;
  SFX_NAMES.forEach(n => fetch(`${SFX_DIR}/${n}.mp3`).then(r => r.ok ? r.arrayBuffer() : Promise.reject()).then(b => AC.decodeAudioData(b)).then(buf => {
    // 펑이 실제로 시작되는 지점(최고치의 8%)을 찾아 두고 거기서부터 튼다 → 탭과 소리가 딱 붙는다
    const d = buf.getChannelData(0); let pk = 0; for (let i = 0; i < d.length; i++) pk = Math.max(pk, Math.abs(d[i]));
    let i = 0; while (i < d.length && Math.abs(d[i]) < pk * .08) i++;
    buf._off = Math.max(0, i / buf.sampleRate - .002); SFX[n] = buf;
  }).catch(() => { SFX[n] = null; }));
}
function playBuf(buf, t, vol, rate = 1, bus = OUT, verb = 0) {
  const src = AC.createBufferSource(), g = AC.createGain(); src.buffer = buf; src.playbackRate.value = rate;
  g.gain.value = vol; src.connect(g).connect(bus); if (verb) { const vg = AC.createGain(); vg.gain.value = verb; g.connect(vg).connect(VERB); }
  src.start(t, buf._off || 0); return src;
}
const pick = n => { const a = SFX[n], b = SFX[n + 'b']; return b && Math.random() < .5 ? b : a; };
// ---------- 사물놀이 효과음 (전부 합성, 시작점이 0초라 화면과 딱 붙는다) ----------
// 등불 크기마다 악기 하나: 작은 등불 꽹과리 · 보통 장구 · 큰 등불 북 · 마지막 등불 징.
// 연쇄가 길어지면 저절로 장단이 된다. 모든 팡 밑에는 한지가 터지는 「파삭」을 아주 얇게 깐다.
function env(g, t, a, peak, d, end = .0001) { g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(end, t + a + d); }
function osc(type, f, t, dur, bus = SAM) { const o = AC.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.start(t); o.stop(t + dur + .05); return o; }
function hit(t, dur, freq, vol, type = 'bandpass', q = .8, bus = SAM) {       // 짧은 잡음 타격
  const n = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
  n.buffer = NOISE; f.type = type; f.frequency.value = freq; f.Q.value = q; env(g, t, .001, vol, dur);
  n.connect(f).connect(g).connect(bus); n.start(t, Math.random() * 1.5); n.stop(t + dur + .05); return g;
}
function paper(t, size) {                         // 한지 파삭 (모든 팡 공통, 얇게)
  const k = GUGAK.kk1 ? .45 : 1;
  hit(t, .05 + size * .01, 3800 - size * 500, .16 * k, 'bandpass', 1.2);
  hit(t + .008, .03, 7000, .06 * k, 'highpass');
}
function kkwaeng(t, vol = .5, open = true, lift = 1) {   // 꽹과리 「갱」: 쇠의 비조화 배음 + 채 끝 딱
  const f0 = 1180 * lift, parts = [1, 1.47, 2.09, 2.76, 3.52, 4.3], d = open ? .55 : .12;
  const bus = AC.createGain(); bus.gain.value = 1; bus.connect(SAM); const v = AC.createGain(); v.gain.value = .25; bus.connect(v).connect(VERB);
  const hp = AC.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 700; hp.connect(bus);
  parts.forEach((m, k) => { const g = AC.createGain(); env(g, t, .0015, vol / (1 + k * .55), d * (1 - k * .09)); osc(k % 2 ? 'square' : 'triangle', f0 * m * (1 + (Math.random() - .5) * .004), t, d).connect(g).connect(hp); });
  hit(t, .025, 5200, vol * .9, 'bandpass', .6, bus);
}
function janggu(t, kind, vol = .55) {             // 장구: 덩(양쪽) · 덕(채편) · 쿵(궁편)
  const bus = SAM;
  if (kind !== 'kung') {                         // 채편: 가죽을 채로 친 탁한 딱 + 짧은 울림
    const g = AC.createGain(); env(g, t, .001, vol * .6, .09);
    const o = osc('triangle', 420, t, .12); o.frequency.exponentialRampToValueAtTime(290, t + .06); o.connect(g).connect(bus);
    hit(t, .06, 1900, vol * .9, 'bandpass', 1.5);
  }
  if (kind !== 'deok') {                         // 궁편: 손바닥으로 친 낮은 둥
    const g = AC.createGain(); env(g, t, .004, vol, .32);
    const o = osc('sine', 150, t, .36); o.frequency.exponentialRampToValueAtTime(92, t + .18); o.connect(g).connect(bus);
    hit(t, .05, 400, vol * .5, 'lowpass');
  }
}
function buk(t, vol = .8) {                        // 북 「쿵」: 큰 가죽의 낮은 울림 + 몸통
  const g = AC.createGain(); env(g, t, .003, vol, .6);
  const o = osc('sine', 96, t, .65); o.frequency.exponentialRampToValueAtTime(52, t + .35); o.connect(g).connect(SAM);
  const g2 = AC.createGain(); env(g2, t, .002, vol * .35, .18);
  osc('triangle', 190, t, .2).connect(g2).connect(SAM);
  hit(t, .04, 700, vol * .5, 'lowpass'); const v = AC.createGain(); v.gain.value = .2; g.connect(v).connect(VERB);
}
function jing(t, vol = .55, dur = 3.6) {           // 징 「지잉~」: 낮은 쇠 배음 두 쌍이 맥놀이하며 길게, 살짝 음이 올라간다
  const bus = AC.createGain(); bus.gain.value = 1; bus.connect(SAM); const v = AC.createGain(); v.gain.value = .45; bus.connect(v).connect(VERB);
  const f0 = 196 * KEYS[SCENE];
  [[1, 1], [1.004, .8], [2.02, .5], [2.03, .35], [2.93, .22], [4.1, .1]].forEach(([m, a]) => {
    const g = AC.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(vol * a, t + .03); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    const o = osc('sine', f0 * m, t, dur); o.frequency.linearRampToValueAtTime(f0 * m * 1.012, t + .5); o.connect(g).connect(bus);
  });
  hit(t, .08, 300, vol * .6, 'lowpass', .7, bus);
}
// 국악기 녹음(sfx/gugak). 읽히면 합성 악기 대신 이것을 쓴다. 시작점은 자를 때 맞춰 두었다.
const GUGAK = {}, GUGAK_NAMES = ['kk1','kk2','kks1','kks2','deong1','deong2','deok1','deok2','kung1','kung2','buk1','jing'];
function loadGugak() {
  if (!AC || GUGAK._loading) return; GUGAK._loading = true;
  GUGAK_NAMES.forEach(n => fetch(`sfx/gugak/${n}.mp3`).then(r => r.ok ? r.arrayBuffer() : Promise.reject()).then(b => AC.decodeAudioData(b)).then(buf => {
    const d = buf.getChannelData(0); let pk = 0; for (let i = 0; i < d.length; i++) pk = Math.max(pk, Math.abs(d[i]));
    let i = 0; while (i < d.length && Math.abs(d[i]) < pk * .1) i++; buf._off = Math.max(0, i / buf.sampleRate - .001); GUGAK[n] = buf;
  }).catch(() => {}));
}
const gk = (...names) => { const have = names.filter(n => GUGAK[n]); return have.length ? GUGAK[have[Math.floor(Math.random() * have.length)]] : null; };
function play(buf, t, vol, rate = 1, verb = .12, pan = 0) {
  const src = AC.createBufferSource(), g = AC.createGain(); src.buffer = buf; src.playbackRate.value = rate; g.gain.value = vol;
  let n = src.connect(g); if (pan && AC.createStereoPanner) { const p = AC.createStereoPanner(); p.pan.value = pan; n = n.connect(p); }
  n.connect(SAM); if (verb) { const v = AC.createGain(); v.gain.value = verb; g.connect(v).connect(VERB); }
  src.start(t, buf._off || 0); return src;
}
// 악기 하나 치기: 녹음이 있으면 녹음, 없으면 합성
const R = () => .98 + Math.random() * .04, P = () => Math.random() * .5 - .25;
function kkw(t, vol, open, lift = 1) { const b = open ? gk('kk1','kk2') : gk('kks1','kks2'); if (b) play(b, t, vol * 3.2, R() * lift, .14, P()); else kkwaeng(t, vol, open, lift); }
function jg(t, kind, vol) {
  const b = kind === 'deok' ? gk('deok1','deok2') : kind === 'kung' ? gk('kung1','kung2') : gk('deong1','deong2');
  if (b) play(b, t, vol * (kind === 'deok' ? 2.3 : 1.8), R(), .1, P()); else janggu(t, kind, vol);
}
function bk(t, vol) { const b = gk('buk1'); if (b) play(b, t, vol * 1.15, R(), .16); else buk(t, vol); }
function jn(t, vol) { const b = gk('jing'); if (b) play(b, t, vol * 2.2, 1, .3); else jing(t, vol); }
let deokTurn = 0;
const FX_MODE = 'tone';    // 'tone' 마림바·칼림바 음정 팡(16) · 'samul' 국악기 · 'pluck' 한지 톡 + 가야금   // 'pluck' 한지 톡 + 가야금 한 음 (배경음이 사물놀이일 때) · 'samul' 연쇄마다 사물 악기
function tapPaper(t, size) {                      // 한지를 손끝으로 톡: 짧고 부드러운 파열 + 종이결
  hit(t, .035 + size * .008, 1800 - size * 250, .22, 'bandpass', 1.1);
  hit(t, .05, 420 - size * 60, .12, 'lowpass');
  hit(t + .006, .025, 5200, .05, 'highpass');
}
function fxPluck(f, t, vol, pan) {               // 효과음용 가야금 한 음 (배경음 버스가 아니라 효과음 버스로)
  const o = AC.createOscillator(), o2 = AC.createOscillator(), g = AC.createGain(), lp = AC.createBiquadFilter();
  o.type = 'triangle'; o2.type = 'sine'; o.frequency.value = f; o2.frequency.value = f * 2.005;
  lp.type = 'lowpass'; lp.frequency.setValueAtTime(f * 7, t); lp.frequency.exponentialRampToValueAtTime(f * 1.3, t + .9);
  env(g, t, .004, vol, 1.3);
  const g2 = AC.createGain(); g2.gain.value = .22; o2.connect(g2).connect(lp);
  let n = o.connect(lp).connect(g); if (AC.createStereoPanner) { const p = AC.createStereoPanner(); p.pan.value = pan; n = n.connect(p); }
  n.connect(SAM); const v = AC.createGain(); v.gain.value = .35; n.connect(v).connect(VERB);
  o.start(t); o2.start(t); o.stop(t + 1.4); o2.stop(t + 1.4);
}
// ---------- 음정 있는 「팡」 (시험판 16): 마림바(나무) + 칼림바(금속). tools/sfx_tone.py 미리듣기 A·B와 같은 소리 ----------
function partial(f, t, a, vol, d, pan, out) { const o = AC.createOscillator(), g = AC.createGain(); o.frequency.value = f; env(g, t, a, vol, d); o.connect(g).connect(out); o.start(t); o.stop(t + a + d + .05); }
function toneOut(pan, verb) { const g = AC.createGain(); let n = g; if (AC.createStereoPanner) { const p = AC.createStereoPanner(); p.pan.value = pan; n = g.connect(p); } n.connect(SAM); const v = AC.createGain(); v.gain.value = verb; n.connect(v).connect(VERB); return g; }
function marimba(f, t, vol = .5, pan = 0, dur = .55) {
  const out = toneOut(pan, .3);
  partial(f, t, .002, vol, dur, pan, out); partial(f * 4, t, .001, vol * .35, dur * .35, pan, out); partial(f * 10.1, t, .001, vol * .15, dur * .15, pan, out);
  partial(f * 2, t, .001, vol * .3, .03, pan, out);                        // 나무 때리는 톡
}
function kalimba(f, t, vol = .45, pan = 0, dur = .9) {
  const out = toneOut(pan, .3);
  const o = AC.createOscillator(), m = AC.createOscillator(), mg = AC.createGain(), g = AC.createGain();
  o.frequency.value = f; m.frequency.value = f * 2.01; mg.gain.setValueAtTime(f * .6, t); mg.gain.exponentialRampToValueAtTime(f * .01, t + .45);
  m.connect(mg).connect(o.frequency); env(g, t, .001, vol, dur); o.connect(g).connect(out); o.start(t); m.start(t); o.stop(t + dur + .05); m.stop(t + dur + .05);
  partial(f * 5.4, t, .001, vol * .25, .12, pan, out);                     // 금속 손톱 소리
}
function paperTok(t, size, vol = 1) {             // 한지 「툭」: 2.6kHz 대역 잡음, 아주 짧게
  hit(t, .05 + size * .01, 2600, (.16 + size * .04) * vol, 'bandpass', 1.4);
}
// 파도·크기 → 음: 파도마다 5음계로 한 칸 오르고, 작은 등불은 한 옥타브 위(칼림바), 큰 등불은 한 옥타브 아래(마림바)
function toneFor(size, wave) {
  const root = 261.6 * KEYS[SCENE], deg = PENT[Math.min(wave, 7)];
  return root * deg * (size === 1 ? 2 : size === 3 ? .5 : 1);
}
function pop(size, wave, dt = 0) {
  if (!AC) return; const t = AC.currentTime + dt;
  const buf = pick('pop' + size);
  if (buf) { const rate = 0.97 + Math.random() * .06, vol = .68 + Math.min(wave, 6) * .03; playBuf(buf, t, vol, rate, OUT, .1); return; }
  if (FX_MODE === 'tone') {
    const pan = Math.random() * .6 - .3, loud = .9 + Math.min(wave, 6) * .03, f = toneFor(size, wave);
    paperTok(t, size, .9);
    if (size === 1) kalimba(f, t, .34 * loud, pan);
    else if (size === 2) marimba(f, t, .42 * loud, pan);
    else { marimba(f, t, .5 * loud, pan, .7); marimba(f * 2, t + .012, .16 * loud, -pan, .3); }
    return;
  }
  if (FX_MODE === 'samul') {                        // (예전) 연쇄마다 사물 악기
    const up = 1 + Math.min(wave, 8) * .018, loud = .85 + Math.min(wave, 6) * .03; paper(t, size);
    if (size === 1) kkw(t, .42 * loud, wave % 3 !== 2, up); else if (size === 2) jg(t, (deokTurn++ % 2) ? 'deok' : 'deong', .78 * loud); else { bk(t, .85 * loud); jg(t + .004, 'kung', .35); }
    return;
  }
  // 지금: 한지 「톡」 + 가야금 한 음. 음은 파도마다 5음계로 한 칸씩 오르고, 큰 등불일수록 한 옥타브 아래
  const root = 196 * KEYS[SCENE], deg = PENT[Math.min(wave, PENT.length - 1)], f = root * deg * (size === 3 ? 1 : size === 2 ? 2 : 2 * 1.5);
  tapPaper(t, size);
  fxPluck(f, t, .16 + (size === 3 ? .03 : 0), Math.random() * .5 - .25);
  if (size === 3) { const g = AC.createGain(); env(g, t, .004, .22, .25); const o = osc('sine', 110, t, .3); o.frequency.exponentialRampToValueAtTime(70, t + .2); o.connect(g).connect(SAM); }
}
function resolve() {                               // 마지막 등불: 북 + 꽹과리 + 징
  if (!AC) return; const t = AC.currentTime;
  if (SFX.final) { playBuf(SFX.final, t, 1, 1, OUT, .4); return; }
  if (FX_MODE === 'tone') {                       // 마지막 등불: 한지 툭 + 도·미·솔·도 화음(마림바 아래, 칼림바 위)
    const root = 261.6 * KEYS[SCENE]; paperTok(t, 3, 1.2);
    [[1, -.4], [5 / 4, -.1], [3 / 2, .2]].forEach(([m, p]) => marimba(root * m, t + .01, .3, p, .8));
    kalimba(root * 2, t + .02, .3, .5, 1.2); return;
  }
  if (FX_MODE === 'samul') { paper(t, 3); bk(t, .62); kkw(t, .3, true, 1.04); jn(t + .02, .4); return; }
  // 마지막 등불: 징 하나 + 가야금 세 음이 맺음(도·솔·높은 도)
  tapPaper(t, 3); jn(t + .01, .38);
  const root = 196 * KEYS[SCENE]; [1, 1.5, 2].forEach((m, i) => fxPluck(root * 2 * m, t + .05 + i * .09, .15, (i - 1) * .3));
}
// 판을 깨면 사물놀이 한 마디. 장단 여섯 가지 중 바로 앞과 다른 것을 골라 매번 다르게, 박은 배경음 반박자에 맞춘다.
// 표기: 한 칸이 반박. K 꽹과리(열림) k 꽹과리(막음) D 덩 d 덕 g 궁 B 북 J 징 . 쉼 · 한 칸에 여러 악기는 +로 잇는다.
const JANGDAN = [
  { name: '휘모리', b: 1, s: 'K+D+B K K+d K K+D+B K K+d K K+D+B k k k+d K+B+J' },
  { name: '자진모리', b: 1, s: 'K+D+B . K+d K . K+D . K+d K+B . K+d . K K+D+B . k K+d . K+B+J' },
  { name: '굿거리', b: 1.5, s: 'K+D+B . k+d K+D . k K+g+B . k K+d k K+D+B . k+d . K+B+J' },
  { name: '세마치', b: 1.3, s: 'K+D+B . K+d K+D . K+B . k K+d K+D+B . K+d . K+B+J' },
  { name: '별달거리', b: 1, s: 'K+D+B K+d . K+D+B K+d . K K K+d K+g+B . . K+D+B K+d . K K k+d K+B+J' },
  { name: '엇모리', b: 1.1, s: 'K+D+B . k K+d . K+D+B . k K+d . K+g+B . k K+d . k+D K+B+J' },
];
let lastJD = -1;
function samulClear() {
  if (!AC) return;
  if (FX_MODE === 'tone') {                       // 판 깨기: 마림바 아르페지오가 반박자 격자를 타고 올라가 칼림바 높은 음으로 맺음
    duck(); clearTimeout(duckT); duckT = setTimeout(() => { if (AC) MUS.gain.setTargetAtTime(MUS_VOL, AC.currentTime, .8); }, 2600);
    const bt = beatSeg(), step = Math.min(.2, Math.max(.11, bt ? 15 / bt.bpm : .15));
    const t0 = AC.currentTime + nextTickMs(60) / 1000, root = 261.6 * KEYS[SCENE];
    [0, 1, 2, 3, 4, 5, 6, 7].forEach((d, i) => marimba(root * PENT[d], t0 + i * step, .34, i / 7 - .5, .5));
    kalimba(root * 4, t0 + 8 * step, .36, 0, 1.6); marimba(root, t0 + 8 * step, .3, 0, 1.2); return;
  }
  if (FX_MODE !== 'samul') {                        // 배경음이 사물놀이면 판 깨기는 가야금 가락 한 줄 + 징으로 가볍게
    const t0 = AC.currentTime + .05, root = 196 * KEYS[SCENE];
    [0, 1, 2, 3, 4, 5, 7].forEach((d, i) => fxPluck(root * 2 * PENT[d], t0 + i * .1, .13, (i % 3 - 1) * .3));
    jn(t0 + .75, .3); return;
  }
  duck(); clearTimeout(duckT); duckT = setTimeout(() => { if (AC) MUS.gain.setTargetAtTime(MUS_VOL, AC.currentTime, .8); }, 3400);
  let j; do { j = Math.floor(Math.random() * JANGDAN.length); } while (j === lastJD); lastJD = j;
  const JD = JANGDAN[j], bt = beatSeg();
  const half = bt ? 30 / bt.bpm : .16, b = Math.min(.24, Math.max(.11, half * JD.b));
  const t0 = AC.currentTime + nextTickMs(60) / 1000;
  const slots = JD.s.split(' '); const n = slots.length;
  slots.forEach((sl, i) => {
    if (sl === '.') return;
    const t = t0 + i * b, last = i === n - 1, acc = i % 4 === 0 || last;
    for (const ch of sl.split('+')) {
      if (ch === 'K') kkw(t, acc ? .3 : .17, acc, 1);
      else if (ch === 'k') kkw(t, .14, false, 1);
      else if (ch === 'D') jg(t, 'deong', acc ? .36 : .28);
      else if (ch === 'd') jg(t, 'deok', .3);
      else if (ch === 'g') jg(t, 'kung', .34);
      else if (ch === 'B') bk(t, last ? .62 : .5);
      else if (ch === 'J') jn(t + .01, .42);
    }
  });
}
const soft = () => { if (!AC) return; const t = AC.currentTime; if (SFX.peel) { playBuf(SFX.peel, t, .7); return; } noise(t, .12, 2600, .22); noise(t + .03, .1, 5500, .07, 'highpass'); noise(t, .08, 500, .14, 'lowpass'); };
const click = () => { if (AC) { const t = AC.currentTime; noise(t, .035, 3200, .12); noise(t, .06, 900, .08, 'lowpass'); } };
const fizz = () => { if (!AC) return; if (SFX.fuse) playBuf(SFX.fuse, AC.currentTime, .5); else noise(AC.currentTime, .28, 5000, .25, 'highpass'); };
const ting = () => { if (!AC) return; const t = AC.currentTime; tone('sine', 1568, 0, t, 1.4, .12).connect(VERB); tone('sine', 2093, 0, t + .06, 1.2, .08).connect(VERB); };
const sad = () => { if (AC) { const t = AC.currentTime; tone('triangle', 311, 233, t, .6, .16).connect(VERB); tone('triangle', 233, 196, t + .22, .8, .12).connect(VERB); } };
const whoosh = () => { if (AC) noise(AC.currentTime, .35, 900, .12, 'lowpass'); };
const yawn = () => { if (!AC) return; const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain(); o.frequency.setValueAtTime(880, t); o.frequency.exponentialRampToValueAtTime(1400, t + .15); o.frequency.exponentialRampToValueAtTime(560, t + .65); g.gain.setValueAtTime(.22, t); g.gain.linearRampToValueAtTime(.0001, t + .7); o.connect(g).connect(OUT); o.start(t); o.stop(t + .75); };
const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };

// ---------- 배경음과 밤소리 ----------
// 장마다 으뜸음, 빠르기, 밤소리가 다르다. 전부 합성음이라 파일이 없다.
const KEYS = [1, 1.122, .891, 1.335, 1.189];            // 1장 기준(도) · 2장 레 · 3장 라(낮게) · 4장 파 · 5장 미
const TEMPO = [1.05, .95, 1.25, .8, 1.1];               // 한 박(초)
const SCN = [
  { crick: 1, owl: 1, water: 1 },                       // 1장 첫 밤: 풀벌레, 소쩍새, 물결
  { crick: .6, owl: .6, water: 1, wind: 1 },            // 2장 바람 부는 밤: 강바람
  { crick: .5, owl: 1, water: .6, chime: 1 },           // 3장 깊은 밤: 산사 풍경 소리
  { crick: .4, owl: .2, water: .6, drum: 1 },           // 4장 축제의 밤: 먼 북소리
  { crick: .2, owl: 0, water: .8, bird: 1 },            // 5장 새벽: 새벽 새
];
let SCENE = 0, nextBeat = 0, beat = 0, nextOwl = 0, nextCrick = 0, nextChime = 0, nextBird = 0, bed = null;
// 수노(Suno) 곡: music/ch1.mp3 … ch5.mp3 가 있으면 그것을 틀고, 없으면 아래 합성 가락이 대신 흐른다.
// 리듬: 곡마다 박자(bpm)와 첫 박 위치(offset)를 music/beats.json에서 읽어, 연쇄의 파도를 8분음표 자리에 맞춘다
let BEATS = {}; fetch('music/beats.json').then(r => r.ok ? r.json() : {}).then(j => { BEATS = j; }).catch(() => {});
// 지금 곡 시각의 박자 구간(수노 곡은 템포가 조금 흔들려 30초 단위로 따로 잰다)
function beatSeg() {
  const b = BEATS['ch' + (SCENE + 1)]; if (!b) return null;
  if (!b.segs || !curTrack) return b;
  const t = curTrack.el.currentTime; let s = b.segs[0];
  for (const x of b.segs) if (t >= x.from) s = x;
  return s;
}
function nextTickMs(minMs) {
  const b = beatSeg();
  if (!curTrack || !b || curTrack.el.paused) return minMs;
  const grid = 30 / b.bpm, t = curTrack.el.currentTime, target = t + minMs / 1000;
  const k = Math.ceil((target - b.offset) / grid - 1e-4), tick = b.offset + k * grid;
  return Math.max(minMs, Math.round((tick - t) * 1000));
}
const MUS_VOL = .72, DUCK_VOL = .3;                 // 배경음 버스 세기(16.1: 「bgm이 조금 더 컸으면」 .5→.72) · 연쇄 동안 낮추는 값(.14→.3, 음정 팡은 배경음과 겹쳐도 덜 부딪힘)
const TRACKS = {}, TRACK_VOL = .8; let curTrack = null, synthOn = true;   // 곡은 -19dB쯤으로 고르게 뽑혀 있어 .8 × MUS(.5)면 팡 아래에 깔린다
function loadTrack(ch) {
  if (TRACKS[ch] !== undefined) return TRACKS[ch];
  const a = new Audio(); a.loop = false; a.preload = 'auto';
  const rec = { el: a, node: null, gain: null, ok: null };
  // 수노 곡은 끝이 조용히 사라지므로, 다시 시작할 때 2.5초 페이드인으로 이어 붙인다
  a.addEventListener('ended', () => { if (curTrack !== rec || !AC) return; a.currentTime = 0; rec.gain.gain.setValueAtTime(.0001, AC.currentTime); a.play().then(() => rec.gain.gain.setTargetAtTime(TRACK_VOL, AC.currentTime, .9)).catch(() => {}); });
  a.addEventListener('canplaythrough', () => { if (rec.ok === null) { rec.ok = true; if (SCENE === ch) startTrack(ch); } }, { once: true });
  a.addEventListener('error', () => { rec.ok = false; if (SCENE === ch) synthOn = true; }, { once: true });
  a.src = `music/ch${ch + 1}.mp3`;
  return TRACKS[ch] = rec;
}
function startTrack(ch) {
  const r = TRACKS[ch]; if (!r || !r.ok || !AC) return;
  if (!r.node) { r.node = AC.createMediaElementSource(r.el); r.gain = AC.createGain(); r.gain.gain.value = .0001; r.node.connect(r.gain).connect(MUS); }
  if (curTrack && curTrack !== r) { const o = curTrack; o.gain.gain.setTargetAtTime(.0001, AC.currentTime, 1); setTimeout(() => o.el.pause(), 3500); }
  curTrack = r; synthOn = false;
  r.el.play().then(() => r.gain.gain.setTargetAtTime(TRACK_VOL, AC.currentTime, 1.5)).catch(() => { synthOn = true; });
}
function setScene(ch) {
  if (AC && bed && ch === SCENE) return;   // 같은 장이면 그대로
  SCENE = ch; if (!AC) return;
  const t = AC.currentTime;
  MUS.gain.setTargetAtTime(MUS_VOL, t, 1.2); AMB.gain.setTargetAtTime(.9, t, 1.5);
  if (bed) { const old = bed; old.g.gain.setTargetAtTime(.0001, t, .8); setTimeout(() => old.src.forEach(s => s.stop()), 4000); }
  bed = makeBed(SCN[ch]);
  if (!nextBeat) nextBeat = t + .3;
  const r = loadTrack(ch);
  if (r.ok) startTrack(ch);
  else { synthOn = true; if (curTrack) { const o = curTrack; o.gain.gain.setTargetAtTime(.0001, t, 1); setTimeout(() => o.el.pause(), 3500); curTrack = null; } }
}
function makeBed(S) {    // 계속 깔리는 소리: 물결(낮은 잡음이 천천히 일렁임) + 바람
  const g = AC.createGain(); g.gain.value = .0001; g.connect(AMB); g.gain.setTargetAtTime(1, AC.currentTime, 1.5);
  const src = [];
  const layer = (freq, type, vol, rate) => {
    const n = AC.createBufferSource(); n.buffer = NOISE; n.loop = true;
    const f = AC.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = .5;
    const lg = AC.createGain(); lg.gain.value = vol;
    const lfo = AC.createOscillator(), lfg = AC.createGain(); lfo.frequency.value = rate; lfg.gain.value = vol * .8; lfo.connect(lfg).connect(lg.gain);
    const lf2 = AC.createOscillator(), l2g = AC.createGain(); lf2.frequency.value = rate * .37; l2g.gain.value = freq * .35; lf2.connect(l2g).connect(f.frequency);
    n.connect(f).connect(lg).connect(g); n.start(); lfo.start(); lf2.start(); src.push(n, lfo, lf2);
  };
  if (S.water) layer(420, 'lowpass', .05 * S.water, .18);
  if (S.wind) layer(700, 'bandpass', .045, .07);
  return { g, src };
}
function hoot(f0, f1, t, dur, vol, pan) {   // 새 울음: 떨림 + 숨
  const o = AC.createOscillator(), g = AC.createGain(), lfo = AC.createOscillator(), lg = AC.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.linearRampToValueAtTime(f1, t + dur);
  lfo.frequency.value = 6 + Math.random() * 2; lg.gain.value = f0 * .012; lfo.connect(lg).connect(o.frequency);
  g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(vol, t + dur * .25); g.gain.linearRampToValueAtTime(vol * .7, t + dur * .7); g.gain.linearRampToValueAtTime(.0001, t + dur);
  const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = f0 * 1.6;
  let n = o.connect(lp).connect(g); if (AC.createStereoPanner) { const p = AC.createStereoPanner(); p.pan.value = pan; n = n.connect(p); }
  n.connect(AMB); n.connect(VERB); o.start(t); lfo.start(t); o.stop(t + dur + .05); lfo.stop(t + dur + .05);
  noise(t, dur, f0, vol * .5, 'bandpass', AMB);
}
function pluck(f, t, vol, pan) {   // 가야금 같은 뜯는 소리
  const o = AC.createOscillator(), o2 = AC.createOscillator(), g = AC.createGain(), lp = AC.createBiquadFilter();
  o.type = 'triangle'; o2.type = 'sine'; o.frequency.value = f; o2.frequency.value = f * 2.01;
  lp.type = 'lowpass'; lp.frequency.setValueAtTime(f * 6, t); lp.frequency.exponentialRampToValueAtTime(f * 1.5, t + 1.2);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + 2.4);
  const g2 = AC.createGain(); g2.gain.value = .25; o2.connect(g2).connect(lp);
  let n = o.connect(lp).connect(g); if (AC.createStereoPanner) { const p = AC.createStereoPanner(); p.pan.value = pan; n = n.connect(p); }
  n.connect(MUS); n.connect(VERB);
  o.start(t); o2.start(t); o.stop(t + 2.5); o2.stop(t + 2.5);
}
function pad(freqs, t, dur) {      // 느리게 부풀었다 사라지는 바탕 화음
  freqs.forEach((f, i) => {
    const o = AC.createOscillator(), g = AC.createGain(), lp = AC.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = (i - 1) * 6;
    lp.type = 'lowpass'; lp.frequency.value = 520;
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.022, t + dur * .4); g.gain.linearRampToValueAtTime(.0001, t + dur);
    o.connect(lp).connect(g).connect(MUS); g.connect(VERB); o.start(t); o.stop(t + dur + .1);
  });
}
const MEL = [0, 1, 2, 4, 5, 7, 4, 2];          // 5음계 안에서 걷는 가락 (PENT의 칸 번호)
const CHORDS = [[1, 3/2, 2], [5/6, 5/4, 5/3], [2/3, 1, 4/3], [3/4, 9/8, 3/2]];
let melPos = 0;
function tickSound() {
  if (!AC || AC.state !== 'running' || !soundOn()) return;
  const t = AC.currentTime, S = SCN[SCENE], k = KEYS[SCENE], root = 196 * k;
  while (nextBeat < t + .4) {
    const bt = nextBeat, bar = Math.floor(beat / 8);
    if (!synthOn) { nextBeat += TEMPO[SCENE]; beat++; continue; }
    if (beat % 16 === 0) pad(CHORDS[bar / 2 % 4 | 0].map(r => root / 2 * r), bt, TEMPO[SCENE] * 17);
    // 가락: 박마다 뜯을지 말지 주사위, 가끔 두 음 겹침
    if (Math.random() < (beat % 2 ? .35 : .7)) {
      melPos = (melPos + (Math.random() < .5 ? 1 : Math.random() < .5 ? -1 : 2) + MEL.length) % MEL.length;
      const f = root * PENT[MEL[melPos]];
      pluck(f, bt + (Math.random() - .5) * .03, .09, Math.random() * .6 - .3);
      if (Math.random() < .18) pluck(f * 1.5, bt + TEMPO[SCENE] / 2, .05, .3);
    }
    if (S.drum && beat % 4 === 0) { tone('sine', 110, 55, bt, .5, .09, AMB); if (beat % 8 === 6) tone('sine', 150, 70, bt + TEMPO[SCENE] / 2, .3, .05, AMB); }
    nextBeat += TEMPO[SCENE]; beat++;
  }
  if (S.crick && t > nextCrick) {               // 풀벌레: 높은 음이 빠르게 서너 번 떨림
    const f = 4200 + Math.random() * 900, pan = Math.random() * 1.6 - .8, reps = 3 + (Math.random() * 3 | 0);
    for (let i = 0; i < reps; i++) {
      const n = AC.createBufferSource(), bp = AC.createBiquadFilter(), g = AC.createGain(), st = t + .05 + i * .055;
      n.buffer = NOISE; bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = 18;
      g.gain.setValueAtTime(.0001, st); g.gain.exponentialRampToValueAtTime(.09 * S.crick, st + .006); g.gain.exponentialRampToValueAtTime(.0001, st + .04);
      let o = n.connect(bp).connect(g); if (AC.createStereoPanner) { const pp = AC.createStereoPanner(); pp.pan.value = pan; o = o.connect(pp); }
      o.connect(AMB); n.start(st, Math.random()); n.stop(st + .05);
    }
    nextCrick = t + .35 + Math.random() * 1.1;
  }
  if (S.owl && t > nextOwl) {                   // 소쩍새: "소-쩍" 두 음, 두세 번
    if (nextOwl) { const pan = Math.random() * 1.2 - .6, n = 2 + (Math.random() * 2 | 0), base = 1050 + Math.random() * 80;
      for (let i = 0; i < n; i++) { const s = t + .1 + i * 1.35;
        hoot(base, base * .97, s, .28, .045 * S.owl, pan); hoot(base * .86, base * .8, s + .36, .22, .04 * S.owl, pan); } }
    nextOwl = t + 14 + Math.random() * 16;
  }
  if (S.chime && t > nextChime) {               // 풍경: 쇠 종 여러 배음
    if (nextChime) { const f = 1320 + Math.random() * 200; [1, 2.76, 5.4].forEach((m, i) => tone('sine', f * m, 0, t + .1, 3.2 - i, .03 / (i + 1), AMB, .4).connect(VERB)); }
    nextChime = t + 9 + Math.random() * 12;
  }
  if (S.bird && t > nextBird) {                 // 새벽 새: 짧게 미끄러지는 지저귐
    const pan = Math.random() * 1.4 - .7, f = 2600 + Math.random() * 1200, n = 3 + (Math.random() * 4 | 0);
    for (let i = 0; i < n; i++) tone('sine', f * (1 + (i % 2) * .25), f * (1.3 - (i % 2) * .4), t + .1 + i * .11, .08, .025, AMB, pan).connect(VERB);
    nextBird = t + 2.5 + Math.random() * 5;
  }
}

// ---------- save ----------
let save = { unlocked: 0, done: {}, seen: {} };
try { const s = localStorage.getItem('lanternfall.save'); if (s) save = Object.assign(save, JSON.parse(s)); } catch (e) {}
save.done = save.done || {}; save.seen = save.seen || {};
for (let i = 0; i < save.unlocked; i++) save.done[i] = true;
const persist = () => { try { localStorage.setItem('lanternfall.save', JSON.stringify(save)); } catch (e) {} };

// ---------- mini illustrations & cards ----------
const TWIN_MARKS = ['달', '별', '꽃', '강'], SEALS = ['#B8322A', '#2B5FA8', '#2E8B57', '#C98A12'];
// 쌍둥이 문양. 글꼴 크기 설정에 흔들리지 않게 SVG로 그린다: 오방색 둥근 바탕 + 한글 한 글자
const markSVG = p => { const c = SEALS[p % 4]; return `<svg class="mark" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9.2" fill="${c}"/><circle cx="10" cy="10" r="7.6" fill="none" stroke="#FFF8EC" stroke-width=".9"/><text x="10" y="10.6" text-anchor="middle" dominant-baseline="middle" font-size="9.5" font-weight="700" fill="#FFF8EC" font-family="'Nanum Myeongjo','Apple SD Gothic Neo','Noto Serif KR',serif">${TWIN_MARKS[p % TWIN_MARKS.length]}</text></svg>`; };
function lanHTML(s, opts = {}) {
  return `<div class="lan s${s}${opts.sleep ? ' sleep' : ''}${opts.big ? ' big' : ''}${opts.star ? ' star' : ''}"><span class="string"></span>${opts.fuse ? '<span class="wick"></span>' : ''}${opts.star ? '<span class="halo"></span>' : ''}<span class="paper"></span><span class="cap t"></span><span class="cap b"></span>` +
    (opts.band ? `<span class="band ${opts.band}"></span>` : '') + (opts.veil ? '<span class="veil"></span>' : '') +
    (opts.twin !== undefined ? markSVG(opts.twin) : '') +
    (opts.sleep ? `<span class="eyes"><i></i><i></i></span><span class="zz">${opts.big ? 'Z Z' : 'z z'}</span>` : `<span class="knots">${'<i></i>'.repeat(s)}</span>`) + '</div>';
}
const mirrorHTML = kind => `<div class="mirror ${kind ? 'b' : 'a'}"><i></i></div>`;
const optsOf = L => ({ band: L.t === 1 ? 'h' : L.t === 2 ? 'v' : null, fuse: L.t === 3, veil: L.l > 1, twin: L.t === 4 ? L.p : undefined, star: L.t === 5 });
function mini(spec) {
  return '<div class="mini">' + spec.map(x => {
    if (x === '-') return '<div class="mc mray"></div>';
    if (x === '>') return '<div class="mc mray mstop"></div>';
    if (x === '.') return '<div class="mc"></div>';
    if (x === 'R') return '<div class="mc"><div class="rock"></div></div>';
    if (x === 'X') return '<div class="mc"><span class="x">✕</span></div>';
    if (x === 'S') return '<div class="mc">' + lanHTML(2, { sleep: true }) + '</div>';
    if (x === 'B') return '<div class="mc">' + lanHTML(3, { sleep: true, big: true }) + '</div>';
    if (x === 'M') return '<div class="mc">' + mirrorHTML(0) + '</div>';
    if (x === 'm') return '<div class="mc">' + mirrorHTML(1) + '</div>';
    if (x === '|') return '<div class="mc mray mv"></div>';
    if (x === 'L') return '<div class="mc mray mL"></div>';
    if (x === 'W') return '<div class="mc">' + lanHTML(2, { twin: 0 }) + '</div>';
    if (x === 'K') return '<div class="mc">' + lanHTML(2, { star: true }) + '</div>';
    if (x === '/') return '<div class="mc mray mdiag"></div>';
    if (/^T\d$/.test(x)) return '<div class="mc tapicons">' + '<i></i>'.repeat(+x[1]) + '</div>';
    const s = +x[1] || 2, o = { band: x[0] === 'H' ? 'h' : x[0] === 'V' ? 'v' : null, fuse: x[0] === 'F', veil: x[0] === 'D' };
    return '<div class="mc">' + lanHTML(s, o) + '</div>';
  }).join('') + '</div>';
}
const CARDS = {
  intro: { title: 'Lanternfall', kicker: '규칙은 셋',
    steps: [[['L2'], '등불을 톡 치면 터져요. 아래 매듭 수만큼 네 방향으로 불꽃이 날아가요.'],
            [['L2','-','L1'], '불꽃은 처음 만난 등불에서 멈추고, 그 등불도 터뜨려요. 이렇게 연쇄가 이어져요.'],
            [['T1'], '정해진 횟수 안에 모든 등불을 터뜨리면 성공. 오른쪽 위 불씨가 남은 횟수예요.']] },
  sleep:   { title: '잠든 등불', kicker: '새로운 등불', art: ['L2','>','.','S'], text: '불꽃이 닿으면 깨어나요. 깨우면 실패예요. 직접 누를 수도 없어요. 불꽃이 비켜가도록 길을 골라야 해요.' },
  preview: { title: '미리보기', kicker: '알아두면 좋은 것', art: ['-','L2','-'], text: '등불을 꾹 누르고 있으면 불꽃이 갈 길이 금색 선으로 보여요. 손을 떼도 터지지 않아요. 짧게 톡 쳐야 터져요.' },
  rock:    { title: '바위', kicker: '새로운 것', art: ['L3','-','R','L1'], text: '바위는 불꽃을 막아요. 바위 뒤의 등불은 다른 방향에서 맞혀야 해요.' },
  taps2:   { title: '두 번', kicker: '새로운 규칙', art: ['T2'], text: '이번 판은 두 번 칠 수 있어요. 첫 연쇄가 닿지 못한 무리를 두 번째로 잡으세요. 순서가 중요할 수도 있어요.' },
  layered: { title: '겉종이 등불', kicker: '새로운 등불', art: ['D2'], text: '밝은 겉종이가 한 겹 더 있어요. 첫 번째로 맞으면 겉종이만 벗겨지고, 두 번째에 터져요. 직접 쳐도 한 겹만 벗겨져요.' },
  dir:     { title: '금띠 등불', kicker: '새로운 등불', art: ['-','H2','-','.','V2'], text: '금띠 방향으로만 불꽃이 나가요. 가로띠는 왼쪽과 오른쪽, 세로띠는 위와 아래로만.' },
  fuse:    { title: '심지 등불', kicker: '새로운 등불', art: ['L1','-','F2'], text: '맞으면 심지에 불이 붙고 한 박자 뒤에 터져요. 불붙은 채 기다리는 동안에는 다른 불꽃을 막아요.' },
  taps3:   { title: '세 번', kicker: '새로운 규칙', art: ['T3'], text: '세 번 칠 수 있어요. 판을 세 무리로 나눠 보세요.' },
  big:     { title: '큰 잠꾸러기', kicker: '새로운 등불', art: ['L2','>','.','B'], text: '깊이 잠들어서 불꽃이 한 번 닿아도 뒤척이기만 해요. 두 번째로 닿으면 깨어나 실패예요. 한 번은 스쳐도 괜찮아요.' },
  mirror:  { title: '거울', kicker: '새로운 것', art: ['L2','-','M','|','L1'], text: '불꽃이 거울에 닿으면 직각으로 꺾여 계속 날아가요. 거울 칸도 한 칸으로 세요. 꺾인 뒤에 무엇을 만날지 그려 보세요.' },
  twin:    { title: '쌍둥이 등불', kicker: '새로운 등불', art: ['W','.','.','W'], text: '같은 글자가 쓰인 등불은 둘이 한 몸이에요. 하나가 터지면 짝도 멀리서 같은 순간에 터져요.' },
  star:    { title: '별꽃 등불', kicker: '새로운 등불', art: ['/','K','/'], text: '별꽃 등불은 불꽃이 여덟 방향으로 날아가요. 대각선까지 살펴야 해요.' },
  board8:  { title: '넓은 밤', kicker: '새로운 규칙', art: ['T3'], text: '판이 8×8로 넓어졌어요. 새 등불은 없어요. 지금까지 배운 것을 모두 써 보세요.' },
};
const ORDER = ['intro','sleep','preview','rock','taps2','layered','dir','fuse','taps3','big','mirror','twin','star','board8'];
function featuresOf(idx) {
  const lv = LEVELS[idx], f = new Set(['intro']);
  if (lv.sleep.length) f.add('sleep');
  if (idx >= 3) f.add('preview');
  if (lv.rocks.length) f.add('rock');
  if (lv.k === 2) f.add('taps2');
  if (lv.k >= 3) f.add('taps3');
  if (lv.lanterns.some(x => x[3] > 1)) f.add('layered');
  if (lv.lanterns.some(x => x[4] === 1 || x[4] === 2)) f.add('dir');
  if (lv.lanterns.some(x => x[4] === 3)) f.add('fuse');
  if (lv.sleep.some(x => x[2] > 1)) f.add('big');
  if ((lv.mirrors || []).length) f.add('mirror');
  if (lv.lanterns.some(x => x[4] === 4)) f.add('twin');
  if (lv.lanterns.some(x => x[4] === 5)) f.add('star');
  if (lv.n >= 8) f.add('board8');
  return ORDER.filter(k => f.has(k));
}
function cardHTML(key) {
  const c = CARDS[key];
  if (key === 'intro') return `<div class="kicker">${c.kicker}</div><h4>${c.title}</h4>` + c.steps.map(([a, t]) => `<div class="step">${mini(a)}<p>${t}</p></div>`).join('');
  return `<div class="kicker">${c.kicker}</div><h4>${c.title}</h4>${mini(c.art)}<p>${c.text}</p>`;
}
function showCard(html, label = '알겠어요') {
  return new Promise(res => {
    const wrap = $('cards'), card = $('card');
    card.innerHTML = html + `<div class="actions"><button class="primary" id="cardOk">${label}</button></div>`;
    wrap.classList.add('show');
    const ok = $('cardOk'); ok.focus({ preventScroll: true, focusVisible: false });
    ok.onclick = () => { audio(); wrap.classList.remove('show'); res(); };
  });
}
async function showNewCards(idx) {
  for (const k of featuresOf(idx)) if (!save.seen[k]) { await showCard(cardHTML(k), k === 'intro' ? '시작하기' : '알겠어요'); save.seen[k] = true; persist(); }
}
function openGlossary() {
  const seen = ORDER.filter(k => save.seen[k] && k !== 'intro');
  const html = cardHTML('intro') + seen.map(k => `<div class="gl">${mini(CARDS[k].art)}<b>${CARDS[k].title}</b><p>${CARDS[k].text}</p></div>`).join('');
  showCard(html, '닫기');
}

// ---------- sky ----------
function renderSky(idx, highlightNew = -1) {
  const ch = chOf(idx), C = CH[ch], sky = $('sky');
  const lit = i => !!save.done[ch * 10 + i];
  const complete = C.stars.every((_, i) => lit(i));
  let s = `<svg viewBox="0 0 100 42" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><defs><filter id="glow" x="-2" y="-2" width="5" height="5"><feGaussianBlur stdDeviation="0.7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;
  C.edges.forEach(([a, b], k) => { const [x1,y1] = C.stars[a], [x2,y2] = C.stars[b];
    s += `<line class="edge${lit(a) && lit(b) && a !== highlightNew && b !== highlightNew ? ' on' : ''}" data-a="${a}" data-b="${b}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`; });
  C.stars.forEach(([x, y], i) => {
    const on = lit(i) && i !== highlightNew, cur = ch * 10 + i === idx && !lit(i);
    s += `<circle class="st${on ? ' on' : ''}${cur ? ' cur' : ''}" data-i="${i}" cx="${x}" cy="${y}" r="${i === 9 && ch === 0 ? 1.5 : 1.1}"/>`;
  });
  s += '</svg>';
  sky.innerHTML = s + `<div class="name">${C.sky}</div>`;
  sky.classList.toggle('complete', complete && highlightNew < 0);
}
function lightStar(i) {
  const st = $('sky').querySelector(`.st[data-i="${i}"]`); if (!st) return;
  st.classList.remove('cur'); st.classList.add('on', 'pop'); ting();
  $('sky').querySelectorAll('.edge').forEach(e => { const a = +e.dataset.a, b = +e.dataset.b, ch = chOf(G.idx);
    if ((a === i || b === i) && save.done[ch * 10 + a] && save.done[ch * 10 + b]) requestAnimationFrame(() => e.classList.add('on')); });
}

// ---------- game ----------
let G = null;
const board = $('board');
async function load(idx) {
  const lv = LEVELS[idx];
  document.documentElement.dataset.ch = chOf(idx);
  if (AC) setScene(chOf(idx));
  G = { idx, n: lv.n, k: lv.k, used: 0, busy: true, over: false,
        lan: new Map(lv.lanterns.map(([r,c,s,l,t,p]) => [r*lv.n+c, { s, l, t, p }])),
        rocks: new Set(lv.rocks.map(([r,c]) => r*lv.n+c)),
        mirrors: new Map((lv.mirrors || []).map(([r,c,k]) => [r*lv.n+c, { k }])),
        sleep: new Map(lv.sleep.map(([r,c,hp]) => [r*lv.n+c, { hp: hp || 1 }])) };
  const myG = G;
  board.style.setProperty('--n', lv.n); board.innerHTML = ''; board.className = 'board pre';
  for (let i = 0; i < lv.n*lv.n; i++) {
    const r = Math.floor(i/lv.n), c = i%lv.n;
    const cell = document.createElement('div'); cell.className = 'cell';
    cell.style.left = (c*100/lv.n)+'%'; cell.style.top = (r*100/lv.n)+'%';
    const rise = document.createElement('div'); rise.className = 'rise';
    rise.style.animationDelay = (c * 45 + (lv.n - r) * 35 + Math.random() * 60) + 'ms';
    if (G.rocks.has(i)) rise.innerHTML = '<div class="rock"></div>';
    else if (G.mirrors.has(i)) { rise.innerHTML = mirrorHTML(G.mirrors.get(i).k); G.mirrors.get(i).el = rise.firstChild; }
    else if (G.sleep.has(i)) {
      const big = G.sleep.get(i).hp > 1;
      rise.innerHTML = lanHTML(big ? 3 : 2, { sleep: true, big }); const d = rise.firstChild;
      d.style.animationDelay = (-Math.random()*6)+'s'; d.setAttribute('aria-label', big ? '큰 잠꾸러기, 두 번 닿으면 깸' : '잠든 등불, 깨우면 안 됨');
      d.addEventListener('pointerdown', () => { audio(); if (!G.busy && !G.over) { d.classList.remove('hit'); void d.offsetWidth; d.classList.add('hit'); soft(); } });
      G.sleep.get(i).el = d;
    } else if (G.lan.has(i)) {
      const L = G.lan.get(i);
      rise.innerHTML = lanHTML(L.s, optsOf(L));
      const d = rise.firstChild; d.style.animationDelay = (-Math.random()*3.4)+'s';
      d.setAttribute('role','button'); d.tabIndex = 0;
      d.setAttribute('aria-label', `등불, 불꽃 ${L.s}칸` + (L.t === 1 ? ', 가로로만' : L.t === 2 ? ', 세로로만' : L.t === 3 ? ', 심지' : L.t === 4 ? ', 쌍둥이' : L.t === 5 ? ', 여덟 방향' : '') + (L.l > 1 ? ', 겉종이' : ''));
      let held = false, timer = null;
      d.addEventListener('pointerdown', () => { audio(); if (G.busy || G.over) return; held = false; preview(i, true); timer = setTimeout(() => { held = true; }, 380); });
      const release = () => { clearTimeout(timer); preview(i, false); };
      d.addEventListener('pointerup', () => { if (G.busy || G.over) return; release(); if (!held) tap(i); });
      d.addEventListener('pointerleave', release); d.addEventListener('pointercancel', release);
      d.addEventListener('contextmenu', e => e.preventDefault());
      d.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); audio(); tap(i); } });
      L.el = d;
    }
    cell.appendChild(rise); board.appendChild(cell);
  }
  const combo = document.createElement('div'); combo.className = 'combo'; combo.id = 'combo'; board.appendChild(combo);
  $('lvl').textContent = `${idx+1} / ${LEVELS.length}`;
  $('prev').hidden = idx === 0;
  $('next').hidden = !(idx + 1 < LEVELS.length && (save.done[idx] || idx + 1 <= save.unlocked));
  renderTaps(); renderSky(idx);
  await showNewCards(idx);
  if (G !== myG) return;
  board.classList.remove('pre'); board.classList.add('enter'); whoosh();
  const maxDelay = Math.max(...[...board.querySelectorAll('.rise')].map(r => parseFloat(r.style.animationDelay)));
  await sleep(Math.min(700, maxDelay + 350));
  if (G === myG) G.busy = false;
  setTimeout(() => { if (G === myG) board.classList.remove('enter'); }, maxDelay + 1000);
}
function renderTaps() { const t = $('taps'); t.innerHTML = ''; for (let i = 0; i < G.k; i++) { const d = document.createElement('i'); if (i < G.used) d.classList.add('used'); t.appendChild(d); } }
function center(i) { const n = G.n, cs = board.clientWidth / n; return { x: (i % n) * cs + cs/2, y: Math.floor(i/n) * cs + cs/2, cs }; }
// 불꽃 하나의 길. path: 지나간 칸(거울 칸 포함). sim.py의 trace와 같아야 한다.
function trace(p, dr, dc, s) {
  let r = Math.floor(p/G.n), c = p%G.n; const path = [];
  for (let d = 1; d <= s; d++) {
    r += dr; c += dc;
    if (r<0||r>=G.n||c<0||c>=G.n) break;
    const q = r*G.n+c; if (G.rocks.has(q)) break;
    path.push(q);
    if (G.mirrors.has(q)) { [dr, dc] = bend(G.mirrors.get(q).k, dr, dc); continue; }
    if (G.sleep.has(q)) return { path, reach: path.length, hit: q, sleeper: true };
    if (G.lan.has(q)) return { path, reach: path.length, hit: q, sleeper: false };
  }
  return { path, reach: path.length, hit: null, sleeper: false };
}
// 길을 꺾이는 점 기준으로 선분으로 나눈다: [{x,y}, ...] (판 안 픽셀, 첫 점은 출발 등불)
function segments(p, path) {
  const pts = [center(p)]; let prev = p;
  for (const q of path) { pts.push(center(q)); prev = q; }
  return pts;
}
let rays = [];
function preview(i, on) {
  rays.forEach(r => r.remove()); rays = [];
  board.querySelectorAll('.target').forEach(e => e.classList.remove('target'));
  if (!on || !G.lan.has(i)) return;
  const L = G.lan.get(i), cs = center(i).cs;
  for (const [dr,dc] of dirsFor(L.t)) {
    const t = trace(i, dr, dc, L.s); if (!t.reach) continue;
    const pts = segments(i, t.path);
    for (let k = 0; k + 1 < pts.length; k++) {
      const a = pts[k], b = pts[k+1], ddx = b.x - a.x, ddy = b.y - a.y, full = Math.hypot(ddx, ddy);
      const ux = ddx / full, uy = ddy / full;
      const head = k === 0 ? cs * .25 : 0, tail = (k + 2 === pts.length && t.hit !== null) ? cs * .3 : 0;
      const len = full - head - tail; if (len <= 0) continue;
      const ray = document.createElement('div'); ray.className = 'ray';
      ray.style.left = (a.x + ux * head) + 'px'; ray.style.top = (a.y - cs * .07 + uy * head) + 'px'; ray.style.width = len + 'px';
      ray.style.transform = `rotate(${Math.atan2(uy, ux)}rad)`;
      board.appendChild(ray); rays.push(ray); requestAnimationFrame(() => ray.classList.add('show'));
    }
    if (t.hit !== null) (t.sleeper ? G.sleep.get(t.hit).el : G.lan.get(t.hit).el).classList.add('target');
    t.path.forEach(q => { if (G.mirrors.has(q)) G.mirrors.get(q).el.classList.add('target'); });
  }
}
function paperBurst(i, s, big = false) {
  const {x, y, cs} = center(i), yc = y - cs * .07;
  const g = document.createElement('div'); g.className = 'glow' + (big ? ' big' : '');
  const gs = cs * (0.9 + s * 0.35) * (big ? 2.2 : 1); g.style.width = g.style.height = gs+'px'; g.style.left = x+'px'; g.style.top = yc+'px';
  board.appendChild(g); setTimeout(() => g.remove(), big ? 2100 : 1250);
  const cols = ['var(--l-light)', 'var(--l-mid)', 'var(--l-dark)', 'var(--l-scrap)'];
  const cnt = (8 + s * 2) * (big ? 2.5 : 1);
  for (let k = 0; k < cnt; k++) {
    const e = document.createElement('div'); e.className = 'scrap';
    const w = (9 + Math.random() * 9) * (big ? 1.3 : 1), h = w;                       // 제미나이 색종이 조각(assets.md 10번)
    e.style.width = w+'px'; e.style.height = h+'px'; e.style.left = (x - w/2)+'px'; e.style.top = (yc - h/2)+'px'; e.style.backgroundImage = `var(--img-cf${(k * 5 + (s | 0)) % 12})`;
    const a = Math.random() * Math.PI * 2, d = cs * (0.35 + Math.random() * 0.4 * s) * (big ? 1.8 : 1);
    e.style.setProperty('--x0', Math.cos(a)*d+'px'); e.style.setProperty('--y0', (Math.sin(a)*d - cs*0.2)+'px');
    e.style.setProperty('--sw', (12 + Math.random()*16) * (Math.random()<.5?-1:1) + 'px'); e.style.setProperty('--fall', (cs * (1 + Math.random()*1.2) * (big ? 1.6 : 1))+'px');
    e.style.setProperty('--r0', (Math.random()*180-90)+'deg'); e.style.setProperty('--r1', (Math.random()*360)+'deg'); e.style.setProperty('--r2', (Math.random()*540)+'deg');
    const dur = (1100 + Math.random() * 600) * (big ? 1.6 : 1); e.style.setProperty('--d', dur+'ms');
    board.appendChild(e); setTimeout(() => e.remove(), dur + 50);
  }
  sparks(x, yc, cs, s, big);
}
// 불티: 위쪽 반원으로 튀어 올라(꼬리는 진행 방향 반대) 포물선으로 떨어진다
function sparks(x, y, cs, s, big = false) {
  const cnt = (2 + s) + (big ? 3 : 0);
  for (let k = 0; k < cnt; k++) {
    const e = document.createElement('div'); e.className = 'spark';
    const a = -Math.PI / 2 + (Math.random() - .5) * Math.PI * 1.1;              // 위쪽 ±100도
    const d = cs * (0.5 + Math.random() * 0.6 * s) * (big ? 1.7 : 1);
    const x0 = Math.cos(a) * d, y0 = Math.sin(a) * d;
    e.style.left = x + 'px'; e.style.top = y + 'px';
    e.style.setProperty('--w', (cs * (0.24 + Math.random() * 0.12) * (big ? 1.4 : 1)) + 'px');
    e.style.setProperty('--x0', x0 + 'px'); e.style.setProperty('--y0', y0 + 'px');
    e.style.setProperty('--a0', (a * 180 / Math.PI + 90) + 'deg');              // 그림의 머리가 위, 꼬리가 아래 → 진행 방향으로 돌림
    e.style.setProperty('--a1', (a * 180 / Math.PI + 90 + (Math.random() * 60 - 30)) + 'deg');
    e.style.setProperty('--sw', (Math.random() * 30 - 15) + 'px'); e.style.setProperty('--fall', (cs * (0.9 + Math.random() * 0.9)) + 'px');
    const dur = (700 + Math.random() * 500) * (big ? 1.5 : 1); e.style.setProperty('--d', dur + 'ms');
    board.appendChild(e); setTimeout(() => e.remove(), dur + 50);
  }
}
function goldDust(cnt) {
  const b = board.getBoundingClientRect();
  for (let k = 0; k < cnt; k++) {
    const e = document.createElement('div'); e.className = 'gold';
    e.style.left = (b.left + Math.random() * b.width) + 'px'; e.style.top = (b.top + Math.random() * b.height) + 'px';
    e.style.setProperty('--gx', (Math.random()*80-40)+'px'); e.style.setProperty('--gy', (-40 - Math.random()*90)+'px');
    const d = 900 + Math.random()*900; e.style.setProperty('--d', d+'ms'); document.body.appendChild(e); setTimeout(() => e.remove(), d + 50);
  }
}
const DUR = 110;
function leaf(from, path) {
  const {x, y, cs} = center(from), yc = y - cs * .07, reach = path.length;
  const p = document.createElement('div'); p.className = 'leaf';
  p.style.left = x+'px'; p.style.top = yc+'px'; board.appendChild(p);
  const pts = segments(from, path);
  const frames = pts.map((q, k) => ({ transform: `translate(${q.x - x}px, ${q.y - y}px) rotate(${220 * k}deg)`, offset: k / (pts.length - 1) }));
  p.animate(frames, { duration: DUR * reach, easing: 'linear', fill: 'forwards' });
  path.forEach((q, k) => { if (G.mirrors.has(q)) setTimeout(() => { const m = G.mirrors.get(q).el; m.classList.remove('flash'); void m.offsetWidth; m.classList.add('flash'); ting2(); }, DUR * (k + 1)); });
  setTimeout(() => { p.style.opacity = '0'; }, DUR*reach); setTimeout(() => p.remove(), DUR*reach + 200);
}
const ting2 = () => { if (!AC) return; const t = AC.currentTime; [1, 2.76].forEach((m, i) => tone('sine', 1900 * m, 0, t, .5 - i * .2, .025 / (i + 1)).connect(VERB)); };
// 큰 잠꾸러기가 뒤척임: 한 번 견딘 뒤 보통 잠든 등불이 된다
function stir(q) {
  const S = G.sleep.get(q), el = S.el; el.classList.remove('big'); el.classList.add('stir');
  el.querySelector('.zz').textContent = '…'; setTimeout(() => { el.querySelector('.zz').textContent = 'z z'; el.classList.remove('stir'); }, 900);
  if (AC) { const t = AC.currentTime; tone('sine', 220, 180, t, .35, .12); noise(t, .2, 600, .15, 'lowpass'); } buzz(25);
}
function peel(pos, T) {
  T.el.classList.add('cracked'); T.el.classList.remove('hit'); void T.el.offsetWidth; T.el.classList.add('hit'); soft(); paperBurst(pos, 1);
}
function showCombo(n, final = false) {
  const c = $('combo'); if (!c || n < 5) return;
  c.textContent = '×' + n; c.classList.remove('out', 'bump'); c.classList.add('on'); void c.offsetWidth; c.classList.add('bump');
  if (final) setTimeout(() => c.classList.add('out'), 500);
}
function flashWarm(v) { const w = $('warm'); w.style.transition = 'none'; w.style.opacity = v; requestAnimationFrame(() => { w.style.transition = 'opacity .8s ease-out'; w.style.opacity = 0; }); }
function shake() { board.classList.remove('shake'); void board.offsetWidth; board.classList.add('shake'); }
async function tap(i) {
  if (!G || G.busy || G.over || !G.lan.has(i)) return;
  G.busy = true; G.used++; renderTaps();
  const L = G.lan.get(i); L.l--;
  if (L.l > 0) { peel(i, L); buzz(15); await sleep(300); }
  else {
    if (L.t === 3) { L.el.classList.add('lit'); fizz(); await sleep(260); }
    const woke = await chain(i); if (woke) return finish(false, true);
  }
  G.busy = false;
  if (G.lan.size === 0) return finish(true);
  if (G.used >= G.k) return finish(false);
}
const twinOf = p => { const L = G.lan.get(p); if (!L || L.t !== 4) return null; for (const [q, M] of G.lan) if (q !== p && M.t === 4 && M.p === L.p) return q; return null; };
// 연쇄가 터지는 동안 배경음을 잠깐 낮춘다(덕킹). 국악기 소리와 곡이 부딪히지 않게
let duckT = null;
function duck() {
  if (!AC || !MUS) return; const t = AC.currentTime;
  MUS.gain.cancelScheduledValues(t); MUS.gain.setTargetAtTime(DUCK_VOL, t, .05);
  clearTimeout(duckT); duckT = setTimeout(() => { if (AC) MUS.gain.setTargetAtTime(MUS_VOL, AC.currentTime, .6); }, 1400);
}
async function chain(start) {
  duck();
  const first = [start]; if (G.lan.get(start).t === 4) { const m = twinOf(start); if (m !== null) first.push(m); }
  const sched = new Map([[0, first]]), done = new Set(first);
  let w = 0, total = 0, woke = false;
  while (!woke && [...sched.keys()].some(k => k >= w)) {
    const wave = (sched.get(w) || []).filter(p => G.lan.has(p)); sched.delete(w);
    if (!wave.length) { await sleep(nextTickMs(DUR * 2 + 60)); w++; continue; }
    let finale = G.lan.size === wave.length;
    if (finale) { const keep = wave.map(p => [p, G.lan.get(p)]); wave.forEach(p => G.lan.delete(p));
      finale = !keep.some(([p, L]) => dirsFor(L.t).some(([dr,dc]) => { const t = trace(p, dr, dc, L.s); return t.sleeper && G.sleep.get(t.hit).hp <= 1; }));
      keep.forEach(([p, L]) => G.lan.set(p, L)); }
    if (finale) await sleep(220);
    total += wave.length;
    if (finale) { shake(); flashWarm(1); buzz(60); resolve(); if (total >= 8) goldDust(40); }
    else if (wave.length >= 3 || total >= 5) { shake(); flashWarm(Math.min(1, .35 + .12 * wave.length)); }
    if (!finale && total >= 12 && wave.length >= 2) goldDust(12);
    if (!finale) buzz(Math.min(40, 10 + wave.length * 6));
    let maxReach = 0; duck();
    wave.forEach((p, idx) => {
      const L = G.lan.get(p); G.lan.delete(p);
      const tr = dirsFor(L.t).map(([dr,dc]) => ({dr, dc, ...trace(p, dr, dc, L.s)}));
      L.el.classList.add(finale ? 'finale' : 'burst'); if (!finale) pop(L.s, w, idx * 0.025);
      paperBurst(p, L.s, finale);
      setTimeout(() => L.el.remove(), finale ? 520 : 170);
      for (const t of tr) {
        if (!t.reach) continue;
        leaf(p, t.path); maxReach = Math.max(maxReach, t.reach);
        if (t.hit === null) continue;
        if (t.sleeper) {
          const S = G.sleep.get(t.hit); S.hp--;
          if (S.hp > 0) { const q = t.hit; setTimeout(() => stir(q), DUR * t.reach); continue; }
          woke = true; const el = S.el;
          setTimeout(() => { el.querySelector('.zz').textContent = '!'; el.classList.add('woke'); yawn(); buzz(80); }, DUR * t.reach);
          continue;
        }
        const T = G.lan.get(t.hit); if (!T) continue;
        T.l--;
        if (T.l <= 0) {
          if (!done.has(t.hit)) {
            done.add(t.hit); const dw = w + (T.t === 3 ? 2 : 1);
            if (!sched.has(dw)) sched.set(dw, []); sched.get(dw).push(t.hit);
            if (T.t === 3) setTimeout(() => { T.el.classList.add('lit'); fizz(); }, DUR * t.reach);
            if (T.t === 4) { const m = twinOf(t.hit); if (m !== null && !done.has(m)) { done.add(m); G.lan.get(m).l = 0; sched.get(dw).push(m);
              const me = G.lan.get(m).el, te = T.el; setTimeout(() => { te.classList.add('call'); me.classList.add('call'); }, DUR * t.reach); } }
          }
        } else { const q = t.hit; setTimeout(() => peel(q, T), DUR * t.reach); }
      }
    });
    showCombo(total, finale);
    await sleep(finale ? DUR * Math.max(1, maxReach) + 600 : nextTickMs(DUR * Math.max(1, maxReach) + 40));
    w++;
  }
  if (!woke) showCombo(total, true);
  return woke;
}
function rain() {
  // 판을 깨면 제미나이 색종이(오방색 한지 조각 12가지, assets.md 10번)가 내려온다. 무늬는 그림, 크기·회전·흔들림은 여기서
  for (let k = 0; k < 64; k++) {
    const e = document.createElement('div'); e.className = 'rain';
    const w = 14 + Math.random() * 16; e.style.width = w + 'px'; e.style.height = w + 'px';
    e.style.backgroundImage = `var(--img-cf${k % 12})`;
    e.style.left = Math.random() * 100 + 'vw'; e.style.top = (-8 - Math.random() * 20) + 'vh';
    e.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px'); e.style.setProperty('--rr', (Math.random() * 720 - 360) + 'deg');
    e.style.setProperty('--sw', (10 + Math.random() * 18) * (Math.random() < .5 ? -1 : 1) + 'px');
    e.style.animationDuration = (3.2 + Math.random() * 2.6) + 's'; e.style.animationDelay = (Math.random() * 1.6) + 's';
    document.body.appendChild(e); setTimeout(() => e.remove(), 7800);
  }
}
async function flyToStar(i) {
  const st = $('sky').querySelector(`.st[data-i="${i}"]`); if (!st) return;
  const b = board.getBoundingClientRect(), s = st.getBoundingClientRect();
  const f = document.createElement('div'); f.className = 'flyer';
  const x0 = b.left + b.width / 2, y0 = b.top + b.height / 2;
  f.style.left = x0 + 'px'; f.style.top = y0 + 'px'; document.body.appendChild(f);
  await sleep(20);
  f.style.transform = `translate(${s.left + s.width/2 - x0}px, ${s.top + s.height/2 - y0}px)`;
  await sleep(760); f.style.opacity = '0'; setTimeout(() => f.remove(), 250);
  lightStar(i);
}
async function finish(won, woke = false) {
  G.over = true;
  const ov = $('over'), idx = G.idx, ch = chOf(idx), si = idx % 10;
  if (won) {
    const first = !save.done[idx];
    save.done[idx] = true; if (idx + 1 > save.unlocked) save.unlocked = idx + 1; persist();
    await sleep(300);
    if (first) { renderSky(idx, si); await flyToStar(si); } else await sleep(300);
    const chapterDone = CH[ch].stars.every((_, i) => save.done[ch * 10 + i]);
    await sleep(chapterDone && first ? 400 : 500);
    samulClear();
    if (chapterDone && first) { $('sky').classList.add('complete'); rain(); await sleep(900); }
    else rain();
    const last = idx + 1 >= LEVELS.length;
    $('ovT').textContent = chapterDone && first ? CH[ch].sky : ['밤이 환해졌어요', '다 피었어요', '한 송이도 남김없이', '고요해졌어요'][idx % 4];
    $('ovP').textContent = chapterDone && first ? `${CH[ch].name}의 별자리가 완성됐어요.` : last ? `준비된 ${LEVELS.length}판을 전부 끝냈어요.` : '다음 밤으로.';
    $('ovA').textContent = last ? '처음부터' : '다음';
    $('ovA').onclick = () => { ov.classList.remove('show'); load(last ? 0 : idx + 1); };
    $('ovB').textContent = '이 판 다시'; $('ovB').onclick = () => { ov.classList.remove('show'); load(idx); };
  } else {
    await sleep(650);
    if (!woke) sad();
    $('ovT').textContent = woke ? '깨워버렸어요' : '등불이 남았어요';
    $('ovP').textContent = woke ? '잠든 등불에는 불꽃이 닿으면 안 돼요.' : `${G.lan.size}개가 아직 켜져 있어요.`;
    $('ovA').textContent = '다시'; $('ovA').onclick = () => { ov.classList.remove('show'); load(idx); };
    $('ovB').textContent = '규칙 다시 보기'; $('ovB').onclick = () => { ov.classList.remove('show'); openGlossary(); };
  }
  ov.classList.add('show');
}
$('retry').addEventListener('click', () => { audio(); if (G) load(G.idx); });
$('prev').addEventListener('click', () => { if (G && G.idx > 0) load(G.idx - 1); });
$('next').addEventListener('click', () => { if (G && G.idx + 1 < LEVELS.length) load(G.idx + 1); });
$('help').addEventListener('click', () => { audio(); openGlossary(); });
document.querySelectorAll('.snd').forEach(b => { b.classList.toggle('off', !soundOn()); b.addEventListener('click', () => { const on = !soundOn(); setSound(on); if (on) click(); }); });
document.addEventListener('click', e => { if (e.target.closest('button') && !e.target.closest('.snd')) click(); }, true);
// ---------- title screen ----------
const TITLE = $('title'), MAP = $('map');
const TINTS = [['#FFC98A','#F08A4E','#C4452A','255,150,80','#3A2418'], ['#B4F0E0','#3FB5A6','#1C7A70','80,220,200','#16302C'], ['#F2C8F0','#B45FB0','#6E2C74','220,120,220','#2E1832'],
               ['#FFE7A6','#F2B53C','#B9741A','255,200,90','#3A2810'], ['#FFD6DE','#F29AAE','#C0566E','255,160,180','#3A1C24']];
function tint(el, ch) {
  const t = TINTS[ch]; if (!t) return;
  ['--l-light','--l-mid','--l-dark','--l-glow','--frame'].forEach((k, i) => el.style.setProperty(k, t[i]));
  el.style.setProperty('--img-lan', `var(--img-${['orange','teal','purple','gold','pink'][ch]})`);
}
const chUnlocked = ch => ch * 10 < LEVELS.length && ch * 10 <= save.unlocked;
function spawnFloater(first) {
  const f = document.createElement('div'); f.className = 'fl';
  const depth = Math.random(), sc = .5 + depth * .75, dur = 30 - depth * 12 + Math.random() * 6;
  f.style.left = (4 + Math.random() * 88) + '%';
  f.style.setProperty('--sc', sc); f.style.setProperty('--dur', dur + 's');
  f.style.animationDelay = first ? (-Math.random() * dur) + 's' : '0s';
  f.style.zIndex = Math.round(depth * 10); f.style.opacity = (.45 + depth * .55).toFixed(2);
  const opened = [0,1,2,3,4].filter(chUnlocked), ch = opened[Math.floor(Math.random() * opened.length)] || 0;
  tint(f, Math.random() < .5 ? 0 : ch);
  f.innerHTML = lanHTML([1,2,2,3][Math.floor(Math.random() * 4)]);
  f.firstChild.style.animationDelay = (-Math.random() * 3.4) + 's';
  f.addEventListener('pointerdown', e => { e.stopPropagation(); audio(); floaterPop(f, sc); });
  f.addEventListener('animationend', e => { if (e.target === f) { f.remove(); spawnFloater(false); } });
  $('floats').appendChild(f);
}
function floaterPop(f, sc) {
  if (f.classList.contains('gone')) return; f.classList.add('gone');
  const r = f.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height * .4, cs = r.width;
  const cs2 = getComputedStyle(f), cols = ['--l-light','--l-mid','--l-dark','--l-scrap'].map(k => cs2.getPropertyValue(k).trim() || '#FFC98A');
  const g = document.createElement('div'); g.className = 'glow tglow'; g.style.width = g.style.height = cs * 2.2 + 'px';
  g.style.left = x + 'px'; g.style.top = y + 'px'; g.style.setProperty('--l-glow', cs2.getPropertyValue('--l-glow').trim());
  TITLE.appendChild(g); setTimeout(() => g.remove(), 1250);
  for (let k = 0; k < 14; k++) {
    const e = document.createElement('div'); e.className = 'scrap tscrap';
    const w = (7 + Math.random() * 8) * sc, h = w;
    e.style.width = w + 'px'; e.style.height = h + 'px'; e.style.left = (x - w/2) + 'px'; e.style.top = (y - h/2) + 'px'; e.style.backgroundImage = `var(--img-cf${k % 12})`;
    const a = Math.random() * Math.PI * 2, d = cs * (.4 + Math.random() * .7);
    e.style.setProperty('--x0', Math.cos(a)*d+'px'); e.style.setProperty('--y0', (Math.sin(a)*d - cs*.2)+'px');
    e.style.setProperty('--sw', (10 + Math.random()*14) * (Math.random()<.5?-1:1) + 'px'); e.style.setProperty('--fall', cs * (1.2 + Math.random()) + 'px');
    e.style.setProperty('--r0', (Math.random()*180-90)+'deg'); e.style.setProperty('--r1', (Math.random()*360)+'deg'); e.style.setProperty('--r2', (Math.random()*540)+'deg');
    const dur = 1100 + Math.random() * 600; e.style.setProperty('--d', dur + 'ms');
    TITLE.appendChild(e); setTimeout(() => e.remove(), dur + 50);
  }
  pop(sc > .9 ? 3 : sc > .7 ? 2 : 1, Math.floor(Math.random() * 5)); buzz(12);
  f.firstChild.classList.add('burst');
  setTimeout(() => { f.remove(); spawnFloater(false); }, 200);
}
(() => { for (let i = 0; i < 13; i++) spawnFloater(true);
  const st = $('tstars'); for (let i = 0; i < 46; i++) { const d = document.createElement('i'), z = Math.random() < .15 ? 2.2 : 1.2;
    d.style.width = d.style.height = z + 'px'; d.style.left = Math.random()*100 + '%'; d.style.top = Math.random()*70 + '%';
    d.style.opacity = (.2 + Math.random() * .6).toFixed(2); d.style.setProperty('--t', (2.5 + Math.random() * 4) + 's'); d.style.animationDelay = (-Math.random()*5)+'s'; st.appendChild(d); } })();

function showTitle() {
  G = null; board.innerHTML = ''; $('over').classList.remove('show');
  document.documentElement.dataset.ch = 0; if (AC) setScene(0);
  const fresh = !save.unlocked && !save.seen.intro;
  const cur = Math.min(save.unlocked, LEVELS.length - 1);
  $('tPlay').innerHTML = fresh ? '시작하기' : `이어하기 <small>${cur + 1}단계</small>`;
  $('tMap').hidden = fresh;
  MAP.classList.remove('show'); TITLE.classList.remove('leave'); TITLE.classList.add('show');
}
function leaveTitle(idx) {
  audio(); TITLE.classList.add('leave'); MAP.classList.remove('show');
  setTimeout(() => { TITLE.classList.remove('show', 'leave'); load(idx); }, 480);
}
$('tPlay').addEventListener('click', () => leaveTitle(Math.min(save.unlocked, LEVELS.length - 1)));

// ---------- chapter map ----------
const SPOTS = [[-2,118],[42,88],[-2,58],[42,28],[20,-2]];   // 왼쪽 아래 1장에서 지그재그로 올라가 5장
let mapSel = 0;
function renderMap() {
  const sel = mapSel;
  let s = '<svg viewBox="0 0 100 156" aria-hidden="true"><defs><filter id="mglow" x="-2" y="-2" width="5" height="5"><feGaussianBlur stdDeviation="0.9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
  const P = (ch, [x, y]) => [SPOTS[ch][0] + x * .6, SPOTS[ch][1] + 6 + y * .6];
  let path = 'M'; CH.forEach((_, ch) => { const [x, y] = P(ch, [50, 22]); path += `${x.toFixed(1)} ${y.toFixed(1)} ${ch < 4 ? 'L' : ''}`; });
  s += `<path class="trail" d="${path}"/>`;
  CH.forEach((C, ch) => {
    const open = chUnlocked(ch), lit = i => !!save.done[ch * 10 + i], cnt = C.stars.filter((_, i) => lit(i)).length;
    s += `<g class="grp${open ? ' open' : ''}${ch === sel ? ' sel' : ''}${cnt === 10 ? ' full' : ''}" data-ch="${ch}">`;
    const [bx, by] = P(ch, [0, 0]); s += `<rect class="hit" x="${bx}" y="${by - 4}" width="60" height="34" rx="4"/>`;
    C.edges.forEach(([a, b]) => { const [x1, y1] = P(ch, C.stars[a]), [x2, y2] = P(ch, C.stars[b]);
      s += `<line class="me${lit(a) && lit(b) ? ' on' : ''}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`; });
    C.stars.forEach((st, i) => { const [x, y] = P(ch, st); s += `<circle class="ms${lit(i) ? ' on' : ''}" cx="${x}" cy="${y}" r="${lit(i) ? .95 : .7}"/>`; });
    const [lx, ly] = P(ch, [50, 44]);
    s += `<text class="ml" x="${lx}" y="${ly + 3.6}">${open || cnt ? C.sky : '· · ·'}</text></g>`;
  });
  s += '</svg>';
  $('mapSky').innerHTML = s;
  $('mapSky').querySelectorAll('.grp').forEach(g => g.addEventListener('click', () => {
    const ch = +g.dataset.ch; audio(); if (!chUnlocked(ch)) { soft(); g.classList.remove('nope'); void g.getBoundingClientRect(); g.classList.add('nope'); return; }
    mapSel = ch; ting(); renderMap(); }));
  const C = CH[sel], cnt = C.stars.filter((_, i) => save.done[sel * 10 + i]).length;
  let p = `<div class="mk">${sel + 1}장 · ${C.name}</div><div class="mn">${C.sky} <span>${cnt} / 10</span></div><div class="stages">`;
  for (let i = 0; i < 10; i++) {
    const idx = sel * 10 + i, exists = idx < LEVELS.length, done = !!save.done[idx], can = exists && idx <= save.unlocked;
    p += `<button class="sg${done ? ' done' : ''}${can && !done ? ' now' : ''}" data-i="${idx}" ${can ? '' : 'disabled'} aria-label="${idx + 1}단계">${idx + 1}</button>`;
  }
  p += '</div>';
  $('mapPanel').innerHTML = p;
  $('mapPanel').querySelectorAll('.sg').forEach(b => b.addEventListener('click', () => leaveTitle(+b.dataset.i)));
}
$('tMap').addEventListener('click', () => { audio(); mapSel = chOf(Math.min(save.unlocked, LEVELS.length - 1)); renderMap(); MAP.classList.add('show'); });
$('mapBack').addEventListener('click', () => { audio(); MAP.classList.remove('show'); });
$('home').addEventListener('click', () => { audio(); showTitle(); });
showTitle();
window.__lf = { get AC() { return AC; }, get MASTER() { return MASTER; }, get MUS() { return MUS; }, get AMB() { return AMB; }, get SCENE() { return SCENE; }, get synthOn() { return synthOn; }, setScene, pop, resolve, samulClear, nextTickMs, get BEATS() { return BEATS; } };   // 검사용
})();
