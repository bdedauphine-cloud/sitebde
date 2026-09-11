// =====================================================
// AFFICHE — COMPORTEMENT
// Ouvre l'affiche du prochain événement, une fois par visite.
// Le contenu est produit par js/render.js, les réglages viennent de
// csv/config.csv (lignes affiche_*) et csv/events.csv (colonnes AFFICHE *).
// En principe, vous ne modifiez PAS ce fichier pour les mises à jour du site.
// =====================================================
(function(){
  'use strict';

  var dialog = document.getElementById('afficheModal');
  if(!dialog || !dialog.querySelector('.affiche-sheet')) return;
  if(typeof dialog.showModal !== 'function') return; // navigateur trop ancien : on n'affiche rien

  var A = window.BDE_AFFICHE;
  if(!A) return;
  var cfg = A.config();
  var ev  = A.event();
  if(!cfg.active || !ev) return;

  // ── Sur quelles pages ────────────────────────────────────────
  var page = (location.pathname.split('/').pop() || 'index.html') || 'index.html';
  if(cfg.pages === 'home' && page !== 'index.html') return;

  // ── Mémoire : une fois par visite / par événement / jamais ───
  var key = 'bde_affiche_' + ev.slug;
  function store(){
    try { return cfg.frequency === 'evenement' ? window.localStorage : window.sessionStorage; }
    catch(e){ return null; }
  }
  function alreadySeen(){
    if(cfg.frequency === 'toujours') return false;
    var s = store();
    try { return !!s && s.getItem(key) === '1'; } catch(e){ return false; }
  }
  function markSeen(){
    if(cfg.frequency === 'toujours') return;
    var s = store();
    try { if(s) s.setItem(key, '1'); } catch(e){}
  }
  if(alreadySeen()) return;

  var reduce  = window.matchMedia('(prefers-reduced-motion: reduce)');
  var fine    = window.matchMedia('(pointer: fine)');
  var poster  = dialog.querySelector('[data-affiche-poster]');
  var sheet   = dialog.querySelector('.affiche-sheet');
  var sheen   = dialog.querySelector('.affiche-sheen');
  var closing = false;

  // ── Ouverture / fermeture ────────────────────────────────────
  function open(){
    markSeen();
    dialog.showModal();
    document.body.classList.add('affiche-open');
    if(reduce.matches){ dialog.classList.add('is-open'); startTilt(); return; }
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        dialog.classList.add('is-open');
        startTilt();
      });
    });
  }

  function finishClose(){
    closing = false;
    dialog.classList.remove('is-open', 'is-closing');
    dialog.close();
    document.body.classList.remove('affiche-open');
    if(sheet){ sheet.style.transform = ''; sheet.style.transition = ''; }
    dialog.style.removeProperty('--affiche-dim');
  }

  function close(){
    if(closing) return;
    closing = true;
    stopTilt();
    dialog.classList.remove('is-open');
    if(reduce.matches){ finishClose(); return; }
    dialog.classList.add('is-closing');
    setTimeout(finishClose, 260); // doit rester aligné sur --affiche-out dans style.css
  }

  // Escape : on intercepte l'annulation native pour jouer la sortie,
  // puis on ferme réellement le <dialog>.
  dialog.addEventListener('cancel', function(e){ e.preventDefault(); close(); });
  // Clic sur le fond : sur un <dialog>, la cible est le dialog lui-même.
  dialog.addEventListener('click', function(e){ if(e.target === dialog) close(); });
  Array.prototype.forEach.call(dialog.querySelectorAll('[data-affiche-close]'), function(btn){
    btn.addEventListener('click', close);
  });

  // ── Curseur et inclinaison (desktop uniquement) ──────────────
  // Le curseur personnalisé du site est peint sous le <dialog> : on en
  // redessine un ici. Il est suivi sans retard ; seule l'inclinaison est
  // amortie, pour donner du poids à l'affiche sans donner l'impression
  // qu'elle traîne derrière la souris.
  var cursor = dialog.querySelector('[data-affiche-cursor]');
  var raf = 0, tiltOn = false, tX = 0, tY = 0, cX = 0, cY = 0;

  function onPointerMove(e){
    // On ne masque le curseur natif qu'au premier mouvement : si le point
    // n'est jamais dessiné, l'utilisateur garde un curseur visible.
    if(!dialog.classList.contains('has-cursor')) dialog.classList.add('has-cursor');
    if(cursor) cursor.style.transform = 'translate3d(' + e.clientX + 'px,' + e.clientY + 'px,0)';
    tX = (e.clientX - window.innerWidth  / 2) / (window.innerWidth  / 2);
    tY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
  }
  function onPointerOver(e){
    var over = e.target && e.target.closest && e.target.closest('a, button');
    dialog.classList.toggle('is-hovering', !!over);
  }
  function frame(){
    cX += (tX - cX) * 0.14;
    cY += (tY - cY) * 0.14;
    poster.style.transform =
      'perspective(1400px) rotateY(' + (cX * 4.5).toFixed(2) + 'deg) rotateX(' + (-cY * 4.5).toFixed(2) + 'deg)';
    // Bande de lumière déplacée en transform : composée par le GPU, sans
    // repeindre le dégradé à chaque image.
    if(sheen) sheen.style.transform = 'translate3d(' + (cX * 16).toFixed(2) + '%,0,0)';
    raf = requestAnimationFrame(frame);
  }
  function startTilt(){
    if(!fine.matches) return;
    dialog.addEventListener('pointermove', onPointerMove);
    dialog.addEventListener('pointerover', onPointerOver);
    if(tiltOn || !poster || reduce.matches) return;
    tiltOn = true;
    dialog.classList.add('is-tilting');
    raf = requestAnimationFrame(frame);
  }
  function stopTilt(){
    dialog.removeEventListener('pointermove', onPointerMove);
    dialog.removeEventListener('pointerover', onPointerOver);
    dialog.classList.remove('has-cursor', 'is-hovering', 'is-tilting');
    if(!tiltOn) return;
    tiltOn = false;
    cancelAnimationFrame(raf);
    if(poster) poster.style.transform = '';
    if(sheen) sheen.style.transform = '';
  }

  // ── Glisser vers le bas pour fermer (tactile) ────────────────
  (function initSwipe(){
    if(!sheet || !window.matchMedia('(pointer: coarse)').matches) return;
    var startY = 0, dy = 0, dragging = false;
    sheet.addEventListener('pointerdown', function(e){
      if(e.target.closest('a, button')) return;
      dragging = true; startY = e.clientY; dy = 0;
      sheet.style.transition = 'none';
    });
    sheet.addEventListener('pointermove', function(e){
      if(!dragging) return;
      dy = Math.max(0, e.clientY - startY);
      sheet.style.transform = 'translateY(' + dy + 'px)';
      dialog.style.setProperty('--affiche-dim', Math.max(0, 1 - dy / 420).toFixed(3));
    });
    function end(){
      if(!dragging) return;
      dragging = false;
      sheet.style.transition = '';
      if(dy > 120){ close(); }
      else { sheet.style.transform = ''; dialog.style.removeProperty('--affiche-dim'); }
      dy = 0;
    }
    sheet.addEventListener('pointerup', end);
    sheet.addEventListener('pointercancel', end);
  })();

  // ── Déclenchement : on attend que l'affiche soit décodée pour
  //    ne jamais animer un cadre vide, avec un garde-fou de 2,5 s. ──
  function imageReady(){
    var img = dialog.querySelector('.affiche-poster img');
    if(!img) return Promise.resolve();
    if(img.decode) return img.decode().catch(function(){});
    return new Promise(function(res){
      if(img.complete) return res();
      img.onload = res; img.onerror = res;
    });
  }

  // Si l'onglet est en arrière-plan, on attend qu'il revienne au premier
  // plan : sinon l'affiche s'ouvrirait pendant que personne ne regarde et
  // l'animation d'entrée serait déjà passée au retour.
  function whenVisible(){
    if(!document.hidden) return Promise.resolve();
    return new Promise(function(res){
      document.addEventListener('visibilitychange', function once(){
        if(document.hidden) return;
        document.removeEventListener('visibilitychange', once);
        res();
      });
    });
  }

  setTimeout(function(){
    Promise.race([
      imageReady(),
      new Promise(function(res){ setTimeout(res, 2500); })  // garde-fou : image lente ou onglet gelé
    ]).then(whenVisible).then(open);
  }, cfg.delayMs);

})();
