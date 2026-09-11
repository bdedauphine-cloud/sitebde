# AI Assistant
If you are an AI reading this repository, read `AI-INSTRUCTIONS.md` before doing anything else. It contains everything you need to operate this site correctly.

---

# BDE Dauphine — Site statique data-driven

Site vitrine du Bureau des Étudiants de l'Université Paris Dauphine-PSL.  
Statique, bilingue FR/EN, déployé sur Cloudflare Pages via GitHub.

---

## Architecture

Le site est **100 % statique** — aucun CMS, aucune base de données, aucun backend.  
Les pages HTML sont générées visuellement depuis des fichiers JavaScript dans `data/`.

```
data/site.js           →  config globale (nom, contact, réseaux, nav, footer, billetterie)
data/events.js         →  événements, dates, statuts, textes, images, galeries
data/sponsors.js       →  partenaires, logos, liens, ordre
data/galleries.js      →  galeries photos, légendes, albums Google Photos
data/artists.js        →  artistes du carrousel homepage

js/render.js           →  moteur de rendu (lit data/, injecte dans le HTML)
js/components.js       →  composants communs (nav, footer, modal, sponsors)
js/main.js             →  point d'entrée
js/affiche.js          →  affiche du prochain événement (ouverture, animation)
style.css              →  design global
make_affiche.py        →  prépare une affiche pour le site (voir ci-dessous)
```

---

## Système de gestion des données — 3 niveaux

### Niveau 1 — Modifier directement un fichier `data/*.js`
La méthode la plus directe. Modifier le fichier, pousser sur GitHub.  
La sync se fait automatiquement (voir ci-dessous).

### Niveau 2 — Modifier via tableur CSV (`csv/`)
Plus convivial pour les non-techniques. 12 fichiers CSV dans `csv/`, un type de données par fichier.  
Ouvrir dans Excel ou Google Sheets, modifier, sauvegarder, pousser sur GitHub.

| Fichier CSV | Contenu |
|---|---|
| `config.csv` | Paramètres globaux du site |
| `navigation.csv` | Liens du menu |
| `events.csv` | Événements (champs principaux) |
| `event_descriptions.csv` | Paragraphes de description par événement |
| `event_meta.csv` | Métadonnées affichées par événement |
| `event_tags.csv` | Tags/badges par événement |
| `event_artists.csv` | Artistes liés à un événement |
| `sponsors.csv` | Partenaires |
| `artists_cartes.csv` | Carrousel artistes homepage |
| `artists_bande.csv` | Bande de texte défilant |
| `galleries.csv` | Galeries photos |
| `gallery_images.csv` | Photos par galerie |

Les colonnes `AFFICHE *` d'`events.csv` et les lignes `affiche_*` de `config.csv` pilotent l'affiche présentée à l'arrivée sur le site (voir ci-dessous).

### Niveau 3 — Automatique via GitHub Actions
**Dès qu'un push est détecté sur `main` :**
- Si `data/*.js` a changé → les CSV sont mis à jour automatiquement
- Si un CSV a changé → `data/*.js` sont mis à jour automatiquement
- Cloudflare Pages redéploie ensuite le site avec les données à jour

Les deux sources sont toujours synchronisées. Il n'y a rien à lancer manuellement.

---

## Déploiement

### GitHub → Cloudflare Pages
1. Connecter le dépôt GitHub à Cloudflare Pages
2. Aucune build command nécessaire
3. Output directory : `/` (racine)
4. Tout push sur `main` déclenche un redéploiement automatique

### Test local
```bash
python -m http.server 8000
```
Puis ouvrir `http://localhost:8000`

---

## Workflow quotidien

**Modifier via tableur (méthode recommandée pour les non-techniques) :**
1. Ouvrir un fichier dans `csv/` (Excel ou Google Sheets)
2. Modifier les données
3. Sauvegarder et pousser sur GitHub
4. GitHub Actions met à jour `data/*.js` → Cloudflare redéploie

**Modifier directement un fichier `data/*.js` :**
1. Éditer le fichier dans `data/`
2. Pousser sur GitHub
3. GitHub Actions met à jour les CSV → Cloudflare redéploie

**Sur Windows sans GitHub (local seulement) :**
- `init_excel.bat` : recrée les CSV depuis les JS actuels
- `update_site.bat` : applique les CSV → régénère les JS

---

## Fichiers à ne jamais modifier sans raison technique
- `js/render.js`, `js/components.js`, `js/main.js`
- `style.css`
- Les pages HTML (sauf ajout de nouvelle page)

---

## Convention dans les CSV

| Valeur | Signification |
|---|---|
| `OUI` | true |
| `NON` | false |
| *(cellule vide)* | chaîne vide / non défini |
| `a.jpg ; b.jpg` | liste de chemins séparés par `;` |

---

## Affiche du prochain événement

À l'arrivée sur le site, l'affiche de l'événement à venir est présentée par-dessus la page, avec le lien Shotgun en dessous. Elle apparaît **seule 14 jours avant la date de l'événement** et s'éteint le lendemain. Une seule fois par visite.

**Mettre une nouvelle affiche :**

```bash
python make_affiche.py mon-affiche.jpg croisette
```

Le script génère les versions légères (AVIF + WebP en 640, 960 et 1536 px) dans `uploads/` — une affiche de 4 Mo tombe à ~25 Ko — puis affiche les valeurs à recopier dans `csv/events.csv`, sur la ligne de l'événement. Il ne fabrique jamais une taille plus grande que l'original, et le site n'annonce que celles qui existent.

| Colonne | Valeur |
|---|---|
| `AFFICHE IMAGE` | `uploads/affiche-croisette.jpg` |
| `AFFICHE RATIO` | `1179/1462` (dimensions réelles en pixels) |
| `AFFICHE IMAGES RESPONSIVES` | `OUI` |
| `AFFICHE` | `AUTO` |

Tout le reste peut rester vide : le titre reprend le nom de l'événement, la ligne d'info sa date et sa salle, le bouton le lien Shotgun.

**Les interrupteurs :**

| Colonne `AFFICHE` | Effet |
|---|---|
| `AUTO` | Apparaît et disparaît toute seule autour de la date |
| `OUI` | Affichée tout de suite, quelle que soit la date |
| `NON` | Jamais affichée pour cet événement |

Réglages généraux dans `csv/config.csv` : `affiche_active` (interrupteur général), `affiche_joursAvant` (14), `affiche_frequence` (`session` / `evenement` / `toujours`), `affiche_pages` (`toutes` / `home`), `affiche_delaiMs` (700).

Prérequis du script : `pip install pillow`.

---

## Photos

- Format : JPG uniquement
- Taille max : 500 KB
- Dimensions max : 1920 px (largeur ou hauteur)
- Dossier : `uploads/` à la racine du projet
- Sur iPhone, les photos trop lourdes ou trop grandes ne chargent pas

---

## Utilisation avec une IA

```
Voici le dossier complet de mon site. Lis d'abord AI-INSTRUCTIONS.md.
Je suis débutant : pose-moi les questions nécessaires, puis modifie
uniquement les fichiers indispensables pour obtenir le résultat demandé.
```
