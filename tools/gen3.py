"""3~5장 판 생성기.  python3 gen3.py <단계번호> '<spec json>' [seed]
spec: n, cnt, k, rocks, layers, dir, fuse, twin(쌍 수), star, big(큰 잠꾸러기 수), sleep, mirrors, maxsize, budget
원칙(design.md): 답 하나 · 적은 탭으로 안 풀림 · 탭마다 3개 이상 연쇄, 최대 4개 이상 · 잠든 등불은 답을 좁히는 장치.
거울·별꽃은 정답 불꽃이 실제로 그 요소를 지나가야 한다(요소가 장식으로 남으면 버린다)."""
import random, json, sys, time
from sim import *

def build(n,S):
    cells=[(r,c) for r in range(n) for c in range(n)]; random.shuffle(cells)
    rocks=set(cells[:S.get('rocks',0)]); i=len(rocks)
    mirrors={p:random.randint(0,1) for p in cells[i:i+S.get('mirrors',0)]}; i+=len(mirrors)
    rest=cells[i:]; cnt=S['cnt']
    lan={p:[random.randint(1,S.get('maxsize',3)),1,0] for p in rest[:cnt]}
    ks=list(lan); random.shuffle(ks); j=0
    for _ in range(S.get('layers',0)): lan[ks[j]][1]=2; j+=1
    for _ in range(S.get('dir',0)): lan[ks[j]][2]=random.choice([1,2]); lan[ks[j]][0]=max(lan[ks[j]][0],2); j+=1
    for _ in range(S.get('fuse',0)): lan[ks[j]][2]=3; j+=1
    for pid in range(S.get('twin',0)):
        for _ in range(2): lan[ks[j]]=[lan[ks[j]][0],1,4,pid]; j+=1
    for _ in range(S.get('star',0)): lan[ks[j]][2]=5; lan[ks[j]][0]=max(lan[ks[j]][0],2); j+=1
    return lan,rocks,mirrors,rest[cnt:]

def good_taps(n,lan,rocks,sleep,mir,seq):
    _,_,per=run(n,lan,rocks,sleep,seq,True,mir)
    zeros=sum(1 for x in per if x==0)
    return zeros<=1 and all(x==0 or x>=3 for x in per) and max(per)>=4

def uses_features(n,lan,rocks,sleep,mir,seq,S):
    """정답을 재생해 거울이 실제로 꺾였는지, 별꽃이 대각선으로 무엇을 맞혔는지 본다."""
    if not mir and not S.get('star') and not S.get('twin'): return True
    L={k:list(v) for k,v in lan.items()}; SL=dict(sleep); bent=set(); diag=False; twinfired=False
    for t in seq:
        if t not in L: return False
        L[t][1]-=1
        if L[t][1]>0: continue
        first=[t]
        if L[t][2]==4:
            m=twin_of(L,t)
            if m is not None: first.append(m); twinfired=True
        sched={0:first}; done=set(first); w=0
        while any(k>=w for k in sched):
            for p in [p for p in sched.pop(w,[]) if p in L]:
                v=L.pop(p)
                for dr,dc in dirs_for(v[2]):
                    path,hit,sl=trace(n,L,rocks,SL,mir,p,dr,dc,v[0])
                    bent.update(q for q in path if q in mir)
                    if hit is not None and not sl and (dr and dc): diag=True
                    if hit is None or sl: continue
                    L[hit][1]-=1
                    if L[hit][1]<=0 and hit not in done:
                        done.add(hit); dw=w+(2 if L[hit][2]==3 else 1); sched.setdefault(dw,[]).append(hit)
                        if L[hit][2]==4:
                            m=twin_of(L,hit)
                            if m is not None and m not in done: done.add(m); L[m][1]=0; sched[dw].append(m); twinfired=True
            w+=1
    if mir and len(bent)<len(mir): return False          # 모든 거울이 한 번은 쓰여야
    if S.get('star') and not diag: return False           # 별꽃은 대각선으로 무엇을 맞혀야
    if S.get('twin') and not twinfired: return False
    return True

