"use strict";
/**
 * Funções utilitárias da extensão
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeValidator = exports.Logger = exports.SimpleCache = void 0;
exports.getExtensionConfig = getExtensionConfig;
exports.updateExtensionConfig = updateExtensionConfig;
exports.showInfo = showInfo;
exports.showError = showError;
exports.showWarning = showWarning;
exports.isCFile = isCFile;
exports.isHeaderFile = isHeaderFile;
exports.isBashFile = isBashFile;
exports.getFunctionNameFromFile = getFunctionNameFromFile;
exports.spacesToTabs = spacesToTabs;
exports.tabsToSpaces = tabsToSpaces;
exports.trimTrailingWhitespace = trimTrailingWhitespace;
exports.ensureTrailingNewline = ensureTrailingNewline;
exports.calculateNestingDepth = calculateNestingDepth;
exports.getLineCount = getLineCount;
exports.getLongestLineLength = getLongestLineLength;
exports.isLineTooLong = isLineTooLong;
exports.extractLineNumber = extractLineNumber;
exports.extractColumn = extractColumn;
exports.createProgressBar = createProgressBar;
exports.formatDuration = formatDuration;
exports.sleep = sleep;
exports.debounce = debounce;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const constants_1 = require("./constants");
/**
 * Obtém configuração da extensão
 */
function getExtensionConfig(key) {
    return vscode.workspace.getConfiguration('treinoPro').get(key);
}
/**
 * Atualiza configuração da extensão
 */
async function updateExtensionConfig(key, value) {
    await vscode.workspace.getConfiguration('treinoPro').update(key, value, vscode.ConfigurationTarget.Global);
}
/**
 * Exibe mensagem de informação
 */
function showInfo(message) {
    vscode.window.showInformationMessage(`[Treino Pro] ${message}`);
}
/**
 * Exibe mensagem de erro
 */
function showError(message) {
    vscode.window.showErrorMessage(`[Treino Pro] ${message}`);
}
/**
 * Exibe mensagem de aviso
 */
function showWarning(message) {
    vscode.window.showWarningMessage(`[Treino Pro] ${message}`);
}
/**
 * Verifica se é arquivo C
 */
function isCFile(filePath) {
    return constants_1.PATTERNS.C_FILE.test(filePath);
}
/**
 * Verifica se é arquivo header
 */
function isHeaderFile(filePath) {
    return constants_1.PATTERNS.HEADER_FILE.test(filePath);
}
/**
 * Verifica se é arquivo Bash
 */
function isBashFile(filePath) {
    return constants_1.PATTERNS.BASH_FILE.test(filePath);
}
/**
 * Obtém nome de função a partir de caminho de arquivo
 */
function getFunctionNameFromFile(filePath) {
    return path.basename(filePath, path.extname(filePath));
}
/**
 * Converte espaços para tabs
 */
function spacesToTabs(content) {
    return content.replace(/^    /gm, '\t');
}
/**
 * Converte tabs para espaços
 */
function tabsToSpaces(content, spaces = 4) {
    return content.replace(/\t/g, ' '.repeat(spaces));
}
/**
 * Remove espaços em branco no final das linhas
 */
function trimTrailingWhitespace(content) {
    return content.replace(/[ \t]+$/gm, '');
}
/**
 * Adiciona newline ao final do arquivo se não tiver
 */
function ensureTrailingNewline(content) {
    if (!content.endsWith('\n')) {
        return content + '\n';
    }
    return content;
}
/**
 * Calcula profundidade de aninhamento
 */
function calculateNestingDepth(content) {
    let maxDepth = 0;
    let currentDepth = 0;
    for (const char of content) {
        if (char === '{') {
            currentDepth++;
            maxDepth = Math.max(maxDepth, currentDepth);
        }
        else if (char === '}') {
            currentDepth--;
        }
    }
    return maxDepth;
}
/**
 * Obtém número de linhas
 */
function getLineCount(content) {
    return content.split('\n').length;
}
/**
 * Obtém comprimento da linha mais longa
 */
function getLongestLineLength(content) {
    return content.split('\n').reduce((max, line) => Math.max(max, line.length), 0);
}
/**
 * Verifica se linha é muito longa
 */
