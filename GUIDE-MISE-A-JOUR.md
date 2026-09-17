# Guide de mise à jour du site

Ce guide explique quoi modifier, où, et pourquoi.

---

## Gestion via tableur CSV (recommandé pour les non-techniques)

Le dossier `csv/` contient 12 fichiers CSV — un type de données par fichier.  
Ouvrir dans Excel ou Google Sheets, modifier, sauvegarder, pousser sur GitHub — c'est tout.

| Fichier CSV | Ce qu'on modifie |
|---|---|
| `config.csv` | Nom du site, contact, réseaux sociaux, modal billetterie |
| `navigation.csv` | Liens du menu |
| `events.csv` | Événements (dates, statuts, images, liens…) |
| `event_descriptions.csv` | Textes longs FR/EN par événement |
| `event_meta.csv` | Infos pratiques (Format, Durée, Lieu…) |
| `event_tags.csv` | Tags/badges d'un événement |
| `event_artists.csv` | Line-up d'artistes |
| `sponsors.csv` | Partenaires, logos, liens |
| `artists_cartes.csv` | Carrousel artistes homepage |
| `artists_bande.csv` | Bande de texte défilant |
| `galleries.csv` | Paramètres des galeries |
| `gallery_images.csv` | Photos dans chaque galerie |

**Convention dans les cellules :**
- `OUI` = vrai, `NON` = faux
- Cellule vide = champ non renseigné
- Plusieurs images : `uploads/a.jpg ; uploads/b.jpg` (séparer par `;`)

**Photos :** JPG uniquement, max 500 KB, max 1920 px. Les photos trop lourdes ne chargent pas sur iPhone.

⚠️ Cette limite protège une photo isolée (l'affiche, une image d'événement).
Elle ne suffit PAS pour une galerie, le carrousel artistes ou la bande photo
homepage : là, ce n'est jamais une seule photo qui doit charger sur mobile,
mais 20 à 100+ à la fois. Même à 500 KB chacune, ça fait des dizaines de Mo
d'un coup — c'est ce qui a rendu la galerie La Croisette illisible sur
mobile (103 photos, 29 Mo) en septembre 2026. Pour ces trois cas, une
miniature WebP allégée est obligatoire en plus de la photo d'origine — voir
« Miniatures WebP obligatoires » plus bas.

### Synchronisation automatique via GitHub Actions

**Dès qu'un push arrive sur `main` :**
- `data/*.js` modifié → les CSV se mettent à jour automatiquement
- Un CSV modifié → `data/*.js` se mettent à jour automatiquement
- Cloudflare Pages redéploie le site

Il n'y a rien à lancer manuellement depuis GitHub. Tout est automatique.

Les colonnes sont documentées dans la deuxième ligne de chaque CSV. Ne les
renommez pas et ne les réordonnez pas : elles correspondent au script de
synchronisation.

### Sur Windows en local (sans GitHub)

| Fichier | Action |
|---|---|
| `init_excel.bat` | Recrée les CSV depuis les JS actuels |
| `update_site.bat` | Applique les CSV → régénère les JS |

---

## Règle principale

Ne commencez pas par modifier les pages HTML.

Dans la majorité des cas, il faut modifier les fichiers du dossier :

```txt
data/
```

Les pages HTML contiennent des commentaires du type :

```html
<!-- Source : /data/events.js -->
```

Cela signifie que le contenu visible est généré automatiquement depuis le fichier indiqué.

---

# 1. Modifier l'année

1. Ouvrir `data/site.js`.
2. Modifier :

```js
year: "2026"
```

3. Modifier aussi si nécessaire :

```js
seasonLabel: "Saison 2025-2026"
copyrightText: "© 2026 BDE Dauphine · Paris Dauphine-PSL · Association loi 1901"
```

4. Sauvegarder.
5. Vérifier le footer du site.

---

# 2. Modifier le lien Shotgun

1. Ouvrir `data/site.js`.
2. Trouver le bloc :

```js
ticket: {
  url: "https://shotgun.live/fr"
}
```

3. Remplacer l'URL par le lien Shotgun officiel.
4. Sauvegarder.
5. Cliquer sur le bouton `Billets` dans le menu pour vérifier.

---

# 3. Ajouter un sponsor

1. Placer le logo dans :

