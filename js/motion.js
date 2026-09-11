// =====================================================
// MOTEUR DE MOUVEMENT — BDE Dauphine
// Ce fichier centralise TOUTES les animations du site.
// Il remplace les blocs de script dupliqués dans chaque page.
//
// Règles de conception :
//   1. Aucune dépendance, aucun CDN.
//   2. Le scroll natif n'est jamais détourné.
//   3. Chaque effet a un état de repos lisible sans JS,
//      sous prefers-reduced-motion, et à l'impression.
//   4. Une seule boucle requestAnimationFrame pour tout le site,
//      et elle s'arrête dès qu'il n'y a plus rien à animer.
//
// Pour désactiver un effet sur une page : retirer la classe
// correspondante dans le HTML. Rien ne casse.
// =====================================================
(function () {
  'use strict';

  var root = document.documentElement;

  // ── Marqueur « JS actif » ────────────────────────────
  // Tout état masqué (.reveal, .fx-mask, .gallery-item)
  // est conditionné à html.js dans style.css. Sans JS,
  // le contenu reste visible et lisible.
  root.classList.add('js');

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(pointer: fine) and (any-hover: hover)');

  function motionOK() { return !reduce.matches; }

  // =====================================================
  // BOUCLE rAF PARTAGÉE
  // Les effets s'y abonnent et s'en désabonnent.
  // Zéro abonné => la boucle s'arrête complètement.
  // =====================================================
  var tasks = [];
  var running = false;

  function frame(now) {
    for (var i = tasks.length - 1; i >= 0; i--) {
      if (tasks[i](now) === false) tasks.splice(i, 1);
    }
    if (tasks.length) {
      requestAnimationFrame(frame);
    } else {
      running = false;
    }
  }

  function addTask(fn) {
    if (tasks.indexOf(fn) === -1) tasks.push(fn);
    if (!running) { running = true; requestAnimationFrame(frame); }
  }

  function removeTask(fn) {
    var i = tasks.indexOf(fn);
    if (i !== -1) tasks.splice(i, 1);
  }

  // Une seule lecture du scroll par frame, partagée.
  function onScrollFrame(fn) {
    var pending = false;
    function run() { pending = false; fn(window.pageYOffset); return false; }
    window.addEventListener('scroll', function () {
      if (!pending) { pending = true; addTask(run); }
    }, { passive: true });
    fn(window.pageYOffset);
  }

  // =====================================================
  // 1. BARRE DE NAVIGATION
  // =====================================================
  function initNav() {
    var nav = document.getElementById('nav');
    if (!nav) return;
    var on = false;
    onScrollFrame(function (y) {
      var next = y > 40;
      if (next !== on) { on = next; nav.classList.toggle('scrolled', on); }
    });
  }

  // =====================================================
  // 2. RÉVÉLATIONS AU SCROLL — cadence géométrique
  //
  // Le décalage entre éléments n'est PAS basé sur l'ordre
  // dans le DOM. Dans une grille `columns:3`, l'ordre DOM
  // descend toute la première colonne avant de remonter :
  // un décalage par index produit un zigzag.
  //
  // On mesure donc la position réelle de chaque élément et
  // on en déduit une vague diagonale (haut-gauche vers
  // bas-droite), identique quel que soit le nombre de
  // colonnes — donc identique sur mobile.
  // =====================================================
  // Les trois familles de grilles photo du site. Le dévoilement
  // directionnel s'applique aux trois ; la lightbox reste réservée
  // aux pages galerie, seules à en avoir le balisage.
  var PHOTO_SEL = '.gallery-item, .gal-item, .hwd-gal-item';

  var STAGGER_SPAN = 0.55;   // secondes, du premier au dernier
  var STAGGER_STEP_MAX = 0.09;

  function scheduleGroup(items) {
    if (!items.length) return;
    if (items.length === 1) { items[0].el.style.removeProperty('--fx-delay'); return; }

    var vw = window.innerWidth || 1;
    var minY = Infinity, maxY = -Infinity;

    for (var i = 0; i < items.length; i++) {
      if (items[i].y < minY) minY = items[i].y;
      if (items[i].y > maxY) maxY = items[i].y;
    }
    var spanY = Math.max(1, maxY - minY);

    // Empêche une cascade interminable sur une galerie de 54 photos.
    var span = Math.min(STAGGER_SPAN, STAGGER_STEP_MAX * (items.length - 1));

    for (var j = 0; j < items.length; j++) {
      var nx = Math.min(1, Math.max(0, items[j].x / vw));
      var ny = (items[j].y - minY) / spanY;
      // La verticale pèse plus que l'horizontale : la vague
      // descend, elle ne balaie pas latéralement.
      var t = ny * 0.65 + nx * 0.35;
      items[j].el.style.setProperty('--fx-delay', (t * span).toFixed(3) + 's');
    }
  }

  function initReveal() {
    var els = document.querySelectorAll('.reveal, .fx-item');
    if (!els.length) return;

    if (!motionOK()) {
      // Sous reduced-motion : tout est déjà visible via CSS,
      // on marque simplement l'état final et on s'arrête.
      for (var k = 0; k < els.length; k++) els[k].classList.add('in');
      return;
    }

    // Les éléments déjà dans la fenêtre au chargement sont
    // révélés ensemble, comme un seul groupe.
    var pending = [];
    var flushScheduled = false;

    function flush() {
      flushScheduled = false;
      if (!pending.length) return;
      var group = pending;
      pending = [];
      scheduleGroup(group);
      for (var i = 0; i < group.length; i++) group[i].el.classList.add('in');
    }

    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        var r = e.boundingClientRect;
        pending.push({ el: e.target, x: r.left + r.width / 2, y: r.top });
      }
      // Regroupe tout ce qui entre dans la même frame,
      // pour que la cadence soit calculée sur l'ensemble.
      if (pending.length && !flushScheduled) {
        flushScheduled = true;
        requestAnimationFrame(flush);
      }
    }, { threshold: 0.06, rootMargin: '0px 0px -8% 0px' });

    for (var i2 = 0; i2 < els.length; i2++) {
      // Neutralise les transition-delay codés en dur dans le HTML :
      // la cadence géométrique les remplace.
      if (els[i2].style.transitionDelay) els[i2].style.transitionDelay = '';
      io.observe(els[i2]);
    }
  }

  // =====================================================
  // 3. TITRES — dévoilement par masque dégradé
  //
  // Un masque linear-gradient balaie le titre. Contrairement
  // à un découpage en <span>, la technique ne touche pas au
  // contenu : applyLang() réécrit innerHTML sans rien casser.
  // =====================================================
  function initHeadings() {
    if (!motionOK()) return;
    if (!window.CSS || !CSS.supports) return;
    if (!CSS.supports('mask-image', 'linear-gradient(#000, #000)') &&
        !CSS.supports('-webkit-mask-image', 'linear-gradient(#000, #000)')) return;

    var els = document.querySelectorAll('.fx-mask');
    if (!els.length) return;

    root.classList.add('fx-mask-live');

    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (!entries[i].isIntersecting) continue;
        io.unobserve(entries[i].target);
        entries[i].target.classList.add('in');
      }
    }, { threshold: 0.25, rootMargin: '0px 0px -5% 0px' });

    for (var j = 0; j < els.length; j++) io.observe(els[j]);
  }

  // =====================================================
  // 4. PARALLAXE DE HERO
  //
  // Écriture depuis la boucle rAF, jamais depuis le
  // gestionnaire de scroll, et bornée à la hauteur du hero :
  // au-delà, la couche a quitté l'écran et on n'écrit plus.
  // =====================================================
  // La largeur est évaluée à chaque usage, jamais mémorisée au
  // démarrage : une page ouverte dans un onglet d'arrière-plan
  // rapporte une largeur de 0, ce qui désactiverait les effets
  // définitivement si on la lisait une seule fois.
  var wide = window.matchMedia('(min-width: 768px)');

  function initParallax() {
    var layers = document.querySelectorAll('[data-parallax]');
    if (!layers.length || !motionOK()) return;

    var list = [];
    for (var i = 0; i < layers.length; i++) {
      var speed = parseFloat(layers[i].getAttribute('data-parallax')) || 0.25;
      list.push({ el: layers[i], speed: speed, last: null });
    }

    onScrollFrame(function (y) {
      // Sur mobile la parallaxe coûte plus qu'elle ne rapporte
      // (repeints sur une image plein écran pendant le scroll).
      var on = wide.matches;
      var limit = window.innerHeight;
      for (var i = 0; i < list.length; i++) {
        var item = list[i];
        var offset = (on && y < limit) ? Math.round(y * item.speed) : null;
        if (offset === item.last) continue;
        item.last = offset;
        item.el.style.transform = offset === null ? '' : 'translate3d(0,' + offset + 'px,0)';
      }
    });
  }

  // =====================================================
  // 5. BANDEAUX DÉFILANTS
  //
  // Chaque bandeau contient une copie visible et une copie
  // aria-hidden. La copie est dupliquée autant de fois qu'il
  // faut pour couvrir la fenêtre : c'est ce qui corrigeait le
  // trou visible sur les grands écrans quand le contenu était
  // plus étroit que la fenêtre.
  // =====================================================
  function fillMarquee(marquee) {
    var first = marquee.querySelector('.marquee__content');
    if (!first) return;

    // Retire les copies précédentes (re-calcul au resize).
    var copies = marquee.querySelectorAll('.marquee__content[data-marquee-copy]');
    for (var i = 0; i < copies.length; i++) copies[i].remove();

    var unit = first.scrollWidth;
    if (!unit) return;

    // Chaque bloc se décale de sa propre largeur. Pour qu'aucun
    // vide n'apparaisse à droite, la largeur totale doit valoir
    // au moins « une fenêtre + un bloc » :
    //     (copies + 1) * unit >= fenetre + unit
    // soit copies >= fenetre / unit. Une copie au minimum.
    var needed = Math.max(1, Math.ceil(window.innerWidth / unit));
    var frag = document.createDocumentFragment();
    for (var j = 0; j < needed; j++) {
      var clone = first.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.setAttribute('data-marquee-copy', '');
      // Les copies ne doivent jamais être atteignables au clavier.
      var focusables = clone.querySelectorAll('a, button, input, [tabindex]');
      for (var k = 0; k < focusables.length; k++) focusables[k].setAttribute('tabindex', '-1');
      frag.appendChild(clone);
    }
    marquee.appendChild(frag);
    marquee.style.setProperty('--marquee-copies', String(needed + 1));
  }

  function initMarquees() {
    var marquees = document.querySelectorAll('.marquee');
    if (!marquees.length) return;

    function fillAll() {
      for (var i = 0; i < marquees.length; i++) fillMarquee(marquees[i]);
    }

    fillAll();

    // Les logos changent la largeur du bandeau une fois chargés.
    window.addEventListener('load', fillAll);

    // Une page ouverte dans un onglet d'arrière-plan mesure 0 :
    // on recalcule dès qu'elle devient réellement visible.
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') fillAll();
    });
    window.addEventListener('pageshow', fillAll);

    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(fillAll, 200);
    }, { passive: true });
  }

  // =====================================================
  // 6. GALERIES — dévoilement directionnel
  //
  // Le cadre s'ouvre depuis le bord où la photo se trouve
  // (colonne de gauche => vers la gauche, etc.) pendant que
  // l'image se remet à l'échelle à l'intérieur. Le mouvement
  // vient donc de la mise en page, pas d'un choix arbitraire.
  // =====================================================
  function initGalleryReveal() {
    var items = document.querySelectorAll(PHOTO_SEL);
    if (!items.length) return;

    if (!motionOK()) {
      for (var n = 0; n < items.length; n++) items[n].classList.add('in');
      return;
    }

    root.classList.add('fx-gallery-live');

    var pending = [];
    var scheduled = false;

    function flush() {
      scheduled = false;
      if (!pending.length) return;
      var group = pending;
      pending = [];
      var vw = window.innerWidth || 1;
      for (var i = 0; i < group.length; i++) {
        var it = group[i];
        var third = it.x / vw;
        it.el.setAttribute('data-dir', third < 0.34 ? 'left' : (third > 0.66 ? 'right' : 'up'));
      }
      scheduleGroup(group);
      for (var j = 0; j < group.length; j++) group[j].el.classList.add('in');
    }

    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        var r = e.boundingClientRect;
        pending.push({ el: e.target, x: r.left + r.width / 2, y: r.top });
      }
      if (pending.length && !scheduled) { scheduled = true; requestAnimationFrame(flush); }
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

    for (var m = 0; m < items.length; m++) io.observe(items[m]);
  }

  // =====================================================
  // 7. GALERIES — profondeur au scroll
  //
  // L'image se translate lentement à l'intérieur de son cadre
  // pendant qu'elle traverse la fenêtre. Une seule tâche rAF
  // pour toute la page, et seuls les éléments réellement
  // visibles sont calculés.
  // =====================================================
  function initGalleryDepth() {
    if (!motionOK()) return;

    var all = document.querySelectorAll('.gallery-item > img, .gal-item > img, .hwd-gal-item > img');
    if (all.length < 2) return;

    var visible = [];
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var img = entries[i].target;
        var idx = visible.indexOf(img);
        if (entries[i].isIntersecting) { if (idx === -1) visible.push(img); }
        else if (idx !== -1) { visible.splice(idx, 1); img.style.removeProperty('--fx-shift'); }
      }
      if (visible.length) addTask(tick); else removeTask(tick);
    }, { rootMargin: '10% 0px 10% 0px' });

    function tick() {
      if (!visible.length) return false;
      // Sous 768px on garde les images immobiles, mais la boucle
      // reste abonnée : si l'utilisateur pivote son téléphone,
      // l'effet reprend sans rien réinitialiser.
      if (!wide.matches) {
        for (var k = 0; k < visible.length; k++) visible[k].style.setProperty('--fx-shift', '0%');
        return true;
      }
      var h = window.innerHeight || 1;
      for (var i = 0; i < visible.length; i++) {
        var img = visible[i];
        var r = img.getBoundingClientRect();
        // -1 en bas de fenêtre, +1 en haut.
        var p = 1 - 2 * ((r.top + r.height / 2) / h);
        img.style.setProperty('--fx-shift', (Math.max(-1, Math.min(1, p)) * 3).toFixed(2) + '%');
      }
      return true;
    }

    root.classList.add('fx-depth-live');
    for (var j = 0; j < all.length; j++) io.observe(all[j]);
  }

  // =====================================================
  // 8. LIGHTBOX ACCESSIBLE
  //
  // Reprend les deux balisages existants (#lightbox et
  // #lbOverlay) et leur ajoute : ouverture au clavier,
  // piège de focus, restitution du focus, verrouillage du
  // scroll, libellés ARIA.
  // =====================================================
  function initLightbox() {
    var box = document.getElementById('lightbox') || document.getElementById('lbOverlay');
    if (!box) return;

    var items = [].slice.call(document.querySelectorAll('.gallery-item'));
    if (!items.length) return;

    var imgEl = document.getElementById('lbImg');
    var capEl = document.getElementById('lbCap') || document.getElementById('lbCaption');
    var countEl = document.getElementById('lbCounter');
    if (!imgEl) return;

    var openClass = box.id === 'lightbox' ? 'open' : 'active';
    var current = 0;
    var lastFocus = null;

    var shots = items.map(function (item) {
      var img = item.querySelector('img');
      var cap = item.querySelector('.gallery-caption-text') || item.querySelector('.gallery-item-caption p');
      return {
        src: item.getAttribute('data-src') || (img ? img.getAttribute('src') : ''),
        alt: img ? (img.getAttribute('alt') || '') : '',
        caption: item.getAttribute('data-caption') || (cap ? cap.textContent.trim() : '')
      };
    });

    var isEn = function () { return document.documentElement.lang === 'en'; };

    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Galerie photos');

    function label(el, fr, en) {
      if (!el) return;
      el.setAttribute('aria-label', isEn() ? en : fr);
      el.setAttribute('data-lb-fr', fr);
      el.setAttribute('data-lb-en', en);
      if (el.tagName === 'BUTTON') el.setAttribute('type', 'button');
    }

    var closeBtn = box.querySelector('.lb-close') || document.getElementById('lbClose');
    var prevBtn = box.querySelector('.lb-prev') || document.getElementById('lbPrev');
    var nextBtn = box.querySelector('.lb-next') || document.getElementById('lbNext');
    label(closeBtn, 'Fermer la galerie', 'Close gallery');
    label(prevBtn, 'Photo précédente', 'Previous photo');
    label(nextBtn, 'Photo suivante', 'Next photo');

    function show(i) {
      current = (i + shots.length) % shots.length;
      var s = shots[current];
      imgEl.setAttribute('src', s.src);
      imgEl.setAttribute('alt', s.alt);
      if (capEl) capEl.textContent = s.caption;
      if (countEl) countEl.textContent = (current + 1) + ' / ' + shots.length;
    }

    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      box.classList.add(openClass);
      document.body.classList.add('is-locked');
      (closeBtn || box).focus();
    }

    function close() {
      box.classList.remove(openClass);
      document.body.classList.remove('is-locked');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
      lastFocus = null;
    }

    function isOpen() { return box.classList.contains(openClass); }

    items.forEach(function (item, i) {
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      if (!item.getAttribute('aria-label')) {
        var img = item.querySelector('img');
        item.setAttribute('aria-label',
          (img && img.getAttribute('alt')) ? img.getAttribute('alt') : 'Photo ' + (i + 1));
      }
      item.addEventListener('click', function () { open(i); });
      item.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar') {
          ev.preventDefault();
          open(i);
        }
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', close);
    if (prevBtn) prevBtn.addEventListener('click', function () { show(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { show(current + 1); });
    box.addEventListener('click', function (ev) { if (ev.target === box) close(); });

    document.addEventListener('keydown', function (ev) {
      if (!isOpen()) return;
      if (ev.key === 'Escape') { ev.preventDefault(); close(); return; }
      if (ev.key === 'ArrowLeft') { ev.preventDefault(); show(current - 1); return; }
      if (ev.key === 'ArrowRight') { ev.preventDefault(); show(current + 1); return; }
      if (ev.key !== 'Tab') return;

      // Piège de focus : le Tab ne sort pas de la lightbox.
      var focusables = [].slice.call(
        box.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])')
      ).filter(function (el) { return el.offsetParent !== null || el === document.activeElement; });
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
      else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
    });

    // Les pages « lightbox » appellent openLightbox(i) en inline.
    window.openLightbox = open;
    window.closeLightbox = close;
    window.navLightbox = function (dir) { show(current + dir); };
    window.closeLightboxBg = function (ev) { if (ev && ev.target === box) close(); };

    // Rafraîchit les libellés quand la langue change.
    window.addEventListener('bde:langchange', function () {
      [closeBtn, prevBtn, nextBtn].forEach(function (el) {
        if (!el) return;
        el.setAttribute('aria-label',
          isEn() ? el.getAttribute('data-lb-en') : el.getAttribute('data-lb-fr'));
      });
    });
  }

  // =====================================================
  // 9. APERÇU AU SURVOL DES ÉVÉNEMENTS
  //
  // Un seul élément partagé pour toutes les lignes, jamais
  // un par ligne. Deux couches glissent en sens inverse :
  // le cadre découvre l'image au lieu de la déplacer.
  // Jamais instancié au toucher.
  // =====================================================
  function initRowPreview() {
    if (!finePointer.matches || !motionOK()) return;

    var rows = document.querySelectorAll('[data-preview]');
    if (!rows.length) return;

    var host = document.createElement('div');
    host.className = 'fx-preview';
    host.setAttribute('aria-hidden', 'true');
    // La vignette porte l'image, le sous-titre et le lieu. Ces deux
    // derniers existaient déjà en base sans être affichés nulle part.
    host.innerHTML =
      '<div class="fx-preview__inner">' +
        '<img class="fx-preview__img" alt="" decoding="async" />' +
        '<span class="fx-preview__meta">' +
          '<span class="fx-preview__sub"></span>' +
          '<span class="fx-preview__venue"></span>' +
        '</span>' +
      '</div>';
    document.body.appendChild(host);

    var inner = host.firstChild;
    var img = inner.querySelector('.fx-preview__img');
    var subEl = inner.querySelector('.fx-preview__sub');
    var venueEl = inner.querySelector('.fx-preview__venue');

    var tx = 0, ty = 0, cx = 0, cy = 0, prevX = 0;
    var active = null;
    var seeded = false;

    function tick() {
      if (!active) return false;
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      // Inclinaison dérivée de la vitesse horizontale, très
      // amortie : ±5°, pas les ±60° de la démo d'origine.
      var tilt = Math.max(-5, Math.min(5, (tx - prevX) * 0.35));
      prevX += (tx - prevX) * 0.2;
      host.style.transform =
        'translate3d(' + Math.round(cx) + 'px,' + Math.round(cy) + 'px,0) rotate(' + tilt.toFixed(2) + 'deg)';
      return true;
    }

    function move(ev) {
      tx = ev.clientX + 26;
      ty = ev.clientY - 90;
      if (!seeded) { cx = tx; cy = ty; prevX = tx; seeded = true; }
    }

    for (var i = 0; i < rows.length; i++) {
      (function (row) {
        var src = row.getAttribute('data-preview');
        if (!src) return;

        row.addEventListener('pointerenter', function (ev) {
          if (ev.pointerType !== 'mouse') return;
          active = row;
          seeded = false;
          move(ev);
          if (img.getAttribute('src') !== src) img.setAttribute('src', src);

          var en = document.documentElement.lang === 'en';
          var sub = (en && row.getAttribute('data-preview-sub-en')) ||
                    row.getAttribute('data-preview-sub') || '';
          var venue = row.getAttribute('data-preview-venue') || '';
          subEl.textContent = sub;
          venueEl.textContent = venue;
          host.classList.toggle('has-meta', Boolean(sub || venue));

          host.classList.add('is-on');
          addTask(tick);
        });

        row.addEventListener('pointermove', function (ev) {
          if (ev.pointerType !== 'mouse' || active !== row) return;
          move(ev);
        });

        row.addEventListener('pointerleave', function () {
          if (active !== row) return;
          active = null;
          host.classList.remove('is-on');
        });
      })(rows[i]);
    }
  }

  // =====================================================
  // 10. ÉCHO AU SURVOL (cartes artistes)
  //
  // Copies empilées de la même image, chacune un peu plus
  // petite et un peu plus inclinée. Les copies ne sont
  // créées qu'au premier survol : coût nul tant que
  // personne ne survole, et jamais au toucher.
  // =====================================================
  var ECHO_COUNT = 5;

  function initEcho() {
    if (!finePointer.matches || !motionOK()) return;

    var cards = document.querySelectorAll('.fx-echo');
    for (var i = 0; i < cards.length; i++) {
      (function (card) {
        var built = false;
        card.addEventListener('pointerenter', function build(ev) {
          if (built || ev.pointerType !== 'mouse') return;
          built = true;
          var img = card.querySelector('img');
          if (!img) return;
          var stack = document.createElement('div');
          stack.className = 'fx-echo__stack';
          stack.setAttribute('aria-hidden', 'true');
          for (var n = 1; n <= ECHO_COUNT; n++) {
            var copy = document.createElement('span');
            copy.className = 'fx-echo__layer';
            copy.style.setProperty('--i', String(n));
            copy.style.backgroundImage = 'url("' + img.getAttribute('src') + '")';
            stack.appendChild(copy);
          }
          card.insertBefore(stack, card.firstChild);
          card.removeEventListener('pointerenter', build);
        });
      })(cards[i]);
    }
  }

  // =====================================================
  // 11. CURSEUR
  //
  // Le halo flou de 380px est supprimé : une couche
  // plein écran repeinte à chaque frame pour un effet que
  // personne ne remarque. Reste un point discret, et
  // uniquement quand un vrai pointeur est présent.
  // Le curseur système n'est plus jamais masqué sur les
  // champs de formulaire ni sur les boutons.
  // =====================================================
  function initCursor() {
    var dot = document.getElementById('cursorDot');
    var blob = document.getElementById('cursorBlob');
    if (blob) blob.remove();
    if (!dot) return;

    if (!finePointer.matches || !motionOK()) { dot.remove(); return; }

    root.classList.add('fx-cursor-live');

    var x = 0, y = 0, shown = false;
    var pending = false;

    function paint() {
      pending = false;
      dot.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) translate(-50%,-50%)';
      return false;
    }

    document.addEventListener('pointermove', function (ev) {
      if (ev.pointerType !== 'mouse') return;
      x = ev.clientX; y = ev.clientY;
      if (!shown) { shown = true; dot.classList.add('is-on'); }
      if (!pending) { pending = true; addTask(paint); }
    }, { passive: true });

    document.addEventListener('pointerleave', function () {
      shown = false;
      dot.classList.remove('is-on');
    });
  }

  // =====================================================
  // 12. MENU MOBILE / MODALES / LANGUE
  // Repris tel quel depuis les scripts de page, avec en plus
  // le verrouillage de scroll par classe et l'état ARIA.
  // =====================================================
  function initChrome() {
    var burger = document.getElementById('navBurger');
    var links = document.getElementById('navLinks');

    window.toggleNav = function () {
      if (!burger || !links) return;
      var open = !links.classList.contains('open');
      burger.classList.toggle('open', open);
      links.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('is-locked', open);
    };

    if (burger) {
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('type', 'button');
    }

    if (links) {
      var anchors = links.querySelectorAll('a');
      for (var i = 0; i < anchors.length; i++) {
        anchors[i].addEventListener('click', function () {
          if (!links.classList.contains('open')) return;
          links.classList.remove('open');
          if (burger) {
            burger.classList.remove('open');
            burger.setAttribute('aria-expanded', 'false');
          }
          document.body.classList.remove('is-locked');
        });
      }
    }

    var modals = document.querySelectorAll('.modal-overlay');
    function closeAllModals() {
      for (var m = 0; m < modals.length; m++) modals[m].classList.remove('open');
      document.body.classList.remove('is-locked');
    }

    var ticket = document.getElementById('ticketModal');
    var photos = document.getElementById('photosModal');

    function opener(el) {
      return function (ev) {
        if (ev) ev.preventDefault();
        if (!el) return;
        el.classList.add('open');
        document.body.classList.add('is-locked');
        var btn = el.querySelector('.modal-close');
        if (btn) btn.focus();
      };
    }

    window.openModal = opener(ticket);
    window.closeModal = closeAllModals;
    window.closeModalOnBg = function (ev) { if (ev && ev.target === ticket) closeAllModals(); };
    window.openPhotos = opener(photos);
    window.closePhotos = closeAllModals;
    window.closePhotosOnBg = function (ev) { if (ev && ev.target === photos) closeAllModals(); };

    document.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Escape') return;
      for (var m = 0; m < modals.length; m++) {
        if (modals[m].classList.contains('open')) { closeAllModals(); return; }
      }
    });

    for (var n = 0; n < modals.length; n++) {
      modals[n].setAttribute('role', 'dialog');
      modals[n].setAttribute('aria-modal', 'true');
      var close = modals[n].querySelector('.modal-close');
      if (close) {
        close.setAttribute('type', 'button');
        close.setAttribute('aria-label', 'Fermer');
      }
    }
  }

  var LANG_KEY = 'bde-lang';

  function applyLang(lang) {
    document.documentElement.lang = lang;
    var btn = document.getElementById('langToggle');
    if (btn) {
      btn.textContent = lang === 'en' ? 'FR' : 'EN';
      btn.setAttribute('aria-label', lang === 'en' ? 'Passer en français' : 'Switch to English');
    }
    var els = document.querySelectorAll('[data-fr]');
    for (var i = 0; i < els.length; i++) {
      var next = lang === 'en' ? els[i].dataset.en : els[i].dataset.fr;
      if (next === undefined) continue;
      els[i].innerHTML = next;
    }
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    window.dispatchEvent(new CustomEvent('bde:langchange', { detail: { lang: lang } }));
  }

  function initLang() {
    window.applyLang = applyLang;
    window.toggleLang = function () {
      applyLang((document.documentElement.lang || 'fr') === 'fr' ? 'en' : 'fr');
    };
    var saved = null;
    try { saved = localStorage.getItem(LANG_KEY); } catch (e) {}
    if (saved) { applyLang(saved); return; }
    // Première visite : anglais si le navigateur n'est pas francophone.
    if ((navigator.language || 'fr').toLowerCase().indexOf('fr') !== 0) applyLang('en');
  }

  // =====================================================
  // 13. COMPTEURS
  //
  // Le site affiche 28 nombres isolés (chiffres clés, stats du
  // hero, stats du label, années) qui ne bougeaient jamais.
  //
  // On ne touche PAS au texte du DOM tant que l'animation n'a
  // pas démarré : le nombre final reste la valeur servie, donc
  // lisible sans JS et par les moteurs de recherche. Le suffixe
  // et le préfixe (« 1500+ », « 10k ») sont préservés tels quels.
  // =====================================================
  // Un separateur de milliers n'est reconnu que s'il est suivi
  // d'exactement trois chiffres. Sans cette contrainte, « 46 ans »
  // voyait son espace avale par le nombre et ressortait « 46ans ».
  var SEP_CLASS = '[\s\u00a0\u202f.,]';
  var NUM_RE = new RegExp('^(\D*?)(\d{1,3}(?:' + SEP_CLASS + '\d{3})+|\d+)([\s\S]*)$');
  var SEP_RE = new RegExp(SEP_CLASS);
  var SEP_RE_G = new RegExp(SEP_CLASS, 'g');

  function parseCount(text) {
    var m = NUM_RE.exec(text.trim());
    if (!m) return null;
    var body = m[2];
    // On conserve le caractere separateur exact du texte d'origine
    // (espace fine insecable comprise) plutot que de le normaliser.
    var hit = body.match(SEP_RE);
    var value = parseInt(body.replace(SEP_RE_G, ''), 10);
    if (!isFinite(value) || value < 0) return null;
    return { prefix: m[1], value: value, suffix: m[3], sep: hit ? hit[0] : '' };
  }

  function formatCount(n, model) {
    var s = String(n);
    if (model.sep) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, model.sep);
    return model.prefix + s + model.suffix;
  }

  function initCounters() {
    var els = document.querySelectorAll('.fx-count');
    if (!els.length || !motionOK()) return;

    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (!entries[i].isIntersecting) continue;
        var el = entries[i].target;
        io.unobserve(el);
        run(el);
      }
    }, { threshold: 0.6 });

    function run(el) {
      var model = parseCount(el.textContent);
      // Valeur non numérique (« Paris ») : on laisse tel quel.
      if (!model || model.value < 2) return;

      var start = null;
      var dur = 900;
      var target = model.value;

      function step(now) {
        if (start === null) start = now;
        var t = Math.min(1, (now - start) / dur);
        // easeOutExpo : démarrage franc, arrivée posée.
        var e = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        el.textContent = formatCount(Math.round(target * e), model);
        if (t < 1) return true;
        el.textContent = formatCount(target, model);
        return false;
      }
      addTask(step);
    }

    for (var j = 0; j < els.length; j++) io.observe(els[j]);
  }

  // =====================================================
  // 14. PROXIMITÉ
  //
  // L'intensité monte à mesure que le curseur s'approche, avant
  // même le survol. Deux variables CSS sont posées sur la carte :
  // --fx-near (0 → 1) et l'angle d'inclinaison.
  //
  // Une seule tâche rAF pour toute la page, et seules les cartes
  // réellement visibles sont mesurées. Jamais au toucher.
  // =====================================================
  var NEAR_RADIUS = 260;

  function initProximity() {
    if (!finePointer.matches || !motionOK()) return;

    var cards = document.querySelectorAll('.fx-near');
    if (!cards.length) return;

    var live = [];
    var mx = -9999, my = -9999;
    var moved = false;

    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var el = entries[i].target;
        var k = live.indexOf(el);
        if (entries[i].isIntersecting) { if (k === -1) live.push(el); }
        else if (k !== -1) { live.splice(k, 1); el.style.setProperty('--fx-near', '0'); }
      }
    }, { rootMargin: '15% 0px 15% 0px' });

    for (var c = 0; c < cards.length; c++) io.observe(cards[c]);

    function tick() {
      if (!moved) return true;
      moved = false;
      for (var i = 0; i < live.length; i++) {
        var el = live[i];
        var r = el.getBoundingClientRect();
        var cx = r.left + r.width / 2;
        var cy = r.top + r.height / 2;
        var dx = mx - cx, dy = my - cy;
        var d = Math.sqrt(dx * dx + dy * dy);
        var near = Math.max(0, 1 - d / NEAR_RADIUS);
        el.style.setProperty('--fx-near', near.toFixed(3));
      }
      return true;
    }

    document.addEventListener('pointermove', function (ev) {
      if (ev.pointerType !== 'mouse') return;
      mx = ev.clientX; my = ev.clientY; moved = true;
      addTask(tick);
    }, { passive: true });

    root.classList.add('fx-near-live');
  }

  // =====================================================
  // 15. ALBUM PHOTOS EXTERNE
  //
  // Sept pages galerie affichaient un bouton « Photos … »
  // pointant en dur vers https://photos.google.com/ — une
  // valeur de remplissage. Le bouton ne menait donc nulle part.
  //
  // Le lien vient désormais de /data/galleries.js
  // (champ googlePhotosUrl). Tant qu'il vaut la valeur de
  // remplissage ou reste vide, le bouton et sa modale sont
  // retirés : mieux vaut pas de bouton qu'un bouton mort.
  //
  // Pour le réactiver : renseigner googlePhotosUrl avec
  // l'adresse réelle de l'album dans data/galleries.js.
  // =====================================================
  var PHOTOS_PLACEHOLDER = /^https:\/\/photos\.google\.com\/?$/;

  function initPhotosAlbum() {
    var modal = document.getElementById('photosModal');
    var triggers = document.querySelectorAll('[onclick*="openPhotos"]');
    if (!modal && !triggers.length) return;

    var host = document.querySelector('[data-gallery-slug]');
    var slug = host ? host.getAttribute('data-gallery-slug') : null;
    var url = '';

    if (slug && window.BDE_GALLERIES) {
      for (var i = 0; i < window.BDE_GALLERIES.length; i++) {
        if (window.BDE_GALLERIES[i].slug === slug) {
          url = window.BDE_GALLERIES[i].googlePhotosUrl || '';
          break;
        }
      }
    }

    var usable = url && !PHOTOS_PLACEHOLDER.test(url.trim());

    if (!usable) {
      for (var t = 0; t < triggers.length; t++) triggers[t].remove();
      if (modal) modal.remove();
      return;
    }

    var link = modal && modal.querySelector('.modal-shotgun-btn');
    if (link) {
      link.setAttribute('href', url);
      link.setAttribute('rel', 'noopener');
    }
  }

  // =====================================================
  // FILET DE SÉCURITÉ
  //
  // Une page ouverte dans un onglet d'arrière-plan a
  // document.hidden === true : le rendu est suspendu et les
  // IntersectionObserver ne se déclenchent pas. Si l'onglet
  // n'est jamais regardé puis restauré, du contenu pourrait
  // rester à opacity 0.
  //
  // Rien de ce site ne doit pouvoir rester invisible. On
  // vérifie donc au retour de visibilité, puis une dernière
  // fois après quelques secondes : tout élément encore masqué
  // et présent dans la fenêtre est révélé sans animation.
  // =====================================================
  function guardReveals() {
    var hidden = document.querySelectorAll(
      '.reveal:not(.in), .fx-item:not(.in), .fx-mask:not(.in), ' +
      '.gallery-item:not(.in), .gal-item:not(.in), .hwd-gal-item:not(.in)'
    );
    if (!hidden.length) return;

    var h = window.innerHeight || 0;
    if (!h) return;

    for (var i = 0; i < hidden.length; i++) {
      var r = hidden[i].getBoundingClientRect();
      // Visible, ou déjà dépassé vers le haut.
      if (r.top < h && r.bottom > -h) hidden[i].classList.add('in');
    }
  }

  function initGuard() {
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') setTimeout(guardReveals, 350);
    });
    // Dernier recours : si rien n'a bougé au bout de 4 s, on montre.
    setTimeout(guardReveals, 4000);
  }

  // =====================================================
  // DÉMARRAGE
  // =====================================================
  function start() {
    initChrome();
    initLang();
    initNav();
    initCursor();
    initMarquees();
    initParallax();
    initHeadings();
    initReveal();
    initGalleryReveal();
    initGalleryDepth();
    initLightbox();
    initRowPreview();
    initEcho();
    initCounters();
    initProximity();
    initPhotosAlbum();
    initGuard();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  // Si l'utilisateur active « réduire les animations » en cours
  // de visite, on fige tout plutôt que de continuer.
  if (reduce.addEventListener) {
    reduce.addEventListener('change', function () {
      if (!reduce.matches) return;
      tasks.length = 0;
      var hidden = document.querySelectorAll('.reveal, .fx-item, .fx-mask, ' + PHOTO_SEL);
      for (var i = 0; i < hidden.length; i++) hidden[i].classList.add('in');
    });
  }
})();
