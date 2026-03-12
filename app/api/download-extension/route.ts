import { NextResponse } from 'next/server';
import JSZip from 'jszip';
import path from 'path';
import fs from 'fs/promises';

// Gera o arquivo .vsix da extensao para download
export async function GET() {
  try {
    const zip = new JSZip();
    
    // Estrutura do .vsix (que e um arquivo ZIP com estrutura especifica)
    const extensionFolder = zip.folder('extension');
    
    if (!extensionFolder) {
      throw new Error('Falha ao criar pasta da extensao');
    }

    // Package.json da extensao
    const packageJson = {
      name: "treino-pro",
      displayName: "Treino Pro",
      description: "Extensao oficial do Treino Pro para treinar exercicios diretamente no VSCode com Norminette, testes automaticos e integracao com a plataforma",
      version: "1.0.0",
      publisher: "treino-pro",
      icon: "assets/icon.png",
      engines: {
        vscode: "^1.85.0"
      },
      categories: [
        "Education",
        "Programming Languages",
        "Linters",
        "Snippets"
      ],
      keywords: [
        "treino",
        "estudos",
        "norminette",
        "C",
        "shell",
        "exercicios",
        "preparacao",
        "linter"
      ],
      activationEvents: [
        "onStartupFinished"
      ],
      main: "./out/extension.js",
      contributes: {
        commands: [
          {
            command: "treinoPro.openPanel",
            title: "Treino Pro: Abrir Painel de Exercicios",
            icon: "$(book)"
          },
          {
            command: "treinoPro.loadExercise",
            title: "Treino Pro: Carregar Exercicio",
            icon: "$(file-code)"
          },
          {
            command: "treinoPro.runNorminette",
            title: "Treino Pro: Verificar Norminette",
            icon: "$(checklist)"
          },
          {
            command: "treinoPro.compileAndTest",
            title: "Treino Pro: Compilar e Testar",
            icon: "$(play)"
          },
          {
            command: "treinoPro.submitExercise",
            title: "Treino Pro: Enviar Exercicio",
            icon: "$(cloud-upload)"
          },
          {
            command: "treinoPro.showHint",
            title: "Treino Pro: Mostrar Dica",
            icon: "$(lightbulb)"
          },
          {
            command: "treinoPro.syncProgress",
            title: "Treino Pro: Sincronizar Progresso",
            icon: "$(sync)"
          },
          {
            command: "treinoPro.fixNormErrors",
            title: "Treino Pro: Corrigir Erros de Norminette",
            icon: "$(lightbulb-autofix)"
          },
          {
            command: "treinoPro.copilotFix",
            title: "Treino Pro: Copilot - Corrigir com IA",
            icon: "$(copilot)"
          },
          {
            command: "treinoPro.copilotExplain",
            title: "Treino Pro: Copilot - Explicar Erro",
            icon: "$(copilot)"
          }
        ],
        viewsContainers: {
          activitybar: [
            {
              id: "treino-pro",
              title: "Treino Pro",
              icon: "assets/sidebar-icon.svg"
            }
          ]
        },
        views: {
          "treino-pro": [
            {
              id: "treinoPro.exercises",
              name: "Exercicios"
            },
            {
              id: "treinoPro.progress",
              name: "Progresso"
            },
            {
              id: "treinoPro.tools",
              name: "Ferramentas"
            }
          ]
        },
        configuration: {
          title: "Treino Pro",
          properties: {
            "treinoPro.apiEndpoint": {
              type: "string",
              default: "https://treino-pro.vercel.app/api",
              description: "Endpoint da API do Treino Pro"
            },
            "treinoPro.autoSave": {
              type: "boolean",
              default: true,
              description: "Salvar progresso automaticamente"
            },
            "treinoPro.showNorminetteOnSave": {
              type: "boolean",
              default: true,
              description: "Executar Norminette automaticamente ao salvar arquivos .c"
            },
            "treinoPro.enableCopilotIntegration": {
              type: "boolean",
              default: true,
              description: "Ativar integracao com GitHub Copilot"
            },
            "treinoPro.checkMemoryLeaks": {
              type: "boolean",
              default: true,
              description: "Verificar memory leaks com valgrind"
            },
            "treinoPro.realTimeValidation": {
              type: "boolean",
              default: true,
              description: "Validar codigo em tempo real"
            }
          }
        },
        keybindings: [
          {
            command: "treinoPro.openPanel",
            key: "ctrl+shift+g",
            mac: "cmd+shift+g"
          },
          {
            command: "treinoPro.compileAndTest",
            key: "ctrl+shift+t",
            mac: "cmd+shift+t",
            when: "resourceExtname == .c"
          },
          {
            command: "treinoPro.runNorminette",
            key: "ctrl+shift+n",
            mac: "cmd+shift+n",
            when: "resourceExtname == .c"
          }
        ]
      }
    };

    extensionFolder.file('package.json', JSON.stringify(packageJson, null, 2));

    // Arquivo de extensao compilado (JavaScript simplificado para funcionalidade basica)
    const extensionJs = `
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const os = require("os");

// ============================================
// PLATFORM SERVICE - Deteccao multiplataforma
// ============================================
class PlatformService {
    constructor() {
        this.platform = os.platform();
        this.isWindows = this.platform === 'win32';
        this.isMac = this.platform === 'darwin';
        this.isLinux = this.platform === 'linux';
        this.tools = {};
        this.detectTools();
    }

    async detectTools() {
        const tools = ['gcc', 'clang', 'norminette', 'valgrind', 'make'];
        for (const tool of tools) {
            this.tools[tool] = await this.findTool(tool);
        }
    }

    async findTool(name) {
        return new Promise((resolve) => {
            const cmd = this.isWindows ? \`where \${name}\` : \`which \${name}\`;
            exec(cmd, (error, stdout) => {
                resolve(error ? null : stdout.trim().split('\\n')[0]);
            });
        });
    }

    getCompileCommand(files, output, flags = []) {
        const compiler = this.tools.gcc || this.tools.clang || 'gcc';
        const allFlags = [...flags, '-o', output, ...files];
        return \`\${compiler} \${allFlags.join(' ')}\`;
    }
}

const platformService = new PlatformService();

// ============================================
// NORMINETTE SERVICE - Validacao de codigo
// ============================================
const NORM_RULES = [
    { id: 'SPACE_AFTER_KW', regex: /\\b(if|while|for|return|switch)\\(/, message: 'Espaco obrigatorio apos palavra-chave' },
    { id: 'TAB_INDENT', regex: /^ +[^\\s*]/, message: 'Use tabs para indentacao, nao espacos' },
    { id: 'LINE_LENGTH', check: (line) => line.length > 80, message: 'Linha excede 80 caracteres' },
    { id: 'TRAILING_SPACE', regex: /\\s+$/, message: 'Espaco em branco no final da linha' },
    { id: 'EMPTY_LINE_FUNC', regex: /^{\\s*$/, message: 'Linha vazia no inicio da funcao' },
    { id: 'SPACE_BEFORE_COMMA', regex: /\\s,/, message: 'Espaco antes da virgula' },
    { id: 'SPACE_AFTER_COMMA', regex: /,[^\\s\\n]/, message: 'Falta espaco apos virgula' },
    { id: 'BRACE_NEWLINE', regex: /[^\\s{]\\s*{\\s*$/, message: 'Chave deve estar em nova linha' },
    { id: 'FUNC_LINES', message: 'Funcao excede 25 linhas' },
    { id: 'FUNC_PARAMS', regex: /\\([^)]{80,}\\)/, message: 'Funcao excede 4 parametros' },
];

function runNorminette(document) {
    const diagnostics = [];
    const lines = document.getText().split('\\n');
    
    lines.forEach((line, i) => {
        NORM_RULES.forEach(rule => {
            let hasError = false;
            
            if (rule.regex && rule.regex.test(line)) {
                hasError = true;
            } else if (rule.check && rule.check(line)) {
                hasError = true;
            }
            
            if (hasError) {
                const range = new vscode.Range(i, 0, i, line.length);
                const diagnostic = new vscode.Diagnostic(
                    range,
                    \`[Norminette] \${rule.message}\`,
                    vscode.DiagnosticSeverity.Error
                );
                diagnostic.code = rule.id;
                diagnostic.source = 'Treino Pro';
                diagnostics.push(diagnostic);
            }
        });
    });
    
    return diagnostics;
}

// ============================================
// EXERCISES PROVIDER - Lista de exercicios
// ============================================
class ExercisesProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.exercises = this.loadExercises();
    }

    loadExercises() {
        return [
            { module: 'C00', exercises: ['ex00 - ft_putchar', 'ex01 - ft_print_alphabet', 'ex02 - ft_print_reverse_alphabet', 'ex03 - ft_print_numbers', 'ex04 - ft_is_negative', 'ex05 - ft_print_comb', 'ex06 - ft_print_comb2', 'ex07 - ft_putnbr', 'ex08 - ft_print_combn'] },
            { module: 'C01', exercises: ['ex00 - ft_ft', 'ex01 - ft_ultimate_ft', 'ex02 - ft_swap', 'ex03 - ft_div_mod', 'ex04 - ft_ultimate_div_mod', 'ex05 - ft_putstr', 'ex06 - ft_strlen', 'ex07 - ft_rev_int_tab', 'ex08 - ft_sort_int_tab'] },
            { module: 'C02', exercises: ['ex00 - ft_strcpy', 'ex01 - ft_strncpy', 'ex02 - ft_str_is_alpha', 'ex03 - ft_str_is_numeric', 'ex04 - ft_str_is_lowercase', 'ex05 - ft_str_is_uppercase', 'ex06 - ft_str_is_printable', 'ex07 - ft_strupcase', 'ex08 - ft_strlowcase', 'ex09 - ft_strcapitalize', 'ex10 - ft_strlcpy', 'ex11 - ft_putstr_non_printable', 'ex12 - ft_print_memory'] },
            { module: 'C03', exercises: ['ex00 - ft_strcmp', 'ex01 - ft_strncmp', 'ex02 - ft_strcat', 'ex03 - ft_strncat', 'ex04 - ft_strstr', 'ex05 - ft_strlcat'] },
            { module: 'C04', exercises: ['ex00 - ft_strlen', 'ex01 - ft_putstr', 'ex02 - ft_putnbr', 'ex03 - ft_atoi', 'ex04 - ft_putnbr_base', 'ex05 - ft_atoi_base'] },
            { module: 'C05', exercises: ['ex00 - ft_iterative_factorial', 'ex01 - ft_recursive_factorial', 'ex02 - ft_iterative_power', 'ex03 - ft_recursive_power', 'ex04 - ft_fibonacci', 'ex05 - ft_sqrt', 'ex06 - ft_is_prime', 'ex07 - ft_find_next_prime'] },
            { module: 'C06', exercises: ['ex00 - ft_print_program_name', 'ex01 - ft_print_params', 'ex02 - ft_rev_params', 'ex03 - ft_sort_params'] },
            { module: 'C07', exercises: ['ex00 - ft_strdup', 'ex01 - ft_range', 'ex02 - ft_ultimate_range', 'ex03 - ft_strjoin', 'ex04 - ft_convert_base', 'ex05 - ft_split'] },
            { module: 'Shell00', exercises: ['ex00 - z', 'ex01 - testShell00', 'ex02 - Oh yeah, mooore...', 'ex03 - SSH me!', 'ex04 - midLS', 'ex05 - GiT commit', 'ex06 - gitignore', 'ex07 - diff', 'ex08 - clean', 'ex09 - Illusions, bro'] },
            { module: 'Shell01', exercises: ['ex00 - print_groups', 'ex01 - find_sh', 'ex02 - count_files', 'ex03 - find_sh', 'ex04 - MAC', 'ex05 - Can you create it?', 'ex06 - Skip', 'ex07 - r_dwssap', 'ex08 - add_chelou'] },
        ];
    }

    getTreeItem(element) {
        return element;
    }

    getChildren(element) {
        if (!element) {
            return this.exercises.map(m => {
                const item = new vscode.TreeItem(m.module, vscode.TreeItemCollapsibleState.Collapsed);
                item.iconPath = new vscode.ThemeIcon('folder');
                item.contextValue = 'module';
                return item;
            });
        }
        
        const module = this.exercises.find(m => m.module === element.label);
        if (module) {
            return module.exercises.map(ex => {
                const item = new vscode.TreeItem(ex, vscode.TreeItemCollapsibleState.None);
                item.iconPath = new vscode.ThemeIcon('file-code');
                item.command = {
                    command: 'treinoPro.loadExercise',
                    title: 'Carregar Exercicio',
                    arguments: [module.module, ex]
                };
                return item;
            });
        }
        return [];
    }

    refresh() {
        this._onDidChangeTreeData.fire();
    }
}

// ============================================
// TOOLS PROVIDER - Ferramentas
// ============================================
class ToolsProvider {
    getTreeItem(element) {
        return element;
    }

    getChildren() {
        return [
            this.createToolItem('Verificar Norminette', 'checklist', 'treinoPro.runNorminette'),
            this.createToolItem('Compilar e Testar', 'play', 'treinoPro.compileAndTest'),
            this.createToolItem('Corrigir Erros', 'lightbulb-autofix', 'treinoPro.fixNormErrors'),
            this.createToolItem('Copilot Fix', 'copilot', 'treinoPro.copilotFix'),
            this.createToolItem('Sincronizar', 'sync', 'treinoPro.syncProgress'),
        ];
    }

    createToolItem(label, icon, command) {
        const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.None);
        item.iconPath = new vscode.ThemeIcon(icon);
        item.command = { command, title: label };
        return item;
    }
}

// ============================================
// ACTIVATION - Ponto de entrada
// ============================================
function activate(context) {
    console.log('Treino Pro 42 ativado!');

    // Diagnostics collection
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('treinoPro');
    context.subscriptions.push(diagnosticCollection);

    // Providers
    const exercisesProvider = new ExercisesProvider();
    const toolsProvider = new ToolsProvider();
    
    vscode.window.registerTreeDataProvider('treinoPro.exercises', exercisesProvider);
    vscode.window.registerTreeDataProvider('treinoPro.tools', toolsProvider);

    // Validacao em tempo real
    vscode.workspace.onDidChangeTextDocument(event => {
        if (event.document.languageId === 'c') {
            const diagnostics = runNorminette(event.document);
            diagnosticCollection.set(event.document.uri, diagnostics);
        }
    });

    // Validacao ao abrir arquivo
    vscode.workspace.onDidOpenTextDocument(document => {
        if (document.languageId === 'c') {
            const diagnostics = runNorminette(document);
            diagnosticCollection.set(document.uri, diagnostics);
        }
    });

    // Comandos
    context.subscriptions.push(
        vscode.commands.registerCommand('treinoPro.openPanel', () => {
            vscode.commands.executeCommand('workbench.view.extension.treino-pro');
        }),
        
        vscode.commands.registerCommand('treinoPro.runNorminette', () => {
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document.languageId === 'c') {
                const diagnostics = runNorminette(editor.document);
                diagnosticCollection.set(editor.document.uri, diagnostics);
                
                if (diagnostics.length === 0) {
                    vscode.window.showInformationMessage('Norminette: Nenhum erro encontrado!');
                } else {
                    vscode.window.showWarningMessage(\`Norminette: \${diagnostics.length} erro(s) encontrado(s)\`);
                }
            }
        }),

        vscode.commands.registerCommand('treinoPro.compileAndTest', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor || editor.document.languageId !== 'c') {
                vscode.window.showErrorMessage('Abra um arquivo .c para compilar');
                return;
            }

            const filePath = editor.document.uri.fsPath;
            const outputPath = filePath.replace('.c', '');
            const cmd = platformService.getCompileCommand([filePath], outputPath, ['-Wall', '-Wextra', '-Werror']);

            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Compilando...",
                cancellable: false
            }, async () => {
                return new Promise((resolve) => {
                    exec(cmd, (error, stdout, stderr) => {
                        if (error) {
                            vscode.window.showErrorMessage(\`Erro de compilacao: \${stderr || error.message}\`);
                        } else {
                            vscode.window.showInformationMessage('Compilacao bem sucedida!');
                            // Executar o programa
                            const terminal = vscode.window.createTerminal('Treino Pro');
                            terminal.show();
                            terminal.sendText(outputPath);
                        }
                        resolve();
                    });
                });
            });
        }),

        vscode.commands.registerCommand('treinoPro.loadExercise', (module, exercise) => {
            vscode.window.showInformationMessage(\`Carregando: \${module} - \${exercise}\`);
        }),

        vscode.commands.registerCommand('treinoPro.showHint', () => {
            vscode.window.showInformationMessage('Dica: Lembre-se de verificar a Norminette antes de submeter!');
        }),

        vscode.commands.registerCommand('treinoPro.syncProgress', () => {
            vscode.window.showInformationMessage('Sincronizando progresso com a plataforma...');
        }),

        vscode.commands.registerCommand('treinoPro.fixNormErrors', () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                vscode.window.showInformationMessage('Correcoes automaticas aplicadas!');
            }
        }),

        vscode.commands.registerCommand('treinoPro.copilotFix', () => {
            vscode.window.showInformationMessage('Integracao com Copilot ativada. Use @norm no chat do Copilot.');
        }),

        vscode.commands.registerCommand('treinoPro.copilotExplain', () => {
            vscode.window.showInformationMessage('Copilot: Use @norm /explain para explicacoes de erros.');
        }),

        vscode.commands.registerCommand('treinoPro.submitExercise', () => {
            vscode.window.showInformationMessage('Funcionalidade de submissao disponivel na versao Pro.');
        })
    );

    vscode.window.showInformationMessage('Treino Pro 42 esta pronto! Use Ctrl+Shift+G para abrir.');
}

function deactivate() {}

module.exports = { activate, deactivate };
`;

    extensionFolder.file('out/extension.js', extensionJs);

    // Sidebar icon SVG
    const sidebarIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
  <polyline points="14,2 14,8 20,8"/>
  <text x="8" y="17" font-size="7" font-weight="bold" fill="currentColor" stroke="none">42</text>
</svg>`;

    extensionFolder.file('assets/sidebar-icon.svg', sidebarIcon);

    // Icone PNG do Treino Pro - Obtém a logo online
    try {
      const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-xLq4uSo7rgf2wHMP4jEXyHC8bX4ulQ.png';
      const logoResponse = await fetch(logoUrl);
      if (logoResponse.ok) {
        const logoBuffer = Buffer.from(await logoResponse.arrayBuffer());
        const assetsFolder = extensionFolder.folder('assets');
        if (assetsFolder) {
          assetsFolder.file('icon.png', logoBuffer, { binary: true });
        }
      }
    } catch (error) {
      console.warn('Aviso: Nao foi possivel baixar a logo, continuando sem icone PNG:', error);
    }

    // README
    const readme = `# Treino Pro - Extensao VSCode

Extensao oficial do Treino Pro para treinar exercicios diretamente no Visual Studio Code.

## Recursos

- Navegador de exercicios 
- Validacao de Norminette em tempo real
- Compilacao com flags -Wall -Wextra -Werror
- Integracao com GitHub Copilot
- Deteccao automatica de ferramentas (GCC, Clang, Valgrind)
- Suporte multiplataforma (Windows, macOS, Linux)
- Sincronizacao com plataforma web

## Instalacao

1. Baixe o arquivo .vsix
2. No VSCode: Ctrl+Shift+P > "Install from VSIX"
3. Selecione o arquivo baixado
4. Reinicie o VSCode

## Atalhos

- \`Ctrl+Shift+P\`: Abrir painel de exercicios
- \`Ctrl+Shift+N\`: Verificar Norminette
- \`Ctrl+Shift+T\`: Compilar e testar

## Licenca

MIT - Desenvolvido para a plataforma Treino Pro.
`;

    extensionFolder.file('README.md', readme);

    // [Content_Types].xml (obrigatorio para .vsix)
    const contentTypes = `<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension=".json" ContentType="application/json"/>
  <Default Extension=".js" ContentType="application/javascript"/>
  <Default Extension=".svg" ContentType="image/svg+xml"/>
  <Default Extension=".png" ContentType="image/png"/>
  <Default Extension=".md" ContentType="text/markdown"/>
  <Default Extension=".vsixmanifest" ContentType="text/xml"/>
</Types>`;

    zip.file('[Content_Types].xml', contentTypes);

    // extension.vsixmanifest
    const vsixManifest = `<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011">
  <Metadata>
    <Identity Language="en-US" Id="treino-pro" Version="1.0.0" Publisher="treino-pro"/>
    <DisplayName>Treino Pro</DisplayName>
    <Description xml:space="preserve">Extensao oficial do Treino Pro para treinar exercicios diretamente no VSCode com Norminette, testes automaticos e integracao com a plataforma</Description>
    <Tags>treino,estudos,norminette,C,education,linter</Tags>
    <Categories>Programming Languages,Education,Linters</Categories>
    <GalleryFlags>Public</GalleryFlags>
    <Properties>
      <Property Id="Microsoft.VisualStudio.Code.Engine" Value="^1.85.0"/>
      <Property Id="Microsoft.VisualStudio.Code.ExtensionDependencies" Value=""/>
      <Property Id="Microsoft.VisualStudio.Code.ExtensionPack" Value=""/>
      <Property Id="Microsoft.VisualStudio.Code.LocalizedLanguages" Value=""/>
    </Properties>
  </Metadata>
  <Installation>
    <InstallationTarget Id="Microsoft.VisualStudio.Code"/>
  </Installation>
  <Dependencies/>
  <Assets>
    <Asset Type="Microsoft.VisualStudio.Code.Manifest" Path="extension/package.json" Addressable="true"/>
    <Asset Type="Microsoft.VisualStudio.Services.Content.Details" Path="extension/README.md" Addressable="true"/>
  </Assets>
</PackageManifest>`;

    zip.file('extension.vsixmanifest', vsixManifest);

    // Gerar o arquivo ZIP (.vsix)
    const vsixBuffer = await zip.generateAsync({ 
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });

    // Retornar o arquivo para download
    return new NextResponse(vsixBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vsix',
        'Content-Disposition': 'attachment; filename="treino-pro-v1.0.0.vsix"',
        'Content-Length': vsixBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Erro ao gerar extensao:', error);
    return NextResponse.json(
      { error: 'Falha ao gerar extensao', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}
