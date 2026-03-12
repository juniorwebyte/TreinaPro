import * as vscode from 'vscode';
import { NorminetteService, NorminetteResult, NormError } from './norminetteService';
import { getPlatformService } from './platformService';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);

// ============================================================================
// DIAGNOSTICS SERVICE - Servico Unificado de Diagnosticos
// ============================================================================

export interface DiagnosticSource {
    name: string;
    enabled: boolean;
    priority: number;
}

export interface UnifiedDiagnostic {
    source: 'norminette' | 'compiler' | 'lsp' | 'custom';
    severity: vscode.DiagnosticSeverity;
    range: vscode.Range;
    message: string;
    code?: string;
    relatedInformation?: vscode.DiagnosticRelatedInformation[];
    tags?: vscode.DiagnosticTag[];
    data?: {
        quickFix?: boolean;
        fixDescription?: string;
        rule?: string;
    };
}

export interface CompilerDiagnostic {
    file: string;
    line: number;
    column: number;
    type: 'error' | 'warning' | 'note';
    message: string;
    code?: string;
}

export class DiagnosticsService {
    private diagnosticCollection: vscode.DiagnosticCollection;
    private norminetteService: NorminetteService;
    private outputChannel: vscode.OutputChannel;
    private statusBarItem: vscode.StatusBarItem;
    private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
    private lastResults: Map<string, UnifiedDiagnostic[]> = new Map();
    
    // Configuracoes
    private sources: DiagnosticSource[] = [
        { name: 'norminette', enabled: true, priority: 1 },
        { name: 'compiler', enabled: true, priority: 2 },
        { name: 'lsp', enabled: true, priority: 3 },
    ];
    
    private debounceDelay = 500; // ms

