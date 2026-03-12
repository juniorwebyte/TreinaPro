// ============================================================================
// Sistema de Flashcards com Algoritmo SM-2 (Supermemo 2)
// ============================================================================
// O algoritmo SM-2 é um algoritmo de repetição espaçada que calcula o intervalo
// ideal para revisar um card baseado na qualidade da resposta do usuário.
// ============================================================================

// Tipos para o sistema de flashcards
export interface Flashcard {
  id: string
  deckId: string
  front: string        // Pergunta ou conceito
  back: string         // Resposta ou explicação
  code?: string        // Código de exemplo (opcional)
  // SM-2 algorithm fields
  easeFactor: number   // Fator de facilidade (default: 2.5)
  interval: number     // Intervalo em dias
  repetitions: number  // Número de repetições bem-sucedidas
  nextReview: number   // Timestamp da próxima revisão
  lastReview?: number  // Timestamp da última revisão
}

export interface FlashcardDeck {
  id: string
  name: string
  description: string
  icon: string
  color: string
  cards: Flashcard[]
}

export interface FlashcardStats {
  totalCards: number
  cardsStudied: number
  cardsToReview: number
  averageEase: number
  streak: number
  lastStudyDate?: number
}

export interface StudySession {
  deckId: string
  cardsReviewed: number
  correctAnswers: number
  startTime: number
  endTime?: number
}

// Qualidade da resposta (0-5)
export type ResponseQuality = 0 | 1 | 2 | 3 | 4 | 5

// ============================================================================
// Algoritmo SM-2
// ============================================================================

/**
 * Calcula o próximo intervalo de revisão usando o algoritmo SM-2
 * @param card - O flashcard atual
 * @param quality - Qualidade da resposta (0-5)
 *   0 - Errou completamente, não lembra de nada
 *   1 - Errou, mas reconheceu a resposta quando viu
 *   2 - Errou, mas a resposta estava na ponta da língua
 *   3 - Correto com dificuldade significativa
 *   4 - Correto com alguma hesitação
 *   5 - Resposta perfeita, sem hesitação
 */
export function calculateSM2(
  card: Flashcard,
  quality: ResponseQuality
): Flashcard {
  let { easeFactor, interval, repetitions } = card
  
  // Atualiza o fator de facilidade
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  
  // O fator de facilidade não pode ser menor que 1.3
  if (easeFactor < 1.3) easeFactor = 1.3
  
  if (quality < 3) {
    // Resposta incorreta: reinicia as repetições
    repetitions = 0
    interval = 1
  } else {
    // Resposta correta: calcula o próximo intervalo
    repetitions += 1
    
    if (repetitions === 1) {
      interval = 1
    } else if (repetitions === 2) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }
  }
  
  // Calcula a próxima data de revisão
  const nextReview = Date.now() + interval * 24 * 60 * 60 * 1000
  
  return {
    ...card,
    easeFactor,
    interval,
    repetitions,
    nextReview,
    lastReview: Date.now(),
  }
}

// ============================================================================
// Dados dos Flashcards - Gerados do Mapa Mental
// ============================================================================

