import * as vscode from 'vscode';
import { NorminetteService } from './norminetteService';
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
export declare class DiagnosticsService {
    private diagnosticCollection;
    private norminetteService;
    private outputChannel;
    private statusBarItem;
    private debounceTimers;
    private lastResults;
    private sources;
    private debounceDelay;
    constructor(norminetteService: NorminetteService);
    /**
     * Analisa um arquivo e retorna todos os diagnosticos unificados
     */
    analyzeFile(uri: vscode.Uri, options?: {
        includeNorminette?: boolean;
        includeCompiler?: boolean;
        includeLsp?: boolean;
        debounce?: boolean;
    }): Promise<UnifiedDiagnostic[]>;
    private runAnalysis;
    private runNorminetteAnalysis;
    private convertNormErrors;
    private runCompilerAnalysis;
    private parseCompilerOutput;
    private extractCompilerErrorCode;
    private removeDuplicates;
    private updateVSCodeDiagnostics;
    private updateStatusBar;
    isSourceEnabled(sourceName: string): boolean;
    enableSource(sourceName: string): void;
    disableSource(sourceName: string): void;
    setDebounceDelay(ms: number): void;
    /**
     * Limpa todos os diagnosticos para um arquivo
     */
    clearDiagnostics(uri?: vscode.Uri): void;
    /**
     * Obtem os ultimos diagnosticos para um arquivo
     */
    getLastDiagnostics(uri: vscode.Uri): UnifiedDiagnostic[];
    /**
     * Retorna resumo dos diagnosticos
     */
    getDiagnosticsSummary(uri?: vscode.Uri): {
        total: number;
        errors: number;
        warnings: number;
        info: number;
        bySource: Record<string, number>;
    };
    /**
     * Mostra dialogo com resumo dos diagnosticos
     */
    showDiagnosticsSummary(): Promise<void>;
    /**
     * Registra os listeners para analise automatica
     */
    registerAutoAnalysis(context: vscode.ExtensionContext): void;
    dispose(): void;
}
//# sourceMappingURL=diagnosticsService.d.ts.map