import * as vscode from 'vscode';
import { NorminetteService } from './norminetteService';
export declare class CopilotService {
    private outputChannel;
    private isAvailable;
    private chatParticipantDisposable?;
    private norminetteService?;
    constructor(norminetteService?: NorminetteService);
    private checkCopilotAvailability;
    getCopilotAvailable(): Promise<boolean>;
    /**
     * Registra o Chat Participant @norm para integracao com Copilot Chat
     */
    registerChatParticipant(context: vscode.ExtensionContext): void;
    private handleChatRequest;
    private handleFixCommand;
    private handleExplainCommand;
    private handleOptimizeCommand;
    private handleHintCommand;
    private handleRulesCommand;
    private handleDebugCommand;
    private handleGeneralRequest;
    private provideFollowups;
    private applyBasicFixes;
    private explainFixes;
    private explainLine;
    private analyzeOptimizations;
    private findPotentialBugs;
    private extractExerciseName;
    registerCompletionProvider(): vscode.Disposable;
    private get42Snippets;
    dispose(): void;
}
//# sourceMappingURL=copilotService.d.ts.map