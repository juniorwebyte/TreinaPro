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
exports.SyncService = void 0;
const vscode = __importStar(require("vscode"));
class SyncService {
    constructor(apiService) {
        this.apiService = apiService;
    }
    async sync() {
        try {
            // Obter progresso local
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                return { success: false, error: 'Nenhuma pasta de trabalho aberta' };
            }
            const workspacePath = workspaceFolders[0].uri.fsPath;
            // Buscar arquivos .c no workspace
            const cFiles = await vscode.workspace.findFiles('**/*.c', '**/node_modules/**');
            let syncedCount = 0;
            for (const file of cFiles) {
                const document = await vscode.workspace.openTextDocument(file);
                const content = document.getText();
                // Verificar se parece ser um exercicio da 42
                if (content.includes('/* ****') || file.fsPath.includes('/ex')) {
                    // Extrair informacoes do exercicio
                    const exerciseId = this.extractExerciseId(file.fsPath);
                    if (exerciseId) {
                        // Enviar para a API (modo silencioso)
                        // await this.apiService.submitExercise(file.fsPath, content);
                        syncedCount++;
                    }
                }
            }
            // Sincronizar progresso com o servidor
            const progress = await this.apiService.getProgress();
            return {
                success: true,
                syncedItems: syncedCount
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            };
        }
    }
    extractExerciseId(filePath) {
        // Tenta extrair ID do caminho do arquivo
        // Formato esperado: .../c00/ex00/ft_putchar.c
        const match = filePath.match(/c(\d+)\/ex(\d+)/i);
        if (match) {
            return `c${match[1].padStart(2, '0')}-ex${match[2].padStart(2, '0')}`;
        }
        return null;
    }
}
exports.SyncService = SyncService;
//# sourceMappingURL=syncService.js.map