interface CompileResult {
    compileSuccess: boolean;
    compileErrors: string;
    testSuccess: boolean;
    testsRun: number;
    testsPassed: number;
    output: string;
}
export declare class CompilerService {
    private outputChannel;
    private terminal;
    constructor();
    compileAndTest(filePath: string): Promise<CompileResult>;
    private generateTestFile;
    private getPrototype;
    private getTestsForFunction;
    showTestOutput(output: string): void;
    showCompileErrors(errors: string): void;
}
export {};
//# sourceMappingURL=compilerService.d.ts.map