```txt
uploads/partners/
```

Exemple :

```txt
uploads/partners/logo-nouveau-sponsor.png
```

2. Ouvrir `data/sponsors.js`.
3. Copier-coller un bloc sponsor existant.
4. Modifier :

```js
name: "Nom du sponsor"
logo: "uploads/partners/logo-nouveau-sponsor.png"
alt: "Logo Nom du sponsor"
url: "https://site-du-sponsor.com"
category: "Catégorie"
type: "Catégorie · Détail"
order: 9
active: true
```

5. Sauvegarder.
6. Vérifier la page d'accueil et `partenaires.html`.

## Si vous n'avez pas encore de logo

Mettre :

```js
logo: ""
fallback: "NS"
```

Le site affichera les lettres à la place du logo.

---

# 4. Masquer un sponsor sans le supprimer

Dans `data/sponsors.js`, modifier :

```js
active: false
```

Pour le réafficher :

```js
active: true
```

---

# 5. Changer l'ordre des sponsors

Dans `data/sponsors.js`, modifier :

```js
order: 1
```

Plus le nombre est petit, plus le sponsor apparaît tôt.

---

# 6. Ajouter ou modifier un événement

1. Placer les images dans `uploads/`.
2. Ouvrir `data/events.js`.
3. Copier-coller un bloc événement existant.
4. Modifier les champs principaux :

```js
slug: "nouvel-evenement"
number: "08"
title: "Nom de l'événement"
shortDescription: "Texte court"
homePeriod: "Annuel"
image: "uploads/image-principale.jpg"
images: [
  "uploads/image-principale.jpg",
  "uploads/image-secondaire.jpg"
]
galleryPage: "galerie-nouvel-evenement.html"
showOnHome: true
showOnEventsPage: true
```

5. Modifier les textes longs dans :

```js
descriptionBlocks
```

6. Modifier les informations techniques dans :

```js
meta
```

7. Sauvegarder.
8. Vérifier `index.html` et `evenements.html`.

## Dates et statuts des événements

Chaque événement peut afficher une date ou un statut sur la homepage.

Dans `data/events.js`, utiliser les champs :

- `date` : date technique au format `YYYY-MM-DD` si elle est connue ;
- `dateLabel.fr` : date affichée en français ;
- `dateLabel.en` : date affichée en anglais ;
- `statusLabel.fr` : statut personnalisé en français ;
- `statusLabel.en` : statut personnalisé en anglais ;
- `statusColor` : couleur optionnelle du statut ;
- `showStatusWithDate` : option facultative pour afficher exceptionnellement un statut et une date ensemble.

Priorité d’affichage sur la homepage :

1. si `showStatusWithDate: true` et qu’un statut + une date existent, afficher les deux ensemble ;
2. `statusLabel`
3. `dateLabel`
4. `date`
5. fallback automatique `À venir` / `Coming soon`

Exemple avec date connue :

```js
date: "2026-02-12",
dateLabel: {
  fr: "12 février 2026",
  en: "February 12, 2026"
},
statusLabel: {
  fr: "",
  en: ""
},
statusColor: ""
```

Exemple exceptionnel avec statut + date :

```js
date: "2026-02-12",
dateLabel: {
  fr: "12 février 2026",
  en: "February 12, 2026"
},
statusLabel: {
  fr: "En vente",
  en: "On sale"
},
statusColor: "red",
showStatusWithDate: true
```

La homepage affiche alors : `En vente · 12 février 2026` / `On sale · February 12, 2026`.

Exemple avec événement passé en rouge :

```js
date: "",
dateLabel: {
  fr: "",
  en: ""
},
statusLabel: {
  fr: "Passé",
  en: "Past"
},
statusColor: "red"
```

Exemple sans date connue :

```js
date: "",
dateLabel: {
  fr: "",
  en: ""
},
statusLabel: {
  fr: "",
  en: ""
},
statusColor: ""
```

Si aucune date ni statut n’est renseigné, la homepage affiche automatiquement :

- FR : `À venir`
- EN : `Coming soon`

Elle ajoute aussi le sous-texte :

- FR : `Date bientôt annoncée`
- EN : `Date to be announced`

Pour afficher un statut en rouge, mettre :

```js
statusColor: "red"
```

