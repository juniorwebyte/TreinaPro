import * as vscode from 'vscode';
import { ApiService } from '../services/apiService';
export declare class ExercisePanelManager {
    private context;
    private apiService;
    static currentPanel: ExercisePanelManager | undefined;
    private readonly panel;
    private disposables;
    private constructor();
    static createOrShowPanel(context: vscode.ExtensionContext, apiService: ApiService): ExercisePanelManager;
    createOrShow(): void;
    private setWebviewMessageListener;
    private getWebviewContent;
    dispose(): void;
}
//# sourceMappingURL=exercisePanel.d.ts.map