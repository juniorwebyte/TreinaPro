/**
 * ============================================================================
 * MAPA MENTAL - PLATAFORMA DE ESTUDO 42 SP
 * ============================================================================
 * 
 * Este arquivo implementa uma pagina interativa de estudo com:
 * - Arvore de Conhecimento: visualizacao hierarquica dos conceitos de C
 * - Quiz Interativo: perguntas para testar logica e raciocinio
 * - Receitas de Codigo: padroes reutilizaveis para cada tipo de exercicio
 * - Referencia Rapida: simbolos, operadores e checklist de conceitos
 * 
 * ESTRUTURA DO ARQUIVO:
 * 1. Imports e configuracao
 * 2. Definicao de tipos (interfaces)
 * 3. Dados do Quiz (perguntas e respostas)
 * 4. Dados da Arvore de Topicos
 * 5. Componentes auxiliares (CollapsibleSection, TopicNode, etc)
 * 6. Componente principal da pagina
 * 
 * @author webyte-hub
 * @version 1.0.0
 */

"use client"

// ============================================================================
// IMPORTS
// ============================================================================
// useState: Hook do React para gerenciar estado local do componente
// Link: Componente do Next.js para navegacao entre paginas (SPA)
import { useState } from "react"
import Link from "next/link"

// Icones do Lucide React - biblioteca de icones SVG
// Cada icone representa uma acao ou conceito visual na interface
import { 
  ArrowLeft,       // Seta para voltar a pagina anterior
  Brain,           // Cerebro - representa conhecimento/aprendizado
  Code2,           // Simbolo de codigo </> 
  ChevronDown,     // Seta para baixo - expandir secao
  ChevronUp,       // Seta para cima - colapsar secao
  Check,           // Checkmark - resposta correta
  X,               // X - resposta errada
  Lightbulb,       // Lampada - dica/explicacao
  Target,          // Alvo - meta/objetivo
  Zap,             // Raio - acao rapida
  BookOpen,        // Livro - referencia
  GitBranch,       // Branch - ramificacao de conceitos
  Play,            // Play - iniciar algo
  RotateCcw,       // Rotacao - reiniciar/tentar novamente
  Trophy,          // Trofeu - conquista/resultado
  AlertTriangle    // Triangulo de alerta - aviso
} from "lucide-react"

// Componentes de UI customizados (baseados em shadcn/ui)
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"  // Funcao utilitaria para combinar classes CSS
import { Progress } from "@/components/ui/progress"  // Barra de progresso

// ============================================================================
// DEFINICAO DE TIPOS (INTERFACES)
// ============================================================================
/**
 * Interface para uma pergunta do Quiz
 * 
 * @property id - Identificador unico da pergunta (ex: "q1", "q2")
 * @property question - Texto da pergunta que sera exibida
 * @property options - Array com as 4 opcoes de resposta
 * @property correctIndex - Indice (0-3) da resposta correta no array options
 * @property explanation - Explicacao que aparece apos responder
 * @property concept - Categoria/conceito que a pergunta aborda
 */
interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  concept: string
}

/**
 * Interface para um no da arvore de topicos
 * 
 * @property id - Identificador unico do topico
 * @property title - Titulo exibido (ex: "Strings", "Ponteiros")
 * @property level - Nivel de dificuldade: "easy" | "medium" | "hard"
 * @property description - Descricao curta do topico
 * @property concepts - Lista de conceitos-chave relacionados
 * @property codeExample - (Opcional) Exemplo de codigo para o topico
 * @property children - (Opcional) Sub-topicos aninhados
 */
interface TopicNode {
  id: string
  title: string
  level: "easy" | "medium" | "hard"
  description: string
  concepts: string[]
  codeExample?: string
  children?: TopicNode[]
}

// ============================================================================
// DADOS DO QUIZ - BANCO DE PERGUNTAS
// ============================================================================
/**
 * Array com todas as perguntas do quiz.
 * 
 * COMO FUNCIONA O QUIZ:
 * 1. Usuario ve a pergunta e 4 opcoes
 * 2. Ao clicar em uma opcao, o sistema verifica se esta correta
 * 3. Mostra explicacao detalhada independente de acerto/erro
 * 4. Acumula pontuacao e mostra resultado no final
 * 
 * PARA ADICIONAR NOVAS PERGUNTAS:
 * 1. Copie a estrutura de um objeto existente
 * 2. Mude o id para ser unico (ex: "q16", "q17"...)
 * 3. correctIndex e a posicao da resposta certa (0 = primeira opcao)
 * 4. Escreva uma explicacao clara e educativa
 */
