import asyncio, json
from playwright.async_api import async_playwright
L=json.load(open('data/levels.json'))
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); res=[]
        for idx,lv in enumerate(L):
            pg=await b.new_page(viewport={'width':390,'height':844})
            errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
            await pg.goto('file://'+__import__('os').path.abspath('index.html')+'')
            seen={k:True for k in ['intro','sleep','preview','rock','taps2','layered','dir','fuse','taps3','big','mirror','twin','star','board8']}
            done={str(i):True for i in range(idx)}
            await pg.evaluate(f"localStorage.setItem('lanternfall.save', JSON.stringify({{unlocked:{idx},done:{json.dumps(done)},seen:{json.dumps(seen)}}}))")
            await pg.reload(); await pg.wait_for_timeout(300)
            await pg.click('#tPlay'); await pg.wait_for_timeout(1500)  # 인트로 화면에서 이어하기
            n=lv['n']
            for (r,c) in lv['sol'][0]:
                el=pg.locator('.cell').nth(r*n+c).locator('.lan')
                await el.dispatch_event('pointerdown'); await el.dispatch_event('pointerup')
                for _ in range(80):
                    await pg.wait_for_timeout(100)
                    busy=await pg.evaluate("document.getElementById('over').classList.contains('show')")
                    if busy: break
                    # wait until no burst in flight: taps indicator updated & no leafs
                    if await pg.locator('.leaf').count()==0 and await pg.locator('.lan.lit').count()==0:
                        await pg.wait_for_timeout(400); break
            for _ in range(60):
                if await pg.evaluate("document.getElementById('over').classList.contains('show')"): break
                await pg.wait_for_timeout(100)
            t=await pg.text_content('#ovT')
            res.append((idx+1,t,errs[:1])); await pg.close()
        for r in res: print(r)
        await b.close()
asyncio.run(main())
