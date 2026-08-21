# Repère 3D et paramètres officiels du court — M1

Statut : référence du laboratoire de physique (M1). Les valeurs ci-dessous sont
les **constantes officielles** du domaine ; tout paramètre de laboratoire doit
s'en démarquer explicitement (cf. `ARCHITECTURE.md · Données de debug`).

## Repère

Unités : mètres, secondes, kilogrammes, radians.

- `x` : distance depuis le mur frontal vers le mur arrière.
- `y` : largeur du court (0 au centre de la longueur).
- `z` : hauteur (sol à `z = 0`).

| Plan | Position | Normale sortante du volume |
| --- | --- | --- |
| Mur frontal | `x = 0` | `(-1, 0, 0)` |
| Mur arrière | `x = 9.75` | `(1, 0, 0)` |
| Mur latéral gauche | `y = -3.20` | `(0, -1, 0)` |
| Mur latéral droit | `y = 3.20` | `(0, 1, 0)` |
| Sol | `z = 0` | `(0, 0, 1)` |

Haut du mur : `3.05 m` (valeur informative, hors périmètre de rebond du M1 ;
le « mur » du laboratoire est plan et infini dans sa largeur pour les impacts
front, latéral et arrière).

## Constantes du court

| Nom | Symbole | Valeur | Usage M1 |
| --- | --- | --- | --- |
| Longueur | `COURT_LENGTH` | `9.75 m` | bord frontal/arrière |
| Largeur | `COURT_WIDTH` | `6.40 m` | murs latéraux à `y = ±3.20` |
| Out frontal | `FRONT_OUT_HEIGHT` | `4.57 m` | contact frontal ≥ 4.57 m ⇒ `OUT` |
| Out arrière | `BACK_OUT_HEIGHT` | `2.13 m` | contact arrière ≥ 2.13 m ⇒ `OUT` |
| Out latéral | `SIDE_OUT` | ligne inclinée entre `FRONT_OUT_HEIGHT` (face avant) et `BACK_OUT_HEIGHT` (face arrière) | contact latéral au-dessus de la ligne ⇒ `OUT` |
| Haut du tin | `TIN_HEIGHT` | `0.48 m` | contact frontal ≤ 0.48 m ⇒ `TIN` |
| Service-line | `SERVICE_LINE_HEIGHT` | `1.78 m` | documentée, **non utilisée** en M1 |
| Short-line | `SHORT_LINE_FROM_BACK` | `4.26 m` depuis l'arrière | documentée, **non utilisée** en M1 |
| Hauteur libre minimale | `CEILING_MIN_HEIGHT` | `5.64 m` | informative |

### Ligne d'out latérale

Au contact d'un mur latéral en coordonnées `(x, z)`, la hauteur d'out est la
droite joignant `(x = 0, z = 4.57)` à `(x = 9.75, z = 2.13)` :

```
outHeightSide(x) = 4.57 + (2.13 - 4.57) * (x / 9.75)
```

## Règles d'événement — M1

| Situation | Émission |
| --- | --- |
| Contact frontal à `z ≤ TIN_HEIGHT` (0.48 m) | `TIN` (remplace `IMPACT_FRONTAL`) |
| Contact frontal à `z ≥ FRONT_OUT_HEIGHT` (4.57 m) | `OUT` (remplace `IMPACT_FRONTAL`) |
| Contact latéral à `z ≥ outHeightSide(x)` | `OUT` (remplace `IMPACT_LATERAL`) |
| Contact arrière à `z ≥ BACK_OUT_HEIGHT` (2.13 m) | `OUT` (remplace `IMPACT_ARRIERE`) |
| Contact arrière à `z < 2.13 m` | `IMPACT_ARRIERE` (rebond arrière ordinaire) |
| Premier contact avec le sol | `IMPACT_SOL` |
| Second contact avec le sol | `SECOND_REBOND` (distinct de `OUT`) |

Bordures : un contact **exactement** sur une ligne appartient à la zone de
sortie (`OUT`/`TIN`). Les lignes de service et short-line ne déclenchent
**rien** en M1.

## Modèle de balle

| Propriété | Symbole | Valeur initiale | Notes |
| --- | --- | --- | --- |
| Rayon | `BALL_RADIUS` | `0.0425 m` | rayon officiel squash (diamètre 8.5 cm) |
| Masse | `BALL_MASS` | `0.0380 kg` | 38 g (petit point) — calibrable |
| Coefficient de restitution | `RESTITUTION_{surface}` | voir ci-dessous | coefficient normal au contact |
| Frottement (sol) | `SOL_FRICTION` | `0.7` | calibrable |
| Gravité | `GRAVITY` | `9.81 m/s²` | vers `-z` |
| Traînée (air) | `DRAG` | `0` en M1 | terme quadratique, calibrable |

Restitutions initiales (hypothèses de laboratoire, à calibrer aux scénarios) :

| Surface | Symbole | Valeur |
| --- | --- | --- |
| Sol | `RESTITUTION_SOL` | `0.80` |
| Mur frontal | `RESTITUTION_FRONTAL` | `0.75` |
| Mur latéral | `RESTITUTION_LATERAL` | `0.75` |
| Mur arrière | `RESTITUTION_ARRIERE` | `0.75` |

## Intégration

- Pas fixe : `120 Hz` (`dt = 1/120 s`) — cible confirmée par mesure (AC01).
- Intégrateur : Rapier WASM (`@dimforge/rapier3d-compat`), version figée.
- CCD activé sur la balle (rapides, ADR 0002).
- Les événements de collision Rapier sont regroupés par pas de simulation et
  émis comme événement de jeu **typé**, dans l'ordre déterministe de la
  collision par pas.
- Le déterminisme (AC02/AC03) exige la même version de la lib, le même seed,
  la même configuration et la même séquence d'inputs ; le framerate de rendu
  ne change pas le résultat (le laboratoire avance par pas entiers).
