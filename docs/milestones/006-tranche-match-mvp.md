# M6 — Tranche match MVP

## Question

Le noyau validé forme-t-il un match complet et présentable ?

## Objectif utilisateur

Lancer une partie, jouer jusqu'à la victoire contre une IA simple et recommencer
sans outil de développement obligatoire.

## Inclus

- Service, score, jeux/format retenu et fin de match.
- Écrans minimaux de lancement, pause, résultat et revanche.
- Réglages de contrôles, audio minimal et accessibilité indispensable.
- IA simple assemblant les comportements déjà validés.
- Parcours E2E complet et collecte locale de télémétrie d'équilibrage.
- Passe de stabilité, performance et compatibilité navigateurs cibles.

## Exclus

Carrière, multijoueur réseau, boutique, backend, personnages et animations de
production, économie complète de stamina/focus.

## Critères d'acceptation

- AC01 — Une partie complète peut être jouée au clavier et à la manette.
- AC02 — Score, service, décisions et fin de match sont cohérents après replay.
- AC03 — Pause/reprise ne change pas le résultat simulé hors nouvelles entrées.
- AC04 — Le parcours principal est couvert en navigateur.
- AC05 — Aucun réglage de debug n'est requis pour jouer.
- AC06 — Les erreurs bloquantes sont visibles et récupérables.
- AC07 — Les performances et navigateurs cibles sont mesurés et documentés.

## Validation humaine

- Le match est compréhensible sans explication du développeur.
- La boucle donne envie de rejouer.
- Le niveau de difficulté initial paraît juste.

