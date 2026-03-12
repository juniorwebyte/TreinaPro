import * as vscode from 'vscode';
import { ExercisesProvider } from './providers/exercisesProvider';
import { ProgressProvider } from './providers/progressProvider';
import { ToolsProvider } from './providers/toolsProvider';
import { NorminetteCodeActionsProvider, fixAllNorminetteErrors } from './providers/codeActionsProvider';
import { ExercisePanelManager } from './panels/exercisePanel';
import { NorminetteService } from './services/norminetteService';
import { CompilerService } from './services/compilerService';
import { MoulinetteService } from './services/moulinetteService';
import { CopilotService } from './services/copilotService';
import { DiagnosticsService } from './services/diagnosticsService';
import { getPlatformService, PlatformService } from './services/platformService';
import { ApiService } from './services/apiService';
import { SyncService } from './services/syncService';

let exercisePanelManager: ExercisePanelManager;
let platformService: PlatformService;
let diagnosticsService: DiagnosticsService;
let copilotService: CopilotService;

export async function activate(context: vscode.ExtensionContext) {
    console.log('Treino Pro extension is now active!');

    // Inicializar PlatformService primeiro (deteccao de plataforma)
    platformService = getPlatformService();
    await platformService.initialize();

    // Inicializar servicos
    const apiService = new ApiService(context);
    const norminetteService = new NorminetteService();
    const compilerService = new CompilerService();
    const moulinetteService = new MoulinetteService();
    const syncService = new SyncService(apiService);

    // Inicializar servico de diagnosticos unificado
    diagnosticsService = new DiagnosticsService(norminetteService);
    diagnosticsService.registerAutoAnalysis(context);

    // Inicializar integracao com Copilot
    copilotService = new CopilotService(norminetteService);
    copilotService.registerChatParticipant(context);

    // Inicializar providers para as views
    const exercisesProvider = new ExercisesProvider(apiService);
    const progressProvider = new ProgressProvider(apiService);
    const toolsProvider = new ToolsProvider();

    // Registrar tree views
    vscode.window.registerTreeDataProvider('treinoPro.exercises', exercisesProvider);
    vscode.window.registerTreeDataProvider('treinoPro.progress', progressProvider);
    vscode.window.registerTreeDataProvider('treinoPro.tools', toolsProvider);

    // Inicializar painel de exercicios
    exercisePanelManager = new ExercisePanelManager(context, apiService);

    // Registrar Code Actions Provider para correcoes automaticas
    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            { language: 'c', scheme: 'file' },
            new NorminetteCodeActionsProvider(),
            {
                providedCodeActionKinds: NorminetteCodeActionsProvider.providedCodeActionKinds
            }
        )
    );

    // Registrar Completion Provider do Copilot
    context.subscriptions.push(copilotService.registerCompletionProvider());

    // ============================================================================
    // COMANDOS
    // ============================================================================

    // Comando: Abrir Painel de Exercicios
    const openPanelCommand = vscode.commands.registerCommand('treinoPro.openPanel', () => {
        exercisePanelManager.createOrShow();
    });

    // Comando: Carregar Exercicio
    const loadExerciseCommand = vscode.commands.registerCommand('treinoPro.loadExercise', async (exerciseId?: string) => {
        if (!exerciseId) {
            const exercises = await apiService.getExercises();
            const items = exercises.map(ex => ({
                label: ex.name,
                description: ex.category,
                detail: ex.difficulty,
                exerciseId: ex.id
            }));

            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: 'Selecione um exercicio para carregar',
                matchOnDescription: true
            });

            if (selected) {
                exerciseId = selected.exerciseId;
            }
        }

        if (exerciseId) {
            await loadExerciseToWorkspace(exerciseId, apiService);
        }
    });

    // Comando: Verificar Norminette
    const runNorminetteCommand = vscode.commands.registerCommand('treinoPro.runNorminette', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('Nenhum arquivo aberto');
            return;
        }

        const filePath = editor.document.uri.fsPath;
        if (!filePath.endsWith('.c') && !filePath.endsWith('.h')) {
            vscode.window.showWarningMessage('Norminette so funciona com arquivos .c e .h');
            return;
        }

        await editor.document.save();
        
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Executando Norminette...",
            cancellable: false
        }, async () => {
            const result = await norminetteService.check(filePath);
            const diagnostics = norminetteService.parseToDiagnostics(result, editor.document.uri);
            norminetteService.updateDiagnostics(diagnostics, editor.document.uri);
            
            if (result.success) {
                vscode.window.showInformationMessage('Norminette: Nenhum erro encontrado!');
            } else {
                const fixAction = 'Corrigir Automaticamente';
                const response = await vscode.window.showErrorMessage(
                    `Norminette: ${result.errorCount} erro(s), ${result.warningCount} aviso(s)`,
                    fixAction,
                    'Ver Erros'
                );
                
                if (response === fixAction) {
                    await fixAllNorminetteErrors(editor.document.uri);
                }
            }
        });
    });

    // Comando: Corrigir Todos os Erros de Norminette
    const fixAllNorminetteCommand = vscode.commands.registerCommand('treinoPro.fixAllNorminette', async (uri?: vscode.Uri) => {
        const targetUri = uri || vscode.window.activeTextEditor?.document.uri;
        if (!targetUri) {
            vscode.window.showWarningMessage('Nenhum arquivo aberto');
            return;
        }

        await fixAllNorminetteErrors(targetUri);
    });

    // Comando: Compilar e Testar
    const compileAndTestCommand = vscode.commands.registerCommand('treinoPro.compileAndTest', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('Nenhum arquivo aberto');
            return;
        }

        const filePath = editor.document.uri.fsPath;
        if (!filePath.endsWith('.c')) {
            vscode.window.showWarningMessage('Este comando so funciona com arquivos .c');
            return;
        }

        await editor.document.save();

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Compilando e testando...",
            cancellable: false
        }, async () => {
            const result = await compilerService.compileAndTest(filePath);
            
            if (result.compileSuccess) {
                if (result.testSuccess) {
                    vscode.window.showInformationMessage(
                        `Todos os ${result.testsRun} testes passaram!`
                    );
                } else {
                    vscode.window.showWarningMessage(
                        `${result.testsPassed}/${result.testsRun} testes passaram`
                    );
                }
                compilerService.showTestOutput(result.output);
            } else {
                vscode.window.showErrorMessage('Erro de compilacao');
                compilerService.showCompileErrors(result.compileErrors);
            }
        });
    });

    // Comando: Executar Moulinette
    const runMoulinetteCommand = vscode.commands.registerCommand('treinoPro.runMoulinette', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('Nenhum arquivo aberto');
            return;
        }

        const filePath = editor.document.uri.fsPath;
        if (!filePath.endsWith('.c')) {
            vscode.window.showWarningMessage('Moulinette so funciona com arquivos .c');
            return;
        }

        await editor.document.save();

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Executando Moulinette...",
            cancellable: false
        }, async () => {
            const result = await moulinetteService.runTests(filePath);
            moulinetteService.showResults(result);
        });
    });

    // Comando: Enviar Exercicio
    const submitExerciseCommand = vscode.commands.registerCommand('treinoPro.submitExercise', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('Nenhum arquivo aberto');
            return;
        }

        const confirm = await vscode.window.showWarningMessage(
            'Deseja enviar este exercicio para avaliacao?',
            'Sim',
            'Cancelar'
        );

        if (confirm === 'Sim') {
            await editor.document.save();
            const content = editor.document.getText();
            const filePath = editor.document.uri.fsPath;
            
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Enviando exercicio...",
                cancellable: false
            }, async () => {
                const result = await apiService.submitExercise(filePath, content);
                
                if (result.success) {
                    vscode.window.showInformationMessage(
                        `Exercicio enviado! Nota: ${result.score}/100`
                    );
                    progressProvider.refresh();
                } else {
                    vscode.window.showErrorMessage(`Erro ao enviar: ${result.error}`);
                }
            });
        }
    });

    // Comando: Mostrar Dica
    const showHintCommand = vscode.commands.registerCommand('treinoPro.showHint', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const exerciseId = getExerciseIdFromPath(editor.document.uri.fsPath);
        if (!exerciseId) {
            vscode.window.showWarningMessage('Nao foi possivel identificar o exercicio');
            return;
        }

        const hint = await apiService.getHint(exerciseId);
        if (hint) {
            vscode.window.showInformationMessage(`Dica: ${hint}`, { modal: true });
        }
    });

    // Comando: Sincronizar Progresso
    const syncProgressCommand = vscode.commands.registerCommand('treinoPro.syncProgress', async () => {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Sincronizando progresso...",
            cancellable: false
        }, async () => {
            const result = await syncService.sync();
            
            if (result.success) {
                vscode.window.showInformationMessage('Progresso sincronizado com sucesso!');
                exercisesProvider.refresh();
                progressProvider.refresh();
            } else {
                vscode.window.showErrorMessage(`Erro ao sincronizar: ${result.error}`);
            }
        });
    });

    // Comando: Mostrar Status das Ferramentas
    const showToolStatusCommand = vscode.commands.registerCommand('treinoPro.showToolStatus', async () => {
        await platformService.showToolStatusDialog();
    });

    // Comando: Mostrar Resumo de Diagnosticos
    const showDiagnosticsSummaryCommand = vscode.commands.registerCommand('treinoPro.showDiagnosticsSummary', async () => {
        await diagnosticsService.showDiagnosticsSummary();
    });

    // Comando: Adicionar Header 42
    const addHeader42Command = vscode.commands.registerCommand('treinoPro.addHeader42', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('Nenhum arquivo aberto');
            return;
        }

        const fileName = editor.document.fileName.split('/').pop() || editor.document.fileName.split('\\').pop() || 'file.c';
        const author = await vscode.window.showInputBox({
            prompt: 'Seu login da 42',
            placeHolder: 'ex: marvin',
            value: 'marvin'
        });

        if (author) {
            const header = norminetteService.generateHeader42(fileName, author);
            const edit = new vscode.WorkspaceEdit();
            edit.insert(editor.document.uri, new vscode.Position(0, 0), header);
            await vscode.workspace.applyEdit(edit);
            vscode.window.showInformationMessage('Header 42 adicionado!');
        }
    });

    // Comando: Adicionar Include Guard
    const addIncludeGuardCommand = vscode.commands.registerCommand('treinoPro.addIncludeGuard', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('Nenhum arquivo aberto');
            return;
        }

        if (!editor.document.fileName.endsWith('.h')) {
            vscode.window.showWarningMessage('Include guard so pode ser adicionado em arquivos .h');
            return;
        }

        const fileName = editor.document.fileName.split('/').pop() || editor.document.fileName.split('\\').pop() || 'file.h';
        const guard = norminetteService.generateIncludeGuard(fileName);
        
        const edit = new vscode.WorkspaceEdit();
        const text = editor.document.getText();
        
        // Encontrar posicao apos o header
        let insertPos = 0;
        const headerEnd = text.indexOf('*/');
        if (headerEnd > 0 && headerEnd < 500) {
            const nextLine = text.indexOf('\n', headerEnd);
            if (nextLine > 0) {
                insertPos = nextLine + 1;
            }
        }

        edit.insert(editor.document.uri, editor.document.positionAt(insertPos), guard.top);
        edit.insert(editor.document.uri, editor.document.positionAt(text.length), guard.bottom);
        
        await vscode.workspace.applyEdit(edit);
        vscode.window.showInformationMessage('Include guard adicionado!');
    });

    // Registrar todos os comandos
    context.subscriptions.push(
        openPanelCommand,
        loadExerciseCommand,
        runNorminetteCommand,
        fixAllNorminetteCommand,
        compileAndTestCommand,
        runMoulinetteCommand,
        submitExerciseCommand,
        showHintCommand,
        syncProgressCommand,
        showToolStatusCommand,
        showDiagnosticsSummaryCommand,
        addHeader42Command,
        addIncludeGuardCommand
    );

    // Auto-verificar Norminette ao salvar
    const config = vscode.workspace.getConfiguration('treinoPro');
    if (config.get('showNorminetteOnSave')) {
        vscode.workspace.onDidSaveTextDocument(async (document) => {
            if (document.languageId === 'c') {
                vscode.commands.executeCommand('treinoPro.runNorminette');
            }
        });
    }

    // Verificar requisitos minimos
    const requirements = await platformService.checkMinimumRequirements();
    if (!requirements.ok) {
        const installAction = 'Ver Instrucoes';
        const response = await vscode.window.showWarningMessage(
            `Ferramentas faltando: ${requirements.missing.join(', ')}`,
            installAction
        );
        
        if (response === installAction) {
            await platformService.showToolStatusDialog();
        }
    }

    // Mostrar mensagem de boas-vindas
    vscode.window.showInformationMessage(
        'Treino Pro ativado! Use Ctrl+Shift+P para abrir comandos.',
        'Abrir Painel',
        'Ver Ferramentas'
    ).then(selection => {
        if (selection === 'Abrir Painel') {
            vscode.commands.executeCommand('treinoPro.openPanel');
        } else if (selection === 'Ver Ferramentas') {
            vscode.commands.executeCommand('treinoPro.showToolStatus');
        }
    });
}

