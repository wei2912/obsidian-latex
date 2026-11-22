import { loadMathJax, App, Plugin, PluginManifest, PluginSettingTab, Setting, SettingDefinitionItem } from 'obsidian';
import { setMathJaxGlobal, type MathJaxNormal } from "src/mathjax"

interface PluginSettings {
  preamblePath: string;
  mathjaxConfigPath: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
  preamblePath: "preamble.sty",
  mathjaxConfigPath: "preamble.json",
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
    const MathJax = window.MathJax as MathJaxNormal;
    if (MathJax.tex2chtml === undefined) {
      MathJax.startup.ready = () => {
        MathJax.startup.defaultReady();
        MathJax.tex2chtml(preamble);
      };
    } else {
      MathJax.tex2chtml(preamble);
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as PluginSettings);
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
  
  async loadMathJaxConfig() {
    const config = await this.app.vault.adapter
        .read(this.settings.mathjaxConfigPath)
        .catch(() => null) as string | null;
    if (!config) {
      console.warn(`MathJax config file not found at ${this.settings.mathjaxConfigPath}`);
      return;
    }
    const mathjaxConfig = JSON.parse(config) as Record<string, unknown>;
    setMathJaxGlobal(mathjaxConfig);
  }

  async onload() {
    await this.loadSettings();
    await this.loadMathJaxConfig();
    this.addSettingTab(new JaxPluginSettingTab(this.app, this));

    // Load MathJax so that we can modify it
    // Otherwise, it would not be loaded when this plugin is loaded
    await loadMathJax();

    if (!window.MathJax) {
      console.warn("MathJax was not defined despite loading it.");
      return;
    }

    await this.loadPreamble();
    // TODO: Refresh view?
  }

  onunload() {
    // TODO: Is it possible to remove our definitions?
    console.debug('Unloading Extended MathJax');
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
        control: {
          type: "file",
          key: "preamblePath",
          defaultValue: DEFAULT_SETTINGS.preamblePath,
        }
      },
      {
        name: "MathJax config path",
        desc: "Path to json file that configures MathJax. Extended MathJax needs to be the first item in `<config-path>/community-plugins.json` in order for this to work. (Requires reload!)",
        control: {
          type: "file",
          key: "mathjaxConfigPath",
          defaultValue: DEFAULT_SETTINGS.mathjaxConfigPath,
        }
      }
    ]
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
