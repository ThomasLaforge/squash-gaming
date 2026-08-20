# ADR 0001 — Stack web TypeScript

- Statut : acceptée
- Date : 2026-08-20

## Contexte

Le projet doit rester accessible à un développeur TypeScript, fonctionner dans
le navigateur et être pilotable par agents sans dépendre d'Unity ou Unreal.

## Décision

Utiliser un workspace pnpm avec TypeScript, Vite et React pour l'application.
Utiliser Three.js via React Three Fiber pour le rendu 3D et Rapier directement
dans la simulation physique. Vitest couvrira le headless ; Playwright couvrira
les parcours navigateur. Zod sera ajouté uniquement aux frontières qui lisent
des données externes. Leva est retenu pour le laboratoire de debug.

Les versions exactes seront figées et vérifiées pendant M0, pas dans cette ADR.

## Conséquences

- Le gameplay reste testable hors navigateur.
- Rapier ne doit pas être encapsulé par des composants React dans la simulation.
- Le rendu bénéficie de l'écosystème Three.js sans devenir source de vérité.
- L'initialisation WASM et les tests headless devront être traités explicitement.

## Alternatives écartées

- Unity/Unreal : outillage et workflow non souhaités.
- Babylon.js/Havok : viable, mais moins aligné avec le contexte React retenu.
- Physique entièrement maison : coût et risque non justifiés.
