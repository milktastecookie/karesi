/* =========================================================
   KARESI · 데이터
   - axes      : 패션 성향 4축 (-100 ~ +100)
   - types     : 12벌의 카레시 (coord = 각 옷의 좌표)
                 같은 아이템은 실루엣·디자인·구성을 공유하고
                 컬러별로 무드만 달라.
   - questions : 12문항 (각 문항의 네 선택지 점수 합 = 0)
   좌표는 10만 명 시뮬레이션에서 12벌이 7~9%씩 고르게
   나오도록 맞춘 값이야. 바꾸면 다시 시뮬레이션해줘.
   ========================================================= */
window.KARESI_DATA = {
  // 상품 페이지가 없는 옷은 스토어 첫 화면으로 연결돼
  shopHome: 'https://karesi0.cafe24.com/',
  // 선택지 순서를 매번 섞을지 (false = 적어둔 순서 그대로)
  shuffleOptions: false,
  // 결과 화면에 가격을 보여줄지 (true로 바꾸고 옷마다 price: '00,000원'을 넣으면 다시 보여)
  showPrice: false,

  axes: [
    { key: 'f', name: '실루엣', neg: '테일러드', pos: '릴랙스드', negEn: 'TAILORED', posEn: 'RELAXED' },
    { key: 'd', name: '디자인', neg: '에센셜', pos: '스테이트먼트', negEn: 'ESSENTIAL', posEn: 'STATEMENT' },
    { key: 'm', name: '무드', neg: '엣지', pos: '소프트', negEn: 'EDGE', posEn: 'SOFT' },
    { key: 'c', name: '구성', neg: '미니멀', pos: '레이어드', negEn: 'MINIMAL', posEn: 'LAYERED' }
  ],

  types: [
    {
      id: 1, shop: 'https://karesi0.cafe24.com/product/robust-lover-swing-top-cotton-jacket/18/', item: '로버스트 스윙탑 코튼 자켓', color: '네이비', colorHex: '#1E2638',
      img: 'assets/cutout/01.webp',
      persona: '정석의 기본기', personaEn: 'THE ESSENTIALIST',
      tagline: '기본만 잘 갖춰도 멋이 난다는 걸 아는 사람',
      coord: { f: -100, d: -55, m: 9, c: -70 },
      desc: [
        '화려한 디테일보다 정확한 어깨선과 끝까지 단정하게 닫히는 지퍼에 먼저 눈이 가는 사람이야. 유행이 지나가도 남는 게 무엇인지 알아보고, 옷장을 오래 입을 옷들로 차곡차곡 채워가.',
        '처음엔 무난해 보인다는 말을 들을 수도 있어. 그런데 같은 네이비 자켓 하나로 출근룩부터 주말룩까지 소화하는 건 아무나 못 해. 사실은 가장 까다롭고 확실한 취향이야.'
      ],
      traits: [
        '약속 장소에 늘 5분 먼저 도착해 있어',
        '옷장 색이 네이비, 화이트, 그레이로 정리돼 있어',
        '새 옷을 살 때 "이거 3년 뒤에도 입을까?"부터 생각해',
        '친구들이 중요한 날 입을 옷을 물어보러 와'
      ],
      quote: '좋은 기본은 유행을 타지 않아.',
      keywords: ['#테일러드', '#에센셜', '#단정함', '#신뢰감'],
      details: [
        { name: '셔츠 칼라', note: '깃이 반듯하게 서서 단추 없이도 셔츠처럼 정돈돼 보여.' },
        { name: '투웨이 지퍼', note: '아래쪽을 살짝 열면 앉거나 움직일 때 품이 편해져.' },
        { name: '사선 웰트 포켓', note: '겉으로 튀지 않게 절개만 남긴 주머니라 라인이 깔끔해.' },
        { name: '밑단 밴딩', note: '허리선에서 살짝 모아져 스윙탑 특유의 짧고 단단한 실루엣을 만들어.' },
        { name: '스냅 커프', note: '소매 끝을 똑딱이로 여며서 손목이 단정하게 정리돼.' }
      ],
      styling: [
        { title: '톤온톤 정석', with: [6], note: '같은 네이비 커브드 팬츠로 맞추고 안에 흰 티 한 장. 가장 실패 없는 조합이야.' },
        { title: '선명한 대비', with: [5], note: '블랙 팬츠로 무게 중심을 아래에 두면 상체 라인이 더 또렷해져.' },
        { title: '힘 뺀 주말', with: [9], note: '아이보리 그레이 후드를 안에 입고 후드만 밖으로 꺼내면 단정함이 부드럽게 풀려.' }
      ]
    },
    { id: 2, shop: 'https://www.musinsa.com/products/7399554', shopName: '무신사', item: '사선 크롭 후드집업', color: '슬레이트 블루', colorHex: '#5B6B78', img: 'assets/cutout/02.webp',
      persona: '비틀기 장인', personaEn: 'THE TWISTER', tagline: '남들과 같은 선을 한 번 비틀어 시선을 가져가는 사람',
      coord: { f: 28, d: 77, m: -20, c: 22 }, draft: true },
    { id: 3, shop: 'https://www.musinsa.com/products/7088528', shopName: '무신사', item: '드레이프드 레이어드 크롭 헨리넥 티셔츠 우먼', color: '블랙', colorHex: '#141414', img: 'assets/cutout/03.webp',
      persona: '시크 레이어러', personaEn: 'THE CHIC LAYERER', tagline: '딱 맞는 핏에 레이어드 한 겹, 계산된 쿨함',
      coord: { f: -66, d: 38, m: -46, c: 75 }, draft: true },
    { id: 4, shop: 'https://www.musinsa.com/products/7088526', shopName: '무신사', item: '드레이프드 레이어드 크롭 헨리넥 티셔츠 우먼', color: '미스트 블루', colorHex: '#6E97C9', img: 'assets/cutout/04.webp',
      persona: '청량 레이어러', personaEn: 'THE CLEAR LAYERER', tagline: '정돈됐지만 부드러운, 맑은 날 같은 사람',
      coord: { f: -66, d: 38, m: 22, c: 75 }, draft: true },
    { id: 5, shop: 'https://karesi0.cafe24.com/product/robust-lover-curved-cotton-pants-black/16/', item: '로버스트 커브드 코튼 팬츠', color: '블랙', colorHex: '#111111', img: 'assets/cutout/05.webp',
      persona: '올블랙 미니멀리스트', personaEn: 'THE MINIMALIST', tagline: '말보다 실루엣으로 말하는 사람',
      coord: { f: 12, d: -59, m: -39, c: -69 }, draft: true },
    { id: 6, shop: 'https://karesi0.cafe24.com/product/Robust-cotton-pants-%5BNavy%5D/17/', item: '로버스트 커브드 코튼 팬츠', color: '네이비', colorHex: '#1D3047', img: 'assets/cutout/06.webp',
      persona: '무던한 베이스메이커', personaEn: 'THE BASEMAKER', tagline: '어떤 조합에도 어울려주는, 모두의 기본값',
      coord: { f: 12, d: -59, m: -1, c: -69 }, draft: true },
    { id: 7, shop: 'https://karesi0.cafe24.com/product/robust-lover-curved-cotton-pants-khaki-gray/15/', item: '로버스트 커브드 코튼 팬츠', color: '카키 그레이', colorHex: '#5E605A', img: 'assets/cutout/07.webp',
      persona: '얼씨 내추럴리스트', personaEn: 'THE NATURALIST', tagline: '흙빛처럼 편안한데 취향은 확실한 사람',
      coord: { f: 12, d: -59, m: 29, c: -69 }, draft: true },
    { id: 8, shop: 'https://karesi0.cafe24.com/product/comfort-lover-henley-hoodie-navy/11/', item: '컴포트 헨리넥 후드', color: '네이비', colorHex: '#1F2439', img: 'assets/cutout/08.webp',
      persona: '데일리 하이브리드', personaEn: 'THE HYBRID', tagline: '편한 것과 멋 낸 것 사이를 매일 오가는 사람',
      coord: { f: 66, d: 13, m: 13, c: -18 }, draft: true },
    { id: 9, shop: 'https://karesi0.cafe24.com/product/comfort-lover-henley-hoodie-ivory-gray/13/', item: '컴포트 헨리넥 후드', color: '아이보리 그레이', colorHex: '#D9D6D0', img: 'assets/cutout/09.webp',
      persona: '구름 무드메이커', personaEn: 'THE CLOUD', tagline: '곁에 있으면 분위기가 포근해지는 사람',
      coord: { f: 66, d: 13, m: 64, c: -18 }, draft: true },
    { id: 10, shop: 'https://karesi0.cafe24.com/product/comfort-lover-henley-hoodie-black/14/', item: '컴포트 헨리넥 후드', color: '블랙', colorHex: '#121212', img: 'assets/cutout/10.webp',
      persona: '무심한 스트릿', personaEn: 'THE STREET', tagline: '대충 입은 것 같은데 제일 힙한 사람',
      coord: { f: 66, d: 13, m: -77, c: -18 }, draft: true },
    { id: 11, shop: 'https://www.musinsa.com/products/6579389', shopName: '무신사', item: '드레이프드 레이어드 크롭 헨리넥 티셔츠', color: '미스트 블루', colorHex: '#6E97C9', img: 'assets/cutout/11.webp',
      persona: '여유로운 청량파', personaEn: 'THE BREEZE', tagline: '느슨하고 맑은, 바람 통하는 스타일',
      coord: { f: 50, d: 11, m: 20, c: 72 }, draft: true },
    { id: 12, shop: 'https://www.musinsa.com/products/6579383', shopName: '무신사', item: '드레이프드 레이어드 크롭 헨리넥 티셔츠', color: '블랙', colorHex: '#141414', img: 'assets/cutout/12.webp',
      persona: '느슨한 엣지', personaEn: 'THE LOOSE EDGE', tagline: '편하게 걸쳤지만 분위기는 날카로운 사람',
      coord: { f: 50, d: 11, m: -14, c: 72 }, draft: true }
  ],

  questions: [
    { station: '출발역', en: 'DEPARTURE', scene: '카레시를 찾으러 가는 첫 걸음.', q: '가방을 쌀 때 나는?',
      options: [
        { id: 'a', text: '꼭 챙기는 나만의 아이템으로', delta: { d: 2, c: 1 } },
        { id: 'b', text: '혹시 몰라 이것저것 막', delta: { c: 2 } },
        { id: 'c', text: '꼭 필요한 것만, 파우치에 딱', delta: { c: -2 } },
        { id: 'd', text: '늘 챙기던 그대로, 고민 없이', delta: { d: -2, c: -1 } }
      ] },
    { station: '카레라이스 골목', en: 'CURRY ALLEY', scene: '출발하기 전에 카레집에서 배를 채우자.', q: '너의 주문은?',
      options: [
        { id: 'a', text: '오늘 처음 나온 독특한 신메뉴', delta: { d: 2, m: -1 } },
        { id: 'b', text: '최고로 매운맛 카레', delta: { m: -1 } },
        { id: 'c', text: '기본 카레 그대로', delta: { d: -2 } },
        { id: 'd', text: '노른자 툭, 예쁜 플레이팅 세트', delta: { m: 2 } }
      ] },
    { station: '피팅룸', en: 'FITTING ROOM', scene: '여정을 떠나기 위한 옷.', q: '제일 마음이 가는 핏은?',
      options: [
        { id: 'a', text: '어깨선이 딱 맞는 정사이즈', delta: { f: -2 } },
        { id: 'b', text: '짧게 떨어지는 크롭 기장', delta: { f: -1, d: 1 } },
        { id: 'c', text: '한 치수 크게 오버핏', delta: { f: 2 } },
        { id: 'd', text: '아래로 툭 떨어지는 와이드', delta: { f: 1, d: -1 } }
      ] },
    { station: '구리시 갈림길', en: 'GURI-SI JUNCTION', scene: '갈림길마다 색이 다른 표지판이 서 있어.', q: '가장 마음이 끌리는 색은?',
      options: [
        { id: 'a', text: '무난한 블랙과 화이트', delta: { m: -2 } },
        { id: 'b', text: '네이비나 차콜 같은 깊은 색', delta: { d: -1, f: -1 } },
        { id: 'c', text: '분위기 있는 카키, 그레이', delta: { f: 1 } },
        { id: 'd', text: '맑은 하늘빛', delta: { m: 2, d: 1 } }
      ] },
    { station: '카레이싱 서킷', en: 'KA-RACING CIRCUIT', scene: '굿즈샵을 마주쳤다.', q: '하나만 고른다면?',
      options: [
        { id: 'a', text: '무지 티셔츠', delta: { d: -2, c: -1, m: 1 } },
        { id: 'b', text: '레이싱 재킷', delta: { d: 2, c: 2 } },
        { id: 'c', text: '심플한 캡', delta: { d: -1, c: -1 } },
        { id: 'd', text: '패턴 머플러', delta: { d: 1, m: -1 } }
      ] },
    { station: '파레시 카페', en: 'PARE-SI CAFÉ', scene: '비가 와서 잠깐 카페에 앉았어.', q: '카페에 흘렀으면 좋겠는 음악은?',
      options: [
        { id: 'a', text: '신나는 케이팝', delta: { m: -1 } },
        { id: 'b', text: '묵직한 비트의 힙합', delta: { m: -2, f: 1 } },
        { id: 'c', text: '잔잔한 어쿠스틱', delta: { m: 2 } },
        { id: 'd', text: '재즈 피아노', delta: { m: 1, f: -1 } }
      ] },
    { station: '카리스마 광장', en: 'KA-RISMA PLAZA', scene: '스냅 작가가 다가와 사진을 찍어도 되냐고 물어.', q: '작가가 나에게 말을 건 이유는 무엇일까?',
      options: [
        { id: 'a', text: '"옷 디테일이 독특해서요"', delta: { d: 2, c: 1 } },
        { id: 'b', text: '"조합이 정말 깔끔해서요"', delta: { d: -1, c: -2 } },
        { id: 'c', text: '"분위기가 포근해서요"', delta: { m: 2, f: 1, c: 1 } },
        { id: 'd', text: '"포스가 남달라서요"', delta: { m: -2, f: -1, d: -1 } }
      ] },
    { station: '클래식 양복점', en: 'CLASSIC TAILOR', scene: '바지 수선을 권유 받았어.', q: '너의 주문은?',
      options: [
        { id: 'a', text: '복숭아뼈 기장에 칼주름', delta: { f: -2, c: -1 } },
        { id: 'b', text: '밑단이 신발 위에 살짝 쌓이게', delta: { f: 2 } },
        { id: 'c', text: '수선 대신 롤업으로 포인트', delta: { d: 1, c: 1 } },
        { id: 'd', text: '원래 핏 그대로, 손대지 않기', delta: { d: -1 } }
      ] },
    { station: '빈티지 마켓', en: 'VINTAGE MARKET', scene: '마음에 쏙 드는 티셔츠를 한 장 샀어.', q: '어떻게 입을래?',
      options: [
        { id: 'a', text: '한 장으로 깔끔하게', delta: { c: -2 } },
        { id: 'b', text: '다른 색 티를 받쳐 레이어드', delta: { c: 2, d: 1 } },
        { id: 'c', text: '셔츠를 열어서 걸치기', delta: { c: 1, f: 1, d: -1 } },
        { id: 'd', text: '바지에 넣어 입고 벨트로 마무리', delta: { f: -1, c: -1 } }
      ] },
    { type: 'slider', axis: 'c', min: -2, max: 2,
      station: '휴게소', en: 'REST AREA', scene: '잠깐 쉬어가며 거울을 봤어.', q: '지퍼, 단추, 후드… 옷의 디테일은 어디까지 좋아?',
      labels: ['단추 하나도 많아', '많을수록 좋아'] },
    { station: '해질녘 강변', en: 'RIVERSIDE', scene: '해가 지자 바람이 쌀쌀해졌어.', q: '가방에서 꺼내는 아우터는?',
      options: [
        { id: 'a', text: '비대칭 지퍼의 크롭 아우터', delta: { d: 2, m: -1 } },
        { id: 'b', text: '얇은 가디건을 툭 걸치기', delta: { d: -1 } },
        { id: 'c', text: '푹 뒤집어쓰는 후드집업', delta: { f: 2, m: 1 } },
        { id: 'd', text: '지퍼 끝까지 올리는 깔끔한 자켓', delta: { f: -2, d: -1 } }
      ] },
    { station: '종착역', en: 'TERMINAL · KARESI', scene: '저 멀리 누군가 손을 흔들어. 드디어 만났어.', q: '카레시는 나를 보고 어떤 말을 꺼낼까?',
      options: [
        { id: 'a', text: '너 진짜 분위기 있다', delta: { m: 2 } },
        { id: 'b', text: '편해 보이는 옷 입었다', delta: { f: 1, m: -1 } },
        { id: 'c', text: '단정하게 입고 왔네?', delta: { d: -2, f: -1 } },
        { id: 'd', text: '그 옷 엄청 독특하다', delta: { d: 2, m: -1 } }
      ] }
  ],

  /* 프롤로그: 미연시처럼 대사를 한 줄씩 넘겨.
     img에 일러스트 경로를 넣으면 화면 전체 배경으로 깔려 (1920×1080 권장).
     focus는 휴대폰 세로 화면에서 그림을 자를 때 남길 위치야 (가로%, 세로%).
     who가 비어 있으면 내레이션이야.
     face는 대사창 옆 주인공 표정: neutral 기본 · curious 궁금 · surprised 놀람 · thinking 고민 · happy 웃음 · determined 결심 */
  prologue: [
    { place: '오후의 공원', placeEn: 'THE PARK', img: 'assets/story/01.webp', focus: '37% 50%',
      lines: [
        { face: 'neutral', who: '', text: '햇살이 쏟아지는 오후. 벤치에 앉아 지나가는 사람들을 보고 있었어.' },
        { face: 'thinking', who: '나', text: '찾는 사람이… 어디엔가 있을까?' },
        { face: 'neutral', who: '', text: '어딘가에 있을 것만 같은, 아직 만나지 못한 나의 카레시.' }
      ] },
    { place: '옷장 앞', placeEn: 'THE CLOSET', img: 'assets/story/02.webp', focus: '53% 50%',
      lines: [
        { face: 'surprised', who: '', text: '집에 돌아와 옷장을 열었어. 늘 입던 옷들 사이에 처음 보는 자켓 한 벌.' },
        { face: 'curious', who: '', text: '안감에 짧고, 길고, 짧은 바늘땀이 나란히 수놓여 있어.' },
        { face: 'thinking', who: '나', text: '이건… 누가 보낸 신호일까?' }
      ] },
    { place: '지도에 없는 정류장', placeEn: 'THE PLATFORM', img: 'assets/story/03.webp', focus: '55% 50%',
      lines: [
        { face: 'curious', who: '', text: '바늘땀을 따라가다 보니, 지도에 없는 정류장에 도착했어.' },
        { face: 'surprised', who: '???', text: '어서 와. 카레시를 찾으러 왔구나.' },
        { face: 'neutral', who: '???', text: '열두 개의 정류장을 지나면 만날 수 있어. 대신, 마음이 가는 쪽으로만 골라야 해.' },
        { face: 'determined', who: '나', text: '좋아. 어쩌면, 지금 이곳에 있을지도 몰라.' }
      ] }
  ],

  loadingWords: ['카레라이스...?', '구리시...?', '파레시...?', '카레이싱...?', '카리스마...?', '클래식...?', '찾았다!']
};