const quizQuestions: QuizQuestion[] = [
  // -------------------------------------------------------------------------
  // PERGUNTA 1: Conceito fundamental de strings em C
  // Resposta correta: B (indice 1) - '\0'
  // -------------------------------------------------------------------------
  {
    id: "q1",
    question: "O que marca o final de uma string em C?",
    options: ["'\\n'", "'\\0'", "NULL", "EOF"],
    correctIndex: 1,  // '\0' e a resposta correta
    explanation: "O caractere '\\0' (nulo) marca o fim de toda string em C. Ele e essencial para funcoes como strlen e loops de string.",
    concept: "Strings"
  },
  {
    id: "q2",
    question: "Qual e o resultado de ft_strlen(\"ABC\")?",
    options: ["2", "3", "4", "0"],
    correctIndex: 1,
    explanation: "\"ABC\" tem 3 caracteres (A, B, C). O '\\0' nao e contado. ft_strlen conta ate encontrar o nulo.",
    concept: "ft_strlen"
  },
  {
    id: "q3",
    question: "Em int *ptr = &x;, o que &x representa?",
    options: ["O valor de x", "O endereco de x", "O tamanho de x", "Uma copia de x"],
    correctIndex: 1,
    explanation: "O operador & retorna o endereco de memoria da variavel. ptr agora guarda a 'localizacao' de x na memoria.",
    concept: "Ponteiros"
  },
  {
    id: "q4",
    question: "Por que malloc(5 + 1) para guardar \"hello\"?",
    options: ["Para guardar espacos", "Para o '\\0' final", "Para margem de seguranca", "Nao e necessario"],
    correctIndex: 1,
    explanation: "\"hello\" = 5 chars + 1 para '\\0'. Sempre aloque strlen + 1 para strings!",
    concept: "Malloc"
  },
  {
    id: "q5",
    question: "O que acontece se esquecer de chamar free() apos malloc()?",
    options: ["Nada", "Memory leak", "Crash imediato", "O programa nao compila"],
    correctIndex: 1,
    explanation: "Memory leak: a memoria fica ocupada 'para sempre' ate o programa terminar. Em programas longos, isso e critico!",
    concept: "Malloc/Free"
  },
  {
    id: "q6",
    question: "Em ft_atoi(\"  -456\"), qual e o resultado?",
    options: ["456", "-456", "0", "Erro"],
    correctIndex: 1,
    explanation: "ft_atoi pula espacos no inicio, identifica o sinal '-', e converte \"456\" para inteiro negativo.",
    concept: "ft_atoi"
  },
  {
    id: "q7",
    question: "Como iterar uma string em C (padrao basico)?",
    options: [
      "for (i = 0; i <= strlen(s); i++)",
      "while (s[i] != '\\0') { i++; }",
      "do { i++; } while (s[i]);",
      "foreach (char c in s)"
    ],
    correctIndex: 1,
    explanation: "while (s[i] != '\\0') e o padrao classico. Processa enquanto nao chegar no nulo, incrementa i a cada iteracao.",
    concept: "Loops"
  },
  {
    id: "q8",
    question: "Em ft_swap(int *a, int *b), por que usar ponteiros?",
    options: [
      "Para ser mais rapido",
      "Para modificar as variaveis originais",
      "Porque C exige",
      "Para economizar memoria"
    ],
    correctIndex: 1,
    explanation: "Passagem por valor cria copias. Com ponteiros, modificamos as variaveis ORIGINAIS fora da funcao.",
    concept: "Ponteiros"
  },
  {
    id: "q9",
    question: "Qual a diferenca entre array[i] e *(array + i)?",
    options: ["Array e mais rapido", "Ponteiro e mais seguro", "Sao equivalentes", "Nao compila"],
    correctIndex: 2,
    explanation: "array[i] e *(array + i) sao exatamente iguais em C. Arrays e ponteiros sao proximos!",
    concept: "Arrays/Ponteiros"
  },
  {
    id: "q10",
    question: "O que argc e argv representam em main()?",
    options: [
      "Variaveis globais",
      "Contagem e vetor de argumentos",
      "Codigo de erro e mensagem",
      "Arquivos de entrada"
    ],
    correctIndex: 1,
    explanation: "argc = numero de argumentos (incluindo nome do programa). argv = vetor de strings com cada argumento.",
    concept: "main()"
  },
  {
    id: "q11",
    question: "Em ft_itoa, por que preencher o resultado de tras para frente?",
    options: [
      "E mais rapido",
      "Porque % extrai o ultimo digito primeiro",
      "Por convencao da 42",
      "Nao e necessario"
    ],
    correctIndex: 1,
    explanation: "123 % 10 = 3 (ultimo digito). 123 / 10 = 12. Repetindo: extraimos de tras para frente.",
    concept: "ft_itoa"
  },
  {
    id: "q12",
    question: "Qual o problema de acessar array[-1] ou array[tamanho]?",
    options: [
      "Retorna 0",
      "Buffer overflow / Segfault",
      "O compilador avisa",
      "Funciona normalmente"
    ],
    correctIndex: 1,
    explanation: "Acesso fora dos limites causa comportamento indefinido. Pode crashar, corromper dados, ou 'parecer funcionar'.",
    concept: "Seguranca"
  },
  {
    id: "q13",
    question: "Em inter/union, como evitar imprimir caracteres repetidos?",
    options: [
      "Usar contador",
      "Array de flags [256] para marcar ja impresso",
      "Comparar com printf",
      "Nao e possivel"
    ],
    correctIndex: 1,
    explanation: "Um array de 256 posicoes (todos ASCII) marca quais caracteres ja foram impressos. Flag = 1 significa 'ja saiu'.",
    concept: "Flags/Arrays"
  },
  {
    id: "q14",
    question: "O que sizeof(int) retorna tipicamente?",
    options: ["1 byte", "2 bytes", "4 bytes", "8 bytes"],
    correctIndex: 2,
    explanation: "Na maioria das arquiteturas modernas, int tem 4 bytes (32 bits). Mas pode variar!",
    concept: "Tipos"
  },
  {
    id: "q15",
    question: "Qual flag de compilacao mostra TODOS os warnings?",
    options: ["-Wall", "-Wextra", "-Wall -Wextra -Werror", "-pedantic"],
    correctIndex: 2,
    explanation: "-Wall ativa muitos warnings. -Wextra adiciona mais. -Werror transforma warnings em erros (obrigatorio na 42!).",
    concept: "Compilacao"
  }
]