export const FLASHCARD_DECKS: FlashcardDeck[] = [
  {
    id: "strings",
    name: "Strings em C",
    description: "Manipulação de strings, funções e conceitos",
    icon: "Type",
    color: "#3b82f6",
    cards: [
      {
        id: "str-1",
        deckId: "strings",
        front: "O que é uma string em C?",
        back: "Uma string em C é um array de caracteres terminado com o caractere nulo '\\0'. Diferente de outras linguagens, C não tem um tipo 'string' nativo.",
        code: "char str[] = \"Hello\"; // Equivale a {'H','e','l','l','o','\\0'}",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
      },
      {
        id: "str-2",
        deckId: "strings",
        front: "Qual a diferença entre char str[] e char *str?",
        back: "char str[] aloca memória no stack e permite modificação. char *str aponta para uma string literal (read-only) na memória.",
        code: "char str1[] = \"abc\"; // Modificável\nchar *str2 = \"abc\";  // Read-only (string literal)",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
      },
      {
        id: "str-3",
        deckId: "strings",
        front: "Como percorrer uma string em C?",
        back: "Use um loop while ou for verificando se o caractere atual não é '\\0', ou use a função strlen() para saber o tamanho.",
        code: "int i = 0;\nwhile (str[i] != '\\0')\n{\n    // processa str[i]\n    i++;\n}",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
      },
      {
        id: "str-4",
        deckId: "strings",
        front: "O que faz a função strlen()?",
        back: "Retorna o número de caracteres em uma string, NÃO contando o caractere nulo '\\0'.",
        code: "size_t len = strlen(\"Hello\"); // len = 5",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
      },
      {
        id: "str-5",
        deckId: "strings",
        front: "Qual a diferença entre strcpy e strncpy?",
        back: "strcpy copia toda a string origem para destino. strncpy copia no máximo n caracteres, sendo mais seguro contra buffer overflow.",
        code: "strcpy(dest, src);      // Perigoso!\nstrncpy(dest, src, n);  // Mais seguro",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
      },
    ],
  },
  {
    id: "pointers",
    name: "Ponteiros",
    description: "Endereços de memória e manipulação",
    icon: "Pointer",
    color: "#8b5cf6",
    cards: [
      {
        id: "ptr-1",
        deckId: "pointers",
        front: "O que é um ponteiro em C?",
        back: "Um ponteiro é uma variável que armazena o endereço de memória de outra variável. O tamanho do ponteiro depende da arquitetura (4 ou 8 bytes).",
        code: "int x = 42;\nint *ptr = &x; // ptr guarda o endereço de x",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
      },
      {
        id: "ptr-2",
        deckId: "pointers",
        front: "Qual a diferença entre * e & em ponteiros?",
        back: "& (address-of) retorna o endereço de uma variável. * (dereference) acessa o valor no endereço apontado pelo ponteiro.",
        code: "int x = 10;\nint *p = &x;  // p recebe endereço de x\nint y = *p;   // y recebe o valor de x (10)",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
      },
      {
        id: "ptr-3",
        deckId: "pointers",
        front: "O que é aritmética de ponteiros?",
        back: "Operações matemáticas em ponteiros que movem o ponteiro pelo número de bytes do tipo apontado. ptr + 1 move sizeof(*ptr) bytes.",
        code: "int arr[] = {1, 2, 3};\nint *p = arr;\np++;  // Avança 4 bytes (sizeof int)",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
      },
      {
        id: "ptr-4",
        deckId: "pointers",
        front: "O que é um ponteiro NULL?",
        back: "Um ponteiro que não aponta para nenhum endereço válido de memória. Usado para indicar que o ponteiro não foi inicializado ou é inválido.",
        code: "int *ptr = NULL;\nif (ptr != NULL)\n    *ptr = 10; // Evita segfault",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
      },
      {
        id: "ptr-5",
        deckId: "pointers",
        front: "O que é um ponteiro de ponteiro (double pointer)?",
        back: "Um ponteiro que armazena o endereço de outro ponteiro. Usado para modificar ponteiros em funções e matrizes dinâmicas.",
        code: "int x = 5;\nint *p = &x;\nint **pp = &p; // pp aponta para p",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
      },
    ],
  },
  {
    id: "loops",
    name: "Loops e Iteração",
    description: "Estruturas de repetição em C",
    icon: "Repeat",
    color: "#10b981",
    cards: [
      {
        id: "loop-1",
        deckId: "loops",
        front: "Quais são os 3 tipos de loops em C?",
        back: "for, while, e do-while. For é usado quando se sabe o número de iterações. While quando a condição é verificada antes. Do-while executa pelo menos uma vez.",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
      },
      {
        id: "loop-2",
        deckId: "loops",
        front: "Qual a diferença entre while e do-while?",
        back: "while verifica a condição ANTES de executar o bloco. do-while executa o bloco PRIMEIRO e depois verifica a condição (garante pelo menos 1 execução).",
        code: "while (cond) { ... }  // 0+ execuções\ndo { ... } while (cond); // 1+ execuções",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
      },
      {
        id: "loop-3",
        deckId: "loops",
        front: "O que fazem break e continue?",
        back: "break sai completamente do loop atual. continue pula para a próxima iteração do loop, ignorando o código restante.",
        code: "for (i = 0; i < 10; i++)\n{\n    if (i == 5) break;    // Sai do loop\n    if (i == 3) continue; // Pula i=3\n}",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
      },
      {
        id: "loop-4",
        deckId: "loops",
        front: "Como fazer um loop infinito em C?",
        back: "Use while(1), for(;;) ou while(true) com #include <stdbool.h>. Lembre-se de ter uma condição de saída (break) dentro do loop.",
        code: "while (1)\n{\n    if (condição)\n        break;\n}",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
      },
      {
        id: "loop-5",
        deckId: "loops",
        front: "Como percorrer um array 2D (matriz)?",
        back: "Use loops aninhados: o externo para linhas (i) e o interno para colunas (j). Acesse elementos com arr[i][j].",
        code: "for (int i = 0; i < rows; i++)\n    for (int j = 0; j < cols; j++)\n        printf(\"%d \", arr[i][j]);",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
      },
    ],
  },
  {
    id: "functions",
    name: "Funções",
    description: "Definição, parâmetros e retorno",
    icon: "Function",
    color: "#f59e0b",
    cards: [
      {
        id: "func-1",
        deckId: "functions",
        front: "Qual a estrutura de uma função em C?",
        back: "tipo_retorno nome_funcao(parametros) { corpo }. Se não retorna nada, use void. Parâmetros são passados por valor por padrão.",
        code: "int soma(int a, int b)\n{\n    return (a + b);\n}",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
      },
      {
        id: "func-2",
        deckId: "functions",
        front: "Qual a diferença entre passagem por valor e por referência?",
        back: "Por valor: uma cópia é passada (original não muda). Por referência (usando ponteiros): o endereço é passado, permitindo modificar o original.",
        code: "void por_valor(int x) { x = 10; }\nvoid por_ref(int *x) { *x = 10; }",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
      },
      {
        id: "func-3",
        deckId: "functions",
        front: "O que é um protótipo de função?",
        back: "Uma declaração da função antes de sua definição, permitindo usar a função antes de implementá-la. Geralmente colocado no topo do arquivo ou em headers (.h).",
        code: "int soma(int a, int b); // Protótipo\n\nint main() { soma(1, 2); }\n\nint soma(int a, int b) { return a + b; }",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
      },
      {
        id: "func-4",
        deckId: "functions",
        front: "O que é recursão em C?",
        back: "Quando uma função chama a si mesma. Precisa de um caso base para parar a recursão, caso contrário causa stack overflow.",
        code: "int fatorial(int n)\n{\n    if (n <= 1) return 1; // Caso base\n    return n * fatorial(n - 1);\n}",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
      },
      {
        id: "func-5",
        deckId: "functions",
        front: "O que são variáveis static em funções?",
        back: "Variáveis que mantêm seu valor entre chamadas da função. São inicializadas apenas uma vez e existem durante toda a execução do programa.",
        code: "int contador(void)\n{\n    static int count = 0;\n    return ++count; // Incrementa a cada chamada\n}",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
      },
    ],
  },
  {
    id: "memory",
    name: "Memória e Malloc",
    description: "Alocação dinâmica e gerenciamento",
    icon: "HardDrive",
    color: "#ef4444",
    cards: [
      {
        id: "mem-1",
        deckId: "memory",
        front: "Qual a diferença entre stack e heap?",
        back: "Stack: memória automática, rápida, limitada, variáveis locais. Heap: memória dinâmica (malloc), mais lenta, maior, precisa de free().",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
      },
      {
        id: "mem-2",
        deckId: "memory",
        front: "O que faz a função malloc()?",
        back: "Aloca um bloco de memória do tamanho especificado no heap e retorna um ponteiro para ele. Retorna NULL se falhar.",
        code: "int *arr = (int *)malloc(10 * sizeof(int));\nif (arr == NULL)\n    return (-1); // Erro de alocação",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
      },
      {
        id: "mem-3",
        deckId: "memory",
        front: "Qual a diferença entre malloc e calloc?",
        back: "malloc aloca memória sem inicializar (lixo). calloc aloca e inicializa toda a memória com zeros. calloc recebe 2 parâmetros (quantidade, tamanho).",
        code: "int *a = malloc(10 * sizeof(int));  // Não inicializado\nint *b = calloc(10, sizeof(int));   // Zeros",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
      },
      {
        id: "mem-4",
        deckId: "memory",
        front: "O que é memory leak e como evitar?",
        back: "Memory leak ocorre quando memória alocada nunca é liberada. Evite sempre chamando free() quando terminar de usar a memória alocada.",
        code: "int *ptr = malloc(100);\n// ... usar ptr ...\nfree(ptr);     // Libera a memória\nptr = NULL;    // Evita dangling pointer",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
      },
      {
        id: "mem-5",
        deckId: "memory",
        front: "O que faz realloc()?",
        back: "Redimensiona um bloco de memória previamente alocado. Pode mover o bloco para outro endereço se necessário.",
        code: "ptr = realloc(ptr, new_size);\n// Se ptr era NULL, funciona como malloc\n// Se new_size é 0, funciona como free",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
      },
    ],
  },
  {
    id: "norminette",
    name: "Norminette e 42",
    description: "Regras de estilo da 42",
    icon: "FileCheck",
    color: "#06b6d4",
    cards: [
      {
        id: "norm-1",
        deckId: "norminette",
        front: "Qual o limite de linhas por função na Norminette?",
        back: "Máximo de 25 linhas por função. Isso força a divisão do código em funções menores e mais legíveis.",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
      },
      {
        id: "norm-2",
        deckId: "norminette",
        front: "Quantas variáveis pode declarar por linha?",
        back: "Apenas UMA variável por linha. Também não pode inicializar na declaração (exceto const e static).",
        code: "// ERRADO\nint a, b, c;\nint x = 5;\n\n// CERTO\nint a;\nint b;\nint c;\nint x;\nx = 5;",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
      },
      {
        id: "norm-3",
        deckId: "norminette",
        front: "Qual o limite de parâmetros em uma função?",
        back: "Máximo de 4 parâmetros por função. Se precisar de mais, use uma struct.",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
      },
      {
        id: "norm-4",
        deckId: "norminette",
        front: "Onde deve ficar a abertura de chaves na Norminette?",
        back: "Em uma linha separada (estilo Allman). Nunca na mesma linha do if/while/for.",
        code: "// CERTO\nif (condição)\n{\n    código;\n}\n\n// ERRADO\nif (condição) {\n    código;\n}",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
      },
      {
        id: "norm-5",
        deckId: "norminette",
        front: "Quantos caracteres por linha são permitidos?",
        back: "Máximo de 80 caracteres por linha (incluindo a tabulação). Use \\ para quebrar linhas longas.",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
      },
    ],
  },
]

