import { loadMathJax, App, Plugin, PluginManifest, PluginSettingTab, Setting } from 'obsidian';

declare const MathJax: any;

interface PluginSettings {
  preamblePath: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
  preamblePath: "preamble.sty",
};

// Obsidian >= 1.14 (MathJax 4) maps \usepackage to \require, which fails on
// LaTeX package names like amsmath or xcolor. They were never functional here.
const PACKAGE_REGEX = /\\(?:usepackage|RequirePackage)\s*(?:\[[^\]]*\])?\s*\{[^}]*\}/g;

function stripComment(line: string): string {
  return line.replace(/((?:^|[^\\])(?:\\\\)*)%.*$/, "$1");
}

function braceDepth(line: string, depth: number): number {
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === "\\") i++;
    else if (c === "{") depth++;
    else if (c === "}") depth--;
  }
  return Math.max(depth, 0);
}

// Split the preamble into statements: a new statement starts at a line that
// begins with a control sequence while no braces are open. MathJax 4 refuses
// to expand macros in inputs longer than its maxBuffer (5 KB), and an error in
// one statement would otherwise discard every definition after it.
function splitPreamble(preamble: string): string[] {
  const chunks: string[] = [];
  let current = "";
  let depth = 0;
  for (const rawLine of preamble.replace(PACKAGE_REGEX, "").split(/\r?\n/)) {
    const line = stripComment(rawLine);
    if (depth === 0 && /^\s*\\[a-zA-Z@]/.test(line) && current.trim()) {
      chunks.push(current);
      current = "";
    }
    current += line + "\n";
    depth = braceDepth(line, depth);
  }
  if (current.trim()) chunks.push(current);
  return chunks;
}

function runPreamble(preamble: string) {
  for (const chunk of splitPreamble(preamble)) {
    try {
      const mml: string = MathJax.tex2mml(chunk);
      const error = mml.match(/data-mjx-error="([^"]*)"/);
      if (error) console.warn(`Extended MathJax: error in preamble: ${error[1]}\n${chunk}`);
    } catch (e) {
      console.warn(`Extended MathJax: error in preamble: ${e}\n${chunk}`);
    }
  }
}

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

    if (MathJax.tex2mml == undefined) {
      MathJax.startup.ready = () => {
        MathJax.startup.defaultReady();
        runPreamble(preamble);
      };
    } else {
      runPreamble(preamble);
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
