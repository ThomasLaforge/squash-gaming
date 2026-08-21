# Utiliser OpenCode avec un vLLM distant via SSH

Ce guide permet d'utiliser OpenCode sur un poste Windows, Linux ou macOS avec
un modèle servi par vLLM sur une autre machine, sans exposer directement l'API
vLLM sur le réseau.

Chemin réseau obtenu :

```text
OpenCode
  → http://127.0.0.1:9000/v1
  → tunnel SSH
  → machine distante, http://127.0.0.1:8000/v1
  → vLLM
```

Le guide a été validé avec OpenCode `1.18.11`. Vérifier la version installée :

```bash
opencode --version
```

La configuration présentée utilise donc les champs `provider`, `npm` et
`options`. Une future version majeure d'OpenCode peut faire évoluer ce schéma.

## 1. Prérequis

Il faut disposer de :

- l'adresse ou le nom DNS de la machine distante ;
- un compte SSH fonctionnel sur cette machine ;
- vLLM déjà lancé et à l'écoute sur son port local, généralement `8000` ;
- un modèle conversationnel compatible avec l'API Chat Completions ;
- idéalement un modèle et une configuration vLLM compatibles avec le tool calling.

Ne jamais recopier une clé API réelle dans ce document ou dans Git.

## 2. Installer OpenCode

Suivre le guide séparé [Installer OpenCode](installer-opencode.md), qui couvre
macOS, Linux, Windows natif et WSL à partir des méthodes officielles.

Vérifier ensuite l'installation :

```bash
opencode --version
```

## 3. Vérifier vLLM depuis la machine distante

Se connecter normalement :

```bash
ssh <utilisateur>@<adresse-distante>
```

Puis, sur la machine distante :

```bash
curl -i http://127.0.0.1:8000/health
curl -i http://127.0.0.1:8000/v1/models
```

Résultats attendus :

- `/health` répond `HTTP 200` ;
- `/v1/models` retourne un objet JSON contenant `data` et au moins un modèle.

vLLM expose officiellement `/health` et `/v1/models` dans son
[serveur compatible OpenAI](https://docs.vllm.ai/en/stable/serving/openai_compatible_server/).

Si la connexion est refusée, vérifier le processus ou conteneur vLLM et son port
avant de continuer.

## 4. Créer le tunnel SSH

Sur le poste où OpenCode sera lancé :

```bash
ssh -NT \
  -o ExitOnForwardFailure=yes \
  -o ServerAliveInterval=30 \
  -L 9000:127.0.0.1:8000 \
  <utilisateur>@<adresse-distante>
```

Cette commande fonctionne dans macOS, Linux, WSL et PowerShell si OpenSSH Client
est installé.

Après le bon mot de passe, le terminal reste silencieux : c'est normal.
L'option `-N` demande à SSH de maintenir uniquement le tunnel, sans ouvrir de
shell distant. Garder ce terminal ouvert. `Ctrl+C` ferme le tunnel.

Le port `9000` est local. Le port `8000` est celui de vLLM sur la machine
distante. Choisir un autre port local si `9000` est déjà occupé.

## 5. Tester le tunnel

Dans un deuxième terminal local :

```bash
curl -i http://127.0.0.1:9000/health
curl -i http://127.0.0.1:9000/v1/models
```

Pour obtenir uniquement les identifiants de modèles avec `jq` :

```bash
curl -sS http://127.0.0.1:9000/v1/models | jq -r '.data[].id'
```

Conserver exactement l'identifiant retourné, y compris les majuscules et les
segments séparés par `/`.

## 6. Comprendre la clé API

Une clé vLLM existe uniquement si le serveur a été lancé avec :

```bash
vllm serve <modele> --api-key <cle>
```

ou avec la variable `VLLM_API_KEY`.

Interprétation du test `/v1/models` :

- `HTTP 200` sans header : aucune authentification vLLM ;
- `HTTP 401` : fournir la vraie clé utilisée au lancement ;
- connexion refusée : ce n'est pas un problème de clé.

Lorsque vLLM n'utilise pas d'authentification mais que l'interface OpenCode exige
une valeur, saisir un placeholder non secret tel que :

```text
local-vllm
```

Le tunnel SSH protège le transport. Éviter d'exposer directement vLLM sur
Internet. La documentation vLLM précise par ailleurs que `--api-key` ne protège
pas tous les endpoints ; tunnel et pare-feu restent la vraie frontière réseau.
Voir les [recommandations de sécurité vLLM](https://docs.vllm.ai/en/stable/usage/security/).

## 7. Enregistrer le credential dans OpenCode

Lancer OpenCode :

```bash
opencode
```

Dans l'interface :

```text
/connect
→ Other
→ provider id : vllm
→ API key : local-vllm, ou la vraie clé si vLLM en impose une
```

Point important : `/connect` enregistre seulement le credential. Il ne crée pas
automatiquement le provider personnalisé dans `opencode.json`. La
[documentation des providers OpenCode](https://opencode.ai/docs/providers)
demande bien ces deux étapes séparées.

Vérifier la présence du credential sans afficher sa valeur :

```bash
opencode auth list
```

## 8. Créer manuellement `opencode.json`

À la racine du projet qui utilisera vLLM, créer `opencode.json` :

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "vllm": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "vLLM distant via SSH",
      "options": {
        "baseURL": "http://127.0.0.1:9000/v1"
      },
      "models": {
        "ORGANISATION/MODELE": {
          "name": "Modèle vLLM distant",
          "limit": {
            "context": 32768,
            "output": 8192
          }
        }
      }
    }
  },
  "model": "vllm/ORGANISATION/MODELE",
  "small_model": "vllm/ORGANISATION/MODELE"
}
```

Remplacer `ORGANISATION/MODELE` par la valeur exacte renvoyée par
`GET /v1/models`. Adapter `context` à la valeur réellement servie par vLLM,
notamment à son `--max-model-len`. Ne pas annoncer la limite théorique de la
model card si le serveur a été lancé avec une limite inférieure.

Pour l'installation validée lors de la rédaction, l'identifiant était
`Qwen/Qwen3.8-27B` et le serveur annonçait un contexte de `262144` tokens.

Ne pas mettre une vraie clé dans ce fichier. OpenCode la conserve séparément
après `/connect`.

## 9. Vérifier la configuration OpenCode

Depuis la racine du projet :

```bash
opencode debug config
```

Vérifier particulièrement :

- `baseURL` vaut `http://127.0.0.1:9000/v1` ;
- le modèle par défaut correspond exactement au modèle servi ;
- aucun ancien endpoint ou ancien modèle global ne remplace le choix du projet.

