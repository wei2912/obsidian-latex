import {
  loadMathJax,
  App,
  Plugin,
  PluginManifest,
  PluginSettingTab,
  Setting,
  Notice,
  normalizePath,
  type SettingDefinitionItem,
} from "obsidian";

interface PluginSettings {
  preamblePath: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
  preamblePath: "preamble.sty",
};

export default class JaxPlugin extends Plugin {
  app: App;
  settings: PluginSettings;

  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
    this.app = app;
    this.settings = DEFAULT_SETTINGS;
  }

  async loadSettings() {
    const data: unknown = await this.loadData();
    const preamblePath =
      typeof data === "object" && data !== null && "preamblePath" in data
        ? data.preamblePath
        : undefined;
    this.settings = {
      preamblePath:
        typeof preamblePath === "string"
          ? preamblePath
          : DEFAULT_SETTINGS.preamblePath,
    };
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async loadPreamble() {
    const preamblePath = normalizePath(this.settings.preamblePath);
    const adapter = this.app.vault.adapter;

    let preamble: string;
    try {
      const file = await adapter.stat(preamblePath);
      if (!file) {
        await adapter.write(preamblePath, "");
        new Notice(
          `Preamble not found; created new file '${this.settings.preamblePath}'.`,
        );
      } else if (file.type !== "file") {
        new Notice(`Error: preamble is not a file`);
        return;
      }
      preamble = await adapter.read(preamblePath);
    } catch (err) {
      new Notice(`Error: preamble could not be accessed`);
      return;
    }

    if (MathJax.tex2chtml == undefined) {
      MathJax.startup.ready = () => {
        MathJax.startup.defaultReady();
        MathJax.tex2chtml(preamble);
      };
    } else {
      MathJax.tex2chtml(preamble);
    }
  }

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new JaxPluginSettingTab(this.app, this));

    // Load MathJax so that we can modify it
    // Otherwise, it would not be loaded when this plugin is loaded
    await loadMathJax();

    if (!MathJax) {
      console.warn("MathJax was not defined despite loading it.");
      return;
    }

    await this.loadPreamble();
  }
}

class JaxPluginSettingTab extends PluginSettingTab {
  plugin: JaxPlugin;

  constructor(app: App, plugin: JaxPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  getSettingDefinitions(): SettingDefinitionItem<keyof PluginSettings>[] {
    return [
      {
        name: "Preamble path",
        desc: "Path to global preamble. (Requires reload!)",
        control: { type: "text", key: "preamblePath" },
      },
    ];
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Preamble path")
      .setDesc("Path to global preamble. (Requires reload!)")
      .addText((text) =>
        text
          .setValue(this.plugin.settings.preamblePath)
          .onChange(async (value) => {
            this.plugin.settings.preamblePath = value;
            await this.plugin.saveSettings();
          }),
      );
  }
}
