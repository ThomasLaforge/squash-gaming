# M1 — Laboratoire de physique

## Question

La balle paraît-elle crédible dans un court de squash ?

## Objectif utilisateur

Lancer une balle depuis des presets, observer ses impacts et juger visuellement
son comportement sans joueur ni échange.

## Inclus

- Court aux dimensions documentées, sol, murs, tin et ligne de out.
- Balle, gravité, traînée et pertes d'énergie par surface.
- Pas fixe, CCD, pause, reprise, pas-à-pas et ralentis.
- Presets de lancement et paramètres de debug.
- Runner de scénarios headless et lecture visuelle du même scénario.
- Trajectoire, vitesse, normales, impacts, tick et temps simulé.
- Reset exact et premiers événements de simulation.
- Baseline de performance locale.

## Exclus

Joueur, raquette, frappe, IA, score, stamina, focus, spin avancé et modèle complet
de température. Une température simple n'est ajoutée que si nécessaire pour
obtenir un comportement crédible.

## Critères d'acceptation

- AC01 — La simulation cible un pas fixe de 120 Hz, ou documente une mesure justifiant un autre choix.
- AC02 — Le framerate de rendu ne change pas le résultat du scénario.
- AC03 — Un même scénario donne le même état à 30, 60, 120 Hz et sans rendu.
- AC04 — La balle ne traverse pas la géométrie jusqu'à 100 m/s dans les scénarios de référence.
- AC05 — Les impacts front, côté, arrière et sol émettent des événements typés.
- AC06 — Tin et out sont distingués des collisions physiques ordinaires.
- AC07 — Le second rebond est observable comme événement.
- AC08 — Un scénario versionné se lance seul en headless.
- AC09 — Le même scénario se rejoue visuellement avec contrôles temporels.
- AC10 — Reset restaure exactement seed, paramètres et état initial.
- AC11 — La simulation n'importe aucune dépendance ou API de rendu.
- AC12 — Les paramètres retenus et la baseline de performance sont documentés.

## Scénarios minimum

- rebond simple sur mur frontal ;
- enchaînement mur latéral puis frontal ;
- impact mur arrière à haute vitesse ;
- rebond sol puis second rebond ;
- impact tin ;
- franchissement de la ligne de out ;
- test anti-tunneling à 100 m/s.

## Validation humaine

- Crédibilité du rebond mur/sol.
- Lisibilité de la vitesse et de la perte d'énergie.
- Utilité réelle des outils de debug.

