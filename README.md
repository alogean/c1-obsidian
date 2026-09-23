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

## Enrichir la bibliothèque (pour le coach)

La bibliothèque vit dans `library/` et est servie publiquement depuis `main`.

1. Écris la fiche en Markdown dans `library/outils/<id>.md`.
2. Ajoute une entrée dans `library/index.json` (`id` unique et stable, `title`, `category`, `summary`, `file`).
3. Commit + push sur `main`. Les clients la reçoivent au prochain démarrage d'Obsidian (délai de cache GitHub : ~5 min).

⚠️ Tout ce qui est dans `library/` est **public**. Aucune donnée client ici.
