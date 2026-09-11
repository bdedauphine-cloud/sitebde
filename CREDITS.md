# Crédits

## Polices

- **Unbounded** — SIL Open Font License 1.1. Voir `fonts/OFL-Unbounded.txt`.
- **DM Sans** — SIL Open Font License 1.1. Voir `fonts/OFL-DMSans.txt`.

Les deux sont auto-hébergées dans `fonts/`, sans requête vers un tiers.

## Composants d'interface

L'affiche du prochain événement (`js/affiche.js`, `js/render.js`, styles
`.affiche-*` de `style.css`) adapte deux composants de la bibliothèque
Design Memory. Le code n'a pas été copié — les deux originaux sont écrits
en React/Motion, l'adaptation est en JavaScript natif — mais la technique
vient d'eux et l'attribution reste due.

- **"Dialog (native dialog element)"** par ibelick (motion-primitives), MIT.
  https://github.com/ibelick/motion-primitives/blob/main/components/core/dialog.tsx

  Repris : l'enchaînement `cancel` (Échap) intercepté → animation de
  sortie → fermeture réelle du `<dialog>`, et la détection du clic sur le
  fond via `e.target === dialog`.

- **"Parallax Floating"** par Daniel Petho (Fancy Components), MIT.
  https://fancycomponents.dev/r/parallax-floating.json

  Repris : le suivi de curseur amorti (cible interpolée à 0,05 par image,
  transformation appliquée directement sur le style plutôt que par un
  rendu). Deux limites signalées dans la fiche d'origine ont été corrigées
  ici : la boucle d'animation ne tourne que pendant l'ouverture, et elle
  ne démarre pas du tout sous `prefers-reduced-motion`.

## Architecture

Le pipeline CSV ↔ JSON (`sync.py`, `sync_init.py`, `js/render.js`,
`csv/`, `data/`) est un travail propre au projet, documenté par ailleurs
comme motif réutilisable sous `architecture/csv-json-content-pipeline`.
