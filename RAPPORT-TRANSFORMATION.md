# Rapport de transformation — BDE Dauphine V4

## Inventaire de départ

Le site d'origine contenait :

- 12 pages HTML principales ;
- 7 pages galerie ;
- 1 fichier CSS principal : `style.css` ;
- des images dans `uploads/`, `uploads/partners/` et `assets/` ;
- une navigation répétée dans chaque page ;
- un footer répété dans chaque page ;
- une modal billetterie répétée dans chaque page ;
- des sponsors répétés entre la page d'accueil et `partenaires.html` ;
- des événements répétés entre la page d'accueil et `evenements.html` ;
- des galeries écrites à la main dans les pages `galerie-*.html`.

## Transformation effectuée

Les éléments suivants sont maintenant générés automatiquement :

- navigation globale depuis `data/site.js` ;
- footer global depuis `data/site.js` ;
- modal billetterie depuis `data/site.js` ;
- bandeau sponsors de la page d'accueil depuis `data/sponsors.js` ;
- cartes sponsors de `partenaires.html` depuis `data/sponsors.js` ;
- liste événements de l'accueil depuis `data/events.js` ;
- sections événement détaillées de `evenements.html` depuis `data/events.js` ;
- carrousel artistes de la page d'accueil depuis `data/artists.js` ;
- bande photo de la page d'accueil depuis `data/galleries.js` ;
- grilles photos des pages galerie depuis `data/galleries.js`.

## Ce qui a été conservé

- Le fichier `style.css` a été conservé.
- Les images existantes ont été conservées.
- Les noms des pages existantes ont été conservés.
- Les liens internes existants ont été conservés autant que possible.
- La logique des animations, du curseur, des modales, du lightbox et du changement de langue a été conservée.

## Limites volontaires

Certaines pages éditoriales gardent encore des textes directement dans le HTML :

- `about.html` ;
- `howwedau.html` ;
- `nuits.html` ;
- `mentions-legales.html`.

C'est volontaire : ces pages ont une mise en page plus spécifique. Les rendre entièrement dynamiques aurait augmenté le risque de différence visuelle. La priorité était de centraliser les contenus répétitifs et annuels sans modifier le rendu.

## Tests statiques effectués

- Vérification syntaxique des fichiers JavaScript avec `node --check`.
- Vérification que les pages HTML référencent les scripts de données.
- Vérification que les chemins d'images et fichiers statiques présents dans le HTML existent.
- Vérification que les fichiers de documentation sont présents.

## Point d'attention

Pour tester localement, utiliser un petit serveur local plutôt qu'un double-clic sur `index.html`, car certains navigateurs limitent le chargement JavaScript depuis `file://`.

Exemple :

```bash
python -m http.server 8000
```

Puis ouvrir :

```txt
http://localhost:8000
```