// ============================================================================
// DADOS DA ARVORE DE TOPICOS
// ============================================================================
/**
 * Estrutura hierarquica dos conceitos de programacao em C.
 * 
 * COMO A ARVORE FUNCIONA:
 * - Cada no (node) representa um topico
 * - Nos podem ter filhos (children) criando uma hierarquia
 * - Cada topico tem: titulo, nivel de dificuldade, descricao, conceitos-chave
 * - Opcionalmente tem exemplo de codigo
 * 
 * NIVEIS DE DIFICULDADE:
 * - easy (verde): Conceitos basicos, comece por aqui
 * - medium (amarelo): Intermediario, requer conhecimento previo
 * - hard (vermelho): Avancado, requer dominio dos anteriores
 * 
 * PARA ADICIONAR NOVOS TOPICOS:
 * 1. Crie um objeto seguindo a interface TopicNode
 * 2. Para sub-topicos, adicione no array children do topico pai
 */
const topicTree: TopicNode[] = [
  // -------------------------------------------------------------------------
  // TOPICO PRINCIPAL: FUNDAMENTOS
  // Este e o ponto de partida - conceitos que todo iniciante precisa
  // -------------------------------------------------------------------------
  {
    id: "basics",
    title: "Fundamentos",
    level: "easy",
    description: "Conceitos basicos de C que voce precisa dominar primeiro",
    concepts: ["Variaveis", "Tipos", "Operadores", "Condicoes"],
    children: [
      {
        id: "strings",
        title: "Strings",
        level: "easy",
        description: "Array de chars terminado em '\\0'",
        concepts: ["'\\0' termina string", "strlen conta ate nulo", "Loops com while"],
        codeExample: `char s[] = "ABC";
// s[0]='A', s[1]='B', s[2]='C', s[3]='\\0'

int i = 0;
while (s[i] != '\\0') {
    // processa s[i]
    i++;
}`
      },
      {
        id: "pointers",
        title: "Ponteiros",
        level: "medium",
        description: "Enderecos de memoria - fundamental em C",
        concepts: ["& = endereco", "* = valor apontado", "Passagem por referencia"],
        codeExample: `int x = 5;
int *ptr = &x;  // ptr guarda endereco de x
*ptr = 10;      // x agora vale 10!

void ft_swap(int *a, int *b) {
    int tmp = *a;
    *a = *b;
    *b = tmp;
}`
      }
    ]
  },
  {
    id: "functions",
    title: "Funcoes Essenciais",
    level: "medium",
    description: "As funcoes que voce PRECISA saber fazer de memoria",
    concepts: ["ft_strlen", "ft_swap", "ft_atoi", "ft_itoa"],
    children: [
      {
        id: "ft_strlen",
        title: "ft_strlen",
        level: "easy",
        description: "Conta caracteres ate '\\0' - PILAR de tudo!",
        concepts: ["Loop ate nulo", "Contador", "Retorna int"],
        codeExample: `int ft_strlen(char *s) {
    int i = 0;
    while (s[i] != '\\0')
        i++;
    return (i);
}`
      },
      {
        id: "ft_atoi",
        title: "ft_atoi",
        level: "medium",
        description: "String -> Numero inteiro",
        concepts: ["Pular espacos", "Tratar sinal", "Multiplicar por 10"],
        codeExample: `int ft_atoi(char *s) {
    int i = 0, sign = 1, result = 0;
    
    while (s[i] == ' ' || s[i] == '\\t')
        i++;
    if (s[i] == '-' || s[i] == '+')
        sign = (s[i++] == '-') ? -1 : 1;
    while (s[i] >= '0' && s[i] <= '9')
        result = result * 10 + (s[i++] - '0');
    return (result * sign);
}`
      },
      {
        id: "ft_itoa",
        title: "ft_itoa",
        level: "hard",
        description: "Numero -> String (com malloc)",
        concepts: ["Contar digitos", "% extrai ultimo", "Preencher de tras"],
        codeExample: `char *ft_itoa(int n) {
    int len = count_digits(n);
    char *str = malloc(len + 1);
    if (!str) return NULL;
    
    str[len] = '\\0';
    while (len--) {
        str[len] = (n % 10) + '0';
        n /= 10;
    }
    return str;
}`
      }
    ]
  },
  {
    id: "malloc",
    title: "Memoria Dinamica",
    level: "hard",
    description: "Alocacao e liberacao de memoria",
    concepts: ["malloc()", "free()", "Memory leak", "NULL check"],
    children: [
      {
        id: "ft_range",
        title: "ft_range",
        level: "medium",
        description: "Cria array de min ate max",
        concepts: ["Calcular tamanho", "malloc array", "Preencher loop"],
        codeExample: `int *ft_range(int min, int max) {
    int size = max - min + 1;
    int *arr = malloc(size * sizeof(int));
    if (!arr) return NULL;
    
    for (int i = 0; i < size; i++)
        arr[i] = min + i;
    return arr;
}`
      },
      {
        id: "ft_split",
        title: "ft_split",
        level: "hard",
        description: "Divide string por separador - O MAIS DIFICIL!",
        concepts: ["Contar palavras", "malloc **", "malloc cada palavra"],
        codeExample: `// Resumo das 3 fases:
// 1. Contar quantas palavras
// 2. malloc(count + 1) para array de ponteiros
// 3. Para cada palavra:
//    a. Contar tamanho
//    b. malloc para a palavra
//    c. Copiar caracteres
// 4. Colocar NULL no final`
      }
    ]
  }
]

