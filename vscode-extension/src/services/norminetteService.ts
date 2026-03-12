import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getPlatformService } from './platformService';

const execAsync = promisify(exec);

// ============================================================================
// NORMINETTE SERVICE - Verificacao completa das regras da 42 (v3.3.55+)
// ============================================================================

export interface NorminetteResult {
    success: boolean;
    output: string;
    errorCount: number;
    warningCount: number;
    errors: NormError[];
}

export interface NormError {
    line: number;
    column: number;
    code: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
    rule: string;
    quickFix?: QuickFixInfo;
}

export interface QuickFixInfo {
    type: 'replace' | 'insert' | 'delete';
    range?: { start: number; end: number };
    newText?: string;
    description: string;
}

// Todas as regras da Norminette v3 da 42 - COMPLETAS
export const NORM_RULES: Record<string, { message: string; severity: 'error' | 'warning'; fixable: boolean }> = {
    // === REGRAS DE ARQUIVO E HEADER ===
    HEADER_MISSING: { message: 'Header 42 obrigatorio ausente', severity: 'error', fixable: true },
    INVALID_HEADER: { message: 'Header 42 com formato invalido', severity: 'error', fixable: true },
    WRONG_FILE_EXT: { message: 'Extensao de arquivo incorreta (deve ser .c ou .h)', severity: 'error', fixable: false },
    WRONG_HEADER_FILE: { message: 'Nome do arquivo no header nao corresponde', severity: 'warning', fixable: true },
    
    // === REGRAS DE INDENTACAO ===
    SPACE_INDENT: { message: 'Use tabs em vez de espacos para indentacao', severity: 'error', fixable: true },
    MIXED_INDENT: { message: 'Mistura de tabs e espacos na indentacao', severity: 'error', fixable: true },
    WRONG_INDENT_LEVEL: { message: 'Nivel de indentacao incorreto', severity: 'error', fixable: true },
    TAB_INSTEAD_SPC: { message: 'Tab usado onde espaco e esperado', severity: 'error', fixable: true },
    
    // === REGRAS DE ESPACAMENTO ===
    SPC_BEFORE_NL: { message: 'Espaco(s) antes de nova linha (trailing whitespace)', severity: 'error', fixable: true },
    SPC_AFTER_PAR: { message: 'Espaco apos parentese de abertura', severity: 'error', fixable: true },
    SPC_BFR_PAR: { message: 'Espaco antes de parentese de fechamento', severity: 'error', fixable: true },
    NO_SPC_AFR_PAR: { message: 'Espaco faltando apos parentese', severity: 'error', fixable: true },
    NO_SPC_BFR_PAR: { message: 'Espaco faltando antes de parentese', severity: 'error', fixable: true },
    SPC_AFTER_COMMA: { message: 'Espaco faltando apos virgula', severity: 'error', fixable: true },
    SPC_BEFORE_COMMA: { message: 'Espaco antes de virgula', severity: 'error', fixable: true },
    NO_SPC_AFR_OPR: { message: 'Espaco faltando apos operador', severity: 'error', fixable: true },
    NO_SPC_BFR_OPR: { message: 'Espaco faltando antes de operador', severity: 'error', fixable: true },
    SPC_AFTER_POINTER: { message: 'Espaco invalido apos asterisco de ponteiro', severity: 'error', fixable: true },
    SPC_BEFORE_POINTER: { message: 'Espaco faltando antes de asterisco de ponteiro', severity: 'error', fixable: true },
    MULT_SPC: { message: 'Multiplos espacos consecutivos', severity: 'error', fixable: true },
    NO_SPC_AFT_UNARY: { message: 'Espaco incorreto apos operador unario', severity: 'error', fixable: true },
    SPC_AFT_UNARY: { message: 'Espaco incorreto apos operador unario', severity: 'error', fixable: true },
    
    // === REGRAS DE LINHA ===
    LINE_TOO_LONG: { message: 'Linha excede 80 caracteres', severity: 'error', fixable: false },
    EMPTY_LINE_FUNCTION: { message: 'Linha vazia no inicio/fim de funcao', severity: 'error', fixable: true },
    EMPTY_LINE_FILE_START: { message: 'Linha vazia no inicio do arquivo', severity: 'error', fixable: true },
    EMPTY_LINE_FILE_END: { message: 'Linha vazia no final do arquivo', severity: 'error', fixable: true },
    MULT_EMPTY_LINE: { message: 'Multiplas linhas vazias consecutivas', severity: 'error', fixable: true },
    NL_AT_EOF: { message: 'Linha extra no final do arquivo', severity: 'error', fixable: true },
    NO_NL_AT_EOF: { message: 'Faltando nova linha no final do arquivo', severity: 'error', fixable: true },
    
    // === REGRAS DE FUNCAO ===
    TOO_MANY_FUNCS: { message: 'Arquivo com mais de 5 funcoes (maximo permitido)', severity: 'error', fixable: false },
    FUNC_TOO_LONG: { message: 'Funcao com mais de 25 linhas', severity: 'error', fixable: false },
    TOO_MANY_ARGS: { message: 'Funcao com mais de 4 argumentos', severity: 'error', fixable: false },
    TOO_MANY_VARS: { message: 'Mais de 5 variaveis declaradas na funcao', severity: 'error', fixable: false },
    DECL_AFTER_STMT: { message: 'Declaracao de variavel apos instrucao', severity: 'error', fixable: false },
    BRACE_NEWLINE: { message: 'Chave de abertura deve estar em nova linha', severity: 'error', fixable: true },
    BRACE_SHOULD_EOL: { message: 'Chave deve ser no final da linha', severity: 'error', fixable: true },
    RETURN_PARENTHESES: { message: 'Return deve ter parenteses: return (valor);', severity: 'error', fixable: true },
    MISSING_VOID_PARAM: { message: 'Funcao sem parametros deve usar (void)', severity: 'error', fixable: true },
    WRONG_SCOPE_COMMENT: { message: 'Comentario dentro de funcao nao permitido', severity: 'warning', fixable: false },
    MULT_ASSIGN_LINE: { message: 'Multiplas atribuicoes na mesma linha', severity: 'error', fixable: false },
    
    // === REGRAS DE DECLARACAO ===
    VAR_DECL_START_FUNC: { message: 'Variaveis devem ser declaradas no inicio da funcao', severity: 'error', fixable: false },
    MULT_DECL_LINE: { message: 'Multiplas declaracoes na mesma linha', severity: 'error', fixable: false },
    DECL_ASSIGN: { message: 'Declaracao com atribuicao nao permitida (exceto static/const)', severity: 'error', fixable: false },
    GLOBAL_VAR_DETECTED: { message: 'Variavel global detectada (nao permitido)', severity: 'error', fixable: false },
    STATIC_VAR_OUTSIDE: { message: 'Variavel static fora de funcao', severity: 'warning', fixable: false },
    
    // === REGRAS DE NAMING CONVENTION (42 Norm) ===
    STRUCT_PREFIX: { message: 'Struct deve usar prefixo s_ (ex: s_nome)', severity: 'error', fixable: false },
    ENUM_PREFIX: { message: 'Enum deve usar prefixo e_ (ex: e_nome)', severity: 'error', fixable: false },
    UNION_PREFIX: { message: 'Union deve usar prefixo u_ (ex: u_nome)', severity: 'error', fixable: false },
    TYPEDEF_SUFFIX: { message: 'Typedef deve usar sufixo _t (ex: t_nome)', severity: 'error', fixable: false },
    GLOBAL_PREFIX: { message: 'Variavel global deve usar prefixo g_ (ex: g_nome)', severity: 'error', fixable: false },
    MACRO_CASE: { message: 'Macro/Define deve ser em MAIUSCULAS', severity: 'error', fixable: false },
    SNAKE_CASE: { message: 'Identificadores devem usar snake_case', severity: 'warning', fixable: false },
    
    // === REGRAS DE COMENTARIOS ===
    COMMENT_ON_INSTR: { message: 'Comentario na mesma linha de instrucao', severity: 'error', fixable: false },
    MULT_LINE_COMMENT: { message: 'Comentario de multiplas linhas /* */ nao recomendado', severity: 'warning', fixable: false },
    COMMENT_LINE_START: { message: 'Comentario // deve comecar no inicio da linha', severity: 'warning', fixable: false },
    CPP_COMMENT: { message: 'Comentario estilo C++ (//) detectado - use /* */', severity: 'warning', fixable: true },
    
    // === REGRAS DE CONTROLE DE FLUXO ===
    NESTED_TOO_DEEP: { message: 'Aninhamento muito profundo (maximo 3 niveis)', severity: 'error', fixable: false },
    NO_SPACE_KEYWORD: { message: 'Espaco faltando apos palavra-chave', severity: 'error', fixable: true },
    SPACE_AFTER_KW: { message: 'Espaco obrigatorio apos if/while/for/return', severity: 'error', fixable: true },
    MISSING_BRACES: { message: 'Bloco de codigo sem chaves', severity: 'warning', fixable: true },
    
    // === REGRAS DE OPERADORES ===
    INC_DEC_IN_EXPR: { message: 'Incremento/decremento dentro de expressao complexa', severity: 'error', fixable: false },
    TERNARY_FBIDDEN: { message: 'Operador ternario nao permitido', severity: 'error', fixable: false },
    COMMA_IN_EXPR: { message: 'Operador virgula em expressao nao permitido', severity: 'error', fixable: false },
    
    // === REGRAS DE PREPROCESSADOR ===
    PREPROC_BAD_INDENT: { message: 'Diretiva de preprocessador mal indentada', severity: 'error', fixable: true },
    PREPROC_CONSTANT: { message: 'Define deve ser constante em MAIUSCULAS', severity: 'error', fixable: false },
    INCLUDE_GUARD: { message: 'Header deve ter include guard', severity: 'error', fixable: true },
    INCLUDE_GUARD_NAME: { message: 'Include guard com nome incorreto', severity: 'warning', fixable: true },
    INCLUDE_ORDER: { message: 'Includes devem estar em ordem (sistema antes de locais)', severity: 'warning', fixable: false },
    
    // === REGRAS PROIBIDAS ===
    VLA_FORBIDDEN: { message: 'Variable Length Arrays nao permitidos', severity: 'error', fixable: false },
    FOR_FORBIDDEN: { message: 'Loop for com multiplas expressoes proibido', severity: 'error', fixable: false },
    GOTO_FBIDDEN: { message: 'goto nao permitido', severity: 'error', fixable: false },
    BITWISE_IN_COND: { message: 'Operador bitwise em condicao nao permitido', severity: 'error', fixable: false },
    SWITCH_FALLTHROUGH: { message: 'Fallthrough em switch sem break/return', severity: 'warning', fixable: false },
    
    // === OUTRAS REGRAS ===
    INVALID_CHAR: { message: 'Caractere invalido no arquivo', severity: 'error', fixable: false },
    CONSECUTIVE_OPS: { message: 'Operadores consecutivos', severity: 'error', fixable: false },
    LABEL_NOT_ALLOWED: { message: 'Label nao permitido', severity: 'error', fixable: false },
    WRONG_SCOPE_VAR: { message: 'Variavel declarada fora do escopo correto', severity: 'error', fixable: false },
};

