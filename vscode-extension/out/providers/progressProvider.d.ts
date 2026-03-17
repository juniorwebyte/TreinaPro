import * as vscode from 'vscode';
import { ApiService } from '../services/apiService';
export declare class ProgressProvider implements vscode.TreeDataProvider<ProgressItem> {
    private apiService;
    private _onDidChangeTreeData;
    readonly onDidChangeTreeData: vscode.Event<ProgressItem | undefined | null | void>;
    private stats;
    constructor(apiService: ApiService);
    refresh(): void;
    private loadStats;
    getTreeItem(element: ProgressItem): vscode.TreeItem;
    getChildren(): Promise<ProgressItem[]>;
}
export declare class ProgressItem extends vscode.TreeItem {
    readonly label: string;
    readonly value: string;
    readonly icon: string;
    constructor(label: string, value: string, icon: string);
}
//# sourceMappingURL=progressProvider.d.ts.map