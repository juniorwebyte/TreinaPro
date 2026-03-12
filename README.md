<p align="center">
  <img src="public/images/logo.png" alt="Treino Pro Logo" width="120" height="120" />
</p>

<h1 align="center">Treino Pro</h1>

<p align="center">
  <strong>Plataforma de Estudos - Preparacao 42 Sao Paulo</strong>
</p>

<p align="center">
  Plataforma de estudos interativa com exercicios praticos em C, Shell, Python, HTML, CSS, JavaScript e PHP. Treine, aprenda e conquiste sua vaga na 42 Sao Paulo.
</p>

<p align="center">
  <a href="#funcionalidades">Funcionalidades</a> •
  <a href="#tecnologias">Tecnologias</a> •
  <a href="#instalacao">Instalacao</a> •
  <a href="#uso">Uso</a> •
  <a href="#extensao-vscode">Extensao VSCode</a> •
  <a href="#estrutura">Estrutura</a> •
  <a href="#contribuindo">Contribuindo</a> •
  <a href="#licenca">Licenca</a>
</p>

---

## Sobre o Projeto

O **Treino Pro** e uma plataforma completa desenvolvida para estudantes que desejam se preparar para a Piscine da 42 Sao Paulo. A plataforma oferece:

- Exercicios praticos organizados por linguagem e dificuldade
- Validacao automatica de codigo com Norminette integrada
- Simulador de provas (Exam02)
- Flashcards para revisao de conceitos
- Mapas mentais interativos
- Extensao oficial para VSCode
- Modo offline para estudar em qualquer lugar

### Don't Panic.

Inspirado no icone **Guia do Mochileiro das Galaxias**, o Treino Pro traz uma abordagem descontraida e motivadora para o aprendizado de programacao.

---

## Funcionalidades

### Treinar
- **Exercicios em C**: Modulos C00 a C07 com todos os exercicios da Piscine
- **Exercicios em Shell**: Shell00 e Shell01 completos
- **Outras linguagens**: Python, HTML, CSS, JavaScript e PHP
- **Compilacao automatica**: Flags `-Wall -Wextra -Werror`
- **Testes automatizados**: Validacao de casos de borda e valores limites

### Norminette
- Validacao de estilo de codigo em tempo real
- Destaque de erros diretamente no editor
- Correcoes automaticas para erros comuns
- Suporte a todas as regras da 42

### Exam02 Simulator
- Simulacao realista das provas da Piscine
- Timer com contagem regressiva
- Questoes aleatorias baseadas no banco oficial
- Historico de tentativas e pontuacao

### Flashcards
- Revisao espacada de conceitos
- Categorias: C, Shell, Git, Unix
- Sistema de dificuldade adaptativo
- Progresso salvo automaticamente

### Mapa Mental
- Visualizacao interativa de conceitos
- Conexoes entre topicos relacionados
- Zoom e navegacao fluida
- Exportacao em diferentes formatos

### Modo Colaborativo
- Estude em grupo em tempo real
- Chat integrado
- Compartilhamento de codigo
- Resolucao colaborativa de exercicios

### Modo Offline
- Baixe exercicios para estudar sem internet
- Sincronizacao automatica quando conectado
- PWA instalavel no dispositivo

---

## Tecnologias

O projeto foi construido com tecnologias modernas e de alta performance:

| Tecnologia | Versao | Descricao |
|------------|--------|-----------|
| **Next.js** | 16.1.6 | Framework React com App Router |
| **React** | 19.2.4 | Biblioteca de interface |
| **TypeScript** | 5.7.3 | Tipagem estatica |
| **Tailwind CSS** | 4.2.0 | Framework CSS utility-first |
| **shadcn/ui** | Latest | Componentes acessiveis |
| **Radix UI** | Latest | Primitivos de UI |
| **Recharts** | 2.15.0 | Graficos e visualizacoes |
| **Zod** | 3.24.1 | Validacao de schemas |
| **React Hook Form** | 7.54.1 | Gerenciamento de formularios |

---

## Instalacao

### Pre-requisitos

