import {  Notice, Plugin } from 'obsidian';
import { readFileSync } from 'fs';

const DEFAULT_PREAMBLE_PATH = "preamble.sty";

export default class JaxPlugin extends Plugin {
  async read_preamble () {
      const file = this.app.vault.getAbstractFileByPath(DEFAULT_PREAMBLE_PATH);
      console.log(`Loading preamble from ${file}`);
      const content = await this.app.vault.read(file);
      return content;
  }

	onload() {
    var preludeLoaded = false;

    this.registerMarkdownPostProcessor((el, ctx) => {
      if (typeof MathJax != 'undefined' && !preludeLoaded) {
          this.read_preamble().then((c) => {
            preludeLoaded = true;

            // Check if MathJax has already loaded and render the preamble
            if (MathJax.tex2chtml == undefined) {
              MathJax.startup.ready = () => {
                MathJax.startup.defaultReady();
                MathJax.tex2chtml(c);
              }
            } else {
              MathJax.tex2chtml(c);
            }

            // Refresh the active view to re-render its math content
            let activeLeaf = window.app.workspace.activeLeaf;
            let preview = activeLeaf.view.previewMode;
            preview.set(preview.get(), true)
          });
      }

    })
	}

	onunload() {
		console.log('Unloading Extended MathJax');
	}
}

