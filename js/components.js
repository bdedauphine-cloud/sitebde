// =====================================================
// COMPOSANTS HTML COMMUNS
// Ces fonctions transforment les fichiers /data/*.js en HTML.
// En principe, vous ne modifiez PAS ce fichier pour les mises à jour annuelles.
// Modifiez plutôt les fichiers dans /data/.
// =====================================================
(function(){
  function esc(v){return String(v ?? '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]));}
  function attrI18n(fr,en){let out=''; if(fr) out += ` data-fr="${esc(fr)}"`; if(en) out += ` data-en="${esc(en)}"`; return out;}
  function currentPage(){let p=(location.pathname.split('/').pop()||'index.html'); return p || 'index.html';}
  function activeSponsors(){return (window.BDE_SPONSORS||[]).filter(s=>s.active!==false).sort((a,b)=>(a.order||999)-(b.order||999));}
  function logoOrFallback(s, cls){return s.logo ? `<img src="${esc(s.logo)}" alt="${esc(s.alt||s.name)}">` : esc(s.fallback||s.name.slice(0,2).toUpperCase());}

  window.BDEComponents = {
    nav(){
      const site=window.BDE_SITE||{}; const page=currentPage();
      const links=(site.navigation||[]).map(item=>{
        let href=item.href;
        if(item.href==='#contact' && page!=='index.html') href=item.externalFromNonHome||'index.html#contact';
        const active=(href===page || (page==='index.html' && item.href==='#contact' && location.hash==='#contact')) ? ' style="color:var(--white);"' : '';
        return `<li><a href="${esc(href)}"${active}${attrI18n(item.label,item.labelEn)}>${esc(item.label)}</a></li>`;
      }).join('');
      return `<a class="nav-logo" href="index.html"><img src="${esc(site.logo)}" alt="${esc(site.siteName||'BDE Dauphine')}" /></a>
      <ul class="nav-links" id="navLinks">${links}<li><a href="#" class="nav-ticket" onclick="openModal(event)" data-fr="Billets" data-en="Tickets">Billets</a></li><li><button class="nav-lang" id="langToggle" onclick="toggleLang()">EN</button></li></ul>
      <button class="nav-burger" id="navBurger" onclick="toggleNav()" aria-label="Menu"><span></span><span></span><span></span></button>`;
    },
    footer(){
      const s=window.BDE_SITE||{};
      return `<div class="container"><div class="footer-grid">
        <div class="footer-logo"><img src="${esc(s.logo)}" alt="${esc(s.siteName)}" /><p class="body-md" style="max-width:280px;"${attrI18n(s.footerDescription,s.footerDescriptionEn)}>${esc(s.footerDescription)}</p></div>
        <div class="footer-col"><h4 data-fr="Navigation" data-en="Navigation">Navigation</h4><ul><li><a href="index.html" data-fr="Accueil" data-en="Home">Accueil</a></li><li><a href="evenements.html" data-fr="Événements" data-en="Events">Événements</a></li><li><a href="nuits.html" data-fr="Notre label" data-en="Our Label">Notre label</a></li></ul></div>
        <div class="footer-col"><h4>&nbsp;</h4><ul><li><a href="howwedau.html">How We Dau</a></li><li><a href="partenaires.html" data-fr="Partenaires" data-en="Partners">Partenaires</a></li><li><a href="about.html" data-fr="Notre histoire" data-en="Our Story">Notre histoire</a></li></ul></div>
        <div class="footer-col"><h4 data-fr="Contact &amp; Réseaux" data-en="Contact &amp; Socials">Contact &amp; Réseaux</h4><ul><li><a href="mailto:${esc(s.email)}">${esc(s.email)}</a></li><li><a href="tel:${esc(s.phoneHref)}">${esc(s.phone)}</a></li><li><a href="${esc(s.instagramUrl)}" target="_blank">${esc(s.instagramLabel)}</a></li><li><a href="${esc(s.nuitsInstagramUrl)}" target="_blank">${esc(s.nuitsInstagramLabel)}</a></li><li><a href="${esc(s.tiktokUrl)}" target="_blank">TikTok @bdedauphine</a></li></ul></div>
      </div><div class="footer-bottom"><span class="footer-copy">${esc((s.copyrightText||'').replace(String(s.year), String(s.year)))}</span><div class="footer-bottom-right"><a href="mentions-legales.html" class="footer-legal-link" data-fr="Mentions légales" data-en="Legal Notice">Mentions légales</a><div class="footer-socials"><a href="${esc(s.instagramUrl)}" target="_blank">Instagram</a><a href="${esc(s.tiktokUrl)}" target="_blank">TikTok</a><a href="${esc(s.facebookUrl)}" target="_blank">Facebook</a></div></div></div><div class="footer-credit-line"><a href="https://telaventis.fr" target="_blank" rel="noopener" class="footer-credit-link">Site by Telaventis</a></div></div>`;
    },
    ticketModal(){
      const site=window.BDE_SITE||{}, t=site.ticket||{};
      // Le modal Billets suit automatiquement le prochain événement daté
      // (même source que l'affiche) ; site.ticket sert de repli quand plus
      // aucun événement n'est à venir.
      const aff=window.BDE_AFFICHE, next=aff?aff.nextDatedEvent():null;
      const evName=next?next.title:t.eventName;
      const evSub=next?aff.subtitle(next,'fr'):t.eventSub;
      const evSubEn=next?aff.subtitle(next,'en'):t.eventSubEn;
      const evUrl=(next&&next.ticketUrl)||t.url||site.defaultTicketUrl;
      return `<div class="modal-box"><div class="modal-header"><div><div class="label-sm" style="margin-bottom:8px;" data-fr="Billetterie" data-en="Ticketing">Billetterie</div><img src="${esc(site.logo)}" alt="BDE" style="height:28px;filter:brightness(0) invert(1);" /></div><button class="modal-close" onclick="closeModal()">×</button></div><div class="modal-body"><div class="modal-event-name">${esc(evName)}</div><div class="modal-event-sub"${attrI18n(evSub,evSubEn)}>${esc(evSub)}</div><div class="modal-cta-row"><a href="${esc(evUrl)}" target="_blank" class="modal-shotgun-btn"><div class="modal-shotgun-left"><span class="modal-shotgun-name"${attrI18n(t.buttonLabel,t.buttonLabelEn)}>${esc(t.buttonLabel)}</span><span class="modal-shotgun-desc"${attrI18n(t.description,t.descriptionEn)}>${esc(t.description)}</span></div><span class="modal-arrow">→</span></a></div>${t.note?`<p class="modal-note"${attrI18n(t.note,t.noteEn)}>${esc(t.note)}</p>`:''}</div></div>`;
    },
    sponsorsMarquee(){
      const items=activeSponsors().map(s=>`<a href="${esc(s.url)}" target="_blank" class="sponsor-item"><div class="sponsor-logo-ph">${logoOrFallback(s)}</div><span class="sponsor-item-name">${esc(s.name)}</span></a>`).join('');
      return `<div class="sponsors-marquee"><div class="sponsors-track" id="sponsorsTrack">${items}</div></div>`;
    },
    partnersScroll(){
      return activeSponsors().map(s=>`<a href="${esc(s.url)}" target="_blank" class="partner-scroll-item"><div class="partner-logo-box">${logoOrFallback(s)}</div><div><div class="partner-scroll-name">${esc(s.name)}</div><div class="partner-scroll-type">${esc(s.category||s.type||'Partenaire')}</div></div></a>`).join('');
    },
    sponsorCards(){
      return activeSponsors().map(s=>`<a href="${esc(s.url)}" target="_blank" class="sponsor-card"><div class="sponsor-card-logo">${logoOrFallback(s)}</div><div class="sponsor-card-name">${esc(s.name)}</div><div class="sponsor-card-type" data-fr="${esc(s.type)}" data-en="${esc(s.typeEn||s.type)}">${esc(s.type)}</div><div class="sponsor-card-link">${esc(s.linkLabel||'Voir le site →')}</div></a>`).join('');
    }
  };
})();
