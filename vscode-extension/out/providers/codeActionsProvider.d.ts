import * as vscode from 'vscode';
export declare class NorminetteCodeActionsProvider implements vscode.CodeActionProvider {
    static readonly providedCodeActionKinds: vscode.CodeActionKind[];
    provideCodeActions(document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext, _token: vscode.CancellationToken): vscode.CodeAction[];
    private getFixActionsForCode;
    private createTrailingWhitespaceFix;
    private createSpaceToTabFix;
    private createUnifyIndentFix;
    private createReturnParenthesesFix;
    private createAddVoidParamFix;
    private createAddNewlineEOFFix;
    private createRemoveEmptyLineFix;
    private createAddSpaceAfterCommaFix;
    private createRemoveSpaceBeforeCommaFix;
    private createAddSpaceAfterKeywordFix;
    private createRemoveSpaceAfterParenFix;
    private createRemoveSpaceBeforeParenFix;
    private createConvertCommentFix;
    private createSplitLineFix;
    private createAddHeader42Fix;
    private createAddIncludeGuardFix;
    private createBraceNewlineFix;
}
export declare function fixAllNorminetteErrors(uri: vscode.Uri): Promise<void>;
//# sourceMappingURL=codeActionsProvider.d.ts.map