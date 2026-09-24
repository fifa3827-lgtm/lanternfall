// 시험판 14 난이도 곡선: 4~50번의 생성 조건. node hard_specs.js → hard/ 에 판을 뽑는다(2개씩 나란히).
// 원칙: 한 번 판은 1~3번 연습만. 4번부터 두 번, 9번부터 세 번 판이 섞인다. 6번부터 7×7, 27번부터 8×8.
// near: 등불 1~2개만 남기는 「아깝게 안 되는」 묶음이 이만큼은 있어야 · spread: 첫 탭으로 그럴듯한 등불이 이만큼은
const regions = require('./regions.js');
const M = (n, cnt, k, o = {}) => Object.assign({ n, cnt, k, maxsize: 3, budget: 150, near: 3, spread: 3 }, o);
const Cp = (n, kind, cnts, o = {}, types, pids) => Object.assign({ n, cnt: cnts.reduce((a, b) => a + b), k: 3, maxsize: 3, budget: 420, near: 3, spread: 3, regions: regions(n, kind, cnts, types, pids) }, o);
const S = {
  // 1장 첫 밤 — 잠든 등불·바위·두 번·겉종이
  4: M(6, 10, 2, { sleep: 1 }),
  5: M(6, 11, 2, { rocks: 2, sleep: 1 }),
  6: M(7, 12, 2, { rocks: 2, sleep: 1 }),
  7: M(7, 12, 2, { rocks: 2, sleep: 1, layers: 2 }),
  8: M(7, 13, 2, { rocks: 3, sleep: 2, layers: 1 }),
  9: Cp(7, 'rows', [5, 4, 4], { rocks: 2 }),
  10: Cp(7, 'cols', [5, 4, 5], { rocks: 3 }),
  // 2장 바람 부는 밤 — 금띠·심지·세 번
  11: M(7, 12, 2, { dir: 2, sleep: 1 }),
  12: M(7, 12, 2, { dir: 2, rocks: 2, sleep: 1, layers: 1 }),
  13: M(7, 13, 2, { dir: 2, rocks: 2, sleep: 2 }),
  14: M(7, 12, 2, { fuse: 2, sleep: 1 }),
  15: M(7, 13, 2, { fuse: 2, dir: 1, rocks: 2, sleep: 1 }),
  16: Cp(7, 'diag', [5, 5, 4], { rocks: 2 }, [[1], [3], [2]]),
  17: M(7, 13, 2, { fuse: 2, dir: 2, rocks: 2, sleep: 1, layers: 2, near: 4 }),
  18: Cp(7, 'rows', [5, 4, 5], { rocks: 3 }, [[3], [], [1]]),
  19: M(7, 14, 2, { dir: 2, fuse: 1, rocks: 3, sleep: 2, near: 4 }),
  20: Cp(7, 'cols', [5, 5, 5], { rocks: 2 }, [[1], [3], [2]]),
  // 3장 깊은 밤 — 큰 잠꾸러기·거울
  21: M(7, 12, 2, { big: 1, rocks: 1 }),
  22: M(7, 13, 2, { big: 1, dir: 2, sleep: 1 }),
  23: M(7, 13, 2, { big: 1, rocks: 2, layers: 1, sleep: 1 }),
  24: M(7, 13, 2, { fuse: 2, big: 1, sleep: 1 }),
  25: M(7, 12, 2, { mirrors: 1, sleep: 1 }),
  26: M(7, 13, 2, { mirrors: 2, dir: 2, sleep: 1 }),
  27: M(8, 14, 2, { mirrors: 2, big: 1, sleep: 1 }),
  28: M(8, 14, 2, { mirrors: 2, fuse: 2, rocks: 2, sleep: 1 }),
  29: Cp(8, 'rows', [5, 5, 5], { mirrors: 2, rocks: 2 }),
  30: Cp(8, 'diag', [5, 5, 5], { mirrors: 2, big: 1 }),
  // 4장 축제의 밤 — 쌍둥이·별꽃
  31: M(7, 12, 2, { twin: 1, sleep: 1, rocks: 1 }),
  32: M(7, 13, 2, { twin: 1, dir: 2, sleep: 1 }),
  33: M(8, 14, 2, { twin: 2, rocks: 2, sleep: 1 }),
  34: M(8, 14, 2, { twin: 1, fuse: 2, sleep: 1, mirrors: 1 }),
  35: M(7, 12, 2, { star: 1, sleep: 1, rocks: 1 }),
  36: M(8, 13, 2, { star: 1, sleep: 1, mirrors: 1 }),
  37: M(8, 14, 2, { star: 1, twin: 1, sleep: 1 }),
  38: M(8, 14, 2, { star: 2, rocks: 2, layers: 1, sleep: 1 }),
  39: Cp(8, 'cols', [5, 5, 5], { twin: 1, star: 1 }, [[4], [4], [5]], [0, 0, 0]),
  40: Cp(8, 'rows', [6, 5, 5], { rocks: 2, big: 1, star: 1, twin: 1 }, [[5], [4, 4], []], [0, 0, 0]),
  // 5장 새벽 — 총정리, 전부 8×8
  41: M(8, 14, 2, { twin: 1, mirrors: 2, sleep: 1 }),
  42: M(8, 14, 2, { fuse: 2, dir: 2, big: 1, sleep: 1 }),
  43: M(8, 15, 2, { star: 1, dir: 2, rocks: 2, sleep: 2, near: 4 }),
  44: M(8, 15, 2, { mirrors: 3, sleep: 2, near: 4 }),
  45: M(8, 15, 2, { twin: 2, layers: 2, sleep: 1, near: 4 }),
  46: Cp(8, 'diag', [6, 5, 5], { mirrors: 2, rocks: 2 }),
  47: Cp(8, 'rows', [5, 6, 5], { rocks: 2, star: 1 }, [[3], [5], []]),
  48: Cp(8, 'cols', [6, 5, 5], { rocks: 2, twin: 1 }, [[1], [4, 4], [2]], [0, 0, 0]),
  49: Cp(8, 'rows', [6, 5, 6], { mirrors: 2, big: 1 }),
  50: Cp(8, 'diag', [6, 6, 6], { mirrors: 2, rocks: 2, twin: 1, star: 1 }, [[4], [4], [5]], [0, 0, 0]),
};
module.exports = S;
if (require.main === module) {
  const { spawn } = require('child_process'); const fs = require('fs');
  const only = process.argv.slice(2).map(Number);
  let queue = Object.keys(S).map(Number).filter(i => !only.length || only.includes(i)).filter(i => !fs.existsSync(`hard/${String(i).padStart(2, '0')}.json`));
  queue.sort((a, b) => (S[b].regions ? 1 : 0) - (S[a].regions ? 1 : 0));   // 오래 걸리는 합성 판부터
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
