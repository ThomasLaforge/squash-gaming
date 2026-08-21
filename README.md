# Squash Gaming

Prototype de jeu de squash web en semi-simulation : physique de balle crédible,
déplacements exigeants et frappes assistées exprimant l'intention du joueur.

## Principe directeur

> Les contrôles sont simples. La complexité vient de la situation physique du
> joueur au moment où il exécute son intention.

La frappe exprime une intention. La position, les appuis, l'orientation, le
timing et les caractéristiques du joueur déterminent la qualité réellement
obtenue. Une fois frappée, la balle suit la simulation physique.

## Démarrage

Une seule procédure, sur une installation fraîche.

### Prérequis

- Node.js ≥ 24 (version figée en `package.json · engines`).
- pnpm 11.13.1 (`corepack` le gère : `corepack enable`, ou `corepack use pnpm@11.13.1`).

### Installer

```bash
pnpm install
```

Ce qui passe :
- installation des dépendances du workspace (pnpm) ;
- le postinstall installe Chromium pour Playwright ;
- esbuild est approuvé via `pnpm-workspace.yaml · allowBuilds`.

### Lancer le développement

```bash
pnpm dev
```

Ouvre l'application minimale sur [http://localhost:5173](http://localhost:5173).
La simulation triviale du M0 (pas fixe 120 Hz) y avance en direct ;
l'adaptateur clavier permet de déplacer le personnage trivial avec
`W` / `A` / `S` / `D` (ou la croix directionnelle d'une manette).

### Valider (commande unique)

```bash
pnpm validate
```

Exécute, dans l'ordre : lint, typecheck, tests unitaires, tests Playwright
navigateur, build de production. C'est aussi la commande exécutée en CI
(`.github/workflows/validate.yml`).

## Commandes

| Commande | Description |
| --- | --- |
| `pnpm dev` | Serveur de développement Vite (app) |
| `pnpm build` | Build de production de tous les packages |
| `pnpm test` | Tests unitaires de tous les packages (Vitest) |
| `pnpm test:e2e` | Tests navigateur (Playwright) de l'app |
| `pnpm typecheck` | Vérification TypeScript de tous les packages |
| `pnpm lint` | ESLint de tout le repo |
| `pnpm validate` | L'intégralité ci-dessus, dans l'ordre |

## Structure

```
apps/
  game/              client navigateur : Vite + React, boucle de rendu et debug
packages/
  simulation/        état, pas fixe, événements — headless (aucun DOM, aucun React/Three)
  input/             adaptateurs clavier/manette → contrat sémantique commun
docs/
  adr/               décisions d'architecture
  milestones/        objectifs et critères d'acceptation
  templates/         modèles de rapport
```

Voir [ARCHITECTURE.md](ARCHITECTURE.md) pour les frontières et
[AGENTS.md](AGENTS.md) pour le contrat des agents.

## Documents de référence

- [GAME_DESIGN.md](GAME_DESIGN.md) : vision, boucle de jeu et décisions ouvertes.
- [ARCHITECTURE.md](ARCHITECTURE.md) : frontières et flux techniques.
- [VALIDATION.md](VALIDATION.md) : preuves attendues et validation humaine.
- [ROADMAP.md](ROADMAP.md) : ordre des milestones et définition du MVP.
- [AGENTS.md](AGENTS.md) : contrat de travail des agents.
- [docs/adr](docs/adr) : décisions d'architecture.
- [docs/milestones](docs/milestones) : objectifs exécutables et critères d'acceptation.

En cas de contradiction, une ADR acceptée prévaut pour la technique et le
milestone actif prévaut pour son périmètre.

## État actuel

- Constitution documentaire : prête.
- Bootstrap applicatif (M0) : terminé — workspace, simulation headless,
  adaptateurs d'entrée, application minimale, validation unique et CI.
- Milestone actif : [M1 — Laboratoire de physique](docs/milestones/001-laboratoire-physique.md).
