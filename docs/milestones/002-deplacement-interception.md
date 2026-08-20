# M2 — Déplacement et interception

## Question

Se déplacer vers une balle est-il satisfaisant et lisible ?

## Objectif utilisateur

Rejoindre des balles envoyées automatiquement dans le court, se placer pour une
frappe virtuelle puis revenir vers le T.

## Inclus

- Joueur placeholder et déplacement au stick/clavier.
- Accélération, freinage, rotation, fente simple et limites du court.
- Prédiction d'un point d'interception et assistance légère configurable.
- Orientation et état d'appui minimal observables.
- Lanceur automatique de trajectoires reproductibles.
- Mesures de distance, temps d'arrivée et récupération vers le T.

## Exclus

Frappe réelle, quatre types de coups, stamina détaillée, animations finales,
adversaire, collisions entre joueurs et let/stroke.

## Critères d'acceptation

- AC01 — Clavier et manette donnent la même amplitude normalisée.
- AC02 — Une trajectoire déterministe produit le même point d'interception.
- AC03 — Le joueur ne traverse ni murs ni zone interdite.
- AC04 — Accélération, freinage et rotation ne dépendent pas du framerate.
- AC05 — L'assistance ne déplace jamais le joueur sans intention compatible.
- AC06 — Les outils affichent cible, chemin, appui et marge de timing.
- AC07 — Des scénarios couvrent avant, fond, coins et balle derrière le joueur.

## Validation humaine

- Poids, réactivité et lisibilité du déplacement.
- Assistance présente mais non intrusive.
- Satisfaction du retour vers le T.

