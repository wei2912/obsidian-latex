import {  Notice, Plugin } from 'obsidian';
import { readFileSync } from 'fs';

const DEFAULT_PREAMBLE_PATH = "preamble.sty";

export default class JaxPlugin extends Plugin {
  async reload_preamble() {
      const content = await this.read_preamble();

      if (typeof MathJax != 'undefined') {
          await MathJax.tex2chtmlPromise(content);
      }
  }

  async read_preamble () {
      const file = this.app.vault.getAbstractFileByPath(DEFAULT_PREAMBLE_PATH);
      console.log(`Loading preamble from ${file}`);
      const content = await this.app.vault.read(file);
      return content;
  }

	onload() {
    var omg = this;
    
    var content : String | null = null;

    // Hack to extend the MathJax configuration
    // We need this as plugin initialization is called before MathJax is loaded in Obsidian, 
    // but if we wait until later the math will already have been typeset!
    // We rely on this order of events occuring: layout-change --> plugin loading --> mathjax init --> initial document rendering
    // With this in mind the idea is the following: 
    // - use `layout-change` to capture the preamble at startup (before mathjax).
    // - Use defineProperty to patch the mathjax configuration created after plugin loading by Obsidian.
    // - Render the preamble during mathjax startup
    //
    Object.defineProperty(window, 'MathJax', {
      set(o) {
        o.startup.ready = () => {
          MathJax.startup.defaultReady();

          MathJax.tex2chtml(content);
        }

        delete window.MathJax;
        window.MathJax = o;
      },
      configurable: true,
    });

    this.app.workspace.on('layout-change', () => {
      if (content == null) {
          this.read_preamble().then((c) => content = c);
      }
    });
	}

	onunload() {
		console.log('unloading plugin');
	}
}

