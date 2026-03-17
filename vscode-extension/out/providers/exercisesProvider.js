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
exports.ExerciseItem = exports.ExercisesProvider = void 0;
const vscode = __importStar(require("vscode"));
class ExercisesProvider {
    constructor(apiService) {
        this.apiService = apiService;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.exercises = [];
        this.categories = new Map();
        this.loadExercises();
    }
    refresh() {
        this.loadExercises();
        this._onDidChangeTreeData.fire();
    }
    async loadExercises() {
        this.exercises = await this.apiService.getExercises();
        this.categories.clear();
        for (const exercise of this.exercises) {
            const category = exercise.category || 'Outros';
            if (!this.categories.has(category)) {
                this.categories.set(category, []);
            }
            this.categories.get(category).push(exercise);
        }
    }
    getTreeItem(element) {
        return element;
    }
    async getChildren(element) {
        if (!element) {
            // Raiz - retorna categorias
            const categoryItems = [];
            for (const [category, exercises] of this.categories) {
                const completedCount = exercises.filter(e => e.completed).length;
                categoryItems.push(new ExerciseItem(category, `${completedCount}/${exercises.length}`, vscode.TreeItemCollapsibleState.Collapsed, 'category', undefined));
            }
            return categoryItems;
        }
        else if (element.type === 'category') {
            // Categoria - retorna exercicios
            const exercises = this.categories.get(element.label) || [];
            return exercises.map(ex => new ExerciseItem(ex.name, ex.difficulty, vscode.TreeItemCollapsibleState.None, 'exercise', ex));
        }
        return [];
    }
}
exports.ExercisesProvider = ExercisesProvider;
class ExerciseItem extends vscode.TreeItem {
    constructor(label, description, collapsibleState, type, exercise) {
        super(label, collapsibleState);
        this.label = label;
        this.description = description;
        this.collapsibleState = collapsibleState;
        this.type = type;
        this.exercise = exercise;
        if (type === 'category') {
            this.iconPath = new vscode.ThemeIcon('folder');
            this.contextValue = 'category';
        }
        else if (exercise) {
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
exports.ExerciseItem = ExerciseItem;
//# sourceMappingURL=exercisesProvider.js.map