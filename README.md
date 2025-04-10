## Obsidian Extended MathJax

This plugin extends the MathJax support in Obsidian with a MathJax preamble file which is loaded at startup. It also enables some additional MathJax extensions (notably `mhchem` and `bussproofs`). 

The preamble is stored in a `preamble.sty` file in the root of the vault.

### Installation 

1. Install 'Extended MathJax' from the Obsidian community plugin browser.
2. Create a `preamble.sty` file in the root of your vault using your choice of text editor. Do not use Obsidian because Obsidian creates `.md` files by default.
3. Add your macros to `preamble.sty`
4. Run the command "Reload app without saving".

### Changing your preamble

If you make changes to your preamble you will need to run the command "Reload app without saving". This will reload all your Obsidian plugins and your preamble. 

### Help, my preamble is not read!

There are two common reasons why your preamble.sty is not read:

1. The `preamble.sty` needs to be present before running "Reload app without saving". If it is not present on startup, the plugin will disable itself and you need to manually enable it again.
2. When creating the file through Obsidian, the file will be called `preamble.sty.md`. Please make sure to create the file with another text editor so that the file extension is correct.

### Example

Look at `examples/stlc` for an example of an obsidian vault using a preamble to define custom macros. 
