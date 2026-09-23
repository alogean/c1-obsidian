import { Notice, Plugin } from "obsidian";
import { openTodayJournal } from "./journal";
import { syncLibrary } from "./library";
import { CoachingSettings, CoachingSettingTab, DEFAULT_SETTINGS } from "./settings";
import { TOOLS_VIEW_TYPE, ToolsView } from "./toolsView";

export default class ArtOfCoachingPlugin extends Plugin {
  settings: CoachingSettings;

  async onload() {
    await this.loadSettings();

    this.registerView(TOOLS_VIEW_TYPE, (leaf) => new ToolsView(leaf, this));

    this.addRibbonIcon("sprout", "Journal de coaching du jour", () =>
      openTodayJournal(this.app, this.settings.rootFolder)
    );
    this.addRibbonIcon("library", "Mes outils de coaching", () => this.openToolsView());

    this.addCommand({
      id: "open-today-journal",
      name: "Ouvrir le journal du jour",
      callback: () => openTodayJournal(this.app, this.settings.rootFolder),
    });
    this.addCommand({
      id: "open-tools",
      name: "Ouvrir mes outils",
      callback: () => this.openToolsView(),
    });
    this.addCommand({
      id: "sync-library",
      name: "Mettre à jour la bibliothèque d'outils",
      callback: () => this.syncLibrary(true),
    });

    this.addSettingTab(new CoachingSettingTab(this.app, this));

    if (this.settings.syncOnStartup) {
      this.app.workspace.onLayoutReady(() => this.syncLibrary(false));
    }
  }

  async openToolsView() {
    let leaf = this.app.workspace.getLeavesOfType(TOOLS_VIEW_TYPE)[0];
    if (!leaf) {
      const right = this.app.workspace.getRightLeaf(false);
      if (!right) return;
      await right.setViewState({ type: TOOLS_VIEW_TYPE, active: true });
      leaf = right;
    }
    this.app.workspace.revealLeaf(leaf);
  }

  /** `verbose` : afficher une notification même s'il n'y a rien de nouveau. */
  async syncLibrary(verbose: boolean) {
    const knownIds = this.settings.library?.tools.map((t) => t.id) ?? [];
    try {
      const { index, added } = await syncLibrary(
        this.app,
        this.settings.libraryUrl,
        this.settings.rootFolder,
        knownIds
      );
      this.settings.library = index;
      await this.saveSettings();
      this.refreshToolsViews();

      if (added.length > 0 && knownIds.length > 0) {
        new Notice(`🌱 ${added.length} nouvel(s) outil(s) : ${added.map((t) => t.title).join(", ")}`);
      } else if (verbose) {
        new Notice(`Bibliothèque à jour (${index.tools.length} outils).`);
      }
    } catch (e) {
      console.error("[art-of-coaching] sync failed", e);
      if (verbose) new Notice("Impossible de mettre à jour la bibliothèque (hors ligne ?).");
    }
  }

  async markToolSeen(id: string) {
    if (this.settings.seenToolIds.includes(id)) return;
    this.settings.seenToolIds.push(id);
    await this.saveSettings();
    this.refreshToolsViews();
  }

  private refreshToolsViews() {
    for (const leaf of this.app.workspace.getLeavesOfType(TOOLS_VIEW_TYPE)) {
      (leaf.view as ToolsView).render();
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
