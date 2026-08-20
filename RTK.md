# Règles de travail communes

- YAGNI : aucune abstraction, option, configuration ou dépendance sans besoin réel.
- SRP : une fonction, classe, module ou composant porte un rôle identifiable.
- Taille : viser moins de 300 lignes par fichier ; extraire avant 500 lignes.
- Réutilisation : chercher l'existant avant de créer.
- Validation : valider aux frontières du système, sans doublons internes inutiles.
- Erreurs : les gérer près de leur source ; aucun `catch` silencieux hors fallback voulu.
- Contrats : préférer des types ou schémas explicites et adapter tous les consommateurs.
- Périmètre : produire un diff minimal, sans renommage, déplacement ou reformatage annexe.
- Code mort : supprimer ; ne rien conserver commenté « au cas où ».
- Vérification : tout changement non trivial reçoit le check minimal pertinent.
- Secrets et données personnelles : ne jamais les committer ni les journaliser.
- Données : toute action destructive ou migration risquée exige accord et rollback.
- Sécurité : auth, rôles et isolation restent dans une couche de confiance.
- Tests : chercher l'exécution la plus rapide sans diminuer couverture ni fiabilité.