Ne pas mettre de couleur directement dans le HTML : la couleur rouge est gérée automatiquement par la classe CSS `.event-date--red`.

---

# 7. Masquer un événement

Pour masquer de l'accueil uniquement :

```js
showOnHome: false
```

Pour masquer de la page événements :

```js
showOnEventsPage: false
```

⚠️ **Après avoir masqué un événement, vérifier la numérotation (`ORDRE` et
`NUMÉRO` dans `csv/events.csv`, `order` et `number` dans `data/events.js`)
des événements restants.** Les cartes affichées gardent le numéro écrit
dans le CSV/JSON — masquer un événement au milieu de la liste laisse un
trou (ex : "07" disparaît, la carte suivante reste étiquetée "08" alors
qu'elle est maintenant la 7ᵉ visible). Renuméroter en séquence les
événements encore visibles (`SUR HOME`/`SUR ÉVÉNEMENTS` = OUI), et
donner à l'événement masqué un `ORDRE`/`NUMÉRO` à part (ex : après le
dernier) pour ne pas entrer en collision si on le réactive plus tard.

---

# 8. Ajouter une galerie photo

1. Créer ou conserver une page galerie HTML si elle existe.
2. Placer les images dans `uploads/` (JPG, max 1920 px, max 500 KB — c'est
   la version pleine résolution, utilisée par le lightbox et le bouton
   "Télécharger").
3. **Générer la miniature WebP de chaque photo** — étape obligatoire, voir
   « Miniatures WebP obligatoires » plus bas. Sans elle, la grille utilise
   la photo pleine résolution à la place et la page redevient lourde comme
   avant le correctif de septembre 2026.
4. Ouvrir `data/galleries.js`.
5. Ajouter une galerie ou modifier une galerie existante :

```js
{
  slug: "gala",
  title: "Gala Dauphine",
  page: "galerie-gala.html",
  googlePhotosUrl: "https://photos.app.goo.gl/...",
  active: true,
  images: [
    {
      src: "uploads/photo-01.jpg",        // photo pleine résolution
      alt: "Gala Dauphine",
      tag: "Gala · 2026",
      caption: "Description de la photo"
    }
  ]
}
```

   Ne référencer que `src` (la photo d'origine) dans `data/galleries.js` —
   la miniature n'est PAS un champ séparé : `js/render.js` la déduit
   automatiquement du nom de `src` (voir plus bas). Il suffit que le
   fichier `-thumb.webp` correspondant existe dans `uploads/`.
6. Sauvegarder.
7. Ouvrir la page galerie concernée.

## Bouton "Télécharger" dans la visionneuse plein écran

Chaque page `galerie-*.html` a son propre bouton de téléchargement dans sa
visionneuse plein écran (le "lightbox"/"overlay" qui s'ouvre au clic sur une
photo) : il pointe toujours vers la photo d'origine en pleine résolution
(`uploads/nom.jpg`), jamais vers la miniature `-thumb.webp` affichée dans la
grille — la visionneuse et le téléchargement lisent l'attribut `data-src` de
la vignette, pas son `<img src>` (qui contient la miniature). Ce bouton
n'existe que sur les pages `galerie-*.html` — pas sur le carrousel artistes
ni sur la bande photo de la homepage.

⚠️ Chaque page `galerie-*.html` a sa propre copie du script de la visionneuse
(pas de fichier partagé) et certaines pages n'utilisent pas exactement les
mêmes noms de classes/id (`lb-overlay`/`lbImg` sur la plupart des pages,
`lightbox`/`lbImg`/`lbCap` sur `galerie-gala.html`, `lightbox`/`lightboxImg`
sur `galerie-howwedau.html`). Toujours vérifier la structure exacte de la
page avant de toucher à ce bouton.

## Chargement différé (`loading="lazy"`) des photos

Toutes les images générées par `js/render.js` (carrousel artistes, bande
photo de la homepage, masonry des galeries, images des pages événements) et
la quasi-totalité des `<img>` codées en dur dans les pages ont
`loading="lazy" decoding="async"` : le navigateur ne télécharge/décode la
photo que quand elle approche de l'écran. Sur mobile, charger d'un coup
toutes les photos d'une page (carrousel + bande + galeries, souvent 20-30
photos) peut dépasser la mémoire disponible pour décoder des images et en
faire disparaître certaines silencieusement — c'est ce que corrige
`loading="lazy"`.

