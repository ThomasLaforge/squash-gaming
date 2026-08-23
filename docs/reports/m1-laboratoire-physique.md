# Rapport — M1 Laboratoire de physique

## Résultat utilisateur

Le dépôt dispose maintenant d'une simulation Rapier headless en repère Z-up.
Une balle peut tomber, rebondir sur le sol et les quatre murs, déclencher les
événements physiques et distinguer `TIN`, `OUT` et `SECOND_REBOND`. Le même
moteur est utilisé par l'application de laboratoire avec pause, reprise, pas
suivant et reset.

## Critères d'acceptation

| Critère | Statut | Preuve |
| --- | --- | --- |
| AC01 | PASS AUTOMATIQUE | `Simulation.frequency` et test M1 à 120 Hz |
| AC02 | PASS AUTOMATIQUE | état avancé uniquement par `Simulation.step()` fixe ; boucle applicative testée |
| AC03 | PASS AUTOMATIQUE | tests de boucle fixe à 30, 60 et 120 Hz ; runner headless |
| AC04 | PASS AUTOMATIQUE | test CCD du mur frontal à 100 m/s |
| AC05 | PASS AUTOMATIQUE | impacts sol, frontal, latéral et arrière couverts par Vitest |
| AC06 | PASS AUTOMATIQUE | tests `TIN` et `OUT` frontal, arrière et latéral |
| AC07 | PASS AUTOMATIQUE | test du second contact sol |
| AC08 | PASS AUTOMATIQUE | `runScenario()` et test de rejouabilité déterministe |
| AC09 | À VALIDER PAR L'HUMAIN | laboratoire navigateur avec pause/reprise/pas/reset ; replay visuel complet à enrichir |
| AC10 | PASS AUTOMATIQUE | reset vérifié dans le test navigateur et l'état initial est versionné |
| AC11 | PASS AUTOMATIQUE | `packages/simulation/tests/architecture.test.ts` |
| AC12 | PASS PARTIEL | baseline locale de garde-fous documentée ; mesure FPS/mémoire dépendante du navigateur à confirmer humainement |

## Validation automatisée

- Commande : `pnpm validate`
- Résultat : PASS — lint, typecheck, 35 tests unitaires, 6 tests Playwright et build.
- Environnement : Node 24.16.0, pnpm 11.13.1, Rapier `@dimforge/rapier3d-compat` 0.20.0.

## Scénarios et replays

- Ajoutés : chute/rebond sol, second rebond, impact frontal, tin, out frontal/arrière/latéral, impact latéral, CCD à 100 m/s, rejouabilité.
- Modifiés : tests M0 incompatibles avec le nouveau contrat asynchrone Rapier remplacés par les preuves M1 correspondantes.
- Acceptés par l'humain : aucun.

## Mesures

- Simulation : 120 Hz fixe.
- Publication vers React et le rendu : au plus une fois par frame navigateur.
- Historique de trajectoire : 180 points maximum, dans une `BufferGeometry` réutilisée.
- Impacts affichés : 80 marqueurs maximum, avec identifiants stables.
- Build production : 3,97 MB JavaScript minifié, 1,39 MB gzip ; Vite signale un chunk supérieur à 500 kB.
- Une mesure FPS/mémoire représentative reste dépendante du navigateur, de la résolution et du GPU ; elle doit être relevée lors de la validation humaine.

## Décisions et écarts

- L'initialisation Rapier est asynchrone et passe par `Simulation.create()` ; le constructeur ne peut pas créer un monde avant l'initialisation WASM.
- Le repère officiel M1 reste Z-up, conformément à `docs/m1/params-and-frame-3d.md`.
- Une résistance au roulement tangentielle est appliquée au contact du sol ;
  elle empêche une balle en translation de rouler indéfiniment après son rebond.

## Limites connues

- Le rendu navigateur affiche l'état numérique du laboratoire et une scène 3D de validation ; il ne fournit pas encore de vecteurs de debug ni de replay exportable.
- Les scénarios ne sont pas encore exportés comme fichiers de replay autonomes.
- La traînée de l'air reste à zéro, conformément au paramétrage initial M1 ; la
  résistance au roulement du sol est désormais calibrée séparément.
- La stabilité mémoire doit être confirmée sur une session longue dans le navigateur ; le rendu réutilise désormais ses buffers principaux et borne ses historiques.

## À valider par l'humain

- Crédibilité du rebond et des pertes d'énergie.
- Lisibilité et utilité des contrôles du laboratoire.
- Acceptation du repère et des paramètres physiques retenus.

## Hors périmètre confirmé

- Joueur, raquette, frappe, IA, score, stamina, focus, spin avancé et température complète.
