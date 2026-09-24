import random, json, sys, time
from sim import *
def build(n,cnt,rocks_n,layers_n,dir_n,fuse_n,maxsize):
    cells=[(r,c) for r in range(n) for c in range(n)]; random.shuffle(cells)
    rocks=set(cells[:rocks_n]); rest=cells[rocks_n:]
    lan={p:[random.randint(1,maxsize),1,0] for p in rest[:cnt]}
    ks=list(lan); random.shuffle(ks)
    for p in ks[:layers_n]: lan[p][1]=2
    for p in ks[layers_n:layers_n+dir_n]: lan[p][2]=random.choice([1,2]); lan[p][0]=max(lan[p][0],2)
    for p in ks[layers_n+dir_n:layers_n+dir_n+fuse_n]: lan[p][2]=3
    return lan,rocks,rest[cnt:]
def good_taps(n,lan,rocks,sleep,seq):
    _,_,per=run(n,lan,rocks,sleep,seq,True)
    zeros=sum(1 for x in per if x==0)
    return zeros<=1 and all(x==0 or x>=3 for x in per) and max(per)>=4
def feature_ok(lan,seq,dir_n,fuse_n):
    if fuse_n and any(lan[t][2]==3 for t in seq): return False
    if dir_n and all(lan[t][2] in (1,2) for t in seq) and len(seq)==1: pass
    return True
def make(n,cnt,k,rocks_n=0,layers_n=0,dir_n=0,fuse_n=0,sleep_n=0,maxsize=3,budget=60):
    t0=time.time()
    while time.time()-t0<budget:
        lan,rocks,free=build(n,cnt,rocks_n,layers_n,dir_n,fuse_n,maxsize)
        if sleep_n==0:
            S=solutions(n,lan,rocks,set(),k)
            if not S or not unique(S): continue
            if k>1 and solutions(n,lan,rocks,set(),k-1): continue
            if not good_taps(n,lan,rocks,set(),S[0]) or not feature_ok(lan,S[0],dir_n,fuse_n): continue
            sleep=set()
        else:
            S=solutions(n,lan,rocks,set(),k)
            groups={}
            for s in S:
                key=tuple(sorted(s)); _,cov,_=run(n,lan,rocks,set(),s,True)
                groups.setdefault(key,[]).append(cov)
            if not (2<=len(groups)<=14): continue
            found=None
            for tgt,tcovs in groups.items():
                tcov=set().union(*tcovs)
                others=[set().union(*c) for g,c in groups.items() if g!=tgt]
                # a sleeper must lie on every sequence of other groups -> use intersection per group
                others=[set.intersection(*[set(x) for x in c]) for g,c in groups.items() if g!=tgt]
                cand=[c for c in set().union(*others) if c not in tcov and c not in lan and c not in rocks] if others else []
                chosen=[];alive=list(range(len(others)))
                for _ in range(sleep_n):
                    if not alive or not cand: break
                    best=max(cand,key=lambda c:sum(1 for j in alive if c in others[j]))
                    chosen.append(best); alive=[j for j in alive if best not in others[j]]
                if alive or len(chosen)!=sleep_n: continue
                sl=set(chosen)
                S2=solutions(n,lan,rocks,sl,k)
                if not S2 or not unique(S2): continue
                if k>1 and solutions(n,lan,rocks,sl,k-1): continue
                if not good_taps(n,lan,rocks,sl,S2[0]) or not feature_ok(lan,S2[0],dir_n,fuse_n): continue
                found=(sl,S2); break
            if not found: continue
            sleep,S=found
        return {"n":n,"k":k,"lanterns":[[r,c,s,l,t] for (r,c),(s,l,t) in lan.items()],
                "rocks":[list(x) for x in rocks],"sleep":[list(x) for x in sleep],
                "sol":[[list(p) for p in s] for s in S]}
    return None
if __name__=="__main__":
    idx=int(sys.argv[1]); spec=json.loads(sys.argv[2]); random.seed(int(sys.argv[3]) if len(sys.argv)>3 else idx*7+1)
    lv=make(**spec)
    try: out=json.load(open('ch2.json'))
    except: out={}
    if lv: out[str(idx)]=lv
    json.dump(out,open('ch2.json','w'))
    print(idx, 'ok' if lv else 'FAIL', lv and lv['sol'][:2])
