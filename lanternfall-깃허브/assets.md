# Lanternfall 그림 (제미나이)

## 역할

사용자는 제미나이에서 그림을 뽑아 올린다. 나머지(배경 지우기, 자르기, 크기, 색 변주, 게임에 끼우기, 브라우저 확인)는 Claude가 한다.

## 원칙

- **표시는 코드, 그림은 몸통.** 매듭, 금띠, 겉종이, 심지, 잠든 눈은 그림에 넣지 않는다. 종류마다 따로 뽑으면 모양이 조금씩 달라져 같은 등불로 안 보인다. 그림은 등불 몸통 한 장이 기본이다.
- **바깥 빛 금지.** 빛 번짐, 후광, 반짝이를 그리면 배경을 지울 때 지저분한 테두리가 남는다. 빛은 코드로 두른다.
- **흰 배경 하나.** 무늬, 바닥, 그림자, 가장자리 어두움 없이 순백. 배경은 색이 아니라 테두리에서 이어진 부분으로 지운다.
- **두 단계.** 기준 그림(1번)을 먼저 확정하고, 이후 등불 그림은 반드시 1번을 첨부해서 뽑는다. 첨부 없이 글로만 주문하면 화풍이 무너진다.
- **프롬프트는 그림마다 따로, 완성된 형태로.** 아래를 그대로 복사해 쓴다.

## 목록

| 번호 | 그림 | 첨부 | 상태 |
| --- | --- | --- | --- |
| 1 | 기본 등불 (주홍) | 없음 | **완료** (시험판 6) |
| 2 | 불 꺼진 등불 (잠든 등불용) | 1번 | 코드로 대신함 (1번을 차가운 먹청으로 칠함). 어색하면 뽑기 |
| 3 | 바위 | 1번 (화풍 참고) | **완료** (시험판 7) |
| 4 | 1장 원경: 기와 마을 | 없음 | **완료** |
| 5 | 2장 원경: 강나루 | 4번 (화풍 참고) | **완료** |
| 6 | 3장 원경: 산사 | 4번 (화풍 참고) | **완료** (뒷 능선이 옅은 두 겹, 그대로 살림) |
| 7 | 4장 원경: 축제 장터 | 4번 (화풍 참고) | **완료** |
| 8 | 5장 원경: 새벽 산 | 4번 (화풍 참고) | **다음** (아직 못 받음) |
| 9 | 앱 아이콘 | 1번 | 대기 |

청록(2장), 자주(3장) 등불은 1번을 코드로 색만 바꿔 먼저 시도한다. 모양이 완벽히 같아지기 때문이다. 어색하면 아래 "예비" 프롬프트로 뽑는다.

**시험판 6 현황**: 1번을 받아 주홍·청록·자주·금빛·연분홍·잠든(먹청) 여섯 벌을 코드로 만들었다. `art/`에 webp(가로 256px, 한 장 11~12KB)와 원본, `art/art.json`(데이터 주소)이 있고 `build.py`가 `head.html`의 `/*__ART__*/` 자리에 CSS 변수(`--img-orange` …)로 넣는다. 장 색은 `:root[data-ch]`의 `--img-lan`으로 바뀐다. 색 변주는 대나무 살(두 줄 띠의 황갈색)과 위아래 뚜껑을 건드리지 않고 한지만 색상을 옮긴다. 가운데 촛불빛도 같이 옮긴다.

---

## 1. 기본 등불 (주홍)

```
한지로 만든 한국 전통 종이 등불 하나를 정면에서 본 그림. 완벽한 좌우 대칭, 화면 한가운데. 등불은 딱 하나만.

모양: 부드럽게 둥근 통 모양, 가로보다 세로가 1.15배쯤 길다. 따뜻한 주홍빛 한지, 종이결이 은은하게 보인다. 안에 촛불이 켜져 있어서 아래쪽 가운데가 옅은 금빛으로 밝고, 위쪽 가장자리로 갈수록 짙은 붉은 주황이 된다. 가는 대나무 살 두 줄이 가로로 지나간다. 위에는 짙은 갈색 나무 뚜껑, 아래에는 같은 짙은 갈색 테가 있고, 둘 다 몸통보다 좁다.

술 장식 없음, 끈 없음, 고리 없음, 손잡이 없음. 종이에 글자, 문양, 그림 없음. 등불 바깥으로 빛 번짐, 후광, 빛줄기, 반짝이 없음 — 등불의 바깥 테두리는 또렷하고 깨끗해야 한다.

부드러운 과슈 일러스트. 단순하고 깨끗한 형태, 세부 묘사는 최소로. 아주 작게 보여도 또렷이 알아볼 수 있어야 한다.

배경은 무늬 없는 순백색(#FFFFFF) 하나. 바닥 없음, 그림자 없음, 가장자리 어두움 없음. 등불은 그림 높이의 60% 정도를 차지하고 사방에 넉넉한 빈 공간을 둔다. 정사각형 그림.
```

