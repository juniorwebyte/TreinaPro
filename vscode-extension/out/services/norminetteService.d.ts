import * as vscode from 'vscode';
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
    range?: {
        start: number;
        end: number;
    };
    newText?: string;
    description: string;
}
export declare const NORM_RULES: Record<string, {
    message: string;
    severity: 'error' | 'warning';
    fixable: boolean;
}>;
export declare class NorminetteService {
    private diagnosticCollection;
    private statusBarItem;
    private outputChannel;
    private useOfficial;
    constructor();
    check(filePath: string): Promise<NorminetteResult>;
    private checkWithOfficialNorminette;
    private parseNorminetteOutput;
    private getQuickFixForRule;
    checkLocal(filePath: string): Promise<NorminetteResult>;
    private checkHeader42;
    private checkIncludeGuard;
    private formatOutput;
    private updateStatusBar;
    parseToDiagnostics(result: NorminetteResult, uri: vscode.Uri): vscode.Diagnostic[];
    updateDiagnostics(diagnostics: vscode.Diagnostic[], uri: vscode.Uri): void;
    clearDiagnostics(uri?: vscode.Uri): void;
    getErrors(uri: vscode.Uri): readonly vscode.Diagnostic[];
    generateHeader42(fileName: string, author?: string): string;
    generateIncludeGuard(fileName: string): {
        top: string;
        bottom: string;
    };
    dispose(): void;
}
//# sourceMappingURL=norminetteService.d.ts.map