// ============================================================================
// COMPONENTE: SECAO COLAPSAVEL (CollapsibleSection)
// ============================================================================
/**
 * Componente reutilizavel que cria uma secao que pode ser expandida/colapsada.
 * 
 * COMO FUNCIONA:
 * 1. Renderiza um cabecalho clicavel com titulo e icone
 * 2. Ao clicar, alterna entre mostrar/esconder o conteudo
 * 3. O estado isOpen controla a visibilidade
 * 
 * PROPS (propriedades):
 * @param title - Texto do cabecalho da secao
 * @param children - Conteudo que aparece quando expandido
 * @param defaultOpen - Se true, inicia expandido (padrao: false)
 * @param icon - Icone opcional ao lado do titulo
 * 
 * EXEMPLO DE USO:
 * <CollapsibleSection title="Minha Secao" defaultOpen={true}>
 *   <p>Conteudo aqui dentro!</p>
 * </CollapsibleSection>
 */
function CollapsibleSection({ 
  title, 
  children, 
  defaultOpen = false,
  icon
}: { 
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  icon?: React.ReactNode
}) {
  // useState cria uma variavel de estado que persiste entre renderizacoes
  // isOpen: valor atual do estado (true/false)
  // setIsOpen: funcao para atualizar o estado
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Cabecalho clicavel - onClick inverte o estado */}
      <button
        onClick={() => setIsOpen(!isOpen)}  // !isOpen = inverte o valor booleano
        className="flex w-full items-center justify-between p-4 text-left font-medium text-foreground hover:bg-secondary/50"
      >
        <span className="flex items-center gap-2">
          {icon}
          {title}
        </span>
        {/* Mostra seta para cima ou para baixo dependendo do estado */}
        {isOpen ? <ChevronUp className="size-5 text-muted-foreground" /> : <ChevronDown className="size-5 text-muted-foreground" />}
      </button>
      {/* Renderizacao condicional: so mostra conteudo se isOpen for true */}
      {isOpen && <div className="border-t border-border p-4">{children}</div>}
    </div>
  )
}

// ============================================================================
// COMPONENTE: NO DA ARVORE DE TOPICOS (TopicNodeComponent)
// ============================================================================
/**
 * Componente RECURSIVO que renderiza um topico e seus filhos.
 * 
 * RECURSIVIDADE EXPLICADA:
 * - O componente chama a si mesmo para renderizar children
 * - Isso cria automaticamente a hierarquia visual da arvore
 * - depth (profundidade) aumenta a cada nivel para controlar indentacao
 * 
 * PROPS:
 * @param node - O topico atual a ser renderizado
 * @param depth - Nivel de profundidade na arvore (0 = raiz)
 * 
 * SISTEMA DE CORES POR NIVEL:
 * - easy (facil): Verde - conceitos basicos
 * - medium (medio): Amarelo - intermediario
 * - hard (dificil): Vermelho - avancado
 */
