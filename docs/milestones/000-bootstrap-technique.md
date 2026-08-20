# M0 — Bootstrap technique

## Question

Peut-on développer le jeu avec des frontières contrôlées et une preuve unique ?

## Objectif utilisateur

Le développeur peut installer, lancer, tester et valider le dépôt avec des
commandes documentées, avant toute mécanique de jeu.

## Inclus

- Workspace pnpm et version Node figée.
- Application Vite/React minimale et packages strictement nécessaires.
- Simulation headless minimale capable d'avancer un état trivial à pas fixe.
- Contrat d'entrée minimal et adaptateurs clavier/manette sans gameplay.
- Vitest, Playwright et test automatisé des frontières d'architecture.
- Commandes `dev`, `test`, `build` et `validate`.
- CI correspondant à `pnpm validate`.

## Exclus

Court, balle, joueur, règles de squash, physique de frappe, HUD de match,
stamina, focus et direction artistique.

## Critères d'acceptation

- AC01 — Une installation propre suit une seule procédure documentée.
- AC02 — `pnpm dev` ouvre une application minimale sans erreur.
- AC03 — `pnpm validate` exécute réellement toutes les validations installées.
- AC04 — La simulation s'exécute sous Vitest sans DOM.
- AC05 — Un test échoue si la simulation importe React, Three.js ou une API DOM.
- AC06 — Le build de production passe en CI.
- AC07 — Les mappings clavier et manette produisent un contrat sémantique commun.

## Validation humaine

- La procédure de démarrage est compréhensible sur une installation fraîche.

## Sortie attendue

Rapport M0, résultat de `pnpm validate` et aucun gameplay anticipé.

