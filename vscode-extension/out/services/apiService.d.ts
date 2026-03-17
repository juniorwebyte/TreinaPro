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
export declare class ApiService {
    private baseUrl;
    private context;
    constructor(context: vscode.ExtensionContext);
    private getToken;
    setToken(token: string): Promise<void>;
    private request;
    getExercises(): Promise<Exercise[]>;
    getExercise(id: string): Promise<Exercise | null>;
    getProgress(): Promise<ProgressStats | null>;
    submitExercise(filePath: string, content: string): Promise<SubmitResult>;
    getHint(exerciseId: string): Promise<string | null>;
    private extractExerciseId;
    private getLocalExercises;
    private getLocalProgress;
    private saveLocalProgress;
    private getLocalHint;
    private getTemplate;
}
//# sourceMappingURL=apiService.d.ts.map