- Node.js 18.17 ou superior
- pnpm (recomendado) ou npm

### Passos

1. **Clone o repositorio**
```bash
git clone https://github.com/treino-pro/treino-pro.git
cd treino-pro
```

2. **Instale as dependencias**
```bash
pnpm install
```

3. **Configure as variaveis de ambiente**
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas configuracoes.

4. **Inicie o servidor de desenvolvimento**
```bash
pnpm dev
```

5. **Acesse a aplicacao**
```
http://localhost:3000
```

### Build de Producao

```bash
pnpm build
pnpm start
```

---

## Uso

### Navegacao Principal

| Rota | Descricao |
|------|-----------|
| `/` | Landing page com informacoes do projeto |
| `/treinar` | Ambiente de treino com exercicios |
| `/exam02` | Simulador de provas Exam02 |
| `/exam-simulator` | Simulador de exames completo |
| `/flashcards` | Sistema de flashcards |
| `/mapa-mental` | Mapas mentais interativos |
| `/collaborative` | Modo de estudo colaborativo |
| `/offline` | Configuracoes do modo offline |
| `/vscode-extension` | Download da extensao VSCode |
| `/dashboard` | Painel do usuario |
| `/settings` | Configuracoes da conta |

### Atalhos de Teclado (Ambiente de Treino)

| Atalho | Acao |
|--------|------|
| `Ctrl + Enter` | Executar codigo |
| `Ctrl + S` | Salvar progresso |
| `Ctrl + Shift + N` | Verificar Norminette |
| `Ctrl + Shift + T` | Executar testes |
| `Esc` | Fechar modal/painel |

---

## Extensao VSCode

O Treino Pro possui uma extensao oficial para VSCode que integra todas as ferramentas diretamente no seu editor.

### Instalacao da Extensao

1. Acesse `/vscode-extension` na plataforma
2. Clique em "Baixar Extensao (.vsix)"
3. No VSCode: `Ctrl+Shift+P` > "Install from VSIX"
4. Selecione o arquivo baixado
5. Reinicie o VSCode

### Comandos da Extensao

| Comando | Descricao | Atalho |
|---------|-----------|--------|
| `treinoPro.openPanel` | Abrir painel de exercicios | `Ctrl+Shift+P` |
| `treinoPro.runNorminette` | Verificar Norminette | `Ctrl+Shift+N` |
| `treinoPro.compileAndTest` | Compilar e testar | `Ctrl+Shift+T` |
| `treinoPro.loadExercise` | Carregar exercicio | - |
| `treinoPro.submitExercise` | Enviar exercicio | - |
| `treinoPro.showHint` | Mostrar dica | - |
| `treinoPro.syncProgress` | Sincronizar progresso | - |
| `treinoPro.fixNormErrors` | Corrigir erros Norminette | - |
| `treinoPro.addHeader42` | Adicionar header 42 | - |
| `treinoPro.copilotFix` | Corrigir com IA | - |
| `treinoPro.copilotExplain` | Explicar erro com IA | - |

### Configuracoes da Extensao

```json
{
  "treinoPro.showNorminetteOnSave": true,
  "treinoPro.realTimeValidation": true,
  "treinoPro.checkMemoryLeaks": true,
  "treinoPro.maxLineLength": 80,
  "treinoPro.autoSave": true,
  "treinoPro.enableCopilotIntegration": true
}
```

---

## Estrutura

