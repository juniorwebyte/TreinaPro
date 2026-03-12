import * as vscode from 'vscode';
import { ApiService, Exercise } from '../services/apiService';

export class ExercisesProvider implements vscode.TreeDataProvider<ExerciseItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ExerciseItem | undefined | null | void> = new vscode.EventEmitter<ExerciseItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ExerciseItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private exercises: Exercise[] = [];
    private categories: Map<string, Exercise[]> = new Map();

    constructor(private apiService: ApiService) {
        this.loadExercises();
    }

    refresh(): void {
        this.loadExercises();
        this._onDidChangeTreeData.fire();
    }

    private async loadExercises() {
        this.exercises = await this.apiService.getExercises();
        this.categories.clear();

        for (const exercise of this.exercises) {
            const category = exercise.category || 'Outros';
            if (!this.categories.has(category)) {
                this.categories.set(category, []);
            }
            this.categories.get(category)!.push(exercise);
        }
    }

    getTreeItem(element: ExerciseItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: ExerciseItem): Promise<ExerciseItem[]> {
        if (!element) {
            // Raiz - retorna categorias
            const categoryItems: ExerciseItem[] = [];
            
            for (const [category, exercises] of this.categories) {
                const completedCount = exercises.filter(e => e.completed).length;
                categoryItems.push(new ExerciseItem(
                    category,
                    `${completedCount}/${exercises.length}`,
                    vscode.TreeItemCollapsibleState.Collapsed,
                    'category',
                    undefined
                ));
            }

            return categoryItems;
        } else if (element.type === 'category') {
            // Categoria - retorna exercicios
            const exercises = this.categories.get(element.label as string) || [];
            return exercises.map(ex => new ExerciseItem(
                ex.name,
                ex.difficulty,
                vscode.TreeItemCollapsibleState.None,
                'exercise',
                ex
            ));
        }

        return [];
    }
}

export class ExerciseItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly description: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly type: 'category' | 'exercise',
        public readonly exercise?: Exercise
    ) {
        super(label, collapsibleState);

        if (type === 'category') {
            this.iconPath = new vscode.ThemeIcon('folder');
            this.contextValue = 'category';
        } else if (exercise) {
            this.iconPath = exercise.completed 
                ? new vscode.ThemeIcon('check', new vscode.ThemeColor('charts.green'))
                : new vscode.ThemeIcon('circle-outline');
            this.contextValue = 'exercise';
            this.command = {
                command: 'treinoPro.loadExercise',
                title: 'Carregar Exercicio',
                arguments: [exercise.id]
            };

            // Tooltip com detalhes
            this.tooltip = new vscode.MarkdownString();
            this.tooltip.appendMarkdown(`**${exercise.name}**\n\n`);
            this.tooltip.appendMarkdown(`Dificuldade: ${exercise.difficulty}\n\n`);
            this.tooltip.appendMarkdown(`${exercise.description || ''}`);
        }
    }
}
