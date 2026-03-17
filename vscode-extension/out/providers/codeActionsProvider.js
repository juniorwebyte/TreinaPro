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
exports.NorminetteCodeActionsProvider = void 0;
exports.fixAllNorminetteErrors = fixAllNorminetteErrors;
const vscode = __importStar(require("vscode"));
// ============================================================================
// CODE ACTIONS PROVIDER - Correcoes Automaticas para Norminette
// ============================================================================
class NorminetteCodeActionsProvider {
    provideCodeActions(document, range, context, _token) {
        const actions = [];
        // Processar cada diagnostico na selecao
        for (const diagnostic of context.diagnostics) {
            if (diagnostic.source !== 'norminette' && diagnostic.source !== 'Treino Pro') {
                continue;
            }
            const code = diagnostic.code?.toString() || '';
            const fixActions = this.getFixActionsForCode(code, document, diagnostic);
            actions.push(...fixActions);
        }
        // Adicionar acao "Fix All" se houver multiplos fixes
        if (actions.length > 1) {
            const fixAllAction = new vscode.CodeAction('Corrigir todos os erros de Norminette neste arquivo', vscode.CodeActionKind.SourceFixAll);
            fixAllAction.command = {
                command: 'treinoPro.fixAllNorminette',
                title: 'Fix All Norminette',
                arguments: [document.uri]
            };
            actions.push(fixAllAction);
        }
        return actions;
    }
    getFixActionsForCode(code, document, diagnostic) {
        const actions = [];
        const line = document.lineAt(diagnostic.range.start.line);
        const lineText = line.text;
        switch (code) {
            case 'SPC_BEFORE_NL':
                actions.push(this.createTrailingWhitespaceFix(document, diagnostic));
                break;
            case 'SPACE_INDENT':
                actions.push(this.createSpaceToTabFix(document, diagnostic));
                break;
            case 'MIXED_INDENT':
                actions.push(this.createUnifyIndentFix(document, diagnostic));
                break;
            case 'RETURN_PARENTHESES':
                actions.push(...this.createReturnParenthesesFix(document, diagnostic, lineText));
                break;
            case 'MISSING_VOID_PARAM':
                actions.push(this.createAddVoidParamFix(document, diagnostic, lineText));
                break;
            case 'NO_NL_AT_EOF':
                actions.push(this.createAddNewlineEOFFix(document));
                break;
            case 'MULT_EMPTY_LINE':
                actions.push(this.createRemoveEmptyLineFix(document, diagnostic));
                break;
            case 'SPC_AFTER_COMMA':
                actions.push(this.createAddSpaceAfterCommaFix(document, diagnostic, lineText));
                break;
            case 'SPC_BEFORE_COMMA':
                actions.push(this.createRemoveSpaceBeforeCommaFix(document, diagnostic, lineText));
                break;
            case 'SPACE_AFTER_KW':
                actions.push(this.createAddSpaceAfterKeywordFix(document, diagnostic, lineText));
                break;
            case 'SPC_AFTER_PAR':
                actions.push(this.createRemoveSpaceAfterParenFix(document, diagnostic, lineText));
                break;
            case 'SPC_BFR_PAR':
                actions.push(this.createRemoveSpaceBeforeParenFix(document, diagnostic, lineText));
                break;
            case 'CPP_COMMENT':
                actions.push(this.createConvertCommentFix(document, diagnostic, lineText));
                break;
            case 'LINE_TOO_LONG':
                actions.push(this.createSplitLineFix(document, diagnostic, lineText));
                break;
            case 'HEADER_MISSING':
                actions.push(this.createAddHeader42Fix(document));
                break;
            case 'INCLUDE_GUARD':
                if (document.fileName.endsWith('.h')) {
                    actions.push(this.createAddIncludeGuardFix(document));
                }
                break;
            case 'BRACE_NEWLINE':
                actions.push(this.createBraceNewlineFix(document, diagnostic, lineText));
                break;
        }
        return actions;
    }
    // ============================================================================
    // Quick Fixes Individuais
    // ============================================================================
    createTrailingWhitespaceFix(document, diagnostic) {
        const action = new vscode.CodeAction('Remover espacos no final da linha', vscode.CodeActionKind.QuickFix);
        const line = document.lineAt(diagnostic.range.start.line);
        const trimmedText = line.text.trimEnd();
        const edit = new vscode.WorkspaceEdit();
        edit.replace(document.uri, line.range, trimmedText);
        action.edit = edit;
        action.diagnostics = [diagnostic];
        action.isPreferred = true;
        return action;
    }
    createSpaceToTabFix(document, diagnostic) {
        const action = new vscode.CodeAction('Converter espacos para tabs', vscode.CodeActionKind.QuickFix);
        const line = document.lineAt(diagnostic.range.start.line);
        const lineText = line.text;
        // Encontrar espacos de indentacao e converter para tabs
        const match = lineText.match(/^(\s+)/);
        if (match) {
            const spaces = match[1];
            const tabCount = Math.ceil(spaces.replace(/\t/g, '    ').length / 4);
            const newIndent = '\t'.repeat(tabCount);
            const newText = newIndent + lineText.slice(spaces.length);
            const edit = new vscode.WorkspaceEdit();
            edit.replace(document.uri, line.range, newText);
            action.edit = edit;
        }
        action.diagnostics = [diagnostic];
        action.isPreferred = true;
        return action;
    }
    createUnifyIndentFix(document, diagnostic) {
        const action = new vscode.CodeAction('Uniformizar indentacao com tabs', vscode.CodeActionKind.QuickFix);
        const line = document.lineAt(diagnostic.range.start.line);
        const lineText = line.text;
        // Contar nivel de indentacao e substituir por tabs puros
        const match = lineText.match(/^(\s+)/);
        if (match) {
            const indent = match[1];
            // Cada 4 espacos ou tab = 1 nivel
            const level = Math.ceil(indent.replace(/\t/g, '    ').length / 4);
            const newIndent = '\t'.repeat(level);
            const newText = newIndent + lineText.slice(indent.length);
            const edit = new vscode.WorkspaceEdit();
            edit.replace(document.uri, line.range, newText);
            action.edit = edit;
        }
        action.diagnostics = [diagnostic];
        return action;
    }
    createReturnParenthesesFix(document, diagnostic, lineText) {
        const actions = [];
        // Encontrar o valor do return
        const match = lineText.match(/return\s+([^;]+);/);
        if (match) {
            const returnValue = match[1].trim();
            // Nao adicionar se ja tem parenteses
            if (!returnValue.startsWith('(') || !returnValue.endsWith(')')) {
                const action = new vscode.CodeAction('Adicionar parenteses ao return', vscode.CodeActionKind.QuickFix);
                const newText = lineText.replace(/return\s+([^;]+);/, `return (${returnValue});`);
                const line = document.lineAt(diagnostic.range.start.line);
                const edit = new vscode.WorkspaceEdit();
                edit.replace(document.uri, line.range, newText);
                action.edit = edit;
                action.diagnostics = [diagnostic];
                action.isPreferred = true;
                actions.push(action);
            }
        }
        return actions;
    }
    createAddVoidParamFix(document, diagnostic, lineText) {
        const action = new vscode.CodeAction('Adicionar (void) aos parametros vazios', vscode.CodeActionKind.QuickFix);
        const newText = lineText.replace(/\(\s*\)/, '(void)');
        const line = document.lineAt(diagnostic.range.start.line);
        const edit = new vscode.WorkspaceEdit();
        edit.replace(document.uri, line.range, newText);
        action.edit = edit;
        action.diagnostics = [diagnostic];
        action.isPreferred = true;
        return action;
    }
    createAddNewlineEOFFix(document) {
        const action = new vscode.CodeAction('Adicionar nova linha no final do arquivo', vscode.CodeActionKind.QuickFix);
        const lastLine = document.lineAt(document.lineCount - 1);
        const edit = new vscode.WorkspaceEdit();
        edit.insert(document.uri, lastLine.range.end, '\n');
        action.edit = edit;
        action.isPreferred = true;
        return action;
    }
    createRemoveEmptyLineFix(document, diagnostic) {
        const action = new vscode.CodeAction('Remover linha vazia extra', vscode.CodeActionKind.QuickFix);
        const line = document.lineAt(diagnostic.range.start.line);
        const edit = new vscode.WorkspaceEdit();
        edit.delete(document.uri, line.rangeIncludingLineBreak);
        action.edit = edit;
        action.diagnostics = [diagnostic];
        action.isPreferred = true;
        return action;
    }
    createAddSpaceAfterCommaFix(document, diagnostic, lineText) {
        const action = new vscode.CodeAction('Adicionar espaco apos virgula', vscode.CodeActionKind.QuickFix);
        const newText = lineText.replace(/,([^\s\n])/g, ', $1');
        const line = document.lineAt(diagnostic.range.start.line);
        const edit = new vscode.WorkspaceEdit();
        edit.replace(document.uri, line.range, newText);
        action.edit = edit;
        action.diagnostics = [diagnostic];
        action.isPreferred = true;
        return action;
    }
    createRemoveSpaceBeforeCommaFix(document, diagnostic, lineText) {
        const action = new vscode.CodeAction('Remover espaco antes da virgula', vscode.CodeActionKind.QuickFix);
        const newText = lineText.replace(/ +,/g, ',');
        const line = document.lineAt(diagnostic.range.start.line);
        const edit = new vscode.WorkspaceEdit();
        edit.replace(document.uri, line.range, newText);
        action.edit = edit;
        action.diagnostics = [diagnostic];
        action.isPreferred = true;
        return action;
    }
    createAddSpaceAfterKeywordFix(document, diagnostic, lineText) {
        const action = new vscode.CodeAction('Adicionar espaco apos palavra-chave', vscode.CodeActionKind.QuickFix);
        const newText = lineText.replace(/\b(if|while|for|return|switch)\(/g, '$1 (');
        const line = document.lineAt(diagnostic.range.start.line);
        const edit = new vscode.WorkspaceEdit();
        edit.replace(document.uri, line.range, newText);
        action.edit = edit;
        action.diagnostics = [diagnostic];
        action.isPreferred = true;
        return action;
    }
    createRemoveSpaceAfterParenFix(document, diagnostic, lineText) {
        const action = new vscode.CodeAction('Remover espaco apos parentese', vscode.CodeActionKind.QuickFix);
        const newText = lineText.replace(/\( +/g, '(');
        const line = document.lineAt(diagnostic.range.start.line);
        const edit = new vscode.WorkspaceEdit();
        edit.replace(document.uri, line.range, newText);
        action.edit = edit;
        action.diagnostics = [diagnostic];
        return action;
    }
    createRemoveSpaceBeforeParenFix(document, diagnostic, lineText) {
        const action = new vscode.CodeAction('Remover espaco antes do parentese', vscode.CodeActionKind.QuickFix);
        const newText = lineText.replace(/ +\)/g, ')');
        const line = document.lineAt(diagnostic.range.start.line);
        const edit = new vscode.WorkspaceEdit();
        edit.replace(document.uri, line.range, newText);
        action.edit = edit;
        action.diagnostics = [diagnostic];
        return action;
    }
    createConvertCommentFix(document, diagnostic, lineText) {
        const action = new vscode.CodeAction('Converter comentario // para /* */', vscode.CodeActionKind.QuickFix);
        const newText = lineText.replace(/\/\/\s*(.*)$/, '/* $1 */');
        const line = document.lineAt(diagnostic.range.start.line);
        const edit = new vscode.WorkspaceEdit();
        edit.replace(document.uri, line.range, newText);
        action.edit = edit;
        action.diagnostics = [diagnostic];
        return action;
    }
    createSplitLineFix(document, diagnostic, lineText) {
        const action = new vscode.CodeAction('Quebrar linha longa (manual necessario)', vscode.CodeActionKind.QuickFix);
        // Encontrar um ponto de quebra ideal
        let breakPoint = 79;
        // Tentar quebrar apos uma virgula
        const commaIndex = lineText.lastIndexOf(',', 79);
        if (commaIndex > 40) {
            breakPoint = commaIndex + 1;
        }
        // Ou apos um operador
        const operatorMatch = lineText.slice(0, 79).match(/([\+\-\*\/\=\&\|\<\>])\s*\S+$/);
        if (operatorMatch && operatorMatch.index && operatorMatch.index > 40) {
            breakPoint = operatorMatch.index + 1;
        }
        // Calcular indentacao
        const indentMatch = lineText.match(/^(\t*)/);
        const indent = indentMatch ? indentMatch[1] + '\t' : '\t\t';
        const firstPart = lineText.slice(0, breakPoint).trimEnd();
        const secondPart = lineText.slice(breakPoint).trimStart();
        const newText = firstPart + '\n' + indent + secondPart;
        const line = document.lineAt(diagnostic.range.start.line);
        const edit = new vscode.WorkspaceEdit();
        edit.replace(document.uri, line.range, newText);
        action.edit = edit;
        action.diagnostics = [diagnostic];
        return action;
    }
    createAddHeader42Fix(document) {
        const action = new vscode.CodeAction('Adicionar header 42', vscode.CodeActionKind.QuickFix);
        const fileName = document.fileName.split('/').pop() || document.fileName.split('\\').pop() || 'file.c';
        const author = 'marvin'; // Pode ser configuravel
        const now = new Date();
        const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        const header = `/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ${fileName.padEnd(51)}:+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ${author} <${author}@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: ${dateStr} by ${author}             #+#    #+#             */
/*   Updated: ${dateStr} by ${author}            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

`;
        const edit = new vscode.WorkspaceEdit();
        edit.insert(document.uri, new vscode.Position(0, 0), header);
        action.edit = edit;
        action.isPreferred = true;
        return action;
    }
    createAddIncludeGuardFix(document) {
        const action = new vscode.CodeAction('Adicionar include guard', vscode.CodeActionKind.QuickFix);
        const fileName = document.fileName.split('/').pop() || document.fileName.split('\\').pop() || 'file.h';
        const guardName = fileName.replace('.', '_').toUpperCase();
        const guardTop = `#ifndef ${guardName}\n# define ${guardName}\n\n`;
        const guardBottom = `\n#endif /* ${guardName} */\n`;
        const edit = new vscode.WorkspaceEdit();
        // Encontrar posicao apos o header (se existir)
        let insertPos = 0;
        const text = document.getText();
        const headerEnd = text.indexOf('*/');
        if (headerEnd > 0 && headerEnd < 500) {
            // Encontrar a proxima linha apos o header
            const nextLine = text.indexOf('\n', headerEnd);
            if (nextLine > 0) {
                insertPos = nextLine + 1;
            }
        }
        edit.insert(document.uri, document.positionAt(insertPos), guardTop);
        edit.insert(document.uri, document.positionAt(document.getText().length), guardBottom);
        action.edit = edit;
        action.isPreferred = true;
        return action;
    }
    createBraceNewlineFix(document, diagnostic, lineText) {
        const action = new vscode.CodeAction('Mover chave para nova linha', vscode.CodeActionKind.QuickFix);
        // Encontrar a chave e mover para nova linha
        const braceIndex = lineText.lastIndexOf('{');
        if (braceIndex > 0) {
            const beforeBrace = lineText.slice(0, braceIndex).trimEnd();
            const indentMatch = lineText.match(/^(\t*)/);
            const indent = indentMatch ? indentMatch[1] : '';
            const newText = beforeBrace + '\n' + indent + '{';
            const line = document.lineAt(diagnostic.range.start.line);
            const edit = new vscode.WorkspaceEdit();
            edit.replace(document.uri, line.range, newText);
            action.edit = edit;
        }
        action.diagnostics = [diagnostic];
        return action;
    }
}
exports.NorminetteCodeActionsProvider = NorminetteCodeActionsProvider;
NorminetteCodeActionsProvider.providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
    vscode.CodeActionKind.SourceFixAll
];
// ============================================================================
// Comando Fix All
// ============================================================================
async function fixAllNorminetteErrors(uri) {
    const document = await vscode.workspace.openTextDocument(uri);
    const edit = new vscode.WorkspaceEdit();
    // Aplicar fixes em ordem de prioridade
    const text = document.getText();
    let newText = text;
    // 1. Remover trailing whitespace
    newText = newText.split('\n').map(line => line.trimEnd()).join('\n');
    // 2. Converter espacos de indentacao para tabs
    newText = newText.split('\n').map(line => {
        const match = line.match(/^( +)/);
        if (match) {
            const spaces = match[1];
            const tabCount = Math.ceil(spaces.length / 4);
            return '\t'.repeat(tabCount) + line.slice(spaces.length);
        }
        return line;
    }).join('\n');
    // 3. Remover linhas vazias consecutivas
    newText = newText.replace(/\n{3,}/g, '\n\n');
    // 4. Adicionar espacos apos virgulas
    newText = newText.replace(/,([^\s\n])/g, ', $1');
    // 5. Adicionar espacos apos keywords
    newText = newText.replace(/\b(if|while|for|return|switch)\(/g, '$1 (');
    // 6. Adicionar parenteses aos returns
    newText = newText.replace(/return\s+([^(][^;]+);/g, (match, value) => {
        if (value.trim().startsWith('(') && value.trim().endsWith(')')) {
            return match;
        }
        return `return (${value.trim()});`;
    });
    // 7. Converter comentarios // para /* */
    newText = newText.replace(/\/\/\s*([^\n]*)/g, '/* $1 */');
    // 8. Adicionar nova linha no final se necessario
    if (!newText.endsWith('\n')) {
        newText += '\n';
    }
    // Aplicar todas as mudancas
    const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(text.length));
    edit.replace(uri, fullRange, newText);
    await vscode.workspace.applyEdit(edit);
    vscode.window.showInformationMessage('Correcoes de Norminette aplicadas!');
}
//# sourceMappingURL=codeActionsProvider.js.map