def group(n,lan,rocks,sl,mir,sol):
    g={}
    for s in sol:
        _,cov,_=run(n,lan,rocks,sl,s,True,mir); g.setdefault(tuple(sorted(s)),[]).append(cov)
    return g

def place_regular(n,lan,rocks,mir,sl,groups,want):
    """오답 무리마다 그 불꽃이 반드시 지나가고 정답은 안 지나가는 칸에 잠든 등불(hp1)을 놓는다."""
    for tgt in groups:
        tcov=set().union(*groups[tgt])
        others=[set.intersection(*[set(x) for x in c]) for g,c in groups.items() if g!=tgt]
        cand=[c for c in set().union(*others) if c not in tcov and c not in lan and c not in rocks and c not in mir and c not in sl] if others else []
        chosen=[]; alive=list(range(len(others)))
        for _ in range(want):
            if not alive or not cand: break
            best=max(cand,key=lambda c:sum(1 for j in alive if c in others[j]))
            chosen.append(best); alive=[j for j in alive if best not in others[j]]
        if alive or len(chosen)!=want: continue
        yield {**sl, **{c:1 for c in chosen}}

def finish(n,lan,rocks,mir,sl,k,S):
    S2=solutions(n,lan,rocks,sl,k,mir)
    if not S2 or not unique(S2): return None
    if k>1 and solutions(n,lan,rocks,sl,k-1,mir): return None
    if not good_taps(n,lan,rocks,sl,mir,S2[0]) or not uses_features(n,lan,rocks,sl,mir,S2[0],S): return None
    if S.get('big'):
        # 큰 잠꾸러기가 뜻이 있으려면, 보통 잠든 등불(hp1)이었다면 정답이 실패했어야 한다
        sl1={c:1 for c in sl}
        if run(n,lan,rocks,sl1,S2[0],mirrors=mir)!=-1: return None
    return S2

def make(S):
    n,k=S['n'],S['k']; t0=time.time(); tries=0
    while time.time()-t0<S.get('budget',60):
        tries+=1
        lan,rocks,mir,free=build(n,S)
        sol=solutions(n,lan,rocks,{},k,mir)
        if not sol: continue
        groups=group(n,lan,rocks,{},mir,sol)
        want_reg=S.get('sleep',0); want_big=S.get('big',0)
        found=None
        if want_big==0 and want_reg==0:
            if len(groups)==1:
                S2=finish(n,lan,rocks,mir,{},k,S)
                if S2: found=({},S2)
        elif want_big==0:
            if 2<=len(groups)<=16:
                for sl in place_regular(n,lan,rocks,mir,{},groups,want_reg):
                    S2=finish(n,lan,rocks,mir,sl,k,S)
                    if S2: found=(sl,S2); break
        else:
            if len(groups)>16: continue
            # 큰 잠꾸러기: 어느 정답 후보의 불꽃이 지나가는 칸에 hp2로 놓아 본다(그 불꽃은 거기서 멈추므로 판이 달라진다 → 다시 검사)
            cands=[]
            for tgt,covs in groups.items():
                for c in set().union(*covs):
                    if c not in lan and c not in rocks and c not in mir: cands.append(c)
            random.shuffle(cands)
            for c in cands[:want_big*12]:
                sl={c:2}
                S2=solutions(n,lan,rocks,sl,k,mir)
                if not S2: continue
                if want_reg==0:
                    if unique(S2):
                        S3=finish(n,lan,rocks,mir,sl,k,S)
                        if S3: found=(sl,S3); break
                else:
                    g2=group(n,lan,rocks,sl,mir,S2)
                    if not (2<=len(g2)<=16): continue
                    for sl2 in place_regular(n,lan,rocks,mir,sl,g2,want_reg):
                        S3=finish(n,lan,rocks,mir,sl2,k,S)
                        if S3: found=(sl2,S3); break
                    if found: break
        if not found: continue
        sleep,sol=found
        return {"n":n,"k":k,
                "lanterns":[[r,c]+list(v) for (r,c),v in lan.items()],
                "rocks":[list(x) for x in rocks],
                "sleep":[[r,c]+([hp] if hp>1 else []) for (r,c),hp in sleep.items()],
                "mirrors":[[r,c,kd] for (r,c),kd in mir.items()],
                "sol":[[list(p) for p in s] for s in sol], "_tries":tries}
    return None

