/** MathJax methods used by the plugin, provided by Obsidian at runtime. */
declare const MathJax: {
  tex2chtml: (tex: string) => HTMLElement;
  startup: {
    ready: () => void;
    defaultReady: () => void;
  };
};
