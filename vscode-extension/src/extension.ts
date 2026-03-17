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

    // Inicializar painel de exercicios (adiado para o openPanelCommand)

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
        exercisePanelManager = ExercisePanelManager.createOrShowPanel(context, apiService);
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

    // Comando: Abrir Terminal Webytehub 42
    const openWebytehubTerminalCommand = vscode.commands.registerCommand('treinoPro.openWebytehubTerminal', async () => {
        // Garantir que a mini-moulinette esta sincronizada e corrigida automaticamente
        await ensureMiniMoulIsPatched();

        const config = vscode.workspace.getConfiguration('treinoPro');
        
        // Tentar encontrar mini-moulinette no workspace primeiro
        let miniMoulPath = config.get<string>('miniMoulinettePath');
        if (!miniMoulPath || miniMoulPath === '~/mini-moulinette') {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (workspaceFolders) {
                const workspaceRoot = workspaceFolders[0].uri.fsPath;
                const localMiniMoul = vscode.Uri.file(require('path').join(workspaceRoot, 'mini-moulinette'));
                try {
                    await vscode.workspace.fs.stat(localMiniMoul);
                    miniMoulPath = localMiniMoul.fsPath;
                } catch {
                    // Nao encontrado no root, manter o padrao do sistema
                    miniMoulPath = miniMoulPath || '~/mini-moulinette';
                }
            }
        }

        // Normalizar caminhos para diferentes shells
        const winPath = miniMoulPath!.replace(/\//g, '\\');
        const wslPath = miniMoulPath!.replace(/\\/g, '/').replace(/^([A-Za-z]):/, (match, drive) => `/mnt/${drive.toLowerCase()}`);
        const gitBashPath = miniMoulPath!.replace(/\\/g, '/').replace(/^([A-Za-z]):/, (match, drive) => `/${drive.toLowerCase()}`);
        
        const terminal = vscode.window.createTerminal('Webytehub 42');
        terminal.show();
        
        const isWindows = process.platform === 'win32';
        if (isWindows) {
            // No Windows, tentamos ser inteligentes sobre o shell
            const bestDistro = await platformService.selectBestDistro();
            const bashCmd = bestDistro ? `wsl -d ${bestDistro} bash` : 'bash';
            
            if (bestDistro) {
                terminal.sendText(`Write-Host "Ambiente Linux detectado: ${bestDistro}" -ForegroundColor Green`);
            }

            // Se for PowerShell
            terminal.sendText(`function webytehub-42 { Write-Host "Executando Norminette..." -ForegroundColor Cyan; norminette; Write-Host "Executando Mini-Moulinette..." -ForegroundColor Cyan; ${bashCmd} "${wslPath}/mini-moul.sh" }; function webytehub { if ($args[0] -eq "-42") { webytehub-42 } else { Write-Host "Comando invalido. Use: webytehub -42 ou webytehub-42" -ForegroundColor Red } }; function mini { ${bashCmd} "${wslPath}/mini-moul.sh" $args }`);
            
            // Adicionar aliases mini-C00 ate mini-C13
            for (let i = 0; i <= 13; i++) {
                const module = `C${i.toString().padStart(2, '0')}`;
                terminal.sendText(`function mini-${module} { mini ${module} }`);
            }
            
            terminal.sendText('Clear-Host');
            terminal.sendText('Write-Host "Terminal Webytehub pronto! (Sincronizacao Automatica Ok)" -ForegroundColor Green');
            terminal.sendText('Write-Host "Comandos disponiveis:" -ForegroundColor White');
            terminal.sendText('Write-Host "  webytehub -42 (Norminette + Testes)" -ForegroundColor Cyan');
            terminal.sendText('Write-Host "  mini [modulo] (ou mini-CXX)" -ForegroundColor Cyan');
        } else {
            terminal.sendText(`webytehub-42() { echo -e "\\033[36mExecutando Norminette...\\033[0m"; norminette; echo -e "\\033[36mExecutando Mini-Moulinette...\\033[0m"; bash "${wslPath}/mini-moul.sh"; }; webytehub() { if [ "$1" = "-42" ]; then webytehub-42; else echo -e "\\033[31mComando invalido. Use: webytehub -42 ou webytehub-42\\033[0m"; fi; }; mini() { bash "${wslPath}/mini-moul.sh" "$@"; }`);
            
            // Adicionar aliases mini-C00 ate mini-C13
            for (let i = 0; i <= 13; i++) {
                const module = `C${i.toString().padStart(2, '0')}`;
                terminal.sendText(`alias mini-${module}='mini ${module}'`);
            }

            terminal.sendText('clear');
            terminal.sendText('echo -e "\\033[32mTerminal Webytehub pronto! (Sincronizacao Automatica Ok)\\033[0m"');
            terminal.sendText('echo -e "\\033[37mComandos disponiveis:\\033[0m"');
            terminal.sendText('echo -e "  \\033[36mwebytehub -42\\033[0m (Norminette + Testes)"');
            terminal.sendText('echo -e "  \\033[36mmini [modulo]\\033[0m (ou mini-CXX)"');
        }
    });
    
    // Comando: Descomentar Codigo de Teste
    const uncommentTestingCodeCommand = vscode.commands.registerCommand('treinoPro.uncommentTestingCode', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('Nenhum arquivo aberto');
            return;
        }

        const text = editor.document.getText();
        
        // Regex para encontrar blocos comentados com #include ou main
        // 1. Descomentar // #include ou // int main
        let newText = text.replace(/^\s*\/\/\s*(#include\s+<[^>]+>)/gm, '$1');
        newText = newText.replace(/^\s*\/\/\s*(int\s+main[\s\S]*?^})/gm, '$1');
        
        // 2. Descomentar /* #include ... */ ou /* int main ... */
        newText = newText.replace(/\/\*\s*(#include\s+<[^>]+>)\s*\*\//g, '$1');
        
        // 3. Descomentar blocos multiline /* ... int main ... */
        // Tentamos encontrar o bloco de comentario que contem 'int main'
        newText = newText.replace(/\/\*([\s\S]*?int\s+main[\s\S]*?)\*\//g, '$1');

        if (text === newText) {
            vscode.window.showInformationMessage('Nenhum bloco de teste comentado encontrado.');
            return;
        }

        const edit = new vscode.WorkspaceEdit();
        const fullRange = new vscode.Range(
            editor.document.positionAt(0),
            editor.document.positionAt(text.length)
        );
        edit.replace(editor.document.uri, fullRange, newText);
        
        const success = await vscode.workspace.applyEdit(edit);
        if (success) {
            vscode.window.showInformationMessage('Codigo de teste descomentado!');
        }
    });

    // Comando: Reparar Mini-Moulinette
    const fixMiniMoulCommand = vscode.commands.registerCommand('treinoPro.fixMiniMoul', async () => {
        const success = await ensureMiniMoulIsPatched(true);
        if (success) {
            vscode.window.showInformationMessage('Mini-Moulinette reparada com sucesso!');
        }
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
        addIncludeGuardCommand,
        openWebytehubTerminalCommand,
        uncommentTestingCodeCommand,
        fixMiniMoulCommand
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

/**
 * Garante que o arquivo mini-moul.sh no workspace está atualizado e funcional.
 * @param showErrors Se true, mostra mensagens de erro ao usuário.
 */
async function ensureMiniMoulIsPatched(showErrors: boolean = false): Promise<boolean> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        return false;
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    const miniMoulPath = require('path').join(workspaceRoot, 'mini-moulinette', 'mini-moul.sh');
    
    // Verificar se existe a pasta mini-moulinette
    try {
        const fs = require('fs');
        if (!fs.existsSync(require('path').join(workspaceRoot, 'mini-moulinette'))) {
            return false;
        }

        const fixedContent = `#!/bin/bash

# ============================================================================
# MINI-MOULINETTE - Script de Inicializacao Robusto (Sincronizacao Automatica)
# ============================================================================

if [ -n "$BASH_SOURCE" ]; then
    SCRIPT_PATH="\${BASH_SOURCE[0]}"
else
    SCRIPT_PATH="$0"
fi
MINI_MOUL_ROOT=$(cd "$(dirname "$SCRIPT_PATH")" && pwd)

if [ ! -f "$MINI_MOUL_ROOT/mini-moul/config.sh" ]; then
    echo -e "\\033[31mErro: Arquivo de configuracao nao encontrado em: $MINI_MOUL_ROOT/mini-moul/config.sh\\033[0m"
    exit 1
fi

source "$MINI_MOUL_ROOT/mini-moul/config.sh"
assignment=NULL
ARG_PASSED=false

function handle_sigint {
  echo -e "\\n\${RED}Script interrompido pelo usuário. Limpando...\${DEFAULT}"
  rm -rf ./mini-moul_tmp
  exit 1
}

detect_assignment() {
  if [[ "$1" =~ ^C(0[0-9]|1[0-3])$ ]]; then
    assignment="$1"
    return 0
  fi
  local current_dir=$(basename "$(pwd)")
  if [[ "$current_dir" =~ ^C(0[0-9]|1[0-3])$ ]]; then
    assignment="$current_dir"
    return 0
  fi
  return 1
}

run_norminette() {
  if command -v norminette &> /dev/null; then
    echo -e "\${BLUE}Executando Norminette...\${DEFAULT}"
    norminette
  else
    echo -e "\${RED}Aviso: norminette nao encontrada. Pulando verificacao de estilo.\${DEFAULT}"
  fi
}

if [[ "$1" =~ ^C(0[0-9]|1[0-3])$ ]] && [ -d "$1" ]; then
    echo -e "\${BLUE}Entrando no diretorio $1...\${DEFAULT}"
    cd "$1"
    ARG_PASSED=true
fi

if detect_assignment "$1"; then
  echo -e "\${GREEN}Modulo detectado: \${assignment}\${DEFAULT}"
  run_norminette
  rm -rf ./mini-moul_tmp
  cp -rf "$MINI_MOUL_ROOT/mini-moul" ./mini-moul_tmp
  trap handle_sigint SIGINT
  cd mini-moul_tmp
  if [ -f "./test.sh" ]; then
      bash "./test.sh" "$assignment"
  else
      echo -e "\${RED}Erro: test.sh nao encontrado no core da moulinette.\${DEFAULT}"
  fi
  cd ..
  rm -rf ./mini-moul_tmp
else
  echo -e "\${RED}Erro: Diretorio atual (\$(basename "\$(pwd)")) ou argumento (\$1) nao e um modulo valido (C00 a C13).\${DEFAULT}"
  echo -e "\${RED}Uso: 'mini [C00-C13]' ou execute 'mini' dentro da pasta do modulo.\${DEFAULT}"
fi

if [ "$ARG_PASSED" = true ]; then
    cd ..
fi
`;
        fs.writeFileSync(miniMoulPath, fixedContent);
        return true;
    } catch (error) {
        if (showErrors) {
            vscode.window.showErrorMessage(`Erro ao sincronizar Mini-Moulinette: ${error}`);
        }
        return false;
    }
}
