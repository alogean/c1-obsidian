# The Art of Coaching — plugin Obsidian

Compagnon quotidien pour les clients coachés : journal, outils et exercices enrichis de séance en séance.

## Développer

```bash
npm install
npm run dev      # rebuild automatique à chaque modification
npm run build    # build de production (main.js)
```

## Tester dans Obsidian

1. Crée un coffre de test (jamais ton coffre perso).
2. Lance `npm install && npm run build`, puis copie `manifest.json`, `main.js` et `styles.css` dans
   `<coffre>/.obsidian/plugins/art-of-coaching/` (ou fais un lien symbolique vers ce dossier).
3. Obsidian → Paramètres → Modules complémentaires → désactive le mode restreint → active **The Art of Coaching**.
4. Clique sur l'icône 🌱 dans la barre latérale, ou `Ctrl/Cmd+P` → « Ouvrir le journal du jour ».

## Fonctionnalités

- [x] v0.1 — Journal du jour (`Coaching/Journal/AAAA-MM-JJ.md`), dossier configurable
- [x] v0.2 — Bibliothèque d'outils : panneau « Mes outils », synchro au démarrage, badge « Nouveau »
- [x] v0.3 — Coach IA : installe `.claude/CLAUDE.md`, les skills et les permissions pour Claude Code

## Enrichir la bibliothèque (pour le coach)

La bibliothèque vit dans `library/` et est servie publiquement depuis `main`.

1. Écris la fiche en Markdown dans `library/outils/<id>.md`.
2. Ajoute une entrée dans `library/index.json` (`id` unique et stable, `title`, `category`, `summary`, `file`).
3. Commit + push sur `main`. Les clients la reçoivent au prochain démarrage d'Obsidian (délai de cache GitHub : ~5 min).

### Le coach IA (`library/agent/`)

- `CLAUDE.md` : la posture et les limites du coach IA (installé en `.claude/CLAUDE.md` dans le coffre).
- `skills/<nom>/SKILL.md` : un exercice guidé par skill ; à déclarer dans `agent.skills` de `index.json`.
- `settings.json` : permissions Claude Code (Bash et accès web interdits).

Chaque séance peut ajouter un skill : c'est ainsi que le coach IA « apprend » ce que vous avez travaillé.

⚠️ Tout ce qui est dans `library/` est **public**. Aucune donnée client ici.

## Pour le client : activer son coach IA

1. Avoir un abonnement **Claude Pro** (ou Max).
2. Installer l'app **Claude Desktop** et se connecter avec son compte.
3. Dans Claude : Paramètres → Confidentialité → désactiver « Aider à améliorer les modèles ».
4. Ouvrir l'onglet **Code** et choisir le dossier de son coffre Obsidian.
5. Écrire par exemple : « Aide-moi à faire le point sur ma semaine ».
