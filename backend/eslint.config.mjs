import eslint from "@eslint/js";
import nestjs from "@darraghor/eslint-plugin-nestjs-typed";
import { globalIgnores } from "eslint/config";
import globals from "globals";
import { join } from "node:path";
import tseslint from "typescript-eslint";

const sourcePattern = join(import.meta.dirname, "*/src/**/*.ts");
const disabledNestTestRules = Object.fromEntries(
  [...nestjs.configs.flatRecommended, ...nestjs.configs.flatNoSwagger]
    .flatMap((config) => Object.keys(config.rules ?? {}))
    .map((rule) => [rule, "off"]),
);

export default tseslint.config(
  globalIgnores(["**/dist/**", "**/node_modules/**", "**/src/generated/**"]),
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  nestjs.configs.flatRecommended,
  nestjs.configs.flatNoSwagger,
  {
    rules: {
      "@typescript-eslint/no-extraneous-class": [
        "error",
        { allowWithDecorator: true },
      ],
      "@darraghor/nestjs-typed/injectable-should-be-provided": [
        "error",
        {
          src: [sourcePattern],
          filterFromPaths: ["dist", "node_modules", ".test.", ".spec."],
        },
      ],
    },
  },
  {
    files: ["**/test/**/*.test.ts"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: false,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: disabledNestTestRules,
  },
);
