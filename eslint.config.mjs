import { globalIgnores } from "eslint/config";
import backendConfig from "./backend/eslint.config.mjs";

const config = [
  globalIgnores(["frontend/**", "test/**", "packages/**"]),
  ...backendConfig
];

export default config;
