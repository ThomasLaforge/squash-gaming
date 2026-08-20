# ADR 0002 — Simulation à pas fixe

- Statut : acceptée
- Date : 2026-08-20

## Contexte

La balle peut se déplacer vite et le rendu varie selon l'écran et la charge.
Une simulation liée au framerate rendrait les résultats instables et les bugs
difficiles à reproduire.

## Décision

La simulation avance à pas fixe. La cible initiale est 120 Hz, à confirmer par
mesure au M1. Le rendu peut tourner à une cadence indépendante et interpoler des
snapshots sans influencer la simulation. Le CCD doit être activé pour la balle.

## Conséquences

- Les scénarios peuvent comparer des états reproductibles.
- Une cadence de rendu de 30, 60, 120 Hz ou non plafonnée donne le même état simulé.
- La gestion d'un retard accumulé doit être explicite et bornée dans l'application.

