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
exports.ApiService = void 0;
const vscode = __importStar(require("vscode"));
class ApiService {
    constructor(context) {
        this.context = context;
        const config = vscode.workspace.getConfiguration('treinoPro');
        this.baseUrl = config.get('apiEndpoint') || 'https://treino-pro.vercel.app/api';
    }
    getToken() {
        return this.context.globalState.get('authToken');
    }
    async setToken(token) {
        await this.context.globalState.update('authToken', token);
    }
    async request(endpoint, options = {}) {
        try {
            const token = this.getToken();
            const headers = {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers
            });
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('API request failed:', error);
            return null;
        }
    }
    async getExercises() {
        const result = await this.request('/exercises');
        return result?.exercises || this.getLocalExercises();
    }
    async getExercise(id) {
        const result = await this.request(`/exercises/${id}`);
        if (result?.exercise) {
            return result.exercise;
        }
        // Fallback para exercicios locais
        const localExercises = this.getLocalExercises();
        return localExercises.find(e => e.id === id) || null;
    }
    async getProgress() {
        const result = await this.request('/progress');
        return result?.progress || this.getLocalProgress();
    }
    async submitExercise(filePath, content) {
        const exerciseId = this.extractExerciseId(filePath);
        const result = await this.request('/submit', {
            method: 'POST',
            body: JSON.stringify({
                exerciseId,
                content,
                timestamp: new Date().toISOString()
            })
        });
        if (result) {
            // Salvar progresso localmente
            await this.saveLocalProgress(exerciseId, result.score || 0);
            return result;
        }
        return { success: false, error: 'Falha na conexao com o servidor' };
    }
    async getHint(exerciseId) {
        const result = await this.request(`/exercises/${exerciseId}/hint`);
        return result?.hint || this.getLocalHint(exerciseId);
    }
    extractExerciseId(filePath) {
        const match = filePath.match(/ex(\d+)/);
        return match ? match[1] : 'unknown';
    }
    // Dados locais de fallback
    getLocalExercises() {
        return [
            {
                id: 'c00-ex00',
                name: 'ft_putchar',
                category: 'C00',
                difficulty: 'Facil',
                description: 'Escreva uma funcao que exiba o caractere passado como parametro.',
                completed: false,
                folder: 'c00/ex00',
                fileName: 'ft_putchar.c',
                template: this.getTemplate('ft_putchar.c')
            },
            {
                id: 'c00-ex01',
                name: 'ft_print_alphabet',
                category: 'C00',
                difficulty: 'Facil',
                description: 'Escreva uma funcao que exiba o alfabeto em minusculas.',
                completed: false,
                folder: 'c00/ex01',
                fileName: 'ft_print_alphabet.c',
                template: this.getTemplate('ft_print_alphabet.c')
            },
            {
                id: 'c00-ex02',
                name: 'ft_print_reverse_alphabet',
                category: 'C00',
                difficulty: 'Facil',
                description: 'Escreva uma funcao que exiba o alfabeto em minusculas ao contrario.',
                completed: false,
                folder: 'c00/ex02',
                fileName: 'ft_print_reverse_alphabet.c',
                template: this.getTemplate('ft_print_reverse_alphabet.c')
            },
            {
                id: 'c00-ex03',
                name: 'ft_print_numbers',
                category: 'C00',
                difficulty: 'Facil',
                description: 'Escreva uma funcao que exiba todos os digitos.',
                completed: false,
                folder: 'c00/ex03',
                fileName: 'ft_print_numbers.c',
                template: this.getTemplate('ft_print_numbers.c')
            },
            {
                id: 'c00-ex04',
                name: 'ft_is_negative',
                category: 'C00',
                difficulty: 'Facil',
                description: 'Escreva uma funcao que exiba N ou P dependendo do sinal do numero.',
                completed: false,
                folder: 'c00/ex04',
                fileName: 'ft_is_negative.c',
                template: this.getTemplate('ft_is_negative.c')
            },
            {
                id: 'c01-ex00',
                name: 'ft_ft',
                category: 'C01',
                difficulty: 'Facil',
                description: 'Escreva uma funcao que atribua 42 ao valor apontado por ponteiro.',
                completed: false,
                folder: 'c01/ex00',
                fileName: 'ft_ft.c',
                template: this.getTemplate('ft_ft.c')
            },
            {
                id: 'c01-ex01',
                name: 'ft_ultimate_ft',
                category: 'C01',
                difficulty: 'Medio',
                description: 'Escreva uma funcao que atribua 42 usando 9 niveis de ponteiros.',
                completed: false,
                folder: 'c01/ex01',
                fileName: 'ft_ultimate_ft.c',
                template: this.getTemplate('ft_ultimate_ft.c')
            },
            {
                id: 'c01-ex02',
                name: 'ft_swap',
                category: 'C01',
                difficulty: 'Facil',
                description: 'Escreva uma funcao que troque os valores de dois inteiros.',
                completed: false,
                folder: 'c01/ex02',
                fileName: 'ft_swap.c',
                template: this.getTemplate('ft_swap.c')
            }
        ];
    }
    getLocalProgress() {
        const saved = this.context.globalState.get('localProgress');
        return saved || {
            totalExercises: 50,
            completedExercises: 0,
            totalPoints: 0,
            streak: 0,
            level: 'Iniciante'
        };
    }
    async saveLocalProgress(exerciseId, score) {
        const progress = this.getLocalProgress();
        if (score >= 80) {
            progress.completedExercises++;
            progress.totalPoints += score;
        }
        await this.context.globalState.update('localProgress', progress);
    }
    getLocalHint(exerciseId) {
        const hints = {
            'c00-ex00': 'Use a funcao write() para escrever um caractere. Lembre-se: write(1, &c, 1)',
            'c00-ex01': 'Use um loop de a ate z. O caractere a tem valor ASCII 97.',
            'c00-ex02': 'Similar ao ex01, mas comece de z e va ate a.',
            'c00-ex03': 'Use um loop de 0 ate 9. O caractere 0 tem valor ASCII 48.',
            'c00-ex04': 'Verifique se n < 0 para saber se e negativo.',
            'c01-ex00': 'Lembre-se: *p = 42 atribui 42 ao valor apontado por p.',
            'c01-ex01': 'Cada * adicional dereferencia um nivel do ponteiro.',
            'c01-ex02': 'Use uma variavel temporaria para guardar um dos valores.'
        };
        return hints[exerciseId] || null;
    }
    getTemplate(fileName) {
        return `/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ${fileName.padEnd(51)}:+:      :+:    :+:   */
/*                                                                            */
/*   By: marvin <marvin@student.42.fr>          +#+  +:+       +#+        */
/*                                                                            */
/*   Created: 2026/03/12 00:00:00 by marvin            #+#    #+#             */
/*   Updated: 2026/03/12 00:00:00 by marvin           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

`;
    }
}
exports.ApiService = ApiService;
//# sourceMappingURL=apiService.js.map