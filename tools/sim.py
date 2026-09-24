import itertools
DIRS=[(1,0),(-1,0),(0,1),(0,-1)]
# lantern: pos -> [size, layers, type]  type: 0 normal, 1 horizontal-only, 2 vertical-only, 3 fuse
def dirs_for(t):
    if t==1: return [(0,1),(0,-1)]
    if t==2: return [(1,0),(-1,0)]
    return DIRS
def dirs_for_js_order(t):
    # JS iterates DIRS in fixed order and filters; keep python identical
    return [d for d in DIRS if (t!=1 or d[0]==0) and (t!=2 or d[1]==0)]
def run(n,lan,rocks,sleep,taps,want_detail=False):
    L={k:list(v) for k,v in lan.items()}
    cov=set(); per=[]
    for t in taps:
        if t not in L: per.append(-1); continue
        L[t][1]-=1
        if L[t][1]>0: per.append(0); continue
        sched={0:[t]}; done=set([t]); w=0; cnt=0
        while any(k>=w for k in sched):
            wave=[p for p in sched.pop(w,[]) if p in L]
            for p in wave:
                s,_,ty=L.pop(p); cnt+=1
                for dr,dc in dirs_for_js_order(ty):
                    for d in range(1,s+1):
                        q=(p[0]+dr*d,p[1]+dc*d)
                        if not(0<=q[0]<n and 0<=q[1]<n) or q in rocks: break
                        cov.add(q)
                        if q in sleep: return (-1,cov,per) if want_detail else -1
                        if q in L:
                            L[q][1]-=1
                            if L[q][1]<=0 and q not in done:
                                done.add(q)
                                sched.setdefault(w+(2 if L[q][2]==3 else 1),[]).append(q)
                            break
            w+=1
        per.append(cnt)
    rem=len(L)
    return (rem,cov,per) if want_detail else rem
def solutions(n,lan,rocks,sleep,k):
    keys=list(lan)
    seqs=[(t,) for t in keys] if k==1 else itertools.product(keys,repeat=k)
    out=[]
    for s in seqs:
        if run(n,lan,rocks,sleep,s)==0: out.append(s)
    return out
def unique(sols):
    return len({tuple(sorted(s)) for s in sols})==1
