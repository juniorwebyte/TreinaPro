import * as vscode from 'vscode';
import { exec, execSync } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

const execAsync = promisify(exec);

// ============================================================================
// PLATFORM SERVICE - Deteccao e Configuracao Multiplataforma
// ============================================================================

export type Platform = 'linux' | 'darwin' | 'win32' | 'wsl';

export interface ToolStatus {
    name: string;
    available: boolean;
    version?: string;
    path?: string;
    installInstructions?: string;
}

export interface PlatformInfo {
    platform: Platform;
    isWSL: boolean;
    arch: string;
    homeDir: string;
    shell: string;
    pathSeparator: string;
}

export interface ToolPaths {
    norminette?: string;
    gcc?: string;
    clang?: string;
    make?: string;
    valgrind?: string;
    python?: string;
    git?: string;
    brew?: string;
    apt?: string;
    pip?: string;
}

const TOOL_INSTALL_INSTRUCTIONS: Record<string, Record<Platform, string>> = {
    norminette: {
        linux: 'pip3 install norminette ou sudo apt install python3-pip && pip3 install norminette',
        darwin: 'pip3 install norminette ou brew install python && pip3 install norminette',
        win32: 'pip install norminette (requer Python instalado)',
        wsl: 'pip3 install norminette'
    },
    gcc: {
        linux: 'sudo apt install build-essential',
        darwin: 'xcode-select --install ou brew install gcc',
        win32: 'Instale MinGW ou use WSL: https://code.visualstudio.com/docs/cpp/config-mingw',
        wsl: 'sudo apt install build-essential'
    },
    clang: {
        linux: 'sudo apt install clang',
        darwin: 'xcode-select --install',
        win32: 'Instale LLVM: https://releases.llvm.org/download.html',
        wsl: 'sudo apt install clang'
    },
    valgrind: {
        linux: 'sudo apt install valgrind',
        darwin: 'brew install valgrind (limitado no macOS moderno)',
        win32: 'Valgrind nao disponivel nativamente no Windows. Use WSL.',
        wsl: 'sudo apt install valgrind'
    },
    make: {
        linux: 'sudo apt install make',
        darwin: 'xcode-select --install',
        win32: 'Instale MinGW ou use WSL',
        wsl: 'sudo apt install make'
    },
    git: {
        linux: 'sudo apt install git',
        darwin: 'xcode-select --install ou brew install git',
        win32: 'https://git-scm.com/download/win',
        wsl: 'sudo apt install git'
    },
    python: {
        linux: 'sudo apt install python3 python3-pip',
        darwin: 'brew install python ou https://www.python.org/downloads/',
        win32: 'https://www.python.org/downloads/',
        wsl: 'sudo apt install python3 python3-pip'
    }
};

