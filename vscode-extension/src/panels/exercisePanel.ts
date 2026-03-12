import * as vscode from 'vscode';
import { ApiService } from '../services/apiService';

export class ExercisePanelManager {
    public static currentPanel: ExercisePanelManager | undefined;
    private readonly panel: vscode.WebviewPanel;
    private disposables: vscode.Disposable[] = [];

    private constructor(
        panel: vscode.WebviewPanel,
        private context: vscode.ExtensionContext,
        private apiService: ApiService
    ) {
        this.panel = panel;
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
        this.panel.webview.html = this.getWebviewContent();
        this.setWebviewMessageListener();
    }

    public static createOrShowPanel(
        context: vscode.ExtensionContext,
        apiService: ApiService
    ): ExercisePanelManager {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (ExercisePanelManager.currentPanel) {
            ExercisePanelManager.currentPanel.panel.reveal(column);
            return ExercisePanelManager.currentPanel;
        }

        const panel = vscode.window.createWebviewPanel(
            'treinoProExercises',
            'Treino Pro - Exercicios',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        ExercisePanelManager.currentPanel = new ExercisePanelManager(panel, context, apiService);
        return ExercisePanelManager.currentPanel;
    }

    public createOrShow(): void {
        this.panel.reveal();
    }

    private setWebviewMessageListener(): void {
        this.panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'loadExercise':
                        vscode.commands.executeCommand('treinoPro.loadExercise', message.exerciseId);
                        break;
                    case 'getExercises':
                        const exercises = await this.apiService.getExercises();
                        this.panel.webview.postMessage({ command: 'exercises', data: exercises });
                        break;
                    case 'getProgress':
                        const progress = await this.apiService.getProgress();
                        this.panel.webview.postMessage({ command: 'progress', data: progress });
                        break;
                }
            },
            undefined,
            this.disposables
        );
    }

    private getWebviewContent(): string {
        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Treino Pro - Exercicios</title>
    <style>
        :root {
            --bg-color: #1e1e1e;
            --card-bg: #252526;
            --border-color: #3c3c3c;
            --text-primary: #cccccc;
            --text-secondary: #858585;
            --accent: #0e639c;
            --accent-hover: #1177bb;
            --success: #4ec9b0;
            --warning: #dcdcaa;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-primary);
            padding: 20px;
            line-height: 1.6;
        }
        
        .header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--border-color);
        }
        
        .header h1 {
            font-size: 20px;
            font-weight: 600;
        }
        
        .logo {
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, var(--accent), var(--success));
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 12px;
            margin-bottom: 24px;
        }
        
        .stat-card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 16px;
            text-align: center;
        }
        
        .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: var(--success);
        }
        
        .stat-label {
            font-size: 12px;
            color: var(--text-secondary);
            margin-top: 4px;
        }
        
        .section-title {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 12px;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .category {
            margin-bottom: 20px;
        }
        
        .category-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px 8px 0 0;
            cursor: pointer;
        }
        
        .category-header:hover {
            background: #2a2a2a;
        }
        
        .category-name {
            font-weight: 600;
        }
        
        .category-progress {
            font-size: 12px;
            color: var(--text-secondary);
        }
        
        .exercise-list {
            border: 1px solid var(--border-color);
            border-top: none;
            border-radius: 0 0 8px 8px;
        }
        
        .exercise-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            border-bottom: 1px solid var(--border-color);
            cursor: pointer;
            transition: background 0.15s;
        }
        
        .exercise-item:last-child {
            border-bottom: none;
            border-radius: 0 0 8px 8px;
        }
        
        .exercise-item:hover {
            background: var(--card-bg);
        }
        
        .exercise-status {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
        }
        
        .exercise-status.completed {
            background: var(--success);
            border-color: var(--success);
            color: #1e1e1e;
        }
        
        .exercise-info {
            flex: 1;
        }
        
        .exercise-name {
            font-weight: 500;
        }
        
        .exercise-difficulty {
            font-size: 11px;
            color: var(--text-secondary);
        }
        
        .difficulty-easy { color: var(--success); }
        .difficulty-medium { color: var(--warning); }
        .difficulty-hard { color: #f14c4c; }
        
        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            font-size: 13px;
            cursor: pointer;
            transition: background 0.15s;
        }
        
        .btn-primary {
            background: var(--accent);
            color: white;
        }
        
        .btn-primary:hover {
            background: var(--accent-hover);
        }
        
        .loading {
            text-align: center;
            padding: 40px;
            color: var(--text-secondary);
        }
        
        .spinner {
            width: 24px;
            height: 24px;
            border: 2px solid var(--border-color);
            border-top-color: var(--accent);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 12px;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">42</div>
        <h1>Guia Piscine</h1>
    </div>
    
    <div id="stats" class="stats-grid">
        <div class="stat-card">
            <div class="stat-value" id="completed">0</div>
            <div class="stat-label">Concluidos</div>
        </div>
        <div class="stat-card">
            <div class="stat-value" id="total">0</div>
            <div class="stat-label">Total</div>
        </div>
        <div class="stat-card">
            <div class="stat-value" id="points">0</div>
            <div class="stat-label">XP</div>
        </div>
        <div class="stat-card">
            <div class="stat-value" id="streak">0</div>
            <div class="stat-label">Dias</div>
        </div>
    </div>
    
    <div class="section-title">Exercicios</div>
    
    <div id="exercises">
        <div class="loading">
            <div class="spinner"></div>
            Carregando exercicios...
        </div>
    </div>
    
    <script>
        const vscode = acquireVsCodeApi();
        
        // Solicitar dados ao carregar
        vscode.postMessage({ command: 'getExercises' });
        vscode.postMessage({ command: 'getProgress' });
        
        // Receber dados
        window.addEventListener('message', event => {
            const message = event.data;
            
            if (message.command === 'exercises') {
                renderExercises(message.data);
            } else if (message.command === 'progress') {
                renderProgress(message.data);
            }
        });
        
        function renderProgress(progress) {
            if (progress) {
                document.getElementById('completed').textContent = progress.completedExercises;
                document.getElementById('total').textContent = progress.totalExercises;
                document.getElementById('points').textContent = progress.totalPoints;
                document.getElementById('streak').textContent = progress.streak;
            }
        }
        
        function renderExercises(exercises) {
            const container = document.getElementById('exercises');
            
            // Agrupar por categoria
            const categories = {};
            exercises.forEach(ex => {
                const cat = ex.category || 'Outros';
                if (!categories[cat]) categories[cat] = [];
                categories[cat].push(ex);
            });
            
            let html = '';
            
            for (const [category, items] of Object.entries(categories)) {
                const completed = items.filter(e => e.completed).length;
                
                html += \`
                    <div class="category">
                        <div class="category-header">
                            <span class="category-name">\${category}</span>
                            <span class="category-progress">\${completed}/\${items.length}</span>
                        </div>
                        <div class="exercise-list">
                \`;
                
                for (const ex of items) {
                    const diffClass = ex.difficulty.toLowerCase().includes('facil') ? 'easy' 
                        : ex.difficulty.toLowerCase().includes('medio') ? 'medium' : 'hard';
                    
                    html += \`
                        <div class="exercise-item" onclick="loadExercise('\${ex.id}')">
                            <div class="exercise-status \${ex.completed ? 'completed' : ''}">
                                \${ex.completed ? '✓' : ''}
                            </div>
                            <div class="exercise-info">
                                <div class="exercise-name">\${ex.name}</div>
                                <div class="exercise-difficulty difficulty-\${diffClass}">\${ex.difficulty}</div>
                            </div>
                        </div>
                    \`;
                }
                
                html += '</div></div>';
            }
            
            container.innerHTML = html;
        }
        
        function loadExercise(id) {
            vscode.postMessage({ command: 'loadExercise', exerciseId: id });
        }
    </script>
</body>
</html>`;
    }

    public dispose(): void {
        ExercisePanelManager.currentPanel = undefined;
        this.panel.dispose();
        while (this.disposables.length) {
            const disposable = this.disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}