```
treino-pro/
├── app/                          # App Router (Next.js 16)
│   ├── page.tsx                  # Landing page
│   ├── treinar/                  # Ambiente de treino
│   ├── exam02/                   # Simulador Exam02
│   ├── exam-simulator/           # Simulador de exames
│   ├── flashcards/               # Sistema de flashcards
│   ├── mapa-mental/              # Mapas mentais
│   ├── collaborative/            # Modo colaborativo
│   ├── offline/                  # Modo offline
│   ├── vscode-extension/         # Pagina da extensao
│   ├── dashboard/                # Painel do usuario
│   ├── settings/                 # Configuracoes
│   ├── api/                      # API Routes
│   │   └── download-extension/   # Download da extensao
│   ├── layout.tsx                # Layout raiz
│   └── globals.css               # Estilos globais
├── components/                   # Componentes React
│   ├── landing/                  # Componentes da landing
│   │   ├── hero-section.tsx
│   │   ├── dont-panic-section.tsx
│   │   ├── about-section.tsx
│   │   ├── languages-section.tsx
│   │   ├── hub42-section.tsx
│   │   ├── api-section.tsx
│   │   ├── contact-section.tsx
│   │   ├── support-section.tsx
│   │   ├── landing-header.tsx
│   │   └── landing-footer.tsx
│   └── ui/                       # Componentes shadcn/ui
├── vscode-extension/             # Codigo fonte da extensao
│   ├── src/
│   │   ├── extension.ts          # Ponto de entrada
│   │   ├── constants.ts          # Constantes
│   │   ├── utils.ts              # Utilitarios
│   │   ├── services/             # Servicos
│   │   ├── providers/            # Providers
│   │   └── panels/               # Paineis
│   ├── package.json              # Manifest da extensao
│   └── README.md                 # Documentacao da extensao
├── public/                       # Assets estaticos
│   └── images/                   # Imagens
├── lib/                          # Utilitarios
├── hooks/                        # Custom hooks
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

---

## Regras da Norminette

A plataforma valida codigo C seguindo as regras oficiais da 42:

| Regra | Limite |
|-------|--------|
| Comprimento de linha | 80 caracteres |
| Funcoes por arquivo | 5 funcoes |
| Linhas por funcao | 25 linhas |
| Variaveis por funcao | 5 variaveis |
| Parametros por funcao | 4 parametros |
| Indentacao | Tabs (nao espacos) |
| Espacamento | Apos virgulas e operadores |
| Chaves | Abrir na mesma linha |

---

## Scripts Disponiveis

```bash
# Desenvolvimento
pnpm dev              # Inicia servidor de desenvolvimento

# Build
pnpm build            # Gera build de producao
pnpm start            # Inicia servidor de producao

# Qualidade de Codigo
pnpm lint             # Executa ESLint

# Testes
pnpm test             # Executa testes
pnpm test:watch       # Testes em modo watch
pnpm test:coverage    # Testes com cobertura
```

---

## Variaveis de Ambiente

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (opcional)
DATABASE_URL=

# Auth (opcional)
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Analytics (opcional)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=
```

---

## Contribuindo

Contribuicoes sao bem-vindas! Siga os passos:

1. **Fork o projeto**

2. **Crie uma branch para sua feature**
```bash
git checkout -b feature/minha-feature
```

3. **Commit suas mudancas**
```bash
git commit -m 'feat: adiciona minha feature'
```

4. **Push para a branch**
```bash
git push origin feature/minha-feature
```

5. **Abra um Pull Request**

### Convencoes de Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correcao de bug
- `docs:` Documentacao
- `style:` Formatacao
- `refactor:` Refatoracao
- `test:` Testes
- `chore:` Tarefas de manutencao

---

## Roadmap

- [x] Landing page
- [x] Ambiente de treino basico
- [x] Simulador Exam02
- [x] Flashcards
- [x] Mapas mentais
- [x] Extensao VSCode
- [x] Modo offline
- [x] Animacao "Don't Panic"
- [ ] Sistema de autenticacao
- [ ] Ranking de usuarios
- [ ] Sistema de conquistas
- [ ] API publica
- [ ] App mobile (React Native)
- [ ] Integracao com 42 API

---

## Suporte

Encontrou um bug ou tem uma sugestao?

- Abra uma [issue](https://github.com/treino-pro/treino-pro/issues)
- Entre em contato pelo email: suporte@treinopro.com

---

## Licenca

Este projeto esta licenciado sob a licenca MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

<p align="center">
  Desenvolvido com dedicacao para a comunidade 42 Sao Paulo
</p>

<p align="center">
  <strong>Don't Panic. Comece a treinar.</strong>
</p>