def compose(S):
    """세 번 판: 한 번에 풀리는 무리를 구역마다 따로 만들어 붙인 뒤 전체를 다시 검사한다."""
    n,k=S['n'],S['k']; t0=time.time(); tries=0
    regions=S['regions']   # [{cells:[[r,c],...], cnt, types:[...]}]
    while time.time()-t0<S.get('budget',120):
        tries+=1
        cells=[(r,c) for r in range(n) for c in range(n)]; random.shuffle(cells)
        rocks=set(cells[:S.get('rocks',0)]); i=len(rocks)
        mirrors={p:random.randint(0,1) for p in cells[i:i+S.get('mirrors',0)]}
        lan={}; ok=True
        for R in regions:
            rc=[tuple(c) for c in R['cells'] if tuple(c) not in rocks and tuple(c) not in mirrors]
            cl=None
            for _ in range(40):
                pick=random.sample(rc,R['cnt']); l={p:[random.randint(1,S.get('maxsize',3)),1,0] for p in pick}
                for p,t in zip(random.sample(pick,len(R.get('types',[]))),R.get('types',[])):
                    l[p][2]=t
                    if t in (1,2,5): l[p][0]=max(2,l[p][0])
                    if t==4: l[p]=[l[p][0],1,4,R.get('pid',0)]
                s1=solutions(n,l,rocks,{},1,mirrors)
                if len(s1)==1 and l[s1[0][0]][2]!=3:
                    _,_,per=run(n,l,rocks,{},s1[0],True,mirrors)
                    if per[0]>=3: cl=l; break
            if not cl: ok=False; break
            lan.update(cl)
        if not ok: continue
        sol=solutions(n,lan,rocks,{},k,mirrors)
        if not sol: continue
        groups=group(n,lan,rocks,{},mirrors,sol); found=None
        if S.get('big'):
            cands=[c for covs in groups.values() for c in set().union(*covs) if c not in lan and c not in rocks and c not in mirrors]
            random.shuffle(cands)
            for c in cands[:12]:
                sl={c:2}; S3=finish(n,lan,rocks,mirrors,sl,k,S)
                if S3: found=(sl,S3); break
        elif len(groups)==1:
            S3=finish(n,lan,rocks,mirrors,{},k,S)
            if S3: found=({},S3)
        if not found: continue
        sleep,sol=found
        return {"n":n,"k":k,"lanterns":[[r,c]+list(v) for (r,c),v in lan.items()],"rocks":[list(x) for x in rocks],
                "sleep":[[r,c]+([hp] if hp>1 else []) for (r,c),hp in sleep.items()],
                "mirrors":[[r,c,kd] for (r,c),kd in mirrors.items()],
                "sol":[[list(p) for p in s] for s in sol],"_tries":tries}
    return None

if __name__=="__main__":
    idx=int(sys.argv[1]); spec=json.loads(sys.argv[2]); random.seed(int(sys.argv[3]) if len(sys.argv)>3 else idx*7+1)
    lv=make(spec)
    try: out=json.load(open('ch345.json'))
    except: out={}
    if lv: out[str(idx)]=lv
    json.dump(out,open('ch345.json','w'),indent=0)
    print(idx,'ok' if lv else 'FAIL', lv and (lv['_tries'], lv['sol'][:2]))
