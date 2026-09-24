import random, json, sys, time
from sim import *
def region_cluster(n, cells, cnt, maxsize, types, rocks, budget=10):
    t0=time.time()
    while time.time()-t0<budget:
        pick=random.sample(cells,cnt)
        lan={p:[random.randint(1,maxsize),1,0] for p in pick}
        for p,t in zip(random.sample(pick,len(types)),types):
            lan[p][2]=t
            if t in (1,2): lan[p][0]=max(2,lan[p][0])
        S=solutions(n,lan,rocks,set(),1)
        if len(S)==1 and lan[S[0][0]][2]!=3:
            _,_,per=run(n,lan,rocks,set(),S[0],True)
            if per[0]>=3: return lan
    return None
def compose(n,regions,rocks,k,budget=120):
    t0=time.time()
    while time.time()-t0<budget:
        lan={}
        ok=True
        for (cells,cnt,maxsize,types) in regions:
            cl=region_cluster(n,[c for c in cells if c not in rocks],cnt,maxsize,types,rocks)
            if not cl: ok=False;break
            lan.update(cl)
        if not ok: continue
        S=solutions(n,lan,rocks,set(),k)
        if not S or not unique(S): continue
        if solutions(n,lan,rocks,set(),k-1): continue
        return {"n":n,"k":k,"lanterns":[[r,c,s,l,t] for (r,c),(s,l,t) in lan.items()],"rocks":[list(x) for x in rocks],"sleep":[],"sol":[[list(p) for p in s] for s in S]}
    return None
idx=int(sys.argv[1]); random.seed(idx*13)
n=7
if idx==18:
    rocks={(3,1),(3,5),(4,3)}
    A=[(r,c) for r in range(0,3) for c in range(7)]
    B=[(r,c) for r in range(4,7) for c in range(0,3)]
    C=[(r,c) for r in range(4,7) for c in range(4,7)]
    lv=compose(n,[(A,5,2,[]),(B,4,2,[]),(C,4,2,[])],rocks,3)
elif idx==20:
    rocks={(3,0),(3,3),(3,6),(2,3)}
    A=[(r,c) for r in range(0,3) for c in range(0,3)]
    B=[(r,c) for r in range(0,3) for c in range(4,7)]
    C=[(r,c) for r in range(4,7) for c in range(7)]
    lv=compose(n,[(A,4,2,[3]),(B,4,2,[1]),(C,6,2,[3,2])],rocks,3)
out=json.load(open('ch2.json'))
if lv: out[str(idx)]=lv
json.dump(out,open('ch2.json','w'))
print(idx,'ok' if lv else 'FAIL', lv and lv['sol'])
