import { loadMathJax, App, Plugin, PluginManifest, PluginSettingTab, Setting } from 'obsidian';

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

  async loadPreamble() {
    const preamble = await this.app.vault.adapter.read(this.settings.preamblePath);

    if (MathJax.tex2chtml == undefined) {
      MathJax.startup.ready = () => {
        MathJax.startup.defaultReady();
        MathJax.tex2chtml(preamble);
      };
    } else {
      MathJax.tex2chtml(preamble);
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
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
    // TODO: Refresh view?
  }

  onunload() {
    // TODO: Is it possible to remove our definitions?
    console.log('Unloading Extended MathJax');
  }
}

class JaxPluginSettingTab extends PluginSettingTab {
  plugin: JaxPlugin;

  constructor(app: App, plugin: JaxPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName('Preamble path')
      .setDesc('Path to global preamble. (Requires reload!)')
      .addText((text) =>
	text
	  .setValue(this.plugin.settings.preamblePath)
	  .onChange(async (value) => {
            this.plugin.settings.preamblePath = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
