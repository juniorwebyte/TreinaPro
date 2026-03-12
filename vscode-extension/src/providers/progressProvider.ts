import * as vscode from 'vscode';
import { ApiService } from '../services/apiService';

interface ProgressStats {
    totalExercises: number;
    completedExercises: number;
    totalPoints: number;
    streak: number;
    level: string;
}

export class ProgressProvider implements vscode.TreeDataProvider<ProgressItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ProgressItem | undefined | null | void> = new vscode.EventEmitter<ProgressItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ProgressItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private stats: ProgressStats = {
        totalExercises: 0,
        completedExercises: 0,
        totalPoints: 0,
        streak: 0,
        level: 'Iniciante'
    };

    constructor(private apiService: ApiService) {
        this.loadStats();
    }

    refresh(): void {
        this.loadStats();
        this._onDidChangeTreeData.fire();
    }

    private async loadStats() {
        const progress = await this.apiService.getProgress();
        if (progress) {
            this.stats = progress;
        }
    }

    getTreeItem(element: ProgressItem): vscode.TreeItem {
        return element;
    }

    async getChildren(): Promise<ProgressItem[]> {
        const percentage = this.stats.totalExercises > 0 
            ? Math.round((this.stats.completedExercises / this.stats.totalExercises) * 100) 
            : 0;

        return [
            new ProgressItem(
                'Nivel',
                this.stats.level,
                'star-full'
            ),
            new ProgressItem(
                'Exercicios',
                `${this.stats.completedExercises}/${this.stats.totalExercises} (${percentage}%)`,
                'checklist'
            ),
            new ProgressItem(
                'Pontos',
                `${this.stats.totalPoints} XP`,
                'flame'
            ),
            new ProgressItem(
                'Sequencia',
                `${this.stats.streak} dias`,
                'calendar'
            )
        ];
    }
}

export class ProgressItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly value: string,
        public readonly icon: string
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.description = value;
        this.iconPath = new vscode.ThemeIcon(icon);
        this.contextValue = 'progressItem';
    }
}
