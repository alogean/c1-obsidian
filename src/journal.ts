import { App, TFile, moment, normalizePath } from "obsidian";

const TEMPLATE = (date: string) => `---
type: journal
date: ${date}
---

# Journal du ${date}

## Mon énergie aujourd'hui (1-10)


## Ce qui s'est bien passé


## Ce que j'ai appris sur moi


## Mon engagement pour demain

`;

async function ensureFolder(app: App, path: string): Promise<void> {
  if (!app.vault.getAbstractFileByPath(path)) {
    await app.vault.createFolder(path);
  }
}

/** Ouvre l'entrée de journal du jour, en la créant si besoin. */
export async function openTodayJournal(app: App, rootFolder: string): Promise<void> {
  const date = moment().format("YYYY-MM-DD");
  const folder = normalizePath(`${rootFolder}/Journal`);
  const path = normalizePath(`${folder}/${date}.md`);

  await ensureFolder(app, normalizePath(rootFolder));
  await ensureFolder(app, folder);

  let file = app.vault.getAbstractFileByPath(path);
  if (!(file instanceof TFile)) {
    file = await app.vault.create(path, TEMPLATE(date));
  }
  await app.workspace.getLeaf(false).openFile(file as TFile);
}
