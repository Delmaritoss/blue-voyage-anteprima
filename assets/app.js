/* Blue Voyage Yachting Group — ponašanje stranice.
   Bez vanjskih biblioteka i bez poziva prema trećima. */
(function () {
  'use strict';
  var d = document, html = d.documentElement, body = d.body;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* tekstovi sučelja koje stvara skripta, na 4 jezika */
  var LANG = (html.getAttribute('lang') || 'hr').slice(0, 2);
  var I18N = {
    hr: { top: 'Na vrh', close: 'Zatvori', prev: 'Prethodna', next: 'Sljedeća', list: 'Moj popis', saved: 'Spremljena plovila',
          empty: 'Još niste spremili nijedno plovilo. Kliknite srce na kartici plovila.', send: 'Pošalji upit za sva plovila', clear: 'Očisti popis',
          remove: 'Ukloni', subj: 'Upit za plovila s popisa', body: 'Pozdrav, zanimaju me sljedeća plovila:',
          cmp: 'Usporedi', cmpT: 'Usporedba plovila', rows: ['Duljina', 'Širina', 'Osoba', 'Kabine', 'Motori', 'Maks. brzina', 'Spremnik goriva'], price: 'Cijena', ask: 'Pošalji upit za ova plovila' },
    en: { top: 'Back to top', close: 'Close', prev: 'Previous', next: 'Next', list: 'My shortlist', saved: 'Saved boats',
          empty: 'You have not saved any boats yet. Tap the heart on a boat card.', send: 'Send an inquiry for all', clear: 'Clear shortlist',
          remove: 'Remove', subj: 'Inquiry about shortlisted boats', body: 'Hello, I am interested in the following boats:',
          cmp: 'Compare', cmpT: 'Boat comparison', rows: ['Length', 'Beam', 'People', 'Cabins', 'Engines', 'Top speed', 'Fuel tank'], price: 'Price', ask: 'Send an inquiry for these boats' },
    de: { top: 'Nach oben', close: 'Schließen', prev: 'Zurück', next: 'Weiter', list: 'Meine Merkliste', saved: 'Gemerkte Boote',
          empty: 'Sie haben noch kein Boot gemerkt. Tippen Sie auf das Herz einer Bootskarte.', send: 'Anfrage für alle senden', clear: 'Liste leeren',
          remove: 'Entfernen', subj: 'Anfrage zu Booten auf meiner Merkliste', body: 'Guten Tag, ich interessiere mich für folgende Boote:',
          cmp: 'Vergleichen', cmpT: 'Bootsvergleich', rows: ['Länge', 'Breite', 'Personen', 'Kabinen', 'Motoren', 'Höchstgeschwindigkeit', 'Kraftstofftank'], price: 'Preis', ask: 'Anfrage für diese Boote senden' },
    it: { top: 'Torna su', close: 'Chiudi', prev: 'Precedente', next: 'Successiva', list: 'I miei preferiti', saved: 'Barche salvate',
          empty: 'Non avete ancora salvato nessuna barca. Toccate il cuore sulla scheda di una barca.', send: 'Invia una richiesta per tutte', clear: 'Svuota l’elenco',
          remove: 'Rimuovi', subj: 'Richiesta per le barche salvate', body: 'Buongiorno, sono interessato alle seguenti barche:',
          cmp: 'Confronta', cmpT: 'Confronto barche', rows: ['Lunghezza', 'Larghezza', 'Persone', 'Cabine', 'Motori', 'Velocità massima', 'Serbatoio carburante'], price: 'Prezzo', ask: 'Invia una richiesta per queste barche' }
  };
  var TXT = I18N[LANG] || I18N.en;

  /* zaglavlje: zatamni se pri pomicanju, skrije se prema dolje, vrati prema gore;
     traka napretka, gumb za vrh, paralaksa — sve u jednom requestAnimationFrame */
  var head = d.querySelector('.head');
  var bar = d.createElement('div'); bar.className = 'progress'; body.appendChild(bar);
  var top = d.createElement('button'); top.className = 'totop';
  top.setAttribute('aria-label', TXT.top);
  top.innerHTML = '<svg viewBox="0 0 24 24" class="ico"><path d="M4 12h16M14 6l6 6-6 6"/></svg>';
  top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  body.appendChild(top);
  var pars = reduce ? [] : Array.prototype.slice.call(d.querySelectorAll('[data-par]'));
  var lastY = window.scrollY, ticking = false;
  function frame() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight, dh = d.documentElement.scrollHeight - vh;
    if (head) {
      head.classList.toggle('scrolled', y > 40);
      var hide = y > 320 && y > lastY + 2 && !body.classList.contains('menu-open');
      var show = y < lastY - 2 || y < 320;
      if (hide) head.classList.add('hide'); else if (show) head.classList.remove('hide');
      body.classList.toggle('head-hidden', head.classList.contains('hide'));
    }
    lastY = y;
    bar.style.transform = 'scaleX(' + (dh > 0 ? Math.min(y / dh, 1) : 0) + ')';
    top.classList.toggle('show', y > vh * 1.5);
    pars.forEach(function (el) {
      var r = el.parentNode.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var f = parseFloat(el.getAttribute('data-par')) || 0.12;
      var p = (r.top + r.height / 2 - vh / 2) / (vh + r.height);      // od -0.5 do 0.5
      el.style.transform = 'translate3d(0,' + (-p * r.height * f).toFixed(1) + 'px,0) scale(' + (1 + f + 0.02).toFixed(3) + ')';
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  frame(); window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll);

  /* naslovi: svaka riječ izranja ispod crte (tekst ostaje isti za čitače ekrana) */
  var splitSel = '.hero h1, .rise h1, .phero h1, .sec-head h2, .band-box h2, .split h2, .duo-c h2, .cta h2, .group-head h2, .invite-txt h2, .fp-sec h2';
  var heads = reduce ? [] : d.querySelectorAll(splitSel);
  heads.forEach(function (h) {
    var n = 0;
    (function walk(el) {
      Array.prototype.slice.call(el.childNodes).forEach(function (node) {
        if (node.nodeType === 3) {
          var parts = node.textContent.split(/(\s+)/), frag = d.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(d.createTextNode(p)); return; }
            var o = d.createElement('span'), i = d.createElement('span');
            o.className = 'sw'; o.setAttribute('aria-hidden', 'true'); i.style.setProperty('--i', n++); i.textContent = p;
            o.appendChild(i); frag.appendChild(o);
          });
          node.parentNode.replaceChild(frag, node);
        } else if (node.nodeType === 1 && node.tagName !== 'BR' && node.tagName !== 'SMALL') walk(node);
      });
    })(h);
    h.setAttribute('aria-label', h.textContent.replace(/\s+/g, ' ').trim());
    if (h.closest('.rise, .hero')) h.style.setProperty('--d', '250ms');
  });
  var sio2 = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('split-in'); sio2.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  heads.forEach(function (h) {
    if (h.closest('.rise')) return;
    if (h.closest('.phero, .hero')) requestAnimationFrame(function () { requestAnimationFrame(function () { h.classList.add('split-in'); }); });
    else if (sio2) sio2.observe(h); else h.classList.add('split-in');
  });

  /* naslovni video s YouTubea (kao na staroj stranici): bez zvuka, isječak u petlji.
     Dok se ne pokrene, vidi se poster; uz smanjen pokret ne učitava se uopće. */
  var yt = d.querySelector('[data-yt]');
  // player se učitava tek kad je stranica gotova, da ne usporava prvo iscrtavanje (poster je već tu)
  if (yt && !reduce) {
    var ytLater = function () { setTimeout(startYT, 900); };
    if (d.readyState === 'complete') ytLater(); else window.addEventListener('load', ytLater);
  }
  function startYT() {
    var id = yt.getAttribute('data-yt'), ys = +yt.getAttribute('data-start'), ye = +yt.getAttribute('data-end');
    var f = d.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&mute=1&controls=0&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&cc_load_policy=0' +
      '&start=' + ys + '&end=' + ye + '&enablejsapi=1&origin=' + encodeURIComponent(location.origin);
    f.title = yt.getAttribute('data-title') || 'Video';
    f.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
    f.setAttribute('tabindex', '-1'); f.setAttribute('aria-hidden', 'true');
    f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    yt.appendChild(f);
    var cmd = function (func, args) { try { f.contentWindow.postMessage(JSON.stringify({ event: 'command', func: func, args: args || [] }), '*'); } catch (e) {} };
    f.addEventListener('load', function () {
      var n = 0, ping = setInterval(function () {
        try { f.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*'); } catch (e) {}
        if (++n > 20) clearInterval(ping);
      }, 250);
    });
    var playing = false, shown = false;
    window.addEventListener('message', function (e) {
      if (e.source !== f.contentWindow || typeof e.data !== 'string') return;
      var m; try { m = JSON.parse(e.data); } catch (err) { return; }
      var info = m.info || {};
      // video se pokaže tek nakon ~3 s reprodukcije: YouTube tada već šalje oštru sliku i makne svoj gumb za play;
      // do tada se vidi poster. Kad je jednom prikazan, ostaje (i nakon povratka na početak isječka).
      if (info.playerState === 1) playing = true;
      if (info.playerState === 2) { playing = false; yt.classList.remove('on'); }
      if (playing && (shown || (info.currentTime && info.currentTime >= ys + 3))) { shown = true; yt.classList.add('on'); }
      if (info.playerState === 0 || (info.currentTime && info.currentTime >= ye - 0.3)) { cmd('seekTo', [ys, true]); cmd('playVideo'); }
    });
    d.addEventListener('visibilitychange', function () { cmd(d.hidden ? 'pauseVideo' : 'playVideo'); });
  }

  /* naslovni film: pomicanje je glava za reprodukciju.
     Datoteka se preuzima cijela i daje videu kao Blob, jer Cloudflare Pages ne
     poslužuje Range zahtjeve, a video koji traži bez njih zapne. */
  var rise = d.querySelector('[data-rise]');
  if (rise && !reduce && window.fetch && window.URL) {
    var vid = rise.querySelector('video'), r1 = rise.querySelector('.r1'), r2 = rise.querySelector('.r2');
    var FR = parseInt(rise.getAttribute('data-frames'), 10), FPS = parseFloat(rise.getAttribute('data-fps'));
    var mob = matchMedia('(max-width: 880px)').matches;
    var target = 0, cur = 0, shown = -1, ready = false, running = false;
    rise.classList.add('film');
    requestAnimationFrame(function () { requestAnimationFrame(function () { if (r1) r1.classList.add('split-in'); }); });

    function measure() {
      var H = rise.offsetHeight, vh = window.innerHeight, y = -rise.getBoundingClientRect().top;
      var p = Math.min(Math.max(y / (H - vh), 0), 1);                    // takt teksta: samo dok je pozornica prikvačena
      var c = Math.min(Math.max(y / (H - vh * 0.35), 0), 1);             // film: i dok pozornica odlazi, da ne stane
      c = 1 - Math.pow(1 - c, 1.3);                                       // kraj (izlazak sunca) dobiva više prostora
      target = c * (FR - 1);
      rise.style.setProperty('--p', p.toFixed(4));
      var b2 = p > 0.5;
      rise.classList.toggle('beat2', b2);
      if (r2) r2.classList.toggle('split-in', b2);
      kick();
    }
    function kick() { if (!running && ready) { running = true; requestAnimationFrame(tick); } }
    function tick() {
      cur += (target - cur) * 0.16;
      if (Math.abs(target - cur) < 0.05) cur = target;
      var f = Math.round(cur);
      if (f !== shown && !vid.seeking) { shown = f; vid.currentTime = Math.min((f + 0.5) / FPS, vid.duration - 0.01); }
      if (cur !== target || vid.seeking || f !== shown) requestAnimationFrame(tick); else running = false;
    }
    function fail(why) {
      if (window.console) console.warn('Blue Voyage film: static fallback', why);
      window.removeEventListener('scroll', measure); window.removeEventListener('resize', measure);
      rise.classList.remove('film', 'beat2', 'ready'); rise.style.removeProperty('--p');
      if (r1) r1.classList.add('split-in'); if (r2) r2.classList.add('split-in');
    }

    var url = vid.getAttribute(mob ? 'data-src-m' : 'data-src');
    function load(n) {
      return fetch(url).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.blob();
      }).catch(function (e) { if (n > 0) return load(n - 1); throw e; });
    }
    load(1).then(function (blob) {
      vid.addEventListener('loadeddata', function () {
        ready = true; shown = -1; cur = target;
        vid.addEventListener('seeked', function once() { vid.removeEventListener('seeked', once); rise.classList.add('ready'); });
        kick();
      }, { once: true });
      vid.addEventListener('error', function () { fail(vid.error); }, { once: true });
      vid.preload = 'auto';
      vid.src = URL.createObjectURL(blob);
      vid.load();
    }).catch(fail);

    measure();
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
  } else if (rise) {
    rise.querySelectorAll('.r1, .r2').forEach(function (s) { s.classList.add('split-in'); });
  }

  /* prvi tjedan na Kvarneru: pomicanje crta rutu dan po dan */
  var vy = d.querySelector('[data-voyage]');
  if (vy && !reduce && 'getTotalLength' in SVGPathElement.prototype) {
    vy.classList.add('live');
    var legs = Array.prototype.map.call(vy.querySelectorAll('.vy-route path'), function (p) {
      var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; return { el: p, L: L };
    });
    var cardsV = vy.querySelectorAll('.vy-card'), dotsV = vy.querySelectorAll('.vy-dots i'), ports = vy.querySelectorAll('.vy-port');
    var boat = vy.querySelector('.vy-boat'), N = legs.length, cur = -1, want = 0, shown = 0, vyRun = false;
    function vyMeasure() {
      var top = vy.getBoundingClientRect().top, span = vy.offsetHeight - window.innerHeight;
      // malo "praznog hoda" na početku i kraju da prvi i zadnji dan stignu biti pročitani
      want = Math.max(0, Math.min(1, (-top / span - 0.04) / 0.88)) * N;
      if (!vyRun && Math.abs(want - shown) > 0.0005 && top < window.innerHeight && top > -vy.offsetHeight) { vyRun = true; requestAnimationFrame(vyTick); }
    }
    function vyTick() {
      shown += (want - shown) * 0.14;
      if (Math.abs(want - shown) < 0.001) shown = want;
      legs.forEach(function (g, i) { var f = Math.max(0, Math.min(1, shown - i)); g.el.style.strokeDashoffset = (g.L * (1 - f)).toFixed(1); });
      var li = Math.min(N - 1, Math.floor(shown)), lf = Math.min(1, shown - li), g = legs[li];
      var pt = g.el.getPointAtLength(g.L * lf);
      boat.setAttribute('transform', 'translate(' + pt.x.toFixed(1) + ',' + pt.y.toFixed(1) + ')');
      var day = Math.min(N - 1, Math.floor(shown + 0.02));
      if (day !== cur) {
        cur = day;
        cardsV.forEach(function (c, i) { c.classList.toggle('on', i === day); c.setAttribute('aria-hidden', i === day ? 'false' : 'true'); });
        dotsV.forEach(function (x, i) { x.classList.toggle('on', i <= day); });
      }
      ports.forEach(function (p) {
        var s = parseInt(p.getAttribute('data-stop'), 10);
        p.classList.toggle('on', s < 0 || shown >= s + 0.97);
        p.classList.toggle('now', s === day && shown >= s + 0.97 || s < 0 && (shown < 0.03 || shown > N - 0.03));
      });
      if (shown !== want) requestAnimationFrame(vyTick); else vyRun = false;
    }
    window.addEventListener('scroll', vyMeasure, { passive: true });
    window.addEventListener('resize', vyMeasure);
    vyMeasure(); shown = want - 0.0001; vyRun = true; requestAnimationFrame(vyTick);
  } else if (vy) {
    vy.querySelectorAll('.vy-port').forEach(function (p) { p.classList.add('on'); });
  }

  /* izbornik jezika */
  d.querySelectorAll('.langs').forEach(function (w) {
    var b = w.querySelector('.lang');
    b.addEventListener('click', function (e) { e.stopPropagation(); var o = !w.classList.contains('open'); w.classList.toggle('open', o); b.setAttribute('aria-expanded', o); });
    d.addEventListener('click', function () { w.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); });
  });

  /* pojavljivanje pri pomicanju */
  var rv = d.querySelectorAll('.rv, .rv-img');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });

  /* brojači */
  var nums = d.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && !reduce) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        var el = e.target, end = parseInt(el.getAttribute('data-count'), 10), suf = el.getAttribute('data-suffix') || '', t0 = null;
        function step(t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / 1400, 1), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
          el.textContent = v + suf;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    nums.forEach(function (n) { cio.observe(n); });
  }

  /* vrtuljak kartica */
  d.querySelectorAll('.rail-wrap').forEach(function (w) {
    var rail = w.querySelector('.rail'), prev = w.querySelector('.prev'), next = w.querySelector('.next');
    if (!rail) return;
    function step() { var c = rail.firstElementChild; return c ? c.getBoundingClientRect().width + 24 : 300; }
    function upd() {
      if (prev) prev.disabled = rail.scrollLeft < 8;
      if (next) next.disabled = rail.scrollLeft + rail.clientWidth > rail.scrollWidth - 8;
    }
    if (prev) prev.addEventListener('click', function () { rail.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { rail.scrollBy({ left: step(), behavior: 'smooth' }); });
    rail.addEventListener('scroll', upd, { passive: true }); window.addEventListener('resize', upd); upd();
  });

  /* tražilica plovila: duljina, broj osoba, budžet; radi zajedno s filtrom kategorija */
  d.querySelectorAll('[data-finder]').forEach(function (fd) {
    var list = d.getElementById('list');
    if (!list) return;
    var T = JSON.parse(fd.getAttribute('data-t'));
    var LS = JSON.parse(fd.getAttribute('data-len-stops')), GS = JSON.parse(fd.getAttribute('data-guest-stops')), BS = JSON.parse(fd.getAttribute('data-budget-stops'));
    var lo = fd.querySelector('[data-dual=lo]'), hi = fd.querySelector('[data-dual=hi]'), fill = fd.querySelector('.dual-fill');
    var gu = fd.querySelector('[data-single=guests]'), bu = fd.querySelector('[data-single=budget]');
    var outL = fd.querySelector('[data-out=len]'), outG = fd.querySelector('[data-out=guests]'), outB = fd.querySelector('[data-out=budget]');
    var count = fd.querySelector('[data-count]'), resets = d.querySelectorAll('[data-reset]'), nores = list.querySelector('[data-noresults]');
    var flang = fd.getAttribute('data-lang');
    var money = function (n) { return flang === 'en' ? '€' + n.toLocaleString('en-GB') : n.toLocaleString('de-DE') + ' €'; };
    var last = null;
    function state() {
      var a = +lo.value, b = +hi.value;
      if (a > b) { if (last === lo) lo.value = a = b; else hi.value = b = a; }
      return { lmin: a, lmax: b, g: +gu.value, b: bu ? +bu.value : null };
    }
    function label(s) {
      var anyL = s.lmin === 0 && s.lmax === LS.length - 1;
      outL.textContent = anyL ? T.any : (s.lmin === 0 ? '≤ ' + LS[s.lmax] + ' m' : (s.lmax === LS.length - 1 ? '≥ ' + LS[s.lmin] + ' m' : LS[s.lmin] + '–' + LS[s.lmax] + ' m'));
      outG.textContent = s.g === 0 ? T.any : GS[s.g] + '+';
      if (outB) outB.textContent = (s.b === BS.length - 1) ? T.nolimit : '≤ ' + money(BS[s.b]);
      fill.style.setProperty('--a', (s.lmin / (LS.length - 1) * 100) + '%');
      fill.style.setProperty('--b', (s.lmax / (LS.length - 1) * 100) + '%');
      return anyL && s.g === 0 && (!bu || s.b === BS.length - 1);
    }
    function refresh() {
      var s = state(), clean = label(s), shown = 0;
      list.querySelectorAll('[data-group]').forEach(function (g) {
        var off = g.getAttribute('data-off') === '1', vis = 0;
        g.querySelectorAll('.card[data-slug]').forEach(function (c) {
          var L = parseFloat(c.getAttribute('data-len')), G = parseInt(c.getAttribute('data-guests'), 10), P = parseInt(c.getAttribute('data-price'), 10), ok = true;
          if (!(s.lmin === 0 && s.lmax === LS.length - 1)) {
            if (isNaN(L)) ok = false;
            else { if (s.lmin > 0 && L < LS[s.lmin]) ok = false; if (s.lmax < LS.length - 1 && L > LS[s.lmax]) ok = false; }
          }
          if (s.g > 0 && (isNaN(G) || G < GS[s.g])) ok = false;
          if (bu && s.b < BS.length - 1 && (isNaN(P) || P > BS[s.b])) ok = false;
          c.hidden = !ok; if (ok) vis++;
        });
        g.querySelectorAll('.line').forEach(function (ln) { ln.hidden = !ln.querySelector('.card:not([hidden])'); });
        var st = g.querySelector('[data-static]');
        if (st) st.hidden = !clean;
        g.hidden = off || (!clean && vis === 0);
        if (!off) shown += vis;
      });
      count.textContent = shown;
      resets.forEach(function (r) { if (r.closest('.fd-res')) r.hidden = clean; });
      if (nores) nores.hidden = clean || shown > 0;
    }
    list.bvRefresh = refresh;
    [lo, hi, gu, bu].forEach(function (i) { if (i) i.addEventListener('input', function () { last = i; refresh(); }); });
    resets.forEach(function (r) { r.addEventListener('click', function () { lo.value = 0; hi.value = LS.length - 1; gu.value = 0; if (bu) bu.value = BS.length - 1; refresh(); }); });
    refresh();
  });

  /* popis spremljenih plovila: ostaje samo u pregledniku posjetitelja (localStorage) */
  (function () {
    var KEY = 'bv-shortlist', root = html.getAttribute('data-root') || './';
    var store = {
      get: function () { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } },
      set: function (v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }
    };
    var L = TXT;
    var X = '<svg viewBox="0 0 24 24" class="ico"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    var H = '<svg viewBox="0 0 24 24" class="ico"><path d="M12 20s-7-4.4-9.2-8.6C1.2 8.3 3 4.8 6.4 4.5 8.6 4.3 10.4 5.6 12 7.6c1.6-2 3.4-3.3 5.6-3.1 3.4.3 5.2 3.8 3.6 6.9C19 15.6 12 20 12 20z"/></svg>';
    var btn = d.createElement('button'); btn.className = 'sl-btn'; btn.type = 'button';
    btn.innerHTML = H + '<span>' + L.list + '</span><b>0</b>'; body.appendChild(btn);
    var sl = d.createElement('div'); sl.className = 'sl';
    sl.setAttribute('role', 'dialog'); sl.setAttribute('aria-modal', 'true'); sl.setAttribute('aria-label', L.list);
    sl.innerHTML = '<div class="sl-bg"></div><div class="sl-panel"><div class="sl-top"><div><small>Blue Voyage</small><h3>' + L.saved +
      '</h3></div><button class="sl-x" type="button" aria-label="' + L.close + '">' + X + '</button></div><ul class="sl-list"></ul>' +
      '<div class="sl-foot"><button type="button" class="btn btn-dark sl-cmp">' + L.cmp + '</button><a class="btn btn-gold" href="#">' + L.send + '</a><button type="button" class="link">' + L.clear + '</button></div></div>';
    body.appendChild(sl);
    var ul = sl.querySelector('.sl-list'), send = sl.querySelector('.sl-foot a.btn'), clr = sl.querySelector('.sl-foot .link'), cmpB = sl.querySelector('.sl-cmp');
    function abs(p) { return new URL(root + p, location.href).href; }
    function esc(t) { var e = d.createElement('i'); e.textContent = t; return e.innerHTML; }
    function url(x) { return x.u[LANG] || x.u.en || x.u.hr; }
    function mailto(v) {
      var lines = v.map(function (x) { return '• ' + x.n + ' (' + x.c + ') ' + abs(url(x)); }).join('\n');
      return 'mailto:info@bluevoyageyachting.hr?subject=' + encodeURIComponent(L.subj) + '&body=' + encodeURIComponent(L.body + '\n\n' + lines + '\n\n');
    }
    function render() {
      var v = store.get(), ids = v.map(function (x) { return x.s; }), ch = false;
      // ako je plovilo s popisa i na ovoj stranici, osvježi mu podatke (jezik, cijena, tehnički podaci)
      d.querySelectorAll('[data-heart]').forEach(function (h) {
        var x = JSON.parse(h.getAttribute('data-heart')), k = ids.indexOf(x.s);
        if (k > -1 && JSON.stringify(v[k]) !== JSON.stringify(x)) { v[k] = x; ch = true; }
      });
      if (ch) store.set(v);
      btn.querySelector('b').textContent = v.length;
      btn.classList.toggle('show', v.length > 0);
      d.querySelectorAll('[data-heart]').forEach(function (h) {
        var on = ids.indexOf(JSON.parse(h.getAttribute('data-heart')).s) > -1;
        h.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      ul.innerHTML = v.length ? v.map(function (x) {
        return '<li><img src="' + root + x.i + '" alt=""><a href="' + root + url(x) + '"><small>' + esc(x.c) + '</small><b>' + esc(x.n) +
          '</b></a><button class="sl-rm" type="button" data-rm="' + esc(x.s) + '" aria-label="' + L.remove + ': ' + esc(x.n) + '">' + X + '</button></li>';
      }).join('') : '<li class="sl-empty">' + L.empty + '</li>';
      send.hidden = clr.hidden = !v.length;
      cmpB.hidden = v.length < 2;
      send.href = mailto(v);
      if (cmp.classList.contains('open')) { if (v.length < 2) showCmp(false); else drawCmp(v); }
    }
    /* usporedba plovila: tehnički podaci jedno do drugoga */
    var cmp = d.createElement('div'); cmp.className = 'cmp';
    cmp.setAttribute('role', 'dialog'); cmp.setAttribute('aria-modal', 'true'); cmp.setAttribute('aria-label', L.cmpT);
    cmp.innerHTML = '<div class="cmp-panel"><div class="cmp-top"><div><small>Blue Voyage</small><h3>' + L.cmpT + '</h3></div><button class="sl-x" type="button" aria-label="' + L.close + '">' + X +
      '</button></div><div class="cmp-scroll"><table class="cmp-t"></table></div><div class="cmp-foot"><a class="btn btn-gold" href="#">' + L.ask + '</a></div></div>';
    body.appendChild(cmp);
    var tbl = cmp.querySelector('table'), cmpSend = cmp.querySelector('.cmp-foot .btn');
    function num(t) { var m = String(t || '').replace(/\s/g, '').replace(',', '.').match(/\d+(\.\d+)?/); return m ? parseFloat(m[0]) : null; }
    function drawCmp(v) {
      var BEST = [0, 2, 3, 5, 6];   // duljina, osobe, kabine, brzina, gorivo: istakni najveću vrijednost
      var h = '<thead><tr><th scope="col"><span class="vh">' + L.cmpT + '</span></th>' + v.map(function (x) {
        return '<th scope="col"><div class="cmp-boat"><a href="' + root + url(x) + '"><img src="' + root + x.i + '" alt="" loading="lazy"><small>' + esc(x.c) + '</small><b>' + esc(x.n) +
          '</b></a><button class="sl-rm" type="button" data-rm="' + esc(x.s) + '" aria-label="' + L.remove + ': ' + esc(x.n) + '">' + X + '</button></div></th>';
      }).join('') + '</tr></thead><tbody>';
      L.rows.forEach(function (lab, r) {
        var vals = v.map(function (x) { return x.v ? x.v[r] : ''; }), ns = vals.map(num), max = null, cnt = 0;
        ns.forEach(function (n) { if (n != null) { cnt++; if (max == null || n > max) max = n; } });
        if (!vals.some(function (t) { return t; })) return;
        h += '<tr><th scope="row">' + lab + '</th>' + vals.map(function (t, i) {
          var best = BEST.indexOf(r) > -1 && cnt > 1 && ns[i] === max;
          return '<td' + (best ? ' class="best"' : '') + '>' + (t ? esc(t) : '<span class="na">—</span>') + '</td>';
        }).join('') + '</tr>';
      });
      h += '<tr class="cmp-price"><th scope="row">' + L.price + '</th>' + v.map(function (x) { return '<td>' + esc(x.p || '—') + '</td>'; }).join('') + '</tr></tbody>';
      tbl.innerHTML = h;
      tbl.style.setProperty('--n', v.length);
      cmpSend.href = mailto(v);
    }
    function showCmp(o) {
      if (o) { drawCmp(store.get()); sl.classList.remove('open'); }
      cmp.classList.toggle('open', o);
      body.style.overflow = o ? 'hidden' : '';
      if (o) cmp.querySelector('.sl-x').focus(); else btn.focus();
    }
    cmpB.addEventListener('click', function () { showCmp(true); });
    cmp.querySelector('.sl-x').addEventListener('click', function () { showCmp(false); });
    cmp.addEventListener('click', function (e) { if (e.target === cmp) showCmp(false); });
    d.addEventListener('click', function (e) {
      var h = e.target.closest('[data-heart]');
      if (h) {
        e.preventDefault(); e.stopPropagation();
        var x = JSON.parse(h.getAttribute('data-heart')), v = store.get(), i = -1;
        v.forEach(function (y, k) { if (y.s === x.s) i = k; });
        if (i > -1) v.splice(i, 1); else { v.push(x); h.classList.remove('pop'); void h.offsetWidth; h.classList.add('pop'); }
        store.set(v); render(); return;
      }
      var rm = e.target.closest('[data-rm]');
      if (rm) { store.set(store.get().filter(function (y) { return y.s !== rm.getAttribute('data-rm'); })); render(); }
    });
    function open(o) { sl.classList.toggle('open', o); body.style.overflow = o ? 'hidden' : ''; if (o) sl.querySelector('.sl-x').focus(); else btn.focus(); }
    btn.addEventListener('click', function () { open(true); });
    sl.querySelector('.sl-x').addEventListener('click', function () { open(false); });
    sl.querySelector('.sl-bg').addEventListener('click', function () { open(false); });
    d.addEventListener('keydown', function (e) { if (e.key !== 'Escape') return; if (cmp.classList.contains('open')) showCmp(false); else if (sl.classList.contains('open')) open(false); });
    clr.addEventListener('click', function () { store.set([]); render(); });
    window.addEventListener('storage', function (e) { if (e.key === KEY) render(); });
    render();
  })();

  /* filtri na popisima (prodaja, charter, akademija) */
  d.querySelectorAll('[data-filters]').forEach(function (bar) {
    var scope = d.querySelector(bar.getAttribute('data-filters'));
    if (!scope) return;
    var chips = bar.querySelectorAll('[data-f]');
    function apply(f, push) {
      chips.forEach(function (c) { c.setAttribute('aria-current', c.getAttribute('data-f') === f ? 'true' : 'false'); });
      scope.querySelectorAll('[data-group]').forEach(function (g) { g.setAttribute('data-off', (f === 'all' || g.getAttribute('data-group') === f) ? '0' : '1'); });
      if (scope.bvRefresh) scope.bvRefresh(); else scope.querySelectorAll('[data-group]').forEach(function (g) { g.hidden = g.getAttribute('data-off') === '1'; });
      if (push) {
        history.replaceState(null, '', f === 'all' ? location.pathname : '#' + f);
        var top = scope.getBoundingClientRect().top + window.scrollY - 150;
        if (window.scrollY > top) window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
      }
    }
    chips.forEach(function (c) { c.addEventListener('click', function (e) { e.preventDefault(); apply(c.getAttribute('data-f'), true); }); });
    function fromHash() {
      var h = location.hash.slice(1);
      var ok = Array.prototype.some.call(chips, function (c) { return c.getAttribute('data-f') === h; });
      apply(ok ? h : 'all', false);
      if (ok) setTimeout(function () { var top = scope.getBoundingClientRect().top + window.scrollY - 150; window.scrollTo({ top: top }); }, 30);
    }
    fromHash(); window.addEventListener('hashchange', fromHash);
  });

  /* označavanje aktivnog odjeljka u podizborniku (Fischer Panda) */
  var spy = d.querySelector('[data-spy]');
  if (spy && 'IntersectionObserver' in window) {
    var links = spy.querySelectorAll('a[href^="#"]');
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (l) { l.setAttribute('aria-current', l.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'); });
        var on = spy.querySelector('[aria-current=true]');
        if (on) spy.scrollTo({ left: on.offsetLeft - 20, behavior: 'smooth' });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    links.forEach(function (l) { var s = d.getElementById(l.getAttribute('href').slice(1)); if (s) sio.observe(s); });
  }

  /* galerija preko cijelog zaslona */
  var lb, lbImg, lbC, list = [], idx = 0, lastFocus;
  function buildLb() {
    lb = d.createElement('div'); lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true');
    lb.innerHTML = '<img alt="">' +
      '<button class="lb-btn lb-x" aria-label="' + TXT.close + '"><svg viewBox="0 0 24 24" class="ico"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<button class="lb-btn lb-p" aria-label="' + TXT.prev + '"><svg viewBox="0 0 24 24" class="ico"><path d="M15 5l-7 7 7 7"/></svg></button>' +
      '<button class="lb-btn lb-n" aria-label="' + TXT.next + '"><svg viewBox="0 0 24 24" class="ico"><path d="M9 5l7 7-7 7"/></svg></button>' +
      '<div class="lb-c"></div>';
    body.appendChild(lb);
    lbImg = lb.querySelector('img'); lbC = lb.querySelector('.lb-c');
    lb.querySelector('.lb-x').addEventListener('click', closeLb);
    lb.querySelector('.lb-p').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.lb-n').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    var x0 = null;
    lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); x0 = null;
    });
    d.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }
  function show(i) {
    idx = (i + list.length) % list.length;
    lbImg.src = list[idx];
    lbC.textContent = (idx + 1) + ' / ' + list.length;
    lb.querySelector('.lb-p').hidden = lb.querySelector('.lb-n').hidden = list.length < 2;
  }
  function closeLb() {
    if (!lb || !lb.classList.contains('open')) return;
    lb.classList.remove('open'); body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  d.querySelectorAll('[data-gallery]').forEach(function (g) {
    var srcs = JSON.parse(g.getAttribute('data-gallery'));
    g.querySelectorAll('[data-i]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (!lb) buildLb();
        list = srcs; lastFocus = b; show(parseInt(b.getAttribute('data-i'), 10));
        lb.classList.add('open'); body.style.overflow = 'hidden';
        lb.querySelector('.lb-x').focus();
      });
    });
  });

  /* karta se učitava tek na klik */
  var ask = d.getElementById('mapAsk');
  if (ask) ask.querySelector('button').addEventListener('click', function () {
    var f = d.createElement('iframe');
    f.src = ask.getAttribute('data-src'); f.title = ask.getAttribute('data-title') || 'Map'; f.loading = 'lazy';
    f.setAttribute('referrerpolicy', 'no-referrer');
    ask.innerHTML = ''; ask.appendChild(f);
  });

  /* obrazac: otvara program za e-poštu */
  /* obrasci za upit: šalju na /api/upit (Cloudflare Worker); ako to ne uspije,
     otvara se posjetiteljev program za e-poštu s već napisanom porukom */
  d.querySelectorAll('form[data-api]').forEach(function (form) {
    var t0 = Date.now(), sub = form.querySelector('button[type=submit]'), lab = sub.querySelector('span'), labTxt = lab.textContent;
    var ok = form.querySelector('.form-ok'), fb = form.querySelector('.form-fb');
    function el(n) { return form.elements.namedItem(n); }
    var from = el('from'), to = el('to');
    if (from && to) {
      var today = new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
      from.min = to.min = today;
      from.addEventListener('change', function () { to.min = from.value || today; to.setCustomValidity(''); });
      to.addEventListener('change', function () { to.setCustomValidity(''); });
    }
    function data() {
      var o = {};
      Array.prototype.forEach.call(form.elements, function (x) {
        if (!x.name || x.type === 'submit') return;
        if (x.type === 'checkbox') { if (x.checked) o[x.name] = x.value; } else o[x.name] = x.value.trim();
      });
      return o;
    }
    function mailto(o) {
      var lines = [];
      Array.prototype.forEach.call(form.elements, function (x) {
        if (!x.name || x.name === 'website' || x.type === 'submit' || !o[x.name]) return;
        var l = form.querySelector('label[for="' + x.id + '"]'), v = x.tagName === 'SELECT' ? x.options[x.selectedIndex].text : (x.type === 'checkbox' ? '✓' : o[x.name]);
        lines.push((l ? l.textContent : x.name) + ': ' + v);
      });
      var subj = form.getAttribute('data-subj') + ' — ' + (o.name || '');
      return 'mailto:' + form.getAttribute('data-to') + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(lines.join('\n') + '\n');
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      fb.hidden = true;
      if (from && to && from.value && to.value && to.value <= from.value) to.setCustomValidity(form.getAttribute('data-err-date'));
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var o = data();
      o.kind = form.getAttribute('data-kind'); o.lang = LANG; o.page = location.href; o.ms = Date.now() - t0;
      sub.disabled = true; lab.textContent = form.getAttribute('data-sending');
      var ctl = window.AbortController ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 15000);
      fetch(form.getAttribute('data-api'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o), signal: ctl ? ctl.signal : undefined })
        .then(function (res) { return res.ok ? res.json() : { ok: false }; })
        .catch(function () { return { ok: false }; })
        .then(function (j) {
          clearTimeout(timer);
          sub.disabled = false; lab.textContent = labTxt;
          if (j && j.ok) { form.classList.add('sent'); ok.hidden = false; ok.focus(); }
          else { fb.hidden = false; location.href = mailto(o); }
        });
    });
    form.querySelector('.form-again').addEventListener('click', function () {
      form.reset(); form.classList.remove('sent'); ok.hidden = true; fb.hidden = true; t0 = Date.now();
      var first = form.querySelector('input:not([type=hidden]), select, textarea'); if (first) first.focus();
    });
  });
})();
