import * as vscode from 'vscode';

export interface Exercise {
    id: string;
    name: string;
    category: string;
    difficulty: string;
    description?: string;
    completed: boolean;
    folder: string;
    fileName: string;
    template?: string;
    tests?: string[];
    hints?: string[];
}

export interface ProgressStats {
    totalExercises: number;
    completedExercises: number;
    totalPoints: number;
    streak: number;
    level: string;
}

export interface SubmitResult {
    success: boolean;
    score?: number;
    error?: string;
    feedback?: string;
}

export class ApiService {
    private baseUrl: string;
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        const config = vscode.workspace.getConfiguration('treinoPro');
        this.baseUrl = config.get('apiEndpoint') || 'https://treino-pro.vercel.app/api';
    }

    private getToken(): string | undefined {
        return this.context.globalState.get('authToken');
    }

    async setToken(token: string): Promise<void> {
        await this.context.globalState.update('authToken', token);
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
        try {
            const token = this.getToken();
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                ...(options.headers as Record<string, string> || {})
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

            return await response.json() as T;
        } catch (error) {
            console.error('API request failed:', error);
            return null;
        }
    }

    async getExercises(): Promise<Exercise[]> {
        const result = await this.request<{ exercises: Exercise[] }>('/exercises');
        return result?.exercises || this.getLocalExercises();
    }

    async getExercise(id: string): Promise<Exercise | null> {
        const result = await this.request<{ exercise: Exercise }>(`/exercises/${id}`);
        if (result?.exercise) {
            return result.exercise;
        }
        
        // Fallback para exercicios locais
        const localExercises = this.getLocalExercises();
        return localExercises.find(e => e.id === id) || null;
    }

    async getProgress(): Promise<ProgressStats | null> {
        const result = await this.request<{ progress: ProgressStats }>('/progress');
        return result?.progress || this.getLocalProgress();
    }

    async submitExercise(filePath: string, content: string): Promise<SubmitResult> {
        const exerciseId = this.extractExerciseId(filePath);
        
        const result = await this.request<SubmitResult>('/submit', {
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

    async getHint(exerciseId: string): Promise<string | null> {
        const result = await this.request<{ hint: string }>(`/exercises/${exerciseId}/hint`);
        return result?.hint || this.getLocalHint(exerciseId);
    }

    private extractExerciseId(filePath: string): string {
        const match = filePath.match(/ex(\d+)/);
        return match ? match[1] : 'unknown';
    }

    // Dados locais de fallback
    private getLocalExercises(): Exercise[] {
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

    private getLocalProgress(): ProgressStats {
        const saved = this.context.globalState.get<ProgressStats>('localProgress');
        return saved || {
            totalExercises: 50,
            completedExercises: 0,
            totalPoints: 0,
            streak: 0,
            level: 'Iniciante'
        };
    }

    private async saveLocalProgress(exerciseId: string, score: number): Promise<void> {
        const progress = this.getLocalProgress();
        if (score >= 80) {
            progress.completedExercises++;
            progress.totalPoints += score;
        }
        await this.context.globalState.update('localProgress', progress);
    }

    private getLocalHint(exerciseId: string): string | null {
        const hints: Record<string, string> = {
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

    private getTemplate(fileName: string): string {
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