`loading="lazy"` ne règle que le *quand* (ne charger qu'à l'approche de
l'écran), pas le *poids* de chaque photo. Une galerie de 100 photos à 500 Ko
chacune reste 50 Mo à charger au fil du scroll, lazy-load ou pas — c'est
justement ce qui rendait la galerie La Croisette illisible sur mobile en
septembre 2026 (voir « Miniatures WebP obligatoires » ci-dessous). Les deux
mécanismes sont complémentaires et doivent rester actifs ensemble : lazy-load
pour le *quand*, miniature WebP pour le *poids*.

Exceptions volontaires à ne pas "corriger" :
- L'image `<img>` du fond de hero sur `nuits.html` et `howwedau.html` (elle
  est visible immédiatement à l'arrivée sur la page, donc chargée sans
  attendre).
- L'affiche pop-up (`js/render.js` → `afficheContent()`) : elle doit
  apparaître dès son déclenchement, donc jamais `loading="lazy"`.
- Le `<img>` vide (`src=""`) de la visionneuse plein écran des galeries :
  son `src` est rempli par JS au moment du clic, `loading="lazy"` retarderait
  son affichage.

## `make_affiche.py` ne concerne que l'affiche pop-up

`make_affiche.py` ne traite qu'une seule image par événement : celle de
l'AFFICHE (le pop-up qui apparaît avant la date de l'événement, colonnes
`AFFICHE *` de `csv/events.csv`). Il ne touche pas aux photos des galeries,
du carrousel artistes ou de la bande homepage — ces trois-là suivent leur
propre système de miniatures WebP, documenté juste en dessous (différent de
celui de l'affiche : pas d'AVIF, pas de variantes responsives multiples,
juste une seule miniature légère par photo).

## Miniatures WebP obligatoires (galeries, carrousel artistes, bande homepage)

Ajouté en septembre 2026 après que la galerie La Croisette (103 photos,
29 Mo) et le carrousel homepage se soient affichés en écran noir sur mobile
— trop de photos en pleine résolution chargées/décodées/animées à la fois.
Depuis, toute photo qui apparaît dans une grille galerie, le carrousel
artistes ou la bande photo homepage doit avoir une miniature WebP en plus
de sa version pleine résolution dans `uploads/`.

**Convention de nommage** — toujours `<nom-du-fichier-sans-extension>-<suffixe>.webp`,
à côté de l'original, jamais dans un sous-dossier :

| Usage | Suffixe | Taille cible | Qualité | Généré pour |
|---|---|---|---|---|
| Grille masonry d'une page `galerie-*.html` | `-thumb.webp` | 700 px de large | 72 | Chaque photo listée dans `data/galleries.js` |
| Fond de hero d'une page `galerie-*.html` | `-hero.webp` | 1600 px de large | 76 | L'image de fond de chaque `galerie-*.html` |
| Carte du carrousel artistes homepage | `-card.webp` | 840 px de haut | 76 | Chaque `image` de `data/artists.js` / `csv/artists_cartes.csv` |
| Bande photo défilante homepage | `-strip.webp` | 720 px de haut | 72 | Uniquement les photos de la sélection figée ci-dessous |

