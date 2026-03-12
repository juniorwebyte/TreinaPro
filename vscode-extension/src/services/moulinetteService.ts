import * as vscode from 'vscode';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import { getPlatformService } from './platformService';

const execAsync = promisify(exec);

// ============================================================================
// MOULINETTE SERVICE - Testes automatizados no padrao 42
// ============================================================================

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

interface ExerciseTest {
    name: string;
    prototype: string;
    tests: TestCase[];
}

interface TestCase {
    description: string;
    input?: string;
    args?: string[];
    expected: string;
    expectedOutput?: string;
    compareFunction?: boolean;
}

// Banco de testes para exercicios da Piscine
const EXERCISE_TESTS: Record<string, ExerciseTest> = {
    'ft_putchar': {
        name: 'ft_putchar',
        prototype: 'void ft_putchar(char c);',
        tests: [
            { description: 'Imprimir A', args: ["'A'"], expected: 'A' },
            { description: 'Imprimir 0', args: ["'0'"], expected: '0' },
            { description: 'Imprimir newline', args: ["'\\n'"], expected: '\n' },
            { description: 'Imprimir espaco', args: ["' '"], expected: ' ' },
            { description: 'Imprimir caractere especial', args: ["'@'"], expected: '@' },
        ]
    },
    'ft_print_alphabet': {
        name: 'ft_print_alphabet',
        prototype: 'void ft_print_alphabet(void);',
        tests: [
            { description: 'Imprimir alfabeto minusculo', expected: 'abcdefghijklmnopqrstuvwxyz' },
        ]
    },
    'ft_print_reverse_alphabet': {
        name: 'ft_print_reverse_alphabet',
        prototype: 'void ft_print_reverse_alphabet(void);',
        tests: [
            { description: 'Imprimir alfabeto reverso', expected: 'zyxwvutsrqponmlkjihgfedcba' },
        ]
    },
    'ft_print_numbers': {
        name: 'ft_print_numbers',
        prototype: 'void ft_print_numbers(void);',
        tests: [
            { description: 'Imprimir numeros', expected: '0123456789' },
        ]
    },
    'ft_is_negative': {
        name: 'ft_is_negative',
        prototype: 'void ft_is_negative(int n);',
        tests: [
            { description: 'Numero negativo -1', args: ['-1'], expected: 'N' },
            { description: 'Numero negativo -42', args: ['-42'], expected: 'N' },
            { description: 'Zero', args: ['0'], expected: 'P' },
            { description: 'Numero positivo 1', args: ['1'], expected: 'P' },
            { description: 'Numero positivo 42', args: ['42'], expected: 'P' },
        ]
    },
    'ft_ft': {
        name: 'ft_ft',
        prototype: 'void ft_ft(int *nbr);',
        tests: [
            { description: 'Atribuir 42', expected: '42', compareFunction: true },
        ]
    },
    'ft_swap': {
        name: 'ft_swap',
        prototype: 'void ft_swap(int *a, int *b);',
        tests: [
            { description: 'Trocar 10 e 20', args: ['10', '20'], expected: '20 10', compareFunction: true },
            { description: 'Trocar -5 e 5', args: ['-5', '5'], expected: '5 -5', compareFunction: true },
            { description: 'Trocar 0 e 0', args: ['0', '0'], expected: '0 0', compareFunction: true },
            { description: 'Trocar INT_MAX e INT_MIN', args: ['2147483647', '-2147483648'], expected: '-2147483648 2147483647', compareFunction: true },
        ]
    },
    'ft_div_mod': {
        name: 'ft_div_mod',
        prototype: 'void ft_div_mod(int a, int b, int *div, int *mod);',
        tests: [
            { description: '10 / 3', args: ['10', '3'], expected: '3 1', compareFunction: true },
            { description: '15 / 4', args: ['15', '4'], expected: '3 3', compareFunction: true },
            { description: '0 / 5', args: ['0', '5'], expected: '0 0', compareFunction: true },
        ]
    },
    'ft_ultimate_ft': {
        name: 'ft_ultimate_ft',
        prototype: 'void ft_ultimate_ft(int *********nbr);',
        tests: [
            { description: '9 ponteiros para 42', expected: '42', compareFunction: true },
        ]
    },
    'ft_strlen': {
        name: 'ft_strlen',
        prototype: 'int ft_strlen(char *str);',
        tests: [
            { description: 'String vazia', args: ['""'], expected: '0', compareFunction: true },
            { description: 'Hello', args: ['"Hello"'], expected: '5', compareFunction: true },
            { description: 'String longa', args: ['"Hello, World!"'], expected: '13', compareFunction: true },
            { description: 'Apenas espacos', args: ['"   "'], expected: '3', compareFunction: true },
        ]
    },
    'ft_putstr': {
        name: 'ft_putstr',
        prototype: 'void ft_putstr(char *str);',
        tests: [
            { description: 'String Hello', args: ['"Hello"'], expected: 'Hello' },
            { description: 'String vazia', args: ['""'], expected: '' },
            { description: 'String com espacos', args: ['"Hello World"'], expected: 'Hello World' },
        ]
    },
    'ft_putnbr': {
        name: 'ft_putnbr',
        prototype: 'void ft_putnbr(int nb);',
        tests: [
            { description: 'Zero', args: ['0'], expected: '0' },
            { description: 'Positivo 42', args: ['42'], expected: '42' },
            { description: 'Negativo -42', args: ['-42'], expected: '-42' },
            { description: 'INT_MAX', args: ['2147483647'], expected: '2147483647' },
            { description: 'INT_MIN', args: ['-2147483648'], expected: '-2147483648' },
        ]
    },
    'ft_atoi': {
        name: 'ft_atoi',
        prototype: 'int ft_atoi(char *str);',
        tests: [
            { description: 'Numero simples', args: ['"42"'], expected: '42', compareFunction: true },
            { description: 'Numero negativo', args: ['"-42"'], expected: '-42', compareFunction: true },
            { description: 'Com espacos antes', args: ['"   42"'], expected: '42', compareFunction: true },
            { description: 'Com tabs antes', args: ['"\\t\\n  42"'], expected: '42', compareFunction: true },
            { description: 'Com sinais multiplos', args: ['"--42"'], expected: '0', compareFunction: true },
            { description: 'Zero', args: ['"0"'], expected: '0', compareFunction: true },
        ]
    },
    'ft_strcmp': {
        name: 'ft_strcmp',
        prototype: 'int ft_strcmp(char *s1, char *s2);',
        tests: [
            { description: 'Strings iguais', args: ['"abc"', '"abc"'], expected: '0', compareFunction: true },
            { description: 's1 > s2', args: ['"abd"', '"abc"'], expected: '>0', compareFunction: true },
            { description: 's1 < s2', args: ['"abc"', '"abd"'], expected: '<0', compareFunction: true },
            { description: 'String vazia', args: ['""', '""'], expected: '0', compareFunction: true },
        ]
    },
    'ft_strncmp': {
        name: 'ft_strncmp',
        prototype: 'int ft_strncmp(char *s1, char *s2, unsigned int n);',
        tests: [
            { description: 'Comparar 3 chars iguais', args: ['"abc"', '"abd"', '2'], expected: '0', compareFunction: true },
            { description: 'Comparar n=0', args: ['"abc"', '"xyz"', '0'], expected: '0', compareFunction: true },
            { description: 'Strings diferentes', args: ['"abc"', '"abd"', '3'], expected: '<0', compareFunction: true },
        ]
    },
    'ft_strcpy': {
        name: 'ft_strcpy',
        prototype: 'char *ft_strcpy(char *dest, char *src);',
        tests: [
            { description: 'Copiar Hello', args: ['"Hello"'], expected: 'Hello', compareFunction: true },
            { description: 'Copiar vazia', args: ['""'], expected: '', compareFunction: true },
        ]
    },
    'ft_strncpy': {
        name: 'ft_strncpy',
        prototype: 'char *ft_strncpy(char *dest, char *src, unsigned int n);',
        tests: [
            { description: 'Copiar 3 chars', args: ['"Hello"', '3'], expected: 'Hel', compareFunction: true },
            { description: 'n maior que src', args: ['"Hi"', '5'], expected: 'Hi', compareFunction: true },
        ]
    },
    'ft_strcat': {
        name: 'ft_strcat',
        prototype: 'char *ft_strcat(char *dest, char *src);',
        tests: [
            { description: 'Concatenar strings', args: ['"Hello"', '" World"'], expected: 'Hello World', compareFunction: true },
            { description: 'Concatenar vazia', args: ['"Hello"', '""'], expected: 'Hello', compareFunction: true },
        ]
    },
    'ft_strdup': {
        name: 'ft_strdup',
        prototype: 'char *ft_strdup(char *src);',
        tests: [
            { description: 'Duplicar Hello', args: ['"Hello"'], expected: 'Hello', compareFunction: true },
            { description: 'Duplicar vazia', args: ['""'], expected: '', compareFunction: true },
        ]
    },
    // === EXERCICIOS ADICIONAIS C00-C07 ===
    'ft_print_comb': {
        name: 'ft_print_comb',
        prototype: 'void ft_print_comb(void);',
        tests: [
            { description: 'Todas combinacoes de 3 digitos', expected: '012, 013, 014, 015, 016, 017, 018, 019, 023' },
        ]
    },
    'ft_print_comb2': {
        name: 'ft_print_comb2',
        prototype: 'void ft_print_comb2(void);',
        tests: [
            { description: 'Combinacoes de 2 numeros 00-99', expected: '00 01, 00 02, 00 03' },
        ]
    },
    'ft_print_combn': {
        name: 'ft_print_combn',
        prototype: 'void ft_print_combn(int n);',
        tests: [
            { description: 'Combinacoes com n=2', args: ['2'], expected: '01, 02, 03, 04' },
        ]
    },
    'ft_strchr': {
        name: 'ft_strchr',
        prototype: 'char *ft_strchr(const char *s, int c);',
        tests: [
            { description: 'Encontrar a em "abcdef"', args: ['"abcdef"', "'a'"], expected: 'abcdef', compareFunction: true },
            { description: 'Encontrar d em "abcdef"', args: ['"abcdef"', "'d'"], expected: 'def', compareFunction: true },
            { description: 'Nao encontrar', args: ['"abcdef"', "'z'"], expected: 'NULL', compareFunction: true },
        ]
    },
    'ft_strrchr': {
        name: 'ft_strrchr',
        prototype: 'char *ft_strrchr(const char *s, int c);',
        tests: [
            { description: 'Ultima ocorrencia', args: ['"abcabc"', "'c'"], expected: 'c', compareFunction: true },
        ]
    },
    'ft_strlcpy': {
        name: 'ft_strlcpy',
        prototype: 'unsigned int ft_strlcpy(char *dest, char *src, unsigned int size);',
        tests: [
            { description: 'Copiar com tamanho', args: ['"Hello"', '6'], expected: '5', compareFunction: true },
            { description: 'Copiar truncado', args: ['"Hello"', '3'], expected: '5', compareFunction: true },
        ]
    },
    'ft_strlcat': {
        name: 'ft_strlcat',
        prototype: 'unsigned int ft_strlcat(char *dest, char *src, unsigned int size);',
        tests: [
            { description: 'Concatenar com tamanho', args: ['"Hello"', '" World"', '12'], expected: '11', compareFunction: true },
        ]
    },
    'ft_strnstr': {
        name: 'ft_strnstr',
        prototype: 'char *ft_strnstr(const char *big, const char *little, size_t len);',
        tests: [
            { description: 'Encontrar substring', args: ['"Hello World"', '"World"', '12'], expected: 'World', compareFunction: true },
            { description: 'Substring fora do range', args: ['"Hello World"', '"World"', '5'], expected: 'NULL', compareFunction: true },
        ]
    },
    'ft_tolower': {
        name: 'ft_tolower',
        prototype: 'int ft_tolower(int c);',
        tests: [
            { description: 'A para a', args: ["'A'"], expected: '97', compareFunction: true },
            { description: 'Z para z', args: ["'Z'"], expected: '122', compareFunction: true },
            { description: 'Minusculo inalterado', args: ["'a'"], expected: '97', compareFunction: true },
            { description: 'Numero inalterado', args: ["'5'"], expected: '53', compareFunction: true },
        ]
    },
    'ft_toupper': {
        name: 'ft_toupper',
        prototype: 'int ft_toupper(int c);',
        tests: [
            { description: 'a para A', args: ["'a'"], expected: '65', compareFunction: true },
            { description: 'z para Z', args: ["'z'"], expected: '90', compareFunction: true },
            { description: 'Maiusculo inalterado', args: ["'A'"], expected: '65', compareFunction: true },
        ]
    },
    'ft_isalpha': {
        name: 'ft_isalpha',
        prototype: 'int ft_isalpha(int c);',
        tests: [
            { description: 'Letra minuscula', args: ["'a'"], expected: '1', compareFunction: true },
            { description: 'Letra maiuscula', args: ["'Z'"], expected: '1', compareFunction: true },
            { description: 'Numero', args: ["'5'"], expected: '0', compareFunction: true },
            { description: 'Espaco', args: ["' '"], expected: '0', compareFunction: true },
        ]
    },
    'ft_isdigit': {
        name: 'ft_isdigit',
        prototype: 'int ft_isdigit(int c);',
        tests: [
            { description: 'Digito 0', args: ["'0'"], expected: '1', compareFunction: true },
            { description: 'Digito 9', args: ["'9'"], expected: '1', compareFunction: true },
            { description: 'Letra', args: ["'a'"], expected: '0', compareFunction: true },
        ]
    },
    'ft_isalnum': {
        name: 'ft_isalnum',
        prototype: 'int ft_isalnum(int c);',
        tests: [
            { description: 'Letra', args: ["'a'"], expected: '1', compareFunction: true },
            { description: 'Digito', args: ["'5'"], expected: '1', compareFunction: true },
            { description: 'Espaco', args: ["' '"], expected: '0', compareFunction: true },
        ]
    },
    'ft_isascii': {
        name: 'ft_isascii',
        prototype: 'int ft_isascii(int c);',
        tests: [
            { description: 'ASCII valido', args: ['65'], expected: '1', compareFunction: true },
            { description: 'Zero', args: ['0'], expected: '1', compareFunction: true },
            { description: 'Negativo', args: ['-1'], expected: '0', compareFunction: true },
            { description: 'Maior que 127', args: ['128'], expected: '0', compareFunction: true },
        ]
    },
    'ft_isprint': {
        name: 'ft_isprint',
        prototype: 'int ft_isprint(int c);',
        tests: [
            { description: 'Espaco', args: ["' '"], expected: '1', compareFunction: true },
            { description: 'Til', args: ["'~'"], expected: '1', compareFunction: true },
            { description: 'Tab', args: ["'\\t'"], expected: '0', compareFunction: true },
        ]
    },
    'ft_memset': {
        name: 'ft_memset',
        prototype: 'void *ft_memset(void *s, int c, size_t n);',
        tests: [
            { description: 'Preencher com A', args: ['5', "'A'"], expected: 'AAAAA', compareFunction: true },
        ]
    },
    'ft_bzero': {
        name: 'ft_bzero',
        prototype: 'void ft_bzero(void *s, size_t n);',
        tests: [
            { description: 'Zerar 5 bytes', args: ['5'], expected: '\\0\\0\\0\\0\\0', compareFunction: true },
        ]
    },
    'ft_memcpy': {
        name: 'ft_memcpy',
        prototype: 'void *ft_memcpy(void *dest, const void *src, size_t n);',
        tests: [
            { description: 'Copiar memoria', args: ['"Hello"', '5'], expected: 'Hello', compareFunction: true },
        ]
    },
    'ft_memmove': {
        name: 'ft_memmove',
        prototype: 'void *ft_memmove(void *dest, const void *src, size_t n);',
        tests: [
            { description: 'Mover memoria overlapping', args: ['"Hello"', '5'], expected: 'Hello', compareFunction: true },
        ]
    },
    'ft_memchr': {
        name: 'ft_memchr',
        prototype: 'void *ft_memchr(const void *s, int c, size_t n);',
        tests: [
            { description: 'Encontrar byte', args: ['"Hello"', "'l'", '5'], expected: 'llo', compareFunction: true },
        ]
    },
    'ft_memcmp': {
        name: 'ft_memcmp',
        prototype: 'int ft_memcmp(const void *s1, const void *s2, size_t n);',
        tests: [
            { description: 'Memorias iguais', args: ['"abc"', '"abc"', '3'], expected: '0', compareFunction: true },
            { description: 'Memorias diferentes', args: ['"abc"', '"abd"', '3'], expected: '<0', compareFunction: true },
        ]
    },
    'ft_calloc': {
        name: 'ft_calloc',
        prototype: 'void *ft_calloc(size_t nmemb, size_t size);',
        tests: [
            { description: 'Alocar e zerar', args: ['5', '4'], expected: 'zeroed', compareFunction: true },
        ]
    },
    'ft_substr': {
        name: 'ft_substr',
        prototype: 'char *ft_substr(char const *s, unsigned int start, size_t len);',
        tests: [
            { description: 'Substring do meio', args: ['"Hello World"', '6', '5'], expected: 'World', compareFunction: true },
            { description: 'Start alem do tamanho', args: ['"Hello"', '10', '5'], expected: '', compareFunction: true },
        ]
    },
    'ft_strjoin': {
        name: 'ft_strjoin',
        prototype: 'char *ft_strjoin(char const *s1, char const *s2);',
        tests: [
            { description: 'Juntar strings', args: ['"Hello"', '" World"'], expected: 'Hello World', compareFunction: true },
            { description: 'Juntar com vazia', args: ['"Hello"', '""'], expected: 'Hello', compareFunction: true },
        ]
    },
    'ft_strtrim': {
        name: 'ft_strtrim',
        prototype: 'char *ft_strtrim(char const *s1, char const *set);',
        tests: [
            { description: 'Remover espacos', args: ['"  Hello  "', '" "'], expected: 'Hello', compareFunction: true },
            { description: 'Remover varios chars', args: ['"xxHelloxx"', '"x"'], expected: 'Hello', compareFunction: true },
        ]
    },
    'ft_split': {
        name: 'ft_split',
        prototype: 'char **ft_split(char const *s, char c);',
        tests: [
            { description: 'Split por espaco', args: ['"Hello World Test"', "' '"], expected: '["Hello", "World", "Test"]', compareFunction: true },
            { description: 'Split string vazia', args: ['""', "' '"], expected: '[]', compareFunction: true },
        ]
    },
    'ft_itoa': {
        name: 'ft_itoa',
        prototype: 'char *ft_itoa(int n);',
        tests: [
            { description: 'Zero', args: ['0'], expected: '0', compareFunction: true },
            { description: 'Positivo', args: ['42'], expected: '42', compareFunction: true },
            { description: 'Negativo', args: ['-42'], expected: '-42', compareFunction: true },
            { description: 'INT_MIN', args: ['-2147483648'], expected: '-2147483648', compareFunction: true },
            { description: 'INT_MAX', args: ['2147483647'], expected: '2147483647', compareFunction: true },
        ]
    },
    'ft_strmapi': {
        name: 'ft_strmapi',
        prototype: 'char *ft_strmapi(char const *s, char (*f)(unsigned int, char));',
        tests: [
            { description: 'Aplicar funcao', args: ['"abc"'], expected: 'ABC', compareFunction: true },
        ]
    },
    'ft_striteri': {
        name: 'ft_striteri',
        prototype: 'void ft_striteri(char *s, void (*f)(unsigned int, char*));',
        tests: [
            { description: 'Modificar in-place', args: ['"abc"'], expected: 'ABC', compareFunction: true },
        ]
    },
    'ft_putchar_fd': {
        name: 'ft_putchar_fd',
        prototype: 'void ft_putchar_fd(char c, int fd);',
        tests: [
            { description: 'Escrever em fd', args: ["'A'", '1'], expected: 'A' },
        ]
    },
    'ft_putstr_fd': {
        name: 'ft_putstr_fd',
        prototype: 'void ft_putstr_fd(char *s, int fd);',
        tests: [
            { description: 'Escrever string em fd', args: ['"Hello"', '1'], expected: 'Hello' },
        ]
    },
    'ft_putendl_fd': {
        name: 'ft_putendl_fd',
        prototype: 'void ft_putendl_fd(char *s, int fd);',
        tests: [
            { description: 'Escrever com newline', args: ['"Hello"', '1'], expected: 'Hello\\n' },
        ]
    },
    'ft_putnbr_fd': {
        name: 'ft_putnbr_fd',
        prototype: 'void ft_putnbr_fd(int n, int fd);',
        tests: [
            { description: 'Numero positivo', args: ['42', '1'], expected: '42' },
            { description: 'Numero negativo', args: ['-42', '1'], expected: '-42' },
            { description: 'INT_MIN', args: ['-2147483648', '1'], expected: '-2147483648' },
        ]
    },
};

