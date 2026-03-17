"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolItem = exports.ToolsProvider = void 0;
const vscode = __importStar(require("vscode"));
const TOOLS = [
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
class ToolsProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    getTreeItem(element) {
        return element;
    }
    getChildren() {
        return TOOLS.map(tool => new ToolItem(tool));
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
}
exports.ToolsProvider = ToolsProvider;
class ToolItem extends vscode.TreeItem {
    constructor(tool) {
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
exports.ToolItem = ToolItem;
//# sourceMappingURL=toolsProvider.js.map