Exemple : `uploads/DSC05266-scaled.jpg` (photo d'origine) →
`uploads/DSC05266-scaled-thumb.webp` (miniature grille) et/ou
`uploads/DSC05266-scaled-card.webp` (carte artiste), selon où la photo est
utilisée. Une même photo peut avoir plusieurs miniatures si elle sert à
plusieurs endroits.

**Comment générer une miniature** (nécessite Pillow — `pip install Pillow`) :

```python
from PIL import Image
import os

def make_derivative(src, dst, target_width=None, target_height=None, quality=72):
    with Image.open(src) as im:
        im = im.convert('RGB')
        w, h = im.size
        if target_width:
            ratio = target_width / w
            im = im.resize((target_width, max(1, round(h * ratio))), Image.LANCZOS)
        elif target_height:
            ratio = target_height / h
            im = im.resize((max(1, round(w * ratio)), target_height), Image.LANCZOS)
        im.save(dst, 'WEBP', quality=quality, method=6)

# Miniature grille galerie
make_derivative('uploads/DSC05266-scaled.jpg', 'uploads/DSC05266-scaled-thumb.webp', target_width=700, quality=72)
# Carte carrousel artistes
make_derivative('uploads/DSC05266-scaled.jpg', 'uploads/DSC05266-scaled-card.webp', target_height=840, quality=76)
# Hero de page galerie
make_derivative('uploads/DSC05266-scaled.jpg', 'uploads/DSC05266-scaled-hero.webp', target_width=1600, quality=76)
```

**Ce qui lit ces fichiers, côté code :**
- `js/render.js` → `renderGallery()` déduit automatiquement le nom de la
  miniature depuis `src` (fonction `thumbSrc()` : remplace `.jpg`/`.png` par
  `-thumb.webp`) pour l'`<img>` affiché dans la grille — mais garde `src`
  (l'original) dans l'attribut `data-src`, utilisé par le lightbox et le
  bouton "Télécharger". **Si la miniature n'existe pas dans `uploads/`,
  l'image de la grille est cassée** (le nom est déduit, pas vérifié) : ne
  jamais ajouter une photo à `data/galleries.js` sans avoir généré son
  `-thumb.webp` au préalable.
- Chaque `galerie-*.html` référence son `-hero.webp` directement en dur dans
  son `<style>` (`background-image:url('uploads/...-hero.webp')`) — pas de
  déduction automatique ici, il faut éditer la page HTML à la main si le
  hero change.
- `csv/artists_cartes.csv` (colonne IMAGE) / `data/artists.js` référencent
  directement le fichier `-card.webp` — pas l'original. Toujours écrire le
  chemin de la miniature dans ce champ, jamais celui de la photo pleine
  résolution.
- La bande photo homepage (`#galerie-band`) **n'est plus générée
  automatiquement depuis `data/galleries.js`** comme avant septembre 2026.
  C'est désormais une sélection figée de 18 photos, codée en dur dans
  `js/render.js` (tableau `HOME_GALLERY_STRIP_IMAGES`, juste avant la
  fonction `homeGalleryStrip()`), qui pointe vers des fichiers `-strip.webp`.
  Marquer une galerie `active: false`/`true` dans `data/galleries.js`
  **n'a plus d'effet sur cette bande** — pour changer les photos qui y
  apparaissent : générer les `-strip.webp` des nouvelles photos, puis
  éditer directement le tableau `HOME_GALLERY_STRIP_IMAGES` dans
  `js/render.js`.

---

# 9. Ajouter un album Google Photos

1. Ouvrir `data/galleries.js`.
2. Trouver la galerie concernée.
3. Modifier :

```js
googlePhotosUrl: "https://photos.app.goo.gl/..."
```

Note : actuellement les boutons Google Photos existants sont conservés visuellement. Le champ est prêt pour centraliser les liens d'album.

---

# 10. Modifier les réseaux sociaux

1. Ouvrir `data/site.js`.
2. Modifier :

```js
instagramUrl
tiktokUrl
facebookUrl
nuitsInstagramUrl
```

3. Sauvegarder.
4. Vérifier le footer.

---

# 11. Modifier le footer

Les informations du footer viennent de `data/site.js` :

- logo ;
- description ;
- email ;
- téléphone ;
- réseaux sociaux ;
- copyright.

Ne pas modifier le footer directement dans chaque HTML.

---

# 12. Ajouter une nouvelle page

Méthode simple :

1. Copier une page existante proche du besoin.
2. Renommer le fichier, par exemple `nouvelle-page.html`.
3. Garder les lignes de scripts `data/*.js` et `js/*.js` en bas de page.
4. Garder la navigation :

```html
<nav id="nav" data-render="nav"></nav>
```

5. Garder le footer :

```html
<footer data-render="footer"></footer>
```

6. Modifier le contenu spécifique de la page.

---

# 13. Gérer les pop-ups d'événements

Les colonnes `AFFICHE *` du fichier `csv/events.csv` préparent le pop-up affiché à l'arrivée sur le site. Plusieurs événements peuvent être prêts à la fois : laissez-les en `AUTO`. Le site choisit automatiquement le prochain événement dans sa fenêtre d'affichage ; ne désactivez jamais un pop-up existant pour en préparer un futur.

| Colonne | Utilisation |
|---|---|
| `AFFICHE` | `AUTO` pour le déclenchement automatique ; `OUI` seulement pour l'afficher maintenant ; `NON` pour ne jamais l'afficher. |
| `AFFICHE IMAGE`, `ALT`, `RATIO` | Image dans `uploads/`, description accessible et dimensions réelles largeur/hauteur. |
| `AFFICHE TITRE FR/EN`, `TEXTE FR/EN` | Titre et ligne d'information visibles, dans les deux langues. |
| `AFFICHE CTA LABEL FR/EN`, `CTA URL` | Bouton billets. Si l'URL est vide, le site utilise `TICKET URL`, puis le lien Shotgun général. |
| `AFFICHE DOSSIER CTA FR/EN` | Second bouton de téléchargement ; il apparaît seulement si `DOSSIER URL` est renseigné. |
| `AFFICHE NOTE ÉLIGIBILITÉ FR/EN` | Mention courte, par exemple « Exclusif aux Dauphinois ». |

Pour le WEI, les deux boutons, la mention d'éligibilité et la formule « Lieu tenu secret » sont déjà préparés en `AUTO`. La Croisette reste elle aussi en `AUTO`, sans modification. La croix de fermeture est volontairement commune à tous les pop-ups : blanche et contrastée, avec une légère pulsation sur mobile (respectant le réglage de réduction des animations du visiteur).

Lorsqu'une image doit devenir une vraie affiche optimisée, placez le fichier dans `uploads/`, lancez `make_affiche.py`, puis reportez ses dimensions et mettez `AFFICHE IMAGES RESPONSIVES` à `OUI`. Pour une image simple déjà adaptée, laissez cette dernière colonne à `NON` et renseignez quand même le ratio.

---

# 14. Vérification après modification

Après chaque modification :

1. Ouvrir la page d'accueil.
2. Ouvrir `evenements.html`.
3. Ouvrir `partenaires.html`.
4. Ouvrir une galerie.
5. Cliquer sur `Billets`.
6. Vérifier les images.
7. Vérifier les liens externes.

---

# 15. À ne pas faire

Éviter de modifier directement :

```txt
js/components.js
js/render.js
js/main.js
```

Sauf si vous voulez changer la logique technique du site.

---

# 9. Exemple concret ajouté : Begin's

L'événement `Begin's` a été ajouté sans modifier les contenus HTML principaux.

## Où il apparaît

- Accueil : automatiquement, car `showOnHome: true` dans `data/events.js`.
- Page événements : automatiquement, car `showOnEventsPage: true` dans `data/events.js`.
- Galerie photo : via `galerie-begins.html` + `data/galleries.js`.
- Bande photo accueil : seulement si des photos Begin's ont été ajoutées à
  la sélection figée `HOME_GALLERY_STRIP_IMAGES` dans `js/render.js` — ce
  n'est plus automatique depuis septembre 2026, voir « Miniatures WebP
  obligatoires » plus haut.

## Pour modifier Begin's plus tard

Modifier uniquement :

```txt
data/events.js
```

Chercher :

```js
slug: "begins"
```

Puis modifier les champs nécessaires :

```js
title
subtitle
shortDescription
descriptionBlocks
meta
image
images
ticketUrl
galleryPage
```

## Pour modifier les photos Begin's

Modifier uniquement :

```txt
data/galleries.js
```

Chercher :

```js
slug: "begins"
```

Puis modifier :

```js
coverImage
googlePhotosUrl
images
```

La page `galerie-begins.html` lit automatiquement les images depuis ce bloc.
Pour chaque nouvelle photo ajoutée dans `images`, générer d'abord sa
miniature `-thumb.webp` (voir « Miniatures WebP obligatoires » plus haut) —
sans elle, la grille affiche la photo pleine résolution à la place.

---

# 10. Ce qui a été nettoyé visuellement

Un bloc CSS de finition a été ajouté à la fin de `style.css`.

Objectif : équilibrer l'alignement visuel des sections, notamment les titres, descriptions, lignes d'événements et blocs de métadonnées, sans modifier les textes ni les données.

Pour revenir en arrière, supprimer uniquement le bloc commençant par :

```css
/* ── VISUAL CLEANUP / ALIGNEMENT DES BLOCS ───────────── */
```