export class PlatformService {
    private platformInfo: PlatformInfo | null = null;
    private toolPaths: ToolPaths = {};
    private toolStatus: Map<string, ToolStatus> = new Map();
    private outputChannel: vscode.OutputChannel;
    private statusBarItem: vscode.StatusBarItem;
    private initialized = false;

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('Treino Pro - Platform');
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right, 
            99
        );
    }

    async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }

        this.outputChannel.appendLine('Inicializando deteccao de plataforma...');

        // Detectar plataforma
        this.platformInfo = await this.detectPlatform();
        this.outputChannel.appendLine(`Plataforma detectada: ${this.platformInfo.platform}`);
        this.outputChannel.appendLine(`WSL: ${this.platformInfo.isWSL}`);
        this.outputChannel.appendLine(`Arquitetura: ${this.platformInfo.arch}`);
        this.outputChannel.appendLine(`Shell: ${this.platformInfo.shell}`);

        // Detectar ferramentas disponiveis
        await this.detectTools();

        // Atualizar status bar
        this.updateStatusBar();

        this.initialized = true;
    }

    private async detectPlatform(): Promise<PlatformInfo> {
        const platform = os.platform() as Platform;
        const arch = os.arch();
        const homeDir = os.homedir();
        
        // Detectar WSL
        let isWSL = false;
        if (platform === 'linux') {
            try {
                const releaseInfo = fs.readFileSync('/proc/version', 'utf8');
                isWSL = releaseInfo.toLowerCase().includes('microsoft') || 
                        releaseInfo.toLowerCase().includes('wsl');
            } catch {
                // Nao e WSL ou nao conseguiu ler
            }
        }

        // Detectar shell padrao
        let shell = process.env.SHELL || '';
        if (platform === 'win32') {
            shell = process.env.COMSPEC || 'cmd.exe';
        }

        return {
            platform: isWSL ? 'wsl' : platform,
            isWSL,
            arch,
            homeDir,
            shell,
            pathSeparator: platform === 'win32' ? ';' : ':'
        };
    }

    private async detectTools(): Promise<void> {
        const tools = ['norminette', 'gcc', 'clang', 'make', 'valgrind', 'python', 'git'];
        
        const detectionPromises = tools.map(tool => this.detectTool(tool));
        await Promise.all(detectionPromises);
    }

    private async detectTool(toolName: string): Promise<void> {
        const status: ToolStatus = {
            name: toolName,
            available: false
        };

        try {
            // Comando para verificar versao
            let versionCmd: string;
            switch (toolName) {
                case 'norminette':
                    versionCmd = 'norminette --version';
                    break;
                case 'gcc':
                    versionCmd = 'gcc --version';
                    break;
                case 'clang':
                    versionCmd = 'clang --version';
                    break;
                case 'make':
                    versionCmd = 'make --version';
                    break;
                case 'valgrind':
                    versionCmd = 'valgrind --version';
                    break;
                case 'python':
                    versionCmd = this.getPlatform() === 'win32' ? 'python --version' : 'python3 --version';
                    break;
                case 'git':
                    versionCmd = 'git --version';
                    break;
                default:
                    versionCmd = `${toolName} --version`;
            }

            const { stdout } = await execAsync(versionCmd, { timeout: 5000 });
            status.available = true;
            status.version = this.parseVersion(stdout.trim(), toolName);

            // Encontrar caminho completo
            const whichCmd = this.getPlatform() === 'win32' ? 'where' : 'which';
            try {
                const { stdout: pathOutput } = await execAsync(`${whichCmd} ${toolName}`, { timeout: 5000 });
                status.path = pathOutput.trim().split('\n')[0];
                this.toolPaths[toolName as keyof ToolPaths] = status.path;
            } catch {
                // Nao conseguiu encontrar caminho, mas ferramenta esta disponivel
            }

            this.outputChannel.appendLine(`[OK] ${toolName}: ${status.version || 'disponivel'}`);
        } catch {
            status.available = false;
            const platform = this.getPlatform();
            status.installInstructions = TOOL_INSTALL_INSTRUCTIONS[toolName]?.[platform] || 
                `Instale ${toolName} usando o gerenciador de pacotes do seu sistema`;
            
            this.outputChannel.appendLine(`[--] ${toolName}: nao encontrado`);
        }

        this.toolStatus.set(toolName, status);
    }

    private parseVersion(output: string, toolName: string): string {
        // Extrair versao do output
        const lines = output.split('\n');
        const firstLine = lines[0] || '';

        switch (toolName) {
            case 'norminette':
                const normMatch = firstLine.match(/(\d+\.\d+\.\d+)/);
                return normMatch ? normMatch[1] : firstLine;
            case 'gcc':
            case 'clang':
                const compilerMatch = firstLine.match(/(\d+\.\d+(\.\d+)?)/);
                return compilerMatch ? compilerMatch[1] : firstLine;
            case 'python':
                const pythonMatch = firstLine.match(/Python (\d+\.\d+\.\d+)/);
                return pythonMatch ? pythonMatch[1] : firstLine;
            case 'valgrind':
                const valgrindMatch = firstLine.match(/valgrind-(\d+\.\d+\.\d+)/);
                return valgrindMatch ? valgrindMatch[1] : firstLine;
            case 'git':
                const gitMatch = firstLine.match(/git version (\d+\.\d+\.\d+)/);
                return gitMatch ? gitMatch[1] : firstLine;
            default:
                const genericMatch = firstLine.match(/(\d+\.\d+(\.\d+)?)/);
                return genericMatch ? genericMatch[1] : firstLine;
        }
    }

    private updateStatusBar(): void {
        const norminette = this.toolStatus.get('norminette');
        const gcc = this.toolStatus.get('gcc');
        
        if (norminette?.available && gcc?.available) {
            this.statusBarItem.text = '$(check) 42 Tools OK';
            this.statusBarItem.tooltip = this.getToolSummary();
            this.statusBarItem.backgroundColor = undefined;
        } else {
            const missing: string[] = [];
            if (!norminette?.available) missing.push('norminette');
            if (!gcc?.available) missing.push('gcc');
            
            this.statusBarItem.text = `$(warning) 42 Tools: ${missing.join(', ')} faltando`;
            this.statusBarItem.tooltip = 'Clique para ver como instalar ferramentas';
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        }

        this.statusBarItem.command = 'treinoPro.showToolStatus';
        this.statusBarItem.show();
    }

    private getToolSummary(): string {
        const lines: string[] = ['Ferramentas da 42:'];
        
        for (const [name, status] of this.toolStatus) {
            const icon = status.available ? '✓' : '✗';
            const version = status.version ? ` v${status.version}` : '';
            lines.push(`${icon} ${name}${version}`);
        }

        lines.push('');
        lines.push(`Plataforma: ${this.platformInfo?.platform || 'desconhecida'}`);
        if (this.platformInfo?.isWSL) {
            lines.push('(WSL detectado)');
        }

        return lines.join('\n');
    }

    // ============================================================================
    // APIs Publicas
    // ============================================================================

    getPlatform(): Platform {
        return this.platformInfo?.platform || os.platform() as Platform;
    }

    isWSL(): boolean {
        return this.platformInfo?.isWSL || false;
    }

    isWindows(): boolean {
        return this.getPlatform() === 'win32';
    }

    isMac(): boolean {
        return this.getPlatform() === 'darwin';
    }

    isLinux(): boolean {
        return this.getPlatform() === 'linux' || this.getPlatform() === 'wsl';
    }

    getToolStatus(toolName: string): ToolStatus | undefined {
        return this.toolStatus.get(toolName);
    }

    getAllToolStatus(): ToolStatus[] {
        return Array.from(this.toolStatus.values());
    }

    isToolAvailable(toolName: string): boolean {
        return this.toolStatus.get(toolName)?.available || false;
    }

    getToolPath(toolName: string): string | undefined {
        return this.toolPaths[toolName as keyof ToolPaths];
    }

    // Executar comando adaptado para a plataforma
    async executeCommand(
        command: string, 
        options: { cwd?: string; timeout?: number; useWSL?: boolean } = {}
    ): Promise<{ stdout: string; stderr: string }> {
        let finalCommand = command;

        // No Windows, se WSL esta disponivel e foi solicitado, usar WSL
        if (this.isWindows() && options.useWSL) {
            finalCommand = `wsl ${command}`;
        }

        // No Windows puro, ajustar comandos
        if (this.isWindows() && !options.useWSL) {
            // Substituir comandos Unix por equivalentes Windows
            finalCommand = this.translateCommand(command);
        }

        return execAsync(finalCommand, {
            cwd: options.cwd,
            timeout: options.timeout || 30000,
            env: { ...process.env, LANG: 'en_US.UTF-8' }
        });
    }

    private translateCommand(command: string): string {
        // Traducoes basicas Unix -> Windows
        let translated = command;
        
        const translations: Record<string, string> = {
            'which ': 'where ',
            'rm -rf ': 'rmdir /s /q ',
            'rm ': 'del /f ',
            'cp ': 'copy ',
            'mv ': 'move ',
            'cat ': 'type ',
            'ls ': 'dir ',
            'clear': 'cls',
            'pwd': 'cd',
        };

        for (const [unix, win] of Object.entries(translations)) {
            if (translated.startsWith(unix)) {
                translated = win + translated.slice(unix.length);
            }
        }

        return translated;
    }

    // Obter comando de compilacao para a plataforma
    getCompileCommand(
        sourceFiles: string[], 
        outputPath: string, 
        flags: string[] = ['-Wall', '-Wextra', '-Werror']
    ): string {
        const compiler = this.isToolAvailable('gcc') ? 'gcc' : 
                        this.isToolAvailable('clang') ? 'clang' : 'gcc';
        
        const flagsStr = flags.join(' ');
        const sources = sourceFiles.map(f => `"${f}"`).join(' ');
        
        return `${compiler} ${flagsStr} -o "${outputPath}" ${sources}`;
    }

    // Obter comando valgrind para a plataforma
    getValgrindCommand(executablePath: string): string | null {
        if (!this.isToolAvailable('valgrind')) {
            return null;
        }

        // Valgrind nao funciona nativamente no Windows
        if (this.isWindows() && !this.isWSL()) {
            return null;
        }

        return `valgrind --leak-check=full --show-leak-kinds=all --track-origins=yes "${executablePath}"`;
    }

    // Obter comando norminette para a plataforma
    getNorminetteCommand(filePath: string): string {
        const normPath = this.getToolPath('norminette') || 'norminette';
        return `"${normPath}" "${filePath}"`;
    }

    // Mostrar dialogo com status das ferramentas
    async showToolStatusDialog(): Promise<void> {
        const items: vscode.QuickPickItem[] = [];

        for (const [name, status] of this.toolStatus) {
            const icon = status.available ? '$(check)' : '$(x)';
            const version = status.version ? ` v${status.version}` : '';
            
            items.push({
                label: `${icon} ${name}${version}`,
                description: status.available ? status.path : 'Nao instalado',
                detail: status.available ? undefined : status.installInstructions
            });
        }

        items.push({ label: '', kind: vscode.QuickPickItemKind.Separator });
        items.push({
            label: '$(refresh) Verificar novamente',
            description: 'Re-detectar todas as ferramentas'
        });

        if (!this.isToolAvailable('norminette')) {
            items.push({
                label: '$(cloud-download) Instalar Norminette',
                description: 'pip3 install norminette'
            });
        }

        const selected = await vscode.window.showQuickPick(items, {
            title: 'Ferramentas da 42',
            placeHolder: 'Status das ferramentas de desenvolvimento'
        });

        if (selected?.label.includes('Verificar novamente')) {
            this.initialized = false;
            await this.initialize();
            vscode.window.showInformationMessage('Ferramentas re-detectadas!');
        } else if (selected?.label.includes('Instalar Norminette')) {
            await this.installNorminette();
        }
    }

    private async installNorminette(): Promise<void> {
        const terminal = vscode.window.createTerminal('Instalar Norminette');
        terminal.show();

        const platform = this.getPlatform();
        
        switch (platform) {
            case 'darwin':
                terminal.sendText('pip3 install norminette');
                break;
            case 'linux':
            case 'wsl':
                terminal.sendText('pip3 install --user norminette');
                break;
            case 'win32':
                terminal.sendText('pip install norminette');
                break;
        }

        vscode.window.showInformationMessage(
            'Instalando Norminette... Apos concluido, reinicie o VSCode.',
            'Verificar'
        ).then(selection => {
            if (selection === 'Verificar') {
                this.initialized = false;
                this.initialize();
            }
        });
    }

    // Converter caminhos entre plataformas
    normalizePath(filePath: string): string {
        if (this.isWindows()) {
            return filePath.replace(/\//g, '\\');
        }
        return filePath.replace(/\\/g, '/');
    }

    // Converter caminho Windows para WSL
    toWSLPath(windowsPath: string): string {
        if (!this.isWindows()) {
            return windowsPath;
        }
        
        // C:\Users\... -> /mnt/c/Users/...
        const match = windowsPath.match(/^([a-zA-Z]):\\/);
        if (match) {
            const drive = match[1].toLowerCase();
            return `/mnt/${drive}${windowsPath.slice(2).replace(/\\/g, '/')}`;
        }
        
        return windowsPath.replace(/\\/g, '/');
    }

    // Converter caminho WSL para Windows
    toWindowsPath(wslPath: string): string {
        if (!wslPath.startsWith('/mnt/')) {
            return wslPath;
        }

        // /mnt/c/Users/... -> C:\Users\...
        const match = wslPath.match(/^\/mnt\/([a-z])\/(.*)/);
        if (match) {
            const drive = match[1].toUpperCase();
            const rest = match[2].replace(/\//g, '\\');
            return `${drive}:\\${rest}`;
        }

        return wslPath;
    }

    // Verificar requisitos minimos para a extensao
    async checkMinimumRequirements(): Promise<{ ok: boolean; missing: string[] }> {
        const required = ['gcc'];
        const recommended = ['norminette', 'make'];
        const missing: string[] = [];

        for (const tool of required) {
            if (!this.isToolAvailable(tool)) {
                missing.push(tool);
            }
        }

        return {
            ok: missing.length === 0,
            missing
        };
    }

    // Obter instrucoes de instalacao para uma ferramenta
    getInstallInstructions(toolName: string): string {
        const platform = this.getPlatform();
        return TOOL_INSTALL_INSTRUCTIONS[toolName]?.[platform] || 
            `Instale ${toolName} usando o gerenciador de pacotes do seu sistema`;
    }

    dispose(): void {
        this.outputChannel.dispose();
        this.statusBarItem.dispose();
    }
}

// Singleton para uso global
let platformServiceInstance: PlatformService | null = null;

export function getPlatformService(): PlatformService {
    if (!platformServiceInstance) {
        platformServiceInstance = new PlatformService();
    }
    return platformServiceInstance;
}
