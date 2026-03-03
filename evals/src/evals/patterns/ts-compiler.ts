import ts from "typescript";
import type { PatternError } from "../../types.js";

/**
 * Lenient compiler options for checking syntax/structure of expert code patterns.
 * Uses noEmit + noResolve to skip needing actual SDK type packages.
 */
const COMPILER_OPTIONS: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ES2022,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  strict: false,
  noEmit: true,
  noResolve: true,
  noLib: true, // Don't require lib files — we only check syntax/structure
  skipLibCheck: true,
  skipDefaultLibCheck: true,
  noImplicitAny: false,
  allowJs: true,
  jsx: ts.JsxEmit.React,
  noUnusedLocals: false,
  noUnusedParameters: false,
};

/**
 * Diagnostic codes to ignore — these are expected in isolated code snippets.
 */
const IGNORED_DIAGNOSTIC_CODES = new Set([
  // Missing modules/types (expected — no node_modules or lib files)
  2307, // Cannot find module
  2304, // Cannot find name
  2580, // Cannot find name 'require'
  2318, // Cannot find global type (Array, Promise, etc.) — noLib mode
  2583, // Cannot find name 'Promise'/'Map'/'Set' — need lib change
  2697, // Async must return Promise — no lib Promise type
  2584, // Cannot find name 'console'/'setTimeout'/etc — no lib dom types
  2552, // Cannot find name (did you mean...?)
  2339, // Property does not exist on type — unresolved types
  2345, // Argument type not assignable — unresolved types
  2322, // Type not assignable — unresolved types
  2315, // Type is not generic — unresolved type definitions
  2314, // Generic type requires type arguments — unresolved generics
  2709, // Cannot use namespace as a type
  2488, // Must have Symbol.iterator — no lib Symbol
  6053, // File not found (lib files)
  // Shorthand properties referencing undeclared variables (common in snippets)
  18004, // No value exists in scope for shorthand property
  // Unused declarations in snippets
  6133, // declared but never used
  6196, // declared but never used (type alias)
  // Module/import quirks
  1259, // Module can only be default-imported
  2792, // Cannot find module (type-only)
  7016, // Could not find declaration file
  2503, // Cannot find namespace
  2686, // UMD global reference
  // Top-level code in snippets
  1375, // await at top level
  1378, // Top-level await needs module
  1208, // File cannot be compiled under isolatedModules
  1431, // for-await needs module
  // Duplicate identifiers in multi-example snippets
  2300, // Duplicate identifier
  2451, // Cannot redeclare block-scoped variable
]);

export interface CompileResult {
  success: boolean;
  errors: PatternError[];
}

/**
 * Compile a TypeScript code snippet in-memory and return any errors.
 * Filters out expected errors from missing imports/modules.
 */
export function compileTypeScript(code: string, filename = "snippet.ts"): CompileResult {
  const sourceFile = ts.createSourceFile(filename, code, ts.ScriptTarget.ES2022, true);

  const host: ts.CompilerHost = {
    getSourceFile: (name) => (name === filename ? sourceFile : undefined),
    getDefaultLibFileName: () => "lib.es2022.d.ts",
    writeFile: () => {},
    getCurrentDirectory: () => "/",
    getCanonicalFileName: (f) => f,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => "\n",
    fileExists: (f) => f === filename,
    readFile: () => undefined,
  };

  const program = ts.createProgram([filename], COMPILER_OPTIONS, host);
  const diagnostics = ts.getPreEmitDiagnostics(program);

  const errors: PatternError[] = diagnostics
    .filter((d) => d.category === ts.DiagnosticCategory.Error)
    .filter((d) => !IGNORED_DIAGNOSTIC_CODES.has(d.code))
    .map((d) => {
      const pos = d.file && d.start !== undefined
        ? d.file.getLineAndCharacterOfPosition(d.start)
        : undefined;
      return {
        message: ts.flattenDiagnosticMessageText(d.messageText, "\n"),
        line: pos ? pos.line + 1 : undefined,
        column: pos ? pos.character + 1 : undefined,
        code: `TS${d.code}`,
      };
    });

  return {
    success: errors.length === 0,
    errors,
  };
}
