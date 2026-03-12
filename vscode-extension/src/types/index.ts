/**
 * Tipos compartilhados da extensão Guia Piscine 42
 */

export interface NormError {
  line: number;
  column: number;
  rule: string;
  message: string;
  severity: 'error' | 'warning';
  suggestion?: string;
  fixable: boolean;
}

export interface CompileError {
  file: string;
  line: number;
  column: number;
  message: string;
  type: 'error' | 'warning';
}

export interface TestResult {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  error?: string;
}

export interface ExerciseTest {
  description: string;
  args?: string[];
  expected: string;
  compareFunction?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  level: number;
  prototype: string;
  description?: string;
  tests: ExerciseTest[];
  hints?: string[];
  keywords?: string[];
}

export interface MoulinetteResult {
  exercise: string;
  passed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: TestResult[];
  memoryLeaks?: {
    hasLeaks: boolean;
    details?: string;
  };
  compilationErrors?: CompileError[];
}

export interface DiagnosticResult {
  file: string;
  normErrors: NormError[];
  compileErrors: CompileError[];
  diagnostics: any[];
}

export interface PlatformInfo {
  platform: 'linux' | 'darwin' | 'win32';
  arch: string;
  gcc?: string;
  clang?: string;
  valgrind?: string;
  norminette?: string;
  wslEnabled?: boolean;
}

export interface CodeAction {
  title: string;
  kind: 'quickfix' | 'refactor' | 'source';
  command: string;
  arguments?: any[];
}

export interface CopilotRequest {
  command: 'fix' | 'explain' | 'optimize';
  code: string;
  error?: NormError;
  context?: string;
}

export interface CopilotResponse {
  response: string;
  suggestions?: string[];
  explanation?: string;
}

export interface ExtensionConfig {
  enableNorminnetteFix: boolean;
  enableCopilotIntegration: boolean;
  checkMemoryLeaks: boolean;
  realTimeValidation: boolean;
  maxLineLength: number;
  maxNestingDepth: number;
  showNorminetteOnSave: boolean;
  autoSave: boolean;
  workspacePath: string;
  apiEndpoint: string;
}

export interface FileAnalysis {
  file: string;
  isValid: boolean;
  errors: NormError[];
  warnings: NormError[];
  suggestions: string[];
  timestamp: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface ValidationOptions {
  checkNorminette: boolean;
  checkCompilation: boolean;
  checkMemoryLeaks: boolean;
  checkIndentation: boolean;
  checkLineLength: boolean;
  checkFunctionNaming: boolean;
  checkVariableNaming: boolean;
  checkHeaderGuards: boolean;
}
