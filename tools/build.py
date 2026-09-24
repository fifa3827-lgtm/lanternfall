# index.html = head.html + <script>game.js(LEVELS 자리에 판 데이터, 정답 sol은 뺀다)</script>
import json, os
os.chdir(os.path.join(os.path.dirname(__file__), '..'))
L = [{k: v for k, v in lv.items() if k != 'sol'} for lv in json.load(open('data/levels.json'))]
g = open('tools/game.js').read().replace('__LEVELS__', json.dumps(L, separators=(',', ':')))
art = json.load(open('art/art.json'))   # 등불 그림(webp)을 파일 안에 넣는다
css = ':root { ' + ' '.join(f'--img-{k}: url({v});' for k, v in art.items()) + ' --img-lan: var(--img-orange); --img-bank: var(--img-bg1); }'
open('index.html', 'w').write(open('tools/head.html').read().replace('/*__ART__*/', css) + '<script>\n' + g + '\n</script>\n</body>\n</html>\n')
print('index.html', os.path.getsize('index.html'))
