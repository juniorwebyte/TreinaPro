"use strict";
/**
 * Constantes e configurações globais da extensão
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXPECTED_TOOLS = exports.SUPPORTED_PLATFORMS = exports.VALIDATION_LIMITS = exports.CACHE_TTL = exports.PATTERNS = exports.TIMEOUTS = exports.DEFAULT_CONFIG = exports.EXTENSION_COMMANDS = exports.SUPPORTED_EXTENSIONS = exports.ERROR_MESSAGES = exports.SEVERITY = exports.NORMINETTE_RULES = void 0;
// Regras de Norminette
exports.NORMINETTE_RULES = {
    // Indentação e espaçamento
    INDENTATION: {
        id: 'indentation',
        name: 'Indentação',
        description: 'Deve usar 4 espaços por nível, nunca tabs',
        fixable: true
    },
    LINE_LENGTH: {
        id: 'line_length',
        name: 'Comprimento de linha',
        description: 'Máximo de 80 caracteres por linha',
        fixable: false
    },
    TRAILING_WHITESPACE: {
        id: 'trailing_whitespace',
        name: 'Espaço em branco no final',
        description: 'Não deve haver espaços no final das linhas',
        fixable: true
    },
    BLANK_LINES: {
        id: 'blank_lines',
        name: 'Linhas em branco',
        description: 'No máximo uma linha em branco consecutiva',
        fixable: true
    },
    // Nomenclatura
    GLOBAL_VAR_PREFIX: {
        id: 'global_var_prefix',
        name: 'Prefixo de variável global',
        description: 'Variáveis globais devem ter prefixo g_',
        fixable: false
    },
    STATIC_VAR_PREFIX: {
        id: 'static_var_prefix',
        name: 'Prefixo de variável estática',
        description: 'Variáveis estáticas devem ter prefixo s_',
        fixable: false
    },
    EXTERN_VAR_PREFIX: {
        id: 'extern_var_prefix',
        name: 'Prefixo de variável extern',
        description: 'Variáveis extern devem ter prefixo e_',
        fixable: false
    },
    STRUCT_SUFFIX: {
        id: 'struct_suffix',
        name: 'Sufixo de struct',
        description: 'Typedef de struct deve terminar com _t',
        fixable: false
    },
    UNION_SUFFIX: {
        id: 'union_suffix',
        name: 'Sufixo de union',
        description: 'Typedef de union deve terminar com _t',
        fixable: false
    },
    ENUM_SUFFIX: {
        id: 'enum_suffix',
        name: 'Sufixo de enum',
        description: 'Typedef de enum deve terminar com _t',
        fixable: false
    },
    // Funções
    FUNCTION_SPACING: {
        id: 'function_spacing',
        name: 'Espaçamento em funções',
        description: 'Deve haver uma linha em branco antes de cada função',
        fixable: true
    },
    NESTED_FUNCTION_FORBIDDEN: {
        id: 'nested_function_forbidden',
        name: 'Função aninhada proibida',
        description: 'Não é permitido funções aninhadas',
        fixable: false
    },
    FUNCTION_DECLARATION: {
        id: 'function_declaration',
        name: 'Declaração de função',
        description: 'Protótipo deve estar em arquivo header ou no início',
        fixable: false
    },
    // Controle de fluxo
    IF_ELSE_SPACING: {
        id: 'if_else_spacing',
        name: 'Espaçamento if/else',
        description: 'Deve haver espaço após if, else, while, for, switch',
        fixable: true
    },
    BRACE_PLACEMENT: {
        id: 'brace_placement',
        name: 'Posicionamento de chaves',
        description: 'Chaves de abertura na mesma linha do if/while/for',
        fixable: true
    },
    NESTING_DEPTH: {
        id: 'nesting_depth',
        name: 'Profundidade de aninhamento',
        description: 'Máximo de 25 níveis de aninhamento',
        fixable: false
    },
    // Headers
    INCLUDE_GUARD: {
        id: 'include_guard',
        name: 'Include guard',
        description: 'Header deve ter #ifndef, #define, #endif',
        fixable: false
    },
    INCLUDE_ORDER: {
        id: 'include_order',
        name: 'Ordem de includes',
        description: 'Includes devem estar no início do arquivo',
        fixable: false
    },
    // Comentários
    COMMENT_SPACING: {
        id: 'comment_spacing',
        name: 'Espaçamento em comentários',
        description: 'Deve haver espaço após //',
        fixable: true
    },
    // Miscellaneous
    UNUSED_VARIABLE: {
        id: 'unused_variable',
        name: 'Variável não usada',
        description: 'Não deve haver variáveis não utilizadas',
        fixable: false
    },
    FORBIDDEN_KEYWORD: {
        id: 'forbidden_keyword',
        name: 'Palavra-chave proibida',
        description: 'Certos keywords não são permitidos (goto, etc)',
        fixable: false
    }
};
// Severidade dos erros
exports.SEVERITY = {
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
    HINT: 'hint'
};
// Mensagens de erro padrão
exports.ERROR_MESSAGES = {
    INDENTATION_ERROR: 'Indentação incorreta: use 4 espaços',
    LINE_TOO_LONG: 'Linha com mais de 80 caracteres',
    MISSING_SPACE_AFTER: 'Falta espaço após {keyword}',
    UNEXPECTED_SPACE_BEFORE: 'Espaço inesperado antes de {char}',
    TRAILING_WHITESPACE: 'Espaço em branco no final da linha',
    GLOBAL_VAR_PREFIX: 'Variável global deve ter prefixo g_',
    STATIC_VAR_PREFIX: 'Variável estática deve ter prefixo s_',
    MISSING_STRUCT_SUFFIX: 'Typedef de struct deve terminar com _t',
    FORBIDDEN_KEYWORD: '{keyword} é proibido',
    NESTING_TOO_DEEP: 'Profundidade de aninhamento máxima excedida (máx: {max})',
    MISSING_INCLUDE_GUARD: 'Header deve ter include guard',
    NO_NEWLINE_EOF: 'Arquivo deve terminar com newline'
};
// Extensões de arquivo suportadas
exports.SUPPORTED_EXTENSIONS = {
    C: '.c',
    HEADER: '.h',
    BASH: '.sh',
    MAKEFILE: 'Makefile'
};
// Comandos da extensão
exports.EXTENSION_COMMANDS = {
    OPEN_PANEL: 'treinoPro.openPanel',
    LOAD_EXERCISE: 'treinoPro.loadExercise',
    RUN_NORMINETTE: 'treinoPro.runNorminette',
    COMPILE_AND_TEST: 'treinoPro.compileAndTest',
    SUBMIT_EXERCISE: 'treinoPro.submitExercise',
    SHOW_HINT: 'treinoPro.showHint',
    SYNC_PROGRESS: 'treinoPro.syncProgress',
    FIX_NORM_ERRORS: 'treinoPro.fixNormErrors',
    QUICK_FIX_ACTION: 'treinoPro.quickFixAction',
    COPILOT_FIX: 'treinoPro.copilotFix',
    COPILOT_EXPLAIN: 'treinoPro.copilotExplain'
};
// Configurações padrão
exports.DEFAULT_CONFIG = {
    enableNorminnetteFix: true,
    enableCopilotIntegration: true,
    checkMemoryLeaks: true,
    realTimeValidation: true,
    maxLineLength: 80,
    maxNestingDepth: 25,
    showNorminetteOnSave: true,
    autoSave: true,
    workspacePath: '',
    apiEndpoint: 'https://treino-pro.vercel.app/api'
};
// Timeouts
exports.TIMEOUTS = {
    COMPILE: 30000,
    VALGRIND: 60000,
    NORMINETTE: 10000,
    MOULINETTE: 120000,
    API_REQUEST: 15000
};
// Regex patterns
exports.PATTERNS = {
    C_FILE: /\.c$/,
    HEADER_FILE: /\.h$/,
    BASH_FILE: /\.sh$/,
    MAKEFILE: /Makefile$/,
    GLOBAL_VAR: /^g_[a-z_]+$/,
    STATIC_VAR: /^s_[a-z_]+$/,
    EXTERN_VAR: /^e_[a-z_]+$/,
    TYPEDEF_STRUCT: /typedef\s+struct\s+\{[\s\S]*?\}\s+(\w+);/,
    INCLUDE_GUARD: /#ifndef\s+(\w+)\s+#define\s+\1\s+[\s\S]*?#endif/,
    FUNCTION_DEF: /^[a-z_]+\s+[a-z_]+\([^)]*\)\s*$/,
    NESTING_DEPTH: /[\{]/g
};
// Cache TTL (em milisegundos)
exports.CACHE_TTL = {
    FILE_ANALYSIS: 5000,
    EXERCISE_LIST: 300000,
    USER_PROGRESS: 60000,
    DIAGNOSTICS: 2000
};
// Limites de validação
exports.VALIDATION_LIMITS = {
    MAX_LINE_LENGTH: 80,
    MAX_NESTING_DEPTH: 25,
    MAX_FUNCTION_LENGTH: 20,
    MIN_FUNCTION_NAMES: 1,
    MAX_PARAMS: 4
};
// Plataformas suportadas
exports.SUPPORTED_PLATFORMS = {
    LINUX: 'linux',
    DARWIN: 'darwin',
    WIN32: 'win32'
};
// Ferramentas esperadas
exports.EXPECTED_TOOLS = {
    LINUX: ['gcc', 'clang', 'valgrind', 'norminette'],
    DARWIN: ['gcc', 'clang', 'valgrind', 'norminette'],
    WIN32: ['gcc', 'clang'] // Valgrind não é essencial no Windows
};
//# sourceMappingURL=constants.js.map