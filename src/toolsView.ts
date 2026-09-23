import { ItemView, TFile, WorkspaceLeaf } from "obsidian";
import { toolPath } from "./library";
import type ArtOfCoachingPlugin from "./main";

export const TOOLS_VIEW_TYPE = "art-of-coaching-tools";

export class ToolsView extends ItemView {
  constructor(leaf: WorkspaceLeaf, private plugin: ArtOfCoachingPlugin) {
    super(leaf);
  }

  getViewType(): string {
    return TOOLS_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Mes outils";
  }

  getIcon(): string {
    return "library";
  }

  async onOpen(): Promise<void> {
    this.render();
  }

  render(): void {
    const container = this.contentEl;
    container.empty();
    container.addClass("aoc-tools");

    const header = container.createDiv({ cls: "aoc-tools-header" });
    header.createEl("h4", { text: "Mes outils" });
    const syncBtn = header.createEl("button", { text: "Mettre à jour" });
    syncBtn.onclick = async () => {
      syncBtn.disabled = true;
      await this.plugin.syncLibrary(true);
      syncBtn.disabled = false;
    };

    const { library, seenToolIds } = this.plugin.settings;
    if (!library || library.tools.length === 0) {
      container.createEl("p", {
        cls: "aoc-tools-empty",
        text: "Aucun outil pour l'instant. Clique sur « Mettre à jour ».",
      });
      return;
    }

    const byCategory = new Map<string, typeof library.tools>();
    for (const tool of library.tools) {
      const list = byCategory.get(tool.category) ?? [];
      list.push(tool);
      byCategory.set(tool.category, list);
    }

    for (const [category, tools] of byCategory) {
      container.createEl("h5", { text: category, cls: "aoc-tools-category" });
      for (const tool of tools) {
        const item = container.createDiv({ cls: "aoc-tool" });
        const title = item.createDiv({ cls: "aoc-tool-title", text: tool.title });
        if (!seenToolIds.includes(tool.id)) {
          title.createSpan({ cls: "aoc-tool-new", text: "Nouveau" });
        }
        item.createDiv({ cls: "aoc-tool-summary", text: tool.summary });
        item.onclick = async () => {
          const file = this.app.vault.getAbstractFileByPath(
            toolPath(this.plugin.settings.rootFolder, tool)
          );
          if (file instanceof TFile) {
            await this.app.workspace.getLeaf(false).openFile(file);
          }
          await this.plugin.markToolSeen(tool.id);
        };
      }
    }
  }
}
