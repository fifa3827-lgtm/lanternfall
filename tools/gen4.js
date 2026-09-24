// 어려운 판 생성기 (시험판 14). sim.py / gen3.py / gen4.py 를 그대로 옮긴 노드 판 — 파이썬보다 30배쯤 빨라서 2코어로도 50판을 몇 분에 뽑는다.
// node gen4.js <단계번호> '<spec json>' [seed]   → hard/NN.json
// spec: n cnt k rocks layers dir fuse twin star big sleep mirrors maxsize budget(초) near spread regions(세 번 판 합성)
'use strict';
const fs = require('fs');

// ---------- 난수 (씨앗 고정) ----------
let seed = 1;
function rnd() { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }   // mulberry32
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const choice = a => a[Math.floor(rnd() * a.length)];

// ---------- 규칙 (sim.py와 한 글자도 어긋나면 안 된다) ----------
// 칸은 r*32+c 정수. lan: Map(pos -> [size, layers, type, pair]) · sleep: Map(pos -> hp) · mirrors: Map(pos -> kind) · rocks: Set
const N = 32, K = (r, c) => r * N + c, R = p => p >> 5, C = p => p & 31;
const DIRS = [[1,0],[-1,0],[0,1],[0,-1]], DIAG = [[1,1],[1,-1],[-1,1],[-1,-1]];
const dirsFor = t => t === 1 ? [[0,1],[0,-1]] : t === 2 ? [[1,0],[-1,0]] : t === 5 ? DIRS.concat(DIAG) : DIRS;
const bend = (kind, dr, dc) => kind === 0 ? [-dc, -dr] : [dc, dr];
function trace(n, L, rocks, SL, M, p, dr, dc, s, path) {
  let r = R(p), c = C(p);
  for (let i = 0; i < s; i++) {
    r += dr; c += dc; if (r < 0 || r >= n || c < 0 || c >= n) return [null, false];
    const q = K(r, c); if (rocks.has(q)) return [null, false];
    if (path) path.push(q);
    if (M.has(q)) { [dr, dc] = bend(M.get(q), dr, dc); continue; }
    if (SL.has(q)) return [q, true];
    if (L.has(q)) return [q, false];
  }
  return [null, false];
}
function twinOf(L, p) { const v = L.get(p); if (!v || v.length < 4) return null; for (const [q, u] of L) if (q !== p && u.length >= 4 && u[2] === 4 && u[3] === v[3]) return q; return null; }
// 결과: {rem, per, cov}  rem -1 = 잠든 등불을 깨움(실패)
function run(n, lan, rocks, sleep, taps, mirrors, detail) {
  const L = new Map(); for (const [k, v] of lan) L.set(k, v.slice());
  const SL = new Map(sleep); const M = mirrors; const cov = detail ? new Set() : null; const per = [];
  for (const t of taps) {
    if (!L.has(t)) { per.push(-1); continue; }
    L.get(t)[1]--; if (L.get(t)[1] > 0) { per.push(0); continue; }
    const first = [t]; if (L.get(t)[2] === 4) { const m = twinOf(L, t); if (m !== null) first.push(m); }
    const sched = new Map([[0, first]]); const done = new Set(first); let w = 0, cnt = 0;
    while (true) {
      let any = false; for (const k of sched.keys()) if (k >= w) { any = true; break; } if (!any) break;
      const wave = (sched.get(w) || []).filter(p => L.has(p)); sched.delete(w);
      for (const p of wave) {
        const v = L.get(p); L.delete(p); cnt++;
        for (const [dr, dc] of dirsFor(v[2])) {
          const path = detail ? [] : null; const [hit, sl] = trace(n, L, rocks, SL, M, p, dr, dc, v[0], path);
          if (detail) for (const q of path) if (!M.has(q)) cov.add(q);
          if (hit === null) continue;
          if (sl) { SL.set(hit, SL.get(hit) - 1); if (SL.get(hit) <= 0) return { rem: -1, per, cov }; continue; }
          const h = L.get(hit); h[1]--;
          if (h[1] <= 0 && !done.has(hit)) {
            done.add(hit); const dw = w + (h[2] === 3 ? 2 : 1); if (!sched.has(dw)) sched.set(dw, []); sched.get(dw).push(hit);
            if (h[2] === 4) { const m = twinOf(L, hit); if (m !== null && !done.has(m)) { done.add(m); L.get(m)[1] = 0; sched.get(dw).push(m); } }
          }
        }
      }
      w++;
    }
    per.push(cnt);
  }
  return { rem: L.size, per, cov };
}
function* seqs(keys, k) { if (k === 1) { for (const t of keys) yield [t]; return; } const idx = new Array(k).fill(0); const m = keys.length; while (true) { yield idx.map(i => keys[i]); let j = k - 1; while (j >= 0 && ++idx[j] === m) { idx[j] = 0; j--; } if (j < 0) return; } }
function solutions(n, lan, rocks, sleep, k, mir) { const out = []; const keys = [...lan.keys()]; for (const s of seqs(keys, k)) if (run(n, lan, rocks, sleep, s, mir).rem === 0) out.push(s); return out; }
const setKey = s => s.slice().sort((a, b) => a - b).join(',');
const unique = sols => new Set(sols.map(setKey)).size === 1;

