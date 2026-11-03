import { globalIgnores } from "eslint/config";
import nestjs from "@darraghor/eslint-plugin-nestjs-typed";
import globals from "globals";
import tseslint from "typescript-eslint";
import backendConfig from "./backend/eslint.config.mjs";

const disabledNestRules = Object.fromEntries(
  [...nestjs.configs.flatRecommended, ...nestjs.configs.flatNoSwagger]
    .flatMap((config) => Object.keys(config.rules ?? {}))
    .map((rule) => [rule, "off"]),
);

const config = [
  globalIgnores(["frontend/**", "test/**", "packages/**"]),
  ...backendConfig,
  {
    ...tseslint.configs.disableTypeChecked,
    files: ["e2e/**/*.ts", "playwright*.config.ts"],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
      parserOptions: {
        projectService: false,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...tseslint.configs.disableTypeChecked.rules,
      ...disabledNestRules,
    },
  },
];

export default config;
