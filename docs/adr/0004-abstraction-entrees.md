# ADR 0004 — Actions indépendantes des périphériques

- Statut : acceptée
- Date : 2026-08-20

## Contexte

Le jeu sera principalement essayé à la manette mais doit rester intégralement
testable au clavier. Les mappings et mécaniques vont évoluer.

## Décision

Le gameplay consomme un `PlayerInput` sémantique. Des adaptateurs clavier,
manette, IA et replay produisent ce même contrat. Les dead zones, codes de
touches et indices de boutons restent dans les adaptateurs.

Les actions prévues sont déplacement, visée, type de coup, effort et focus. Une
action peut exister dans le contrat avant que sa mécanique soit activée, mais ne
doit pas déclencher une implémentation anticipée.

## Conséquences

- Tous les parcours peuvent être testés sans manette physique.
- Le remapping ne modifie pas les règles du jeu.
- Un replay est une source d'inputs déterministe, pas une seconde simulation.

