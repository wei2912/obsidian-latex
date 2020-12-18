import {  Notice, Plugin } from 'obsidian';

const DEFAULT_PREAMBLE_PATH = "preamble.sty";

export default class JaxPlugin extends Plugin {
  async reload_preamble() {
      const file = this.app.vault.getAbstractFileByPath(DEFAULT_PREAMBLE_PATH);
      console.log(`Loading preamble from ${file}`);
      const content = await this.app.vault.read(file);

      console.log(content);
      console.log(typeof MathJax);
      if (typeof MathJax != 'undefined') {
          console.log("MATH");
          await MathJax.tex2chtmlPromise(content);
      }
  }

	onload() {
    var omg = this;
    // Hack to extend the MathJax configuration
    Object.defineProperty(window, 'MathJax', {
      set(o) {
        console.log(o);
        o.startup.typeset = true;
        o.startup.ready = () => {
          MathJax.startup.getComponents();
          MathJax.startup.makeMethods();

          omg.reload_preamble().then(() => MathJax.config.startup.pageReady()).then(() => MathJax.startup.promiseResolve());

        }
        o.startup.pageReady = () => {
          console.log("FUCK GOD DAMNIT");
          return MathJax.startup.defaultPageReady();
          //return omg.reload_preamble().then(MathJax.typesetPromise(MathJax.config.startup.elements));
        };
        delete window.MathJax;
        window.MathJax = o;
      },
      configurable: true,
    });
	}

	onunload() {
		console.log('unloading plugin');
	}
}

