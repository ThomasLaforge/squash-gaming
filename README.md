# Squash Gaming

Prototype de jeu de squash web en semi-simulation : physique de balle crédible,
déplacements exigeants et frappes assistées exprimant l'intention du joueur.

Le projet est actuellement dans sa phase de constitution documentaire. Aucun
choix de gameplay ouvert ne doit être figé par accident dans le code.

## Principe directeur

> Les contrôles sont simples. La complexité vient de la situation physique du
> joueur au moment où il exécute son intention.

La frappe exprime une intention. La position, les appuis, l'orientation, le
timing et les caractéristiques du joueur déterminent la qualité réellement
obtenue. Une fois frappée, la balle suit la simulation physique.

## Documents de référence

- [GAME_DESIGN.md](GAME_DESIGN.md) : vision, boucle de jeu et décisions ouvertes.
- [ARCHITECTURE.md](ARCHITECTURE.md) : frontières et flux techniques.
- [VALIDATION.md](VALIDATION.md) : preuves attendues et validation humaine.
- [ROADMAP.md](ROADMAP.md) : ordre des milestones et définition du MVP.
- [AGENTS.md](AGENTS.md) : contrat de travail des agents.
- [docs/adr](docs/adr) : décisions d'architecture.
- [docs/milestones](docs/milestones) : objectifs exécutables et critères d'acceptation.

En cas de contradiction, une ADR acceptée prévaut pour la technique et le
milestone actif prévaut pour son périmètre. Une modification de vision doit être
explicite et répercutée dans les documents concernés.

## État actuel

- Constitution documentaire : prête à relire.
- Bootstrap applicatif : non commencé.
- Milestone actif proposé : `M0 — Bootstrap technique`.
- Première tranche jouable : `M1 — Laboratoire de physique`.

## Prochain démarrage

Après validation de cette constitution :

1. exécuter [M0](docs/milestones/000-bootstrap-technique.md) ;
2. vérifier qu'une seule commande lance toutes les validations ;
3. ouvrir [M1](docs/milestones/001-laboratoire-physique.md) sans ajouter de joueur.