검수: 테두리가 또렷한가, 좌우 대칭인가, 술이나 끈이 없는가, 바깥 빛이 없는가.

## 2. 불 꺼진 등불 (잠든 등불용)

```
첨부한 등불 그림과 모양, 크기, 위치, 뚜껑, 테, 대나무 살, 화풍이 완전히 똑같은 등불을 그려 줘. 달라지는 것은 딱 하나, 촛불이 꺼져 있다는 것.

종이는 안에서 빛나지 않는다. 차갑고 어두운 푸른 회색 한지, 종이결이 은은하게 보인다. 아래쪽 가운데만 아주 약간 밝고 나머지는 고르게 어둡다. 뚜껑과 테는 첨부 그림과 같은 짙은 갈색.

얼굴, 눈, 입을 그리지 않는다. 술 장식, 끈, 고리 없음. 종이에 글자나 문양 없음. 바깥으로 빛 번짐 없음.

배경은 무늬 없는 순백색(#FFFFFF) 하나. 바닥, 그림자 없음. 첨부 그림과 같은 크기와 여백. 정사각형 그림.
```

검수: 1번 위에 겹쳤을 때 윤곽이 거의 같은가. 눈은 코드로 그리므로 얼굴이 있으면 다시 뽑는다.

## 3. 바위

```
첨부한 등불 그림은 화풍 참고용일 뿐이다. 첨부 그림에서 따라 할 것: 부드러운 과슈 칠, 단순하고 깨끗한 형태, 최소한의 세부 묘사, 또렷한 바깥 테두리. 등불 자체는 그리지 않는다.

그릴 것: 작고 둥글넓적한 강가의 돌 하나. 가로가 세로보다 1.3배쯤 넓다. 먹빛에 가까운 짙은 회청색, 위쪽 왼편만 살짝 밝다. 표면은 매끈하고 이끼나 무늬 없음.

배경은 무늬 없는 순백색(#FFFFFF) 하나. 바닥, 그림자, 물 없음. 돌은 그림 너비의 55% 정도, 사방에 넉넉한 여백. 정사각형 그림.
```

## 4. 1장 원경: 기와 마을

```
강 건너편에 보이는 한국 전통 마을의 먼 실루엣. 낮은 기와지붕 여러 채가 옆으로 길게 이어지고, 사이사이에 작은 나무 몇 그루.

전부 한 가지 색, 거의 검정에 가까운 짙은 남색 먹빛의 평평한 실루엣. 명암, 창문 불빛, 세부 묘사, 사람 없음. 지붕선의 위쪽 윤곽만 또렷하고 아름답게. 실루엣의 아래쪽 가장자리는 그림 맨 아래에 곧게 닿는다.

실루엣은 그림 높이의 아래 35%만 차지한다. 그 위는 전부 무늬 없는 순백색(#FFFFFF). 하늘, 달, 별, 구름, 물 없음. 가로로 긴 3:1 비율 그림.
```

## 5. 2장 원경: 강나루

```
첨부한 그림은 화풍 참고용일 뿐이다. 따라 할 것: 한 가지 색의 평평한 먹빛 실루엣, 또렷한 위쪽 윤곽, 아래 가장자리가 그림 맨 아래에 곧게 닿는 구도, 실루엣이 그림 높이의 아래 35%만 차지하는 비율, 순백 배경. 마을과 지붕은 따라 그리지 않는다.

그릴 것: 강나루의 먼 실루엣. 왼쪽에 늘어진 버드나무 두 그루, 가운데에 작은 나룻배 하나와 나무 선착장, 오른쪽으로 낮은 갈대숲이 이어진다.

거의 검정에 가까운 짙은 남색 한 가지 색. 명암, 불빛, 사람 없음. 위는 전부 순백색(#FFFFFF). 하늘, 달, 물결 없음. 가로로 긴 3:1 비율 그림.
```

## 6. 3장 원경: 산사

