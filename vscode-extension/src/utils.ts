/**
 * Funções utilitárias da extensão
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { PATTERNS, VALIDATION_LIMITS } from './constants';

/**
 * Obtém configuração da extensão
 */
export function getExtensionConfig(key: string): any {
  return vscode.workspace.getConfiguration('treinoPro').get(key);
}

/**
 * Atualiza configuração da extensão
 */
export async function updateExtensionConfig(key: string, value: any): Promise<void> {
  await vscode.workspace.getConfiguration('treinoPro').update(key, value, vscode.ConfigurationTarget.Global);
}

/**
 * Exibe mensagem de informação
 */
export function showInfo(message: string): void {
  vscode.window.showInformationMessage(`[Treino Pro] ${message}`);
}

/**
 * Exibe mensagem de erro
 */
export function showError(message: string): void {
  vscode.window.showErrorMessage(`[Treino Pro] ${message}`);
}

/**
 * Exibe mensagem de aviso
 */
export function showWarning(message: string): void {
  vscode.window.showWarningMessage(`[Treino Pro] ${message}`);
}

/**
 * Verifica se é arquivo C
 */
export function isCFile(filePath: string): boolean {
  return PATTERNS.C_FILE.test(filePath);
}

/**
 * Verifica se é arquivo header
 */
export function isHeaderFile(filePath: string): boolean {
  return PATTERNS.HEADER_FILE.test(filePath);
}

/**
 * Verifica se é arquivo Bash
 */
export function isBashFile(filePath: string): boolean {
  return PATTERNS.BASH_FILE.test(filePath);
}

/**
 * Obtém nome de função a partir de caminho de arquivo
 */
export function getFunctionNameFromFile(filePath: string): string {
  return path.basename(filePath, path.extname(filePath));
}

/**
 * Converte espaços para tabs
 */
export function spacesToTabs(content: string): string {
  return content.replace(/^    /gm, '\t');
}

/**
 * Converte tabs para espaços
 */
export function tabsToSpaces(content: string, spaces: number = 4): string {
  return content.replace(/\t/g, ' '.repeat(spaces));
}

/**
 * Remove espaços em branco no final das linhas
 */
export function trimTrailingWhitespace(content: string): string {
  return content.replace(/[ \t]+$/gm, '');
}

/**
 * Adiciona newline ao final do arquivo se não tiver
 */
export function ensureTrailingNewline(content: string): string {
  if (!content.endsWith('\n')) {
    return content + '\n';
  }
  return content;
}

/**
 * Calcula profundidade de aninhamento
 */
export function calculateNestingDepth(content: string): number {
  let maxDepth = 0;
  let currentDepth = 0;

  for (const char of content) {
    if (char === '{') {
      currentDepth++;
      maxDepth = Math.max(maxDepth, currentDepth);
    } else if (char === '}') {
      currentDepth--;
    }
  }

  return maxDepth;
}

/**
 * Obtém número de linhas
 */
export function getLineCount(content: string): number {
  return content.split('\n').length;
}

/**
 * Obtém comprimento da linha mais longa
 */
export function getLongestLineLength(content: string): number {
  return content.split('\n').reduce((max, line) => Math.max(max, line.length), 0);
}

/**
 * Verifica se linha é muito longa
 */
export function isLineTooLong(line: string, maxLength: number = VALIDATION_LIMITS.MAX_LINE_LENGTH): boolean {
  return line.length > maxLength;
}

/**
 * Extrai número de linha de mensagem de erro
 */
export function extractLineNumber(errorMessage: string): number | null {
  const match = errorMessage.match(/line (\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Extrai coluna de mensagem de erro
 */
export function extractColumn(errorMessage: string): number | null {
  const match = errorMessage.match(/column (\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Cria diagrama de progresso visual
 */
export function createProgressBar(current: number, total: number, width: number = 20): string {
  const percentage = Math.round((current / total) * 100);
  const filledWidth = Math.round((current / total) * width);
  const emptyWidth = width - filledWidth;

  return `[${'█'.repeat(filledWidth)}${'░'.repeat(emptyWidth)}] ${percentage}%`;
}

/**
 * Formata duração em ms para string legível
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  const seconds = (ms / 1000).toFixed(2);
  return `${seconds}s`;
}

/**
 * Aguarda tempo especificado
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce para funções
 */
export function debounce(func: (...args: any[]) => void, wait: number) {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Cache simples
 */
export class SimpleCache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>();
  private ttl: number;

  constructor(ttl: number = 5000) {
    this.ttl = ttl;
  }

  set(key: string, value: T): void {
    this.cache.set(key, { data: value, timestamp: Date.now() });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

/**
 * Logger da extensão
 */
export class Logger {
  private static outputChannel: vscode.OutputChannel | null = null;

  static init(): void {
    if (!this.outputChannel) {
      this.outputChannel = vscode.window.createOutputChannel('Treino Pro');
    }
  }

  static log(message: string): void {
    this.init();
    this.outputChannel?.appendLine(`[INFO] ${new Date().toISOString()} - ${message}`);
  }

  static error(message: string, error?: Error): void {
    this.init();
    const errorMsg = error ? `${message}: ${error.message}` : message;
    this.outputChannel?.appendLine(`[ERROR] ${new Date().toISOString()} - ${errorMsg}`);
  }

  static warn(message: string): void {
    this.init();
    this.outputChannel?.appendLine(`[WARN] ${new Date().toISOString()} - ${message}`);
  }

  static debug(message: string): void {
    this.init();
    this.outputChannel?.appendLine(`[DEBUG] ${new Date().toISOString()} - ${message}`);
  }

  static show(): void {
    this.outputChannel?.show();
  }

  static clear(): void {
    this.outputChannel?.clear();
  }
}

/**
 * Validador de código
 */
export class CodeValidator {
  /**
   * Valida nomenclatura de variável global
   */
  static isValidGlobalVarName(name: string): boolean {
    return /^g_[a-z_][a-z0-9_]*$/i.test(name);
  }

  /**
   * Valida nomenclatura de variável estática
   */
  static isValidStaticVarName(name: string): boolean {
    return /^s_[a-z_][a-z0-9_]*$/i.test(name);
  }

  /**
   * Valida nomenclatura de variável extern
   */
  static isValidExternVarName(name: string): boolean {
    return /^e_[a-z_][a-z0-9_]*$/i.test(name);
  }

  /**
   * Valida sufixo de typedef
   */
  static hasValidTypedefSuffix(name: string): boolean {
    return name.endsWith('_t');
  }

  /**
   * Valida protótipo de função
   */
  static isValidFunctionPrototype(prototype: string): boolean {
    return /^[a-z_*\s]+[a-z_]+\([^)]*\);$/.test(prototype.trim());
  }

  /**
   * Obtém tipo de erro potencial
   */
  static detectErrorType(line: string): string | null {
    if (/^\t/.test(line)) {
      return 'indentation';
    }
    if (line.length > VALIDATION_LIMITS.MAX_LINE_LENGTH) {
      return 'line_too_long';
    }
    if (/\s+$/.test(line)) {
      return 'trailing_whitespace';
    }
    return null;
  }
}
