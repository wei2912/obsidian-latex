## Obsidian Extended MathJax

This plugin extends the MathJax support in Obsidian with a MathJax preamble file which is loaded at startup. It also enables some additional MathJax extensions (notably `mhchem` and `bussproofs`). 

The preamble is stored in a `preamble.sty` file in the root of the vault.

### Installation 

1. Install 'Extended MathJax' from the Obsidian community plugin browser or by clicking on this link: [obsidian://show-plugin?id=obsidian-latex](obsidian://show-plugin?id=obsidian-latex).
2. Create a `preamble.sty` file in the root of your vault using your choice of text editor.
3. Add your macros to `preamble.sty`

### Changing your preamble

If you make changes to your preamble you will need to run the command "Reload app without saving". This will reload all your Obsidian plugins and your preamble. 

### Help, my preamble is not read!

There are two common reasons why your preamble is not read:

1. `preamble.sty` needs to be present before running "Reload app without saving". If it is not present on startup, the plugin will disable itself and you need to manually enable it again.
2. Make sure the preamble is indeed named `preamble.sty` (with the correct file extension `.sty`).
   - Within Obsidian, check that the preamble matches the top row and not the bottom row: <img width="322" height="63" alt="image" src="https://github.com/user-attachments/assets/d4fa2ee3-7035-4ecb-aeb9-c4fc46b76547" />
   - Check that your file browser does not hide file extensions (e.g. default behaviour in Windows' File Explorer).

### Example

Look at [`examples/stlc`](https://github.com/wei2912/obsidian-latex/tree/master/examples/stlc) for an example of an obsidian vault using a preamble to define custom macros. 

