/* =========================================================
   KARESI · 화면 흐름
   intro → journey(12 정류장) → loading → result
   주소 뒤에 #type-1 ~ #type-12 를 붙이면 그 옷의 결과 페이지를
   바로 볼 수 있어 (디자인 확인용).
   ========================================================= */
(function () {
  'use strict';
  var D = window.KARESI_DATA, E = window.KARESI_ENGINE, MO = window.KARESI_MORSE;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var typeById = function (id) { return D.types.filter(function (t) { return t.id === +id; })[0]; };
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var LETTERS = 'ABCD';
  var TOTAL = D.questions.length;
  var TYPES = D.types.length;

  var state = { idx: 0, answers: [], times: [], order: [], qStart: 0, lock: false, result: null, mode: 'me' };

  /* ---------- 화면 전환 ---------- */
  function show(name) {
    $$('.screen').forEach(function (s) { s.classList.toggle('is-active', s.id === 'screen-' + name); });
    document.body.dataset.screen = name;
    window.scrollTo(0, 0);
  }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function setHash(h) { history.replaceState(null, '', location.pathname + location.search + (h ? '#' + h : '')); }

  /* ---------- 여정 ---------- */
  function startJourney() {
    closePanel();
    setHash('');
    state.idx = 0;
    state.answers = D.questions.map(function () { return null; });
    state.times = D.questions.map(function () { return null; });
    state.order = D.questions.map(function (q) {
      if (!q.options) return null;
      var ids = q.options.map(function (o) { return o.id; });
      return D.shuffleOptions ? shuffle(ids) : ids;
    });
    buildRoute();
    show('journey');
    renderQuestion();
  }

  // 진행 바: 정류장 하나 = 바늘땀 하나
  function buildRoute() {
    $('#jstitch').innerHTML = D.questions.map(function () { return '<i class="st st--s"></i>'; }).join('');
  }
  function updateRoute() {
    $$('#jstitch .st').forEach(function (el, i) {
      el.classList.toggle('is-done', i < state.idx);
      el.classList.toggle('is-now', i === state.idx);
    });
  }

  function renderQuestion() {
    var q = D.questions[state.idx];
    $('#q-count').textContent = pad(state.idx + 1) + ' / ' + pad(TOTAL);
    $('#q-station').innerHTML = '<b>' + q.station + '</b><em>' + q.en + '</em>';
    $('#q-scene').textContent = q.scene;
    $('#q-text').textContent = q.q;

    var box = $('#q-options');
    box.className = 'qcard__options' + (q.type === 'slider' ? ' is-slider' : '');
    if (q.type === 'slider') {
      var prev = state.answers[state.idx];
      var v = prev ? prev.value : 50;
      box.innerHTML =
        '<div class="slider">' +
          '<div class="slider__readout"><span id="slider-num">0</span><small>/ 10 DETAIL</small></div>' +
          '<input type="range" min="0" max="100" step="1" value="' + v + '" id="slider" aria-label="' + q.q + '">' +
          '<div class="slider__ends"><span>← ' + q.labels[0] + '</span><span>' + q.labels[1] + ' →</span></div>' +
          '<button class="btn btn--primary" id="slider-go">이 정도가 좋아 →</button>' +
        '</div>';
      var inp = $('#slider');
      var upd = function () {
        $('#slider-num').textContent = Math.round(inp.value / 10);
        inp.style.setProperty('--val', inp.value + '%');
      };
      upd();
      inp.addEventListener('input', upd);
      $('#slider-go').addEventListener('click', function () {
        if (state.lock) return;
        state.lock = true;
        commit({ value: +inp.value });
      });
    } else {
      var sel = state.answers[state.idx] && state.answers[state.idx].option;
      box.setAttribute('role', 'group');
      box.innerHTML = state.order[state.idx].map(function (oid, k) {
        var o = q.options.filter(function (x) { return x.id === oid; })[0];
        return '<button class="opt' + (sel === oid ? ' is-picked' : '') + '" data-oid="' + oid + '">' +
          '<span class="opt__key">' + LETTERS[k] + '</span>' +
          '<span class="opt__text">' + o.text + '</span>' +
          '<span class="opt__arrow" aria-hidden="true">→</span></button>';
      }).join('');
      $$('.opt', box).forEach(function (b) { b.addEventListener('click', function () { pick(b); }); });
    }

    $('#btn-back').textContent = state.idx === 0 ? '← 처음으로' : '← 이전';
    var card = $('#qcard');
    card.classList.remove('is-in', 'is-out'); void card.offsetWidth; card.classList.add('is-in');
    updateRoute();
    updateCompass();
    state.qStart = performance.now();
    state.lock = false;
  }

  function pick(btn) {
    if (state.lock) return;
    state.lock = true;
    $$('.opt').forEach(function (b) { b.classList.remove('is-picked'); });
    btn.classList.add('is-picked');
    setTimeout(function () { commit({ option: btn.dataset.oid }); }, 420);
  }
  function commit(ans) {
    state.answers[state.idx] = ans;
    state.times[state.idx] = performance.now() - state.qStart;
    if (state.idx >= TOTAL - 1) { finish(); return; }
    state.idx++;
    $('#qcard').classList.add('is-out');
    setTimeout(renderQuestion, 360);
  }
  function back() {
    if (state.idx === 0) { show('intro'); return; }
    state.idx--;
    renderQuestion();
  }


  /* =========================================================
     프롤로그 — 미연시처럼 대사를 한 줄씩
     클릭 · 스페이스 · 엔터로 넘기고, 타이핑 중에 누르면 문장이 바로 완성돼.
     ========================================================= */
  var pro = { scene: 0, line: 0, typing: false, timer: null, full: '' };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function startPrologue() {
    closePanel();
    if (!D.prologue || !D.prologue.length) { startJourney(); return; }
    pro.scene = 0; pro.line = 0;
    show('prologue');
    renderScene();
  }

  function renderScene() {
    var sc = D.prologue[pro.scene];
    var art = $('#pro-art');
    art.classList.remove('is-in'); void art.offsetWidth;
    art.innerHTML = (sc.img ? '<img src="' + sc.img + '" alt="' + sc.place + '"' + (sc.focus ? ' style="object-position:' + sc.focus + '"' : '') + ' onerror="this.remove()">' : '') +
      '<div class="pro-art__ph"><span class="pro-art__no">' + pad(pro.scene + 1) + '</span>' +
      '<b>' + sc.place + '</b><small>' + sc.placeEn + '</small></div>';
    art.classList.toggle('has-img', !!sc.img);
    art.classList.add('is-in');
    var nx = D.prologue[pro.scene + 1]; if (nx && nx.img) { var pre = new Image(); pre.src = nx.img; }
    $('#pro-count').textContent = 'PROLOGUE ' + pad(pro.scene + 1) + ' / ' + pad(D.prologue.length);
    typeLine();
  }

  // 표정 스티커: 같은 표정이면 그대로, 바뀌면 살짝 튀어오르며 교체
  var FACES = ['neutral', 'curious', 'surprised', 'thinking', 'happy', 'determined'];
  FACES.forEach(function (f) { var im = new Image(); im.src = 'assets/face/' + f + '.webp'; });
  function setFace(face) {
    var el = $('#pro-face'), box = $('#pro-box');
    box.classList.toggle('has-face', !!face);
    if (!face) { el.innerHTML = ''; el.dataset.face = ''; return; }
    if (el.dataset.face === face) return;
    el.dataset.face = face;
    el.innerHTML = '<img src="assets/face/' + face + '.webp" alt="">';
    el.classList.remove('is-pop'); void el.offsetWidth; el.classList.add('is-pop');
  }

  function typeLine() {
    var ln = D.prologue[pro.scene].lines[pro.line];
    var who = $('#pro-who'), el = $('#pro-text'), box = $('#pro-box');
    setFace(ln.face);
    // 다른 사람이 말할 땐 주인공 표정을 흐리게 (듣고 있는 반응)
    $('#pro-face').classList.toggle('is-listening', !!ln.who && ln.who !== '나');
    who.textContent = ln.who || '';
    who.hidden = !ln.who;
    box.classList.toggle('is-narration', !ln.who);
    box.classList.remove('is-done');
    clearInterval(pro.timer);
    pro.full = ln.text;
    if (reduceMotion) { el.textContent = ln.text; box.classList.add('is-done'); pro.typing = false; return; }
    var i = 0; pro.typing = true; el.textContent = '';
    pro.timer = setInterval(function () {
      i++; el.textContent = pro.full.slice(0, i);
      if (i >= pro.full.length) { clearInterval(pro.timer); pro.typing = false; box.classList.add('is-done'); }
    }, 38);
  }

  function advance() {
    if (pro.typing) {
      clearInterval(pro.timer); pro.typing = false;
      $('#pro-text').textContent = pro.full; $('#pro-box').classList.add('is-done');
      return;
    }
    var sc = D.prologue[pro.scene];
    if (pro.line < sc.lines.length - 1) { pro.line++; typeLine(); return; }
    if (pro.scene < D.prologue.length - 1) { pro.scene++; pro.line = 0; renderScene(); return; }
    clearInterval(pro.timer);
    startJourney();
  }

  $('#pro').addEventListener('click', function (e) {
    if (e.target.closest('[data-act]')) return;
    advance();
  });

  /* ---------- 실시간 나침반 ---------- */
  function mask(name) { return name.charAt(0) + new Array(name.replace(/\s/g, '').length).join('○'); }
  function updateCompass() {
    var res = E.compute(state.answers, state.times);
    var hint = $('#compass-hint');
    if (res.answered < 2) hint.textContent = '';
    else hint.innerHTML = '지금 가장 가까운 카레시<b>' + mask(typeById(res.top).persona) + '</b>';
  }

  function drawRadar(svg, series, size) {
    var n = D.axes.length, cx = size / 2, cy = size / 2, R = size * 0.3;
    var ang = function (i) { return -Math.PI / 2 + i * 2 * Math.PI / n; };
    var pt = function (i, r) { return [cx + Math.cos(ang(i)) * r, cy + Math.sin(ang(i)) * r]; };
    var rad = function (v) { return R * (0.12 + 0.88 * (v / 100 + 1) / 2); };
    var g = '';
    [0.25, 0.5, 0.75, 1].forEach(function (f) {
      g += '<polygon class="rd-grid" points="' + D.axes.map(function (_, i) { return pt(i, R * f).join(','); }).join(' ') + '"/>';
    });
    D.axes.forEach(function (a, i) {
      var p = pt(i, R);
      g += '<line class="rd-axis" x1="' + cx + '" y1="' + cy + '" x2="' + p[0] + '" y2="' + p[1] + '"/>';
      var l = pt(i, R + size * 0.12);
      g += '<text class="rd-label" x="' + l[0] + '" y="' + l[1] + '" text-anchor="middle" dominant-baseline="middle">' + a.pos + '</text>';
    });
    series.forEach(function (s) {
      g += '<polygon class="rd-shape ' + s.cls + '" points="' + D.axes.map(function (a, i) { return pt(i, rad(s.vec[a.key])).join(','); }).join(' ') + '"/>';
      D.axes.forEach(function (a, i) { var p = pt(i, rad(s.vec[a.key])); g += '<circle class="rd-dot" cx="' + p[0] + '" cy="' + p[1] + '" r="3"/>'; });
    });
    svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
    svg.innerHTML = g;
  }

  /* ---------- 로딩 → 결과 ---------- */
  function finish() {
    show('loading');
    var el = $('#loading-word');
    $('#loading-code').innerHTML = MO.html('KARESI', { cls: 'is-sew morse--slow' });
    var words = D.loadingWords, i = 0, final = words.slice(0, -1);
    var res = E.compute(state.answers, state.times);
    el.textContent = '...';
    var tick = setInterval(function () {
      el.classList.remove('flip'); void el.offsetWidth; el.classList.add('flip');
      if (i < final.length) { el.textContent = final[i]; i++; return; }
      clearInterval(tick);
      el.textContent = words[words.length - 1];
      setTimeout(function () {
        setHash(E.encode(res) + '&me=1');
        openResult(res, 'me');
      }, 650);
    }, 340);
  }

  /* =========================================================
     결과 페이지
     mode: 'me' 내 결과 · 'shared' 친구 결과 · 'browse' 옷 둘러보기
     ========================================================= */
  function openResult(res, mode) {
    closePanel();
    renderResult(res, mode);
    show('result');
    animateResult();
  }

  function leanText(a, v) {
    if (Math.abs(v) < 12) return '균형';
    return (v > 0 ? a.pos : a.neg) + ' ' + Math.abs(v);
  }

  function axisRow(a, me, item) {
    var x = function (v) { return (v + 100) / 2; };
    var meSide = me > 12 ? 'pos' : me < -12 ? 'neg' : '';
    return '<div class="sc-row">' +
      '<div class="sc-head"><b>' + a.name + '</b><span>' + leanText(a, me) + '</span></div>' +
      '<div class="sc-line">' +
        '<span class="sc-end' + (meSide === 'neg' ? ' is-on' : '') + '">' + a.neg + '<small>' + a.negEn + '</small></span>' +
        '<span class="sc-track">' +
          '<span class="sc-fill" style="left:' + Math.min(50, x(me)) + '%;width:' + Math.abs(x(me) - 50) + '%"></span>' +
          '<span class="sc-item" style="left:' + x(item) + '%" title="옷 좌표 ' + item + '"></span>' +
          '<span class="sc-me" style="left:' + x(me) + '%" title="나 ' + me + '"></span>' +
        '</span>' +
        '<span class="sc-end sc-end--r' + (meSide === 'pos' ? ' is-on' : '') + '">' + a.pos + '<small>' + a.posEn + '</small></span>' +
      '</div></div>';
  }

  function consistencyLabel(c) {
    if (c >= 60) return ['확신의 직진러', '거의 모든 정류장에서 같은 방향을 골랐어. 취향이 또렷해.'];
    if (c >= 40) return ['균형 잡힌 여행자', '중심은 있지만 가끔 옆길로도 새는, 유연한 여정이었어.'];
    return ['호기심 많은 탐험가', '정류장마다 다른 길을 골랐어. 여러 카레시가 공존하는 타입이야.'];
  }

  function chip(t) { return '<i class="chip" style="background:' + t.colorHex + '"></i>'; }
  function thumb(t, cls) { return '<span class="thumb ' + (cls || '') + '"><img src="' + t.img + '" alt="' + t.item + ' ' + t.color + '" loading="lazy"></span>'; }

  function renderResult(res, mode) {
    var t = typeById(res.top), t2 = typeById(res.second);
    var s1 = res.scores[0], s2 = res.scores[1];
    var rel = E.relations(t.id, t2.id), best = typeById(rel.best), rival = typeById(rel.rival);
    var lead = { me: '나의 카레시는', shared: '친구의 카레시는', browse: '이 옷의 카레시는' }[mode];
    var who = { me: '나', shared: '친구', browse: '예시' }[mode];
    var cl = consistencyLabel(res.consistency);
    var full = !t.draft;

    var h = '<article class="rs">';

    var shopUrl = t.shop || D.shopHome;
    var shopLabel = t.shop ? (t.shopName ? t.shopName + '에서 구매하기' : '구매하러 가기') : '스토어 둘러보기';
    var banner = mode === 'shared' ? '친구가 찾은 카레시야. <button class="link" data-act="start">나도 찾으러 가기</button>'
      : mode === 'browse' ? pad(t.id) + '번 카레시 미리보기 · 일치도와 좌표는 예시 값이야. <button class="link" data-act="start">내 카레시 찾기</button>' : '';

    /* 1. 무대: 옷만 크게 */
    h += '<section class="rs-stage" id="rs-stage">' +
      (banner ? '<p class="rs-banner">' + banner + '</p>' : '') +
      '<span class="rs-stage__no">N° ' + pad(t.id) + ' <small>/ ' + TYPES + '</small></span>' +
      '<img class="rs-stage__img" src="' + t.img + '" alt="' + t.item + ' ' + t.color + '">' +
      '<span class="rs-stage__color">' + chip(t) + t.color + '</span>' +
      '<span class="rs-cue" aria-hidden="true">SCROLL<i></i></span>' +
    '</section>';

    /* 2. 정체: 유형과 한 줄 소개 */
    h += '<section class="rs-id reveal" id="rs-id">' +
      '<p class="eyebrow">MY KARESI IS —</p>' +
      '<p class="rs-lead">' + lead + '</p>' +
      '<h2 class="rs-persona">' + t.persona + '</h2>' +
      '<p class="rs-en">' + t.personaEn + '</p>' +
      '<div class="rs-code">' + MO.html(pad(t.id), { cls: 'morse--decode' }) + '<span class="eyebrow">KARESI CODE</span></div>' +
      '<p class="rs-tagline">' + t.tagline + '</p>' +
      '<div class="rs-match"><span class="num" data-count="' + s1.pct + '">0</span><span class="pct">%</span><small>MATCH</small></div>' +
      '<div class="rs-item">' +
        '<span class="eyebrow">KARESI PIECE</span>' +
        '<b>' + t.item + '</b>' +
        '<span class="rs-item__meta">' + chip(t) + t.color + (D.showPrice && t.price ? '<em>' + t.price + '</em>' : '') + '</span>' +
        '<a class="btn btn--primary" href="' + shopUrl + '" target="_blank" rel="noopener">' + shopLabel + ' ↗</a>' +
      '</div>' +
    '</section>';

    /* 2. 성격 */
    if (full) {
      h += '<section class="rs-sec reveal">' +
        '<h3 class="rs-h"><span>PERSONALITY</span>어떤 사람이냐면</h3>' +
        '<div class="rs-two">' +
          '<div class="rs-desc">' + t.desc.map(function (p) { return '<p>' + p + '</p>'; }).join('') +
            '<blockquote>“' + t.quote + '”</blockquote>' +
            '<ul class="tags">' + t.keywords.map(function (k) { return '<li>' + k + '</li>'; }).join('') + '</ul>' +
          '</div>' +
          '<div class="rs-traits"><p class="eyebrow">이런 순간, 완전 나야</p><ul>' +
            t.traits.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>' +
        '</div></section>';
    } else {
      h += '<section class="rs-sec"><p class="rs-draft">이 카레시의 성격 설명과 스타일링은 아직 준비 중이야.</p></section>';
    }

    /* 3. 스타일 좌표 */
    h += '<section class="rs-sec reveal">' +
      '<h3 class="rs-h"><span>STYLE COORDINATES</span>나의 스타일 좌표</h3>' +
      '<p class="rs-legend"><span class="lg-me"></span>' + who + ' <span class="lg-item"></span>' + t.persona + '의 자리</p>' +
      '<div class="sc">' + D.axes.map(function (a) { return axisRow(a, res.vec[a.key], t.coord[a.key]); }).join('') + '</div>' +
    '</section>';

    /* 4. 아이템 노트 + 5. 스타일링 */
    if (full) {
      h += '<section class="rs-sec reveal">' +
        '<h3 class="rs-h"><span>PIECE NOTE</span>이 옷이 나를 닮은 이유</h3>' +
        '<ol class="notes">' + t.details.map(function (d, i) {
          return '<li><span class="notes__no">' + pad(i + 1) + '</span><b>' + d.name + '</b><p>' + d.note + '</p></li>';
        }).join('') + '</ol></section>';

      h += '<section class="rs-sec reveal">' +
        '<h3 class="rs-h"><span>HOW TO WEAR</span>이렇게 입어봐</h3>' +
        '<div class="looks">' + t.styling.map(function (s, i) {
          var mates = s.with.map(typeById);
          return '<div class="look">' +
            '<div class="look__pics">' + thumb(t) + mates.map(function (m) { return '<span class="look__plus">+</span>' + thumb(m); }).join('') + '</div>' +
            '<p class="look__no">LOOK ' + pad(i + 1) + '</p>' +
            '<b class="look__title">' + s.title + '</b>' +
            '<p class="look__note">' + s.note + '</p>' +
            '<p class="look__with">' + mates.map(function (m) {
              return '<button class="link" data-type="' + m.id + '">' + m.item + ' · ' + m.color + '</button>' +
                (m.shop ? '<a class="look__buy" href="' + m.shop + '" target="_blank" rel="noopener">구매 ↗</a>' : '');
            }).join('') + '</p>' +
          '</div>';
        }).join('') + '</div></section>';
    }

    /* 6. 12벌과의 거리 */
    h += '<section class="rs-sec reveal">' +
      '<h3 class="rs-h"><span>ALL 12 PIECES</span>열두 벌 중 나와의 거리</h3>' +
      '<ol class="ranks" id="ranks">' + res.scores.map(function (s, i) {
        var ty = typeById(s.id);
        return '<li class="rank' + (i === 0 ? ' is-top' : '') + '">' +
          '<span class="rank__no">' + pad(i + 1) + '</span>' + thumb(ty, 'thumb--s') +
          '<span class="rank__name"><b>' + ty.persona + '</b><small>' + ty.item + ' · ' + ty.color + '</small></span>' +
          '<span class="rank__bar"><i style="--w:' + s.pct + '%"></i></span>' +
          '<span class="rank__pct">' + s.pct + '%</span></li>';
      }).join('') + '</ol></section>';

    /* 7. 리포트 */
    h += '<section class="rs-sec reveal">' +
      '<h3 class="rs-h"><span>REPORT</span>여정 리포트</h3>' +
      '<div class="report">' +
        reportCard('부캐', t2, s2.pct + '% · ' + t2.persona + (s1.pct - s2.pct <= 4 ? '<br>1위와 거의 붙어 있는 경계형이야.' : '')) +
        '<div class="rep"><span class="eyebrow">여정 일관성</span><b class="rep__big">' + res.consistency + '%</b><p><strong>' + cl[0] + '</strong><br>' + cl[1] + '</p></div>' +
        reportCard('찰떡 궁합', best, '좌표가 가장 가까운 다른 아이템이야. 같이 입으면 결이 맞아.') +
        reportCard('반전 매력', rival, '좌표가 정반대인 옷이야. 한 번쯤 도전하면 새로운 내가 보일지도.') +
      '</div></section>';

    /* 액션 */
    h += '<div class="rs-actions">' +
      (mode === 'browse' ? '' : '<button class="btn btn--primary" data-act="save">결과 카드 저장</button><button class="btn" data-act="share">링크 공유</button>') +
      '<button class="btn' + (mode === 'browse' ? ' btn--primary' : '') + '" data-act="start">' + (mode === 'me' ? '다시 떠나기' : '나도 떠나기') + '</button>' +
      '<button class="btn btn--ghost" data-panel="style">열두 벌 모두 보기 →</button>' +
    '</div>' +
    '<p class="rs-foot">KARESI — A TRIP FOR A LITTLE MORE LOVE.</p>' +
    '</article>' +
    '<div class="shopbar" id="shopbar">' +
      '<img src="' + t.img + '" alt="">' +
      '<span class="shopbar__txt"><b>' + t.item + '</b><small>' + t.color + (D.showPrice && t.price ? ' · ' + t.price : '') + '</small></span>' +
      '<a class="btn btn--primary" href="' + shopUrl + '" target="_blank" rel="noopener">' + (t.shop ? '구매하기' : '스토어') + ' ↗</a>' +
    '</div>';

    $('#result-root').innerHTML = h;
    state.result = res;
    state.mode = mode;
  }

  function reportCard(label, ty, text) {
    return '<button class="rep rep--link" data-type="' + ty.id + '">' +
      '<span class="eyebrow">' + label + '</span>' + thumb(ty, 'thumb--m') +
      '<b>' + ty.persona + '</b><small>' + ty.item + ' · ' + ty.color + '</small><p>' + text + '</p></button>';
  }

  var observers = [];
  function countUp(num) {
    var target = +num.dataset.count, t0 = performance.now();
    var step = function (now) {
      var p = Math.min(1, (now - t0) / 1200);
      num.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function animateResult() {
    observers.forEach(function (o) { o.disconnect(); }); observers = [];
    var num = $('.rs-match .num'), ranks = $('#ranks'), bar = $('#shopbar'), stage = $('#rs-stage');
    if (!('IntersectionObserver' in window)) {
      if (num) countUp(num); if (ranks) ranks.classList.add('is-shown'); if (bar) bar.classList.add('is-on');
      return;
    }
    $('.rs').classList.add('js-reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        if (e.target.id === 'rs-id' && num && !num.dataset.done) { num.dataset.done = '1'; countUp(num); }
        if (e.target.contains(ranks)) ranks.classList.add('is-shown');
        io.unobserve(e.target);
      });
    }, { threshold: 0.18 });
    $$('.reveal').forEach(function (el) { io.observe(el); });
    // 무대를 지나면 하단 구매 바 등장
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (bar) bar.classList.toggle('is-on', !e.isIntersecting); });
    }, { threshold: 0.05 });
    if (stage) io2.observe(stage);
    observers = [io, io2];
  }

  function browseType(id) {
    var res = E.sample(+id);
    if (!res) return;
    setHash('type-' + id);
    openResult(res, 'browse');
  }

  /* ---------- 공유 ---------- */
  function share() {
    if (!state.result) return;
    var t = typeById(state.result.top);
    var url = location.origin + location.pathname + '#' + E.encode(state.result);
    var text = '나의 카레시는 「' + t.persona + '」 ' + t.item + ' ' + t.color + ' (' + state.result.scores[0].pct + '%) — 너의 카레시도 찾아볼래?';
    if (navigator.share) {
      navigator.share({ title: '카레시를 찾아서', text: text, url: url }).catch(function (e) { if (!e || e.name !== 'AbortError') copy(text + '\n' + url); });
      return;
    }
    copy(text + '\n' + url);
  }
  function copy(str) {
    var done = function () { toast('링크를 복사했어! 친구에게 보내봐'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(str).then(done, function () { fallbackCopy(str); done(); });
    } else { fallbackCopy(str); done(); }
  }
  function fallbackCopy(str) {
    var ta = document.createElement('textarea');
    ta.value = str; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    ta.remove();
  }

  /* ---------- 결과 카드 이미지 (1080×1350) ---------- */
  function saveCard() {
    if (!state.result) return;
    var res = state.result, t = typeById(res.top);
    var W = 1080, H = 1350;
    var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    var x = cv.getContext('2d');
    var img = new Image();
    var fonts = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    var loaded = new Promise(function (ok) { img.onload = ok; img.onerror = ok; img.src = t.img; });
    Promise.all([fonts, loaded]).then(function () {
      var INK = '#111111', SUB = '#6B6B6B';
      x.fillStyle = '#F6F6F4'; x.fillRect(0, 0, W, H);
      // 사진 패널
      x.fillStyle = '#ECECEA'; x.fillRect(560, 0, 520, 860);
      if (img.naturalWidth) {
        var ph = 760, pw = ph * img.naturalWidth / img.naturalHeight;
        if (pw > 480) { pw = 480; ph = pw * img.naturalHeight / img.naturalWidth; }
        x.globalCompositeOperation = 'multiply';
        x.drawImage(img, 560 + (520 - pw) / 2, 60 + (760 - ph) / 2, pw, ph);
        x.globalCompositeOperation = 'source-over';
      }
      x.fillStyle = INK; x.font = '600 24px "Noto Sans KR", sans-serif';
      x.fillText('K A R E S I', 64, 86);
      x.font = '400 22px "Hanken Grotesk", sans-serif';
      x.fillText('N° ' + pad(t.id) + ' / ' + TYPES, 64, 170);
      x.fillStyle = SUB; x.font = '400 32px "Noto Sans KR", sans-serif';
      x.fillText(state.mode === 'shared' ? '친구의 카레시는' : '나의 카레시는', 64, 300);
      x.fillStyle = INK;
      wrapLines(x, t.persona, 900, 96, 470).forEach(function (line, i) {
        x.font = '200 ' + line.size + 'px "Noto Sans KR", sans-serif'; x.fillText(line.text, 60, 410 + i * (line.size * 1.12));
      });
      x.fillStyle = SUB; x.font = '500 24px "Hanken Grotesk", sans-serif';
      x.fillText(t.personaEn, 64, 640);
      x.fillStyle = INK; x.font = '200 88px "Hanken Grotesk", sans-serif';
      x.fillText(res.scores[0].pct + '% MATCH', 64, 760);

      x.fillStyle = INK; x.font = '600 30px "Noto Sans KR", sans-serif';
      x.fillText(t.item, 64, 940);
      x.fillStyle = t.colorHex; x.beginPath(); x.arc(78, 990, 14, 0, Math.PI * 2); x.fill();
      x.strokeStyle = 'rgba(17,17,17,.2)'; x.lineWidth = 2; x.stroke();
      x.fillStyle = SUB; x.font = '500 26px "Noto Sans KR", sans-serif'; x.fillText(t.color, 104, 999);

      // 축 4개
      D.axes.forEach(function (a, i) {
        var y = 1080 + i * 56, x0 = 330, x1 = 750, v = res.vec[a.key];
        x.fillStyle = SUB; x.font = '500 24px "Noto Sans KR", sans-serif'; x.textAlign = 'right';
        x.fillText(a.neg, x0 - 20, y + 8); x.textAlign = 'left'; x.fillText(a.pos, x1 + 20, y + 8);
        x.strokeStyle = 'rgba(17,17,17,.25)'; x.beginPath(); x.moveTo(x0, y); x.lineTo(x1, y); x.stroke();
        var px = x0 + (v + 100) / 200 * (x1 - x0);
        x.fillStyle = INK; x.beginPath(); x.arc(px, y, 9, 0, Math.PI * 2); x.fill();
      });
      x.textAlign = 'left';
      x.fillStyle = SUB; x.font = '500 20px "Noto Sans KR", sans-serif';
      x.fillText('SOMEWHERE BETWEEN CURRY AND LOVE.', 64, H - 50);

      cv.toBlob(function (blob) {
        if (!blob) { toast('이미지를 만들지 못했어. 다시 시도해줘'); return; }
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'karesi-' + pad(t.id) + '.png';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 3000);
        toast('결과 카드를 저장했어!');
      }, 'image/png');
    });
  }
  // 긴 이름은 두 줄로, 그래도 넘치면 글자 크기를 줄여
  function wrapLines(ctx, text, maxW, size, lineW) {
    ctx.font = '200 ' + size + 'px "Noto Sans KR", sans-serif';
    if (ctx.measureText(text).width <= lineW) return [{ text: text, size: size }];
    var words = text.split(' ');
    if (words.length > 1) {
      var a = words.slice(0, Math.ceil(words.length / 2)).join(' '), b = words.slice(Math.ceil(words.length / 2)).join(' ');
      var s = size; ctx.font = '200 ' + s + 'px "Noto Sans KR", sans-serif';
      while (Math.max(ctx.measureText(a).width, ctx.measureText(b).width) > lineW && s > 56) { s -= 4; ctx.font = '200 ' + s + 'px "Noto Sans KR", sans-serif'; }
      return [{ text: a, size: s }, { text: b, size: s }];
    }
    var s2 = size; while (ctx.measureText(text).width > lineW && s2 > 56) { s2 -= 4; ctx.font = '200 ' + s2 + 'px "Noto Sans KR", sans-serif'; }
    return [{ text: text, size: s2 }];
  }

  /* ---------- 패널 ---------- */
  var PANELS = {
    about: function () {
      return '<p class="eyebrow">ABOUT</p><h2>카레시를 찾아서</h2>' +
        '<p>카레시는 카레와 사랑 사이 어딘가에 있는, 아직 만나지 못한 <b>나만의 한 벌</b>이야. 카레라이스 골목부터 카리스마 광장까지 열두 개의 정류장을 지나면, 열두 벌 중 나를 가장 닮은 옷을 찾게 돼.</p>' +
        '<h3>네 개의 스타일 축</h3><ul>' + D.axes.map(function (a) {
          return '<li><b>' + a.name + '</b> — ' + a.neg + ' ↔ ' + a.pos + '</li>';
        }).join('') + '</ul>' +
        '<h3>어떻게 계산될까?</h3><ul>' +
        '<li>선택지마다 네 축에 점수가 쌓이고, 끝나면 -100 ~ +100 좌표로 바뀌어.</li>' +
        '<li>열두 벌은 각자 고유 좌표가 있고, 내 좌표와 <b>가장 가까운 옷</b>이 나의 카레시야.</li>' +
        '<li>같은 옷의 다른 컬러는 <b>무드</b> 축이 갈라. 블랙은 엣지, 밝은 컬러는 소프트 쪽이야.</li>' +
        '<li>선택지 순서는 매번 섞여. 위치 말고 마음으로 골라줘.</li></ul>' +
        '<h3>숨은 신호</h3><p>카레시 옷 안쪽에는 짧고 긴 바늘땀이 수놓여 있어. 사실 이건 모스부호야. 첫 화면의 바늘땀에 마우스를 올리거나 눌러보면, 그 뜻이 보여.</p>' +
        '<p style="margin-top:14px">' + MO.html('KARESI', { rows: ['KAR', 'ESI'], cls: 'morse--decode is-decoded morse--panel' }) + '</p>';
    },
    style: function () {
      return '<p class="eyebrow">STYLE</p><h2>열두 벌의 카레시</h2><div class="gallery">' +
        D.types.map(function (t) {
          return '<button class="gcard" data-type="' + t.id + '">' + thumb(t, 'thumb--m') +
            '<span class="gcard__txt"><small>N° ' + pad(t.id) + '</small><b>' + t.persona + '</b><span>' + t.item + '</span><span class="gcard__color">' + chip(t) + t.color + '</span></span></button>';
        }).join('') + '</div>' +
        '<p style="margin-top:22px"><button class="btn btn--primary" data-act="start">나의 카레시 찾으러 가기 →</button></p>';
    },
    contact: function () {
      return '<p class="eyebrow">CONTACT</p><h2>카레시를 함께 찾아요</h2>' +
        '<p>프로젝트 KARESI에 대한 이야기, 협업 제안은 언제든 환영해.</p>' +
        '<h3>Reach us</h3><ul>' +
        '<li><b>Email</b> — hello@karesi.example</li>' +
        '<li><b>Instagram</b> — @karesi.journey</li></ul>';
    }
  };
  var lastFocus = null;
  function openPanel(name) {
    if (!PANELS[name]) return;
    lastFocus = document.activeElement;
    $('#panel-body').innerHTML = PANELS[name]();
    $('#panel').hidden = false;
    $('.panel__close').focus();
  }
  function closePanel() {
    if ($('#panel').hidden) return;
    $('#panel').hidden = true;
    if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus();
  }

  var toastTimer;
  function toast(msg) {
    var el = $('#toast');
    el.textContent = msg; el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-on'); }, 2400);
  }

  /* ---------- 이벤트 ---------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act],[data-panel],[data-close],[data-type]');
    if (!el) return;
    if (el.hasAttribute('data-close')) { closePanel(); return; }
    if (el.dataset.panel) { openPanel(el.dataset.panel); return; }
    if (el.dataset.type) { browseType(el.dataset.type); return; }
    switch (el.dataset.act) {
      case 'start': startJourney(); break;
      case 'prologue': startPrologue(); break;
      case 'skip': clearInterval(pro.timer); startJourney(); break;
      case 'home': closePanel(); setHash(''); show('intro'); break;
      case 'share': share(); break;
      case 'save': saveCard(); break;
    }
  });
  $('#btn-back').addEventListener('click', back);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closePanel(); return; }
    if (document.body.dataset.screen === 'prologue' && $('#panel').hidden) {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') { e.preventDefault(); advance(); }
      return;
    }
    if (document.body.dataset.screen !== 'journey' || !$('#panel').hidden) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (e.target.tagName || '').toLowerCase();
    if (e.key === 'Backspace' && tag !== 'input') { e.preventDefault(); back(); return; }
    if (tag === 'input') { if (e.key === 'Enter') { var g = $('#slider-go'); if (g) g.click(); } return; }
    var k = e.key.toLowerCase();
    var idx = '1234'.indexOf(k); if (idx < 0) idx = 'abcd'.indexOf(k);
    if (idx >= 0) { var b = $$('.opt')[idx]; if (b) pick(b); }
  });

  /* ---------- 진입 ---------- */
  function route() {
    var h = location.hash.replace(/^#/, '');
    var m = /^type-(\d{1,2})$/.exec(h);
    if (m && typeById(m[1])) { openResult(E.sample(+m[1]), 'browse'); return; }
    if (h.indexOf('v=') >= 0) {
      var res = E.decode(h);
      if (res) { openResult(res, /(^|&)me=1/.test(h) ? 'me' : 'shared'); return; }
    }
    if (window.KARESI_START && typeById(window.KARESI_START)) { openResult(E.sample(+window.KARESI_START), 'browse'); return; }
    show('intro');
  }
  function sewIntro() {
    var el = $('#intro-code');
    if (!el) return;
    el.innerHTML = MO.html('KARESI', { rows: ['KAR', 'ESI'], cls: 'is-sew morse--decode' });
    el.addEventListener('click', function () { el.firstChild.classList.toggle('is-decoded'); });
  }
  sewIntro();
  window.addEventListener('hashchange', route);
  route();
})();
