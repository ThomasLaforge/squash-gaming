@RTK.md

# Contrat des agents — Squash Gaming

## Priorité des sources

1. Le milestone actif fixe le périmètre et les critères d'acceptation.
2. Les ADR acceptées fixent les décisions techniques.
3. `ARCHITECTURE.md` fixe les frontières du système.
4. `GAME_DESIGN.md` fixe la vision et distingue décisions des hypothèses.
5. `VALIDATION.md` fixe les preuves à produire.

Ne pas résoudre seul une contradiction entre ces sources. La signaler.

## Règles non négociables

- La simulation doit fonctionner sans React, Three.js, WebGL ni DOM.
- Le rendu ne contient aucune règle de gameplay.
- Le gameplay ne connaît ni touches clavier ni boutons de manette.
- Le pas de simulation est fixe ; le framerate de rendu ne change pas le résultat.
- React ne porte pas l'état autoritaire d'un échange ou d'un match.
- La simulation ne manipule aucun objet Three.js.
- Les constantes de gameplay sont nommées et regroupées près de leur domaine.
- Les événements significatifs de simulation sont typés et observables.
- Une décision différée reste différée tant qu'un milestone ne l'ouvre pas.

## Interdictions

- Ne pas changer les critères d'acceptation pour faciliter l'implémentation.
- Ne pas affaiblir, ignorer ou supprimer un test existant sans accord explicite.
- Ne pas modifier un scénario accepté pour faire passer une régression.
- Ne pas remplacer une technologie fixée par ADR sans nouvelle décision acceptée.
- Ne pas introduire de refactor, dépendance ou fonctionnalité hors milestone.
- Ne pas déclarer réussi un critère subjectif réservé au jugement humain.
- Ne pas masquer un comportement instable avec une tolérance arbitraire.

## Définition de terminé

Un milestone n'est terminé que si :

1. tous ses critères automatisables disposent d'une preuve reproductible ;
2. la commande unique de validation passe ;
3. les scénarios nouveaux ou modifiés sont listés ;
4. les limites connues sont documentées ;
5. les critères subjectifs sont marqués `À VALIDER PAR L'HUMAIN` ;
6. un rapport est produit depuis `docs/templates/milestone-report.md`.

Tant que le bootstrap n'existe pas, ne pas inventer les résultats de commandes.

## Changements de comportement et bugs

Pour toute correction touchant la simulation :

1. reproduire le défaut par test, scénario ou replay ;
2. conserver cette preuve comme non-régression ;
3. corriger au plus près de la source ;
4. prouver que les scénarios acceptés restent inchangés.

## Compte rendu attendu

Rendre compte du comportement obtenu, des preuves, des limites et de la
validation humaine restante. Un inventaire de classes créées n'est pas une
preuve d'avancement produit.

