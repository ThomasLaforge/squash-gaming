# Installer OpenCode

Ce guide installe le client terminal OpenCode sur macOS, Linux ou Windows. Les
commandes suivent la [documentation officielle OpenCode](https://opencode.ai/docs).

## macOS

La méthode Homebrew recommandée utilise le tap OpenCode, généralement mis à jour
plus vite que la formule communautaire :

```bash
brew install anomalyco/tap/opencode
```

Alternative avec Node.js :

```bash
npm install -g opencode-ai
```

## Linux

Installation officielle :

```bash
curl -fsSL https://opencode.ai/install | bash
```

Alternative avec Node.js :

```bash
npm install -g opencode-ai
```

Sur Arch Linux :

```bash
sudo pacman -S opencode
```

Pour utiliser un modèle distant via SSH sur Ubuntu ou Debian, installer aussi :

```bash
sudo apt update
sudo apt install openssh-client curl jq
```

## Windows avec WSL — recommandé

OpenCode recommande WSL pour la meilleure compatibilité. Installer une
distribution Linux, ouvrir son terminal puis suivre la procédure Linux.

Sur Ubuntu WSL :

```bash
sudo apt update
sudo apt install openssh-client curl jq
curl -fsSL https://opencode.ai/install | bash
```

Les projets placés dans le système de fichiers Linux de WSL donnent généralement
une meilleure expérience que ceux manipulés à travers un montage Windows.

## Windows natif

Avec Chocolatey :

```powershell
choco install opencode
```

Avec Scoop :

```powershell
scoop install opencode
```

Avec Node.js :

```powershell
npm install -g opencode-ai
```

Le tunnel vLLM utilise `ssh.exe`. S'il est absent, installer **OpenSSH Client**
dans les fonctionnalités facultatives de Windows, conformément à la
[documentation Microsoft](https://learn.microsoft.com/windows-server/administration/openssh/openssh_install_firstuse).

## Vérifier l'installation

```bash
opencode --version
```

Puis afficher l'aide :

```bash
opencode --help
```

Pour la connexion à un vLLM distant, poursuivre avec
[Utiliser OpenCode avec un vLLM distant via SSH](opencode-vllm-ssh.md).

