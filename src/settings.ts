import { App, PluginSettingTab, Setting } from "obsidian";
import type ArtOfCoachingPlugin from "./main";

export interface CoachingSettings {
  rootFolder: string;
}

export const DEFAULT_SETTINGS: CoachingSettings = {
  rootFolder: "Coaching",
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
  }
}
