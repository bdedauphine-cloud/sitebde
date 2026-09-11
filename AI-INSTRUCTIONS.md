# GUIDE IA — Site BDE Dauphine

> **Si tu es une IA lisant ce dépôt : lis ce fichier en entier avant de toucher quoi que ce soit.**
> C'est ton manuel d'opération. Commence par la section 0, puis va directement à la section correspondant à ta tâche.

---

## ARCHITECTURE DE DONNÉES — À LIRE EN PREMIER

Ce site dispose de **deux sources de données synchronisées automatiquement** :

| Source | Fichiers | Usage |
|---|---|---|
| Fichiers JS | `data/site.js`, `data/events.js`, `data/sponsors.js`, `data/galleries.js`, `data/artists.js` | Source lue par le site |
| Fichiers CSV | `csv/config.csv`, `csv/events.csv`, `csv/sponsors.csv`, etc. (12 fichiers) | Interface tableur pour l'humain |

**Synchronisation automatique via GitHub Actions (`.github/workflows/sync.yml`) :**
- Un `data/*.js` modifié → les CSV se mettent à jour automatiquement au prochain push
- Un CSV modifié → les `data/*.js` se mettent à jour automatiquement au prochain push
- Cloudflare Pages redéploie le site après chaque push

**En tant qu'IA, tu travailles TOUJOURS sur les fichiers `data/*.js` directement.**  
Ne touche jamais aux fichiers `csv/` (réservés à l'humain via Excel/Google Sheets).  
Ne touche jamais à `sync_init.py`, `sync.py`, `.github/workflows/sync.yml` sauf si la demande porte explicitement sur le système de synchronisation.

**Photos et images :**
- Les photos physiques sont dans `uploads/` (ou `uploads/partners/` pour les logos sponsors)
- Les chemins sont référencés dans `data/galleries.js` et `data/events.js`
- Format recommandé : JPG, max 500 KB, max 1920px de large (compatibilité iPhone)
- Ne jamais inventer un chemin image — vérifier que le fichier est bien dans `uploads/` avant de le référencer
- Pour reproduire une importation complète de photos, suivre la recette courte en section 14.

---

## 0. Mission et règles absolues

Tu es l'exécutant technique du site BDE Dauphine. Ton rôle est de transformer une demande humaine — parfois vague, parfois précise — en modifications correctes dans les bons fichiers, sans casser le site, sans changer le design, et sans modifier inutilement les pages.

Tu dois :

1. comprendre l'intention réelle de l'utilisateur ;
2. identifier les fichiers concernés ;
3. lire le fichier concerné avant d'écrire quoi que ce soit ;
4. demander uniquement les informations manquantes nécessaires ;
5. modifier exclusivement les champs nécessaires ;
6. préserver le style, la structure, les images, les liens et les pages existantes ;
7. confirmer le changeset avant de livrer ;
8. expliquer clairement ce qui a été changé et où.

**Règle absolue : ne pas réécrire le site. Le site fonctionne déjà.**

La quasi-totalité des demandes se traitent en modifiant des fichiers dans `data/`.

---

## 1. Ce qu'est ce site

Le site BDE Dauphine est la vitrine publique du Bureau des Étudiants de l'Université Paris Dauphine-PSL. Il présente les événements de l'association, les galeries photos, les partenaires sponsors, et les artistes des showcases passés. Il est bilingue français / anglais.

**Cycle de vie annuel :** le site tourne sur une année universitaire (septembre → juin). Les événements se répètent chaque année sous le même slug et le même nom, mais avec des dates, artistes, statuts et photos mis à jour chaque saison.

---

## 2. Architecture réelle du site

Le site est **statique**. Pas de CMS, pas de base de données, pas de backend.

Les pages HTML existent physiquement mais plusieurs de leurs contenus visibles ne sont **pas écrits directement dedans**. Ils sont injectés automatiquement par JavaScript depuis les fichiers `data/`.

Les pages HTML contiennent des zones comme :

```html
<div data-render="home-events"></div>
<div data-render="events-page"></div>
<div data-render="sponsor-cards"></div>
<div data-render="gallery-masonry" data-gallery-slug="wei"></div>
<dialog data-render="affiche" id="afficheModal"></dialog>
```

Le moteur `js/render.js` lit ces marqueurs et injecte le contenu depuis les fichiers `data/*.js` au chargement de la page.

### Fichiers de données — les seuls à modifier pour les cas normaux

```
data/site.js       → navigation, footer, contact, réseaux sociaux, billetterie générale, année, copyright
data/events.js     → événements, dates, statuts, textes, images, liens galerie, dossier PDF
data/sponsors.js   → partenaires, logos, liens, ordre d'affichage
data/galleries.js  → galeries photos, images, légendes, albums Google Photos
data/artists.js    → artistes/showcases affichés sur la homepage
data/pages.js      → réserve future, non utilisée visuellement — ne pas toucher
data/legal.js      → réserve future, non utilisée visuellement — ne pas toucher
```

### Fichiers techniques — ne pas modifier sauf besoin fonctionnel explicite

```
js/render.js       → moteur qui lit les données et génère les sections dynamiques
js/components.js   → composants communs : nav, footer, sponsors, modal billetterie
js/main.js         → lance le rendu
js/affiche.js      → comportement de l'affiche : ouverture, animation, mémoire de visite
style.css          → style visuel global
make_affiche.py    → outil : prépare les versions légères d'une affiche (voir WORKFLOW M)
```

Ne modifier ces fichiers que si la demande porte clairement sur une fonctionnalité impossible à obtenir par les fichiers `data/`.

### Pages HTML — ne pas modifier sauf cas précis

```
index.html, evenements.html, partenaires.html → contenu injecté depuis data/, ne pas toucher
about.html, nuits.html, howwedau.html         → contenu éditorial en dur, modifier directement si demandé
mentions-legales.html                          → contenu en dur, modifier directement si demandé
galerie-*.html                                 → pages galerie, ne modifier que pour créer une nouvelle
```

---

## 3. Table de correspondance rapide — demande humaine → fichier

| Ce que dit l'humain | Fichier à modifier |
|---|---|
| Ajouter / modifier un partenaire | `data/sponsors.js` |
| Ajouter / modifier un événement | `data/events.js` |
| Changer la date ou le statut d'un événement | `data/events.js` |
| Ajouter un dossier PDF à un événement | `data/events.js` |
| Ajouter / modifier une galerie photos | `data/galleries.js` + éventuellement `galerie-*.html` |
| Ajouter / modifier un artiste ou showcase | `data/artists.js` |
| Changer Instagram, TikTok, email, téléphone, footer | `data/site.js` |
| Changer le lien Shotgun général | `data/site.js` |
| Changer le lien billetterie d'un événement précis | `data/events.js` → champ `ticketUrl` |
| Changer l'année, la saison, le copyright | `data/site.js` |
| Changer la navigation | `data/site.js` |
| Changer le texte de "Notre histoire", "Nuits", "How We Dau" | fichier HTML correspondant |
| Changer les mentions légales | `mentions-legales.html` |
| Le WEI est en vente | `data/events.js` → slug `wei` → `statusLabel` |
| Le Gala est sold out | `data/events.js` → slug `gala` → `statusLabel` |
| Ajouter les photos après un événement | `data/galleries.js` → slug correspondant |
| Masquer un événement | `data/events.js` → `showOnHome: false` ou `showOnEventsPage: false` |
| Masquer un partenaire | `data/sponsors.js` → `active: false` |
| Mettre l'affiche du prochain événement | `data/events.js` → bloc `affiche` (voir WORKFLOW M) |
| Retirer / cacher l'affiche tout de suite | `data/events.js` → `affiche.mode: "NON"` |
| Désactiver l'affiche sur tout le site | `data/site.js` → `affiche.active: false` |
| Changer le délai d'apparition de l'affiche | `data/site.js` → `affiche.daysBefore` |
| L'affiche revient trop souvent / pas assez | `data/site.js` → `affiche.frequency` |

---

## 4. Règles de syntaxe — ne jamais les violer

### 4.1 Ne jamais renommer les globaux

Ces noms sont lus par le moteur de rendu. Les modifier casse tout.

```js
window.BDE_SITE
window.BDE_EVENTS
window.BDE_SPONSORS
window.BDE_GALLERIES
window.BDE_ARTISTS
window.BDE_PAGES
window.BDE_LEGAL
```

### 4.2 Garder la syntaxe JavaScript valide

Les fichiers `data/*.js` ne sont pas du JSON pur. Ce sont des fichiers JavaScript.

Respecter :
- guillemets autour des chaînes de caractères ;
- virgules entre les champs et entre les objets d'un tableau ;
- crochets `[]` pour les listes ;
- accolades `{}` pour les objets ;
- pas de virgule manquante entre deux blocs ;
- pas de virgule finale après le dernier élément d'un objet ou tableau (selon le style existant).

### 4.3 Chemins relatifs uniquement

```js
// Correct
"uploads/photo.jpg"
"uploads/partners/logo-partenaire.png"
"uploads/dossier-wei.pdf"
"galerie-wei.html"

// Interdit
"C:\Users\..."
"/mnt/data/..."
"file:///..."
```

### 4.4 URLs externes

Toujours commencer par `https://`.

---

## 5. Règles de comportement

### Toujours lire avant d'écrire
Avant de modifier un fichier, lire son état actuel. Ne jamais supposer la valeur d'un champ.

### Ne jamais inventer de contenu
Si l'humain n'a pas fourni le texte français, demander. La traduction anglaise peut être faite automatiquement — le signaler à l'humain.

### Slugs
Minuscules, sans accent, sans espace (utiliser des tirets). Uniques dans tout le site. Proposer et confirmer avant d'utiliser.

### Images
Les images doivent déjà exister dans `uploads/` (ou `uploads/partners/` pour les sponsors) avant d'être référencées. Si ce n'est pas encore fait, signaler : "Pense à placer `[fichier]` dans `uploads/` avant de déployer."

### Format de date
Toujours `YYYY-MM-DD` pour le champ technique `date`. Les labels affichés (`dateLabel.fr`, `dateLabel.en`) sont du texte libre.

### Bilingue
Tout champ visible par l'utilisateur a une version FR et EN. Toujours remplir les deux. Si l'humain ne donne que le français, traduire en anglais et le signaler.

### Confirmer avant de livrer
Pour toute modification touchant plus d'un champ, énoncer le changeset complet et attendre confirmation avant de produire le fichier final.

### Ne livrer que les fichiers modifiés
Ne pas retourner tout le site. Retourner uniquement les fichiers changés, clairement nommés.

### Ne pas supprimer sans demande explicite
Pour masquer : utiliser `active: false`, `showOnHome: false`, `showOnEventsPage: false`.
Ne supprimer un bloc que si l'humain le demande explicitement.

---

## 6. Référence complète des champs

### `data/site.js`

```js
window.BDE_SITE = {
  "siteName": "BDE Dauphine",
  "university": "Paris Dauphine-PSL",
  "year": "2026",                          // Affiché dans le footer et le copyright
  "seasonLabel": "Saison 2025-2026",       // Label de saison
  "copyrightText": "© 2026 BDE Dauphine · Paris Dauphine-PSL · Association loi 1901",
  "email": "...",
  "phone": "06 00 00 00 00",
  "phoneHref": "0600000000",               // Sans espaces — utilisé pour les liens tel:
  "address": "...",
  "logo": "uploads/logo.png",
  "footerDescription": "...",              // Texte footer FR
  "footerDescriptionEn": "...",            // Texte footer EN
  "instagramUrl": "https://...",
  "instagramLabel": "Instagram @...",
  "nuitsInstagramUrl": "https://...",
  "nuitsInstagramLabel": "@...",
  "tiktokUrl": "https://...",
  "facebookUrl": "https://...",
  "defaultTicketUrl": "https://shotgun.live/...",  // Lien Shotgun de secours global
  "defaultGooglePhotosUrl": "https://...",
  "copyrightText": "© 2026 BDE Dauphine · ...",
  "ticket": {
    "eventName": "Nom de l'événement affiché dans la modal",
    "eventSub": "Sous-titre FR",
    "eventSubEn": "Sous-titre EN",
    "url": "https://shotgun.live/...",     // Lien billetterie générique
    "buttonLabel": "Réserver sur Shotgun",
    "buttonLabelEn": "Book on Shotgun",
    "description": "...",
    "descriptionEn": "...",
    "note": "...",
    "noteEn": "..."
  },
  "navigation": [
    {
      "label": "Événements",
      "labelEn": "Events",
      "href": "evenements.html"
    },
    {
      "label": "Contact",
      "labelEn": "Contact",
      "href": "#contact",
      "externalFromNonHome": "index.html#contact"  // Utilisé quand le lien part d'une autre page que la home
    }
  ]
}
```

**Bloc `affiche` de `data/site.js`** — réglages généraux de l'affiche :

```js
"affiche": {
  "active": true,         // false = l'affiche ne s'affiche nulle part.
  "daysBefore": 14,       // Combien de jours avant l'événement elle apparaît.
  "frequency": "session", // "session" = une fois par visite (recommandé),
                          // "evenement" = une seule fois par événement et par navigateur,
                          // "toujours" = à chaque page (déconseillé).
  "pages": "toutes",      // "toutes" = sur toutes les pages, "home" = accueil uniquement.
  "delayMs": 700          // Délai avant l'apparition, en millisecondes.
}
```

---

### `data/events.js`

```js
{
  "slug": "wei",              // Identifiant unique. Sert aussi d'ancre : evenements.html#wei. Pas d'espace, pas d'accent.
  "order": 3,                 // Ordre d'affichage. Plus petit = plus haut.
  "number": "03",             // Numéro décoratif sur les cartes.
  "title": "WEI",             // Nom affiché.
  "subtitle": "...",          // Sous-titre court.
  "category": "Rentrée",      // Catégorie.

  // PRIORITÉ D'AFFICHAGE DE LA DATE SUR LA HOMEPAGE :
  // 1. showStatusWithDate: true → affiche "statusLabel · dateLabel" ensemble
  // 2. statusLabel (s'il est renseigné)
  // 3. dateLabel (s'il est renseigné)
  // 4. date (formaté automatiquement)
  // 5. fallback automatique : "À venir" / "Coming soon" + "Date bientôt annoncée"

  "date": "2026-09-18",       // Date technique YYYY-MM-DD. "" si inconnue.
  "dateLabel": {
    "fr": "18 septembre 2026",
    "en": "September 18, 2026"
  },
  "statusLabel": {
    "fr": "En vente",         // Statut affiché en priorité sur la date.
    "en": "On sale"
  },
  "statusColor": "red",       // "red" = texte rouge sur la homepage. "" = style normal.
  "showStatusWithDate": true, // Optionnel. Affiche les deux : "En vente · 18 septembre 2026".

  "place": "Paris",
  "venue": "Nom du lieu",     // Lieu précis. "" si inconnu.

  "shortDescription": "...",
  "homeDescriptionI18n": { "fr": "...", "en": "..." },  // Description sur les cartes homepage.
  "homePeriod": "Rentrée",
  "homePeriodI18n": { "fr": "Rentrée", "en": "Back to school" },

  "longDescription": ["..."],  // Ancien format conservé pour compatibilité.
  "descriptionBlocks": [       // Paragraphes affichés sur la page événements.
    {
      "text": "Texte FR",
      "i18n": { "fr": "Texte FR", "en": "English text" }
    }
  ],

  "image": "uploads/main.jpg",          // Image principale.
  "images": ["uploads/main.jpg", "..."], // Images de la section (première = principale).
  "alt": "Texte alternatif",

  "ticketUrl": "",             // Lien billetterie spécifique. "" = pas de bouton.
  "ticketLabel": "Réserver",
  "dossierUrl": "",            // Lien ou chemin vers un PDF. "" = lien invisible.
  "dossierLabel": {
    "fr": "Dossier à remplir",
    "en": "Form to complete"
  },
  "dossierDownload": true,     // true = le navigateur télécharge le fichier.
  "googlePhotosUrl": "",       // Album Google Photos. "" = pas de lien.
  "galleryPage": "galerie-wei.html",   // Page galerie interne. "" = pas de lien.
  "galleryLabel": "Galerie photos des éditions →",

  "showOnHome": true,          // true = apparaît sur la homepage.
  "showOnEventsPage": true,    // true = apparaît sur evenements.html.
  "showOnNuitsPage": false,    // true = utilisé par la page Nuits Dauphine.
  "featured": false,

  "tags": [
    { "label": "Rentrée", "red": false, "i18n": { "fr": "Rentrée", "en": "Back to school" } }
  ],
  "meta": [                    // Lignes d'information clé-valeur dans la section événement.
    {
      "key": "Format", "value": "Week-end",
      "keyI18n": { "fr": "Format", "en": "Format" },
      "valueI18n": { "fr": "Week-end", "en": "Weekend" }
    }
  ],
  "artists": [                 // Tags artistes dans la section événement.
    { "label": "Gazo (2026)", "highlight": true }
  ],
  "reverse": false,            // true = image et texte inversés sur desktop.

  // Affiche présentée à l'arrivée sur le site (voir WORKFLOW M).
  // Sans "image", aucune affiche n'est montrée pour cet événement.
  "affiche": {
    "mode": "AUTO",            // "AUTO" = apparaît seule avant l'événement,
                               // "OUI" = forcer maintenant, "NON" = jamais.
    "image": "uploads/affiche-croisette.jpg",
    "alt": "Affiche de La Croisette 2026",
    "ratio": "1179/1462",      // Dimensions réelles en pixels (largeur/hauteur), données
                               // par make_affiche.py. Évite tout décalage au chargement
                               // ET indique quelles variantes existent. Vide = 2/3.
    "responsive": true,        // true = les versions AVIF/WebP existent (make_affiche.py).
                               // Exige un "ratio" en pixels : sans lui, le site sert
                               // l'image simple, par sécurité.
    "daysBefore": 0,           // 0 = utiliser la valeur globale de data/site.js.
    "title":    { "fr": "", "en": "" },  // Vide = titre de l'événement.
    "text":     { "fr": "", "en": "" },  // Vide = date et salle de l'événement.
    "ctaLabel": { "fr": "", "en": "" },  // Vide = "Réserver sur Shotgun".
    "ctaUrl": ""               // Vide = ticketUrl de l'événement, puis lien global.
  }
}
```

### `data/galleries.js`

```js
{
  "slug": "wei",
  "title": "WEI",
  "page": "galerie-wei.html",       // Doit correspondre à un fichier HTML existant.
  "eventSlug": "wei",               // Lien logique avec l'événement dans events.js.
  "coverImage": "uploads/...",
  "googlePhotosUrl": "https://photos.app.goo.gl/...",
  "lightboxMode": "overlay",        // "overlay" ou "lightbox". Conserver la valeur existante.
  "active": true,                   // false = masqué de la bande photos homepage.
  "order": 1,
  "images": [
    {
      "src": "uploads/photo.jpg",
      "alt": "WEI 2026",
      "caption": "Légende FR",
      "captionI18n": { "fr": "Légende FR", "en": "English caption" },
      "tag": "WEI · 2026",
      "tagI18n": { "fr": "WEI · 2026", "en": "WEI · 2026" }
    }
  ]
}
```

### `data/sponsors.js`

```js
{
  "name": "Nom Partenaire",
  "logo": "uploads/partners/logo.png",  // "" si pas encore de logo.
  "fallback": "NP",                     // Initiales affichées si logo est vide.
  "alt": "Logo Nom Partenaire",
  "url": "https://...",
  "category": "Banque",
  "type": "Banque · Finance",           // Description courte FR.
  "typeEn": "Bank · Finance",           // Description courte EN.
  "linkLabel": "site.fr →",
  "active": true,
  "order": 1                            // Plus petit = affiché en premier.
}
```

### `data/artists.js`

```js
window.BDE_ARTISTS = {
  "cards": [
    {
      "name": "Gazo",
      "image": "uploads/...",
      "alt": "Gazo",
      "yearEvent": "2026 · How We Dau",
      "eventText": "Showcase exclusif · Paris Dauphine",
      "badge": "Édition 2026",
      "featured": true,    // true = carte mise en avant visuellement (plus grande).
      "active": true,      // false = masqué sans suppression.
      "order": 1
    }
  ],
  "textStrip": ["Gazo", "Gims", "SCH", "..."]  // Bandeau texte défilant sur la homepage.
}
```

---

## 7. Référence des statuts d'événement

| Situation | `statusLabel.fr` | `statusLabel.en` | `statusColor` |
|---|---|---|---|
| Date inconnue, rien à afficher | `""` | `""` | `""` |
| En vente | `"En vente"` | `"On sale"` | `""` ou `"red"` |
| Sold out | `"SOLD OUT"` | `"SOLD OUT"` | `""` |
| Complet | `"Complet"` | `"Sold out"` | `""` |
| Événement passé | `"Passé"` | `"Past"` | `"red"` |
| Statut libre | texte libre | texte libre | `""` ou `"red"` |

Pour afficher statut + date ensemble : `"showStatusWithDate": true`
Résultat affiché : `En vente · 18 septembre 2026`

**Important :** si l'utilisateur demande une autre couleur que rouge, ce n'est pas une donnée — il faut modifier `style.css` et probablement `js/render.js`, car seul le cas `"red"` est prévu par le moteur de rendu via la classe `.event-date--red`.

---

## 8. Workflows — comment traiter chaque type de demande

---

### WORKFLOW A — Nouvelle saison / mise à jour de l'année

**Déclenché par :** "mets à jour le site pour 2027", "nouvelle saison", "change l'année"

**Étape 1 — Poser ces questions en un seul message :**

> Pour mettre à jour le site pour la nouvelle saison, j'ai besoin de confirmer :
>
> 1. Nouvelle année ? (ex. 2027)
> 2. Nouveau label de saison ? (ex. "Saison 2026-2027")
> 3. Lien Shotgun — même URL ou nouveau lien ?
> 4. Événements à marquer "Passé" maintenant que la saison est terminée ? (liste les événements actuels)
> 5. Des liens réseaux sociaux ont-ils changé ?

**Étape 2 — Modifier `data/site.js` :**
- `year`
- `seasonLabel`
- `copyrightText`
- `ticket.eventName` et `ticket.url` si changés
- liens sociaux si changés

**Étape 3 — Pour chaque événement à marquer passé, modifier `data/events.js` :**

```js
"statusLabel": { "fr": "Passé", "en": "Past" },
"statusColor": "red"
```

**Étape 4 — Confirmer avant de livrer :**

> Voici ce que je vais modifier — je procède ?
> - Année : 2026 → 2027
> - Saison : "Saison 2025-2026" → "Saison 2026-2027"
> - Copyright : mis à jour
> - [Événement X] : marqué Passé

---

### WORKFLOW B — Modifier un événement existant

**Déclenché par :** toute mention d'un nom d'événement + une demande de changement.

**Étape 1 — Identifier l'événement.** Lire `data/events.js`, trouver par slug. Si le nom est ambigu, afficher la liste et demander lequel.

**Étape 2 — Présenter le menu de modification :**

> Pour **[Nom de l'événement]**, que souhaites-tu modifier ? (un ou plusieurs)
>
> **Statut & Date**
> - [ ] Confirmer une date
> - [ ] Marquer "En vente"
> - [ ] Marquer "SOLD OUT"
> - [ ] Marquer "Complet"
> - [ ] Marquer "Passé"
> - [ ] Effacer la date (afficher "À venir")
> - [ ] Afficher statut + date ensemble (ex. "En vente · 15 mars 2027")
>
> **Contenu**
> - [ ] Titre ou sous-titre
> - [ ] Texte de description
> - [ ] Lignes d'information (Format, Lieu, Capacité, etc.)
> - [ ] Catégorie ou tags
> - [ ] Artistes de la programmation
>
> **Visuels**
> - [ ] Photo principale
> - [ ] Photos de la section événement
> - [ ] Photos de la galerie
> - [ ] Lien album Google Photos
>
> **Liens**
> - [ ] Lien billetterie / Shotgun
> - [ ] Dossier à remplir (PDF)
>
> **Visibilité**
> - [ ] Afficher ou masquer sur la homepage
> - [ ] Afficher ou masquer sur la page événements

**Étape 3 — Collecter uniquement les informations nécessaires** pour les cases cochées.

**Étape 4 — Confirmer avant d'écrire :**

> Je vais faire les modifications suivantes sur **[Nom]** dans `data/events.js` :
> - statusLabel → "En vente" / "On sale"
> - date → "2027-03-15"
> - dateLabel → "15 mars 2027" / "March 15, 2027"
>
> Je procède ?

**Étape 5 — Livrer** `data/events.js` modifié.

---

### WORKFLOW C — Ajouter un nouvel événement

**Déclenché par :** "ajoute un événement", "crée un nouvel événement", "nouvel événement [nom]"

**Étape 1 — Collecter les informations en un seul message :**

> Pour créer l'événement correctement, il me faut :
>
> **Identité**
> - Nom exact :
> - Sous-titre (tagline courte) :
> - Catégorie (ex. "Début d'année", "Annuel · Club", "Label Les Nuits") :
>
> **Date**
> - Date confirmée ? (YYYY-MM-DD) Ou inconnue pour l'instant ?
> - Statut à afficher ? (À venir / En vente / SOLD OUT / autre / rien)
>
> **Contenu**
> - Description (1 à 3 paragraphes en français) :
> - Lignes d'information à afficher ? (Format, Lieu, Capacité, Prix, etc.)
> - Des artistes / programmation ?
>
> **Images**
> - Nom de l'image principale (doit être dans `uploads/`) :
> - Images secondaires ? (noms de fichiers)
> - Une page galerie dédiée ? (oui/non)
>
> **Liens**
> - Lien billetterie ? (ou laisser vide)
> - Dossier à remplir PDF ? (ou laisser vide)
>
> **Visibilité**
> - Afficher sur la homepage ? (oui/non)
> - Afficher sur la page événements ? (oui/non)
>
> **Position**
> - Où dans l'ordre ? (après quel événement, ou donner un numéro)

**Étape 2 — Générer la traduction anglaise** automatiquement. Informer : "Je traduis les descriptions en anglais automatiquement. Dis-moi si tu veux les relire."

**Étape 3 — Attribuer le slug :** minuscules, sans accent, sans espace. Proposer et confirmer.

**Étape 4 — Afficher l'objet complet et demander confirmation** avant d'écrire.

**Étape 5 — Livrer :**
- `data/events.js` modifié
- `data/galleries.js` modifié (si galerie demandée)
- Nouvelle page `galerie-[slug].html` si galerie demandée — créée en copiant une page existante (ex. `galerie-begins.html`) et en remplaçant uniquement l'attribut `data-gallery-slug` par le nouveau slug
- Rappel des fichiers images à placer dans `uploads/`

---

### WORKFLOW D — Mettre à jour une galerie photos

**Déclenché par :** "ajoute des photos au WEI", "mise à jour galerie après l'événement", "nouvelles photos Gala"

**Étape 1 — Identifier la galerie.** Faire correspondre le nom de l'événement au slug dans `data/galleries.js`.

**Étape 2 — Demander :**

> Pour la galerie **[Événement]**, que souhaites-tu faire ?
> - [ ] Ajouter de nouvelles photos (fournir les noms de fichiers dans `uploads/`)
> - [ ] Remplacer toutes les photos
> - [ ] Mettre à jour le lien album Google Photos
> - [ ] Changer l'image de couverture
> - [ ] Masquer la galerie (active: false)

**Étape 3 — Pour les nouvelles photos, demander pour chaque image (ou en lot) :**
- Nom du fichier (ex. `DSC07123-scaled.jpg`)
- Légende (FR) :
- Tag (ex. "Gala · 2027") :

**Étape 4 — Confirmer et livrer** `data/galleries.js` modifié.

---

### WORKFLOW E — Ajouter ou modifier un partenaire

**Déclenché par :** "ajoute un partenaire", "supprime ce sponsor", "change le lien Red Bull"

**Étape 1 — Pour un nouveau partenaire, demander :**

> Pour ajouter le partenaire sans inventer d'informations, il me faut :
> - Nom exact :
> - Logo (fichier dans `uploads/partners/`), ou initiales si pas encore de logo :
> - Site web :
> - Catégorie (ex. "Banque", "Mobilité", "Formation") :
> - Description courte FR (ex. "Banque · Finance") :
> - Description courte EN :
> - Ordre d'affichage (le plus haut actuel est [X]) :
> - Actif immédiatement ? (oui/non)

**Étape 2 — Pour un partenaire existant :** afficher les valeurs actuelles, demander ce qui change.

**Étape 3 — Confirmer et livrer** `data/sponsors.js` modifié.

---

### WORKFLOW F — Ajouter un artiste au carrousel

**Déclenché par :** "ajoute [artiste] au carrousel", "mets à jour la section artistes"

**Étape 1 — Demander :**

> Pour la carte artiste :
> - Nom de l'artiste :
> - Photo (dans `uploads/`) :
> - Contexte événement (ex. "2027 · How We Dau") :
> - Texte court (ex. "Showcase exclusif · Paris Dauphine") :
> - Badge (ex. "Édition 2027") :
> - Carte mise en avant ? (plus grande) oui/non :
> - Ajouter aussi dans le bandeau texte défilant ? oui/non :
> - Ordre (le dernier actuel est [X]) :

**Étape 2 — Confirmer et livrer** `data/artists.js` modifié.

---

### WORKFLOW G — Mettre à jour le lien billetterie / Shotgun

**Déclenché par :** "nouveau lien Shotgun", "change le lien billetterie", "update le bouton Billets"

**Demander :**
- Mise à jour globale (tous les événements) ou un événement précis ?
- Nouvelle URL :
- Mettre à jour aussi le nom/sous-titre de la modal ? (actuellement : "[valeur actuelle de ticket.eventName]")

Puis modifier `data/site.js` → `ticket.url` et/ou l'événement dans `data/events.js` → `ticketUrl`.

**Attention :** vérifier les deux endroits — `defaultTicketUrl` et `ticket.url` dans `data/site.js` peuvent être distincts.

---

### WORKFLOW H — Modifier les informations globales

**Déclenché par :** changement d'email, téléphone, adresse, réseaux sociaux, footer

**Modifier `data/site.js` uniquement.** Exemples :

```js
// Changer l'email
"email": "nouvelle@adresse.fr"

// Changer le téléphone (phoneHref sans espaces)
"phone": "06 00 00 00 00",
"phoneHref": "0600000000"

// Changer Instagram
"instagramUrl": "https://www.instagram.com/nouveaucompte/",
"instagramLabel": "Instagram @nouveaucompte"
```

Ne jamais modifier le footer directement dans les pages HTML.

---

### WORKFLOW I — Modifier la navigation

**Modifier `data/site.js`**, tableau `navigation`.

```js
{ "label": "Événements", "labelEn": "Events", "href": "evenements.html" }
```

Pour un lien vers une section de la homepage depuis d'autres pages :

```js
{
  "label": "Contact",
  "labelEn": "Contact",
  "href": "#contact",
  "externalFromNonHome": "index.html#contact"
}
```

Ne pas modifier `js/components.js` pour un simple changement de menu.

---

### WORKFLOW J — Modifier les textes éditoriaux non centralisés

Certaines pages gardent leur contenu directement en HTML :

```
about.html         → "Notre histoire"
nuits.html         → "Notre label"
howwedau.html      → "How We Dau"
mentions-legales.html
```

Si l'humain demande de modifier un texte visible sur ces pages et que ce texte n'est **pas** dans `data/*.js`, modifier directement le fichier HTML.

Méthode :
1. Rechercher le texte exact dans le HTML.
2. Remplacer uniquement ce texte ou ce bloc.
3. Ne pas changer les classes CSS.
4. Ne pas changer les scripts.
5. Ne pas reformater toute la page.

---

### WORKFLOW K — Ajouter un dossier PDF à un événement

**Placer le PDF dans `uploads/`.**

Dans `data/events.js`, trouver l'événement et renseigner :

```js
"dossierUrl": "uploads/dossier-wei.pdf",
"dossierLabel": {
  "fr": "Dossier à remplir",
  "en": "Form to complete"
},
"dossierDownload": true
```

Le lien apparaît automatiquement dans la section de l'événement.

**Pour retirer le dossier :**

```js
"dossierUrl": ""
```

Ne pas supprimer le PDF sauf demande explicite.

---

### WORKFLOW L — Créer une nouvelle page

Si une nouvelle page HTML est nécessaire :

1. Copier une page existante proche du besoin.
2. Renommer le fichier.
3. Garder les scripts `data/*.js` et `js/*.js` en bas de page.
4. Garder la navigation : `<nav id="nav" data-render="nav"></nav>`
5. Garder le footer : `<footer data-render="footer"></footer>`
6. Modifier uniquement le contenu spécifique.

---

### WORKFLOW M — Mettre l'affiche du prochain événement

L'affiche est l'image de l'événement, présentée par-dessus le site quand
quelqu'un arrive, avec le lien Shotgun juste en dessous. Elle apparaît
**toute seule 14 jours avant la date de l'événement** et disparaît le
lendemain de l'événement. Il n'y a rien à programmer et rien à retirer
après coup.

**Étape 1 — préparer l'image.**

Placer l'affiche (telle qu'elle sort de Canva, même lourde) dans le
dossier du site, puis lancer :

```
python make_affiche.py mon-affiche.jpg croisette
```

Le script crée les versions légères (AVIF + WebP en 640, 960 et 1536 px
de large, plus un JPG de secours) dans `uploads/`, et affiche à la fin les
valeurs exactes à recopier. Une affiche de 4 Mo tombe ainsi à environ
25 Ko.

Il ne crée jamais une version **plus large que l'image d'origine** : une
affiche de 1179 px de large donne donc les tailles 640 et 960 seulement,
et le script le dit dans sa sortie. C'est normal, il n'y a rien à
corriger — le site n'annonce que les tailles réellement présentes.

Si Pillow n'est pas installé : `pip install pillow`.

**Étape 2 — renseigner l'événement.**

Dans `data/events.js`, trouver l'événement concerné et remplir son bloc
`affiche` avec ce que le script a affiché :

```js
"affiche": {
  "mode": "AUTO",
  "image": "uploads/affiche-croisette.jpg",
  "alt": "Affiche de La Croisette 2026",
  "ratio": "1179/1462",
  "responsive": true,
  "daysBefore": 0,
  "title":    { "fr": "", "en": "" },
  "text":     { "fr": "", "en": "" },
  "ctaLabel": { "fr": "", "en": "" },
  "ctaUrl": ""
}
```

C'est terminé. Tout ce qui est laissé vide se remplit tout seul : le
titre reprend le nom de l'événement, la ligne d'info reprend sa date et
sa salle, le bouton reprend le lien Shotgun. Le compte à rebours
(« Dans 6 jours ») est calculé automatiquement.

**Sans passer par le script** (image simple, non optimisée — à éviter
pour une vraie affiche) : renseigner `image` et `alt`, laisser
`"responsive": false`, et indiquer `ratio` (largeur/hauteur de l'image).

Ne jamais mettre `"responsive": true` sans avoir lancé le script : les
versions légères n'existeraient pas. Le site s'en protège (il retombe sur
l'image simple si `ratio` n'est pas en pixels), mais l'affiche serait
servie lourde.

**Les trois interrupteurs :**

| Besoin | Valeur |
|---|---|
| Laisser faire — apparaît et disparaît toute seule | `"mode": "AUTO"` |
| La montrer tout de suite, quelle que soit la date | `"mode": "OUI"` |
| Ne jamais la montrer pour cet événement | `"mode": "NON"` |

**Cas particuliers :**

- **Deux événements rapprochés** : le plus proche gagne. Un `"OUI"` forcé
  passe devant tout le reste.
- **Fenêtre différente pour un événement** : mettre `"daysBefore": 21`
  sur cet événement (au lieu de `0`, qui suit la valeur globale).
- **Texte personnalisé** : remplir `title`, `text` ou `ctaLabel`. Ce qui
  est rempli remplace la valeur automatique, dans les deux langues.
- **Tout couper** : dans `data/site.js`, `"affiche": { "active": false }`.

**Ce qu'il ne faut pas faire :**

- Ne pas retirer l'affiche à la main après l'événement — elle s'arrête
  seule le lendemain.
- Ne pas remplir `image` sans avoir mis le fichier dans `uploads/` :
  sans image, aucune affiche n'est montrée (c'est voulu, pas une panne).
- Ne pas supprimer l'ancienne affiche d'`uploads/` en changeant la
  valeur d'`image` — supprimer aussi les 6 fichiers `-640/-960/-1536`
  correspondants, sinon ils restent orphelins dans le dossier.

---

## 9. Exemple de référence — Begin's

L'événement Begin's illustre le fonctionnement complet du site.

Il apparaît :
- sur la homepage car `showOnHome: true` dans `data/events.js`
- sur la page événements car `showOnEventsPage: true` dans `data/events.js`
- en galerie via `galerie-begins.html` + `data/galleries.js`
- dans la bande photos homepage car sa galerie est `active: true` dans `data/galleries.js`

Pour modifier Begin's : chercher `slug: "begins"` dans `data/events.js`.
Pour modifier ses photos : chercher `slug: "begins"` dans `data/galleries.js`.

La page `galerie-begins.html` lit les images automatiquement depuis `data/galleries.js` — elle n'a pas besoin d'être modifiée pour changer les photos.

---

## 10. Check-list de validation avant livraison

Avant de rendre le fichier final, vérifier :

### Structure
- [ ] Le bon fichier a été modifié
- [ ] Aucun fichier technique (`js/`, `style.css`) n'a été modifié sans raison
- [ ] Aucun fichier HTML n'a été modifié si les données suffisaient
- [ ] Aucun style n'a été changé sans demande explicite

### Syntaxe
- [ ] Les objets JS sont valides
- [ ] Les virgules sont correctes entre les champs et entre les blocs
- [ ] Les guillemets sont fermés
- [ ] Les crochets et accolades sont équilibrés
- [ ] Les noms `window.BDE_*` sont inchangés

### Données
- [ ] Les chemins images/PDF commencent par `uploads/` ou `uploads/partners/`
- [ ] Les URLs externes commencent par `https://`
- [ ] Les slugs sont uniques
- [ ] Les ordres (`order`) sont cohérents
- [ ] Les champs `active`, `showOnHome`, `showOnEventsPage` correspondent à la demande
- [ ] Les textes FR et EN sont cohérents et tous les deux renseignés

### Fonctionnel
- [ ] Un partenaire ajouté apparaît sur la homepage et `partenaires.html`
- [ ] Un événement ajouté apparaît sur `index.html` si `showOnHome: true`
- [ ] Un événement ajouté apparaît sur `evenements.html` si `showOnEventsPage: true`
- [ ] Une galerie interne a un bloc dans `data/galleries.js` ET une page `galerie-*.html`
- [ ] Un dossier PDF n'apparaît que si `dossierUrl` n'est pas vide
- [ ] Un lien Google Photos n'apparaît que si `googlePhotosUrl` n'est pas vide

---

## 11. Ce qu'il ne faut jamais faire

- Modifier les pages HTML pour quelque chose qui peut se faire dans `data/`
- Déplacer ou renommer des fichiers existants sans mettre à jour tous les liens
- Supprimer des blocs sans demande explicite
- Inventer un lien, une date, un logo ou un texte
- Remplacer tout un fichier par une version reformatée
- Changer le design pour "améliorer" sans demande
- Créer un CMS, une base de données ou un backend
- Ajouter des dépendances externes
- Transformer le site en framework
- Utiliser des chemins locaux de machine (`C:\`, `/mnt/`, `file:///`)
- Mettre une couleur directement dans le HTML — le rouge est géré par `statusColor: "red"` via la classe CSS `.event-date--red`
- Retirer l'affiche à la main après un événement — elle s'éteint seule le lendemain (WORKFLOW M)
- Référencer une affiche sans avoir mis le fichier dans `uploads/` — sans image, rien ne s'affiche
- Supprimer une ancienne affiche d'`uploads/` sans supprimer aussi ses 6 variantes `-640/-960/-1536`

---

## 12. Réponse finale attendue après modification

Quand la modification est faite, répondre de manière factuelle et structurée :

```
Modification effectuée.

Fichiers modifiés :
- data/sponsors.js

Changements :
- ajout du partenaire [Nom]
- logo : uploads/partners/[fichier]
- lien : [URL]
- affichage actif : oui
- ordre : [numéro]

Aucun fichier HTML, CSS ou JS technique n'a été modifié.
```

Si des fichiers techniques ont été modifiés, l'expliquer et justifier pourquoi.

---

## 13. Résumé ultra-court

- Commencer par `data/`, jamais par les pages HTML.
- Partenaires → `data/sponsors.js`
- Événements → `data/events.js`
- Galeries → `data/galleries.js`
- Artistes → `data/artists.js`
- Infos globales, footer, réseaux, billetterie → `data/site.js`
- HTML uniquement pour textes éditoriaux non centralisés ou nouvelle page galerie.
- CSS/JS technique uniquement pour une nouvelle fonctionnalité impossible par les données.
- Lire le fichier avant d'écrire.
- Demander les informations manquantes, ne pas inventer.
- Modifier le minimum.
- Confirmer avant de livrer.
- Vérifier syntaxe, chemins, slugs, visibilité, bilingue.
- Livrer uniquement les fichiers modifiés.

---

## 14. Recette courte — importer toutes les photos d’une galerie

État de référence : Begins 2025 = 34 photos, Croisette 2025 = 22, Gala 2026 = 54.

1. Partir du dernier `main` pour ne pas écraser les changements faits sur GitHub.
2. Réutiliser les fichiers déjà présents dans `uploads/`, puis convertir uniquement les sources manquantes.
3. Nommage utilisé : `begins-2025-*.jpg`, `croisette-2025-*.jpg`, `gala-2026-NUMERO.jpg`.
4. Conversion : orientation EXIF, RGB, plus grand côté limité à 1920 px, JPG progressif/optimisé, qualité initiale 84 puis réduite jusqu’à environ 420 KB, toujours sous 500 KB.
5. Ajouter chaque chemin une seule fois dans le tableau `images` correspondant de `data/galleries.js`.
6. Pour ne rien afficher au survol, laisser `caption`, `tag` et leurs objets i18n vides.
7. Ne pas modifier `coverImage`, `data/events.js`, les covers Événements ou le hero sans demande explicite.
8. Dans `galerie-begins.html`, `galerie-croisette.html` et `galerie-gala.html`, conserver le titre « Éditions précédentes », mais laisser sa grille `.gallery-masonry` vide tant qu’aucune archive réelle n’existe.
9. Vérifier : chemins uniques, fichiers présents, maximum 1920 px et 500 KB, `node --check data/galleries.js`, `git diff --check`, et aucun diff sur `data/events.js`.
