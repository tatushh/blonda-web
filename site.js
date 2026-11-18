(function () {
  var WA = '51944068942';

  // Videos: se reproducen sin sonido solo cuando están en pantalla
  var vids = document.querySelectorAll('video[data-auto]');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    vids.forEach(function (v) { v.controls = true; v.preload = 'metadata'; });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          if (v.preload === 'none') { v.preload = 'auto'; v.load(); }
          var p = v.play(); if (p && p.catch) p.catch(function () { v.controls = true; });
        } else { v.pause(); }
      });
    }, { threshold: 0.35 });
    vids.forEach(function (v) { io.observe(v); });
  }

  // Cerrar el menú de tratamientos al tocar fuera
  document.addEventListener('click', function (e) {
    document.querySelectorAll('details.mega[open]').forEach(function (d) { if (!d.contains(e.target)) d.removeAttribute('open'); });
  });

  // ¿Qué quieres mejorar?
  var goals = document.querySelectorAll('.goal');
  var cards = document.querySelectorAll('#goal-grid .tcard');
  function pick(g) {
    goals.forEach(function (b) { var on = b.dataset.goal === g; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    cards.forEach(function (c) { c.hidden = (' ' + c.dataset.tags + ' ').indexOf(' ' + g + ' ') < 0; });
  }
  goals.forEach(function (b) { b.addEventListener('click', function () { pick(b.dataset.goal); }); });
  if (goals.length) pick(goals[0].dataset.goal);

  // Calculadora de cuotas
  var cf = document.getElementById('cuotas-form');
  if (cf) {
    var sel = document.getElementById('cq-trat'), mw = document.getElementById('cq-monto-wrap'), mi = document.getElementById('cq-monto');
    var out = document.getElementById('cuotas-out'), link = document.getElementById('cuotas-wa');
    function calc() {
      var otro = sel.value === 'otro'; mw.hidden = !otro;
      var total = otro ? parseFloat(mi.value) : parseFloat(sel.value);
      var f = cf.querySelector('input[name="cq-f"]:checked').value;
      var m = parseInt(cf.querySelector('input[name="cq-m"]:checked').value, 10);
      if (!total || total < 100) { out.textContent = 'Ingresa el monto del tratamiento'; return; }
      var n = f === 'semanal' ? m * 4 : m * 2;
      var cuota = Math.ceil(total / n);
      var unidad = f === 'semanal' ? 'semanales' : 'quincenales';
      out.textContent = n + ' abonos ' + unidad + ' de S/' + cuota.toLocaleString('es-PE');
      var trat = otro ? 'un tratamiento de S/' + total : sel.options[sel.selectedIndex].text;
      link.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent('Hola, vengo de la web. Quiero el plan de pagos para ' + trat + ': ' + out.textContent + '.');
    }
    cf.addEventListener('input', calc); cf.addEventListener('change', calc);
    cf.addEventListener('submit', function (e) { e.preventDefault(); });
    calc();
  }

  // Calculadora de IMC
  var imf = document.getElementById('imc-form');
  if (imf) {
    imf.addEventListener('submit', function (e) {
      e.preventDefault();
      var p = parseFloat(document.getElementById('imc-peso').value);
      var t = parseFloat(String(document.getElementById('imc-talla').value).replace(',', '.'));
      if (t > 3) t = t / 100;
      var o = document.getElementById('imc-out');
      if (!p || !t) { o.textContent = 'Ingresa tu peso y tu talla.'; return; }
      var imc = p / (t * t), r = imc.toFixed(1), msg;
      if (imc > 31) msg = 'IMC ' + r + ': el Plan Blonda Fit es tu mejor punto de partida.';
      else if (imc >= 25) msg = 'IMC ' + r + ': puedes combinar MELA o Lipoláser con el Plan Blonda Fit.';
      else msg = 'IMC ' + r + ': si te molesta una zona, MELA o Lipoláser pueden ser para ti.';
      o.textContent = msg + ' La doctora lo confirma en tu evaluación.';
    });
  }
})();
