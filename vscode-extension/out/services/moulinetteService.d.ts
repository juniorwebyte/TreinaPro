interface MoulinetteResult {
    success: boolean;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    testResults: TestResult[];
    compileErrors: string[];
    memoryLeaks: boolean;
    leakDetails?: string;
    executionTime: number;
}
interface TestResult {
    name: string;
    passed: boolean;
    expected: string;
    actual: string;
    input?: string;
    diff?: string;
    timeout?: boolean;
}
export declare class MoulinetteService {
    private outputChannel;
    private diagnosticCollection;
    constructor();
    runTests(filePath: string): Promise<MoulinetteResult>;
    private compile;
    private parseCompileErrors;
    private generateTestFile;
    private generateTestCase;
    private generateSwapTest;
    private generateFtTest;
    private generateStrlenTest;
    private generateStrcmpTest;
    private generateAtoiTest;
    private generateGenericOutputTest;
    private executeTests;
    private parseTestOutput;
    private checkMemoryLeaks;
    private runMiniMoulinetteTests;
    private executeMiniMoulinetteTests;
    private runGenericTests;
    private cleanupFiles;
    showResults(result: MoulinetteResult): void;
    dispose(): void;
}
export {};
//# sourceMappingURL=moulinetteService.d.ts.map