```
첨부한 그림은 화풍 참고용일 뿐이다. 따라 할 것: 한 가지 색의 평평한 먹빛 실루엣, 또렷한 위쪽 윤곽, 아래 가장자리가 그림 맨 아래에 곧게 닿는 구도, 실루엣이 그림 높이의 아래 35%만 차지하는 비율, 순백 배경. 마을과 지붕은 따라 그리지 않는다.

그릴 것: 겹겹이 이어지는 먼 산 능선, 가운데 산자락에 작은 절집 지붕 하나와 가느다란 석탑 하나, 소나무 몇 그루.

거의 검정에 가까운 짙은 남색 한 가지 색. 명암, 불빛, 사람 없음. 위는 전부 순백색(#FFFFFF). 하늘, 달, 구름 없음. 가로로 긴 3:1 비율 그림.
```

## 7. 4장 원경: 축제 장터

```
첨부한 그림은 화풍 참고용일 뿐이다. 따라 할 것: 한 가지 색의 평평한 먹빛 실루엣, 또렷한 위쪽 윤곽, 아래 가장자리가 그림 맨 아래에 곧게 닿는 구도, 실루엣이 그림 높이의 아래 35%만 차지하는 비율, 순백 배경. 마을은 따라 그리지 않는다.

그릴 것: 강 건너 축제 장터의 먼 실루엣. 천막 지붕 몇 채, 장대 두 개 사이에 늘어진 줄, 그 줄에 매달린 작은 등불 모양 실루엣 여러 개.

거의 검정에 가까운 짙은 남색 한 가지 색. 등불도 같은 색 실루엣, 빛나지 않음. 명암, 사람 없음. 위는 전부 순백색(#FFFFFF). 가로로 긴 3:1 비율 그림.
```

## 8. 5장 원경: 새벽 산

```
첨부한 그림은 화풍 참고용일 뿐이다. 따라 할 것: 한 가지 색의 평평한 실루엣, 또렷한 위쪽 윤곽, 아래 가장자리가 그림 맨 아래에 곧게 닿는 구도, 실루엣이 그림 높이의 아래 35%만 차지하는 비율, 순백 배경. 마을은 따라 그리지 않는다.

그릴 것: 멀리 낮고 완만하게 이어지는 산 능선 두 겹. 앞 능선에 작은 정자 하나.

거의 검정에 가까운 짙은 보랏빛 남색 한 가지 색. 명암, 해, 빛줄기, 사람 없음. 위는 전부 순백색(#FFFFFF). 가로로 긴 3:1 비율 그림.
```

## 9. 앱 아이콘

```
첨부한 등불과 똑같은 등불 하나를 화면 한가운데에 그려 줘. 모양, 색, 화풍은 첨부 그림 그대로. 이번에는 등불 주위로 부드러운 주황빛 후광이 은은하게 퍼진다.

배경은 거의 검정에 가까운 짙은 남색 먹빛 하나를 꽉 채운다. 별, 달, 글자, 테두리 없음. 등불은 그림 높이의 55% 정도. 정사각형 그림.
```

## 10. 축하 색종이 (판을 깼을 때 뿌려지는 조각) — 받을 예정

지금은 코드가 사각형 종잇조각(`.scrap`)을 뿌린다. 제미나이 그림으로 바꾸면 조각마다 한지 결과 오방색이 살아난다. 조각 하나하나를 따로 잘라 쓰므로 **서로 떨어져** 있어야 한다.

```
첨부한 등불 그림과 같은 화풍(한지에 수묵과 옅은 채색, 부드러운 종이 질감)으로, 잔치 때 뿌리는 색종이 조각들을 그려 줘. 조각은 모두 열두 개, 서로 겹치지 않고 넉넉히 떨어져 격자처럼 흩어 놓는다. 모양은 제각각: 길쭉한 띠, 네모, 마름모, 꽃잎 모양, 둥근 것. 색은 오방색(빨강, 파랑, 노랑, 흰빛에 가까운 옅은 회색, 검은빛이 아닌 짙은 남색)과 금빛. 조각마다 살짝 구부러지거나 비틀려서 공중에 떠 있는 느낌. 그림자 없음, 빛 번짐 없음, 배경은 순백 하나로 꽉 채운다. 글자, 테두리 없음. 정사각형 그림.
```

넣는 법: `art_bg.py`로 흰 배경을 지우고 덩어리마다 따로 저장(`art/confetti/*.webp`) → 판을 깰 때 `.scrap` 대신 이 그림들을 무작위로 골라 흩뿌린다(회전하며 떨어짐).

