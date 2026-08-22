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
| AC12 | À FAIRE | baseline de performance et calibrage visuel non mesurés dans ce lot |

## Validation automatisée

- Commande : `pnpm validate`
- Résultat : PASS — lint, typecheck, 34 tests unitaires, 4 tests Playwright et build.
- Environnement : Node 24.16.0, pnpm 11.13.1, Rapier `@dimforge/rapier3d-compat` 0.20.0.

## Scénarios et replays

- Ajoutés : chute/rebond sol, second rebond, impact frontal, tin, out frontal/arrière/latéral, impact latéral, CCD à 100 m/s, rejouabilité.
- Modifiés : tests M0 incompatibles avec le nouveau contrat asynchrone Rapier remplacés par les preuves M1 correspondantes.
- Acceptés par l'humain : aucun.

## Mesures

Pas de baseline de performance produite dans ce lot.

## Décisions et écarts

- L'initialisation Rapier est asynchrone et passe par `Simulation.create()` ; le constructeur ne peut pas créer un monde avant l'initialisation WASM.
- Le repère officiel M1 reste Z-up, conformément à `docs/m1/params-and-frame-3d.md`.
- Une résistance au roulement tangentielle est appliquée au contact du sol ;
  elle empêche une balle en translation de rouler indéfiniment après son rebond.

## Limites connues

- Le rendu navigateur affiche l'état numérique du laboratoire, mais ne fournit pas encore une scène 3D avec trajectoire et vecteurs.
- Les scénarios ne sont pas encore exportés comme fichiers de replay autonomes.
- La traînée de l'air reste à zéro, conformément au paramétrage initial M1 ; la
  résistance au roulement du sol est désormais calibrée séparément.

## À valider par l'humain

- Crédibilité du rebond et des pertes d'énergie.
- Lisibilité et utilité des contrôles du laboratoire.
- Acceptation du repère et des paramètres physiques retenus.

## Hors périmètre confirmé

- Joueur, raquette, frappe, IA, score, stamina, focus, spin avancé et température complète.
