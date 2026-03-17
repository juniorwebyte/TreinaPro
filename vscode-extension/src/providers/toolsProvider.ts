import * as vscode from 'vscode';

interface ToolDefinition {
    id: string;
    label: string;
    description: string;
    icon: string;
    command: string;
}

const TOOLS: ToolDefinition[] = [
    {
        id: 'norminette',
        label: 'Norminette',
        description: 'Verificar estilo de codigo',
        icon: 'checklist',
        command: 'treinoPro.runNorminette'
    },
    {
        id: 'compile',
        label: 'Compilar e Testar',
        description: 'Compilar com gcc e rodar testes',
        icon: 'play',
        command: 'treinoPro.compileAndTest'
    },
    {
        id: 'submit',
        label: 'Enviar Exercicio',
        description: 'Submeter para avaliacao',
        icon: 'cloud-upload',
        command: 'treinoPro.submitExercise'
    },
    {
        id: 'hint',
        label: 'Mostrar Dica',
        description: 'Ver dica para o exercicio atual',
        icon: 'lightbulb',
        command: 'treinoPro.showHint'
    },
    {
        id: 'sync',
        label: 'Sincronizar',
        description: 'Sincronizar progresso com a nuvem',
        icon: 'sync',
        command: 'treinoPro.syncProgress'
    },
    {
        id: 'webytehub_terminal',
        label: 'Terminal Webytehub 42',
        description: 'Abrir terminal com atalhos mini-moulinette',
        icon: 'terminal',
        command: 'treinoPro.openWebytehubTerminal'
    }
];

export class ToolsProvider implements vscode.TreeDataProvider<ToolItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ToolItem | undefined | null | void> = new vscode.EventEmitter<ToolItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ToolItem | undefined | null | void> = this._onDidChangeTreeData.event;

    getTreeItem(element: ToolItem): vscode.TreeItem {
        return element;
    }

    getChildren(): ToolItem[] {
        return TOOLS.map(tool => new ToolItem(tool));
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}

export class ToolItem extends vscode.TreeItem {
    constructor(tool: ToolDefinition) {
        super(tool.label, vscode.TreeItemCollapsibleState.None);
        
        this.description = tool.description;
        this.iconPath = new vscode.ThemeIcon(tool.icon);
        this.contextValue = 'tool';
        this.command = {
            command: tool.command,
            title: tool.label
        };
    }
}
