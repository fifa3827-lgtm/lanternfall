import itertools
# 판 시뮬레이터. game.js의 chain()/trace()와 한 글자도 어긋나면 안 된다.
# lantern: pos -> [size, layers, type, (pair)]
#   type 0 보통 · 1 가로 금띠 · 2 세로 금띠 · 3 심지(한 박자 뒤) · 4 쌍둥이(짝도 같은 파도) · 5 별꽃(여덟 방향)
# sleep: pos -> hp  (1 잠든 등불, 2 큰 잠꾸러기: 한 번은 견딘다)   (set이 오면 전부 hp 1)
# mirrors: pos -> kind (0 '/', 1 '\')  불꽃이 90도 꺾여 계속 간다. 거울 칸도 사거리 한 칸으로 센다.
DIRS=[(1,0),(-1,0),(0,1),(0,-1)]
DIAG=[(1,1),(1,-1),(-1,1),(-1,-1)]
def dirs_for(t):
    if t==1: return [(0,1),(0,-1)]
    if t==2: return [(1,0),(-1,0)]
    if t==5: return DIRS+DIAG
    return DIRS
def bend(kind,dr,dc):
    return (-dc,-dr) if kind==0 else (dc,dr)
def trace(n,L,rocks,sleep,mirrors,p,dr,dc,s):
    """불꽃 하나의 길. 지나간 칸 목록과 (맞은 칸, 잠든 등불인가)를 준다."""
    r,c=p; path=[]
    for _ in range(s):
        r+=dr; c+=dc; q=(r,c)
        if not(0<=r<n and 0<=c<n) or q in rocks: break
        path.append(q)
        if q in mirrors: dr,dc=bend(mirrors[q],dr,dc); continue
        if q in sleep: return path,q,True
        if q in L: return path,q,False
    return path,None,False
def run(n,lan,rocks,sleep,taps,want_detail=False,mirrors=None):
    L={k:list(v) for k,v in lan.items()}
    SL={k:(sleep[k] if isinstance(sleep,dict) else 1) for k in sleep}
    M=mirrors or {}
    cov=set(); per=[]
    for t in taps:
        if t not in L: per.append(-1); continue
        L[t][1]-=1
        if L[t][1]>0: per.append(0); continue
        first=[t]
        if L[t][2]==4:
            mate=twin_of(L,t)
            if mate is not None: first.append(mate)
        sched={0:first}; done=set(first); w=0; cnt=0
        while any(k>=w for k in sched):
            wave=[p for p in sched.pop(w,[]) if p in L]
            for p in wave:
                v=L.pop(p); s,ty=v[0],v[2]; cnt+=1
                for dr,dc in dirs_for(ty):
                    path,hit,sleeper=trace(n,L,rocks,SL,M,p,dr,dc,s)
                    cov.update(q for q in path if q not in M)
                    if hit is None: continue
                    if sleeper:
                        SL[hit]-=1
                        if SL[hit]<=0: return (-1,cov,per) if want_detail else -1
                        continue
                    L[hit][1]-=1
                    if L[hit][1]<=0 and hit not in done:
                        done.add(hit); dw=w+(2 if L[hit][2]==3 else 1)
                        sched.setdefault(dw,[]).append(hit)
                        if L[hit][2]==4:
                            mate=twin_of(L,hit)
                            if mate is not None and mate not in done:
                                done.add(mate); L[mate][1]=0; sched[dw].append(mate)
            w+=1
        per.append(cnt)
    rem=len(L)
    return (rem,cov,per) if want_detail else rem
def twin_of(L,p):
    v=L.get(p)
    if v is None or len(v)<4: return None
    for q,u in L.items():
        if q!=p and len(u)>=4 and u[2]==4 and u[3]==v[3]: return q
    return None
def solutions(n,lan,rocks,sleep,k,mirrors=None):
    keys=list(lan)
    seqs=[(t,) for t in keys] if k==1 else itertools.product(keys,repeat=k)
    out=[]
    for s in seqs:
        if run(n,lan,rocks,sleep,s,mirrors=mirrors)==0: out.append(s)
    return out
def unique(sols):
    return len({tuple(sorted(s)) for s in sols})==1
def load_level(lv):
    """levels.json 한 판 → run()에 넣는 꼴"""
    lan={(x[0],x[1]):list(x[2:]) for x in lv['lanterns']}
    rocks={tuple(x) for x in lv['rocks']}
    sleep={(x[0],x[1]):(x[2] if len(x)>2 else 1) for x in lv['sleep']}
    mirrors={(x[0],x[1]):x[2] for x in lv.get('mirrors',[])}
    return lan,rocks,sleep,mirrors
