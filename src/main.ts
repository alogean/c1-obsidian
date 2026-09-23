import { Plugin } from "obsidian";
import { openTodayJournal } from "./journal";
import { CoachingSettings, CoachingSettingTab, DEFAULT_SETTINGS } from "./settings";

export default class ArtOfCoachingPlugin extends Plugin {
  settings: CoachingSettings;

  async onload() {
    await this.loadSettings();

    this.addRibbonIcon("sprout", "Journal de coaching du jour", () =>
      openTodayJournal(this.app, this.settings.rootFolder)
    );

    this.addCommand({
      id: "open-today-journal",
      name: "Ouvrir le journal du jour",
      callback: () => openTodayJournal(this.app, this.settings.rootFolder),
    });

    this.addSettingTab(new CoachingSettingTab(this.app, this));
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
