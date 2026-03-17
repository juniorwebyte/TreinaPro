import * as vscode from 'vscode';
interface ToolDefinition {
    id: string;
    label: string;
    description: string;
    icon: string;
    command: string;
}
export declare class ToolsProvider implements vscode.TreeDataProvider<ToolItem> {
    private _onDidChangeTreeData;
    readonly onDidChangeTreeData: vscode.Event<ToolItem | undefined | null | void>;
    getTreeItem(element: ToolItem): vscode.TreeItem;
    getChildren(): ToolItem[];
    refresh(): void;
}
export declare class ToolItem extends vscode.TreeItem {
    constructor(tool: ToolDefinition);
}
export {};
//# sourceMappingURL=toolsProvider.d.ts.map