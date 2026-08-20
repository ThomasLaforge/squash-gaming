# Roadmap

## Stratégie

Le développement suit des tranches verticales validables. Chaque milestone doit
produire une expérience ou une capacité de preuve autonome. `main` doit rester
exécutable et, à partir de M1, jouable dans le périmètre déjà accepté.

## Ordre proposé

| Milestone | Question à trancher | Résultat observable |
| --- | --- | --- |
| [M0](docs/milestones/000-bootstrap-technique.md) | Peut-on travailler sous contrôle ? | Workspace, validation unique et frontières testées |
| [M1](docs/milestones/001-laboratoire-physique.md) | La balle paraît-elle crédible ? | Court debug, lancers, scénarios et replay visuel |
| [M2](docs/milestones/002-deplacement-interception.md) | Se déplacer vers la balle est-il satisfaisant ? | Joueur, interception, appuis simples et retour au T |
| [M3](docs/milestones/003-frappes-controles.md) | Les intentions de frappe sont-elles lisibles et maîtrisables ? | Quatre coups, visée, timing, clavier et manette |
| [M4](docs/milestones/004-echange-ia-scriptée.md) | Un échange est-il déjà amusant ? | Rally jouable contre une IA déterministe |
| [M5](docs/milestones/005-regles-spatiales.md) | Est-ce bien du squash ? | Gêne, clearing, let et stroke observables |
| [M6](docs/milestones/006-tranche-match-mvp.md) | Le noyau forme-t-il un match présentable ? | Score, fin de match, réglages et boucle complète |

## Définition du MVP

Le MVP est atteint à M6 si une personne peut lancer le jeu au clavier ou à la
manette, disputer un match contre une IA simple, comprendre le score et les
décisions arbitrales, et obtenir une expérience stable et lisible.

Le MVP n'inclut pas la carrière, le multijoueur réseau, les personnages finaux,
le backend ni les systèmes avancés de stamina/focus.

## Après le MVP

L'ordre sera décidé à partir des apprentissages mesurés. Candidats :

- stamina, effort, explosivité et focus/transe ;
- caractéristiques de joueurs et progression carrière ;
- température de balle et spin enrichis ;
- animation et direction artistique de production ;
- IA tactique ;
- multijoueur local puis réseau ;
- télémétrie d'équilibrage plus riche.

Ces thèmes ne sont pas des milestones engagés.

## Workflow conseillé

Une branche porte un milestone ou une correction bornée. Avant fusion, elle
produit son rapport. Le propriétaire du jeu accepte séparément les critères de
ressenti et protège ensuite les scénarios correspondants.

