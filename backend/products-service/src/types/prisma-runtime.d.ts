declare module "@prisma/client/runtime/query_compiler_fast_bg.postgresql.js" {
  export function __wbg_set_wasm(exports: unknown): void;

  export class QueryCompiler {
    constructor(options: unknown);
    compile(request: string): never;
    compileBatch(request: string): never;
    free(): void;
  }
}

declare module "@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.js" {
  export const wasm: string;
}
