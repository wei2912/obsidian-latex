import { loadMathJax, Plugin } from 'obsidian';

const DEFAULT_PREAMBLE_PATH = "preamble.sty";

export default class JaxPlugin extends Plugin {
  async read_preamble () {
    return await this.app.vault.adapter.read(DEFAULT_PREAMBLE_PATH);
  }

	async onload() {
    // Load MathJax so that we can modify it
    // Otherwise, it would not be loaded when this plugin is loaded
    await loadMathJax();

    if (!MathJax) {
      console.warn("MathJax was not defined despite loading it.");
      return;
    }

    // Read the preamble out from the file
    let preamble = await this.read_preamble();
    
    if (MathJax.tex2chtml == undefined) {
      MathJax.startup.ready = () => {
        MathJax.startup.defaultReady();
        MathJax.tex2chtml(preamble);
      };
    } else {
      MathJax.tex2chtml(preamble);
    }

    // TODO: Refresh view?
	}

	onunload() {
    // TODO: Is it possible to remove our definitions?
		console.log('Unloading Extended MathJax');
	}
}