## 11. 불티 (등불이 터질 때 튀는 불꽃) — 받을 예정

```
검은 배경에 촛불에서 튀는 작은 불티 하나를 그려 줘. 가운데는 거의 흰빛에 가까운 노란 점, 그 둘레로 주황빛이 부드럽게 번지고 바깥은 어둠으로 사라진다. 아래쪽으로 짧고 가느다란 빛 꼬리가 하나. 그림 전체 크기의 40% 정도. 별, 글자, 테두리 없음. 배경은 순검정 하나. 정사각형 그림.
```

한 장 더: 같은 문장에서 "아래쪽으로 짧고 가느다란 빛 꼬리가 하나"를 "꼬리 없이 둥글게, 둘레에 아주 작은 불티 점 네댓 개"로 바꾼다. 넣는 법: 검은 배경 그림은 `mix-blend-mode: screen`으로 얹으면 검정이 사라지고 빛만 남는다. 터질 때 조각과 함께 불티 3~5개가 튀어 오른 뒤 떨어진다.

## 12. 강물 — 받을 예정

지금 강물은 코드로 그린 색띠와 반사(`-webkit-box-reflect`)다. 그림으로 바꾸면 물결 질감이 생긴다.

```
밤의 강물 표면만 그려 줘. 위에서 살짝 내려다본 각도, 화면 가득 검푸른 물결. 물결은 잔잔하고 가로로 길게 흐르며, 군데군데 등불빛이 비친 주황과 금빛의 길고 흔들리는 반사가 세로로 늘어진다. 화풍은 첨부한 등불과 같은 한지 수묵 채색. 강기슭, 등불 자체, 달, 별, 글자, 테두리 없음. 가로로 긴 그림(가로:세로 = 3:1). 왼쪽 끝과 오른쪽 끝이 이어져 반복해도 티가 안 나게.
```

넣는 법: `art/river.webp`로 저장 → `.water` 배경으로 깔고 아주 천천히 가로로 흐르게 한다(반복). 등불 반사는 그대로 위에 얹는다.


### 10~12 영어판 (같은 내용, 영어가 더 잘 나오면 이걸로)

10 색종이:
```
Twelve festival confetti pieces, drawn in the same style as the attached lantern (Korean hanji paper, ink and light watercolor, soft paper texture). Pieces do not touch: spread them out like a loose grid. Varied shapes: long ribbons, squares, diamonds, petal shapes, round dots. Colors: Korean obangsaek — red, blue, yellow, very pale grey-white, deep navy — plus gold. Each piece slightly curled or twisted as if floating. No shadows, no glow, no text, no border. Solid pure white background. Square image.
```
11 불티:
```
A single tiny candle spark on a pure black background. Near-white yellow core, soft orange glow around it fading into darkness, one short thin trail of light downward. The spark fills about 40% of the frame. No stars, no text, no border. Square image.
```
(둘째 장: "one short thin trail of light downward" → "no trail, round, with four or five tiny spark dots around it")

12 강물:
```
Night river surface only, seen from slightly above, filling the whole frame with deep blue-black water. Calm ripples flow horizontally; here and there long wavering vertical reflections of orange and gold lantern light. Same style as the attached lantern: Korean hanji paper, ink and light color wash. No riverbank, no lanterns themselves, no moon, no stars, no text, no border. Wide image, 3:1. Left and right edges should tile seamlessly.
```

## 예비: 색 변주 (코드 변주가 어색할 때만)

```
첨부한 등불 그림과 모양, 크기, 위치, 뚜껑, 테, 대나무 살, 화풍, 촛불 빛의 방향이 완전히 똑같은 등불을 그려 줘. 달라지는 것은 한지의 색 하나. 청록빛 한지: 아래쪽 가운데는 옅은 민트빛으로 밝고, 위쪽 가장자리는 짙은 청록. 나머지 조건은 첨부 그림과 같다: 술·끈·문양 없음, 바깥 빛 번짐 없음, 순백 배경, 같은 여백, 정사각형.
```

자주는 위 문장에서 "청록빛 한지: 아래쪽 가운데는 옅은 민트빛으로 밝고, 위쪽 가장자리는 짙은 청록"을 "자줏빛 한지: 아래쪽 가운데는 옅은 분홍빛으로 밝고, 위쪽 가장자리는 짙은 자주"로 바꿔 쓴다.

---

