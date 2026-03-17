import * as vscode from 'vscode';
import { ApiService, Exercise } from '../services/apiService';
export declare class ExercisesProvider implements vscode.TreeDataProvider<ExerciseItem> {
    private apiService;
    private _onDidChangeTreeData;
    readonly onDidChangeTreeData: vscode.Event<ExerciseItem | undefined | null | void>;
    private exercises;
    private categories;
    constructor(apiService: ApiService);
    refresh(): void;
    private loadExercises;
    getTreeItem(element: ExerciseItem): vscode.TreeItem;
    getChildren(element?: ExerciseItem): Promise<ExerciseItem[]>;
}
export declare class ExerciseItem extends vscode.TreeItem {
    readonly label: string;
    readonly description: string;
    readonly collapsibleState: vscode.TreeItemCollapsibleState;
    readonly type: 'category' | 'exercise';
    readonly exercise?: Exercise | undefined;
    constructor(label: string, description: string, collapsibleState: vscode.TreeItemCollapsibleState, type: 'category' | 'exercise', exercise?: Exercise | undefined);
}
//# sourceMappingURL=exercisesProvider.d.ts.map