function isLineTooLong(line, maxLength = constants_1.VALIDATION_LIMITS.MAX_LINE_LENGTH) {
    return line.length > maxLength;
}
/**
 * Extrai número de linha de mensagem de erro
 */
function extractLineNumber(errorMessage) {
    const match = errorMessage.match(/line (\d+)/i);
    return match ? parseInt(match[1], 10) : null;
}
/**
 * Extrai coluna de mensagem de erro
 */
function extractColumn(errorMessage) {
    const match = errorMessage.match(/column (\d+)/i);
    return match ? parseInt(match[1], 10) : null;
}
/**
 * Cria diagrama de progresso visual
 */
function createProgressBar(current, total, width = 20) {
    const percentage = Math.round((current / total) * 100);
    const filledWidth = Math.round((current / total) * width);
    const emptyWidth = width - filledWidth;
    return `[${'█'.repeat(filledWidth)}${'░'.repeat(emptyWidth)}] ${percentage}%`;
}
/**
 * Formata duração em ms para string legível
 */
function formatDuration(ms) {
    if (ms < 1000) {
        return `${ms}ms`;
    }
    const seconds = (ms / 1000).toFixed(2);
    return `${seconds}s`;
}
/**
 * Aguarda tempo especificado
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Debounce para funções
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
/**
 * Cache simples
 */
class SimpleCache {
    constructor(ttl = 5000) {
        this.cache = new Map();
        this.ttl = ttl;
    }
    set(key, value) {
        this.cache.set(key, { data: value, timestamp: Date.now() });
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        if (Date.now() - entry.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }
        return entry.data;
    }
    clear() {
        this.cache.clear();
    }
    delete(key) {
        this.cache.delete(key);
    }
}
exports.SimpleCache = SimpleCache;
/**
 * Logger da extensão
 */
class Logger {
    static init() {
        if (!this.outputChannel) {
            this.outputChannel = vscode.window.createOutputChannel('Treino Pro');
        }
    }
    static log(message) {
        this.init();
        this.outputChannel?.appendLine(`[INFO] ${new Date().toISOString()} - ${message}`);
    }
    static error(message, error) {
        this.init();
        const errorMsg = error ? `${message}: ${error.message}` : message;
        this.outputChannel?.appendLine(`[ERROR] ${new Date().toISOString()} - ${errorMsg}`);
    }
    static warn(message) {
        this.init();
        this.outputChannel?.appendLine(`[WARN] ${new Date().toISOString()} - ${message}`);
    }
    static debug(message) {
        this.init();
        this.outputChannel?.appendLine(`[DEBUG] ${new Date().toISOString()} - ${message}`);
    }
    static show() {
        this.outputChannel?.show();
    }
    static clear() {
        this.outputChannel?.clear();
    }
}
exports.Logger = Logger;
Logger.outputChannel = null;
/**
 * Validador de código
 */
class CodeValidator {
    /**
     * Valida nomenclatura de variável global
     */
    static isValidGlobalVarName(name) {
        return /^g_[a-z_][a-z0-9_]*$/i.test(name);
    }
    /**
     * Valida nomenclatura de variável estática
     */
    static isValidStaticVarName(name) {
        return /^s_[a-z_][a-z0-9_]*$/i.test(name);
    }
    /**
     * Valida nomenclatura de variável extern
     */
    static isValidExternVarName(name) {
        return /^e_[a-z_][a-z0-9_]*$/i.test(name);
    }
    /**
     * Valida sufixo de typedef
     */
    static hasValidTypedefSuffix(name) {
        return name.endsWith('_t');
    }
    /**
     * Valida protótipo de função
     */
    static isValidFunctionPrototype(prototype) {
        return /^[a-z_*\s]+[a-z_]+\([^)]*\);$/.test(prototype.trim());
    }
    /**
     * Obtém tipo de erro potencial
     */
    static detectErrorType(line) {
        if (/^\t/.test(line)) {
            return 'indentation';
        }
        if (line.length > constants_1.VALIDATION_LIMITS.MAX_LINE_LENGTH) {
            return 'line_too_long';
        }
        if (/\s+$/.test(line)) {
            return 'trailing_whitespace';
        }
        return null;
    }
}
exports.CodeValidator = CodeValidator;
//# sourceMappingURL=utils.js.map