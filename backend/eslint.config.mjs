import eslint from "@eslint/js";
import nestjs from "@darraghor/eslint-plugin-nestjs-typed";
import { globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

const sourcePattern = process.cwd().includes("/backend/") ? "src/**/*.ts" : "backend/*/src/**/*.ts";

export default tseslint.config(
  globalIgnores(["**/dist/**", "**/node_modules/**"]),
  {
    files: ["**/*.ts"],
    extends: [eslint.configs.recommended, ...tseslint.configs.strictTypeChecked, ...tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    }
  },
  nestjs.configs.flatRecommended,
  nestjs.configs.flatNoSwagger,
  {
    rules: {
      "@typescript-eslint/no-extraneous-class": ["error", { allowWithDecorator: true }],
      "@darraghor/nestjs-typed/injectable-should-be-provided": ["error", { src: [sourcePattern], filterFromPaths: ["dist", "node_modules", ".test.", ".spec."] }]
    }
  }
);
