import { defineConfig } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";

export default defineConfig([
  {
    files: ["src/**/*.ts"],
    extends: [obsidianmd.configs.recommended],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.*"],
        },
      },
    },
    rules: {
      // example: turn off a rule from the recommended set
      "obsidianmd/sample-names": "off",
    },
  },
]);
