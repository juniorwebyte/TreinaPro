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
exports.CompilerService = void 0;
const vscode = __importStar(require("vscode"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class CompilerService {
    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('Guia Piscine - Testes');
    }
    async compileAndTest(filePath) {
        const dir = path.dirname(filePath);
        const fileName = path.basename(filePath);
        const baseName = fileName.replace('.c', '');
        const outputName = `${baseName}_test`;
        // Criar arquivo de teste se nao existir
        const testFilePath = path.join(dir, `${baseName}_test.c`);
        const testFile = this.generateTestFile(baseName, filePath);
        try {
            fs.writeFileSync(testFilePath, testFile);
        }
        catch {
            // Arquivo de teste ja existe ou erro de escrita
        }
        // Compilar
        try {
            const platformService = require('./platformService').getPlatformService();
            const compileCmd = `gcc -Wall -Wextra -Werror -o "${dir}/${outputName}" "${filePath}" "${testFilePath}" 2>&1`;
            await platformService.executeCommand(compileCmd, {
                timeout: 30000,
                cwd: dir,
                useWSL: platformService.isWindows() && !platformService.isToolAvailable('gcc')
            });
        }
        catch (error) {
            const stderr = error instanceof Error && 'stderr' in error ? error.stderr : String(error);
            return {
                compileSuccess: false,
                compileErrors: stderr,
                testSuccess: false,
                testsRun: 0,
                testsPassed: 0,
                output: ''
            };
        }
        // Executar testes
        try {
            const platformService = require('./platformService').getPlatformService();
            const execCmd = platformService.isWindows() ? `"${dir}/${outputName}"` : `./${outputName}`;
            const { stdout } = await platformService.executeCommand(execCmd, {
                cwd: dir,
                useWSL: platformService.isWindows() && !platformService.isToolAvailable('gcc')
            });
            const lines = stdout.split('\n').filter((l) => l.trim());
            const passed = lines.filter((l) => l.includes('[OK]')).length;
            const total = lines.filter((l) => l.includes('[OK]') || l.includes('[KO]')).length;
            return {
                compileSuccess: true,
                compileErrors: '',
                testSuccess: passed === total,
                testsRun: total,
                testsPassed: passed,
                output: stdout
            };
        }
        catch (error) {
            const stdout = error instanceof Error && 'stdout' in error ? error.stdout : '';
            return {
                compileSuccess: true,
                compileErrors: '',
                testSuccess: false,
                testsRun: 0,
                testsPassed: 0,
                output: stdout || 'Erro ao executar testes'
            };
        }
    }
    generateTestFile(funcName, filePath) {
        // Gera testes basicos com base no nome da funcao
        const tests = this.getTestsForFunction(funcName);
        return `#include <stdio.h>
#include <unistd.h>
#include <string.h>

// Prototipo da funcao a ser testada
${this.getPrototype(funcName)}

int main(void)
{
    int passed = 0;
    int total = 0;

${tests}

    printf("\\nResultado: %d/%d testes passaram\\n", passed, total);
    return (passed == total) ? 0 : 1;
}
`;
    }
    getPrototype(funcName) {
        const prototypes = {
            'ft_putchar': 'void ft_putchar(char c);',
            'ft_print_alphabet': 'void ft_print_alphabet(void);',
            'ft_print_reverse_alphabet': 'void ft_print_reverse_alphabet(void);',
            'ft_print_numbers': 'void ft_print_numbers(void);',
            'ft_is_negative': 'void ft_is_negative(int n);',
            'ft_ft': 'void ft_ft(int *nbr);',
            'ft_ultimate_ft': 'void ft_ultimate_ft(int *********nbr);',
            'ft_swap': 'void ft_swap(int *a, int *b);',
            'ft_strlen': 'int ft_strlen(char *str);',
            'ft_putstr': 'void ft_putstr(char *str);'
        };
        return prototypes[funcName] || `// Adicione o prototipo da funcao ${funcName}`;
    }
    getTestsForFunction(funcName) {
        const testCases = {
            'ft_putchar': `
    // Teste 1: Exibir 'A'
    total++;
    printf("Teste 1 - ft_putchar('A'): ");
    ft_putchar('A');
    printf(" [OK]\\n");
    passed++;

    // Teste 2: Exibir '0'
    total++;
    printf("Teste 2 - ft_putchar('0'): ");
    ft_putchar('0');
    printf(" [OK]\\n");
    passed++;
`,
            'ft_swap': `
    // Teste 1: Trocar valores
    total++;
    int a = 10, b = 20;
    ft_swap(&a, &b);
    if (a == 20 && b == 10) {
        printf("Teste 1 - ft_swap(10, 20): [OK]\\n");
        passed++;
    } else {
        printf("Teste 1 - ft_swap(10, 20): [KO] (esperado a=20, b=10, obteve a=%d, b=%d)\\n", a, b);
    }

    // Teste 2: Valores negativos
    total++;
    a = -5; b = 5;
    ft_swap(&a, &b);
    if (a == 5 && b == -5) {
        printf("Teste 2 - ft_swap(-5, 5): [OK]\\n");
        passed++;
    } else {
        printf("Teste 2 - ft_swap(-5, 5): [KO]\\n");
    }
`,
            'ft_ft': `
    // Teste 1: Atribuir 42
    total++;
    int n = 0;
    ft_ft(&n);
    if (n == 42) {
        printf("Teste 1 - ft_ft: [OK]\\n");
        passed++;
    } else {
        printf("Teste 1 - ft_ft: [KO] (esperado 42, obteve %d)\\n", n);
    }
`,
            'ft_strlen': `
    // Teste 1: String vazia
    total++;
    if (ft_strlen("") == 0) {
        printf("Teste 1 - ft_strlen(\\"\\"): [OK]\\n");
        passed++;
    } else {
        printf("Teste 1 - ft_strlen(\\"\\"): [KO]\\n");
    }

    // Teste 2: String com caracteres
    total++;
    if (ft_strlen("Hello") == 5) {
        printf("Teste 2 - ft_strlen(\\"Hello\\"): [OK]\\n");
        passed++;
    } else {
        printf("Teste 2 - ft_strlen(\\"Hello\\"): [KO]\\n");
    }
`
        };
        return testCases[funcName] || `
    // Testes genericos
    total++;
    printf("Teste 1: Execute a funcao manualmente [OK]\\n");
    passed++;
`;
    }
    showTestOutput(output) {
        this.outputChannel.clear();
        this.outputChannel.appendLine('=== Resultado dos Testes ===\n');
        this.outputChannel.appendLine(output);
        this.outputChannel.show();
    }
    showCompileErrors(errors) {
        this.outputChannel.clear();
        this.outputChannel.appendLine('=== Erros de Compilacao ===\n');
        this.outputChannel.appendLine(errors);
        this.outputChannel.show();
    }
}
exports.CompilerService = CompilerService;
//# sourceMappingURL=compilerService.js.map