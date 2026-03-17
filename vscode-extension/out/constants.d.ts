/**
 * Constantes e configurações globais da extensão
 */
export declare const NORMINETTE_RULES: {
    INDENTATION: {
        id: string;
        name: string;
        description: string;
        fixable: boolean;
    };
    LINE_LENGTH: {
        id: string;
        name: string;
        description: string;
        fixable: boolean;
    };
    TRAILING_WHITESPACE: {
        id: string;
        name: string;
        description: string;
        fixable: boolean;
    };
    BLANK_LINES: {
        id: string;
        name: string;
        description: string;
        fixable: boolean;
    };
    GLOBAL_VAR_PREFIX: {
        id: string;
        name: string;
        description: string;
        fixable: boolean;
    };
    STATIC_VAR_PREFIX: {
        id: string;
        name: string;
        description: string;
        fixable: boolean;
    };
    EXTERN_VAR_PREFIX: {
        id: string;
        name: string;
        description: string;
        fixable: boolean;
    };
    STRUCT_SUFFIX: {
        id: string;
        name: string;
        description: string;
        fixable: boolean;
    };
    UNION_SUFFIX: {
        id: string;
        name: string;
        description: string;
        fixable: boolean;
    };
    ENUM_SUFFIX: {
        id: string;
        name: string;
        description: string;
        fixable: boolean;
    };
    FUNCTION_SPACING: {
        id: string;
        name: string;
        description: string;
        fixable: boolean;
    };
    NESTED_FUNCTION_FORBIDDEN: {
        id: string;
        name: string;
        description: string;
        fixable: boolean;
    };
    FUNCTION_DECLARATION: {
        id: string;
        name: string;
        description: string;
        fixable: boolean;
    };
    IF_ELSE_SPACING: {
        id: string;
        name: string;
        description: string;
        fixable: boolean;
    };
    BRACE_PLACEMENT: {
        id: string;
        name: string;
        description: string;
        fixable: boolean;
    };
    NESTING_DEPTH: {
        id: string;
        name: string;
        description: string;
        fixable: boolean;
    };
    INCLUDE_GUARD: {
        id: string;
        name: string;
        description: string;
        fixable: boolean;
    };
    INCLUDE_ORDER: {
        id: string;
        name: string;
        description: string;
        fixable: boolean;
    };
    COMMENT_SPACING: {
        id: string;
        name: string;
        description: string;
        fixable: boolean;
    };
    UNUSED_VARIABLE: {
        id: string;
        name: string;
        description: string;
        fixable: boolean;
    };
    FORBIDDEN_KEYWORD: {
        id: string;
        name: string;
        description: string;
        fixable: boolean;
    };
};
export declare const SEVERITY: {
    readonly ERROR: "error";
    readonly WARNING: "warning";
    readonly INFO: "info";
    readonly HINT: "hint";
};
export declare const ERROR_MESSAGES: {
    readonly INDENTATION_ERROR: "Indentação incorreta: use 4 espaços";
    readonly LINE_TOO_LONG: "Linha com mais de 80 caracteres";
    readonly MISSING_SPACE_AFTER: "Falta espaço após {keyword}";
    readonly UNEXPECTED_SPACE_BEFORE: "Espaço inesperado antes de {char}";
    readonly TRAILING_WHITESPACE: "Espaço em branco no final da linha";
    readonly GLOBAL_VAR_PREFIX: "Variável global deve ter prefixo g_";
    readonly STATIC_VAR_PREFIX: "Variável estática deve ter prefixo s_";
    readonly MISSING_STRUCT_SUFFIX: "Typedef de struct deve terminar com _t";
    readonly FORBIDDEN_KEYWORD: "{keyword} é proibido";
    readonly NESTING_TOO_DEEP: "Profundidade de aninhamento máxima excedida (máx: {max})";
    readonly MISSING_INCLUDE_GUARD: "Header deve ter include guard";
    readonly NO_NEWLINE_EOF: "Arquivo deve terminar com newline";
};
export declare const SUPPORTED_EXTENSIONS: {
    readonly C: ".c";
    readonly HEADER: ".h";
    readonly BASH: ".sh";
    readonly MAKEFILE: "Makefile";
};
export declare const EXTENSION_COMMANDS: {
    readonly OPEN_PANEL: "treinoPro.openPanel";
    readonly LOAD_EXERCISE: "treinoPro.loadExercise";
    readonly RUN_NORMINETTE: "treinoPro.runNorminette";
    readonly COMPILE_AND_TEST: "treinoPro.compileAndTest";
    readonly SUBMIT_EXERCISE: "treinoPro.submitExercise";
    readonly SHOW_HINT: "treinoPro.showHint";
    readonly SYNC_PROGRESS: "treinoPro.syncProgress";
    readonly FIX_NORM_ERRORS: "treinoPro.fixNormErrors";
    readonly QUICK_FIX_ACTION: "treinoPro.quickFixAction";
    readonly COPILOT_FIX: "treinoPro.copilotFix";
    readonly COPILOT_EXPLAIN: "treinoPro.copilotExplain";
};
export declare const DEFAULT_CONFIG: {
    readonly enableNorminnetteFix: true;
    readonly enableCopilotIntegration: true;
    readonly checkMemoryLeaks: true;
    readonly realTimeValidation: true;
    readonly maxLineLength: 80;
    readonly maxNestingDepth: 25;
    readonly showNorminetteOnSave: true;
    readonly autoSave: true;
    readonly workspacePath: "";
    readonly apiEndpoint: "https://treino-pro.vercel.app/api";
};
export declare const TIMEOUTS: {
    readonly COMPILE: 30000;
    readonly VALGRIND: 60000;
    readonly NORMINETTE: 10000;
    readonly MOULINETTE: 120000;
    readonly API_REQUEST: 15000;
};
export declare const PATTERNS: {
    readonly C_FILE: RegExp;
    readonly HEADER_FILE: RegExp;
    readonly BASH_FILE: RegExp;
    readonly MAKEFILE: RegExp;
    readonly GLOBAL_VAR: RegExp;
    readonly STATIC_VAR: RegExp;
    readonly EXTERN_VAR: RegExp;
    readonly TYPEDEF_STRUCT: RegExp;
    readonly INCLUDE_GUARD: RegExp;
    readonly FUNCTION_DEF: RegExp;
    readonly NESTING_DEPTH: RegExp;
};
export declare const CACHE_TTL: {
    readonly FILE_ANALYSIS: 5000;
    readonly EXERCISE_LIST: 300000;
    readonly USER_PROGRESS: 60000;
    readonly DIAGNOSTICS: 2000;
};
export declare const VALIDATION_LIMITS: {
    readonly MAX_LINE_LENGTH: 80;
    readonly MAX_NESTING_DEPTH: 25;
    readonly MAX_FUNCTION_LENGTH: 20;
    readonly MIN_FUNCTION_NAMES: 1;
    readonly MAX_PARAMS: 4;
};
export declare const SUPPORTED_PLATFORMS: {
    readonly LINUX: "linux";
    readonly DARWIN: "darwin";
    readonly WIN32: "win32";
};
export declare const EXPECTED_TOOLS: {
    readonly LINUX: readonly ["gcc", "clang", "valgrind", "norminette"];
    readonly DARWIN: readonly ["gcc", "clang", "valgrind", "norminette"];
    readonly WIN32: readonly ["gcc", "clang"];
};
//# sourceMappingURL=constants.d.ts.map