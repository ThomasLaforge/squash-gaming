# Vision de jeu

## Promesse

Créer un jeu de squash web accessible à comprendre mais difficile à maîtriser,
avec une physique de balle convaincante et une profondeur issue du placement,
des appuis, du timing et de la lecture de trajectoire.

Le jeu vise une semi-simulation inspirée des jeux de tennis arcade exigeants :
la commande représente une intention, pas le contrôle biomécanique d'une
raquette. La trajectoire après frappe reste physique.

## Boucle de gameplay visée

1. Lire la trajectoire et anticiper le point d'interception.
2. Déplacer le joueur, choisir sa course, ses appuis et son orientation.
3. Choisir un type de coup et une direction.
4. Frapper avec un timing plus ou moins favorable.
5. Subir les conséquences physiques du coup puis revenir vers le T.

Le plaisir doit exister dans cette boucle avant carrière, progression ou multijoueur.

## Contrôles envisagés

Les actions sont stables ; les mappings restent configurables.

- Stick gauche : déplacement.
- Stick droit : direction/intention de visée, avec une assistance assumée.
- Quatre boutons : longueur, coup bas et fort, lob, amortie.
- Gâchette d'effort : accélération ou explosivité contre dépense d'énergie.
- Gâchette de focus : micro-ralenti ou état de concentration limité.

Le clavier doit permettre de tester toutes les actions. Aucun choix de touche
physique ne doit traverser la frontière de la couche d'entrée.

## Modèle de frappe

La frappe ne résulte pas d'une collision libre entre une raquette simulée et la
balle. Un solveur transforme l'intention en vélocité et éventuellement en spin,
selon notamment :

- position et vitesse du joueur ;
- distance à la balle et hauteur de contact ;
- orientation des épaules et type d'appui ;
- timing tôt, idéal ou tard ;
- type de coup et direction demandée ;
- capacités physiques et techniques du personnage.

Une demande difficile ou incompatible est dégradée de façon lisible : perte de
puissance, précision moindre ou trajectoire contrainte. Le jeu ne doit pas
punir par un résultat incompréhensible.

## Déplacement

Le déplacement est une mécanique centrale, pas un simple déplacement de capsule.
À terme, explosivité, vitesse, endurance, agilité, footwork et équilibre pourront
modifier accélération, trajectoires, nombre de pas, fentes, récupération et
qualité des appuis.

Le premier modèle restera volontairement réduit. Chaque sophistication devra
être motivée par un comportement observable et un milestone dédié.

## Physique de balle

La crédibilité vient surtout du vol et des impacts : gravité, traînée, pertes
d'énergie différentes selon mur ou sol, collisions rapides fiables et balle qui
peut évoluer avec sa température.

La précision scientifique absolue n'est pas l'objectif. Les paramètres doivent
produire un squash lisible et convaincant, puis être calibrés par scénarios et
validation humaine.

## Règles propres au squash

Le jeu final doit intégrer tin, out, double rebond, alternance des frappes,
score, gêne, clearing, let et stroke. Les règles spatiales complexes arrivent
après qu'un échange contre une IA scriptée est déjà satisfaisant.

## Caméra et lisibilité

La première caméra candidate est extérieure derrière la vitre arrière,
légèrement élevée. Elle doit permettre de lire joueurs, balle, coins et mur
frontal. Les mouvements dynamiques de caméra restent à valider expérimentalement.

## Progression future

Une carrière pourra faire progresser des qualités visibles dans le comportement,
pas seulement des multiplicateurs abstraits : meilleure trajectoire de course,
préparation plus tôt, équilibre supérieur, précision accrue ou récupération plus
rapide.

## Décisions ouvertes et différées

Ces sujets ne doivent pas être implémentés avant un milestone explicite :

- formule précise d'effort, cardio, stamina et explosivité ;
- recharge et récompense du focus/transe ;
- température de balle détaillée et spin avancé ;
- système complet de caractéristiques et carrière ;
- multijoueur, matchmaking et backend ;
- direction artistique, personnages finaux et animations de production ;
- modèle définitif de let/stroke ;
- assistance adaptative selon le niveau du joueur.

## Hors MVP

Carrière, multijoueur réseau, licences, personnalisation cosmétique, narration,
commentaires, boutique, backend persistant et réalisme biomécanique de la raquette.