export class NorminetteService {
    private diagnosticCollection: vscode.DiagnosticCollection;
    private statusBarItem: vscode.StatusBarItem;
    private outputChannel: vscode.OutputChannel;
    private useOfficial: boolean = true;

    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('norminette');
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.statusBarItem.text = '$(check) Norminette';
        this.statusBarItem.tooltip = 'Status da Norminette';
        this.outputChannel = vscode.window.createOutputChannel('Guia Piscine - Norminette');
    }

    async check(filePath: string): Promise<NorminetteResult> {
        this.statusBarItem.text = '$(sync~spin) Norminette...';
        this.statusBarItem.show();

        try {
            // Verificar se norminette oficial esta disponivel
            const platformService = getPlatformService();
            if (platformService.isToolAvailable('norminette') && this.useOfficial) {
                const result = await this.checkWithOfficialNorminette(filePath);
                if (result) {
                    this.updateStatusBar(result);
                    return result;
                }
            }
        } catch {
            // Norminette nao instalada, usa verificacao local
        }

        // Fallback para verificacao local completa
        const result = await this.checkLocal(filePath);
        this.updateStatusBar(result);
        return result;
    }

    private async checkWithOfficialNorminette(filePath: string): Promise<NorminetteResult | null> {
        try {
            const platformService = getPlatformService();
            const cmd = platformService.getNorminetteCommand(filePath);
            
            const { stdout, stderr } = await execAsync(cmd, {
                timeout: 30000
            });
            
            const output = stdout || stderr;
            const errors = this.parseNorminetteOutput(output);
            
            return {
                success: errors.filter(e => e.severity === 'error').length === 0,
                output,
                errorCount: errors.filter(e => e.severity === 'error').length,
                warningCount: errors.filter(e => e.severity === 'warning').length,
                errors
            };
        } catch {
            return null;
        }
    }

    private parseNorminetteOutput(output: string): NormError[] {
        const errors: NormError[] = [];
        const lines = output.split('\n');

        for (const line of lines) {
            // Formato: Error/Warning: RULE_NAME (line: X, col: Y): message
            const match = line.match(/(Error|Warning|Notice):\s*(\w+)\s*\(line:\s*(\d+),?\s*col:\s*(\d+)\)?:?\s*(.*)?/i);
            if (match) {
                const severityInput = match[1].toLowerCase();
                const code = match[2];
                const ruleInfo = NORM_RULES[code];
                
                const severity: 'error' | 'warning' | 'info' = 
                    severityInput === 'error' ? 'error' : 
                    severityInput === 'warning' ? 'warning' : 'info';
                
                errors.push({
                    line: parseInt(match[3]),
                    column: parseInt(match[4]) || 1,
                    code,
                    message: ruleInfo?.message || match[5] || code,
                    severity,
                    rule: code,
                    quickFix: ruleInfo?.fixable ? this.getQuickFixForRule(code) : undefined
                });
            }
        }

        return errors;
    }

    private getQuickFixForRule(rule: string): QuickFixInfo | undefined {
        const fixes: Record<string, QuickFixInfo> = {
            SPC_BEFORE_NL: { type: 'replace', description: 'Remover espacos no final da linha' },
            SPACE_INDENT: { type: 'replace', description: 'Converter espacos para tabs' },
            MIXED_INDENT: { type: 'replace', description: 'Uniformizar indentacao com tabs' },
            RETURN_PARENTHESES: { type: 'replace', description: 'Adicionar parenteses ao return' },
            MISSING_VOID_PARAM: { type: 'replace', description: 'Adicionar (void) aos parametros' },
            NO_NL_AT_EOF: { type: 'insert', description: 'Adicionar nova linha no final' },
            MULT_EMPTY_LINE: { type: 'delete', description: 'Remover linhas vazias extras' },
            SPC_AFTER_COMMA: { type: 'insert', newText: ' ', description: 'Adicionar espaco apos virgula' },
            SPACE_AFTER_KW: { type: 'insert', newText: ' ', description: 'Adicionar espaco apos keyword' },
            CPP_COMMENT: { type: 'replace', description: 'Converter // para /* */' },
            INCLUDE_GUARD: { type: 'insert', description: 'Adicionar include guard' },
        };
        
        return fixes[rule];
    }

    async checkLocal(filePath: string): Promise<NorminetteResult> {
        const document = await vscode.workspace.openTextDocument(filePath);
        const content = document.getText();
        const lines = content.split('\n');
        const errors: NormError[] = [];
        
        // Estado para analise
        let inFunction = false;
        let functionLines = 0;
        let functionCount = 0;
        let braceDepth = 0;
        let varDeclarationsDone = false;
        let varCount = 0;
        let lastLineEmpty = false;
        let inMultiLineComment = false;
        let inStruct = false;
        let inEnum = false;
        let inUnion = false;

        // Verificar header da 42
        if (!this.checkHeader42(content, lines)) {
            errors.push({
                line: 1, column: 1, code: 'HEADER_MISSING',
                message: NORM_RULES.HEADER_MISSING.message,
                severity: 'error', rule: 'HEADER_MISSING',
                quickFix: { type: 'insert', description: 'Adicionar header 42' }
            });
        }

        // Verificar include guard em arquivos .h
        if (filePath.endsWith('.h')) {
            if (!this.checkIncludeGuard(content)) {
                errors.push({
                    line: 1, column: 1, code: 'INCLUDE_GUARD',
                    message: NORM_RULES.INCLUDE_GUARD.message,
                    severity: 'error', rule: 'INCLUDE_GUARD',
                    quickFix: { type: 'insert', description: 'Adicionar include guard' }
                });
            }
        }

        // Verificar linha por linha
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNum = i + 1;
            const trimmedLine = line.trim();

            // Ignorar linhas dentro de comentarios multi-linha
            if (inMultiLineComment) {
                if (line.includes('*/')) {
                    inMultiLineComment = false;
                }
                continue;
            }
            if (line.includes('/*') && !line.includes('*/')) {
                inMultiLineComment = true;
            }

            // === REGRAS DE LINHA ===

            // Linha muito longa (max 80 chars)
            if (line.length > 80) {
                errors.push({
                    line: lineNum, column: 81, code: 'LINE_TOO_LONG',
                    message: `${NORM_RULES.LINE_TOO_LONG.message} (${line.length} caracteres)`,
                    severity: 'error', rule: 'LINE_TOO_LONG'
                });
            }

            // Espacos no final da linha (trailing whitespace)
            const trailingMatch = line.match(/(\s+)$/);
            if (trailingMatch && line.length > 0) {
                errors.push({
                    line: lineNum, column: line.length - trailingMatch[1].length + 1,
                    code: 'SPC_BEFORE_NL', message: NORM_RULES.SPC_BEFORE_NL.message,
                    severity: 'error', rule: 'SPC_BEFORE_NL',
                    quickFix: { type: 'replace', description: 'Remover espacos' }
                });
            }

            // === REGRAS DE INDENTACAO ===

            // Espacos usados para indentacao (deve ser tabs)
            const indentMatch = line.match(/^(\s+)/);
            if (indentMatch) {
                const indent = indentMatch[1];
                if (indent.includes(' ') && !indent.startsWith('\t')) {
                    errors.push({
                        line: lineNum, column: 1, code: 'SPACE_INDENT',
                        message: NORM_RULES.SPACE_INDENT.message,
                        severity: 'error', rule: 'SPACE_INDENT',
                        quickFix: { type: 'replace', description: 'Converter para tabs' }
                    });
                }
                // Mistura de tabs e espacos
                if (/\t /.test(indent) || / \t/.test(indent)) {
                    errors.push({
                        line: lineNum, column: 1, code: 'MIXED_INDENT',
                        message: NORM_RULES.MIXED_INDENT.message,
                        severity: 'error', rule: 'MIXED_INDENT',
                        quickFix: { type: 'replace', description: 'Uniformizar indentacao' }
                    });
                }
            }

            // === REGRAS DE LINHAS VAZIAS ===

            if (trimmedLine === '') {
                if (lastLineEmpty) {
                    errors.push({
                        line: lineNum, column: 1, code: 'MULT_EMPTY_LINE',
                        message: NORM_RULES.MULT_EMPTY_LINE.message,
                        severity: 'error', rule: 'MULT_EMPTY_LINE',
                        quickFix: { type: 'delete', description: 'Remover linha extra' }
                    });
                }
                lastLineEmpty = true;
            } else {
                lastLineEmpty = false;
            }

            // === REGRAS DE ESPACAMENTO ===

            // Espaco apos virgula obrigatorio
            if (/,[^\s\n]/.test(line) && !line.includes('#include')) {
                const matches = line.matchAll(/,([^\s\n])/g);
                for (const match of matches) {
                    errors.push({
                        line: lineNum, column: (match.index || 0) + 1, code: 'SPC_AFTER_COMMA',
                        message: NORM_RULES.SPC_AFTER_COMMA.message,
                        severity: 'error', rule: 'SPC_AFTER_COMMA',
                        quickFix: { type: 'insert', newText: ' ', description: 'Adicionar espaco' }
                    });
                }
            }

            // Espaco antes de virgula (nao permitido)
            if (/ ,/.test(line)) {
                const matches = line.matchAll(/ ,/g);
                for (const match of matches) {
                    errors.push({
                        line: lineNum, column: (match.index || 0) + 1, code: 'SPC_BEFORE_COMMA',
                        message: NORM_RULES.SPC_BEFORE_COMMA.message,
                        severity: 'error', rule: 'SPC_BEFORE_COMMA',
                        quickFix: { type: 'delete', description: 'Remover espaco' }
                    });
                }
            }

            // Espaco apos keywords (if, while, for, return, switch)
            const keywordNoSpaceMatches = line.matchAll(/\b(if|while|for|return|switch)\(/g);
            for (const match of keywordNoSpaceMatches) {
                errors.push({
                    line: lineNum, column: (match.index || 0) + 1, code: 'SPACE_AFTER_KW',
                    message: `${NORM_RULES.SPACE_AFTER_KW.message}: ${match[1]}`,
                    severity: 'error', rule: 'SPACE_AFTER_KW',
                    quickFix: { type: 'insert', newText: ' ', description: 'Adicionar espaco' }
                });
            }

            // Espaco apos parentese de abertura
            if (/\( /.test(line) && !/\( \*/.test(line)) {
                const matches = line.matchAll(/\( /g);
                for (const match of matches) {
                    errors.push({
                        line: lineNum, column: (match.index || 0) + 2, code: 'SPC_AFTER_PAR',
                        message: NORM_RULES.SPC_AFTER_PAR.message,
                        severity: 'error', rule: 'SPC_AFTER_PAR',
                        quickFix: { type: 'delete', description: 'Remover espaco' }
                    });
                }
            }

            // Espaco antes de parentese de fechamento
            if (/ \)/.test(line)) {
                const matches = line.matchAll(/ \)/g);
                for (const match of matches) {
                    errors.push({
                        line: lineNum, column: (match.index || 0) + 1, code: 'SPC_BFR_PAR',
                        message: NORM_RULES.SPC_BFR_PAR.message,
                        severity: 'error', rule: 'SPC_BFR_PAR',
                        quickFix: { type: 'delete', description: 'Remover espaco' }
                    });
                }
            }

            // === REGRAS DE NAMING CONVENTION ===

            // Struct deve ter prefixo s_
            const structMatch = line.match(/\bstruct\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
            if (structMatch && !structMatch[1].startsWith('s_')) {
                errors.push({
                    line: lineNum, column: line.indexOf(structMatch[1]) + 1, code: 'STRUCT_PREFIX',
                    message: `${NORM_RULES.STRUCT_PREFIX.message}: ${structMatch[1]}`,
                    severity: 'error', rule: 'STRUCT_PREFIX'
                });
            }

            // Enum deve ter prefixo e_
            const enumMatch = line.match(/\benum\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
            if (enumMatch && !enumMatch[1].startsWith('e_')) {
                errors.push({
                    line: lineNum, column: line.indexOf(enumMatch[1]) + 1, code: 'ENUM_PREFIX',
                    message: `${NORM_RULES.ENUM_PREFIX.message}: ${enumMatch[1]}`,
                    severity: 'error', rule: 'ENUM_PREFIX'
                });
            }

            // Union deve ter prefixo u_
            const unionMatch = line.match(/\bunion\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
            if (unionMatch && !unionMatch[1].startsWith('u_')) {
                errors.push({
                    line: lineNum, column: line.indexOf(unionMatch[1]) + 1, code: 'UNION_PREFIX',
                    message: `${NORM_RULES.UNION_PREFIX.message}: ${unionMatch[1]}`,
                    severity: 'error', rule: 'UNION_PREFIX'
                });
            }

            // Typedef deve ter sufixo _t
            const typedefMatch = line.match(/\btypedef\s+.*\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*;/);
            if (typedefMatch && !typedefMatch[1].endsWith('_t')) {
                errors.push({
                    line: lineNum, column: line.indexOf(typedefMatch[1]) + 1, code: 'TYPEDEF_SUFFIX',
                    message: `${NORM_RULES.TYPEDEF_SUFFIX.message}: ${typedefMatch[1]}`,
                    severity: 'error', rule: 'TYPEDEF_SUFFIX'
                });
            }

            // === REGRAS DE FUNCAO ===

            // Detectar inicio de funcao (tipo na linha anterior, nome(params) na atual)
            const funcStartMatch = line.match(/^([a-z_][a-z0-9_]*)\s*\([^;]*\)\s*$/);
            if (funcStartMatch && i > 0 && /^(void|int|char|float|double|long|short|unsigned|signed|t_\w+)\s*\**\s*$/.test(lines[i - 1].trim())) {
                functionCount++;
                if (functionCount > 5) {
                    errors.push({
                        line: lineNum, column: 1, code: 'TOO_MANY_FUNCS',
                        message: `${NORM_RULES.TOO_MANY_FUNCS.message} (${functionCount} funcoes)`,
                        severity: 'error', rule: 'TOO_MANY_FUNCS'
                    });
                }
            }

            // Detectar funcao sem (void) quando nao tem parametros
            const emptyParamMatch = line.match(/([a-z_][a-z0-9_]*)\s*\(\s*\)/);
            if (emptyParamMatch && !line.includes('typedef') && !line.includes('#define')) {
                errors.push({
                    line: lineNum, column: line.indexOf('()') + 1, code: 'MISSING_VOID_PARAM',
                    message: NORM_RULES.MISSING_VOID_PARAM.message,
                    severity: 'error', rule: 'MISSING_VOID_PARAM',
                    quickFix: { type: 'replace', newText: '(void)', description: 'Adicionar void' }
                });
            }

            // Contar parametros (max 4)
            const paramMatch = line.match(/\(([^)]+)\)/);
            if (paramMatch && !line.includes('#define') && !line.includes('//')) {
                const params = paramMatch[1].split(',').filter(p => p.trim() && p.trim() !== 'void');
                if (params.length > 4) {
                    errors.push({
                        line: lineNum, column: 1, code: 'TOO_MANY_ARGS',
                        message: `${NORM_RULES.TOO_MANY_ARGS.message} (${params.length} parametros)`,
                        severity: 'error', rule: 'TOO_MANY_ARGS'
                    });
                }
            }

            // Contar chaves para rastrear funcoes
            const openBraces = (line.match(/{/g) || []).length;
            const closeBraces = (line.match(/}/g) || []).length;
            
            if (openBraces > 0 && braceDepth === 0) {
                inFunction = true;
                functionLines = 0;
                varDeclarationsDone = false;
                varCount = 0;
            }

            braceDepth += openBraces - closeBraces;

            // Verificar aninhamento maximo (3 niveis)
            if (braceDepth > 4) { // 1 para funcao + 3 de aninhamento
                errors.push({
                    line: lineNum, column: 1, code: 'NESTED_TOO_DEEP',
                    message: NORM_RULES.NESTED_TOO_DEEP.message,
                    severity: 'error', rule: 'NESTED_TOO_DEEP'
                });
            }

            if (inFunction && trimmedLine !== '' && !trimmedLine.startsWith('{') && !trimmedLine.startsWith('}')) {
                functionLines++;
                if (functionLines > 25) {
                    errors.push({
                        line: lineNum, column: 1, code: 'FUNC_TOO_LONG',
                        message: `${NORM_RULES.FUNC_TOO_LONG.message} (linha ${functionLines})`,
                        severity: 'error', rule: 'FUNC_TOO_LONG'
                    });
                }

                // Contar variaveis
                const varDeclMatch = line.match(/^\s*(int|char|float|double|long|short|unsigned|signed|t_\w+)\s+\**[a-z_]/);
                if (varDeclMatch) {
                    varCount++;
                    if (varCount > 5) {
                        errors.push({
                            line: lineNum, column: 1, code: 'TOO_MANY_VARS',
                            message: `${NORM_RULES.TOO_MANY_VARS.message} (${varCount} variaveis)`,
                            severity: 'error', rule: 'TOO_MANY_VARS'
                        });
                    }
                }
            }

            if (braceDepth === 0 && inFunction) {
                inFunction = false;
            }

            // === REGRAS DE DECLARACAO ===

            // Variavel global detectada (fora de funcao)
            if (!inFunction && braceDepth === 0) {
                const globalVarMatch = line.match(/^(int|char|float|double|void|long|short|unsigned|signed)\s+\**([a-z_][a-z0-9_]*)/i);
                if (globalVarMatch && !line.includes('(') && !line.includes('typedef') && !line.includes('extern')) {
                    // Verificar se tem prefixo g_
                    if (!globalVarMatch[2].startsWith('g_')) {
                        errors.push({
                            line: lineNum, column: 1, code: 'GLOBAL_PREFIX',
                            message: `${NORM_RULES.GLOBAL_PREFIX.message}: ${globalVarMatch[2]}`,
                            severity: 'error', rule: 'GLOBAL_PREFIX'
                        });
                    }
                }
            }

            // Declaracao com atribuicao dentro de funcao
            if (inFunction) {
                const declAssignMatch = line.match(/^\s*(int|char|float|double|long|short)\s+\**[a-z_]\w*\s*=/);
                if (declAssignMatch && !line.includes('static') && !line.includes('const')) {
                    errors.push({
                        line: lineNum, column: 1, code: 'DECL_ASSIGN',
                        message: NORM_RULES.DECL_ASSIGN.message,
                        severity: 'error', rule: 'DECL_ASSIGN'
                    });
                }
            }

            // === REGRAS PROIBIDAS ===

            // Operador ternario proibido
            if (/\?.*:/.test(line) && !line.includes('#') && !line.includes('//')) {
                errors.push({
                    line: lineNum, column: line.indexOf('?') + 1, code: 'TERNARY_FBIDDEN',
                    message: NORM_RULES.TERNARY_FBIDDEN.message,
                    severity: 'error', rule: 'TERNARY_FBIDDEN'
                });
            }

            // goto proibido
            if (/\bgoto\b/.test(line)) {
                errors.push({
                    line: lineNum, column: line.indexOf('goto') + 1, code: 'GOTO_FBIDDEN',
                    message: NORM_RULES.GOTO_FBIDDEN.message,
                    severity: 'error', rule: 'GOTO_FBIDDEN'
                });
            }

            // VLA proibido
            if (/\[[a-z_][a-z0-9_]*\]/i.test(line) && !line.includes('#define')) {
                const vlaMatch = line.match(/\[([a-z_][a-z0-9_]*)\]/i);
                if (vlaMatch) {
                    errors.push({
                        line: lineNum, column: line.indexOf('[') + 1, code: 'VLA_FORBIDDEN',
                        message: NORM_RULES.VLA_FORBIDDEN.message,
                        severity: 'error', rule: 'VLA_FORBIDDEN'
                    });
                }
            }

            // === REGRAS DE RETURN ===

            // Return deve ter parenteses
            const returnMatch = line.match(/return\s+([^(;][^;]*);/);
            if (returnMatch) {
                errors.push({
                    line: lineNum, column: line.indexOf('return') + 1, code: 'RETURN_PARENTHESES',
                    message: NORM_RULES.RETURN_PARENTHESES.message,
                    severity: 'error', rule: 'RETURN_PARENTHESES',
                    quickFix: { type: 'replace', description: 'Adicionar parenteses' }
                });
            }

            // === REGRAS DE PREPROCESSADOR ===

            // Define deve ser em MAIUSCULAS
            const defineMatch = line.match(/#define\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
            if (defineMatch) {
                const macroName = defineMatch[1];
                // Ignorar include guards
                if (!macroName.endsWith('_H') && macroName !== macroName.toUpperCase()) {
                    errors.push({
                        line: lineNum, column: line.indexOf(macroName) + 1, code: 'MACRO_CASE',
                        message: `${NORM_RULES.MACRO_CASE.message}: ${macroName}`,
                        severity: 'error', rule: 'MACRO_CASE'
                    });
                }
            }

            // Comentario C++ nao recomendado
            if (line.includes('//') && !line.includes('http://') && !line.includes('https://')) {
                errors.push({
                    line: lineNum, column: line.indexOf('//') + 1, code: 'CPP_COMMENT',
                    message: NORM_RULES.CPP_COMMENT.message,
                    severity: 'warning', rule: 'CPP_COMMENT',
                    quickFix: { type: 'replace', description: 'Converter para /* */' }
                });
            }
        }

        // Verificar final do arquivo
        if (!content.endsWith('\n')) {
            errors.push({
                line: lines.length, column: 1, code: 'NO_NL_AT_EOF',
                message: NORM_RULES.NO_NL_AT_EOF.message,
                severity: 'error', rule: 'NO_NL_AT_EOF',
                quickFix: { type: 'insert', newText: '\n', description: 'Adicionar nova linha' }
            });
        }

        // Verificar linhas vazias no inicio
        if (lines[0]?.trim() === '' && !lines[0].includes('/*')) {
            errors.push({
                line: 1, column: 1, code: 'EMPTY_LINE_FILE_START',
                message: NORM_RULES.EMPTY_LINE_FILE_START.message,
                severity: 'error', rule: 'EMPTY_LINE_FILE_START',
                quickFix: { type: 'delete', description: 'Remover linha vazia' }
            });
        }

        return {
            success: errors.filter(e => e.severity === 'error').length === 0,
            output: this.formatOutput(errors),
            errorCount: errors.filter(e => e.severity === 'error').length,
            warningCount: errors.filter(e => e.severity === 'warning').length,
            errors
        };
    }

    private checkHeader42(content: string, lines: string[]): boolean {
        // Verificar se o arquivo comeca com o header padrao da 42
        if (lines.length < 11) return false;
        
        // Primeira linha deve ser: /* ************************************************************************** */
        const firstLine = lines[0];
        if (!firstLine.match(/^\/\* \*{74} \*\/$/)) {
            return false;
        }

        // Verificar estrutura basica do header
        const headerIndicators = [
            '/*',
            ':::',
            '#+#',
            '###',
            '*/'
        ];

        let hasHeaderStructure = true;
        for (const indicator of headerIndicators) {
            if (!content.slice(0, 800).includes(indicator)) {
                hasHeaderStructure = false;
                break;
            }
        }

        return hasHeaderStructure;
    }

    private checkIncludeGuard(content: string): boolean {
        // Verificar se tem #ifndef, #define e #endif
        const hasIfndef = /#ifndef\s+\w+_H/.test(content);
        const hasDefine = /#define\s+\w+_H/.test(content);
        const hasEndif = /#endif/.test(content);
        
        return hasIfndef && hasDefine && hasEndif;
    }

    private formatOutput(errors: NormError[]): string {
        if (errors.length === 0) {
            return 'OK!';
        }

        return errors.map(e => 
            `${e.severity === 'error' ? 'Error' : 'Warning'}: ${e.code} (line: ${e.line}, col: ${e.column}): ${e.message}`
        ).join('\n');
    }

    private updateStatusBar(result: NorminetteResult): void {
        if (result.success) {
            this.statusBarItem.text = '$(check) Norminette: OK';
            this.statusBarItem.backgroundColor = undefined;
            this.statusBarItem.color = undefined;
        } else {
            this.statusBarItem.text = `$(error) Norm: ${result.errorCount} erro(s)`;
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        }
        this.statusBarItem.show();
    }

    parseToDiagnostics(result: NorminetteResult, uri: vscode.Uri): vscode.Diagnostic[] {
        return result.errors.map(error => {
            const severity = error.severity === 'error' 
                ? vscode.DiagnosticSeverity.Error 
                : error.severity === 'warning'
                    ? vscode.DiagnosticSeverity.Warning
                    : vscode.DiagnosticSeverity.Information;

            const range = new vscode.Range(
                Math.max(0, error.line - 1), 
                Math.max(0, error.column - 1), 
                Math.max(0, error.line - 1), 
                error.column + 50
            );

            const diagnostic = new vscode.Diagnostic(range, `[${error.code}] ${error.message}`, severity);
            diagnostic.source = 'norminette';
            diagnostic.code = error.code;
            
            // Adicionar informacao de quick fix se disponivel
            if (error.quickFix) {
                diagnostic.tags = [];
            }
            
            return diagnostic;
        });
    }

    updateDiagnostics(diagnostics: vscode.Diagnostic[], uri: vscode.Uri): void {
        this.diagnosticCollection.set(uri, diagnostics);
    }

    clearDiagnostics(uri?: vscode.Uri): void {
        if (uri) {
            this.diagnosticCollection.delete(uri);
        } else {
            this.diagnosticCollection.clear();
        }
    }

    // Obter erros para um arquivo especifico
    getErrors(uri: vscode.Uri): vscode.Diagnostic[] {
        return this.diagnosticCollection.get(uri) || [];
    }

    // Gerar header 42 para um arquivo
    generateHeader42(fileName: string, author: string = 'marvin'): string {
        const now = new Date();
        const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        
        const nameFormatted = fileName.padEnd(51);
        const authorFormatted = author.padEnd(8);

        return `/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ${nameFormatted}:+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ${authorFormatted} <${author}@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: ${dateStr} by ${author}             #+#    #+#             */
/*   Updated: ${dateStr} by ${author}            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

`;
    }

    // Gerar include guard para arquivo .h
    generateIncludeGuard(fileName: string): { top: string; bottom: string } {
        const guardName = fileName.replace('.', '_').toUpperCase();
        return {
            top: `#ifndef ${guardName}\n# define ${guardName}\n\n`,
            bottom: `\n#endif /* ${guardName} */\n`
        };
    }

    dispose(): void {
        this.diagnosticCollection.dispose();
        this.statusBarItem.dispose();
        this.outputChannel.dispose();
    }
}
