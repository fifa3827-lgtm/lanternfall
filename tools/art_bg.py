# 원경 그림 처리: 오른쪽 170px(제미나이 ✦ 표시) 잘라내기 → 어두운 정도를 투명도로 → 흰 실루엣 webp → art.json
import numpy as np, json, base64, os, sys
from PIL import Image
os.chdir(os.path.join(os.path.dirname(__file__), '..'))
art = json.load(open('art/art.json'))
for k in sys.argv[1:] or ['bg1', 'bg2', 'bg3', 'bg4', 'bg5']:
    im = Image.open(f'art/source-{k}.png').convert('RGB'); W, H = im.size
    L = np.array(im.crop((0, 0, W - 170, H)).convert('L')).astype(float)
    dark = np.percentile(L[L < 128], 20)
    a = np.clip((245 - L) / (245 - dark), 0, 1)
    a = a[max(0, np.where(a.max(1) > .05)[0].min() - 4):]
    m = Image.fromarray((a * 255).astype(np.uint8)).resize((1200, round(a.shape[0] * 1200 / a.shape[1])), Image.LANCZOS)
    out = Image.new('RGBA', m.size, (255, 255, 255, 0)); out.putalpha(m); out.save(f'art/{k}.webp', quality=85, method=6)
    art[k] = 'data:image/webp;base64,' + base64.b64encode(open(f'art/{k}.webp', 'rb').read()).decode()
    print(k, m.size, os.path.getsize(f'art/{k}.webp'))
json.dump(art, open('art/art.json', 'w'))
