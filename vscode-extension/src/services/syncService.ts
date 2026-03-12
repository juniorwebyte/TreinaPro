import * as vscode from 'vscode';
import { ApiService } from './apiService';

interface SyncResult {
    success: boolean;
    error?: string;
    syncedItems?: number;
}

export class SyncService {
    constructor(private apiService: ApiService) {}

    async sync(): Promise<SyncResult> {
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
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            };
        }
    }

    private extractExerciseId(filePath: string): string | null {
        // Tenta extrair ID do caminho do arquivo
        // Formato esperado: .../c00/ex00/ft_putchar.c
        const match = filePath.match(/c(\d+)\/ex(\d+)/i);
        if (match) {
            return `c${match[1].padStart(2, '0')}-ex${match[2].padStart(2, '0')}`;
        }
        return null;
    }
}
