# Rapport — M3 Frappes et contrôles

## Première tranche livrée

Le laboratoire permet maintenant de tester une intention de frappe depuis le
scénario `shot-ready`. Les quatre profils `length`, `drop`, `lob` et `push`
passent par un solveur headless unique qui produit une vélocité de sortie
déterministe.

Le solveur vérifie la portée du joueur, classe le timing en `early`, `ideal` ou
`late`, puis dégrade la qualité et la vitesse en conséquence. Une intention
hors portée est refusée sans modifier la vélocité de la balle. La visée
latérale du stick droit influence la sortie sans déplacer la source de vérité
dans le rendu.

Les profils clavier/manette et le remapping d'actions existant sont réutilisés.
Le dernier résultat est affiché dans le laboratoire avec le type de coup, le
timing, la qualité ou le refus hors portée.

## Critères couverts

| Critère | Statut | Preuve |
| --- | --- | --- |
| AC01 — Aucun code périphérique dans le gameplay | PASS AUTOMATIQUE | solveur et simulation consomment `ShotIntent` |
| AC02 — Quatre intentions explicites | PASS AUTOMATIQUE | profils du solveur et tests unitaires |
| AC03 — Sortie déterministe | PASS AUTOMATIQUE | `shot-solver.test.ts` |
| AC04 — Tôt, idéal, tard | PASS AUTOMATIQUE | qualité distincte et tests dédiés |
| AC05 — Intention hors portée dégradée | PASS AUTOMATIQUE | refus sans vitesse aberrante |

## Limites restantes

- La frappe ne lance pas encore un échange et ne gère pas le score.
- La fenêtre de contact est géométrique ; elle sera enrichie par l'appui,
  l'orientation et la hauteur de contact au prochain incrément.
- Les scénarios parallèles, croisés, amortie et coup bas doivent encore être
  enrichis par une validation humaine de leurs trajectoires.
- Le micro-ralenti de laboratoire n'est pas encore exposé dans l'interface.

## Validation automatisée

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test` — 46 tests unitaires
- `pnpm --filter @squash-gaming/game test:e2e` — 10 tests navigateur
