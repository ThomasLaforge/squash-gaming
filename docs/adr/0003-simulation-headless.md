# ADR 0003 — Simulation headless comme source de vérité

- Statut : acceptée
- Date : 2026-08-20

## Contexte

Le projet doit pouvoir être développé par agents avec des preuves rapides et
fiables, sans demander au propriétaire de relire chaque détail d'implémentation.

## Décision

La simulation est un package indépendant du navigateur. Elle reçoit des entrées
normalisées, avance explicitement, publie un état sérialisable et des événements
typés. React et Three.js ne sont que des consommateurs de snapshots.

## Conséquences

- Les règles et la physique peuvent être testées sans WebGL.
- Replays, IA et scénarios peuvent réutiliser le même contrat d'entrée.
- Une fitness function interdit les imports et API de rendu dans la simulation.

