## Obsidian Extended MathJax

This plugin extends the MathJax support in Obsidian with a MathJax preamble file which is loaded at startup. It also enables some additional MathJax extensions (notably `mhchem` and `bussproofs`). 

The preamble is stored in a `preamble.sty` file in the root of the vault.

### Installation 

1. Install 'Extended MathJax' from the Obsidian community plugin browser.
2. Create a `preamble.sty` file in the root of your vault using your choice of text editor.
3. Add your macros to `preamble.sty`

### Changing your preamble

If you make changes to your preamble you will need to run the command "Reload app without saving". This will reload all your Obsidian plugins and your preamble. 

### Example

Look at `examples/stlc` for an example of an obsidian vault using a preamble to define custom macros. 
