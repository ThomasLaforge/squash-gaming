# Rapport — M0 Bootstrap technique

Date : 2026-08-21 · Environnement : macOS (darwin), Node v24.16.0, pnpm 11.13.1

Statut : **À VALIDER** — validation locale verte, premier passage CI et validation humaine requis.

## Résultat utilisateur

Le dépôt s'installe, se lance et se valide avec des commandes uniques et
documentées, avant toute mécanique de jeu.

- `pnpm install` installe le workspace et Chromium (postinstall).
- `pnpm dev` ouvre l'application minimale Vite/React sur
  [http://localhost:5173](http://localhost:5173) sans erreur.
- `pnpm validate` exécute lint, typecheck, tests unitaires, tests Playwright et
  build de production, dans cet ordre.
- La simulation triviale du M0 (pas fixe 120 Hz) avance en direct dans l'app,
  pilotée par l'adaptateur clavier (ou le stick gauche d'une manette).
- Workflow GitHub Actions prêt à exécuter exactement `pnpm validate`.

Aucune règle de squash n'est implémentée : court, balle, joueur, raquette, score,
stamina, focus avancé et direction artistique restent exclus (périmètre M0).

## Critères d'acceptation

| Critère | Statut | Preuve |
| --- | --- | --- |
| AC01 — Installation propre, une seule procédure documentée | PASS AUTOMATIQUE | `README.md · Démarrage` ; `pnpm install` (postinstall Playwright, `allowBuilds : esbuild`) |
| AC02 — `pnpm dev` ouvre une application minimale sans erreur | PASS AUTOMATIQUE | Test Playwright `s'ouvre sans erreur et affiche le statut bootstrap` (HTTP 200, aucun `pageerror`/`console.error`) |
| AC03 — `pnpm validate` exécute réellement toutes les validations installées | PASS AUTOMATIQUE | `package.json · scripts.validate` = lint + typecheck + test + test:e2e + build ; commande unique exécutée localement |
| AC04 — La simulation s'exécute sous Vitest sans DOM | PASS AUTOMATIQUE | `packages/simulation` (environment node) : 5 tests dont simulation pas fixe ; `apps/game` boucle headless 6 tests sans DOM |
| AC05 — Un test échoue si la simulation importe React, Three.js ou une API DOM | PASS AUTOMATIQUE | `packages/simulation/tests/architecture.test.ts` (fitness : imports interdits + globals DOM interdits) |
| AC06 — Le build de production passe en CI | À PROUVER | `.github/workflows/validate.yml` est configuré ; attendre le premier run distant vert et référencer son URL |
| AC07 — Les mappings clavier et manette produisent un contrat sémantique commun | PASS AUTOMATIQUE | `packages/input` : 22 tests, dont remapping réel des axes et contrat commun clavier/manette |

## Validation automatisée

- Commande : `pnpm validate`
- Résultat : exit 0.
  - lint : 0 erreur, 0 avertissement.
  - typecheck : `simulation`, `input`, `game` — OK.
  - tests unitaires : simulation 5/5, input 22/22, game 6/6 (**33 tests**).
  - tests Playwright : 5/5.
  - build de production : `apps/game` ✓ (203,09 kB JS, 63,97 kB gzip).
- Environnement : macOS (darwin), Node v24.16.0, pnpm 11.13.1, Chromium Playwright.

`pnpm install --frozen-lockfile` : OK (le lockfile est cohérent pour la CI).

## Scénarios et replays

- Ajoutés : aucun scénario versionné au sens `Scenario` (le M0 n'a pas de
  mécanique de simulation à scénariser ; la balle arrive au M1).
- Tests déterministes équivalents ajoutés :
  - paquet `input` (22) : mappings, dead zone, adaptateurs clavier/manette,
    contrat commun.
  - paquet `game` (6) : pas fixe identique sous rendus 30/60/120 Hz, retard
    borné, alimentation clavier et intentions équivalentes clavier/manette.
- Modifiés : le contrat `ShotIntent` existant en `types.ts` (simulation) a été
  typé (remplace `string | null`) pour porter les intentions de frappe —
  exigence d'AC07 (contrat sémantique commun).
- Acceptés par l'humain : aucun (aucun scénario de gameplay au M0).

## Mesures

- Build de production : ~478 ms, 203,09 kB JS / 63,97 kB gzip.
- Tests unitaires : 33 tests, tous verts.
- Playwright : ~4,9 s pour 5 parcours (webServer Vite démarré automatiquement).
- Baseline de performance de simulation headless : non mesurée — elle relève du
  M1 (budget de performance, cf. `VALIDATION.md`).

## Décisions et écarts

- `PlayerInput.shot` : passage de `string | null` à `ShotIntent | null`
  (contrat structurant attendu par `ARCHITECTURE.md` et exigé par AC07). Les
  tests existants de la simulation restent compatibles (`shot: null`) et passent.
- `postinstall` : `playwright install chromium` (sans `--with-deps`) sur macOS,
  pour ne pas requérir sudo/roolz sur une installation fraîche (AC01). En CI
  (Linux), la CI install explicitement `--with-deps chromium`.
- `pnpm-workspace.yaml` : `allowBuilds : esbuild : true` (pnpm 11 n'accepte pas
  le champ `pnpm` de `package.json`) et retrait du champ `pnpm` du
  `package.json` racine (deprecated).
- Ajout `apps/game/tests/app-loop.test.ts` : l'app portait déjà un script
  `test` (Vitest) sans aucun fichier de test, ce qui faisait échouer
  `pnpm -r test`. Un fichier de test minimal a donc été ajouté pour que la
  commande de récursivité passe (pas de test supprimé, aucun test affaibli).
- Le pas fixe est borné (retard max 250 ms) dans la boucle de rendu de l'app
  pour respecter « la gestion d'un retard accumulé doit être explicite et
  bornée » (ADR 0002). Un accumulateur isolé prouve le même résultat sous
  rendus simulés à 30, 60 et 120 Hz.
- Les mappings clavier et manette sont séparés : les indices d'axes manette
  sont effectivement remappables et couverts par un test dédié.
- L'effort et le focus existent uniquement dans le contrat d'entrée ; M0 ne
  leur attribue aucun effet de gameplay.

## Limites connues

- La simulation du M0 est triviale (position 2D, vitesse 2D, pas de balle,
  pas de court) : elle ne produit pas encore de comportement de squash.
- Le rendu du M0 est une page de statut HTML, pas un rendu 3D (Three.js/R3F
  arrive avec le M1 pour le laboratoire de physique).
- La détection de manette dans l'app (`navigator.getGamepads`) n'est pas
  couverte par Playwright (aucune manette en CI) ; elle est couverte en
  headless via `GamepadAdapter` injectable (22 tests `input`).
- Aucun scénario versionné type `Scenario` ne fait encore appel à la balle —
  il sera introduit au M1.

## À valider par l'humain

- La procédure de démarrage est compréhensible sur une installation fraîche.
- L'app s'ouvre et le déplacement trivial au clavier/manette est lisible.

## Hors périmètre confirmé

Court, balle, joueur, raquette, physique de frappe, règles de squash, HUD de
match, stamina, focus avancé et direction artistique (exclus par le périmètre
M0). Ces sujets sont repris à partir du M1.
