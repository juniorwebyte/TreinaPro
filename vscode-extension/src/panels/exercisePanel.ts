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
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: 14px;
            font-family: inherit;
            color: #fff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .header-badges {
            margin-left: auto;
            display: flex;
            gap: 8px;
        }
        
        .badge {
            font-size: 10px;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .badge-norm {
            background-color: rgba(78, 201, 176, 0.15);
            color: var(--success);
            border: 1px solid rgba(78, 201, 176, 0.3);
        }
        
        .badge-moul {
            background-color: rgba(220, 220, 170, 0.15);
            color: var(--warning);
            border: 1px solid rgba(220, 220, 170, 0.3);
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

        /* Terminal Animation Styles */
        .terminal-demo {
            background: #181818;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 24px;
            font-family: 'Courier New', Courier, monospace;
            font-size: 13px;
            min-height: 200px;
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        }
        
        .terminal-header {
            display: flex;
            gap: 6px;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #333;
        }
        
        .dot { width: 10px; height: 10px; border-radius: 50%; }
        .dot-red { background: #ff5f56; }
        .dot-yellow { background: #ffbd2e; }
        .dot-green { background: #27c93f; }
        
        .terminal-body {
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding-top: 5px;
        }
        
        .line { opacity: 0; animation: fadeIn 0.1s forwards; }
        .line .dollar { color: var(--success); }
        .line.info { color: #4fc1ff; font-weight: 500;}
        .line.success { color: var(--success); font-weight: bold; }
        .blink { animation: blink 1s step-end infinite; }
        
        @keyframes fadeIn { to { opacity: 1; } }
        @keyframes blink { 50% { opacity: 0; } }

    </style>
</head>
<body>
    <div class="header">
        <div class="logo">TP</div>
        <h1>Treino Pro Workspace</h1>
        
        <div class="header-badges">
            <span class="badge badge-norm">Norminette Ready</span>
            <span class="badge badge-moul">Mini-Moulinette Powered</span>
        </div>
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
    
    <div class="section-title">Guia de Uso Rápido</div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div class="stat-card" style="text-align: left; padding: 12px;">
            <div style="color: var(--accent); font-weight: bold; margin-bottom: 4px;">1. Abrir Terminal</div>
            <div style="font-size: 11px; color: var(--text-secondary);">Sincronizacao automatica ativada! Abra pelo icone ou <b>Ctrl+Shift+P</b>.</div>
        </div>
        <div class="stat-card" style="text-align: left; padding: 12px;">
            <div style="color: var(--accent); font-weight: bold; margin-bottom: 4px;">2. Ir ao Exercício</div>
            <div style="font-size: 11px; color: var(--text-secondary);">Navegue ate a pasta (ex: <b>cd C00</b>). O script se adapta sozinho!</div>
        </div>
        <div class="stat-card" style="text-align: left; padding: 12px;">
            <div style="color: var(--accent); font-weight: bold; margin-bottom: 4px;">3. Rodar Comandos</div>
            <div style="font-size: 11px; color: var(--text-secondary);">Digite <b>mini</b> para testes ou <b>webytehub -42</b> para validacao.</div>
        </div>
    </div>

    <div class="section-title">Terminal Integrado (Demonstração)</div>
    <div class="terminal-demo">
        <div class="terminal-header">
            <div class="dot dot-red"></div>
            <div class="dot dot-yellow"></div>
            <div class="dot dot-green"></div>
            <span style="margin-left:auto; color: #888; font-size:10px;">Webytehub Terminal v1.3.2</span>
        </div>
        <div id="term-body" class="terminal-body">
            <span id="cursor" style="display:inline-block; width:8px; height:15px; background:#aaa;" class="blink"></span>
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
        
        // Terminal Animation Script
        function runTerminalAnimation() {
            const sequence = [
              { text: '<span class="dollar">$</span> cd C00', delay: 800 },
              { text: '<span class="dollar">$</span> mini', delay: 1800 },
              { text: '<span class="success">Detectando assignment: C00</span>', delay: 2400 },
              { text: '<span class="info">Executando Norminette...</span>', delay: 3500 },
              { text: '<span class="success">Norme: OK!</span>', delay: 4200 },
              { text: '<span class="info">Gerando testes para C00...</span>', delay: 5500 },
              { text: '<span class="success">✓ PASS ex00 (ft_putchar)</span>', delay: 6500 },
              { text: '<span class="success">✓ PASS ex01 (ft_print_alphabet)</span>', delay: 7200 },
              { text: '<span class="success">Final score: 100/100</span>', delay: 8500 },
              { text: '<span class="dollar">$</span> ', delay: 10000 }
            ];
            
            const termBody = document.getElementById('term-body');
            const cursor = document.getElementById('cursor');
            let timeoutIds = [];
            
            function play() {
                const lines = termBody.querySelectorAll('.line');
                lines.forEach(l => l.remove());
                
                sequence.forEach(item => {
                    const id = setTimeout(() => {
                        const div = document.createElement('div');
                        div.className = 'line';
                        div.innerHTML = item.text;
                        termBody.insertBefore(div, cursor);
                    }, item.delay);
                    timeoutIds.push(id);
                });
                
                const resetId = setTimeout(play, 9500);
                timeoutIds.push(resetId);
            }
            play();
        }
        
        runTerminalAnimation();
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
