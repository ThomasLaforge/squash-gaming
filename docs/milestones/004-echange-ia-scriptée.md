# M4 — Échange contre IA scriptée

## Question

La boucle déplacement-frappe-retour est-elle déjà amusante ?

## Objectif utilisateur

Maintenir un échange contre un adversaire déterministe qui se déplace vers la
destination connue de la balle et répond avec un répertoire borné.

## Inclus

- Deux joueurs placeholders et alternance des frappes.
- IA scriptée utilisant les mêmes contrats d'entrée que le joueur.
- Début et fin d'échange sur tin, out ou double rebond.
- HUD minimal de rally et replay complet des inputs.
- Télémétrie locale : durée, coups, distances et vitesses de balle.

## Exclus

Score complet de match, IA tactique, difficulté adaptative, stamina/focus,
carrière, collisions réglementaires complexes et multijoueur.

## Critères d'acceptation

- AC01 — Un rally complet se rejoue à l'identique depuis son replay.
- AC02 — Joueur et IA passent par le même contrat d'entrée.
- AC03 — Les fins de rally produisent une cause typée et visible.
- AC04 — L'IA ne lit pas un état futur indisponible au contrat qui lui est accordé.
- AC05 — La télémétrie du rally est calculée depuis les événements publics.
- AC06 — Un parcours navigateur couvre lancement, rally et fin de rally.

## Validation humaine

- Plaisir de la boucle sur plusieurs échanges.
- Rythme, lisibilité et variété suffisante de l'IA scriptée.

