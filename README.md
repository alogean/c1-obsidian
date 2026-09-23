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
