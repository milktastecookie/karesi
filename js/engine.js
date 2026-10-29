/* =========================================================
   KARESI · 계산 엔진
   1) 선택지 점수를 4개 축에 누적
   2) 축마다 '현실적인 최대치'로 나눠 -100 ~ +100 으로 정규화
   3) 12벌의 좌표와 거리(유클리드)를 재서 가장 가까운 옷이 결과
   4) 거리가 가까울수록 높은 일치도(%)로 환산
   ========================================================= */
(function (global) {
  var D = global.KARESI_DATA;
  var KEYS = D.axes.map(function (a) { return a.key; });
  var REALISTIC = 0.6;   // 이론상 최대치의 60%면 ±100으로 봄 (시뮬레이션과 동일)
  var SPREAD = 1.6;      // 일치도 곡선의 완만함

  function zero() { var o = {}; KEYS.forEach(function (k) { o[k] = 0; }); return o; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  var RANGE = (function () {
    var pos = zero(), neg = zero();
    D.questions.forEach(function (q) {
      if (q.type === 'slider') { pos[q.axis] += q.max; neg[q.axis] += q.min; return; }
      KEYS.forEach(function (k) {
        var vals = q.options.map(function (o) { return o.delta[k] || 0; });
        pos[k] += Math.max.apply(null, [0].concat(vals));
        neg[k] += Math.min.apply(null, [0].concat(vals));
      });
    });
    return { pos: pos, neg: neg };
  })();

  function distance(vec, coord) {
    var s = 0;
    KEYS.forEach(function (k) { var x = vec[k] / 100 - coord[k] / 100; s += x * x; });
    return Math.sqrt(s);
  }

  function rank(vec) {
    return D.types.map(function (t) {
      var d = distance(vec, t.coord);
      return { id: t.id, dist: d, pct: clamp(Math.round(100 * Math.exp(-d * d / SPREAD)), 1, 99) };
    }).sort(function (a, b) { return a.dist - b.dist; });
  }

  /**
   * answers[i] = { option: 'a' } | { value: 0~100 } | null
   * times[i]   = 응답에 걸린 ms
   */
  function compute(answers, times) {
    var raw = zero(), absSum = zero(), answered = 0;
    D.questions.forEach(function (q, i) {
      var a = answers[i];
      if (!a) return;
      answered++;
      if (q.type === 'slider') {
        var d = q.min + (q.max - q.min) * (a.value / 100);
        raw[q.axis] += d; absSum[q.axis] += Math.abs(d);
        return;
      }
      var opt = q.options.filter(function (o) { return o.id === a.option; })[0];
      if (!opt) return;
      KEYS.forEach(function (k) { var v = opt.delta[k] || 0; raw[k] += v; absSum[k] += Math.abs(v); });
    });

    var vec = zero();
    KEYS.forEach(function (k) {
      var v = raw[k];
      var den = v >= 0 ? RANGE.pos[k] : Math.abs(RANGE.neg[k]);
      vec[k] = den ? Math.round(clamp(v / (den * REALISTIC), -1, 1) * 100) : 0;
    });

    var ts = (times || []).filter(function (t) { return typeof t === 'number' && t > 0; });
    var avgMs = ts.length ? ts.reduce(function (s, t) { return s + t; }, 0) / ts.length : null;

    var cons = [];
    KEYS.forEach(function (k) { if (absSum[k] > 0) cons.push(Math.abs(raw[k]) / absSum[k]); });
    var consistency = cons.length ? Math.round(cons.reduce(function (s, v) { return s + v; }, 0) / cons.length * 100) : 0;

    return finalize({ vec: vec, consistency: consistency, avgMs: avgMs, answered: answered });
  }

  function finalize(res) {
    res.scores = rank(res.vec);
    res.top = res.scores[0].id;
    res.second = res.scores[1].id;
    return res;
  }

  // 옷끼리의 관계: 찰떡(가장 가까운 다른 아이템) / 반전 매력(가장 먼 옷)
  function relations(id, exclude) {
    var me = D.types.filter(function (t) { return t.id === id; })[0];
    var others = D.types.filter(function (t) { return t.item !== me.item && t.id !== exclude; }).map(function (t) {
      return { id: t.id, dist: distance(me.coord, t.coord) };
    }).sort(function (a, b) { return a.dist - b.dist; });
    return { best: others[0].id, rival: others[others.length - 1].id };
  }

  // 공유 링크: 좌표 4개 + 일관성 + 평균 응답 시간
  function encode(res) {
    var p = new URLSearchParams();
    p.set('v', KEYS.map(function (k) { return res.vec[k]; }).join('_'));
    p.set('c', String(res.consistency));
    if (res.avgMs) p.set('a', String(Math.round(res.avgMs / 100)));
    return p.toString();
  }
  function decode(str) {
    try {
      var p = new URLSearchParams(str);
      var parts = (p.get('v') || '').split('_').map(Number);
      if (parts.length !== KEYS.length || parts.some(isNaN)) return null;
      var vec = {}; KEYS.forEach(function (k, i) { vec[k] = clamp(Math.round(parts[i]), -100, 100); });
      var a = parseInt(p.get('a'), 10);
      return finalize({ vec: vec, consistency: clamp(parseInt(p.get('c'), 10) || 0, 0, 100), avgMs: isNaN(a) ? null : a * 100 });
    } catch (e) { return null; }
  }

  // 미리보기용: 특정 옷 좌표 근처의 가상 결과
  function sample(id) {
    var t = D.types.filter(function (x) { return x.id === id; })[0];
    if (!t) return null;
    var vec = {}; KEYS.forEach(function (k, i) { vec[k] = clamp(Math.round(t.coord[k] * 0.85 + (i % 2 ? 6 : -6)), -100, 100); });
    return finalize({ vec: vec, consistency: 68, avgMs: 4200 });
  }

  global.KARESI_ENGINE = { compute: compute, encode: encode, decode: decode, relations: relations, sample: sample, distance: distance, RANGE: RANGE, KEYS: KEYS };
})(window);
