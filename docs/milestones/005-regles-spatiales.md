# M5 — Règles spatiales : gêne, let et stroke

## Question

Le jeu reproduit-il ce qui distingue le squash d'un tennis dans une boîte ?

## Objectif utilisateur

Comprendre quand son placement gêne l'accès de l'adversaire et recevoir une
décision explicable de jeu continu, let ou stroke.

## Inclus

- Accès direct à la balle, clearing et espace de swing simplifié.
- Détection d'interférences sur des scénarios canoniques.
- Décision typée avec facteurs explicables dans le debug.
- Visualisation des zones et chemins ayant motivé la décision.
- Reprise correcte du rally selon la décision.

## Exclus

Exhaustivité réglementaire de compétition, arbitrage humain en ligne, collisions
physiques réalistes entre corps et système disciplinaire.

## Critères d'acceptation

- AC01 — Les décisions reposent sur l'état autoritaire de simulation.
- AC02 — Chaque décision expose les facteurs qui l'ont motivée.
- AC03 — Des scénarios distincts couvrent jeu continu, let et stroke.
- AC04 — Les zones de swing et chemins d'accès sont visibles en debug.
- AC05 — Une même situation donne une décision déterministe.
- AC06 — Les cas ambigus non couverts sont signalés, pas classés silencieusement.

## Validation humaine

- Compréhension et plausibilité des décisions.
- Absence de frustration excessive sur les cas courants.