// ============================================================================
// Funções de Gerenciamento
// ============================================================================

const STORAGE_KEY = "ft_exam_flashcards"
const STATS_KEY = "ft_exam_flashcard_stats"

export function loadFlashcardDecks(): FlashcardDeck[] {
  if (typeof window === "undefined") return FLASHCARD_DECKS
  
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return FLASHCARD_DECKS
    }
  }
  return FLASHCARD_DECKS
}

export function saveFlashcardDecks(decks: FlashcardDeck[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decks))
}

export function loadFlashcardStats(): FlashcardStats {
  if (typeof window === "undefined") {
    return getDefaultStats()
  }
  
  const saved = localStorage.getItem(STATS_KEY)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return getDefaultStats()
    }
  }
  return getDefaultStats()
}

export function saveFlashcardStats(stats: FlashcardStats): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STATS_KEY, JSON.stringify(stats))
}

function getDefaultStats(): FlashcardStats {
  return {
    totalCards: FLASHCARD_DECKS.reduce((sum, d) => sum + d.cards.length, 0),
    cardsStudied: 0,
    cardsToReview: 0,
    averageEase: 2.5,
    streak: 0,
  }
}

export function getCardsToReview(decks: FlashcardDeck[]): Flashcard[] {
  const now = Date.now()
  const cards: Flashcard[] = []
  
  for (const deck of decks) {
    for (const card of deck.cards) {
      if (card.nextReview <= now) {
        cards.push(card)
      }
    }
  }
  
  return cards.sort((a, b) => a.nextReview - b.nextReview)
}

export function getDeckStats(deck: FlashcardDeck): {
  total: number
  new: number
  learning: number
  review: number
  mastered: number
} {
  const now = Date.now()
  let newCards = 0
  let learning = 0
  let review = 0
  let mastered = 0
  
  for (const card of deck.cards) {
    if (card.repetitions === 0) {
      newCards++
    } else if (card.interval < 21) {
      learning++
    } else if (card.nextReview <= now) {
      review++
    } else {
      mastered++
    }
  }
  
  return {
    total: deck.cards.length,
    new: newCards,
    learning,
    review,
    mastered,
  }
}

export function updateCardInDecks(
  decks: FlashcardDeck[],
  updatedCard: Flashcard
): FlashcardDeck[] {
  return decks.map(deck => ({
    ...deck,
    cards: deck.cards.map(card =>
      card.id === updatedCard.id ? updatedCard : card
    ),
  }))
}
