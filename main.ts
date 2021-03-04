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
    // Remove mathjax script tag
    Array.from(document.getElementsByTagName("script"))
      .filter(s => s.src.includes("math"))[0].remove();

    window.MathJax = {
      tex2chtml: s => console.log(s)
    }
	}

	onunload() {
		console.log('unloading plugin');
	}
}

