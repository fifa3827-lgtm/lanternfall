// 구역 나누기 도우미: node regions.js n kind → 세 구역 JSON  (kind: rows|cols|diag)
module.exports = function regions(n, kind, cnts, types = [[], [], []], pids) {
  const cells = k => [...Array(n * n).keys()].map(i => [Math.floor(i / n), i % n]).filter(([r, c]) => k(r, c));
  const b1 = Math.floor(n / 3), b2 = Math.ceil(2 * n / 3);
  let R;
  if (kind === 'rows') R = [cells((r) => r < b1 + 1), cells((r) => r >= b1 && r < b2 + 1), cells((r) => r >= b2 - 1)];
  else if (kind === 'cols') R = [cells((r, c) => c < b1 + 1), cells((r, c) => c >= b1 && c < b2 + 1), cells((r, c) => c >= b2 - 1)];
  else R = [cells((r, c) => r + c < n - 1), cells((r, c) => Math.abs(r + c - (n - 1)) <= 1), cells((r, c) => r + c > n - 1)];
  return R.map((cs, i) => ({ cells: cs, cnt: cnts[i], types: types[i], pid: pids ? pids[i] : 0 }));
};
