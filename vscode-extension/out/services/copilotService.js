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
exports.CopilotService = void 0;
const vscode = __importStar(require("vscode"));
const norminetteService_1 = require("./norminetteService");
// Informacoes de exercicios da Piscine
const PISCINE_EXERCISES = {
    'ft_putchar': {
        prototype: 'void ft_putchar(char c);',
        description: 'Escreve um caractere na saida padrao usando write',
        hints: ['Use write(1, &c, 1)', 'O primeiro parametro de write e o file descriptor (1 = stdout)']
    },
    'ft_print_alphabet': {
        prototype: 'void ft_print_alphabet(void);',
        description: 'Imprime o alfabeto minusculo em ordem',
        hints: ['Use um loop de a ate z', 'Caracteres sao numeros: a = 97, z = 122']
    },
    'ft_print_reverse_alphabet': {
        prototype: 'void ft_print_reverse_alphabet(void);',
        description: 'Imprime o alfabeto minusculo em ordem reversa',
        hints: ['Loop de z ate a', 'Decrementa o caractere em cada iteracao']
    },
    'ft_print_numbers': {
        prototype: 'void ft_print_numbers(void);',
        description: 'Imprime os digitos de 0 a 9',
        hints: ['Loop de 0 ate 9', '0 = 48, 9 = 57 em ASCII']
    },
    'ft_is_negative': {
        prototype: 'void ft_is_negative(int n);',
        description: 'Imprime N se negativo, P se positivo ou zero',
        hints: ['if (n < 0) imprime N', 'else imprime P']
    },
    'ft_ft': {
        prototype: 'void ft_ft(int *nbr);',
        description: 'Atribui o valor 42 ao ponteiro',
        hints: ['*nbr = 42;', 'Desreferencia o ponteiro para atribuir']
    },
    'ft_swap': {
        prototype: 'void ft_swap(int *a, int *b);',
        description: 'Troca os valores de dois inteiros',
        hints: ['Use uma variavel temporaria', 'tmp = *a; *a = *b; *b = tmp;']
    },
    'ft_div_mod': {
        prototype: 'void ft_div_mod(int a, int b, int *div, int *mod);',
        description: 'Calcula divisao e modulo',
        hints: ['*div = a / b;', '*mod = a % b;']
    },
    'ft_ultimate_ft': {
        prototype: 'void ft_ultimate_ft(int *********nbr);',
        description: 'Atribui 42 atraves de 9 niveis de ponteiro',
        hints: ['*********nbr = 42;', 'Desreferencia 9 vezes']
    },
    'ft_strlen': {
        prototype: 'int ft_strlen(char *str);',
        description: 'Retorna o tamanho de uma string',
        hints: ['Loop ate encontrar \\0', 'Conte os caracteres']
    },
    'ft_putstr': {
        prototype: 'void ft_putstr(char *str);',
        description: 'Imprime uma string na saida padrao',
        hints: ['Use ft_putchar em loop', 'Ou write com ft_strlen']
    },
    'ft_putnbr': {
        prototype: 'void ft_putnbr(int nb);',
        description: 'Imprime um inteiro na saida padrao',
        hints: ['Trate negativo e INT_MIN separadamente', 'Use recursao ou loop para cada digito']
    },
    'ft_atoi': {
        prototype: 'int ft_atoi(char *str);',
        description: 'Converte string para inteiro',
        hints: ['Ignore espacos iniciais', 'Trate sinal + ou -', 'Converta cada digito']
    },
    'ft_strcmp': {
        prototype: 'int ft_strcmp(char *s1, char *s2);',
        description: 'Compara duas strings',
        hints: ['Compare caractere por caractere', 'Retorne a diferenca quando diferentes']
    },
    'ft_strcpy': {
        prototype: 'char *ft_strcpy(char *dest, char *src);',
        description: 'Copia uma string para outra',
        hints: ['Copie incluindo o \\0', 'Retorne dest']
    },
    'ft_strdup': {
        prototype: 'char *ft_strdup(char *src);',
        description: 'Duplica uma string alocando memoria',
        hints: ['Use malloc com ft_strlen + 1', 'Copie a string', 'Retorne o ponteiro alocado']
    },
};
// Prompts otimizados para o contexto da 42/Piscine
const PISCINE_PROMPTS = {
    system: `Voce e um assistente especializado em C para a Piscine da 42.
Regras OBRIGATORIAS da Norminette v3:
- Maximo 80 caracteres por linha
- Tabs para indentacao (NUNCA espacos)
- Maximo 25 linhas por funcao
- Maximo 5 funcoes por arquivo
- Maximo 4 parametros por funcao
- Maximo 5 variaveis por funcao
- Declaracoes APENAS no inicio da funcao
- Sem declaracao com atribuicao (int x = 0; PROIBIDO)
- Usar return (valor); com parenteses
- Funcoes sem parametros usam (void)
- Structs usam prefixo s_ (ex: struct s_list)
- Enums usam prefixo e_ (ex: enum e_bool)
- Typedefs usam sufixo _t (ex: typedef struct s_list t_list)
- Headers .h devem ter include guard
- Sem operador ternario (? :)
- Sem goto
- Sem VLA (Variable Length Arrays)`,
    completion: 'Complete o codigo C seguindo TODAS as regras da Norminette.',
    fix: 'Corrija o codigo C para seguir a Norminette. Explique cada correcao.',
    explanation: 'Explique este codigo C de forma didatica para um estudante da Piscine 42. Foque no que cada parte faz e por que.',
    optimization: 'Otimize este codigo C mantendo TOTAL conformidade com a Norminette.',
    debug: 'Analise este codigo C e identifique possiveis bugs, memory leaks ou comportamento indefinido.'
};
class CopilotService {
    constructor(norminetteService) {
        this.isAvailable = false;
        this.outputChannel = vscode.window.createOutputChannel('Guia Piscine - Copilot');
        this.norminetteService = norminetteService;
        this.checkCopilotAvailability();
    }
    async checkCopilotAvailability() {
        const copilotExtension = vscode.extensions.getExtension('GitHub.copilot');
        const copilotChatExtension = vscode.extensions.getExtension('GitHub.copilot-chat');
        this.isAvailable = !!(copilotExtension || copilotChatExtension);
        if (!this.isAvailable) {
            this.outputChannel.appendLine('GitHub Copilot nao detectado.');
            this.outputChannel.appendLine('Para melhor experiencia, instale:');
            this.outputChannel.appendLine('  - GitHub Copilot');
            this.outputChannel.appendLine('  - GitHub Copilot Chat');
        }
        else {
            this.outputChannel.appendLine('GitHub Copilot detectado!');
        }
    }
    async getCopilotAvailable() {
        return this.isAvailable;
    }
    // ============================================================================
    // Chat Participant API (@norm)
    // ============================================================================
    /**
     * Registra o Chat Participant @norm para integracao com Copilot Chat
     */
    registerChatParticipant(context) {
        try {
            // Registrar participante @norm
            const participant = vscode.chat.createChatParticipant('treino-pro.norm', this.handleChatRequest.bind(this));
            participant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'assets', 'icon.png');
            // Registrar comandos do participante
            participant.followupProvider = {
                provideFollowups: this.provideFollowups.bind(this)
            };
            this.chatParticipantDisposable = participant;
            context.subscriptions.push(participant);
            this.outputChannel.appendLine('Chat Participant @norm registrado com sucesso!');
        }
        catch (error) {
            this.outputChannel.appendLine(`Erro ao registrar Chat Participant: ${error}`);
            // Chat Participant API pode nao estar disponivel em versoes mais antigas
        }
    }
    async handleChatRequest(request, context, stream, token) {
        const command = request.command;
        const prompt = request.prompt;
        // Obter contexto do editor atual
        const editor = vscode.window.activeTextEditor;
        const document = editor?.document;
        const selection = editor?.selection;
        const selectedText = selection && !selection.isEmpty ? document?.getText(selection) : undefined;
        const currentCode = selectedText || document?.getText() || '';
        // Processar comandos especificos
        switch (command) {
            case 'fix':
                return this.handleFixCommand(stream, currentCode, prompt);
            case 'explain':
                return this.handleExplainCommand(stream, currentCode, prompt);
            case 'optimize':
                return this.handleOptimizeCommand(stream, currentCode, prompt);
            case 'hint':
                return this.handleHintCommand(stream, prompt);
            case 'rules':
                return this.handleRulesCommand(stream, prompt);
            case 'debug':
                return this.handleDebugCommand(stream, currentCode, prompt);
            default:
                return this.handleGeneralRequest(stream, currentCode, prompt);
        }
    }
    async handleFixCommand(stream, code, prompt) {
        stream.markdown('## Correcao de Codigo (Norminette)\n\n');
        if (!code.trim()) {
            stream.markdown('*Selecione o codigo que deseja corrigir ou abra um arquivo .c*\n');
            return { metadata: { command: 'fix' } };
        }
        // Verificar erros de Norminette se disponivel
        let normErrors = [];
        if (this.norminetteService) {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const result = await this.norminetteService.check(editor.document.uri.fsPath);
                normErrors = result.errors.map(e => `- ${e.code}: ${e.message} (linha ${e.line})`);
            }
        }
        stream.markdown('### Erros Detectados\n\n');
        if (normErrors.length > 0) {
            stream.markdown(normErrors.join('\n') + '\n\n');
        }
        else {
            stream.markdown('*Analisando codigo...*\n\n');
        }
        stream.markdown('### Codigo Corrigido\n\n');
        stream.markdown('```c\n');
        // Aplicar correcoes basicas
        let fixedCode = this.applyBasicFixes(code);
        stream.markdown(fixedCode);
        stream.markdown('\n```\n\n');
        stream.markdown('### Explicacao das Correcoes\n\n');
        stream.markdown(this.explainFixes(code, fixedCode));
        return { metadata: { command: 'fix' } };
    }
    async handleExplainCommand(stream, code, prompt) {
        stream.markdown('## Explicacao do Codigo\n\n');
        if (!code.trim()) {
            stream.markdown('*Selecione o codigo que deseja entender ou abra um arquivo .c*\n');
            return { metadata: { command: 'explain' } };
        }
        // Identificar funcao
        const funcMatch = code.match(/([a-z_][a-z0-9_]*)\s*\(/);
        const funcName = funcMatch ? funcMatch[1] : null;
        const exerciseInfo = funcName ? PISCINE_EXERCISES[funcName] : null;
        if (exerciseInfo) {
            stream.markdown(`### Exercicio: ${funcName}\n\n`);
            stream.markdown(`**Prototipo:** \`${exerciseInfo.prototype}\`\n\n`);
            stream.markdown(`**Objetivo:** ${exerciseInfo.description}\n\n`);
        }
        stream.markdown('### Analise Linha por Linha\n\n');
        const lines = code.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line && !line.startsWith('/*') && !line.startsWith('*') && !line.startsWith('//')) {
                const explanation = this.explainLine(line);
                if (explanation) {
                    stream.markdown(`**L${i + 1}:** \`${line}\`\n`);
                    stream.markdown(`> ${explanation}\n\n`);
                }
            }
        }
        return { metadata: { command: 'explain' } };
    }
    async handleOptimizeCommand(stream, code, prompt) {
        stream.markdown('## Otimizacao de Codigo\n\n');
        if (!code.trim()) {
            stream.markdown('*Selecione o codigo que deseja otimizar ou abra um arquivo .c*\n');
            return { metadata: { command: 'optimize' } };
        }
        stream.markdown('### Sugestoes de Otimizacao\n\n');
        const suggestions = this.analyzeOptimizations(code);
        for (const suggestion of suggestions) {
            stream.markdown(`- ${suggestion}\n`);
        }
        stream.markdown('\n### Codigo Otimizado\n\n');
        stream.markdown('```c\n');
        stream.markdown(this.applyBasicFixes(code));
        stream.markdown('\n```\n');
        return { metadata: { command: 'optimize' } };
    }
    async handleHintCommand(stream, prompt) {
        stream.markdown('## Dica para Exercicio\n\n');
        // Tentar identificar exercicio do contexto ou prompt
        const exerciseName = this.extractExerciseName(prompt);
        if (exerciseName && PISCINE_EXERCISES[exerciseName]) {
            const exercise = PISCINE_EXERCISES[exerciseName];
            stream.markdown(`### ${exerciseName}\n\n`);
            stream.markdown(`**Prototipo:** \`${exercise.prototype}\`\n\n`);
            stream.markdown(`**Descricao:** ${exercise.description}\n\n`);
            stream.markdown('**Dicas:**\n');
            for (const hint of exercise.hints) {
                stream.markdown(`- ${hint}\n`);
            }
        }
        else {
            stream.markdown('Exercicios disponiveis:\n\n');
            for (const [name, info] of Object.entries(PISCINE_EXERCISES)) {
                stream.markdown(`- **${name}**: ${info.description}\n`);
            }
            stream.markdown('\n*Use @norm /hint ft_strlen para dicas especificas*\n');
        }
        return { metadata: { command: 'hint' } };
    }
    async handleRulesCommand(stream, prompt) {
        stream.markdown('## Regras da Norminette v3\n\n');
        const searchTerm = prompt.toLowerCase();
        const relevantRules = Object.entries(norminetteService_1.NORM_RULES).filter(([code, info]) => {
            if (!searchTerm)
                return true;
            return code.toLowerCase().includes(searchTerm) ||
                info.message.toLowerCase().includes(searchTerm);
        });
        if (relevantRules.length === 0) {
            stream.markdown('*Nenhuma regra encontrada para o termo pesquisado*\n');
            return { metadata: { command: 'rules' } };
        }
        for (const [code, info] of relevantRules.slice(0, 20)) {
            const icon = info.severity === 'error' ? '🔴' : '🟡';
            const fixable = info.fixable ? ' (autocorrigivel)' : '';
            stream.markdown(`${icon} **${code}**${fixable}\n`);
            stream.markdown(`> ${info.message}\n\n`);
        }
        if (relevantRules.length > 20) {
            stream.markdown(`\n*... e mais ${relevantRules.length - 20} regras*\n`);
        }
        return { metadata: { command: 'rules' } };
    }
    async handleDebugCommand(stream, code, prompt) {
        stream.markdown('## Analise de Debug\n\n');
        if (!code.trim()) {
            stream.markdown('*Selecione o codigo que deseja debugar ou abra um arquivo .c*\n');
            return { metadata: { command: 'debug' } };
        }
        const issues = this.findPotentialBugs(code);
        if (issues.length === 0) {
            stream.markdown('**Nenhum problema obvio encontrado!**\n\n');
            stream.markdown('*Lembre-se de testar com casos extremos como:*\n');
            stream.markdown('- NULL pointers\n');
            stream.markdown('- Strings vazias\n');
            stream.markdown('- INT_MIN e INT_MAX\n');
            stream.markdown('- Numeros negativos\n');
        }
        else {
            stream.markdown('### Problemas Potenciais Encontrados\n\n');
            for (const issue of issues) {
                stream.markdown(`- ${issue}\n`);
            }
        }
        return { metadata: { command: 'debug' } };
    }
    async handleGeneralRequest(stream, code, prompt) {
        stream.markdown('## Assistente 42 Piscine\n\n');
        if (prompt.toLowerCase().includes('norminette') || prompt.toLowerCase().includes('norm')) {
            stream.markdown('Use os comandos especializados:\n\n');
            stream.markdown('- `/fix` - Corrigir codigo para seguir Norminette\n');
            stream.markdown('- `/explain` - Explicar codigo\n');
            stream.markdown('- `/optimize` - Otimizar codigo\n');
            stream.markdown('- `/hint [exercicio]` - Dicas para exercicios\n');
            stream.markdown('- `/rules [termo]` - Pesquisar regras da Norminette\n');
            stream.markdown('- `/debug` - Encontrar bugs potenciais\n');
        }
        else {
            stream.markdown(`Voce perguntou: *${prompt}*\n\n`);
            stream.markdown('Para ajuda especifica com C e Norminette, use os comandos como `/fix` ou `/explain`.\n');
        }
        return { metadata: { command: 'general' } };
    }
    provideFollowups(result, context, token) {
        const followups = [];
        switch (result.metadata?.command) {
            case 'fix':
                followups.push({ prompt: '/explain', label: 'Explicar o codigo', command: 'explain' });
                followups.push({ prompt: '/rules', label: 'Ver regras relacionadas', command: 'rules' });
                break;
            case 'explain':
                followups.push({ prompt: '/fix', label: 'Corrigir problemas', command: 'fix' });
                followups.push({ prompt: '/optimize', label: 'Otimizar codigo', command: 'optimize' });
                break;
            case 'hint':
                followups.push({ prompt: '/rules', label: 'Ver regras da Norminette', command: 'rules' });
                break;
            default:
                followups.push({ prompt: '/fix', label: 'Corrigir codigo', command: 'fix' });
                followups.push({ prompt: '/hint', label: 'Ver dicas de exercicios', command: 'hint' });
        }
        return followups;
    }
    // ============================================================================
    // Funcoes Auxiliares
    // ============================================================================
    applyBasicFixes(code) {
        let fixed = code;
        // Remover trailing whitespace
        fixed = fixed.split('\n').map(line => line.trimEnd()).join('\n');
        // Converter espacos de indentacao para tabs
        fixed = fixed.split('\n').map(line => {
            const match = line.match(/^( +)/);
            if (match) {
                const spaces = match[1];
                const tabCount = Math.ceil(spaces.length / 4);
                return '\t'.repeat(tabCount) + line.slice(spaces.length);
            }
            return line;
        }).join('\n');
        // Adicionar espacos apos virgulas
        fixed = fixed.replace(/,([^\s\n])/g, ', $1');
        // Adicionar espacos apos keywords
        fixed = fixed.replace(/\b(if|while|for|return|switch)\(/g, '$1 (');
        // Adicionar parenteses aos returns
        fixed = fixed.replace(/return\s+([^(][^;]+);/g, (match, value) => {
            const trimmed = value.trim();
            if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
                return match;
            }
            return `return (${trimmed});`;
        });
        // Garantir nova linha no final
        if (!fixed.endsWith('\n')) {
            fixed += '\n';
        }
        return fixed;
    }
    explainFixes(original, fixed) {
        const explanations = [];
        if (original !== fixed) {
            if (/  +/.test(original) && !/  +/.test(fixed)) {
                explanations.push('- **Indentacao:** Espacos convertidos para tabs');
            }
            if (/,\S/.test(original)) {
                explanations.push('- **Espacamento:** Adicionado espaco apos virgulas');
            }
            if (/\b(if|while|for|return)\(/.test(original)) {
                explanations.push('- **Keywords:** Adicionado espaco apos palavras-chave');
            }
            if (/return [^(]/.test(original)) {
                explanations.push('- **Return:** Adicionado parenteses ao valor de retorno');
            }
            if (!original.endsWith('\n') && fixed.endsWith('\n')) {
                explanations.push('- **EOF:** Adicionada nova linha no final do arquivo');
            }
        }
        return explanations.length > 0 ? explanations.join('\n') : '*Nenhuma correcao necessaria*';
    }
    explainLine(line) {
        // Explicacoes para padroes comuns
        if (line.startsWith('#include')) {
            return 'Inclui um arquivo de cabecalho (header) necessario para as funcoes usadas';
        }
        if (line.match(/^(void|int|char|float|double)/)) {
            return 'Declaracao de funcao ou variavel';
        }
        if (line.includes('write(1,')) {
            return 'Escreve na saida padrao (stdout) usando a syscall write';
        }
        if (line.includes('while')) {
            return 'Loop que executa enquanto a condicao for verdadeira';
        }
        if (line.includes('if (')) {
            return 'Condicional que executa o bloco se a expressao for verdadeira';
        }
        if (line.includes('return')) {
            return 'Retorna um valor e encerra a funcao';
        }
        if (line.includes('malloc')) {
            return 'Aloca memoria dinamica no heap (lembre de liberar com free!)';
        }
        if (line === '{' || line === '}') {
            return null; // Nao explicar chaves isoladas
        }
        return null;
    }
    analyzeOptimizations(code) {
        const suggestions = [];
        // Verificar funcoes longas
        const funcMatches = code.match(/\{[^}]+\}/g);
        if (funcMatches) {
            for (const func of funcMatches) {
                const lines = func.split('\n').length;
                if (lines > 20) {
                    suggestions.push(`Funcao com ${lines} linhas - considere dividir em funcoes menores`);
                }
            }
        }
        // Verificar variaveis nao utilizadas (basico)
        const declMatches = code.matchAll(/\b(int|char|float|double)\s+(\w+)/g);
        for (const match of declMatches) {
            const varName = match[2];
            const uses = code.match(new RegExp(`\\b${varName}\\b`, 'g'));
            if (uses && uses.length === 1) {
                suggestions.push(`Variavel '${varName}' parece ser declarada mas nao usada`);
            }
        }
        // Verificar loops que podem ser simplificados
        if (code.includes('i = 0') && code.includes('i < ') && code.includes('i++')) {
            // Loop padrao, verificar se pode ser while
        }
        if (suggestions.length === 0) {
            suggestions.push('Codigo ja parece otimizado para o contexto da Norminette');
        }
        return suggestions;
    }
    findPotentialBugs(code) {
        const issues = [];
        // Verificar malloc sem free
        if (code.includes('malloc') && !code.includes('free')) {
            issues.push('**Memory Leak:** malloc encontrado sem free correspondente');
        }
        // Verificar divisao por zero potencial
        if (code.match(/\/\s*[a-z_]/i)) {
            issues.push('**Divisao:** Verificar se o divisor pode ser zero');
        }
        // Verificar acesso a ponteiro nulo
        if (code.includes('*') && !code.includes('if') && !code.includes('NULL')) {
            issues.push('**Null Pointer:** Considere verificar ponteiros antes de desreferenciar');
        }
        // Verificar buffer overflow potencial
        if (code.includes('[') && !code.includes('strlen') && !code.includes('sizeof')) {
            issues.push('**Buffer:** Verificar limites de arrays');
        }
        // Verificar uso de gets (proibido)
        if (code.includes('gets(')) {
            issues.push('**CRITICO:** gets() e inseguro e esta deprecado. Use fgets()');
        }
        return issues;
    }
    extractExerciseName(prompt) {
        // Procurar nome de exercicio no prompt
        const match = prompt.match(/ft_\w+/);
        if (match) {
            return match[0];
        }
        // Procurar por palavras-chave
        for (const name of Object.keys(PISCINE_EXERCISES)) {
            if (prompt.toLowerCase().includes(name.replace('ft_', ''))) {
                return name;
            }
        }
        return null;
    }
    // ============================================================================
    // Completion Provider e Snippets
    // ============================================================================
    registerCompletionProvider() {
        return vscode.languages.registerCompletionItemProvider({ language: 'c', scheme: 'file' }, {
            provideCompletionItems: async (document, position) => {
                const items = [];
                // Adicionar snippets especificos da 42
                const snippets = this.get42Snippets();
                for (const snippet of snippets) {
                    const item = new vscode.CompletionItem(snippet.label, vscode.CompletionItemKind.Snippet);
                    item.insertText = new vscode.SnippetString(snippet.body);
                    item.documentation = new vscode.MarkdownString(snippet.description);
                    item.detail = '42 Piscine Snippet';
                    items.push(item);
                }
                return items;
            }
        }, '.', '(');
    }
    get42Snippets() {
        return [
            {
                label: 'ft_header',
                body: `/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   \${1:filename}.c                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: \${2:login} <\${2:login}@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: \${CURRENT_YEAR}/\${CURRENT_MONTH}/\${CURRENT_DATE} \${CURRENT_HOUR}:\${CURRENT_MINUTE}:\${CURRENT_SECOND} by \${2:login}  #+#    #+#             */
/*   Updated: \${CURRENT_YEAR}/\${CURRENT_MONTH}/\${CURRENT_DATE} \${CURRENT_HOUR}:\${CURRENT_MINUTE}:\${CURRENT_SECOND} by \${2:login}  ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

$0`,
                description: 'Header padrao da 42'
            },
            {
                label: 'ft_function',
                body: `\${1:void}\t\${2:ft_function}(\${3:void})
{
\t$0
}`,
                description: 'Funcao no estilo 42 (tipo em linha separada)'
            },
            {
                label: 'ft_while',
                body: `while (\${1:condition})
{
\t$0
}`,
                description: 'Loop while no estilo Norminette'
            },
            {
                label: 'ft_if',
                body: `if (\${1:condition})
{
\t$0
}`,
                description: 'Condicional if no estilo Norminette'
            },
            {
                label: 'ft_ifelse',
                body: `if (\${1:condition})
{
\t$2
}
else
{
\t$0
}`,
                description: 'If-else no estilo Norminette'
            },
            {
                label: 'ft_putchar',
                body: `void\tft_putchar(char c)
{
\twrite(1, &c, 1);
}`,
                description: 'Implementacao de ft_putchar'
            },
            {
                label: 'ft_main',
                body: `int\tmain(void)
{
\t$0
\treturn (0);
}`,
                description: 'Funcao main no estilo 42'
            },
            {
                label: 'ft_include_guard',
                body: `#ifndef \${1:FILENAME}_H
# define \${1:FILENAME}_H

$0

#endif /* \${1:FILENAME}_H */`,
                description: 'Include guard para header files'
            },
        ];
    }
    dispose() {
        this.outputChannel.dispose();
        this.chatParticipantDisposable?.dispose();
    }
}
exports.CopilotService = CopilotService;
//# sourceMappingURL=copilotService.js.map