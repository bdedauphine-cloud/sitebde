// =====================================================
// MOTEUR DE RENDU
// Il lit les attributs data-render dans les pages HTML et injecte les blocs.
// Ne pas modifier pour les mises à jour normales du site.
// =====================================================
(function(){
  function esc(v){return String(v ?? '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]));}
  function attrI18n(fr,en){let out=''; if(fr) out += ` data-fr="${esc(fr)}"`; if(en) out += ` data-en="${esc(en)}"`; return out;}
  function events(){return (window.BDE_EVENTS||[]).slice().sort((a,b)=>(a.order||999)-(b.order||999));}
  function transitionDelay(i){return i ? ` style="transition-delay:${(i*0.05).toFixed(2)}s"` : '';}
  function imgMarkup(src,alt){return `<img src="${esc(src)}" alt="${esc(alt||'')}" />`;}
  function i18nObj(v){
    if(v && typeof v === 'object') return { fr: v.fr || '', en: v.en || '' };
    return { fr: v || '', en: '' };
  }
  function formatEventDate(date,lang){
    if(!date) return '';
    const d = new Date(`${date}T00:00:00`);
    if(Number.isNaN(d.getTime())) return date;
    return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }).format(d);
  }
  function eventDateText(e,lang){
    const status=i18nObj(e.statusLabel);
    const label=i18nObj(e.dateLabel);
    const readableDate = label[lang] || (e.date ? formatEventDate(e.date,lang) : '');
    if(e.showStatusWithDate === true && status[lang] && readableDate) return `${status[lang]} · ${readableDate}`;
    if(status[lang]) return status[lang];
    if(label[lang]) return label[lang];
    if(e.date) return formatEventDate(e.date,lang);
    return lang === 'en' ? 'Coming soon' : 'À venir';
  }
  function isPastStatus(e){
    const status=i18nObj(e.statusLabel);
    return ['passé','past'].includes(String(status.fr || '').toLowerCase()) || ['passé','past'].includes(String(status.en || '').toLowerCase());
  }
  function eventDateMarkup(e,mode){
    const status=i18nObj(e.statusLabel);
    const label=i18nObj(e.dateLabel);
    const hasCustomDateOrStatus=Boolean(status.fr || status.en || label.fr || label.en || e.date);
    const classes=['event-date'];
    if(mode) classes.push(`event-date--${mode}`);
    if(!hasCustomDateOrStatus) classes.push('event-date--soon');
    if(isPastStatus(e)) classes.push('event-date--past');
    if(e.statusColor === 'red') classes.push('event-date--red');
    const subFr=hasCustomDateOrStatus?'':'Date bientôt annoncée';
    const subEn=hasCustomDateOrStatus?'':'Date to be announced';
    return `<div class="${classes.join(' ')}"><span class="event-date-main"${attrI18n(eventDateText(e,'fr'),eventDateText(e,'en'))}>${esc(eventDateText(e,'fr'))}</span>${hasCustomDateOrStatus?'':`<span class="event-date-sub"${attrI18n(subFr,subEn)}>${esc(subFr)}</span>`}</div>`;
  }
  function eventHomeRow(e,i){
    return `<a href="evenements.html#${esc(e.slug)}" class="event-row reveal"${transitionDelay(i)}><div class="event-row-num">${esc(e.number)}</div><div><div class="event-row-title-line"><div class="event-row-name">${esc(e.title)}</div>${eventDateMarkup(e,'mobile')}</div><div class="event-row-meta"${attrI18n(e.homeDescriptionI18n?.fr||e.shortDescription,e.homeDescriptionI18n?.en||'')}>${esc(e.shortDescription)}</div></div>${eventDateMarkup(e,'desktop')}<div class="event-row-meta"${attrI18n(e.homePeriodI18n?.fr||e.homePeriod,e.homePeriodI18n?.en||'')}>${esc(e.homePeriod)}</div><span class="event-row-arrow">→</span></a>`;
  }
  function eventDetailSection(e,i,total){
    const imgs=e.images||[];
    const subImgs=imgs.slice(1).map(src=>`<div class="event-gallery-sub-item">${imgMarkup(src,e.title)}</div>`).join('');
    const imgBlock=`<div class="reveal"><div class="event-img-main">${imgMarkup(e.image||imgs[0],e.alt||e.title)}</div>${subImgs?`<div class="event-gallery-sub">${subImgs}</div>`:''}</div>`;
    let tags='';
    if((e.tags||[]).length===1){const t=e.tags[0];tags=`<span class="tag${t.red?' tag-red':''}" style="margin-bottom:14px;display:inline-block;"${attrI18n(t.i18n?.fr||t.label,t.i18n?.en||'')}>${esc(t.label)}</span>`;}
    else if((e.tags||[]).length>1){tags=`<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;">${e.tags.map(t=>`<span class="tag${t.red?' tag-red':''}"${attrI18n(t.i18n?.fr||t.label,t.i18n?.en||'')}>${esc(t.label)}</span>`).join('')}</div>`;}
    const meta=(e.meta||[]).map(m=>`<div class="event-meta-item"><span class="event-meta-key"${attrI18n(m.keyI18n?.fr||m.key,m.keyI18n?.en||'')}>${esc(m.key)}</span><span class="event-meta-val"${attrI18n(m.valueI18n?.fr||m.value,m.valueI18n?.en||'')}>${esc(m.value)}</span></div>`).join('');
    const paras=(e.descriptionBlocks||[]).map(p=>`<p class="event-body"${attrI18n(p.i18n?.fr||p.text,p.i18n?.en||'')}>${esc(p.text)}</p>`).join('');
    const artistTags=(e.artists||[]).length?`<div class="artist-lineup">${e.artists.map(a=>`<span class="artist-tag${a.highlight?' highlight':''}">${esc(a.label)}</span>`).join('')}</div>`:'';
    const gallery=e.galleryPage?`<a href="${esc(e.galleryPage)}" class="event-gallery-link" data-fr="Galerie photos des éditions →" data-en="Photo gallery of past editions →">${esc(e.galleryLabel||'Galerie photos des éditions →')}</a>`:'';
    const dossierLabel=i18nObj(e.dossierLabel);
    const dossier=e.dossierUrl?`<a href="${esc(e.dossierUrl)}" class="event-dossier-link"${e.dossierDownload!==false?' download':''}${attrI18n(dossierLabel.fr||'Dossier à remplir',dossierLabel.en||'Form to complete')}>${esc(dossierLabel.fr||'Dossier à remplir')}</a>`:'';
    const content=`<div class="event-detail-content reveal" style="transition-delay:0.15s;"><div class="event-num">${esc(e.number)}</div>${tags}<h2 class="event-name-big">${esc(e.title)}</h2><div class="event-meta-list">${meta}</div>${paras}${artistTags}${gallery}${dossier}</div>`;
    return `<section id="${esc(e.slug)}" class="event-section"${i===total-1?' style="border-bottom:none;"':''}><div class="container"><div class="event-detail-grid${e.reverse?' reverse':''}">${imgBlock}${content}</div></div></section>`;
  }
  function artistCarousel(){
    const cards=((window.BDE_ARTISTS||{}).cards||[]).filter(a=>a.active!==false).sort((a,b)=>(a.order||999)-(b.order||999));
    return cards.map(a=>`<div class="artist-card${a.featured?' artist-card-featured':''}"><img src="${esc(a.image)}" alt="${esc(a.alt||a.name)}" /><div class="artist-card-overlay"></div><div class="artist-card-info"><div class="artist-card-year">${esc(a.yearEvent)}</div><div class="artist-card-name">${esc(a.name)}</div><div class="artist-card-event">${esc(a.eventText)}</div><div class="artist-card-badge">${esc(a.badge)}</div></div></div>`).join('');
  }
  function artistTextStrip(){
    return (((window.BDE_ARTISTS||{}).textStrip)||[]).map(n=>`<span class="artist-text-item">${esc(n)}</span><span class="artist-text-sep">·</span>`).join('');
  }
  function homeGalleryStrip(){
    const homeStripGallerySlugs=new Set(['begins','croisette','gala']);
    const homeStripExcludedImages=new Set([
      'uploads/begins-2025-extra-01.jpg',
      'uploads/gala-2026-3.jpg',
      'uploads/begins-2025-extra-02.jpg',
      'uploads/gala-2026-5.jpg',
      'uploads/begins-2025-extra-04.jpg'
    ]);
    const galleries=(window.BDE_GALLERIES||[])
      .filter(g=>g.active!==false&&homeStripGallerySlugs.has(g.slug))
      .map(g=>{
      const cover=g.coverImage?{src:g.coverImage,alt:g.title||''}:null;
      return [cover,...(g.images||[])].filter(Boolean).filter(im=>!homeStripExcludedImages.has(im.src));
    });
    const imgs=[];
    const maxLength=Math.max(0,...galleries.map(list=>list.length));
    for(let i=0;i<maxLength;i++){
      galleries.forEach(list=>{
        const im=list[i];
        if(im?.src&&!imgs.some(x=>x.src===im.src)) imgs.push(im);
      });
    }
    const fourthImage=imgs.find(im=>im.src==='uploads/gala-2026-338.jpg');
    const pinned=[...imgs.slice(0,3),fourthImage].filter(Boolean);
    const random=imgs.slice(3).filter(im=>im.src!==fourthImage?.src);
    for(let i=random.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [random[i],random[j]]=[random[j],random[i]];
    }
    return [...pinned,...random].slice(0,18).map(im=>`<div class="galerie-strip-item"><img src="${esc(im.src)}" alt="${esc(im.alt||'')}" /></div>`).join('');
  }
  function renderGallery(el){
    const slug=el.dataset.gallerySlug;
    const g=(window.BDE_GALLERIES||[]).find(x=>x.slug===slug);
    if(!g) return;
    el.innerHTML=(g.images||[]).map((im,i)=>{
      const hasCaption=Boolean(im.tag||im.caption);
      const caption=hasCaption?`<div class="gallery-item-caption"><div class="caption-tag gallery-caption-tag"${attrI18n(im.tagI18n?.fr||im.tag,im.tagI18n?.en||'')}>${esc(im.tag)}</div><p class="gallery-caption-text"${attrI18n(im.captionI18n?.fr||im.caption,im.captionI18n?.en||'')}>${esc(im.caption)}</p></div>`:'';
      if(g.lightboxMode==='lightbox'){
        return `<div class="gallery-item" onclick="openLightbox(${i})"><img src="${esc(im.src)}" alt="${esc(im.alt)}" loading="lazy" />${caption}</div>`;
      }
      return `<div class="gallery-item" data-src="${esc(im.src)}" data-caption="${esc(im.caption)}"><img src="${esc(im.src)}" alt="${esc(im.alt)}" loading="lazy" />${caption}</div>`;
    }).join('');
  }

  // ── AFFICHE ────────────────────────────────────────────────────
  // Détermine quel événement doit voir son affiche présentée, et construit
  // le contenu du <dialog>. La logique de fenêtre (J-14) vit ici parce
  // qu'elle croise BDE_EVENTS et BDE_SITE ; le comportement (ouverture,
  // animation, mémoire de session) vit dans js/affiche.js.
  function afficheConfig(){
    const c=(window.BDE_SITE||{}).affiche||{};
    return {
      active: c.active!==false,
      daysBefore: c.daysBefore||14,
      frequency: c.frequency||'session',
      pages: c.pages||'toutes',
      delayMs: typeof c.delayMs==='number'?c.delayMs:700
    };
  }
  function daysUntil(date){
    if(!date) return null;
    const d=new Date(`${date}T00:00:00`);
    if(Number.isNaN(d.getTime())) return null;
    const today=new Date(); today.setHours(0,0,0,0);
    return Math.round((d-today)/86400000);
  }
  // L'événement retenu : un « OUI » forcé d'abord, sinon le plus proche
  // dont la fenêtre d'affichage est ouverte. Sans image, pas d'affiche.
  function afficheEvent(){
    const cfg=afficheConfig();
    if(!cfg.active) return null;
    const eligible=(window.BDE_EVENTS||[]).filter(e=>{
      const a=e.affiche||{};
      if(!a.image) return false;
      const mode=String(a.mode||'AUTO').toUpperCase();
      if(mode==='NON') return false;
      if(mode==='OUI') return true;
      const d=daysUntil(e.date);
      return d!==null && d>=0 && d<=(a.daysBefore||cfg.daysBefore);
    });
    const forced=e=>String((e.affiche||{}).mode||'').toUpperCase()==='OUI'?0:1;
    eligible.sort((a,b)=>{
      if(forced(a)!==forced(b)) return forced(a)-forced(b);
      const da=daysUntil(a.date), db=daysUntil(b.date);
      if(da===null) return 1;
      if(db===null) return -1;
      return da-db;
    });
    return eligible[0]||null;
  }
  // Le prochain événement daté, quelle que soit la fenêtre — sert au modal
  // Billets pour qu'il ne devienne jamais obsolète.
  function nextDatedEvent(){
    return (window.BDE_EVENTS||[])
      .filter(e=>daysUntil(e.date)!==null && daysUntil(e.date)>=0)
      .sort((a,b)=>daysUntil(a.date)-daysUntil(b.date))[0]||null;
  }
  function afficheCountdown(e,lang){
    const d=daysUntil(e.date);
    if(d===null) return '';
    if(d===0) return lang==='en'?'Tonight':"C'est ce soir";
    if(d===1) return lang==='en'?'Tomorrow':'Demain';
    return lang==='en'?`In ${d} days`:`Dans ${d} jours`;
  }
  function afficheSubtitle(e,lang){
    const parts=[eventDateText(e,lang), e.venue||e.place].filter(Boolean);
    return parts.join(' · ');
  }
  // Même ligne, mais le lieu isolé dans son propre span pour être mis en
  // avant. Version HTML réservée à l'affiche : le modal Billets continue
  // d'utiliser afficheSubtitle(), qui reste du texte simple.
  function afficheSubtitleHtml(e,lang){
    const date=eventDateText(e,lang), venue=e.venue||e.place;
    const parts=[];
    if(date) parts.push(esc(date));
    if(venue) parts.push(`<span class="affiche-venue">${esc(venue)}</span>`);
    return parts.join(' · ');
  }
  // <picture> AVIF/WebP quand les variantes existent (make_affiche.py),
  // sinon simple <img>. Pas de fetchpriority : l'affiche ne doit pas
  // concurrencer l'image LCP du hero ; js/affiche.js la précharge et
  // attend son décodage avant d'ouvrir.
  function afficheImage(a,title){
    const alt=a.alt||title;
    // On n'annonce que les largeurs réellement présentes : make_affiche.py
    // ne génère pas une variante plus large que l'image d'origine, et une
    // entrée srcset qui pointe vers un fichier absent casse l'affichage.
    // RATIO porte les dimensions réelles de l'image (ex. 1179/1462) : elles
    // servent aussi à savoir quelles variantes make_affiche.py a pu créer,
    // puisqu'il n'en génère jamais de plus large que l'original. Sans cette
    // information, on sert l'image simple plutôt que d'annoncer des
    // fichiers qui n'existent peut-être pas.
    const intrinsic=parseInt(String(a.ratio||'').split('/')[0],10);
    const widths=intrinsic>320?[640,960,1536].filter(w=>w<=intrinsic):[];
    if(a.responsive && widths.length){
      const base=String(a.image).replace(/\.[a-z0-9]+$/i,'');
      const set=ext=>widths.map(w=>`${esc(base)}-${w}.${ext} ${w}w`).join(', ');
      const sizes='(min-width: 900px) 40vw, 84vw';
      return `<picture><source type="image/avif" srcset="${set('avif')}" sizes="${sizes}"><source type="image/webp" srcset="${set('webp')}" sizes="${sizes}"><img src="${esc(a.image)}" alt="${esc(alt)}" decoding="async" /></picture>`;
    }
    return `<img src="${esc(a.image)}" alt="${esc(alt)}" decoding="async" />`;
  }
  function afficheContent(){
    const e=afficheEvent();
    if(!e) return '';
    const a=e.affiche||{}, site=window.BDE_SITE||{}, t=site.ticket||{};
    const titleI=i18nObj(a.title), textI=i18nObj(a.text), ctaI=i18nObj(a.ctaLabel);
    const titleFr=titleI.fr||e.title, titleEn=titleI.en||e.title;
    const textFr=textI.fr?esc(textI.fr):afficheSubtitleHtml(e,'fr');
    const textEn=textI.en?esc(textI.en):afficheSubtitleHtml(e,'en');
    const ctaFr=ctaI.fr||t.buttonLabel||'Réserver sur Shotgun';
    const ctaEn=ctaI.en||t.buttonLabelEn||'Book on Shotgun';
    const url=a.ctaUrl||e.ticketUrl||t.url||site.defaultTicketUrl||'#';
    const cdFr=afficheCountdown(e,'fr'), cdEn=afficheCountdown(e,'en');
    const ratio=a.ratio||'2/3';
    return `<div class="affiche-veil" aria-hidden="true"></div><span class="affiche-cursor" data-affiche-cursor aria-hidden="true"></span><div class="affiche-sheet" role="document">
      <button type="button" class="affiche-close" data-affiche-close aria-label="Fermer">×</button>
      <div class="affiche-grid">
        <div class="affiche-poster-wrap"><div class="affiche-poster" style="aspect-ratio:${esc(ratio)}" data-affiche-poster>${afficheImage(a,e.title)}<span class="affiche-sheen" aria-hidden="true"></span></div></div>
        <div class="affiche-panel">
          <div class="affiche-overline" data-fr="Prochain événement" data-en="Next event">Prochain événement</div>
          <h2 class="affiche-title" id="afficheTitle"${attrI18n(titleFr,titleEn)}>${esc(titleFr)}</h2>
          <div class="affiche-text"${attrI18n(textFr,textEn)}>${textFr}</div>
          ${cdFr?`<div class="affiche-countdown"${attrI18n(cdFr,cdEn)}>${esc(cdFr)}</div>`:''}
          <a class="affiche-cta" href="${esc(url)}" target="_blank" rel="noopener"><span${attrI18n(ctaFr,ctaEn)}>${esc(ctaFr)}</span><span class="affiche-cta-arrow" aria-hidden="true">→</span></a>
          <button type="button" class="affiche-dismiss" data-affiche-close data-fr="Continuer vers le site" data-en="Continue to the site">Continuer vers le site</button>
        </div>
      </div>
    </div>`;
  }
  window.BDE_AFFICHE={config:afficheConfig, event:afficheEvent, nextDatedEvent, daysUntil, subtitle:afficheSubtitle};
  window.BDE_RENDER_ALL=function(){
    document.querySelectorAll('[data-render="nav"]').forEach(el=>{el.innerHTML=window.BDEComponents.nav();});
    document.querySelectorAll('[data-render="footer"]').forEach(el=>{el.innerHTML=window.BDEComponents.footer();});
    document.querySelectorAll('[data-render="ticket-modal"]').forEach(el=>{el.innerHTML=window.BDEComponents.ticketModal();});
    document.querySelectorAll('[data-render="sponsors-marquee"]').forEach(el=>{el.outerHTML=window.BDEComponents.sponsorsMarquee();});
    document.querySelectorAll('[data-render="partners-scroll"]').forEach(el=>{el.innerHTML=window.BDEComponents.partnersScroll();});
    document.querySelectorAll('[data-render="sponsor-cards"]').forEach(el=>{el.innerHTML=window.BDEComponents.sponsorCards();});
    document.querySelectorAll('[data-render="home-events"]').forEach(el=>{el.innerHTML=events().filter(e=>e.showOnHome!==false).map(eventHomeRow).join('');});
    document.querySelectorAll('[data-render="events-page"]').forEach(el=>{const list=events().filter(e=>e.showOnEventsPage!==false); el.outerHTML=list.map(eventDetailSection).join('');});
    document.querySelectorAll('[data-render="artists-carousel"]').forEach(el=>{el.innerHTML=artistCarousel();});
    document.querySelectorAll('[data-render="artists-text-strip"]').forEach(el=>{el.innerHTML=artistTextStrip();});
    document.querySelectorAll('[data-render="home-gallery-strip"]').forEach(el=>{el.innerHTML=homeGalleryStrip();});
    document.querySelectorAll('[data-render="gallery-masonry"]').forEach(renderGallery);
    document.querySelectorAll('[data-render="affiche"]').forEach(el=>{el.innerHTML=afficheContent();});
  };
})();
