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
exports.ProgressItem = exports.ProgressProvider = void 0;
const vscode = __importStar(require("vscode"));
class ProgressProvider {
    constructor(apiService) {
        this.apiService = apiService;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.stats = {
            totalExercises: 0,
            completedExercises: 0,
            totalPoints: 0,
            streak: 0,
            level: 'Iniciante'
        };
        this.loadStats();
    }
    refresh() {
        this.loadStats();
        this._onDidChangeTreeData.fire();
    }
    async loadStats() {
        const progress = await this.apiService.getProgress();
        if (progress) {
            this.stats = progress;
        }
    }
    getTreeItem(element) {
        return element;
    }
    async getChildren() {
        const percentage = this.stats.totalExercises > 0
            ? Math.round((this.stats.completedExercises / this.stats.totalExercises) * 100)
            : 0;
        return [
            new ProgressItem('Nivel', this.stats.level, 'star-full'),
            new ProgressItem('Exercicios', `${this.stats.completedExercises}/${this.stats.totalExercises} (${percentage}%)`, 'checklist'),
            new ProgressItem('Pontos', `${this.stats.totalPoints} XP`, 'flame'),
            new ProgressItem('Sequencia', `${this.stats.streak} dias`, 'calendar')
        ];
    }
}
exports.ProgressProvider = ProgressProvider;
class ProgressItem extends vscode.TreeItem {
    constructor(label, value, icon) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.label = label;
        this.value = value;
        this.icon = icon;
        this.description = value;
        this.iconPath = new vscode.ThemeIcon(icon);
        this.contextValue = 'progressItem';
    }
}
exports.ProgressItem = ProgressItem;
//# sourceMappingURL=progressProvider.js.map