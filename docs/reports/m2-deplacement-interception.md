# Rapport — M2 Déplacement et interception

## Résultat utilisateur

Le laboratoire permet maintenant de déplacer un joueur placeholder au clavier
AZERTY (`ZQSD`) ou à la manette. Le déplacement est intégré dans la simulation headless à
120 Hz, avec accélération, freinage, rotation, limites du court et état d'appui
(`À l’appui`, `Déplacement`, `Fente`).

La balle continue d'utiliser les scénarios reproductibles de M1. Une cible
d'interception est calculée à partir de sa trajectoire vers le sol, bornée dans
le court et affichée dans la scène avec un chemin d'approche. L'assistance est
directionnelle et limitée : elle ne s'active que lorsqu'une intention de
déplacement compatible avec la cible est présente.
Le joueur conserve son regard vers le mur frontal lorsqu'il recule ; il ne se
retourne pas pour revenir vers le fond du court.

Une interface compacte permet de remapper les touches clavier action par
action, de refuser les conflits et de restaurer le mapping AZERTY par défaut.
Les codes de touches restent confinés à l'adaptateur clavier ; le gameplay
consomme toujours le contrat `PlayerInput`.

Le panneau affiche la cible, la distance, le temps d'arrivée, l'accessibilité,
l'appui du joueur, sa distance au T et sa position. Les scénarios couvrent la
chute, les murs, les coins avant/arrière et une balle derrière le joueur.

Un mini-jeu de ghosting chronométré ajoute un parcours déterministe de six
points : coin avant gauche, coin avant droit, coin arrière gauche, coin arrière
droit, côté gauche du T puis côté droit du T. La progression et la cible
suivante sont visibles, le chrono est calculé sur les ticks de simulation et un
record est conservé pour la session navigateur.

## Critères de validation

| Critère | Statut | Preuve |
| --- | --- | --- |
| AC01 — Clavier et manette, amplitude normalisée | PASS AUTOMATIQUE | dead zone renormalisée et tests adaptateurs |
| AC02 — Cible d'interception déterministe | PASS AUTOMATIQUE | `packages/simulation/tests/player.test.ts` |
| AC03 — Limites du court | PASS AUTOMATIQUE | test headless des bornes joueur |
| AC04 — Accélération/freinage indépendants du framerate | PASS AUTOMATIQUE | intégration au pas fixe et test de déplacement |
| AC05 — Assistance compatible avec l'intention | PASS AUTOMATIQUE | assistance uniquement si le vecteur demandé vise la cible |
| AC06 — Cible, chemin, appui et marge visibles | PASS AUTOMATIQUE + VISUEL | scène et panneau M2 |
| AC07 — Avant, fond, coins et balle derrière | PASS AUTOMATIQUE | presets `front-corner`, `back-corner`, `behind-player` |

## Mini-jeu de ghosting

| Élément | Statut | Preuve |
| --- | --- | --- |
| Route de six cibles dans la simulation | PASS AUTOMATIQUE | `packages/simulation/src/ghosting.ts` |
| Validation par rayon et progression ordonnée | PASS AUTOMATIQUE | `packages/simulation/tests/ghosting.test.ts` |
| Chrono et progression visibles | PASS AUTOMATIQUE | test E2E de démarrage/réinitialisation |

## Validation automatisée

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test` — 43 tests unitaires
- `pnpm --filter @squash-gaming/game test:e2e` — 9 tests navigateur

## Limites volontaires

- La fente est un état de déplacement court déclenché par une forte intention
  près de la cible ; elle ne comporte pas encore d'animation ni de stamina.
- La prédiction d'interception utilise le prochain point de contact au sol et
  ne simule pas encore une branche complète avec rebonds futurs.
- La frappe, le score, l'adversaire, les collisions entre joueurs et les règles
  de gêne restent explicitement hors périmètre M2.

## Suite

Passer à M3 après validation humaine du poids du déplacement, de l'assistance et
du retour manuel vers le T. M3 pourra connecter le contrat de frappe déjà
présent dans les adaptateurs sans modifier la source de vérité headless.