    constructor(norminetteService: NorminetteService) {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('treino-pro-unified');
        this.norminetteService = norminetteService;
        this.outputChannel = vscode.window.createOutputChannel('Treino Pro - Diagnosticos');
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 98);
        this.statusBarItem.command = 'treinoPro.showDiagnosticsSummary';
    }

    // ============================================================================
    // API Publica Principal
    // ============================================================================

    /**
     * Analisa um arquivo e retorna todos os diagnosticos unificados
     */
    async analyzeFile(uri: vscode.Uri, options?: { 
        includeNorminette?: boolean;
        includeCompiler?: boolean;
        includeLsp?: boolean;
        debounce?: boolean;
    }): Promise<UnifiedDiagnostic[]> {
        const opts = {
            includeNorminette: true,
            includeCompiler: true,
            includeLsp: true,
            debounce: true,
            ...options
        };

        // Verificar se e um arquivo C/H
        if (!uri.fsPath.endsWith('.c') && !uri.fsPath.endsWith('.h')) {
            return [];
        }

        // Debounce para evitar analises excessivas
        if (opts.debounce) {
            return new Promise((resolve) => {
                const existingTimer = this.debounceTimers.get(uri.fsPath);
                if (existingTimer) {
                    clearTimeout(existingTimer);
                }

                const timer = setTimeout(async () => {
                    this.debounceTimers.delete(uri.fsPath);
                    const result = await this.runAnalysis(uri, opts);
                    resolve(result);
                }, this.debounceDelay);

                this.debounceTimers.set(uri.fsPath, timer);
            });
        }

        return this.runAnalysis(uri, opts);
    }

    private async runAnalysis(uri: vscode.Uri, options: {
        includeNorminette?: boolean;
        includeCompiler?: boolean;
        includeLsp?: boolean;
    }): Promise<UnifiedDiagnostic[]> {
        const allDiagnostics: UnifiedDiagnostic[] = [];

        this.updateStatusBar('analyzing');

        // Executar analises em paralelo
        const promises: Promise<UnifiedDiagnostic[]>[] = [];

        if (options.includeNorminette && this.isSourceEnabled('norminette')) {
            promises.push(this.runNorminetteAnalysis(uri));
        }

        if (options.includeCompiler && this.isSourceEnabled('compiler')) {
            promises.push(this.runCompilerAnalysis(uri));
        }

        const results = await Promise.all(promises);
        
        for (const diagnostics of results) {
            allDiagnostics.push(...diagnostics);
        }

        // Ordenar por linha e severidade
        allDiagnostics.sort((a, b) => {
            if (a.range.start.line !== b.range.start.line) {
                return a.range.start.line - b.range.start.line;
            }
            return a.severity - b.severity;
        });

        // Remover duplicatas
        const uniqueDiagnostics = this.removeDuplicates(allDiagnostics);

        // Atualizar cache
        this.lastResults.set(uri.fsPath, uniqueDiagnostics);

        // Atualizar diagnosticos no VSCode
        this.updateVSCodeDiagnostics(uri, uniqueDiagnostics);

        // Atualizar status bar
        this.updateStatusBar('done', uniqueDiagnostics);

        return uniqueDiagnostics;
    }

    // ============================================================================
    // Analise Norminette
    // ============================================================================

    private async runNorminetteAnalysis(uri: vscode.Uri): Promise<UnifiedDiagnostic[]> {
        try {
            const result = await this.norminetteService.check(uri.fsPath);
            return this.convertNormErrors(result.errors);
        } catch (error) {
            this.outputChannel.appendLine(`Erro na analise Norminette: ${error}`);
            return [];
        }
    }

    private convertNormErrors(errors: NormError[]): UnifiedDiagnostic[] {
        return errors.map(error => ({
            source: 'norminette' as const,
            severity: error.severity === 'error' 
                ? vscode.DiagnosticSeverity.Error 
                : error.severity === 'warning'
                    ? vscode.DiagnosticSeverity.Warning
                    : vscode.DiagnosticSeverity.Information,
            range: new vscode.Range(
                Math.max(0, error.line - 1),
                Math.max(0, error.column - 1),
                Math.max(0, error.line - 1),
                error.column + 50
            ),
            message: `[Norminette] ${error.message}`,
            code: error.code,
            data: {
                quickFix: !!error.quickFix,
                fixDescription: error.quickFix?.description,
                rule: error.rule
            }
        }));
    }

    // ============================================================================
    // Analise do Compilador
    // ============================================================================

    private async runCompilerAnalysis(uri: vscode.Uri): Promise<UnifiedDiagnostic[]> {
        const platformService = getPlatformService();
        
        if (!platformService.isToolAvailable('gcc') && !platformService.isToolAvailable('clang')) {
            return [];
        }

        try {
            const compiler = platformService.isToolAvailable('gcc') ? 'gcc' : 'clang';
            const filePath = uri.fsPath;
            
            // Compilar apenas para verificacao de erros (sem output)
            const cmd = `${compiler} -Wall -Wextra -Werror -fsyntax-only "${filePath}" 2>&1`;
            
            try {
                await execAsync(cmd, { timeout: 10000 });
                return []; // Compilacao OK
            } catch (error: unknown) {
                // Compilacao falhou - parsear erros
                const stderr = error instanceof Error && 'stderr' in error 
                    ? (error as { stderr: string }).stderr 
                    : error instanceof Error && 'stdout' in error
                        ? (error as { stdout: string }).stdout
                        : String(error);
                
                return this.parseCompilerOutput(stderr, uri);
            }
        } catch (error) {
            this.outputChannel.appendLine(`Erro na analise do compilador: ${error}`);
            return [];
        }
    }

    private parseCompilerOutput(output: string, uri: vscode.Uri): UnifiedDiagnostic[] {
        const diagnostics: UnifiedDiagnostic[] = [];
        const lines = output.split('\n');
        const fileName = path.basename(uri.fsPath);

        for (const line of lines) {
            // Formato GCC/Clang: file:line:column: type: message
            const match = line.match(/([^:]+):(\d+):(\d+):\s*(error|warning|note):\s*(.*)/i);
            
            if (match) {
                const [, file, lineStr, colStr, type, message] = match;
                
                // Verificar se o erro e do arquivo atual
                if (!file.includes(fileName)) continue;

                const lineNum = parseInt(lineStr) - 1;
                const colNum = parseInt(colStr) - 1;
                
                let severity: vscode.DiagnosticSeverity;
                switch (type.toLowerCase()) {
                    case 'error':
                        severity = vscode.DiagnosticSeverity.Error;
                        break;
                    case 'warning':
                        severity = vscode.DiagnosticSeverity.Warning;
                        break;
                    default:
                        severity = vscode.DiagnosticSeverity.Information;
                }

                diagnostics.push({
                    source: 'compiler',
                    severity,
                    range: new vscode.Range(
                        Math.max(0, lineNum),
                        Math.max(0, colNum),
                        Math.max(0, lineNum),
                        colNum + 50
                    ),
                    message: `[Compiler] ${message}`,
                    code: this.extractCompilerErrorCode(message)
                });
            }
        }

        return diagnostics;
    }

    private extractCompilerErrorCode(message: string): string | undefined {
        // Extrair codigo de warning do GCC (ex: -Wunused-variable)
        const match = message.match(/\[-W([^\]]+)\]/);
        return match ? `-W${match[1]}` : undefined;
    }

    // ============================================================================
    // Gerenciamento de Diagnosticos
    // ============================================================================

    private removeDuplicates(diagnostics: UnifiedDiagnostic[]): UnifiedDiagnostic[] {
        const seen = new Set<string>();
        return diagnostics.filter(diag => {
            const key = `${diag.range.start.line}-${diag.range.start.character}-${diag.message}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    private updateVSCodeDiagnostics(uri: vscode.Uri, diagnostics: UnifiedDiagnostic[]): void {
        const vscodeDiagnostics = diagnostics.map(diag => {
            const vsDiag = new vscode.Diagnostic(
                diag.range,
                diag.message,
                diag.severity
            );
            
            vsDiag.source = 'Guia Piscine';
            vsDiag.code = diag.code;
            
            if (diag.tags) {
                vsDiag.tags = diag.tags;
            }
            
            if (diag.relatedInformation) {
                vsDiag.relatedInformation = diag.relatedInformation;
            }

            return vsDiag;
        });

        this.diagnosticCollection.set(uri, vscodeDiagnostics);
    }

    private updateStatusBar(state: 'analyzing' | 'done', diagnostics?: UnifiedDiagnostic[]): void {
        if (state === 'analyzing') {
            this.statusBarItem.text = '$(sync~spin) Analisando...';
            this.statusBarItem.backgroundColor = undefined;
        } else if (diagnostics) {
            const errors = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error).length;
            const warnings = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Warning).length;

            if (errors > 0) {
                this.statusBarItem.text = `$(error) ${errors} erro(s), ${warnings} aviso(s)`;
                this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
            } else if (warnings > 0) {
                this.statusBarItem.text = `$(warning) ${warnings} aviso(s)`;
                this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
            } else {
                this.statusBarItem.text = '$(check) Codigo OK';
                this.statusBarItem.backgroundColor = undefined;
            }
        }
        
        this.statusBarItem.show();
    }

    // ============================================================================
    // Configuracoes
    // ============================================================================

    isSourceEnabled(sourceName: string): boolean {
        const source = this.sources.find(s => s.name === sourceName);
        return source?.enabled ?? false;
    }

    enableSource(sourceName: string): void {
        const source = this.sources.find(s => s.name === sourceName);
        if (source) {
            source.enabled = true;
        }
    }

    disableSource(sourceName: string): void {
        const source = this.sources.find(s => s.name === sourceName);
        if (source) {
            source.enabled = false;
        }
    }

    setDebounceDelay(ms: number): void {
        this.debounceDelay = Math.max(100, Math.min(2000, ms));
    }

    // ============================================================================
    // Utilidades
    // ============================================================================

    /**
     * Limpa todos os diagnosticos para um arquivo
     */
    clearDiagnostics(uri?: vscode.Uri): void {
        if (uri) {
            this.diagnosticCollection.delete(uri);
            this.lastResults.delete(uri.fsPath);
        } else {
            this.diagnosticCollection.clear();
            this.lastResults.clear();
        }
    }

    /**
     * Obtem os ultimos diagnosticos para um arquivo
     */
    getLastDiagnostics(uri: vscode.Uri): UnifiedDiagnostic[] {
        return this.lastResults.get(uri.fsPath) || [];
    }

    /**
     * Retorna resumo dos diagnosticos
     */
    getDiagnosticsSummary(uri?: vscode.Uri): { 
        total: number; 
        errors: number; 
        warnings: number; 
        info: number;
        bySource: Record<string, number>;
    } {
        let diagnostics: UnifiedDiagnostic[] = [];
        
        if (uri) {
            diagnostics = this.lastResults.get(uri.fsPath) || [];
        } else {
            for (const diags of this.lastResults.values()) {
                diagnostics.push(...diags);
            }
        }

        const bySource: Record<string, number> = {
            norminette: 0,
            compiler: 0,
            lsp: 0,
            custom: 0
        };

        for (const diag of diagnostics) {
            bySource[diag.source] = (bySource[diag.source] || 0) + 1;
        }

        return {
            total: diagnostics.length,
            errors: diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error).length,
            warnings: diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Warning).length,
            info: diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Information).length,
            bySource
        };
    }

    /**
     * Mostra dialogo com resumo dos diagnosticos
     */
    async showDiagnosticsSummary(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        const summary = this.getDiagnosticsSummary(editor?.document.uri);

        const items: vscode.QuickPickItem[] = [
            {
                label: `$(error) Erros: ${summary.errors}`,
                description: 'Problemas que impedem compilacao',
            },
            {
                label: `$(warning) Avisos: ${summary.warnings}`,
                description: 'Problemas potenciais',
            },
            {
                label: `$(info) Informacoes: ${summary.info}`,
                description: 'Sugestoes de melhoria',
            },
            { label: '', kind: vscode.QuickPickItemKind.Separator },
            {
                label: `Norminette: ${summary.bySource.norminette}`,
                description: 'Erros de estilo da 42',
            },
            {
                label: `Compilador: ${summary.bySource.compiler}`,
                description: 'Erros e warnings do GCC/Clang',
            },
        ];

        await vscode.window.showQuickPick(items, {
            title: 'Resumo dos Diagnosticos',
            placeHolder: `Total: ${summary.total} problemas encontrados`
        });
    }

    /**
     * Registra os listeners para analise automatica
     */
    registerAutoAnalysis(context: vscode.ExtensionContext): void {
        // Analisar ao abrir arquivo
        context.subscriptions.push(
            vscode.workspace.onDidOpenTextDocument(doc => {
                if (doc.languageId === 'c') {
                    this.analyzeFile(doc.uri);
                }
            })
        );

        // Analisar ao salvar
        context.subscriptions.push(
            vscode.workspace.onDidSaveTextDocument(doc => {
                if (doc.languageId === 'c') {
                    this.analyzeFile(doc.uri, { debounce: false });
                }
            })
        );

        // Analisar ao editar (com debounce)
        context.subscriptions.push(
            vscode.workspace.onDidChangeTextDocument(event => {
                if (event.document.languageId === 'c' && event.contentChanges.length > 0) {
                    this.analyzeFile(event.document.uri, { debounce: true });
                }
            })
        );

        // Limpar ao fechar arquivo
        context.subscriptions.push(
            vscode.workspace.onDidCloseTextDocument(doc => {
                this.clearDiagnostics(doc.uri);
            })
        );

        // Analisar arquivo ativo ao iniciar
        if (vscode.window.activeTextEditor?.document.languageId === 'c') {
            this.analyzeFile(vscode.window.activeTextEditor.document.uri);
        }
    }

    dispose(): void {
        this.diagnosticCollection.dispose();
        this.outputChannel.dispose();
        this.statusBarItem.dispose();
        
        // Limpar timers pendentes
        for (const timer of this.debounceTimers.values()) {
            clearTimeout(timer);
        }
        this.debounceTimers.clear();
    }
}
