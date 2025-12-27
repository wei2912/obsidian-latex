import { TFile, Notice, loadMathJax, App, Plugin,  PluginManifest, PluginSettingTab, Setting, normalizePath } from 'obsidian';

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

  /*
    try loading this.settings.preamblePath
    might raise an exception if the file does not exists
  */
  async tryloadPreamble() {
    let preamble = await this.app.vault.adapter.read(normalizePath(this.settings.preamblePath));

    if (MathJax.tex2chtml == undefined) {
      MathJax.startup.ready = () => {
        MathJax.startup.defaultReady();
        MathJax.tex2chtml(preamble);
      };
    } else {
      MathJax.tex2chtml(preamble);
    }
  }

  async createPreamble() {
    let file = this.app.vault.getAbstractFileByPath(this.settings.preamblePath);
    if (!file) {
      file = await this.app.vault.create(this.settings.preamblePath, '');
      if (file){
        new Notice(this.settings.preamblePath + " created");
        new Notice("modify it then reload");
        return;
      }else{
        new Notice("error: " + this.settings.preamblePath + " not created");
        return;
      }
    }

    if(!(file instanceof TFile)){
      new Notice(this.settings.preamblePath + " is not a file");
      return;
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

    // we first try to load it
    // if it works it is loaded before everything else -> this is what we want
    try {
      await this.tryloadPreamble();
      // TODO: Refresh view?
    } catch(e) {
      // otherwise we need to do it onlayoutready to create the file
      // see https://forum.obsidian.md/t/getabstractfilebypath-does-not-function-as-expected/75844
      this.app.workspace.onLayoutReady(
        () => {
          this.createPreamble();
        }
      );
    }
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