Lister les modèles du provider :

```bash
opencode models vllm
```

## 10. Lancer OpenCode avec le bon modèle

Si `model` est défini dans `opencode.json` :

```bash
cd <chemin-du-projet>
opencode
```

Pour forcer explicitement le modèle :

```bash
opencode . --model "vllm/ORGANISATION/MODELE"
```

Pour un test non interactif :

```bash
opencode run \
  --model "vllm/ORGANISATION/MODELE" \
  "Réponds exactement par OK"
```

Dans l'interface, `/models` permet de vérifier ou changer le modèle actif.

## 11. Tool calling

OpenCode a besoin d'appels d'outils fiables pour lire les fichiers, modifier le
code et lancer les tests. Si le chat fonctionne mais que l'agent n'arrive pas à
utiliser ses outils, vérifier le lancement vLLM.

Selon le modèle, il faut généralement :

```text
--enable-auto-tool-choice
--tool-call-parser <parser-compatible-avec-le-modele>
```

Le parser dépend du modèle et de la version de vLLM. Ne pas en choisir un au
hasard. Le modèle doit également disposer d'un chat template compatible.

## 12. Diagnostic rapide

| Symptôme | Cause probable | Vérification |
| --- | --- | --- |
| Le terminal SSH reste silencieux | Tunnel actif, comportement normal de `-N` | Tester `/health` dans un autre terminal |
| `Connection refused` sur le port local | Tunnel absent ou mauvais port local | Vérifier la commande SSH et le port `9000` |
| Le tunnel marche mais vLLM ne répond pas | Mauvais port distant ou serveur arrêté | Tester `127.0.0.1:8000` sur la machine distante |
| `401 Unauthorized` | vLLM a une vraie clé API | Utiliser la clé définie avec `--api-key` |
| OpenCode liste un ancien modèle | Configuration globale fusionnée avec celle du projet | Lire `opencode debug config` |
| `Provider not found` | ID de `/connect` différent de celui de `opencode.json` | Utiliser le même ID, par exemple `vllm` |
| Modèle introuvable | ID différent de `/v1/models` | Copier l'ID exact, casse comprise |
| Le chat marche mais pas les outils | Tool calling vLLM absent ou parser incorrect | Vérifier les options de lancement vLLM |

Une fois ces vérifications passées, garder le tunnel ouvert puis lancer OpenCode
depuis la racine du projet.
