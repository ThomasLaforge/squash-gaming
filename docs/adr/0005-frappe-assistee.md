# ADR 0005 — Intention assistée, trajectoire physique

- Statut : acceptée
- Date : 2026-08-20

## Contexte

Une collision biomécanique libre entre raquette et balle serait difficile à
contrôler, à rendre lisible et à calibrer. Un modèle Pong supprimerait une grande
partie de la profondeur tactique du squash.

## Décision

Au contact, un solveur transforme l'intention de frappe et la situation du
joueur en vélocité de sortie. Après ce point, le vol et les rebonds sont simulés
physiquement. Le solveur peut dégrader une intention selon timing, appuis,
orientation, distance et capacités.

## Conséquences

- Le joueur choisit un coup sans piloter un bras articulé.
- La difficulté vient de la préparation et du timing.
- Les règles du solveur doivent être explicables, testables et calibrables.
- La frappe n'est introduite qu'au M3.