**시험판 7 현황**: 바위와 원경 네 장을 넣었다. 제미나이 그림 오른쪽 아래에 반짝이 표시(✦)가 찍혀 나오므로 원경은 오른쪽 170px를 잘라 버린다(가로로 긴 그림이라 잘려도 티가 안 난다). 원경은 어두운 정도를 투명도로 바꾼 흰 실루엣으로 저장하고(`art/bg1~4.webp`), 게임에서는 가림막(mask)으로 써서 먹빛(#08080D)을 칠한다. 뒤에 장 색의 옅은 불빛(haze)을 깔아 실루엣이 보이게 한다. 폰에서는 가로 760px 크기로 가운데만 보인다. 판 바로 아래(강물 윗선)에 놓이고, 인트로 화면에는 1장 마을이 깔린다. 바위는 등불과 같은 방식으로 배경을 지우고 가장 큰 덩어리만 남긴다.

## 음악 (수노)

`music/ch1.mp3` … `music/ch5.mp3` 로 저장소에 올리면 게임이 그 장에서 자동으로 튼다(파일이 없으면 합성 가락이 대신 흐른다). 이진 파일이므로 사용자가 깃허브 Upload 화면에 끌어다 놓는다.

공통 조건: **가사 없음(instrumental)**, 1분 30초~2분, 시작과 끝이 조용해서 반복해도 티가 안 남, 타악기 세지 않게, 게임 효과음(팡 소리)이 얹히므로 고음 영역을 비워 둘 것. 장 순서대로 으뜸음이 도→레→낮은 라→파→미 로 바뀌면 판을 넘길 때 자연스럽다(수노가 지켜 주지 않아도 됨).

| 파일 | 장 | 프롬프트 (그대로 복사) |
| --- | --- | --- |
| ch1.mp3 | 첫 밤 | `Gentle Korean night ambient, solo gayageum plucks over a soft warm pad, slow, sparse, lantern festival by a river, calm and hopeful, instrumental, no drums, seamless loop, quiet intro and outro` |
| ch2.mp3 | 바람 부는 밤 | `Airy Korean ambient, daegeum bamboo flute long breathy notes with light gayageum, wind over a river at night, floating, slightly brighter than before, instrumental, no drums, seamless loop` |
| ch3.mp3 | 깊은 밤 | `Deep quiet Korean temple night ambient, low sustained pad, distant wind chime, very sparse gayageum in a low register, mysterious and still, instrumental, no drums, seamless loop` |
| ch4.mp3 | 축제의 밤 | `Warm festive Korean night ambient, gayageum and haegeum melody, soft distant buk drum heartbeat, lantern market glow, gentle joy without being loud, instrumental, seamless loop` |
| ch5.mp3 | 새벽 | `Korean dawn ambient, piri or daegeum floating over a soft pad, first birds, pale pink sky, tender and resolving, instrumental, no drums, seamless loop, ends softly` |

검수: 소리가 갑자기 커지는 곳이 없는가, 끝이 뚝 끊기지 않는가, 40초쯤 들었을 때 게임 화면과 어울리는가.

**받음(시험판 9)**: ch1~ch5 모두 들어옴. 길이 2:00~3:38, 평균 -19dB로 고르고 끝은 조용히 사라진다. 끝난 뒤 다시 시작할 때 코드가 2.5초 페이드인을 건다(`game.js` `loadTrack`). 게임 안 세기는 `TRACK_VOL`(.8) × 배경음 버스(.5). 합성 가락은 파일이 없을 때만 나온다.

## 음악 4차 (신나는 타악 배경음) — 받을 예정, 지금 프롬프트

「효과음은 국악기(꽹과리·장구·북·징)로, 배경음은 그것과 어울리는 신나는 곡, 국악이 아니어도 됨」. 게임은 파도마다 배경음의 반박자에 맞춰 터뜨리므로(`design.md` 박자 맞춤) 곡은 **박자가 또렷하고 일정한 템포**여야 한다. 파일은 `music/ch1~5.mp3`에 덮어쓰고, 받은 뒤 `python3 tools/beats.py`를 돌려 `music/beats.json`을 갱신한다.

공통 조건(모든 프롬프트에 이미 들어 있음): 가사 없음 · 템포 일정(steady tempo, no tempo changes) · 강한 4분음표 박(clear beat) · 꽹과리·태평소 같은 날카로운 고음 악기는 곡에 넣지 않음(효과음이 그 자리를 맡음) · 2분 안팎 · 시작·끝 조용히.

| 파일 | 장 | 템포 | 프롬프트 (그대로 복사) |
| --- | --- | --- | --- |
| ch1.mp3 | 첫 밤 | 96 | `Upbeat Korean fusion instrumental, 96 bpm steady tempo, janggu and buk groove with warm electric bass and gayageum riff, bright lantern festival night, cheerful and bouncy, clear beat, no kkwaenggwari, no taepyeongso, no vocals, quiet intro and outro, seamless loop` |
| ch2.mp3 | 바람 부는 밤 | 104 | `Playful Korean fusion pop instrumental, 104 bpm steady tempo, light buk and janggu percussion, plucked gayageum melody, marimba sparkle, breezy riverside night, uplifting, clear beat, no kkwaenggwari, no taepyeongso, no vocals, quiet intro and outro, seamless loop` |
| ch3.mp3 | 깊은 밤 | 100 | `Driving Korean world-beat instrumental, 100 bpm steady tempo, deep buk drum pulse, janggu, low synth bass, haegeum hook, mysterious mountain temple night but energetic, clear beat, no kkwaenggwari, no taepyeongso, no vocals, quiet intro and outro, seamless loop` |
| ch4.mp3 | 축제의 밤 | 128 | `Festive Korean fusion dance instrumental, 128 bpm steady tempo, fast janggu and buk over four-on-the-floor kick, brass stabs, gayageum riff, village celebration at night, joyful and loud but not harsh, clear beat, no kkwaenggwari, no taepyeongso, no vocals, quiet intro and outro, seamless loop` |
| ch5.mp3 | 새벽 | 112 | `Hopeful Korean fusion instrumental, 112 bpm steady tempo, buk and janggu groove, bright piano and gayageum, strings rising, pale pink dawn after the festival, triumphant and warm, clear beat, no kkwaenggwari, no taepyeongso, no vocals, ends softly, seamless loop` |

검수: 박이 처음부터 끝까지 흔들리지 않는가(수노가 중간에 템포를 바꾸면 버림), 꽹과리 효과음이 얹혔을 때 시끄럽지 않은가, 40초쯤 들었을 때 신나는가.

### 음악 3차 (사물놀이) — 12에서 받아 씀, 4차가 오면 바뀜

배경음이 사물놀이를 맡던 시절의 프롬프트. 효과음이 다시 국악기로 돌아오자 같은 악기끼리 부딪혀 어색해져 4차로 간다.

## 음악 2차 (국악 장단) — 받음, 시험판 11.2~11.3에 씀(3차가 오면 바뀜)

사물놀이 효과음과 지금 곡(가야금 앰비언트)이 안 어울린다고 함. 같은 국악 장단 위에 있는 곡으로 바꾼다. 파일 이름은 그대로 `music/ch1~5.mp3`(덮어쓰기). 공통: 가사 없음, 2분 안팎, 장구는 은은하게(효과음 장구와 겹치지 않게 궁편 위주), 꽹과리·징은 넣지 않음(효과음 몫), 시작·끝 조용히.

| 파일 | 장 | 프롬프트 |
| --- | --- | --- |
| ch1.mp3 | 첫 밤 | `Korean traditional gugak instrumental, gayageum melody over a soft janggu gutgeori rhythm (12/8, slow), warm and gentle night, lantern festival by a river, no kkwaenggwari, no gong, no vocals, seamless loop` |
| ch2.mp3 | 바람 부는 밤 | `Korean gugak instrumental, daegeum flute and gayageum, light janggu jungmori rhythm, breezy and flowing, slightly brighter, no kkwaenggwari, no gong, no vocals, seamless loop` |
| ch3.mp3 | 깊은 밤 | `Korean gugak instrumental, geomungo and ajaeng low drones, very sparse slow janggu, deep mountain temple night, mysterious, no kkwaenggwari, no gong, no vocals, seamless loop` |
| ch4.mp3 | 축제의 밤 | `Korean gugak festive instrumental, haegeum and piri melody, lively janggu and buk jajinmori rhythm, joyful village festival night, moderate volume, no kkwaenggwari, no vocals, seamless loop` |
| ch5.mp3 | 새벽 | `Korean gugak instrumental, daegeum and gayageum, gentle janggu gutgeori, pale dawn, hopeful and resolving, soft ending, no kkwaenggwari, no gong, no vocals, seamless loop` |

받은 곡: 길이 2:21~3:20, 평균 -18~-20dB로 고름. ch4만 끝이 뚝 끊겨(-21dB) 마지막 4초에 페이드아웃을 넣어 다시 인코딩했다.

코드 쪽: 연쇄가 터지는 동안 배경음을 .5→.14로 잠깐 낮춘다(`duck()`, 1.4초 뒤 되돌림). 판을 깬 한 마디 동안은 3.2초.

## 효과음 (파일)

`sfx/` 에 아래 이름으로 넣으면 게임이 그것을 쓰고, 없는 것은 합성음이 대신 난다. 곡과 달리 **수노는 효과음에 약하다** — 짧은 소리는 일레븐랩스 Sound Effects(무료 한도 있음)나 프리사운드(freesound.org, 검색어 `paper pop`, `paper lantern burst`, `paper bag pop`)가 낫다. 어디서 받든 상관없고, 받은 원본을 그대로 주면 Claude가 `tools/sfx.py`로 앞 무음을 자르고 크기를 맞춰 넣는다.

| 파일 | 소리 | 프롬프트 (일레븐랩스 등에 그대로) |
| --- | --- | --- |
| pop1.mp3 | 작은 등불 팡 (1칸). 가볍고 높음, 0.3초 | `small paper lantern bursting, light dry paper pop with a soft airy puff, short, close, no reverb, no music` |
| pop2.mp3 | 보통 등불 팡 (2칸). 0.4초 | `paper lantern bursting open, crisp paper pop with a gentle warm thump and a brief flutter of paper scraps, short, no music` |
| pop3.mp3 | 큰 등불 팡 (3칸). 낮고 묵직, 0.5초 | `large paper lantern bursting, deep soft thump with a satisfying paper rip and scraps fluttering, short, punchy, no music` |
| final.mp3 | 마지막 등불. 크게 터지며 반짝이 꼬리, 2초 | `big paper lantern burst followed by a shimmering magical sparkle tail and soft chime, celebratory, warm, 2 seconds, no music` |
| peel.mp3 | 겉종이 벗겨짐 | `thin paper sheet being peeled off softly, light rustle, very short` |
| fuse.mp3 | 심지에 불붙음 | `small fuse igniting with a soft hiss and crackle, short` |
| pop1b · pop2b · pop3b | (선택) 같은 소리의 변주. 있으면 번갈아 나서 덜 반복적 | 위와 같은 프롬프트로 한 번 더 |

검수: 팡이 파일 맨 앞에 붙어 있는가(앞 무음은 도구가 자름), 잔향이 길지 않은가(잔향은 코드가 얹음), 세 크기가 확실히 낮아지는가. 연쇄가 이어질수록 살짝 높아지는 것은 코드가 재생 속도로 건다.

**꺼 둠(시험판 10, 합성 사물놀이로 바꿈 — design.md 사운드)**: 「HQ fire work sound, 고음질 폭죽소리.mp3」(42초, 7초 뒤 펑 여덟 번) → `sfx/hq/`. 펑의 머리만 0.25~0.4초로 짧게 잘라 타닥거리는 꼬리를 버리고(꼬리는 마지막 등불에만), 150Hz 아래 울림을 걸러낸 뒤 큰 등불에는 64Hz 쿵을 더했다. 결과: 작은 750Hz·보통 611Hz·큰 411Hz, -20dB까지 170~330ms. `game.js` `SFX_DIR = 'sfx/hq'`. 자른 시각은 `tools/sfx_cut.py`의 `hq` 묶음. 처음엔 작고 늦게 들린다고 했다 → 세기를 .72로 올리고, 읽어 들일 때 최고치의 8% 지점(실제 펑 시작)을 찾아 거기서부터 재생해 mp3 앞의 빈 구간을 없앴다(`buf._off`). AudioContext는 `latencyHint: 'interactive'`. 검사: 탭 뒤 첫 소리 22ms. 그래도 「기계음」이라 했다 → 연쇄마다 재생 속도를 올려(최대 1.8배) 폭죽이 뿅뿅거렸던 것을 없앴다(속도는 ±3%만, 고조는 세기로). 남아 있던 사인파 삑 소리들(단추 톡, 겉종이, 거울, 풀벌레, 소쩍새)도 잡음·떨림 섞인 소리로 바꿨다.

**꺼 둔 것**: 불꽃놀이 조각은 웅웅하고 지저분해서 등불 터지는 느낌이 안 났다. `sfx/fireworks/`에 남겨 두고 `game.js`의 `SFX_DIR`을 비워 합성음으로 돌렸다. 다음 파일은 **가깝고 마른 소리**여야 한다: 풍선 터짐(balloon pop), 종이봉투 터짐(paper bag pop), 뽁뽁이(bubble wrap pop) 계열. 잔향·거리감이 있는 야외 녹음은 피한다. 아래는 그때의 기록. 「불꽃놀이 소리 ASMR.mp3」(21.5초) 한 파일로 전부 만들었다. 14.40·16.19·18.48·19.80초의 또렷한 펑 네 번을 등불 크기별로 나누고(낮은 896Hz 펑 → 큰 등불), 음높이를 살짝 옮겨 차이를 벌리고 큰 등불에는 62Hz 쿵을 더했다. 마지막 등불은 18.48초부터 2.9초(펑 두 번과 잔불), 심지는 앞부분 타닥거림 한 조각. 자르는 시각과 조건은 `tools/sfx_cut.py`에 그대로 있다(다른 녹음을 받으면 시각만 바꿔 다시 돌린다). 겉종이(peel)는 파일 없이 합성음 그대로. 게임 안 세기는 팡 .42, 마지막 .75(`game.js` `pop`/`resolve`).

## 국악기 효과음 (시험판 11·13, 지금 쓰는 것)

합성 사물놀이가 「가짜 같다·싸구려」라서 진짜 녹음으로 바꿨다. 사용자가 받은 네 파일(공유마당 등에서):

| 받은 파일 | 악기 | 잘라 낸 것 (`sfx/gugak/`) |
| --- | --- | --- |
| 국악기_꽹과리1.mp3 (18초, 점점 세게 치는 연습) | 꽹과리 | kk1·kk2 열린 「갱」(12.12s·9.52s) · kks1·kks2 막은 「갠」(12.66s·7.66s) |
| 전통악기_장구_치다_보통속도_Ver.1_MKH418_ST_192.mp3 (31초) | 장구 | deong1·2 덩(1.94s·3.33s) · deok1·2 덕/채편(7.11s·8.44s) · kung1·2 쿵/궁편(23.20s·24.49s) |
| 전통악기_북_치다_빠른속도_MKH418_ST_192.mp3 (26초) | 북 | buk1 (0.59s, 맨 처음 큰 한 번) |
| 국악 효과음 #705.mp3 (5초) | 징 | jing (4.6초 전체) |

- 자르는 도구: `tools/sfx_gugak.py <받은 폴더>`. 시작점은 각 타격 앞뒤 30ms 안에서 최고치 15%를 넘는 첫 지점.
- 게임: 녹음이 읽히면 `kkw`·`jg`·`bk`·`jn`이 녹음을 틀고, 없으면 합성 악기. 같은 악기 두 벌을 무작위로 번갈아 반복감을 줄이고 좌우로 살짝 흩뜨린다. 세기는 악기마다 맞춤(꽹과리 ×3.2, 덩 ×1.8, 덕 ×2.3, 북 ×1.15, 징 ×2.2).
- **출처 표시 확인 필요**: 받은 곳의 이용 조건(특히 「출처 표시」)을 사용자에게 확인하고 README에 적는다.

## 처리 과정 (Claude)

1. 받은 그림을 작게 줄여 눈으로 먼저 본다. 검수 항목에 걸리면 다시 뽑아 달라고 한다.
2. **배경 지우기**: 테두리에서 이어진 흰 영역만 지운다. 색 차이로 지우면 등불 안쪽의 밝은 부분까지 뚫린다. 갇힌 흰 주머니는 작은 것만 지운다. 가장자리는 1~2px 부드럽게.
3. **자르기**: 등불을 빈틈없이 감싸게 자르고, 뚜껑 가운데가 위 끈 자리에 오게 맞춘다.
4. **크기**: 등불은 가로 256px, 원경은 가로 1200px. webp로 저장해 파일 안에 넣는다.
5. **원경**: 흰색은 투명, 실루엣은 하늘색과 어울리게 다시 칠한다. 장마다 먹빛 농도를 맞춘다.
6. **색 변주**: 한지 영역(채도 높은 픽셀)만 색상을 옮기고 뚜껑·테의 갈색은 그대로 둔다.
7. **확인**: 등불 세 크기(1·2·3칸)에서 작게 봐도 읽히는지, 매듭·금띠·겉종이·심지 표시가 그림 위에서 잘 보이는지, `e2e.py`로 전 판 재생.
