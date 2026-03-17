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
    wslDistro?: string;
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
export declare class PlatformService {
    private platformInfo;
    private toolPaths;
    private toolStatus;
    private outputChannel;
    private statusBarItem;
    private initialized;
    constructor();
    initialize(): Promise<void>;
    private detectPlatform;
    private detectTools;
    private detectTool;
    private parseVersion;
    private updateStatusBar;
    private getToolSummary;
    getPlatform(): Platform;
    isWSL(): boolean;
    isWindows(): boolean;
    isMac(): boolean;
    isLinux(): boolean;
    getToolStatus(toolName: string): ToolStatus | undefined;
    getAllToolStatus(): ToolStatus[];
    isToolAvailable(toolName: string): boolean;
    getToolPath(toolName: string): string | undefined;
    executeCommand(command: string, options?: {
        cwd?: string;
        timeout?: number;
        useWSL?: boolean;
    }): Promise<{
        stdout: string;
        stderr: string;
    }>;
    private translateCommand;
    getCompileCommand(sourceFiles: string[], outputPath: string, flags?: string[]): string;
    getValgrindCommand(executablePath: string): string | null;
    getNorminetteCommand(filePath: string): string;
    showToolStatusDialog(): Promise<void>;
    private installNorminette;
    normalizePath(filePath: string): string;
    toWSLPath(windowsPath: string): string;
    toWindowsPath(wslPath: string): string;
    getWSLDistributions(): Promise<string[]>;
    selectBestDistro(): Promise<string | undefined>;
    checkMinimumRequirements(): Promise<{
        ok: boolean;
        missing: string[];
    }>;
    getInstallInstructions(toolName: string): string;
    dispose(): void;
}
export declare function getPlatformService(): PlatformService;
//# sourceMappingURL=platformService.d.ts.map