async function loadExerciseToWorkspace(exerciseId: string, apiService: ApiService) {
    const exercise = await apiService.getExercise(exerciseId);
    if (!exercise) {
        vscode.window.showErrorMessage('Exercicio nao encontrado');
        return;
    }

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('Abra uma pasta de trabalho primeiro');
        return;
    }

    const workspacePath = workspaceFolders[0].uri.fsPath;
    const exercisePath = vscode.Uri.file(`${workspacePath}/${exercise.folder}/${exercise.fileName}`);

    // Criar pasta se nao existir
    await vscode.workspace.fs.createDirectory(vscode.Uri.file(`${workspacePath}/${exercise.folder}`));

    // Criar arquivo com template incluindo header 42
    const norminetteService = new NorminetteService();
    const header = norminetteService.generateHeader42(exercise.fileName, 'marvin');
    const template = exercise.template || header;

    await vscode.workspace.fs.writeFile(exercisePath, Buffer.from(template));
    
    // Abrir arquivo
    const document = await vscode.workspace.openTextDocument(exercisePath);
    await vscode.window.showTextDocument(document);

    vscode.window.showInformationMessage(`Exercicio ${exercise.name} carregado!`);
}

function getExerciseIdFromPath(filePath: string): string | null {
    // Extrair ID do exercicio do caminho do arquivo
    const match = filePath.match(/ex(\d+)/);
    return match ? match[1] : null;
}

export function deactivate() {
    console.log('Treino Pro extension deactivated');
    
    // Limpar recursos
    platformService?.dispose();
    diagnosticsService?.dispose();
    copilotService?.dispose();
}
