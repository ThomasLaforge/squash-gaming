# Protocole de validation

## Principe

Le développeur valide des comportements observables. L'agent fournit des preuves
reproductibles et ne s'auto-attribue jamais une validation subjective.

## Commande unique

Le bootstrap technique doit fournir :

```bash
pnpm validate
```

À terme, elle orchestre dans un ordre rapide et lisible : format, lint, types,
fitness functions d'architecture, tests unitaires, invariants physiques,
scénarios, déterminisme des replays, tests navigateur et build de production.

Au M0, seules les catégories réellement installées doivent être exécutées. La
commande ne doit pas afficher de faux succès pour une suite absente.

## Niveaux de preuve

### 1. Contrat statique

Types, schémas, imports autorisés et frontières d'architecture.

### 2. Test déterministe

Fonction pure ou simulation headless avec résultat exact ou invariant métier.

### 3. Scénario reproductible

État initial, seed, inputs, durée et assertions sont versionnés. Un scénario doit
pouvoir être lancé seul et identifier clairement l'assertion défaillante.

### 4. Replay visuel

Le même scénario peut être observé avec pause, reprise, pas-à-pas, ralenti,
trajectoire, vecteurs de vitesse, impacts et temps simulé.

### 5. Validation humaine

Réservée au ressenti : crédibilité des rebonds, lisibilité, plaisir, poids du
joueur, qualité de caméra ou équité perçue.

## Statuts

- `PASS AUTOMATIQUE` : toutes les preuves automatisées demandées passent.
- `À VALIDER PAR L'HUMAIN` : les preuves passent, le ressenti reste ouvert.
- `ACCEPTÉ` : l'humain accepte explicitement le comportement et ses références.
- `ÉCHEC` : au moins un critère requis échoue.

Un milestone ne peut pas passer directement de l'implémentation à `ACCEPTÉ` par
décision de l'agent.

## Scénarios acceptés

Un scénario accepté devient une référence protégée. Il ne peut être modifié que
sur demande explicite, avec justification et comparaison avant/après. Une
correction doit préférer un nouveau scénario de non-régression.

## Validation d'un bug

1. Capturer ou reconstruire la situation défaillante.
2. Montrer l'échec avant correction.
3. Transformer la reproduction en scénario/test pérenne.
4. Corriger sans altérer les références acceptées.
5. Exécuter la validation ciblée, puis `pnpm validate` si disponible.

## Preuves par milestone

Chaque rapport doit contenir :

- critères d'acceptation avec statut et commande/scénario associé ;
- résultat de la commande unique ;
- nouveaux scénarios et replays ;
- mesures pertinentes, dont performances si concernées ;
- limites connues ;
- liste précise des validations humaines restantes.

Le modèle est [docs/templates/milestone-report.md](docs/templates/milestone-report.md).

## Budget de performance initial

Aucun seuil arbitraire n'est fixé avant mesure. M1 doit établir une baseline sur
la machine de développement pour la simulation headless et le rendu du
laboratoire. Les milestones suivants ne doivent pas dégrader silencieusement
cette baseline.