function TopicNodeComponent({ node, depth = 0 }: { node: TopicNode; depth?: number }) {
  // Topicos no nivel 0 (raiz) comecam expandidos, outros comecam fechados
  const [expanded, setExpanded] = useState(depth < 1)
  
  // Mapeamento de nivel de dificuldade para classes CSS de cor
  const levelColors = {
    easy: "text-success border-success/30 bg-success/10",      // Verde
    medium: "text-warning border-warning/30 bg-warning/10",    // Amarelo
    hard: "text-destructive border-destructive/30 bg-destructive/10"  // Vermelho
  }
  
  // Mapeamento de nivel para texto em portugues
  const levelLabels = { easy: "Facil", medium: "Medio", hard: "Dificil" }

  return (
    <div className={cn("relative", depth > 0 && "ml-4 border-l-2 border-border pl-4")}>
      <div className="rounded-lg border border-border bg-card p-4 mb-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-start justify-between text-left"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-foreground">{node.title}</h4>
              <span className={cn("text-xs px-2 py-0.5 rounded-full border", levelColors[node.level])}>
                {levelLabels[node.level]}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{node.description}</p>
          </div>
          {(node.children || node.codeExample) && (
            <ChevronDown className={cn("size-5 text-muted-foreground transition-transform", expanded && "rotate-180")} />
          )}
        </button>
        
        {expanded && (
          <div className="mt-4 space-y-3">
            {node.concepts.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {node.concepts.map((concept, i) => (
                  <span key={i} className="text-xs bg-secondary px-2 py-1 rounded-md text-secondary-foreground">
                    {concept}
                  </span>
                ))}
              </div>
            )}
            {node.codeExample && (
              <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-terminal p-4 font-mono text-xs leading-relaxed text-terminal-foreground">
                <code>{node.codeExample}</code>
              </pre>
            )}
          </div>
        )}
      </div>
      
      {expanded && node.children && (
        <div className="mt-2">
          {node.children.map((child) => (
            <TopicNodeComponent key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// COMPONENTE: SECAO DO QUIZ (QuizSection)
// ============================================================================
/**
 * Componente completo que gerencia o quiz interativo.
 * 
 * ESTADOS DO COMPONENTE:
 * - currentQuestion: indice da pergunta atual (0 a 14)
 * - selectedAnswer: qual opcao o usuario clicou (0-3 ou null)
 * - showResult: se deve mostrar a explicacao
 * - score: quantidade de acertos
 * - answeredQuestions: Set com indices das perguntas ja respondidas
 * - quizComplete: se o quiz terminou
 * 
 * FLUXO DO QUIZ:
 * 1. Mostra pergunta atual com 4 opcoes
 * 2. Usuario clica em uma opcao -> handleAnswer()
 * 3. Mostra se acertou/errou + explicacao
 * 4. Usuario clica "Proxima" -> nextQuestion()
 * 5. Repete ate ultima pergunta
 * 6. Mostra tela de resultado final
 */
function QuizSection() {
  // -------------------------------------------------------------------------
  // ESTADOS DO COMPONENTE
  // -------------------------------------------------------------------------
  // Indice da pergunta atual no array quizQuestions (comeca em 0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  
  // Qual opcao o usuario selecionou (0=A, 1=B, 2=C, 3=D, null=nenhuma)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  
  // Se true, mostra a explicacao e destaca resposta certa/errada
  const [showResult, setShowResult] = useState(false)
  
  // Contador de respostas corretas
  const [score, setScore] = useState(0)
  
  // Set (conjunto) com indices das perguntas ja respondidas
  // Evita contar pontos duplos se voltar a uma pergunta
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set())
  
  // Se true, o quiz terminou e mostra tela de resultado
  const [quizComplete, setQuizComplete] = useState(false)

  // Pega a pergunta atual do array usando o indice
  const question = quizQuestions[currentQuestion]

  // -------------------------------------------------------------------------
  // FUNCAO: PROCESSAR RESPOSTA DO USUARIO
  // -------------------------------------------------------------------------
  /**
   * Chamada quando o usuario clica em uma opcao
   * @param index - Indice da opcao clicada (0-3)
   */
  const handleAnswer = (index: number) => {
    // Se ja mostrou resultado, nao faz nada (evita clicar de novo)
    if (showResult) return
    
    // Salva qual opcao foi selecionada
    setSelectedAnswer(index)
    
    // Ativa modo "mostrar resultado"
    setShowResult(true)
    
    // Se acertou E nao tinha respondido antes, adiciona ponto
    if (index === question.correctIndex && !answeredQuestions.has(currentQuestion)) {
      setScore(score + 1)
    }
    
    // Marca esta pergunta como respondida
    setAnsweredQuestions(new Set([...answeredQuestions, currentQuestion]))
  }

  // -------------------------------------------------------------------------
  // FUNCAO: IR PARA PROXIMA PERGUNTA
  // -------------------------------------------------------------------------
  const nextQuestion = () => {
    // Se nao e a ultima pergunta, avanca
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)  // Incrementa indice
      setSelectedAnswer(null)                   // Limpa selecao
      setShowResult(false)                      // Esconde resultado
    } else {
      // Era a ultima pergunta, termina o quiz
      setQuizComplete(true)
    }
  }

  // -------------------------------------------------------------------------
  // FUNCAO: REINICIAR O QUIZ
  // -------------------------------------------------------------------------
  const resetQuiz = () => {
    setCurrentQuestion(0)           // Volta para primeira pergunta
    setSelectedAnswer(null)         // Limpa selecao
    setShowResult(false)            // Esconde resultado
    setScore(0)                     // Zera pontuacao
    setAnsweredQuestions(new Set()) // Limpa perguntas respondidas
    setQuizComplete(false)          // Marca como nao completo
  }

  if (quizComplete) {
    const percentage = Math.round((score / quizQuestions.length) * 100)
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <Trophy className={cn("size-16 mx-auto mb-4", percentage >= 70 ? "text-warning" : "text-muted-foreground")} />
        <h3 className="text-2xl font-bold text-foreground mb-2">Quiz Completo!</h3>
        <p className="text-4xl font-bold text-primary mb-2">{score}/{quizQuestions.length}</p>
        <p className="text-muted-foreground mb-4">{percentage}% de acertos</p>
        <div className="mb-6">
          {percentage >= 90 && <p className="text-success font-medium">Excelente! Voce domina os conceitos!</p>}
          {percentage >= 70 && percentage < 90 && <p className="text-warning font-medium">Muito bom! Continue praticando!</p>}
          {percentage < 70 && <p className="text-destructive font-medium">Revise os conceitos e tente novamente!</p>}
        </div>
        <Button onClick={resetQuiz} className="gap-2">
          <RotateCcw className="size-4" />
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>Questao {currentQuestion + 1} de {quizQuestions.length}</span>
          <span className="flex items-center gap-1">
            <Target className="size-4" />
            {score} acertos
          </span>
        </div>
        <Progress value={((currentQuestion + 1) / quizQuestions.length) * 100} className="h-2" />
      </div>

      {/* Question */}
      <div className="mb-6">
        <span className="text-xs text-primary font-medium mb-2 block">{question.concept}</span>
        <h3 className="text-lg font-semibold text-foreground">{question.question}</h3>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => {
          let buttonStyle = "border-border hover:border-primary/50 hover:bg-primary/5"
          if (showResult) {
            if (index === question.correctIndex) {
              buttonStyle = "border-success bg-success/10 text-success"
            } else if (index === selectedAnswer && index !== question.correctIndex) {
              buttonStyle = "border-destructive bg-destructive/10 text-destructive"
            }
          } else if (selectedAnswer === index) {
            buttonStyle = "border-primary bg-primary/10"
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={showResult}
              className={cn(
                "w-full p-4 rounded-lg border text-left transition-colors flex items-center gap-3",
                buttonStyle
              )}
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center text-sm font-medium">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="flex-1">{option}</span>
              {showResult && index === question.correctIndex && <Check className="size-5 text-success" />}
              {showResult && index === selectedAnswer && index !== question.correctIndex && <X className="size-5 text-destructive" />}
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {showResult && (
        <div className={cn(
          "rounded-lg p-4 mb-6",
          selectedAnswer === question.correctIndex ? "bg-success/10 border border-success/30" : "bg-warning/10 border border-warning/30"
        )}>
          <div className="flex items-start gap-2">
            <Lightbulb className="size-5 flex-shrink-0 mt-0.5 text-warning" />
            <div>
              <p className="font-medium text-foreground mb-1">
                {selectedAnswer === question.correctIndex ? "Correto!" : "Incorreto!"}
              </p>
              <p className="text-sm text-muted-foreground">{question.explanation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      {showResult && (
        <Button onClick={nextQuestion} className="w-full gap-2">
          {currentQuestion < quizQuestions.length - 1 ? (
            <>
              Proxima Questao
              <ChevronDown className="size-4 rotate-[-90deg]" />
            </>
          ) : (
            <>
              Ver Resultado
              <Trophy className="size-4" />
            </>
          )}
        </Button>
      )}
    </div>
  )
}

// ============================================================================
// COMPONENTE: SECAO DE RECEITAS (RecipesSection)
// ============================================================================
/**
 * Secao que mostra "receitas" - padroes de codigo reutilizaveis.
 * 
 * O QUE SAO RECEITAS:
 * - Sequencias de passos que se repetem em varios exercicios
 * - Aprenda o padrao uma vez, aplique em muitos problemas
 * - Cada receita tem: titulo, passos, e exercicios onde se aplica
 * 
 * POR QUE ISSO AJUDA:
 * - Voce nao precisa "inventar" a logica toda vez
 * - Reconhece o tipo de problema -> aplica a receita
 * - No exame, economiza tempo e evita erros
 */
function RecipesSection() {
  // -------------------------------------------------------------------------
  // ARRAY DE RECEITAS
  // Cada objeto tem: titulo, array de passos, e string com exercicios
  // -------------------------------------------------------------------------
  const recipes = [
    // RECEITA 1: Processar string caractere por caractere
    {
      title: "String -> Processamento",
      steps: ["Iterar com while (str[i] != '\\0')", "Fazer algo com str[i]", "i++", "Retornar resultado"],
      applies: "aff_a, rev_print, ft_strlen, rot_13"  // Exercicios que usam este padrao
    },
    // RECEITA 2: Criar nova string com malloc
    {
      title: "String -> String (malloc)",
      steps: ["Contar quantos bytes preciso", "malloc(tamanho + 1)", "Copiar dados", "Colocar '\\0' no final", "Retornar ponteiro"],
      applies: "ft_strrev, ft_itoa, partes de ft_split"
    },
    // RECEITA 3: Comparar duas strings (exercicios com 2 argumentos)
    {
      title: "Dois argumentos -> Comparacao",
      steps: ["Validar argc == 3", "Iterar string 1", "Para cada char, procurar em string 2", "Usar flag para nao repetir", "Retornar resultado"],
      applies: "inter, union, wdmatch"
    },
    // RECEITA 4: Converter numero para string
    {
      title: "Numero -> String (malloc)",
      steps: ["Contar digitos", "malloc(contagem + 1)", "Preencher de tras para frente", "Usar % para extrair digitos", "Usar + '0' para converter", "Colocar '\\0' no final"],
      applies: "ft_itoa"
    }
  ]

  return (
    <div className="space-y-4">
      {recipes.map((recipe, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-4">
          <h4 className="font-semibold text-foreground mb-3">{recipe.title}</h4>
          <ol className="space-y-2 mb-3">
            {recipe.steps.map((step, j) => (
              <li key={j} className="flex items-start gap-2 text-sm">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center">
                  {j + 1}
                </span>
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
          <p className="text-xs text-primary">
            <span className="font-medium">Aplica-se em:</span> {recipe.applies}
          </p>
        </div>
      ))}
    </div>
  )
}

// Common Errors Section
function CommonErrorsSection() {
  const errors = [
    { error: "Segmentation Fault", solution: "Sempre check != '\\0' antes de acessar", icon: "alert" },
    { error: "Overflow de array", solution: "Nao acessar alem do tamanho", icon: "alert" },
    { error: "malloc != 0 nao verificado", solution: "if (ptr == NULL) return", icon: "alert" },
    { error: "Esquecer '\\0' ao final", solution: "Sempre result[len] = '\\0'", icon: "alert" },
    { error: "Off-by-one", solution: "Begin em 0, end < size", icon: "alert" },
    { error: "Memory leak", solution: "free() de cada malloc()", icon: "alert" },
    { error: "Buffer overflow", solution: "str[BIG_INDEX] pode crashar", icon: "alert" },
    { error: "Sem validacao argc", solution: "if (argc != X) return", icon: "alert" }
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {errors.map((item, i) => (
        <div key={i} className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="size-4 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive text-sm">{item.error}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.solution}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// COMPONENTE: REFERENCIA DE SIMBOLOS (SymbolsReference)
// ============================================================================
/**
 * Tabela de referencia rapida com simbolos importantes de C.
 * 
 * QUANDO USAR:
 * - Para revisar rapidamente o significado de um simbolo
 * - Durante a resolucao de exercicios
 * - Para memorizar antes do exame
 * 
 * Os simbolos estao organizados por categoria:
 * - Memoria: \0, &, *, sizeof, malloc, free
 * - Formatos printf: %d, %c, %s
 * - Operadores logicos: ==, !=, &&, ||, !
 */
function SymbolsReference() {
  // Array com todos os simbolos e seus significados em portugues
  const symbols = [
    { symbol: "\\0", meaning: "Nulo (marca fim de string)" },
    { symbol: "&x", meaning: "Endereco de x" },
    { symbol: "*ptr", meaning: "Valor que ptr aponta" },
    { symbol: "sizeof()", meaning: "Tamanho em bytes" },
    { symbol: "malloc()", meaning: "Alocar memoria" },
    { symbol: "free()", meaning: "Liberar memoria" },
    { symbol: "%d", meaning: "Formato inteiro" },
    { symbol: "%c", meaning: "Formato caractere" },
    { symbol: "%s", meaning: "Formato string" },
    { symbol: "==", meaning: "Igual a" },
    { symbol: "!=", meaning: "Diferente de" },
    { symbol: "&&", meaning: "E logico" },
    { symbol: "||", meaning: "Ou logico" },
    { symbol: "!", meaning: "Nao logico" }
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {symbols.map((item, i) => (
        <div key={i} className="rounded-lg bg-secondary/50 p-2 text-center">
          <code className="text-primary font-mono text-sm">{item.symbol}</code>
          <p className="text-xs text-muted-foreground mt-1">{item.meaning}</p>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// COMPONENTE PRINCIPAL DA PAGINA
// ============================================================================
/**
 * Componente que renderiza a pagina completa do Mapa Mental.
 * 
 * ESTRUTURA DA PAGINA:
 * 1. Header fixo - navegacao e links
 * 2. Hero - titulo e descricao
 * 3. Tabs - 4 abas com conteudo diferente:
 *    - Arvore: hierarquia de conceitos
 *    - Quiz: perguntas interativas
 *    - Receitas: padroes de codigo
 *    - Referencia: simbolos e checklists
 * 
 * PORQUE USAR TABS:
 * - Organiza muito conteudo sem sobrecarregar
 * - Usuario escolhe o que quer ver
 * - Cada aba tem um proposito especifico
 * 
 * EXPORT DEFAULT:
 * - Este e o componente que o Next.js vai renderizar
 * - O nome da funcao vira a rota (/mapa-mental)
 */
export default function MapaMentalPage() {
  return (
    // Container principal - ocupa toda altura da tela (100dvh)
    <div className="min-h-[100dvh] bg-background">
      {/* ----------------------------------------------------------------- */}
      {/* HEADER FIXO - sticky = permanece visivel ao rolar a pagina        */}
      {/* ----------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {/* Botao voltar - Link do Next.js para navegacao SPA */}
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-5" />
              <span className="hidden sm:inline">Voltar</span>
            </Link>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Brain className="size-5 text-primary" />
              <h1 className="font-bold text-foreground">Mapa Mental - C</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/treinar">
              <Button size="sm" variant="outline" className="gap-2">
                <Play className="size-4" />
                <span className="hidden sm:inline">Praticar</span>
              </Button>
            </Link>
            <Link href="/exam02">
              <Button size="sm" className="gap-2">
                <BookOpen className="size-4" />
                <span className="hidden sm:inline">Guia Exam02</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Hero */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Mapa Mental - Conceitos de C
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Entenda como os conceitos se conectam, teste seu conhecimento com quizzes interativos
            e aprenda as receitas para cada tipo de exercicio do Exam02.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tree" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="tree" className="gap-2">
              <GitBranch className="size-4" />
              <span className="hidden sm:inline">Arvore</span>
            </TabsTrigger>
            <TabsTrigger value="quiz" className="gap-2">
              <Target className="size-4" />
              <span className="hidden sm:inline">Quiz</span>
            </TabsTrigger>
            <TabsTrigger value="recipes" className="gap-2">
              <Zap className="size-4" />
              <span className="hidden sm:inline">Receitas</span>
            </TabsTrigger>
            <TabsTrigger value="reference" className="gap-2">
              <Code2 className="size-4" />
              <span className="hidden sm:inline">Referencia</span>
            </TabsTrigger>
          </TabsList>

          {/* Tree Tab */}
          <TabsContent value="tree" className="space-y-6">
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Lightbulb className="size-5 text-primary" />
                Como usar a Arvore
              </h3>
              <p className="text-sm text-muted-foreground">
                Clique nos topicos para expandir e ver detalhes. Os conceitos estao organizados
                do mais facil ao mais dificil. Domine os fundamentos antes de avancar!
              </p>
            </div>

            {/* Visual Tree Diagram */}
            <div className="rounded-lg border border-border bg-card p-4 overflow-x-auto mb-6">
              <pre className="font-mono text-xs sm:text-sm text-muted-foreground whitespace-pre">
{`                         EXAM02
                           |
                    ________|________
                   |        |       |
              BEM FACIL  MEDIO  MUITO DIFICIL
                   |        |       |
            ___fm __|_   ___|___  __|___
           |    |   |  |   |   |  |   |
         aff_ ft_  rev  inter union ft_  ft_
         a_z  swap print        aff  split itoa
              ft_                     ft_
            strlen                   atoi range
                   |
          CONCEITOS BASE:
          - String = array + \\0
          - Ponteiros = enderecos
          - Loops = iterar dados
          - Malloc = memoria dinamica`}
              </pre>
            </div>

            {/* Interactive Tree */}
            <div className="space-y-4">
              {topicTree.map((node) => (
                <TopicNodeComponent key={node.id} node={node} />
              ))}
            </div>
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quiz" className="space-y-6">
            <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Target className="size-5 text-warning" />
                Teste seus Conhecimentos
              </h3>
              <p className="text-sm text-muted-foreground">
                Responda as perguntas para verificar se voce entendeu os conceitos.
                Cada questao tem uma explicacao detalhada apos a resposta.
              </p>
            </div>

            <QuizSection />
          </TabsContent>

          {/* Recipes Tab */}
          <TabsContent value="recipes" className="space-y-6">
            <div className="rounded-lg border border-success/30 bg-success/5 p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Zap className="size-5 text-success" />
                Receitas Prontas
              </h3>
              <p className="text-sm text-muted-foreground">
                Padroes de codigo que se repetem. Aprenda essas receitas e aplique
                nos exercicios do Exam02. Cada tipo de problema tem um padrao!
              </p>
            </div>

            <RecipesSection />

            <CollapsibleSection title="Erros Comuns (e como evitar)" icon={<AlertTriangle className="size-5 text-destructive" />}>
              <CommonErrorsSection />
            </CollapsibleSection>
          </TabsContent>

          {/* Reference Tab */}
          <TabsContent value="reference" className="space-y-6">
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Code2 className="size-5 text-primary" />
                Referencia Rapida
              </h3>
              <p className="text-sm text-muted-foreground">
                Consulte simbolos, operadores e conceitos importantes rapidamente.
                Ideal para revisao antes do exame!
              </p>
            </div>

            <CollapsibleSection title="Simbolos e Operadores" defaultOpen icon={<Code2 className="size-5 text-primary" />}>
              <SymbolsReference />
            </CollapsibleSection>

            <CollapsibleSection title="Caracteres Especiais" icon={<Code2 className="size-5 text-primary" />}>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { char: "'\\0'", desc: "Terminador de string (NUNCA esqueca!)" },
                  { char: "'\\n'", desc: "Nova linha (line feed)" },
                  { char: "'\\t'", desc: "Tab horizontal" },
                  { char: "'\\\\'", desc: "Barra invertida" },
                  { char: "'\\\"'", desc: "Aspas duplas em string" },
                  { char: "'\\''", desc: "Aspas simples em char" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                    <code className="text-primary font-mono">{item.char}</code>
                    <span className="text-sm text-muted-foreground">{item.desc}</span>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Flags de Compilacao" icon={<Code2 className="size-5 text-primary" />}>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-3">
                  Na 42, sempre compile com todas as flags:
                </p>
                <pre className="rounded-lg bg-terminal p-4 font-mono text-sm text-terminal-foreground">
                  gcc -Wall -Wextra -Werror arquivo.c
                </pre>
                <div className="grid gap-2 mt-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <code className="text-warning font-mono text-sm">-Wall</code>
                    <p className="text-xs text-muted-foreground mt-1">Ativa muitos warnings</p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <code className="text-warning font-mono text-sm">-Wextra</code>
                    <p className="text-xs text-muted-foreground mt-1">Warnings adicionais</p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <code className="text-destructive font-mono text-sm">-Werror</code>
                    <p className="text-xs text-muted-foreground mt-1">Warnings viram erros!</p>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Checklist de Compreensao" icon={<Check className="size-5 text-success" />}>
              <div className="space-y-4">
                {[
                  { func: "ft_strlen", checks: ["Explicar o que \\0 faz", "Fazer o codigo sem olhar", "Dizer resultado de exemplos rapido"] },
                  { func: "ft_atoi", checks: ["Explicar por que multiplica por 10", "Descrever como trata sinais", "Fazer o codigo sem olhar"] },
                  { func: "ft_range", checks: ["Explicar por que +1 no tamanho", "Fazer versao 'para tras'", "Fazer o codigo sem olhar"] },
                  { func: "ft_itoa", checks: ["Explicar % e / para extrair digitos", "Descrever por que preenche de tras", "Fazer o codigo sem olhar"] },
                  { func: "ft_split", checks: ["Desenhar alocacao de memoria", "Explicar 3 fases", "Fazer o codigo (com apoio)"] }
                ].map((item, i) => (
                  <div key={i} className="rounded-lg border border-border p-4">
                    <h5 className="font-semibold text-foreground mb-2">{item.func}</h5>
                    <div className="space-y-1">
                      {item.checks.map((check, j) => (
                        <label key={j} className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                          <input type="checkbox" className="rounded border-border" />
                          {check}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          <p>Treino PRO - Plataforma de Estudos | 42 Sao Paulo</p>
        </div>
      </footer>
    </div>
  )
}
