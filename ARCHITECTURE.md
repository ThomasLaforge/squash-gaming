# Architecture cible

## Objectif

Permettre à un agent de modifier le jeu tout en laissant au développeur un
protocole de confiance fondé sur des scénarios, des invariants et des preuves
visuelles plutôt que sur la relecture exhaustive du code.

## Flux autoritaire

```text
device input
    ↓ adapter
PlayerInput / ShotIntent
    ↓
fixed-step simulation
    ↓
GameState + typed events + render snapshot
    ↓
rendering / audio / debug UI / telemetry
```

La simulation est la source de vérité. Le rendu consomme un snapshot et peut
interpoler visuellement sans modifier l'état simulé.

## Découpage prévu

Le bootstrap technique devra partir de ce minimum :

```text
apps/
  game/              client navigateur, rendu et interface de debug
packages/
  simulation/        état, physique, règles et événements headless
  input/             actions, mappings et adaptateurs de périphériques
  shared/            contrats réellement partagés, uniquement si nécessaires
scenarios/            cas reproductibles versionnés
replays/              reproductions exportées ; politique à préciser au bootstrap
scripts/              orchestration de la validation
```

Ne pas créer à l'avance des packages pour chaque domaine. Extraire lorsque le
code et les dépendances justifient une frontière.

## Frontières

### Simulation

- TypeScript sans React, Three.js, DOM ni boucle de rendu.
- Pas fixe et ordre des opérations déterministe.
- Entrées normalisées, état sérialisable et événements typés.
- Exécution headless en test et via le runner de scénarios.

### Input

- Produit un contrat sémantique commun depuis clavier, manette, IA ou replay.
- Gère dead zones, axes, boutons et mappings au bord du système.
- Ne contient ni règles de frappe ni calcul de stamina.

### Rendu et UI

- Affiche les snapshots de simulation.
- Porte menus, HUD, debug, trajectoires et outils de lecture des scénarios.
- N'écrit pas directement l'état de gameplay.

### Règles

- Écoutent les événements de simulation et font évoluer l'état de rally/match.
- Distinguent géométrie physique et décisions réglementaires telles que tin,
  out, double rebond, let ou stroke.

## Contrats structurants attendus

Les noms exacts pourront évoluer, mais les responsabilités doivent rester :

- `PlayerInput` : déplacement, visée, coup, effort et focus normalisés.
- `ShotIntent` : demande de frappe indépendante du périphérique.
- `SimulationState` : état autoritaire sérialisable.
- `RenderSnapshot` : projection en lecture seule destinée à l'affichage.
- `GameEvent` : union typée des événements observables.
- `Scenario` : conditions initiales, entrées, durée et assertions.
- `Replay` : seed, configuration et flux d'inputs permettant la reproduction.

## Événements initiaux

Le laboratoire de physique doit pouvoir exposer au minimum : impact mur frontal,
mur latéral, mur arrière, sol, tin, out et second rebond. Les frappes, rallyes et
règles spatiales enrichiront l'union dans leurs milestones respectifs.

## Déterminisme

À seed, configuration, état initial et séquence d'inputs identiques, le résultat
doit être identique indépendamment du framerate de rendu. Toute source de temps,
de hasard ou d'ordre implicite doit être injectée ou contrôlée.

## Fitness functions

Le bootstrap doit automatiser au moins :

- l'interdiction des imports de rendu dans `packages/simulation` ;
- l'absence d'API navigateur dans la simulation ;
- l'exécution d'un scénario sans navigateur ;
- la comparaison d'un même scénario sous plusieurs cadences de rendu simulées.

## Données de debug

La configuration de debug est distincte des constantes acceptées de gameplay.
Changer un paramètre en laboratoire ne change pas silencieusement une référence.
Un paramètre retenu doit être versionné avec les scénarios qui le justifient.

