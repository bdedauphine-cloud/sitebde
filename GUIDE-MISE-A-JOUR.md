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

### Synchronisation automatique via GitHub Actions

**Dès qu'un push arrive sur `main` :**
- `data/*.js` modifié → les CSV se mettent à jour automatiquement
- Un CSV modifié → `data/*.js` se mettent à jour automatiquement
- Cloudflare Pages redéploie le site

Il n'y a rien à lancer manuellement depuis GitHub. Tout est automatique.

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

---

# 8. Ajouter une galerie photo

1. Créer ou conserver une page galerie HTML si elle existe.
2. Placer les images dans `uploads/`.
3. Ouvrir `data/galleries.js`.
4. Ajouter une galerie ou modifier une galerie existante :

```js
{
  slug: "gala",
  title: "Gala Dauphine",
  page: "galerie-gala.html",
  googlePhotosUrl: "https://photos.app.goo.gl/...",
  active: true,
  images: [
    {
      src: "uploads/photo-01.jpg",
      alt: "Gala Dauphine",
      tag: "Gala · 2026",
      caption: "Description de la photo"
    }
  ]
}
```

5. Sauvegarder.
6. Ouvrir la page galerie concernée.

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

# 13. Vérification après modification

Après chaque modification :

1. Ouvrir la page d'accueil.
2. Ouvrir `evenements.html`.
3. Ouvrir `partenaires.html`.
4. Ouvrir une galerie.
5. Cliquer sur `Billets`.
6. Vérifier les images.
7. Vérifier les liens externes.

---

# 14. À ne pas faire

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
- Bande photo accueil : automatiquement, car sa galerie est `active: true` dans `data/galleries.js`.

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

---

# 10. Ce qui a été nettoyé visuellement

Un bloc CSS de finition a été ajouté à la fin de `style.css`.

Objectif : équilibrer l'alignement visuel des sections, notamment les titres, descriptions, lignes d'événements et blocs de métadonnées, sans modifier les textes ni les données.

Pour revenir en arrière, supprimer uniquement le bloc commençant par :

```css
/* ── VISUAL CLEANUP / ALIGNEMENT DES BLOCS ───────────── */
```
