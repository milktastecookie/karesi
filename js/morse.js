/* =========================================================
   KARESI · 모스부호 바늘땀
   카레시 옷 안쪽 자수처럼, 점(·)은 짧은 땀 / 선(−)은 긴 땀으로 그려.
   KARESI_MORSE.html('KARESI', { rows: ['KAR', 'ESI'] })
   ========================================================= */
(function (g) {
  var M = {
    A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---',
    K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-',
    U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.'
  };

  function html(text, opt) {
    opt = opt || {};
    var rows = opt.rows || [text];
    var i = 0;
    return '<span class="morse ' + (opt.cls || '') + '" role="img" aria-label="모스부호 ' + text + '">' +
      rows.map(function (row) {
        return '<span class="morse__row">' + row.split('').map(function (ch) {
          var code = M[ch.toUpperCase()];
          if (!code) return '<span class="morse__gap"></span>';
          return '<span class="morse__ch" data-l="' + ch.toUpperCase() + '">' + code.split('').map(function (s) {
            return '<i class="st st--' + (s === '-' ? 'l' : 's') + '" style="--i:' + (i++) + '"></i>';
          }).join('') + '</span>';
        }).join('') + '</span>';
      }).join('') + '</span>';
  }

  g.KARESI_MORSE = { html: html, map: M };
})(window);