// ---------- gen3 ----------
function build(n, S) {
  const cells = shuffle([...Array(n * n).keys()].map(i => K(Math.floor(i / n), i % n)));
  const rocks = new Set(cells.slice(0, S.rocks || 0)); let i = rocks.size;
  const mirrors = new Map(cells.slice(i, i + (S.mirrors || 0)).map(p => [p, ri(0, 1)])); i += mirrors.size;
  const rest = cells.slice(i), cnt = S.cnt;
  const lan = new Map(rest.slice(0, cnt).map(p => [p, [ri(1, S.maxsize || 3), 1, 0]]));
  const ks = shuffle([...lan.keys()]); let j = 0;
  for (let a = 0; a < (S.layers || 0); a++) lan.get(ks[j++])[1] = 2;
  for (let a = 0; a < (S.dir || 0); a++) { const v = lan.get(ks[j++]); v[2] = choice([1, 2]); v[0] = Math.max(v[0], 2); }
  for (let a = 0; a < (S.fuse || 0); a++) lan.get(ks[j++])[2] = 3;
  for (let pid = 0; pid < (S.twin || 0); pid++) for (let a = 0; a < 2; a++) { const v = lan.get(ks[j]); lan.set(ks[j], [v[0], 1, 4, pid]); j++; }
  for (let a = 0; a < (S.star || 0); a++) { const v = lan.get(ks[j++]); v[2] = 5; v[0] = Math.max(v[0], 2); }
  return [lan, rocks, mirrors];
}
function goodTaps(n, lan, rocks, sl, mir, seq) {
  const { per } = run(n, lan, rocks, sl, seq, mir, true);
  const zeros = per.filter(x => x === 0).length;
  return zeros <= 1 && per.every(x => x === 0 || x >= 3) && Math.max(...per) >= 4;
}
function usesFeatures(n, lan, rocks, sl, mir, seq, S) {
  if (!mir.size && !S.star && !S.twin) return true;
  const L = new Map(); for (const [k, v] of lan) L.set(k, v.slice()); const SL = new Map(sl); const bent = new Set(); let diag = false, twinfired = false;
  for (const t of seq) {
    if (!L.has(t)) return false; L.get(t)[1]--; if (L.get(t)[1] > 0) continue;
    const first = [t]; if (L.get(t)[2] === 4) { const m = twinOf(L, t); if (m !== null) { first.push(m); twinfired = true; } }
    const sched = new Map([[0, first]]); const done = new Set(first); let w = 0;
    while (true) {
      let any = false; for (const k of sched.keys()) if (k >= w) { any = true; break; } if (!any) break;
      const wave = (sched.get(w) || []).filter(p => L.has(p)); sched.delete(w);
      for (const p of wave) {
        const v = L.get(p); L.delete(p);
        for (const [dr, dc] of dirsFor(v[2])) {
          const path = []; const [hit, s] = trace(n, L, rocks, SL, mir, p, dr, dc, v[0], path);
          for (const q of path) if (mir.has(q)) bent.add(q);
          if (hit !== null && !s && dr && dc) diag = true;
          if (hit === null || s) continue;
          const h = L.get(hit); h[1]--;
          if (h[1] <= 0 && !done.has(hit)) { done.add(hit); const dw = w + (h[2] === 3 ? 2 : 1); if (!sched.has(dw)) sched.set(dw, []); sched.get(dw).push(hit);
            if (h[2] === 4) { const m = twinOf(L, hit); if (m !== null && !done.has(m)) { done.add(m); L.get(m)[1] = 0; sched.get(dw).push(m); twinfired = true; } } }
        }
      }
      w++;
    }
  }
  if (mir.size && bent.size < mir.size) return false;
  if (S.star && !diag) return false;
  if (S.twin && !twinfired) return false;
  return true;
}
function group(n, lan, rocks, sl, mir, sol) { const g = new Map(); for (const s of sol) { const { cov } = run(n, lan, rocks, sl, s, mir, true); const k = setKey(s); if (!g.has(k)) g.set(k, []); g.get(k).push(cov); } return g; }
const union = sets => { const u = new Set(); for (const s of sets) for (const x of s) u.add(x); return u; };
const inter = sets => { const u = new Set(sets[0]); for (const s of sets.slice(1)) for (const x of [...u]) if (!s.has(x)) u.delete(x); return u; };
function* placeRegular(n, lan, rocks, mir, sl, groups, want) {
  for (const tgt of groups.keys()) {
    const tcov = union(groups.get(tgt));
    const others = [...groups.entries()].filter(([g]) => g !== tgt).map(([, c]) => inter(c));
    const cand = others.length ? [...union(others)].filter(c => !tcov.has(c) && !lan.has(c) && !rocks.has(c) && !mir.has(c) && !sl.has(c)) : [];
    const chosen = []; let alive = others.map((_, j) => j);
    for (let a = 0; a < want; a++) {
      if (!alive.length || !cand.length) break;
      let best = null, bs = -1; for (const c of cand) { const sc = alive.filter(j => others[j].has(c)).length; if (sc > bs) { bs = sc; best = c; } }
      chosen.push(best); alive = alive.filter(j => !others[j].has(best));
    }
    if (alive.length || chosen.length !== want) continue;
    const out = new Map(sl); for (const c of chosen) out.set(c, 1); yield out;
  }
}
// ---------- gen4: 어려움 검사 ----------
function hardEnough(n, lan, rocks, sl, mir, k, S) {
  const keys = [...lan.keys()];
  if (k >= 2) {
    const best = new Map();
    for (const s of seqs(keys, k)) { const key = setKey(s); let r = run(n, lan, rocks, sl, s, mir).rem; if (r < 0) r = 99; if (!best.has(key) || r < best.get(key)) best.set(key, r); }
    let near = 0; for (const v of best.values()) if (v >= 1 && v <= 2) near++;
    if (near < (S.near ?? 3)) return false;
  }
  const tot = lan.size; let good = 0;
  for (const t of keys) { const r = run(n, lan, rocks, sl, [t], mir).rem; if (r >= 0 && tot - r >= tot / 2) good++; }
  return good >= (S.spread ?? 2);
}
function finish(n, lan, rocks, mir, sl, k, S) {
  const S2 = solutions(n, lan, rocks, sl, k, mir);
  if (!S2.length || !unique(S2)) return null;
  if (k > 1 && solutions(n, lan, rocks, sl, k - 1, mir).length) return null;
  if (new Set(S2[0]).size < k) return null;                       // 같은 등불 두 번은 답으로 안 친다
  if (!goodTaps(n, lan, rocks, sl, mir, S2[0]) || !usesFeatures(n, lan, rocks, sl, mir, S2[0], S)) return null;
  if (S.big) { const sl1 = new Map([...sl.keys()].map(c => [c, 1])); if (run(n, lan, rocks, sl1, S2[0], mir).rem !== -1) return null; }
  if (!hardEnough(n, lan, rocks, sl, mir, k, S)) return null;
  return S2;
}
function out(n, k, lan, rocks, sleep, mir, sol, tries) {
  return { n, k, lanterns: [...lan].map(([p, v]) => [R(p), C(p), ...v]), rocks: [...rocks].map(p => [R(p), C(p)]),
    sleep: [...sleep].map(([p, hp]) => hp > 1 ? [R(p), C(p), hp] : [R(p), C(p)]), mirrors: [...mir].map(([p, kd]) => [R(p), C(p), kd]),
    sol: sol.map(s => s.map(p => [R(p), C(p)])), _tries: tries };
}
function make(S) {
  const n = S.n, k = S.k, t0 = Date.now(); let tries = 0;
  while (Date.now() - t0 < (S.budget || 60) * 1000) {
    tries++;
    const [lan, rocks, mir] = build(n, S);
    const sol = solutions(n, lan, rocks, new Map(), k, mir); if (!sol.length) continue;
    const groups = group(n, lan, rocks, new Map(), mir, sol);
    const wantReg = S.sleep || 0, wantBig = S.big || 0; let found = null;
    if (!wantBig && !wantReg) { if (groups.size === 1) { const S2 = finish(n, lan, rocks, mir, new Map(), k, S); if (S2) found = [new Map(), S2]; } }
    else if (!wantBig) { if (groups.size >= 2 && groups.size <= 16) for (const sl of placeRegular(n, lan, rocks, mir, new Map(), groups, wantReg)) { const S2 = finish(n, lan, rocks, mir, sl, k, S); if (S2) { found = [sl, S2]; break; } } }
    else {
      if (groups.size > 16) continue;
      const cands = []; for (const covs of groups.values()) for (const c of union(covs)) if (!lan.has(c) && !rocks.has(c) && !mir.has(c)) cands.push(c);
      shuffle(cands);
      for (const c of cands.slice(0, wantBig * 12)) {
        const sl = new Map([[c, 2]]); const S2 = solutions(n, lan, rocks, sl, k, mir); if (!S2.length) continue;
        if (!wantReg) { if (unique(S2)) { const S3 = finish(n, lan, rocks, mir, sl, k, S); if (S3) { found = [sl, S3]; break; } } }
        else { const g2 = group(n, lan, rocks, sl, mir, S2); if (g2.size < 2 || g2.size > 16) continue;
          for (const sl2 of placeRegular(n, lan, rocks, mir, sl, g2, wantReg)) { const S3 = finish(n, lan, rocks, mir, sl2, k, S); if (S3) { found = [sl2, S3]; break; } }
          if (found) break; }
      }
    }
    if (!found) continue;
    return out(n, k, lan, rocks, found[0], mir, found[1], tries);
  }
  return null;
}
// 세 번 판 합성: 구역마다 한 번에 풀리는 무리를 만들어 붙인 뒤 전체 검사
function compose(S) {
  const n = S.n, k = S.k, t0 = Date.now(); let tries = 0;
  while (Date.now() - t0 < (S.budget || 120) * 1000) {
    tries++;
    const cells = shuffle([...Array(n * n).keys()].map(i => K(Math.floor(i / n), i % n)));
    const rocks = new Set(cells.slice(0, S.rocks || 0)); const i = rocks.size;
    const mirrors = new Map(cells.slice(i, i + (S.mirrors || 0)).map(p => [p, ri(0, 1)]));
    const lan = new Map(); let ok = true;
    for (const Rg of S.regions) {
      const rc = Rg.cells.map(([r, c]) => K(r, c)).filter(p => !rocks.has(p) && !mirrors.has(p)); let cl = null;
      for (let a = 0; a < 40; a++) {
        const pick = shuffle(rc.slice()).slice(0, Rg.cnt); const l = new Map(pick.map(p => [p, [ri(1, S.maxsize || 3), 1, 0]]));
        const tp = shuffle(pick.slice()); (Rg.types || []).forEach((t, j) => { const p = tp[j]; const v = l.get(p); v[2] = t; if (t === 1 || t === 2 || t === 5) v[0] = Math.max(2, v[0]); if (t === 4) l.set(p, [v[0], 1, 4, Rg.pid || 0]); });
        const s1 = solutions(n, l, rocks, new Map(), 1, mirrors);
        if (s1.length === 1 && l.get(s1[0][0])[2] !== 3) { const { per } = run(n, l, rocks, new Map(), s1[0], mirrors, true); if (per[0] >= 3) { cl = l; break; } }
      }
      if (!cl) { ok = false; break; }
      for (const [p, v] of cl) lan.set(p, v);
    }
    if (!ok) continue;
    const sol = solutions(n, lan, rocks, new Map(), k, mirrors); if (!sol.length) continue;
    const groups = group(n, lan, rocks, new Map(), mirrors, sol); let found = null;
    if (S.big) {
      const cands = []; for (const covs of groups.values()) for (const c of union(covs)) if (!lan.has(c) && !rocks.has(c) && !mirrors.has(c)) cands.push(c);
      shuffle(cands);
      for (const c of cands.slice(0, 12)) { const sl = new Map([[c, 2]]); const S3 = finish(n, lan, rocks, mirrors, sl, k, S); if (S3) { found = [sl, S3]; break; } }
    } else if (S.sleep) {
      if (groups.size >= 2 && groups.size <= 16) for (const sl of placeRegular(n, lan, rocks, mirrors, new Map(), groups, S.sleep)) { const S3 = finish(n, lan, rocks, mirrors, sl, k, S); if (S3) { found = [sl, S3]; break; } }
    } else if (groups.size === 1) { const S3 = finish(n, lan, rocks, mirrors, new Map(), k, S); if (S3) found = [new Map(), S3]; }
    if (!found) continue;
    return out(n, k, lan, rocks, found[0], mirrors, found[1], tries);
  }
  return null;
}

if (require.main === module) {
  const idx = +process.argv[2], spec = JSON.parse(process.argv[3]); seed = process.argv[4] ? +process.argv[4] : idx * 131 + 7;
  const t0 = Date.now(); const lv = spec.regions ? compose(spec) : make(spec);
  console.log(idx, lv ? 'ok' : 'FAIL', lv && `tries ${lv._tries} lan ${lv.lanterns.length} sol ${JSON.stringify(lv.sol[0])}`, ((Date.now() - t0) / 1000).toFixed(0) + 's');
  if (lv) { lv._spec = spec; fs.mkdirSync('hard', { recursive: true }); fs.writeFileSync(`hard/${String(idx).padStart(2, '0')}.json`, JSON.stringify(lv)); }
}
module.exports = { run, solutions, K, R, C };
