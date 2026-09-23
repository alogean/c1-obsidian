import { App, PluginSettingTab, Setting } from "obsidian";
import type { LibraryIndex } from "./library";
import type ArtOfCoachingPlugin from "./main";

export interface CoachingSettings {
  rootFolder: string;
  libraryUrl: string;
  syncOnStartup: boolean;
  /** Installer CLAUDE.md + skills dans `.claude/` pour Claude Code. */
  installCoachAgent: boolean;
  /** Dernier index synchronisé (cache local, sert aussi hors ligne). */
  library: LibraryIndex | null;
  /** Outils déjà ouverts par le client (pour le badge « Nouveau »). */
  seenToolIds: string[];
}

export const DEFAULT_SETTINGS: CoachingSettings = {
  rootFolder: "Coaching",
  libraryUrl: "https://raw.githubusercontent.com/alogean/c1-obsidian/main/library/index.json",
  syncOnStartup: true,
  installCoachAgent: true,
  library: null,
  seenToolIds: [],
};

export class CoachingSettingTab extends PluginSettingTab {
  constructor(app: App, private plugin: ArtOfCoachingPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Dossier de coaching")
      .setDesc("Dossier du coffre où sont rangés ton journal et tes outils.")
      .addText((text) =>
        text
          .setPlaceholder("Coaching")
          .setValue(this.plugin.settings.rootFolder)
          .onChange(async (value) => {
            this.plugin.settings.rootFolder = value.trim() || DEFAULT_SETTINGS.rootFolder;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Mise à jour au démarrage")
      .setDesc("Récupère automatiquement les nouveaux outils à l'ouverture d'Obsidian.")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.syncOnStartup).onChange(async (value) => {
          this.plugin.settings.syncOnStartup = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Coach IA (Claude Code)")
      .setDesc(
        "Installe dans ce coffre les consignes et exercices de ton coach pour Claude Code " +
          "(dossier caché .claude/). Nécessite ton propre abonnement Claude."
      )
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.installCoachAgent).onChange(async (value) => {
          this.plugin.settings.installCoachAgent = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Adresse de la bibliothèque")
      .setDesc("À ne changer que si ton coach te le demande.")
      .addText((text) =>
        text.setValue(this.plugin.settings.libraryUrl).onChange(async (value) => {
          this.plugin.settings.libraryUrl = value.trim() || DEFAULT_SETTINGS.libraryUrl;
          await this.plugin.saveSettings();
        })
      );
  }
}
