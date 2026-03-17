/**
 * Funções utilitárias da extensão
 */
/**
 * Obtém configuração da extensão
 */
export declare function getExtensionConfig(key: string): any;
/**
 * Atualiza configuração da extensão
 */
export declare function updateExtensionConfig(key: string, value: any): Promise<void>;
/**
 * Exibe mensagem de informação
 */
export declare function showInfo(message: string): void;
/**
 * Exibe mensagem de erro
 */
export declare function showError(message: string): void;
/**
 * Exibe mensagem de aviso
 */
export declare function showWarning(message: string): void;
/**
 * Verifica se é arquivo C
 */
export declare function isCFile(filePath: string): boolean;
/**
 * Verifica se é arquivo header
 */
export declare function isHeaderFile(filePath: string): boolean;
/**
 * Verifica se é arquivo Bash
 */
export declare function isBashFile(filePath: string): boolean;
/**
 * Obtém nome de função a partir de caminho de arquivo
 */
export declare function getFunctionNameFromFile(filePath: string): string;
/**
 * Converte espaços para tabs
 */
export declare function spacesToTabs(content: string): string;
/**
 * Converte tabs para espaços
 */
export declare function tabsToSpaces(content: string, spaces?: number): string;
/**
 * Remove espaços em branco no final das linhas
 */
export declare function trimTrailingWhitespace(content: string): string;
/**
 * Adiciona newline ao final do arquivo se não tiver
 */
export declare function ensureTrailingNewline(content: string): string;
/**
 * Calcula profundidade de aninhamento
 */
export declare function calculateNestingDepth(content: string): number;
/**
 * Obtém número de linhas
 */
export declare function getLineCount(content: string): number;
/**
 * Obtém comprimento da linha mais longa
 */
export declare function getLongestLineLength(content: string): number;
/**
 * Verifica se linha é muito longa
 */
export declare function isLineTooLong(line: string, maxLength?: number): boolean;
/**
 * Extrai número de linha de mensagem de erro
 */
export declare function extractLineNumber(errorMessage: string): number | null;
/**
 * Extrai coluna de mensagem de erro
 */
export declare function extractColumn(errorMessage: string): number | null;
/**
 * Cria diagrama de progresso visual
 */
export declare function createProgressBar(current: number, total: number, width?: number): string;
/**
 * Formata duração em ms para string legível
 */
export declare function formatDuration(ms: number): string;
/**
 * Aguarda tempo especificado
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Debounce para funções
 */
export declare function debounce(func: (...args: any[]) => void, wait: number): (...args: any[]) => void;
/**
 * Cache simples
 */
export declare class SimpleCache<T> {
    private cache;
    private ttl;
    constructor(ttl?: number);
    set(key: string, value: T): void;
    get(key: string): T | null;
    clear(): void;
    delete(key: string): void;
}
/**
 * Logger da extensão
 */
export declare class Logger {
    private static outputChannel;
    static init(): void;
    static log(message: string): void;
    static error(message: string, error?: Error): void;
    static warn(message: string): void;
    static debug(message: string): void;
    static show(): void;
    static clear(): void;
}
/**
 * Validador de código
 */
export declare class CodeValidator {
    /**
     * Valida nomenclatura de variável global
     */
    static isValidGlobalVarName(name: string): boolean;
    /**
     * Valida nomenclatura de variável estática
     */
    static isValidStaticVarName(name: string): boolean;
    /**
     * Valida nomenclatura de variável extern
     */
    static isValidExternVarName(name: string): boolean;
    /**
     * Valida sufixo de typedef
     */
    static hasValidTypedefSuffix(name: string): boolean;
    /**
     * Valida protótipo de função
     */
    static isValidFunctionPrototype(prototype: string): boolean;
    /**
     * Obtém tipo de erro potencial
     */
    static detectErrorType(line: string): string | null;
}
//# sourceMappingURL=utils.d.ts.map