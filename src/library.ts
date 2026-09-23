import { App, TFile, normalizePath, requestUrl } from "obsidian";

export interface LibraryTool {
  id: string;
  title: string;
  category: string;
  summary: string;
  file: string;
}

/** Le « cerveau » du coach IA : fichiers lus par Claude Code dans le coffre. */
export interface LibraryAgent {
  instructions: string;
  settings?: string;
  skills: string[];
}

export interface LibraryIndex {
  version: number;
  tools: LibraryTool[];
  agent?: LibraryAgent;
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
  knownIds: string[],
  installAgent: boolean
): Promise<SyncResult> {
  const index = (await requestUrl(indexUrl)).json as LibraryIndex;
  if (!index || !Array.isArray(index.tools)) {
    throw new Error("Index de bibliothèque invalide");
  }

  await ensureFolder(app, normalizePath(rootFolder));
  await ensureFolder(app, normalizePath(`${rootFolder}/Bibliothèque`));

  for (const tool of index.tools) {
    const body = await fetchText(indexUrl, tool.file);
    const path = toolPath(rootFolder, tool);
    const content = withFrontmatter(tool, body);
    const existing = app.vault.getAbstractFileByPath(path);
    if (existing instanceof TFile) {
      await app.vault.modify(existing, content);
    } else {
      await app.vault.create(path, content);
    }
  }

  if (installAgent && index.agent) {
    await installCoachAgent(app, indexUrl, index.agent);
  }

  const added = index.tools.filter((t) => !knownIds.includes(t.id));
  return { index, added };
}

async function fetchText(indexUrl: string, file: string): Promise<string> {
  return (await requestUrl(new URL(file, indexUrl).toString())).text;
}

async function writeHidden(app: App, path: string, content: string): Promise<void> {
  const adapter = app.vault.adapter;
  const dir = path.substring(0, path.lastIndexOf("/"));
  if (dir && !(await adapter.exists(dir))) {
    await adapter.mkdir(dir);
  }
  await adapter.write(path, content);
}

/**
 * Installe à la racine du coffre les fichiers que Claude Code charge
 * automatiquement : `.claude/CLAUDE.md`, `.claude/settings.json` et
 * `.claude/skills/<nom>/SKILL.md`. Le dossier `.claude` est caché dans Obsidian.
 */
async function installCoachAgent(app: App, indexUrl: string, agent: LibraryAgent): Promise<void> {
  await writeHidden(app, ".claude/CLAUDE.md", await fetchText(indexUrl, agent.instructions));
  if (agent.settings) {
    await writeHidden(app, ".claude/settings.json", await fetchText(indexUrl, agent.settings));
  }
  for (const skill of agent.skills) {
    const body = await fetchText(indexUrl, `agent/skills/${skill}/SKILL.md`);
    await writeHidden(app, `.claude/skills/${skill}/SKILL.md`, body);
  }
}
