# 카레시를 찾아서 | KARESI

> Find your — · — · — · — · · · · · ·
> 열두 개의 정류장을 지나 나를 닮은 카레시의 옷 한 벌을 찾아가는 인터랙티브 웹사이트.

빌드 도구 없이 HTML / CSS / JS만으로 동작해서, GitHub Pages에 그대로 올리면 끝이야.

---

## 1. GitHub Pages로 배포하기

1. GitHub에서 **New repository** → 이름 예: `karesi` → **Public**으로 생성
2. zip 압축을 풀고, `karesi-journey` 폴더 **안에 있는 것들**을 저장소 첫 화면에 끌어다 놓기
   `index.html` · `css/` · `js/` · `assets/` · `README.md` (`.nojekyll`은 보이면 같이)
   → `index.html`이 저장소 맨 위에 있어야 해. 폴더째 올려서 `karesi-journey/index.html`이 되면 안 열려.
3. **Commit changes**
4. **Settings → Pages → Build and deployment**
   - Source: `Deploy from a branch`
   - Branch: `main` / `/ (root)` → **Save**
5. 1~2분 뒤 `https://<깃허브아이디>.github.io/karesi/` 에서 열려

## 2. 폴더 구조

```
index.html          화면 뼈대 (첫 화면 · 프롤로그 · 질문 · 로딩 · 결과 · 패널)
css/style.css       디자인 (미니멀 톤, 다크 모드, 모바일 대응)
js/data.js          ★ 질문 · 결과 12벌 · 프롤로그 대사 · 링크 — 내용 수정은 여기서!
js/engine.js        점수 계산 엔진
js/morse.js         카레시 모스부호 바늘땀
js/app.js           화면 흐름, 결과 페이지, 공유, 결과 카드 저장
assets/cutout/      옷 누끼 이미지 01~12
assets/story/       프롤로그 일러스트 01~03
assets/face/        프롤로그 주인공 표정 6종
```

## 3. 점수 계산 방식

| 단계 | 내용 |
|---|---|
| ① 축 누적 | 선택지마다 4개 축에 -2~+2 점수가 쌓여 |
| ② 정규화 | 축별 최대치의 60%를 ±100으로 보고 -100 ~ +100 좌표로 변환 |
| ③ 매칭 | 12벌의 옷 좌표와 거리를 재서 가장 가까운 옷이 나의 카레시, 두 번째가 부캐 |
| ④ 일치도 | 거리가 가까울수록 높은 %로 환산 |

4개 축: **실루엣**(테일러드 ↔ 릴랙스드) · **디자인**(에센셜 ↔ 스테이트먼트) · **무드**(엣지 ↔ 소프트) · **구성**(미니멀 ↔ 레이어드)

- 같은 옷의 다른 컬러는 무드 축으로 갈려 (블랙 = 엣지, 밝은 컬러 = 소프트).
- 10만 명 랜덤 시뮬레이션에서 12벌이 각각 약 7~9%씩 나오도록 좌표를 맞춰뒀어.
- 질문 점수나 옷 좌표를 바꾸면 균형이 달라질 수 있으니, 바꾼 뒤엔 다시 확인하는 게 좋아.

## 4. 자주 고치는 것 (`js/data.js`)

- **질문 문구**: `questions` 배열의 `scene`(소제목), `q`(타이틀), `options`의 `text`
- **선택지 섞기**: `shuffleOptions: true`로 바꾸면 매번 순서가 섞여
- **구매 링크**: 옷마다 `shop` (무신사는 `shopName: '무신사'`도 같이)
- **가격 표시**: `showPrice: true` + 옷마다 `price: '00,000원'`
- **프롤로그**: `prologue`의 `lines` — `who`(이름표, 비우면 내레이션) · `text` · `face`(표정)
  - 표정: `neutral` 기본 · `curious` 궁금 · `surprised` 놀람 · `thinking` 고민 · `happy` 웃음 · `determined` 결심
- **연락처**: `js/app.js`의 `PANELS.contact` 안 이메일 / 인스타를 실제 값으로

## 5. 확인용 주소

사이트 주소 뒤에 `#type-1` ~ `#type-12`를 붙이면 각 결과 페이지를 바로 볼 수 있어.

## 6. 링크 미리보기 이미지

카톡·인스타에 링크를 붙였을 때 뜨는 이미지는 `assets/og.jpg`야.
배포 후 `index.html`의 `og:image`를 전체 주소(예: `https://아이디.github.io/karesi/assets/og.jpg`)로 바꾸면 미리보기가 더 확실하게 떠.
