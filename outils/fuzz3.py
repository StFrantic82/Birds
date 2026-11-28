import asyncio,random,time
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1500,'height':950})
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m: errs.append('C:'+m.text) if m.type=='error' else None)
        await pg.goto('file://'+__import__('os').path.abspath(__import__('os').path.dirname(__file__)+'/../index.html')+''); await pg.wait_for_timeout(800)
        await pg.evaluate("""()=>{const G0=window.BirdsGame.Game.prototype; const o=G0.takeTurnDeep; window.__T=[]; G0.takeTurnDeep=async function(p,L){const t=performance.now(); const r=await o.call(this,p,L); window.__T.push(Math.round(performance.now()-t)); return r;};}""")
        go=await pg.query_selector('#go'); await go.click(); await pg.wait_for_timeout(800)
        random.seed(11); clicks=0; t0=time.time(); end=False
        while time.time()-t0<240:
            await pg.wait_for_timeout(30)
            if await pg.is_visible('#modal .mbox'): end=True; break
            btns=await pg.query_selector_all('#pchoice .pcard, #prompt button:not(.ghost):not([disabled]), .actb:not(.off)')
            btns=[x for x in btns if await x.is_visible()]
            if not btns: continue
            try: await random.choice(btns).click(timeout=1500); clicks+=1
            except Exception: pass
        T=await pg.evaluate("window.__T"); log=await pg.evaluate("document.querySelector('#log').innerText.split('\\n').filter(l=>l.includes('★')).slice(-8).join(' | ')")
        print('end',end,'clicks',clicks,'AI turns',len(T),'ms avg',sum(T)//max(1,len(T)),'max',max(T or [0]),'errors',errs[:5]); print(log)
        await b.close()
asyncio.run(main())
