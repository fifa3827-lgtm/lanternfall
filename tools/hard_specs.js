// 시험판 17 난이도 곡선(14판 것은 hard_specs_v14.js): 4~50번의 생성 조건. node hard_specs.js → hard/ 에 판을 뽑는다(2개씩 나란히).
// 원칙: 한 번 판은 1~3번 연습만. 4번부터 두 번, 9번부터 세 번 판이 섞인다. 6번부터 7×7, 27번부터 8×8.
// near: 등불 1~2개만 남기는 「아깝게 안 되는」 묶음이 이만큼은 있어야 · spread: 첫 탭으로 그럴듯한 등불이 이만큼은
const regions = require('./regions.js');
const M = (n, cnt, k, o = {}) => Object.assign({ n, cnt, k, maxsize: 3, budget: 150, near: 3, spread: 3 }, o);
const Q = (n, cnts, o = {}, types, pids) => Object.assign({ n, cnt: cnts.reduce((a, b) => a + b), k: 4, maxsize: 3, budget: 900, near: 4, spread: 4, regions: regions(n, 'quad', cnts, types || [[], [], [], []], pids) }, o);   // 네 번 판
const Cp = (n, kind, cnts, o = {}, types, pids) => Object.assign({ n, cnt: cnts.reduce((a, b) => a + b), k: 3, maxsize: 3, budget: 420, near: 3, spread: 3, regions: regions(n, kind, cnts, types, pids) }, o);
const S = {
  // 시험판 17 「그래도 쉽다」: 두 번 판은 장마다 첫 판(새 요소 소개)만, 나머지는 세 번, 장 끝과 5장 뒤쪽은 네 번. 21번부터 8×8.
  // near(아깝게 안 되는 묶음)·spread(그럴듯한 첫 탭)도 올림.
  // 1장 첫 밤
  4: M(6, 10, 2, { sleep: 1, near: 4, spread: 3 }),
  5: M(6, 11, 2, { rocks: 2, sleep: 1, near: 4, spread: 3 }),
  6: M(7, 13, 2, { rocks: 2, sleep: 1, near: 5, spread: 4 }),
  7: M(7, 13, 2, { rocks: 2, sleep: 1, layers: 2, near: 5, spread: 4 }),
  8: Cp(7, 'rows', [5, 4, 5], { rocks: 2, near: 4, spread: 4 }),
  9: Cp(7, 'cols', [5, 5, 4], { rocks: 3, near: 4, spread: 4 }),
  10: Cp(7, 'diag', [5, 5, 5], { rocks: 2, near: 4, spread: 4 }),
  // 2장 바람 부는 밤 — 금띠·심지
  11: M(7, 13, 2, { dir: 2, sleep: 1, near: 5, spread: 4 }),
  12: Cp(7, 'rows', [5, 5, 5], { rocks: 2, near: 4, spread: 4 }, [[1], [], [2]]),
  13: Cp(7, 'cols', [5, 5, 5], { rocks: 2, near: 4, spread: 4 }, [[2], [1], []]),
  14: M(7, 13, 2, { fuse: 2, sleep: 1, near: 5, spread: 4 }),
  15: Cp(7, 'diag', [5, 5, 5], { rocks: 2, near: 4, spread: 4 }, [[3], [1], [3]]),
  16: Cp(8, 'rows', [6, 5, 5], { rocks: 2, near: 4, spread: 4 }, [[1], [3], [2]]),
  17: Cp(8, 'cols', [6, 5, 5], { rocks: 3, near: 4, spread: 4 }, [[3], [3], [1]]),
  18: Cp(8, 'diag', [6, 5, 6], { rocks: 2, near: 4, spread: 4 }, [[1, 3], [2], [3]]),
  19: Cp(8, 'rows', [6, 6, 5], { rocks: 3, near: 5, spread: 4 }, [[2], [3], [1]]),
  20: Q(8, [5, 4, 4, 5], { rocks: 2 }, [[1], [3], [2], []]),
  // 3장 깊은 밤 — 큰 잠꾸러기·거울
  21: M(8, 14, 2, { big: 1, rocks: 1, near: 5, spread: 4 }),
  22: Cp(8, 'rows', [5, 5, 5], { big: 1, near: 4, spread: 4 }, [[1], [], [3]]),
  23: Cp(8, 'cols', [6, 5, 5], { big: 1, rocks: 2, near: 4, spread: 4 }),
  24: Cp(8, 'diag', [6, 5, 5], { big: 1, near: 4, spread: 4 }, [[3], [], [3]]),
  25: M(8, 14, 2, { mirrors: 1, sleep: 1, near: 5, spread: 4 }),
  26: Cp(8, 'rows', [5, 5, 5], { mirrors: 2, near: 4, spread: 4 }),
  27: Cp(8, 'cols', [6, 5, 5], { mirrors: 2, big: 1, near: 4, spread: 4 }),
  28: Cp(8, 'diag', [6, 5, 5], { mirrors: 2, rocks: 2, near: 4, spread: 4 }, [[3], [1], []]),
  29: Cp(8, 'rows', [6, 6, 5], { mirrors: 3, rocks: 2, near: 5, spread: 4 }),
  30: Q(8, [5, 5, 4, 5], { mirrors: 2, big: 1 }),
  // 4장 축제의 밤 — 쌍둥이·별꽃
  31: M(8, 14, 2, { twin: 1, sleep: 1, rocks: 1, near: 5, spread: 4 }),
  32: Cp(8, 'rows', [5, 5, 5], { twin: 1, rocks: 2, near: 4, spread: 4 }, [[4], [4], []], [0, 0, 0]),
  33: Cp(8, 'cols', [6, 5, 5], { twin: 1, mirrors: 1, near: 4, spread: 4 }, [[4], [4], []], [0, 0, 0]),
  34: Cp(8, 'diag', [6, 5, 5], { twin: 1, near: 4, spread: 4 }, [[4], [3], [4]], [0, 0, 0]),
  35: M(8, 14, 2, { star: 1, sleep: 1, rocks: 1, near: 5, spread: 4 }),
  36: Cp(8, 'rows', [5, 5, 5], { star: 1, mirrors: 1, near: 4, spread: 4 }, [[5], [], []]),
  37: Cp(8, 'cols', [6, 5, 5], { star: 1, twin: 1, near: 4, spread: 4 }, [[5], [4], [4]], [0, 0, 0]),
  38: Cp(8, 'diag', [6, 5, 6], { star: 1, rocks: 2, near: 4, spread: 4 }, [[5], [], [5]]),
  39: Cp(8, 'rows', [6, 6, 5], { twin: 1, star: 1, mirrors: 2, near: 5, spread: 4 }, [[4], [4], [5]], [0, 0, 0]),
  40: Q(8, [5, 5, 5, 5], { rocks: 2, big: 1, star: 1, twin: 1 }, [[5], [4], [4], []], [0, 0, 0, 0]),
  // 5장 새벽 — 총정리
  41: Cp(8, 'rows', [6, 5, 5], { mirrors: 2, twin: 1, near: 5, spread: 4 }, [[4], [4], []], [0, 0, 0]),
  42: Cp(8, 'cols', [6, 5, 6], { big: 1, star: 1, near: 5, spread: 4 }, [[3], [1], [5]]),
  43: Cp(8, 'diag', [6, 6, 5], { rocks: 2, mirrors: 1, star: 1, near: 5, spread: 4 }, [[2], [5], [3]]),
  44: Cp(8, 'rows', [6, 6, 6], { mirrors: 3, rocks: 2, near: 5, spread: 4 }),
  45: Cp(8, 'cols', [6, 6, 6], { twin: 1, star: 1, near: 5, spread: 4 }, [[4], [4], [5]], [0, 0, 0]),
  46: Q(8, [5, 5, 5, 5], { mirrors: 2, rocks: 2 }),
  47: Q(8, [5, 5, 5, 5], { rocks: 2, star: 1 }, [[3], [5], [], [1]]),
  48: Q(8, [5, 5, 5, 5], { mirrors: 1, rocks: 2, twin: 1 }, [[4], [4], [2], []], [0, 0, 0, 0]),
  49: Q(8, [6, 5, 5, 5], { mirrors: 2, big: 1 }),
  50: Q(8, [6, 5, 5, 6], { mirrors: 2, rocks: 2, twin: 1, star: 1 }, [[4], [4], [5], [3]], [0, 0, 0, 0]),
};
module.exports = S;
if (require.main === module) {
  const { spawn } = require('child_process'); const fs = require('fs');
  const only = process.argv.slice(2).map(Number);
  let queue = Object.keys(S).map(Number).filter(i => !only.length || only.includes(i)).filter(i => !fs.existsSync(`hard/${String(i).padStart(2, '0')}.json`));
  queue.sort((a, b) => (S[b].k - S[a].k));   // 오래 걸리는 네 번·세 번 판부터
  let running = 0; const t0 = Date.now();
  const next = () => {
    while (running < 2 && queue.length) {
      const i = queue.shift(); running++;
      const p = spawn('node', ['gen4.js', String(i), JSON.stringify(S[i])]);
      p.stdout.on('data', d => process.stdout.write(((Date.now() - t0) / 1000 | 0) + 's  ' + d));
      p.on('close', () => { running--; next(); });
    }
  };
  next();
}