export class MoulinetteService {
    private outputChannel: vscode.OutputChannel;
    private diagnosticCollection: vscode.DiagnosticCollection;

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('Guia Piscine - Moulinette');
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('moulinette');
    }

    async runTests(filePath: string): Promise<MoulinetteResult> {
        const startTime = Date.now();
        const dir = path.dirname(filePath);
        const fileName = path.basename(filePath, '.c');
        
        // Encontrar exercicio correspondente
        const exercise = EXERCISE_TESTS[fileName];
        if (!exercise) {
            return this.runGenericTests(filePath, startTime);
        }

        // Gerar arquivo de teste
        const testFilePath = path.join(dir, `${fileName}_moulinette_test.c`);
        const testCode = this.generateTestFile(exercise);
        
        try {
            fs.writeFileSync(testFilePath, testCode);
        } catch (error) {
            return {
                success: false,
                totalTests: 0,
                passedTests: 0,
                failedTests: 0,
                testResults: [],
                compileErrors: [`Erro ao criar arquivo de teste: ${error}`],
                memoryLeaks: false,
                executionTime: Date.now() - startTime
            };
        }

        // Compilar com flags da 42
        const outputPath = path.join(dir, `${fileName}_test`);
        const compileResult = await this.compile(filePath, testFilePath, outputPath);

        if (!compileResult.success) {
            // Limpar arquivo de teste
            this.cleanupFiles(testFilePath, outputPath);
            return {
                success: false,
                totalTests: 0,
                passedTests: 0,
                failedTests: 0,
                testResults: [],
                compileErrors: compileResult.errors,
                memoryLeaks: false,
                executionTime: Date.now() - startTime
            };
        }

        // Executar testes
        const testResults = await this.executeTests(outputPath, exercise.tests);

        // Verificar memory leaks com valgrind (se disponivel)
        const leakResult = await this.checkMemoryLeaks(outputPath);

        // Limpar arquivos temporarios
        this.cleanupFiles(testFilePath, outputPath);

        const passedTests = testResults.filter(t => t.passed).length;
        
        return {
            success: passedTests === testResults.length && !leakResult.hasLeaks,
            totalTests: testResults.length,
            passedTests,
            failedTests: testResults.length - passedTests,
            testResults,
            compileErrors: [],
            memoryLeaks: leakResult.hasLeaks,
            leakDetails: leakResult.details,
            executionTime: Date.now() - startTime
        };
    }

    private async compile(
        sourceFile: string, 
        testFile: string, 
        outputPath: string
    ): Promise<{ success: boolean; errors: string[] }> {
        // Usar PlatformService para obter comando de compilacao
        const platformService = getPlatformService();
        const compileCmd = platformService.getCompileCommand(
            [sourceFile, testFile],
            outputPath,
            ['-Wall', '-Wextra', '-Werror']
        );

        try {
            await platformService.executeCommand(compileCmd, { timeout: 30000 });
            return { success: true, errors: [] };
        } catch (error: unknown) {
            const stderr = error instanceof Error && 'stderr' in error 
                ? (error as { stderr: string }).stderr 
                : error instanceof Error && 'stdout' in error
                    ? (error as { stdout: string }).stdout
                    : String(error);
            
            const errors = this.parseCompileErrors(stderr);
            return { success: false, errors };
        }
    }

    private parseCompileErrors(stderr: string): string[] {
        const lines = stderr.split('\n').filter(l => l.trim());
        const errors: string[] = [];

        for (const line of lines) {
            if (line.includes('error:') || line.includes('warning:')) {
                errors.push(line);
            }
        }

        return errors.length > 0 ? errors : [stderr];
    }

    private generateTestFile(exercise: ExerciseTest): string {
        const testCases = exercise.tests.map((test, index) => {
            return this.generateTestCase(exercise.name, test, index);
        }).join('\n\n');

        return `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <limits.h>

// Prototipo da funcao
${exercise.prototype}

// Capturar stdout
char captured_output[4096];
int capture_index = 0;

void capture_write(const char *str) {
    while (*str && capture_index < 4095) {
        captured_output[capture_index++] = *str++;
    }
    captured_output[capture_index] = '\\0';
}

void reset_capture(void) {
    capture_index = 0;
    captured_output[0] = '\\0';
}

int main(void)
{
    int total = 0;
    int passed = 0;

    printf("=== Moulinette Tests: ${exercise.name} ===\\n\\n");

${testCases}

    printf("\\n=== Resultado: %d/%d testes passaram ===\\n", passed, total);
    
    return (passed == total) ? 0 : 1;
}
`;
    }

    private generateTestCase(funcName: string, test: TestCase, index: number): string {
        const testNum = index + 1;
        
        // Gerar codigo de teste especifico para cada tipo de funcao
        switch (funcName) {
            case 'ft_swap':
                return this.generateSwapTest(test, testNum);
            case 'ft_ft':
                return this.generateFtTest(test, testNum);
            case 'ft_strlen':
                return this.generateStrlenTest(test, testNum);
            case 'ft_strcmp':
            case 'ft_strncmp':
                return this.generateStrcmpTest(funcName, test, testNum);
            case 'ft_atoi':
                return this.generateAtoiTest(test, testNum);
            default:
                return this.generateGenericOutputTest(funcName, test, testNum);
        }
    }

    private generateSwapTest(test: TestCase, testNum: number): string {
        const [a, b] = test.args || ['0', '0'];
        const [expA, expB] = test.expected.split(' ');
        return `
    // Teste ${testNum}: ${test.description}
    {
        total++;
        int a = ${a}, b = ${b};
        ft_swap(&a, &b);
        if (a == ${expA} && b == ${expB}) {
            printf("[OK] Teste ${testNum}: ${test.description}\\n");
            passed++;
        } else {
            printf("[KO] Teste ${testNum}: ${test.description}\\n");
            printf("     Esperado: a=${expA}, b=${expB}\\n");
            printf("     Obtido:   a=%d, b=%d\\n", a, b);
        }
    }`;
    }

    private generateFtTest(test: TestCase, testNum: number): string {
        return `
    // Teste ${testNum}: ${test.description}
    {
        total++;
        int n = 0;
        ft_ft(&n);
        if (n == 42) {
            printf("[OK] Teste ${testNum}: ${test.description}\\n");
            passed++;
        } else {
            printf("[KO] Teste ${testNum}: ${test.description}\\n");
            printf("     Esperado: 42\\n");
            printf("     Obtido:   %d\\n", n);
        }
    }`;
    }

    private generateStrlenTest(test: TestCase, testNum: number): string {
        const arg = test.args?.[0] || '""';
        return `
    // Teste ${testNum}: ${test.description}
    {
        total++;
        int result = ft_strlen(${arg});
        if (result == ${test.expected}) {
            printf("[OK] Teste ${testNum}: ${test.description}\\n");
            passed++;
        } else {
            printf("[KO] Teste ${testNum}: ${test.description}\\n");
            printf("     Esperado: ${test.expected}\\n");
            printf("     Obtido:   %d\\n", result);
        }
    }`;
    }

    private generateStrcmpTest(funcName: string, test: TestCase, testNum: number): string {
        const [s1, s2, ...rest] = test.args || ['""', '""'];
        const n = rest[0];
        const funcCall = n ? `${funcName}(${s1}, ${s2}, ${n})` : `${funcName}(${s1}, ${s2})`;
        
        let condition: string;
        if (test.expected === '0') {
            condition = 'result == 0';
        } else if (test.expected === '>0') {
            condition = 'result > 0';
        } else if (test.expected === '<0') {
            condition = 'result < 0';
        } else {
            condition = `result == ${test.expected}`;
        }

        return `
    // Teste ${testNum}: ${test.description}
    {
        total++;
        int result = ${funcCall};
        if (${condition}) {
            printf("[OK] Teste ${testNum}: ${test.description}\\n");
            passed++;
        } else {
            printf("[KO] Teste ${testNum}: ${test.description}\\n");
            printf("     Esperado: ${test.expected}\\n");
            printf("     Obtido:   %d\\n", result);
        }
    }`;
    }

    private generateAtoiTest(test: TestCase, testNum: number): string {
        const arg = test.args?.[0] || '""';
        return `
    // Teste ${testNum}: ${test.description}
    {
        total++;
        int result = ft_atoi(${arg});
        if (result == ${test.expected}) {
            printf("[OK] Teste ${testNum}: ${test.description}\\n");
            passed++;
        } else {
            printf("[KO] Teste ${testNum}: ${test.description}\\n");
            printf("     Esperado: ${test.expected}\\n");
            printf("     Obtido:   %d\\n", result);
        }
    }`;
    }

    private generateGenericOutputTest(funcName: string, test: TestCase, testNum: number): string {
        const args = test.args?.join(', ') || '';
        return `
    // Teste ${testNum}: ${test.description}
    {
        total++;
        int pipefd[2];
        pipe(pipefd);
        int saved_stdout = dup(1);
        dup2(pipefd[1], 1);
        
        ${funcName}(${args});
        
        fflush(stdout);
        dup2(saved_stdout, 1);
        close(pipefd[1]);
        
        char buffer[4096] = {0};
        read(pipefd[0], buffer, sizeof(buffer) - 1);
        close(pipefd[0]);
        
        if (strcmp(buffer, "${test.expected}") == 0) {
            printf("[OK] Teste ${testNum}: ${test.description}\\n");
            passed++;
        } else {
            printf("[KO] Teste ${testNum}: ${test.description}\\n");
            printf("     Esperado: \\"${test.expected}\\"\\n");
            printf("     Obtido:   \\"%s\\"\\n", buffer);
        }
    }`;
    }

    private async executeTests(executablePath: string, tests: TestCase[]): Promise<TestResult[]> {
        try {
            const { stdout, stderr } = await execAsync(`"${executablePath}"`, {
                timeout: 10000 // 10 segundos timeout
            });

            return this.parseTestOutput(stdout || stderr, tests);
        } catch (error: unknown) {
            // Timeout ou erro de execucao
            if (error instanceof Error && error.message.includes('TIMEOUT')) {
                return tests.map(t => ({
                    name: t.description,
                    passed: false,
                    expected: t.expected,
                    actual: 'TIMEOUT',
                    timeout: true
                }));
            }

            const stdout = error instanceof Error && 'stdout' in error 
                ? (error as { stdout: string }).stdout 
                : '';
            
            return this.parseTestOutput(stdout, tests);
        }
    }

    private parseTestOutput(output: string, tests: TestCase[]): TestResult[] {
        const results: TestResult[] = [];
        const lines = output.split('\n');

        for (let i = 0; i < tests.length; i++) {
            const test = tests[i];
            const testLine = lines.find(l => l.includes(`Teste ${i + 1}:`));
            
            if (testLine) {
                const passed = testLine.includes('[OK]');
                results.push({
                    name: test.description,
                    passed,
                    expected: test.expected,
                    actual: passed ? test.expected : 'Ver output',
                });
            } else {
                results.push({
                    name: test.description,
                    passed: false,
                    expected: test.expected,
                    actual: 'Teste nao executado',
                });
            }
        }

        return results;
    }

    private async checkMemoryLeaks(executablePath: string): Promise<{ hasLeaks: boolean; details?: string }> {
        try {
            // Usar PlatformService para verificar valgrind
            const platformService = getPlatformService();
            const valgrindCmd = platformService.getValgrindCommand(executablePath);
            
            if (!valgrindCmd) {
                // Valgrind nao disponivel nesta plataforma
                return { hasLeaks: false, details: 'Valgrind nao disponivel' };
            }
            
            const { stdout, stderr } = await platformService.executeCommand(valgrindCmd, { timeout: 60000 });

            const output = stdout + stderr;
            const hasLeaks = output.includes('definitely lost:') && 
                            !output.includes('definitely lost: 0 bytes');

            // Extrair resumo de memory leaks
            let leakSummary = '';
            if (hasLeaks) {
                const leakMatch = output.match(/LEAK SUMMARY:[\s\S]*?(?=\n\n|$)/);
                leakSummary = leakMatch ? leakMatch[0] : output;
            }

            return {
                hasLeaks,
                details: hasLeaks ? leakSummary : undefined
            };
        } catch (error: unknown) {
            // Erro ao executar valgrind
            const errorMsg = error instanceof Error ? error.message : String(error);
            
            // Verificar se e apenas um warning de leak
            if (errorMsg.includes('definitely lost:')) {
                return { 
                    hasLeaks: true, 
                    details: errorMsg 
                };
            }
            
            return { hasLeaks: false, details: `Erro no valgrind: ${errorMsg}` };
        }
    }

    private async runGenericTests(filePath: string, startTime: number): Promise<MoulinetteResult> {
        // Testes genericos para funcoes nao catalogadas
        const dir = path.dirname(filePath);
        const fileName = path.basename(filePath, '.c');
        const outputPath = path.join(dir, fileName);

        try {
            // Apenas compilar para verificar erros
            await execAsync(`gcc -Wall -Wextra -Werror -c "${filePath}" -o "${outputPath}.o"`, {
                timeout: 30000
            });

            // Limpar
            this.cleanupFiles(`${outputPath}.o`);

            return {
                success: true,
                totalTests: 1,
                passedTests: 1,
                failedTests: 0,
                testResults: [{
                    name: 'Compilacao',
                    passed: true,
                    expected: 'Sem erros',
                    actual: 'Sem erros'
                }],
                compileErrors: [],
                memoryLeaks: false,
                executionTime: Date.now() - startTime
            };
        } catch (error: unknown) {
            const stderr = error instanceof Error && 'stderr' in error 
                ? (error as { stderr: string }).stderr 
                : String(error);

            return {
                success: false,
                totalTests: 1,
                passedTests: 0,
                failedTests: 1,
                testResults: [{
                    name: 'Compilacao',
                    passed: false,
                    expected: 'Sem erros',
                    actual: stderr
                }],
                compileErrors: this.parseCompileErrors(stderr),
                memoryLeaks: false,
                executionTime: Date.now() - startTime
            };
        }
    }

    private cleanupFiles(...files: string[]): void {
        for (const file of files) {
            try {
                if (fs.existsSync(file)) {
                    fs.unlinkSync(file);
                }
            } catch {
                // Ignorar erros de limpeza
            }
        }
    }

    showResults(result: MoulinetteResult): void {
        this.outputChannel.clear();
        this.outputChannel.appendLine('╔════════════════════════════════════════════════════════════════╗');
        this.outputChannel.appendLine('║                   MOULINETTE - Resultado                       ║');
        this.outputChannel.appendLine('╚════════════════════════════════════════════════════════════════╝');
        this.outputChannel.appendLine('');

        if (result.compileErrors.length > 0) {
            this.outputChannel.appendLine('❌ ERROS DE COMPILACAO:');
            this.outputChannel.appendLine('─'.repeat(60));
            for (const error of result.compileErrors) {
                this.outputChannel.appendLine(`  ${error}`);
            }
            this.outputChannel.appendLine('');
        }

        this.outputChannel.appendLine(`📊 Testes: ${result.passedTests}/${result.totalTests} passaram`);
        this.outputChannel.appendLine('─'.repeat(60));

        for (const test of result.testResults) {
            const status = test.passed ? '✅' : '❌';
            const timeout = test.timeout ? ' (TIMEOUT)' : '';
            this.outputChannel.appendLine(`${status} ${test.name}${timeout}`);
            if (!test.passed) {
                this.outputChannel.appendLine(`   Esperado: ${test.expected}`);
                this.outputChannel.appendLine(`   Obtido:   ${test.actual}`);
            }
        }

        this.outputChannel.appendLine('');

        if (result.memoryLeaks) {
            this.outputChannel.appendLine('⚠️  MEMORY LEAKS DETECTADOS');
            if (result.leakDetails) {
                this.outputChannel.appendLine(result.leakDetails);
            }
        } else {
            this.outputChannel.appendLine('✅ Sem memory leaks detectados');
        }

        this.outputChannel.appendLine('');
        this.outputChannel.appendLine(`⏱️  Tempo de execucao: ${result.executionTime}ms`);
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine(result.success ? '🎉 TODOS OS TESTES PASSARAM!' : '❌ ALGUNS TESTES FALHARAM');

        this.outputChannel.show();
    }

    dispose(): void {
        this.outputChannel.dispose();
        this.diagnosticCollection.dispose();
    }
}
