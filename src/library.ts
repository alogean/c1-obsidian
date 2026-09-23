import { App, TFile, normalizePath, requestUrl } from "obsidian";

export interface LibraryTool {
  id: string;
  title: string;
  category: string;
  summary: string;
  file: string;
}

export interface LibraryIndex {
  version: number;
  tools: LibraryTool[];
}

export interface SyncResult {
  index: LibraryIndex;
  added: LibraryTool[];
}

/** Chemin du fichier local d'un outil, dans le coffre. */
export function toolPath(rootFolder: string, tool: LibraryTool): string {
  const safeTitle = tool.title.replace(/[\\/:*?"<>|#^[\]]/g, "-");
  return normalizePath(`${rootFolder}/Bibliothèque/${safeTitle}.md`);
}

function withFrontmatter(tool: LibraryTool, body: string): string {
  return `---
type: outil
outil: ${tool.id}
categorie: ${tool.category}
source: bibliotheque
---
> [!info] Fiche synchronisée depuis la bibliothèque de ton coach.
> Ne la modifie pas : elle sera remplacée à la prochaine mise à jour. Note tes réflexions dans ton journal.

${body}`;
}

async function ensureFolder(app: App, path: string): Promise<void> {
  if (!app.vault.getAbstractFileByPath(path)) {
    await app.vault.createFolder(path);
  }
}

/** Télécharge l'index et toutes les fiches, et les écrit dans le coffre. */
export async function syncLibrary(
  app: App,
  indexUrl: string,
  rootFolder: string,
  knownIds: string[]
): Promise<SyncResult> {
  const index = (await requestUrl(indexUrl)).json as LibraryIndex;
  if (!index || !Array.isArray(index.tools)) {
    throw new Error("Index de bibliothèque invalide");
  }

  await ensureFolder(app, normalizePath(rootFolder));
  await ensureFolder(app, normalizePath(`${rootFolder}/Bibliothèque`));

  for (const tool of index.tools) {
    const body = (await requestUrl(new URL(tool.file, indexUrl).toString())).text;
    const path = toolPath(rootFolder, tool);
    const content = withFrontmatter(tool, body);
    const existing = app.vault.getAbstractFileByPath(path);
    if (existing instanceof TFile) {
      await app.vault.modify(existing, content);
    } else {
      await app.vault.create(path, content);
    }
  }

  const added = index.tools.filter((t) => !knownIds.includes(t.id));
  return { index, added };
}
