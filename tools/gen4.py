"""어려운 판 생성기 (시험판 14, 난이도 올리기).  gen3의 규칙에 두 가지를 더한다.
- near: 정답이 아닌데 등불을 1~2개만 남기는 「아깝게 안 되는」 탭 묶음이 near개 이상 있어야 한다(k>=2). 찍어서는 안 풀리고 따져야 풀린다.
- spread: 첫 탭으로 골라도 그럴듯한(등불 절반 이상이 터지는) 등불이 spread개 이상. 한 번 판(k=1)에서 찍기를 막는다.
python3 gen4.py <단계번호> '<spec json>' [seed]  → ch_hard.json 에 쓴다."""
import random, json, sys, time, itertools
from sim import *
import gen3

def rem_table(n,lan,rocks,sleep,k,mir):
    """모든 탭 묶음(순서 무시, 가장 잘 된 순서 기준)의 남은 등불 수"""
    keys=list(lan); best={}
    for s in (itertools.product(keys,repeat=k) if k>1 else [(t,) for t in keys]):
        key=tuple(sorted(s)); r=run(n,lan,rocks,sleep,s,mirrors=mir)
        if r<0: r=99
        if key not in best or r<best[key]: best[key]=r
    return best

def hard_enough(n,lan,rocks,sl,mir,k,S):
    tab=rem_table(n,lan,rocks,sl,k,mir)
    if k>=2:
        near=sum(1 for v in tab.values() if 1<=v<=2)
        if near<S.get('near',3): return False
    # 첫 탭 후보의 그럴듯함: 한 번 탭으로 등불 절반 이상이 터지는 등불 수
    tot=len(lan); good=0
    for t in lan:
        r=run(n,lan,rocks,sl,(t,),mirrors=mir)
        if r>=0 and tot-r>=tot/2: good+=1
    return good>=S.get('spread',2)

_finish=gen3.finish
def finish(n,lan,rocks,mir,sl,k,S):
    S2=_finish(n,lan,rocks,mir,sl,k,S)
    if not S2: return None
    if len(set(S2[0]))<k: return None           # 같은 등불 두 번은 답으로 안 친다(따질 게 없다)
    if not hard_enough(n,lan,rocks,sl,mir,k,S): return None
    return S2
gen3.finish=finish

if __name__=="__main__":
    idx=int(sys.argv[1]); spec=json.loads(sys.argv[2]); random.seed(int(sys.argv[3]) if len(sys.argv)>3 else idx*13+5)
    lv=gen3.make(spec)
    print(idx,'ok' if lv else 'FAIL', lv and (lv['_tries'], len(lv['lanterns']), lv['sol'][0]))
    if lv:
        lv['_spec']=spec
        json.dump(lv,open(f'hard/{idx:02d}.json','w'))
