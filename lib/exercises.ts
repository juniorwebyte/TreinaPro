export type Difficulty = "iniciante" | "intermediario" | "avancado"
export type Language = "c" | "shell" | "python" | "javascript" | "html" | "css" | "php"

export interface Exercise {
  id: number
  title: string
  func: string
  description: string
  concept: string
  hint: string
  solution: string
  template: string
  difficulty: Difficulty
  language: Language
  tags: string[]
  explanation: string[]
  checkPatterns?: string[]
  exampleUsage?: string
}

// ==================== C EXERCISES ====================
const cExercises: Exercise[] = [
  {
    id: 1,
    title: "ft_strlen",
    func: "ft_strlen",
    description: "Implemente uma funcao que retorne o tamanho de uma string.",
    concept:
      "Strings em C sao arrays de caracteres terminados por '\\0' (null terminator). Para contar o tamanho, percorremos ate encontrar esse caractere.",
    hint: "Percorra a string com um indice enquanto str[i] existir (nao for '\\0'). Incremente um contador a cada iteracao.",
    solution: `int\tft_strlen(char *str)
{
\tint\ti;

\ti = 0;
\twhile (str[i])
\t\ti++;
\treturn (i);
}`,
    template: `// Retorne o tamanho da string recebida.
// Prototipo: int ft_strlen(char *str);

int\tft_strlen(char *str)
{
\t// Seu codigo aqui
}`,
    difficulty: "iniciante",
    language: "c",
    tags: ["string", "loop", "ponteiro"],
    checkPatterns: ["while", "return"],
    explanation: [
      "1. Declaramos int i = 0 como indice/contador.",
      "2. Usamos while(str[i]) - o loop continua enquanto o caractere nao for '\\0'.",
      "3. A cada iteracao, i++ incrementa o contador.",
      "4. Quando str[i] == '\\0', o loop para e retornamos i (o tamanho).",
    ],
    exampleUsage: `#include <stdio.h>

int\tft_strlen(char *str)
{
\tint\ti;

\ti = 0;
\twhile (str[i])
\t\ti++;
\treturn (i);
}

int\tmain(void)
{
\tchar\t*s1 = "Hello, 42!";
\tchar\t*s2 = "";
\tchar\t*s3 = "abc";

\tprintf("strlen(\\"%s\\") = %d\\n", s1, ft_strlen(s1)); // 10
\tprintf("strlen(\\"%s\\") = %d\\n", s2, ft_strlen(s2)); // 0
\tprintf("strlen(\\"%s\\") = %d\\n", s3, ft_strlen(s3)); // 3
\treturn (0);
}`,
  },
  {
    id: 2,
    title: "ft_swap",
    func: "ft_swap",
    description: "Troque o valor de dois inteiros usando ponteiros.",
    concept:
      "Ponteiros armazenam enderecos de memoria. Com * (dereference), acessamos o valor no endereco apontado. Para trocar valores, precisamos de uma variavel temporaria.",
    hint: "Use uma variavel temporaria para guardar o valor de *a antes de sobrescreve-lo com *b.",
    solution: `void\tft_swap(int *a, int *b)
{
\tint\ttmp;

\ttmp = *a;
\t*a = *b;
\t*b = tmp;
}`,
    template: `// Troque os valores apontados por a e b.
// Prototipo: void ft_swap(int *a, int *b);

void\tft_swap(int *a, int *b)
{
\t// Seu codigo aqui
}`,
    difficulty: "iniciante",
    language: "c",
    tags: ["ponteiro", "variavel"],
    checkPatterns: ["tmp|temp|aux", "\\*a", "\\*b"],
    explanation: [
      "1. Declaramos int tmp para guardar o valor temporariamente.",
      "2. tmp = *a salva o valor original de a.",
      "3. *a = *b coloca o valor de b no endereco de a.",
      "4. *b = tmp coloca o valor original de a no endereco de b.",
    ],
    exampleUsage: `#include <stdio.h>

void\tft_swap(int *a, int *b)
{
\tint\ttmp;

\ttmp = *a;
\t*a = *b;
\t*b = tmp;
}

int\tmain(void)
{
\tint\tx = 42;
\tint\ty = 21;

\tprintf("Antes: x = %d, y = %d\\n", x, y);
\tft_swap(&x, &y);
\tprintf("Depois: x = %d, y = %d\\n", x, y);
\t// Saida: Antes: x = 42, y = 21
\t//        Depois: x = 21, y = 42
\treturn (0);
}`,
  },
  {
    id: 3,
    title: "ft_putstr",
    func: "ft_putstr",
    description: "Imprima uma string no terminal usando write.",
    concept:
      "A funcao write(fd, buf, count) escreve count bytes do buffer buf no file descriptor fd. fd=1 e a saida padrao (terminal).",
    hint: "Percorra a string caractere por caractere e use write(1, &str[i], 1) para imprimir cada um.",
    solution: `#include <unistd.h>

void\tft_putstr(char *str)
{
\tint\ti;

\ti = 0;
\twhile (str[i])
\t{
\t\twrite(1, &str[i], 1);
\t\ti++;
\t}
}`,
    template: `// Imprima a string no terminal usando write.
// Prototipo: void ft_putstr(char *str);
// Inclua: #include <unistd.h>

#include <unistd.h>

void\tft_putstr(char *str)
{
\t// Seu codigo aqui
}`,
    difficulty: "iniciante",
    language: "c",
    tags: ["string", "write", "loop"],
    checkPatterns: ["write", "while"],
    explanation: [
      "1. Incluimos <unistd.h> para ter acesso a funcao write.",
      "2. Percorremos com while(str[i]) ate o null terminator.",
      "3. write(1, &str[i], 1) escreve 1 byte do caractere atual na saida padrao.",
      "4. &str[i] passa o endereco do caractere atual.",
    ],
    exampleUsage: `#include <unistd.h>

void\tft_putstr(char *str)
{
\tint\ti;

\ti = 0;
\twhile (str[i])
\t{
\t\twrite(1, &str[i], 1);
\t\ti++;
\t}
}

int\tmain(void)
{
\tft_putstr("Hello, 42 SP!\\n");
\tft_putstr("Piscine rocks!\\n");
\t// Saida no terminal:
\t// Hello, 42 SP!
\t// Piscine rocks!
\treturn (0);
}`,
  },
  {
    id: 4,
    title: "ft_strcmp",
    func: "ft_strcmp",
    description: "Compare duas strings e retorne a diferenca.",
    concept:
      "strcmp compara caractere a caractere. Retorna 0 se iguais, negativo se s1 < s2, positivo se s1 > s2. A comparacao e feita pelo valor ASCII.",
    hint: "Percorra enquanto os caracteres forem iguais E nenhuma das strings terminou. Retorne a diferenca do primeiro caractere diferente.",
    solution: `int\tft_strcmp(char *s1, char *s2)
{
\tint\ti;

\ti = 0;
\twhile (s1[i] && s2[i] && s1[i] == s2[i])
\t\ti++;
\treturn (s1[i] - s2[i]);
}`,
    template: `// Compare duas strings caractere por caractere.
// Retorne a diferenca ASCII do primeiro caractere diferente.
// Prototipo: int ft_strcmp(char *s1, char *s2);

int\tft_strcmp(char *s1, char *s2)
{
\t// Seu codigo aqui
}`,
    difficulty: "intermediario",
    language: "c",
    tags: ["string", "comparacao", "loop"],
    checkPatterns: ["while", "return", "s1\\[", "s2\\["],
    explanation: [
      "1. Percorremos com while enquanto ambas strings tem caracteres E sao iguais.",
      "2. s1[i] && s2[i] garante que nenhuma string terminou.",
      "3. s1[i] == s2[i] continua enquanto os caracteres forem identicos.",
      "4. Retornamos s1[i] - s2[i]: sera 0 se iguais, ou a diferenca ASCII.",
    ],
    exampleUsage: `#include <stdio.h>

int\tft_strcmp(char *s1, char *s2)
{
\tint\ti;

\ti = 0;
\twhile (s1[i] && s2[i] && s1[i] == s2[i])
\t\ti++;
\treturn (s1[i] - s2[i]);
}

int\tmain(void)
{
\tprintf("abc vs abc = %d\\n", ft_strcmp("abc", "abc"));     // 0
\tprintf("abc vs abd = %d\\n", ft_strcmp("abc", "abd"));     // -1
\tprintf("abd vs abc = %d\\n", ft_strcmp("abd", "abc"));     // 1
\tprintf("ab vs abc  = %d\\n", ft_strcmp("ab", "abc"));      // negativo
\treturn (0);
}`,
  },
  {
    id: 5,
    title: "ft_atoi",
    func: "ft_atoi",
    description: "Converta uma string numerica para int.",
    concept:
      "atoi (ASCII to Integer) converte texto para numero. Precisamos tratar: espacos iniciais, sinal (+/-), e converter digitos multiplicando por 10 e somando.",
    hint: "Pule espacos, trate o sinal, depois converta digitos: resultado = resultado * 10 + (str[i] - '0').",
    solution: `int\tft_atoi(char *str)
{
\tint\ti;
\tint\tresult;
\tint\tsign;

\ti = 0;
\tresult = 0;
\tsign = 1;
\twhile (str[i] == ' ' || (str[i] >= 9 && str[i] <= 13))
\t\ti++;
\tif (str[i] == '-' || str[i] == '+')
\t{
\t\tif (str[i] == '-')
\t\t\tsign = -1;
\t\ti++;
\t}
\twhile (str[i] >= '0' && str[i] <= '9')
\t{
\t\tresult = result * 10 + (str[i] - '0');
\t\ti++;
\t}
\treturn (result * sign);
}`,
    template: `// Converta a string para int.
// Trate espacos, sinal e digitos.
// Prototipo: int ft_atoi(char *str);

int\tft_atoi(char *str)
{
\t// Seu codigo aqui
}`,
    difficulty: "intermediario",
    language: "c",
    tags: ["string", "conversao", "ascii"],
    checkPatterns: ["while", "return", "sign", "\\* 10"],
    explanation: [
      "1. Pulamos whitespaces (espaco, tabs, etc) com o primeiro while.",
      "2. Verificamos se ha sinal (- ou +) e ajustamos sign.",
      "3. Convertemos digitos: str[i] - '0' da o valor numerico do caractere.",
      "4. result * 10 desloca o numero uma casa e somamos o novo digito.",
      "5. No final, multiplicamos por sign para aplicar o sinal.",
    ],
    exampleUsage: `#include <stdio.h>

int\tft_atoi(char *str)
{
\tint\ti;
\tint\tresult;
\tint\tsign;

\ti = 0;
\tresult = 0;
\tsign = 1;
\twhile (str[i] == ' ' || (str[i] >= 9 && str[i] <= 13))
\t\ti++;
\tif (str[i] == '-' || str[i] == '+')
\t{
\t\tif (str[i] == '-')
\t\t\tsign = -1;
\t\ti++;
\t}
\twhile (str[i] >= '0' && str[i] <= '9')
\t{
\t\tresult = result * 10 + (str[i] - '0');
\t\ti++;
\t}
\treturn (result * sign);
}

int\tmain(void)
{
\tprintf("atoi(\\"42\\")   = %d\\n", ft_atoi("42"));       // 42
\tprintf("atoi(\\"-42\\")  = %d\\n", ft_atoi("-42"));      // -42
\tprintf("atoi(\\"  +42\\")= %d\\n", ft_atoi("  +42"));   // 42
\tprintf("atoi(\\"0\\")    = %d\\n", ft_atoi("0"));        // 0
\tprintf("atoi(\\"123abc\\")= %d\\n", ft_atoi("123abc")); // 123
\treturn (0);
}`,
  },
  {
    id: 6,
    title: "ft_strcpy",
    func: "ft_strcpy",
    description: "Copie uma string de src para dest.",
    concept:
      "strcpy copia todos os caracteres de src para dest, incluindo o null terminator. O dest deve ter espaco suficiente.",
    hint: "Copie caractere por caractere ate encontrar '\\0', e nao esqueca de copiar o '\\0' tambem.",
    solution: `char\t*ft_strcpy(char *dest, char *src)
{
\tint\ti;

\ti = 0;
\twhile (src[i])
\t{
\t\tdest[i] = src[i];
\t\ti++;
\t}
\tdest[i] = '\\0';
\treturn (dest);
}`,
    template: `// Copie src para dest e retorne dest.
// Prototipo: char *ft_strcpy(char *dest, char *src);

char\t*ft_strcpy(char *dest, char *src)
{
\t// Seu codigo aqui
}`,
    difficulty: "iniciante",
    language: "c",
    tags: ["string", "copia", "loop"],
    checkPatterns: ["while", "return", "dest\\[", "src\\["],
    explanation: [
      "1. Percorremos src com while(src[i]) ate o null terminator.",
      "2. Copiamos cada caractere: dest[i] = src[i].",
      "3. Apos o loop, adicionamos '\\0' ao final de dest.",
      "4. Retornamos dest (padrao da funcao original).",
    ],
    exampleUsage: `#include <stdio.h>

char\t*ft_strcpy(char *dest, char *src)
{
\tint\ti;

\ti = 0;
\twhile (src[i])
\t{
\t\tdest[i] = src[i];
\t\ti++;
\t}
\tdest[i] = '\\0';
\treturn (dest);
}

int\tmain(void)
{
\tchar\tbuffer[50];

\tft_strcpy(buffer, "Hello, 42!");
\tprintf("Copiado: \\"%s\\"\\n", buffer); // "Hello, 42!"
\tft_strcpy(buffer, "Piscine");
\tprintf("Copiado: \\"%s\\"\\n", buffer); // "Piscine"
\treturn (0);
}`,
  },
  {
    id: 7,
    title: "ft_strdup",
    func: "ft_strdup",
    description: "Duplique uma string alocando memoria com malloc.",
    concept:
      "strdup aloca memoria suficiente para uma copia da string, copia o conteudo e retorna o ponteiro. Combina malloc + strcpy.",
    hint: "Primeiro calcule o tamanho com ft_strlen, aloque com malloc(len + 1), depois copie caractere por caractere.",
    solution: `#include <stdlib.h>

int\tft_strlen(char *str)
{
\tint\ti;

\ti = 0;
\twhile (str[i])
\t\ti++;
\treturn (i);
}

char\t*ft_strdup(char *src)
{
\tchar\t*dup;
\tint\t\ti;
\tint\t\tlen;

\tlen = ft_strlen(src);
\tdup = (char *)malloc(sizeof(char) * (len + 1));
\tif (!dup)
\t\treturn (NULL);
\ti = 0;
\twhile (src[i])
\t{
\t\tdup[i] = src[i];
\t\ti++;
\t}
\tdup[i] = '\\0';
\treturn (dup);
}`,
    template: `// Duplique a string alocando memoria.
// Prototipo: char *ft_strdup(char *src);
// Use malloc para alocar.

#include <stdlib.h>

char\t*ft_strdup(char *src)
{
\t// Seu codigo aqui
}`,
    difficulty: "avancado",
    language: "c",
    tags: ["string", "malloc", "memoria"],
    checkPatterns: ["malloc", "while", "return", "\\\\0|NULL"],
    explanation: [
      "1. Calculamos o tamanho de src com ft_strlen.",
      "2. Alocamos len + 1 bytes (+1 para o '\\0').",
      "3. Verificamos se malloc retornou NULL (falha de alocacao).",
      "4. Copiamos cada caractere e adicionamos '\\0' no final.",
      "5. Retornamos o ponteiro para a string duplicada.",
    ],
    exampleUsage: `#include <stdio.h>
#include <stdlib.h>

// ... ft_strlen e ft_strdup definidos acima ...

int\tmain(void)
{
\tchar\t*original = "42 Sao Paulo";
\tchar\t*copia = ft_strdup(original);

\tif (copia)
\t{
\t\tprintf("Original: %s\\n", original);
\t\tprintf("Copia:    %s\\n", copia);
\t\tprintf("Enderecos diferentes? %s\\n",
\t\t\toriginal != copia ? "Sim" : "Nao");
\t\tfree(copia);
\t}
\treturn (0);
}
// Saida:
// Original: 42 Sao Paulo
// Copia:    42 Sao Paulo
// Enderecos diferentes? Sim`,
  },
  {
    id: 8,
    title: "ft_range",
    func: "ft_range",
    description: "Retorne um array de inteiros de min ate max.",
    concept:
      "Alocacao dinamica permite criar arrays cujo tamanho so sabemos em runtime. Calculamos o tamanho, alocamos com malloc e preenchemos.",
    hint: "Calcule o tamanho (max - min + 1), aloque com malloc, preencha com um loop de min ate max.",
    solution: `#include <stdlib.h>

int\t*ft_range(int min, int max)
{
\tint\t*range;
\tint\ti;
\tint\tlen;

\tif (min >= max)
\t\treturn (NULL);
\tlen = max - min;
\trange = (int *)malloc(sizeof(int) * len);
\tif (!range)
\t\treturn (NULL);
\ti = 0;
\twhile (i < len)
\t{
\t\trange[i] = min + i;
\t\ti++;
\t}
\treturn (range);
}`,
    template: `// Crie e retorne um array de min ate max (exclusivo).
// Prototipo: int *ft_range(int min, int max);
// Retorne NULL se min >= max.

#include <stdlib.h>

int\t*ft_range(int min, int max)
{
\t// Seu codigo aqui
}`,
    difficulty: "avancado",
    language: "c",
    tags: ["array", "malloc", "loop"],
    checkPatterns: ["malloc", "while", "return", "NULL"],
    explanation: [
      "1. Verificamos se min >= max e retornamos NULL se sim.",
      "2. Calculamos len = max - min para saber quantos elementos.",
      "3. Alocamos sizeof(int) * len bytes.",
      "4. Preenchemos: range[i] = min + i gera a sequencia.",
      "5. Retornamos o ponteiro para o array.",
    ],
    exampleUsage: `#include <stdio.h>
#include <stdlib.h>

// ... ft_range definido acima ...

int\tmain(void)
{
\tint\t*arr;
\tint\ti;

\tarr = ft_range(3, 8);
\tif (arr)
\t{
\t\tprintf("ft_range(3, 8): ");
\t\ti = 0;
\t\twhile (i < 5)
\t\t{
\t\t\tprintf("%d ", arr[i]);
\t\t\ti++;
\t\t}
\t\tprintf("\\n");
\t\tfree(arr);
\t}
\t// Saida: ft_range(3, 8): 3 4 5 6 7
\treturn (0);
}`,
  },
  {
    id: 9,
    title: "ft_putchar",
    func: "ft_putchar",
    description: "Escreva um unico caractere na saida padrao usando write.",
    concept:
      "write(1, &c, 1) escreve 1 byte no file descriptor 1 (stdout). &c passa o endereco da variavel c. Essa e a funcao mais basica de output em C.",
    hint: "Use write(1, &c, 1) diretamente. O & pega o endereco do char.",
    solution: `#include <unistd.h>

void\tft_putchar(char c)
{
\twrite(1, &c, 1);
}`,
    template: `// Escreva o caractere c na saida padrao.
// Prototipo: void ft_putchar(char c);

#include <unistd.h>

void\tft_putchar(char c)
{
\t// Seu codigo aqui
}`,
    difficulty: "iniciante",
    language: "c",
    tags: ["write", "caractere", "basico"],
    checkPatterns: ["write"],
    explanation: [
      "1. Incluimos <unistd.h> para a funcao write.",
      "2. write(1, &c, 1): fd=1 (stdout), &c (endereco do char), 1 (1 byte).",
      "3. &c e necessario porque write espera um ponteiro (endereco).",
    ],
    exampleUsage: `#include <unistd.h>

void\tft_putchar(char c)
{
\twrite(1, &c, 1);
}

int\tmain(void)
{
\tft_putchar('H');
\tft_putchar('e');
\tft_putchar('l');
\tft_putchar('l');
\tft_putchar('o');
\tft_putchar('\\n');
\t// Saida: Hello
\treturn (0);
}`,
  },
  {
    id: 10,
    title: "ft_putnbr",
    func: "ft_putnbr",
    description: "Imprima um numero inteiro na saida padrao.",
    concept:
      "Para imprimir um numero, precisamos converter cada digito para caractere. Usamos recursao ou divisao por 10 para separar os digitos. Caso especial: numeros negativos.",
    hint: "Trate o negativo primeiro. Use recursao: se nb >= 10, chame ft_putnbr(nb / 10), depois imprima nb % 10 + '0'.",
    solution: `#include <unistd.h>

void\tft_putchar(char c)
{
\twrite(1, &c, 1);
}

void\tft_putnbr(int nb)
{
\tif (nb == -2147483648)
\t{
\t\twrite(1, "-2147483648", 11);
\t\treturn ;
\t}
\tif (nb < 0)
\t{
\t\tft_putchar('-');
\t\tnb = -nb;
\t}
\tif (nb >= 10)
\t\tft_putnbr(nb / 10);
\tft_putchar(nb % 10 + '0');
}`,
    template: `// Imprima o numero inteiro nb na saida padrao.
// Prototipo: void ft_putnbr(int nb);
// Trate numeros negativos e o limite de int.

#include <unistd.h>

void\tft_putchar(char c)
{
\twrite(1, &c, 1);
}

void\tft_putnbr(int nb)
{
\t// Seu codigo aqui
}`,
    difficulty: "intermediario",
    language: "c",
    tags: ["recursao", "numero", "write"],
    checkPatterns: ["write|ft_putchar", "% 10|%10", "/ 10|/10"],
    explanation: [
      "1. Caso especial: -2147483648 nao pode ser negado (overflow), entao imprimimos direto.",
      "2. Se negativo, imprimimos '-' e invertemos o sinal.",
      "3. Se nb >= 10, chamamos recursivamente com nb/10 (digitos da esquerda).",
      "4. nb % 10 + '0' converte o ultimo digito para caractere ASCII.",
    ],
    exampleUsage: `#include <unistd.h>

void\tft_putchar(char c)
{
\twrite(1, &c, 1);
}

void\tft_putnbr(int nb)
{
\tif (nb == -2147483648)
\t{
\t\twrite(1, "-2147483648", 11);
\t\treturn ;
\t}
\tif (nb < 0)
\t{
\t\tft_putchar('-');
\t\tnb = -nb;
\t}
\tif (nb >= 10)
\t\tft_putnbr(nb / 10);
\tft_putchar(nb % 10 + '0');
}

int\tmain(void)
{
\tft_putnbr(42);
\tft_putchar('\\n');        // Saida: 42
\tft_putnbr(-2147483648);
\tft_putchar('\\n');        // Saida: -2147483648
\tft_putnbr(0);
\tft_putchar('\\n');        // Saida: 0
\treturn (0);
}`,
  },
]

// ==================== SHELL EXERCISES ====================
const shellExercises: Exercise[] = [
  {
    id: 101,
    title: "Listar Arquivos",
    func: "list_files",
    description: "Crie um script que liste todos os arquivos do diretorio atual, um por linha, ordenados alfabeticamente.",
    concept:
      "O comando 'ls' lista arquivos. Com a flag '-1' (um), exibe um arquivo por linha. O pipe '|' permite encadear comandos. 'sort' ordena a saida.",
    hint: "Use ls -1 para listar um por linha. Combine com sort usando pipe.",
    solution: `#!/bin/bash

ls -1 | sort`,
    template: `#!/bin/bash
# Liste todos os arquivos do diretorio atual,
# um por linha, ordenados alfabeticamente.

# Seu codigo aqui`,
    difficulty: "iniciante",
    language: "shell",
    tags: ["ls", "sort", "pipe"],
    checkPatterns: ["ls", "sort"],
    explanation: [
      "1. #!/bin/bash define o interpretador (shebang).",
      "2. ls -1 lista arquivos, um por linha.",
      "3. O pipe | envia a saida de ls para o sort.",
      "4. sort ordena as linhas alfabeticamente.",
    ],
    exampleUsage: `#!/bin/bash
# Exemplo de execucao:

# Crie o script:
# $ nano list_files.sh

# Conteudo:
ls -1 | sort

# Torne executavel e execute:
# $ chmod +x list_files.sh
# $ ./list_files.sh

# Saida (exemplo):
# Makefile
# ft_putchar.c
# ft_strlen.c
# main.c`,
  },
  {
    id: 107,
    title: "Operações com Datas",
    func: "date_operations",
    description: "Use touch -t para criar arquivo com data específica e modifique timestamps.",
    concept:
      "touch -t AAAAMMDDHHMM define data/hora específica. Formato: 4 dígitos ano, 2 mês, 2 dia, 2 hora, 2 minuto.",
    hint: "Use: touch -t 202112251800 arquivo.txt",
    solution: `#!/bin/bash
touch -t 202112251800 arquivo.txt
touch -t 202101010900 arquivo2.txt
ls -lt arquivo*`,
    template: `#!/bin/bash
# Crie 2 arquivos com datas diferentes usando touch -t
# Verifique o resultado com ls -lt (ordenado por data)

# Seu codigo aqui`,
    difficulty: "iniciante",
    language: "shell",
    tags: ["touch -t", "data", "timestamp"],
    checkPatterns: ["touch.*-t"],
    explanation: [
      "1. touch -t AAAAMMDDHHMM define data/hora.",
      "2. Formato: 202112251800 = 2021-12-25 18:00.",
      "3. ls -lt ordena por data de modificação (mais recente primeiro).",
      "4. ls -la mostra a data junto com permissões.",
    ],
    exampleUsage: `$ touch -t 202112251800 old.txt
$ touch -t 202206151200 new.txt
$ ls -lt
-rw-r--r-- new.txt   2022-06-15
-rw-r--r-- old.txt   2021-12-25`,
  },
  {
    id: 108,
    title: "Modificar Tamanho com truncate",
    func: "truncate_file",
    description: "Use truncate para criar arquivo com tamanho exato em bytes.",
    concept:
      "truncate -s TAMANHO cria ou redimensiona arquivo para exatamente N bytes. Útil para testes que precisam de arquivo com tamanho específico.",
    hint: "Use: truncate -s 40 arquivo.txt",
    solution: `#!/bin/bash
truncate -s 40 arquivo40.txt
truncate -s 100 arquivo100.txt
ls -l arquivo*`,
    template: `#!/bin/bash
# Crie arquivo com tamanho exato de 40 bytes
# Verifique com ls -l

# Seu codigo aqui`,
    difficulty: "iniciante",
    language: "shell",
    tags: ["truncate", "tamanho", "-s"],
    checkPatterns: ["truncate", "-s"],
    explanation: [
      "1. truncate -s 40 define tamanho para exatamente 40 bytes.",
      "2. Se arquivo não existe, cria com zeros.",
      "3. Se existe, redimensiona (pode truncar ou expandir).",
      "4. ls -l mostra tamanho do arquivo.",
    ],
    exampleUsage: `$ truncate -s 100 teste.txt
$ ls -l teste.txt
-rw-r--r-- 1 user group 100 Jan 1 12:00 teste.txt
$ hexdump -C teste.txt | head
00000000  00 00 00 00 ... (100 bytes de zeros)`,
  },
  {
    id: 109,
    title: "Buscar Arquivos com find",
    func: "find_files",
    description: "Use find para localizar arquivos por nome, tipo e outras propriedades.",
    concept:
      "find . -type f -name padrão localiza arquivos. -type d encontra diretórios. -mtime localiza por tempo de modificação.",
    hint: "Use: find . -type f -name '*.txt'",
    solution: `#!/bin/bash
find . -type f -name "*.sh"
echo "---"
find . -type d
echo "---"
find . -type f -size +1k`,
    template: `#!/bin/bash
# Encontre todos os arquivos .txt no diretório atual
# Encontre todos os diretórios
# Use find com diferentes flags

# Seu codigo aqui`,
    difficulty: "intermediario",
    language: "shell",
    tags: ["find", "tipo", "nome", "tamanho"],
    checkPatterns: ["find", "-type", "-name"],
    explanation: [
      "1. find . começa no diretório atual.",
      "2. -type f encontra apenas arquivos.",
      "3. -type d encontra apenas diretórios.",
      "4. -name '*.txt' filtra por nome.",
      "5. -size +1k encontra maiores que 1KB.",
      "6. -mtime -7 encontra modificados nos últimos 7 dias.",
    ],
    exampleUsage: `$ find . -type f -name "*.txt"
./docs/readme.txt
./arquivo.txt
./pasta/doc.txt

$ find . -type d
.
./pasta
./docs`,
  },
  {
    id: 110,
    title: "Pipeline com grep",
    func: "grep_pipeline",
    description: "Use grep com pipes para buscar padrões em arquivos e processar resultados.",
    concept:
      "grep busca padrões. -n mostra número de linha. -r busca recursivamente. | (pipe) envia saída para próximo comando.",
    hint: "Use: grep -n 'padrão' arquivo | cut -d: -f1",
    solution: `#!/bin/bash
grep -n "main" *.c | cut -d: -f1,2
echo "---"
grep -r "function" . --include="*.sh"`,
    template: `#!/bin/bash
# Busque 'TODO' em todos os arquivos .c e mostre linha
# Use grep com -n para número de linha
# Processe com cut para extrair colunas

# Seu codigo aqui`,
    difficulty: "intermediario",
    language: "shell",
    tags: ["grep", "pipe", "padrao", "cut"],
    checkPatterns: ["grep", "\\|", "cut"],
    explanation: [
      "1. grep -n busca padrão e mostra número de linha.",
      "2. | (pipe) envia saída para próximo comando.",
      "3. cut -d: -f1,2 extrai coluna 1 e 2 separadas por ':'.",
      "4. grep -r busca recursivamente em diretórios.",
    ],
    exampleUsage: `$ grep -n "return" main.c
1:int main(void) { return 0; }
42:return (result);

$ grep -n "return" main.c | cut -d: -f2
int main(void) { return 0; }
return (result);`,
  },
  {
    id: 111,
    title: "Transformação com tr",
    func: "tr_transform",
    description: "Use tr para transformar caracteres: maiúsculas, minúsculas, deletar, etc.",
    concept:
      "tr 'a-z' 'A-Z' converte minúsculas para maiúsculas. tr -d remove caracteres. tr -s comprime caracteres repetidos.",
    hint: "Use: tr 'a-z' 'A-Z' < arquivo.txt",
    solution: `#!/bin/bash
echo "Hello World" | tr 'a-z' 'A-Z'
echo "Hello  World" | tr -s ' ' ' '
echo "abc 123" | tr -d '0-9'`,
    template: `#!/bin/bash
# Converta minúsculas para MAIÚSCULAS
# Remova números de um texto
# Comprima espaços múltiplos em um

# Seu codigo aqui`,
    difficulty: "intermediario",
    language: "shell",
    tags: ["tr", "transformacao", "maiuscula"],
    checkPatterns: ["tr"],
    explanation: [
      "1. tr 'a-z' 'A-Z' mapeia minúsculas para maiúsculas.",
      "2. tr -d '0-9' deleta (remove) dígitos.",
      "3. tr -s ' ' ' ' comprime múltiplos espaços em um.",
      "4. tr '[:lower:]' '[:upper:]' alternativa POSIX.",
    ],
    exampleUsage: `$ echo "Hello 123" | tr 'a-z' 'A-Z'
HELLO 123

$ echo "abc  def" | tr -s ' ' ','
abc,def

$ echo "a1b2c3" | tr -d '0-9'
abc`,
  },
  {
    id: 112,
    title: "Ordenar e Remover Duplicatas",
    func: "sort_unique",
    description: "Use sort e uniq para ordenar e remover linhas duplicadas.",
    concept:
      "sort ordena alfabeticamente. uniq remove linhas duplicadas (funciona em entrada ordenada). sort -u combina ambas.",
    hint: "Use: sort arquivo.txt | uniq ou sort -u arquivo.txt",
    solution: `#!/bin/bash
echo -e "maçã\\nbanana\\nmaçã\\nlaranja" | sort
echo "---"
echo -e "maçã\\nbanana\\nmaçã\\nlaranja" | sort | uniq
echo "---"
echo -e "maçã\\nbanana\\nmaçã\\nlaranja" | sort | uniq -c`,
    template: `#!/bin/bash
# Crie arquivo com linhas repetidas
# Ordene e remova duplicatas com sort | uniq
# Conte duplicatas com uniq -c

# Seu codigo aqui`,
    difficulty: "intermediario",
    language: "shell",
    tags: ["sort", "uniq", "duplicatas"],
    checkPatterns: ["sort", "uniq"],
    explanation: [
      "1. sort ordena linhas alfabeticamente.",
      "2. uniq remove linhas duplicadas ADJACENTES.",
      "3. Sempre use sort antes de uniq!",
      "4. uniq -c conta quantas vezes cada linha aparece.",
      "5. sort -u é atalho para sort | uniq.",
    ],
    exampleUsage: `$ cat palavras.txt
maçã
banana
maçã

$ cat palavras.txt | sort | uniq
banana
maçã

$ cat palavras.txt | sort | uniq -c
      1 banana
      2 maçã`,
  },
  {
    id: 113,
    title: "Contar Linhas",
    func: "count_lines",
    description: "Crie um script que receba um arquivo como argumento e conte quantas linhas ele tem.",
    concept:
      "O comando 'wc -l' conta linhas. Verificar argumentos com [ -z \"$1\" ]. Verificar existência do arquivo com [ ! -f \"$1\" ].",
    hint: "Use wc -l < \"$1\" para contar linhas. Trate o caso onde nenhum arquivo é passado.",
    solution: `#!/bin/bash

if [ -z "$1" ]; then
    echo "Uso: count_lines.sh <arquivo>"
    exit 1
fi

if [ ! -f "$1" ]; then
    echo "Erro: arquivo não encontrado"
    exit 1
fi

wc -l < "$1"`,
    template: `#!/bin/bash
# Receba um arquivo como $1
# Conte quantas linhas tem
# Trate erros (sem arquivo, arquivo inexistente)

# Seu codigo aqui`,
    difficulty: "intermediario",
    language: "shell",
    tags: ["wc", "argumento", "teste"],
    checkPatterns: ["wc", "-l", "\\$1", "-f"],
    explanation: [
      "1. [ -z \"$1\" ] verifica se o argumento está vazio.",
      "2. [ ! -f \"$1\" ] verifica se o arquivo existe e é um arquivo regular.",
      "3. wc -l < \"$1\" conta linhas redirecionando o arquivo.",
      "4. exit 1 encerra com código de erro.",
    ],
    exampleUsage: `#!/bin/bash
# Exemplo de execução:

# Salve o script como count_lines.sh
# Conteúdo do script:
if [ -z "$1" ]; then
    echo "Uso: ./count_lines.sh <arquivo>"
    exit 1
fi
if [ ! -f "$1" ]; then
    echo "Erro: arquivo não encontrado"
    exit 1
fi
wc -l < "$1"

# Teste:
# $ echo -e "linha1\\nlinha2\\nlinha3" > teste.txt
# $ ./count_lines.sh teste.txt
# 3
# $ ./count_lines.sh
# Uso: ./count_lines.sh <arquivo>`,
  },
  {
    id: 114,
    title: "Buscar Padrão",
    func: "search_pattern",
    description: "Crie um script que busque um padrão em todos os arquivos .c do diretório atual e mostre as linhas encontradas.",
    concept:
      "O comando 'grep' busca padrões em arquivos. Com -n mostra o número da linha. Com -r busca recursivamente. Wildcards como *.c filtram por extensão.",
    hint: "Use grep com a flag -n para mostrar números de linha. Use *.c para filtrar arquivos C.",
    solution: `#!/bin/bash

if [ -z "$1" ]; then
    echo "Uso: ./search_pattern.sh <padrão>"
    exit 1
fi

grep -n "$1" *.c 2>/dev/null

if [ $? -ne 0 ]; then
    echo "Nenhuma ocorrência encontrada."
fi`,
    template: `#!/bin/bash
# Busque o padrão ($1) em todos os arquivos .c
# do diretório atual. Mostre o número da linha.
# Trate erros.

# Seu codigo aqui`,
    difficulty: "intermediario",
    language: "shell",
    tags: ["grep", "wildcard", "padrão"],
    checkPatterns: ["grep", "\\$1", "\\.c"],
    explanation: [
      "1. Verificamos se o padrão foi passado como argumento.",
      "2. grep -n busca o padrão e mostra o número da linha.",
      "3. *.c expande para todos os arquivos .c no diretório.",
      "4. 2>/dev/null redireciona erros (ex: sem arquivos .c).",
      "5. $? contém o código de retorno do último comando.",
    ],
    exampleUsage: `#!/bin/bash
# Exemplo de execução:
# $ echo 'int main(void) { return 0; }' > main.c
# $ ./search_pattern.sh "return"
# main.c:1:int main(void) { return 0; }
# $ ./search_pattern.sh "printf"
# Nenhuma ocorrência encontrada.`,
  },
  {
    id: 115,
    title: "Permissões de Arquivo",
    func: "file_permissions",
    description: "Crie um script que mude as permissões de todos os arquivos .sh do diretório para executável.",
    concept:
      "O comando 'chmod' altera permissões. +x adiciona permissão de execução. O comando 'find' localiza arquivos. O loop 'for' itera sobre resultados.",
    hint: "Use um loop for com *.sh e chmod +x dentro. Ou use find com -exec.",
    solution: `#!/bin/bash

for file in *.sh; do
    if [ -f "$file" ]; then
        chmod +x "$file"
        echo "Permissão adicionada: $file"
    fi
done`,
    template: `#!/bin/bash
# Adicione permissão de execução (+x) a todos
# os arquivos .sh do diretório atual.
# Imprima uma mensagem para cada arquivo alterado.

# Seu codigo aqui`,
    difficulty: "intermediario",
    language: "shell",
    tags: ["chmod", "loop", "permissões"],
    checkPatterns: ["chmod", "for", "\\.sh"],
    explanation: [
      "1. for file in *.sh itera sobre todos os arquivos .sh.",
      "2. [ -f \"$file\" ] garante que é um arquivo (não diretório).",
      "3. chmod +x adiciona permissão de execução.",
      "4. echo informa qual arquivo foi alterado.",
    ],
    exampleUsage: `#!/bin/bash
# Exemplo:
# $ touch script1.sh script2.sh
# $ ./file_permissions.sh
# Permissão adicionada: script1.sh
# Permissão adicionada: script2.sh
# $ ls -la *.sh | grep "x"
# -rwxr-xr-x script1.sh
# -rwxr-xr-x script2.sh`,
  },
  {
    id: 116,
    title: "Renomear em Lote",
    func: "batch_rename",
    description: "Crie um script que renomeie todos os arquivos .txt para .bak no diretório atual.",
    concept:
      "O comando 'mv' move/renomeia arquivos. Substituição de parâmetro ${var%pattern} remove um sufixo. Isso permite trocar extensões de forma elegante.",
    hint: "Use for + mv. Para trocar a extensão, use ${file%.txt}.bak.",
    solution: "#!/bin/bash\n\ncount=0\n\nfor file in *.txt; do\n    if [ -f \"$file\" ]; then\n        mv \"$file\" \"${file%.txt}.bak\"\n        count=$((count + 1))\n    fi\ndone\n\necho \"$count arquivo(s) renomeado(s).\"",
    template: `#!/bin/bash
# Renomeie todos os arquivos .txt para .bak.
# Conte quantos arquivos foram renomeados.

# Seu codigo aqui`,
    difficulty: "avancado",
    language: "shell",
    tags: ["mv", "loop", "substituição"],
    checkPatterns: ["mv", "for", "\\.txt", "\\.bak"],
    explanation: [
      "1. for file in *.txt itera sobre arquivos .txt.",
      "2. ${file%.txt} remove o sufixo .txt do nome.",
      "3. ${file%.txt}.bak adiciona a nova extensão.",
      "4. mv renomeia o arquivo.",
      "5. Contamos com count=$((count + 1)) (aritmética shell).",
    ],
    exampleUsage: `#!/bin/bash
# Exemplo:
# $ touch file1.txt file2.txt file3.txt
# $ ls *.txt
# file1.txt file2.txt file3.txt
# $ ./batch_rename.sh
# 3 arquivo(s) renomeado(s).
# $ ls *.bak
# file1.bak file2.bak file3.bak`,
  },
  {
    id: 117,
    title: "Processamento com awk",
    func: "process_with_awk",
    description: "Use awk para processar e filtrar linhas de um arquivo, extraindo e manipulando campos.",
    concept:
      "awk processa linhas divididas em campos. -F define o delimitador. $1 é primeiro campo, $2 segundo, etc. Expressões lógicas filtram linhas.",
    hint: "Use: awk -F: '{print $1}' /etc/passwd para extrair nomes de usuários.",
    solution: `#!/bin/bash
echo -e "nome:idade:cidade\\njoao:25:sp\\nmaria:30:rj" | awk -F: '{print $1, $2}'
echo "---"
awk -F: '$2 > 25 {print $1}' arquivo.txt`,
    template: `#!/bin/bash
# Processe arquivo com awk
# Use -F para definir delimitador
# Extraia e manipule campos

# Seu codigo aqui`,
    difficulty: "avancado",
    language: "shell",
    tags: ["awk", "campo", "processamento"],
    checkPatterns: ["awk"],
    explanation: [
      "1. awk processa cada linha automaticamente.",
      "2. -F: define ':' como delimitador de campos.",
      "3. $1, $2, etc. são os campos.",
      "4. NR é número da linha atual.",
      "5. $0 é a linha inteira.",
      "6. Pode-se fazer operações matemáticas e lógicas.",
    ],
    exampleUsage: `$ echo -e "a:1\\nb:2\\nc:3" | awk -F: '$2 > 1 {print $1}'
b
c

$ awk 'NR > 2 {print NR, $0}' arquivo.txt
3 terceira linha
4 quarta linha`,
  },
  {
    id: 104,
    title: "Permissoes de Arquivo",
    func: "file_permissions",
    description: "Crie um script que mude as permissoes de todos os arquivos .sh do diretorio para executavel.",
    concept:
      "O comando 'chmod' altera permissoes. +x adiciona permissao de execucao. O comando 'find' localiza arquivos. O loop 'for' itera sobre resultados.",
    hint: "Use um loop for com *.sh e chmod +x dentro. Ou use find com -exec.",
    solution: `#!/bin/bash

for file in *.sh; do
    if [ -f "$file" ]; then
        chmod +x "$file"
        echo "Permissao adicionada: $file"
    fi
done`,
    template: `#!/bin/bash
# Adicione permissao de execucao (+x) a todos
# os arquivos .sh do diretorio atual.
# Imprima uma mensagem para cada arquivo alterado.

# Seu codigo aqui`,
    difficulty: "intermediario",
    language: "shell",
    tags: ["chmod", "loop", "permissoes"],
    checkPatterns: ["chmod", "for", "\\.sh"],
    explanation: [
      "1. for file in *.sh itera sobre todos os arquivos .sh.",
      "2. [ -f \"$file\" ] garante que e um arquivo (nao diretorio).",
      "3. chmod +x adiciona permissao de execucao.",
      "4. echo informa qual arquivo foi alterado.",
    ],
    exampleUsage: `#!/bin/bash
# Exemplo:
# $ touch script1.sh script2.sh
# $ ./file_permissions.sh
# Permissao adicionada: script1.sh
# Permissao adicionada: script2.sh
# $ ls -la *.sh | grep "x"
# -rwxr-xr-x script1.sh
# -rwxr-xr-x script2.sh`,
  },
  {
    id: 101,
    title: "Criar Arquivo com cat",
    func: "create_file",
    description: "Use cat para criar um arquivo chamado 'z' contendo apenas a letra 'Z'.",
    concept:
      "O comando 'cat' pode criar arquivos usando redirecionamento >. Digite o conteúdo e pressione Ctrl+D para salvar (EOF).",
    hint: "Use: cat > z\nDigite: Z\nPressione: Ctrl+D",
    solution: `cat > z
Z`,
    template: `# Use cat para criar arquivo 'z' com conteúdo 'Z'
# Você não precisa escrever código aqui
# Este exercício é sobre usar o terminal`,
    difficulty: "iniciante",
    language: "shell",
    tags: ["cat", "redirecionamento", "arquivo"],
    checkPatterns: ["cat"],
    explanation: [
      "1. cat sem argumentos lê da entrada padrão.",
      "2. > z redireciona a saída para arquivo 'z'.",
      "3. Ctrl+D envia EOF (fim de arquivo).",
      "4. O arquivo 'z' é criado com conteúdo 'Z'.",
    ],
    exampleUsage: `$ cat > z
Z
$ cat z
Z`,
  },
  {
    id: 102,
    title: "Permissões e touch",
    func: "set_permissions",
    description: "Crie arquivo com touch, defina permissão 644 e verifique com ls -l.",
    concept:
      "touch cria arquivo vazio. chmod altera permissões. 644 = rw-r--r-- (leitura/escrita para dono, apenas leitura para outros).",
    hint: "Use touch arquivo.txt, chmod 644 arquivo.txt, ls -l arquivo.txt",
    solution: `#!/bin/bash
touch testShell00
chmod 644 testShell00
ls -l testShell00`,
    template: `#!/bin/bash
# Crie arquivo com touch
# Defina permissão 644
# Verifique com ls -l

# Seu codigo aqui`,
    difficulty: "iniciante",
    language: "shell",
    tags: ["touch", "chmod", "permissoes", "ls"],
    checkPatterns: ["touch", "chmod", "644"],
    explanation: [
      "1. touch cria arquivo vazio ou atualiza timestamp.",
      "2. chmod 644 define: proprietário rw- (6), grupo r-- (4), outros r-- (4).",
      "3. ls -l mostra permissões em formato legível.",
    ],
    exampleUsage: `$ touch testShell00
$ chmod 644 testShell00
$ ls -l testShell00
-rw-r--r-- 1 user group 0 Jan 1 12:00 testShell00`,
  },
  {
    id: 103,
    title: "Links Físicos",
    func: "create_hardlink",
    description: "Crie um link físico de um arquivo existente. Links físicos compartilham o mesmo inode.",
    concept:
      "Links físicos (hard links) criam referências adicionais ao mesmo arquivo. Se deletar o original, o link continua funcionando. Diferente de symlinks.",
    hint: "Use: ln arquivo link_fisico. Verifique com ls -li para ver o inode.",
    solution: `#!/bin/bash
echo "conteúdo original" > original.txt
ln original.txt link_fisico.txt
ls -li original.txt link_fisico.txt`,
    template: `#!/bin/bash
# Crie um arquivo original
# Crie um link físico dele
# Verifique que têm o mesmo inode

# Seu codigo aqui`,
    difficulty: "iniciante",
    language: "shell",
    tags: ["ln", "link", "inode"],
    checkPatterns: ["ln ", "original"],
    explanation: [
      "1. ln sem flag cria hard link.",
      "2. Ambos apontam para o mesmo inode.",
      "3. ls -li mostra o número do inode na primeira coluna.",
      "4. Deletar original não afeta o link.",
    ],
    exampleUsage: `$ echo "conteúdo" > original.txt
$ ln original.txt link.txt
$ ls -li
123456 -rw-r--r-- 2 user group ... original.txt
123456 -rw-r--r-- 2 user group ... link.txt`,
  },
  {
    id: 104,
    title: "Links Simbólicos",
    func: "create_symlink",
    description: "Crie um link simbólico. Symlinks são atalhos que apontam para o caminho do arquivo.",
    concept:
      "Links simbólicos (symlinks) com ln -s criam atalhos. Se deletar o original, o symlink fica quebrado (broken link).",
    hint: "Use: ln -s arquivo link_simbolico",
    solution: `#!/bin/bash
echo "conteúdo" > original.txt
ln -s original.txt link_simbolico.txt
ls -l original.txt link_simbolico.txt`,
    template: `#!/bin/bash
# Crie um arquivo original
# Crie um symlink dele com ln -s
# Verifique a diferença com ls -l

# Seu codigo aqui`,
    difficulty: "iniciante",
    language: "shell",
    tags: ["ln -s", "symlink", "atalho"],
    checkPatterns: ["ln.*-s"],
    explanation: [
      "1. ln -s cria symlink (symbolic link).",
      "2. Symlink aponta para o caminho, não para o inode.",
      "3. ls -l mostra -> indicando que é link.",
      "4. Deletar original quebra o symlink.",
    ],
    exampleUsage: `$ echo "conteúdo" > arquivo.txt
$ ln -s arquivo.txt atalho.txt
$ ls -l
-rw-r--r-- arquivo.txt
lrwxrwxrwx atalho.txt -> arquivo.txt`,
  },
  {
    id: 105,
    title: "Compactar com tar",
    func: "tar_compress",
    description: "Crie alguns arquivos e compacte-os em um arquivo .tar.",
    concept:
      "tar agrupa múltiplos arquivos. -c = criar, -f = arquivo. tar -cf arquivo.tar *.txt cria arquivo.tar com todos .txt.",
    hint: "Use: tar -cf arquivo.tar *.txt",
    solution: `#!/bin/bash
echo "arquivo 1" > file1.txt
echo "arquivo 2" > file2.txt
tar -cf meus_arquivos.tar file*.txt
tar -tvf meus_arquivos.tar`,
    template: `#!/bin/bash
# Crie alguns arquivos de teste
# Compacte-os em um tar
# Liste o conteúdo com tar -tvf

# Seu codigo aqui`,
    difficulty: "iniciante",
    language: "shell",
    tags: ["tar", "compactacao", "c f"],
    checkPatterns: ["tar", "-c", "-f"],
    explanation: [
      "1. tar -cf cria arquivo tar (c = create, f = file).",
      "2. *.txt expande para todos os .txt.",
      "3. tar -tvf lista conteúdo (t = list, v = verbose, f = file).",
      "4. tar -xvf extrai (x = extract).",
    ],
    exampleUsage: `$ echo "conteúdo1" > f1.txt
$ echo "conteúdo2" > f2.txt
$ tar -cf arquivos.tar f1.txt f2.txt
$ tar -tvf arquivos.tar
-rw-r--r-- f1.txt
-rw-r--r-- f2.txt`,
  },
  {
    id: 106,
    title: "Primeiro Script",
    func: "hello",
    description: "Crie um script Bash que imprima 'Hello, Shell!'.",
    concept:
      "Um script Bash começa com #!/bin/bash (shebang). Precisa de permissão de execução com chmod +x. Use echo para imprimir.",
    hint: "Comece com #!/bin/bash na primeira linha. Use echo para imprimir a mensagem.",
    solution: `#!/bin/bash
echo "Hello, Shell!"`,
    template: `#!/bin/bash
# Imprima "Hello, Shell!" no terminal

# Seu codigo aqui`,
    difficulty: "iniciante",
    language: "shell",
    tags: ["basico", "echo", "shebang"],
    checkPatterns: ["#!/bin/bash", "echo"],
    explanation: [
      "1. #!/bin/bash (shebang) indica que este arquivo é um script Bash.",
      "2. echo 'Hello, Shell!' imprime a mensagem.",
      "3. Para executar: chmod +x script.sh && ./script.sh",
    ],
    exampleUsage: `#!/bin/bash
echo "Hello, Shell!"

# Para executar:
# $ chmod +x hello.sh
# $ ./hello.sh
# Hello, Shell!`,
  },
]

// ==================== PYTHON EXERCISES ====================
const pythonExercises: Exercise[] = [
  {
    id: 201,
    title: "Inverter String",
    func: "reverse_string",
    description: "Crie uma funcao que receba uma string e retorne ela invertida, sem usar slicing [::-1].",
    concept:
      "Em Python, strings sao imutaveis. Para inverter, podemos iterar do final ao inicio e construir uma nova string, ou usar um loop com concatenacao.",
    hint: "Use um loop for que percorra do ultimo indice ao primeiro. Ou use um while decrementando. Construa uma nova string.",
    solution: `def reverse_string(s):
    result = ""
    i = len(s) - 1
    while i >= 0:
        result += s[i]
        i -= 1
    return result`,
    template: `# Inverta a string recebida sem usar slicing [::-1].
# Prototipo: def reverse_string(s) -> str

def reverse_string(s):
    # Seu codigo aqui
    pass`,
    difficulty: "iniciante",
    language: "python",
    tags: ["string", "loop", "basico"],
    checkPatterns: ["def reverse_string", "while|for", "return"],
    explanation: [
      "1. Criamos result como string vazia.",
      "2. i comeca no ultimo indice: len(s) - 1.",
      "3. O while decrementa i, concatenando cada caractere.",
      "4. result += s[i] adiciona o caractere ao resultado.",
      "5. Retornamos a string invertida.",
    ],
    exampleUsage: `def reverse_string(s):
    result = ""
    i = len(s) - 1
    while i >= 0:
        result += s[i]
        i -= 1
    return result

# Testes
print(reverse_string("Hello"))   # olleH
print(reverse_string("42 SP"))   # PS 24
print(reverse_string("a"))       # a
print(reverse_string(""))        # (vazio)`,
  },
  {
    id: 202,
    title: "FizzBuzz",
    func: "fizzbuzz",
    description: "Implemente FizzBuzz: para numeros de 1 a n, imprima 'Fizz' se divisivel por 3, 'Buzz' se divisivel por 5, 'FizzBuzz' se ambos, ou o numero.",
    concept:
      "FizzBuzz e um exercicio classico de logica. Usa o operador modulo (%) para verificar divisibilidade. A ordem das condicoes importa: primeiro teste FizzBuzz (3 e 5), depois Fizz, depois Buzz.",
    hint: "Use um for de 1 a n+1. Teste primeiro se i % 15 == 0 (divisivel por ambos), depois % 3, depois % 5.",
    solution: `def fizzbuzz(n):
    result = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            result.append("FizzBuzz")
        elif i % 3 == 0:
            result.append("Fizz")
        elif i % 5 == 0:
            result.append("Buzz")
        else:
            result.append(str(i))
    return result`,
    template: `# Implemente FizzBuzz de 1 ate n.
# Retorne uma lista de strings.
# Prototipo: def fizzbuzz(n) -> list

def fizzbuzz(n):
    # Seu codigo aqui
    pass`,
    difficulty: "iniciante",
    language: "python",
    tags: ["logica", "loop", "condicional"],
    checkPatterns: ["def fizzbuzz", "for|while", "% 3|%3", "% 5|%5"],
    explanation: [
      "1. range(1, n+1) gera numeros de 1 ate n.",
      "2. Testamos % 15 primeiro (divisivel por 3 E 5).",
      "3. A ordem elif garante que FizzBuzz tem prioridade.",
      "4. str(i) converte o numero para string quando nao e Fizz/Buzz.",
      "5. Retornamos a lista completa.",
    ],
    exampleUsage: `def fizzbuzz(n):
    result = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            result.append("FizzBuzz")
        elif i % 3 == 0:
            result.append("Fizz")
        elif i % 5 == 0:
            result.append("Buzz")
        else:
            result.append(str(i))
    return result

# Teste
resultado = fizzbuzz(15)
for item in resultado:
    print(item)
# Saida: 1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz`,
  },
  {
    id: 203,
    title: "Fibonacci",
    func: "fibonacci",
    description: "Crie uma funcao que retorne os n primeiros numeros da sequencia de Fibonacci.",
    concept:
      "Fibonacci: cada numero e a soma dos dois anteriores. Comeca com 0, 1, 1, 2, 3, 5, 8... E um exercicio classico de iteracao e compreensao de sequencias.",
    hint: "Comece com uma lista [0, 1]. Use um loop para calcular o proximo como soma dos dois ultimos.",
    solution: `def fibonacci(n):
    if n <= 0:
        return []
    if n == 1:
        return [0]
    fib = [0, 1]
    while len(fib) < n:
        fib.append(fib[-1] + fib[-2])
    return fib`,
    template: `# Retorne os n primeiros numeros de Fibonacci.
# Prototipo: def fibonacci(n) -> list

def fibonacci(n):
    # Seu codigo aqui
    pass`,
    difficulty: "iniciante",
    language: "python",
    tags: ["sequencia", "loop", "lista"],
    checkPatterns: ["def fibonacci", "while|for", "append", "return"],
    explanation: [
      "1. Tratamos casos base: n <= 0 retorna lista vazia, n == 1 retorna [0].",
      "2. Comecamos com [0, 1] (os dois primeiros).",
      "3. O loop continua ate termos n elementos.",
      "4. fib[-1] + fib[-2] soma os dois ultimos.",
      "5. append adiciona o proximo numero a lista.",
    ],
    exampleUsage: `def fibonacci(n):
    if n <= 0:
        return []
    if n == 1:
        return [0]
    fib = [0, 1]
    while len(fib) < n:
        fib.append(fib[-1] + fib[-2])
    return fib

# Testes
print(fibonacci(8))   # [0, 1, 1, 2, 3, 5, 8, 13]
print(fibonacci(1))   # [0]
print(fibonacci(0))   # []`,
  },
  {
    id: 204,
    title: "Ordenar Lista",
    func: "bubble_sort",
    description: "Implemente o algoritmo Bubble Sort para ordenar uma lista de inteiros.",
    concept:
      "Bubble Sort compara pares adjacentes e troca se estiverem fora de ordem. Repete ate nao haver mais trocas. Complexidade O(n2) mas e simples de implementar e entender.",
    hint: "Use dois loops aninhados. O externo repete ate nao haver trocas. O interno compara lst[j] com lst[j+1] e troca se necessario.",
    solution: `def bubble_sort(lst):
    n = len(lst)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if lst[j] > lst[j + 1]:
                lst[j], lst[j + 1] = lst[j + 1], lst[j]
                swapped = True
        if not swapped:
            break
    return lst`,
    template: `# Ordene a lista usando Bubble Sort.
# Retorne a lista ordenada.
# Prototipo: def bubble_sort(lst) -> list

def bubble_sort(lst):
    # Seu codigo aqui
    pass`,
    difficulty: "intermediario",
    language: "python",
    tags: ["ordenacao", "loop", "algoritmo"],
    checkPatterns: ["def bubble_sort", "for", "if.*>", "return"],
    explanation: [
      "1. n = len(lst) guarda o tamanho.",
      "2. O loop externo repete n vezes (no maximo).",
      "3. O loop interno compara pares adjacentes.",
      "4. lst[j], lst[j+1] = lst[j+1], lst[j] faz a troca (swap).",
      "5. swapped otimiza: se nenhuma troca ocorreu, a lista ja esta ordenada.",
    ],
    exampleUsage: `def bubble_sort(lst):
    n = len(lst)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if lst[j] > lst[j + 1]:
                lst[j], lst[j + 1] = lst[j + 1], lst[j]
                swapped = True
        if not swapped:
            break
    return lst

# Testes
print(bubble_sort([64, 34, 25, 12, 22, 11, 90]))
# [11, 12, 22, 25, 34, 64, 90]

print(bubble_sort([5, 1, 4, 2, 8]))
# [1, 2, 4, 5, 8]

print(bubble_sort([1, 2, 3]))  # Ja ordenada
# [1, 2, 3]`,
  },
  {
    id: 205,
    title: "Contador de Palavras",
    func: "word_count",
    description: "Crie uma funcao que receba um texto e retorne um dicionario com a contagem de cada palavra.",
    concept:
      "Dicionarios em Python armazenam pares chave-valor. O metodo split() divide texto em palavras. lower() normaliza para minusculas. Usamos get() para contar.",
    hint: "Use split() para separar palavras. Itere e use dict.get(word, 0) + 1 para contar. Normalize com lower().",
    solution: `def word_count(text):
    words = text.lower().split()
    count = {}
    for word in words:
        count[word] = count.get(word, 0) + 1
    return count`,
    template: `# Conte a ocorrencia de cada palavra no texto.
# Retorne um dicionario {palavra: contagem}.
# Normalize para minusculas.
# Prototipo: def word_count(text) -> dict

def word_count(text):
    # Seu codigo aqui
    pass`,
    difficulty: "intermediario",
    language: "python",
    tags: ["dicionario", "string", "loop"],
    checkPatterns: ["def word_count", "split", "for", "return"],
    explanation: [
      "1. text.lower() converte tudo para minusculas.",
      "2. split() divide por espacos em branco.",
      "3. count.get(word, 0) retorna 0 se a palavra nao existe.",
      "4. Incrementamos em 1 a cada ocorrencia.",
      "5. Retornamos o dicionario completo.",
    ],
    exampleUsage: `def word_count(text):
    words = text.lower().split()
    count = {}
    for word in words:
        count[word] = count.get(word, 0) + 1
    return count

# Testes
texto = "O rato roeu a roupa do rei de Roma"
resultado = word_count(texto)
print(resultado)
# {'o': 1, 'rato': 1, 'roeu': 1, 'a': 1, 'roupa': 1, 'do': 1, 'rei': 1, 'de': 1, 'roma': 1}

texto2 = "gato gato cachorro gato cachorro"
print(word_count(texto2))
# {'gato': 3, 'cachorro': 2}`,
  },
  {
    id: 206,
    title: "Verificar Palindromo",
    func: "is_palindrome",
    description: "Crie uma funcao que verifique se uma string e um palindromo (lida igual de tras para frente), ignorando espacos e maiusculas.",
    concept:
      "Um palindromo e uma sequencia que se le igual nos dois sentidos. Para verificar, normalizamos a string (minusculas, sem espacos) e comparamos com sua inversa, ou usamos dois ponteiros.",
    hint: "Normalize a string com lower() e remova espacos. Use dois indices (inicio e fim) comparando caracteres.",
    solution: `def is_palindrome(s):
    clean = s.lower().replace(" ", "")
    left = 0
    right = len(clean) - 1
    while left < right:
        if clean[left] != clean[right]:
            return False
        left += 1
        right -= 1
    return True`,
    template: `# Verifique se a string e um palindromo.
# Ignore espacos e diferencas de maiusculas/minusculas.
# Prototipo: def is_palindrome(s) -> bool

def is_palindrome(s):
    # Seu codigo aqui
    pass`,
    difficulty: "intermediario",
    language: "python",
    tags: ["string", "dois-ponteiros", "logica"],
    checkPatterns: ["def is_palindrome", "while|for", "return", "lower"],
    explanation: [
      "1. lower() normaliza para minusculas.",
      "2. replace(\" \", \"\") remove espacos.",
      "3. Dois indices: left no inicio, right no fim.",
      "4. Comparamos os caracteres e retornamos False se diferentes.",
      "5. Se o loop terminar sem False, e palindromo.",
    ],
    exampleUsage: `def is_palindrome(s):
    clean = s.lower().replace(" ", "")
    left = 0
    right = len(clean) - 1
    while left < right:
        if clean[left] != clean[right]:
            return False
        left += 1
        right -= 1
    return True

# Testes
print(is_palindrome("arara"))               # True
print(is_palindrome("Ame a ema"))           # True
print(is_palindrome("python"))              # False
print(is_palindrome("A sacada da casa"))    # True`,
  },
]

const javascriptExercises: Exercise[] = [
  {
    id: 301,
    title: "Somar Array",
    func: "sumArray",
    description: "Retorne a soma de todos os numeros em uma array.",
    concept:
      "Use reduce para acumular valores. Para aprender funcoes de ordem superior e iteracao funcional em JS.",
    hint: "array.reduce((acc, cur) => acc + cur, 0)",
    solution: `function sumArray(arr) {
  return arr.reduce((total, value) => total + value, 0)
}`,
    template: `// Calcule a soma de um array de números
function sumArray(arr) {
  // Seu código aqui
}`,
    difficulty: "iniciante",
    language: "javascript",
    tags: ["array", "reduce", "funcoes"],
    checkPatterns: ["reduce", "return"],
    explanation: [
      "1. Comece com total 0.",
      "2. Use reduce para somar cada elemento.",
      "3. Retorne o valor final.",
    ],
    exampleUsage: `console.log(sumArray([1,2,3,4])) // 10`,
  },
  {
    id: 302,
    title: "Filtrar Pares",
    func: "filterEven",
    description: "Retorne somente os numeros pares de um array.",
    concept: "Use filter para retornar um novo array com valores que satisfazem a condicao.",
    hint: "arr.filter(n => n % 2 === 0)",
    solution: `function filterEven(arr) {
  return arr.filter((num) => num % 2 === 0)
}`,
    template: `// Retorne apenas os numeros pares de um array
function filterEven(arr) {
  // Seu código aqui
}`,
    difficulty: "iniciante",
    language: "javascript",
    tags: ["array", "filter", "modulo"],
    checkPatterns: ["filter", "% 2"],
    explanation: [
      "1. Use filter para selecionar valores.",
      "2. Condição pares: num % 2 === 0.",
      "3. Retorne o novo array.",
    ],
    exampleUsage: `console.log(filterEven([1,2,3,4,5,6])) // [2,4,6]`,
  },
]

const htmlExercises: Exercise[] = [
  {
    id: 401,
    title: "Estrutura HTML Basica",
    func: "basicHtml",
    description: "Crie a estrutura com doctype, html, head e body.",
    concept: "Compreender a base de um documento HTML semântico.",
    hint: "Use <!DOCTYPE html>, <html>, <head><title></title></head>, <body>.",
    solution: `<!DOCTYPE html>
<html lang=\"pt-BR\">
<head>
  <meta charset=\"UTF-8\">
  <title>Documento</title>
</head>
<body>
  <h1>Olá Treina Pro</h1>
</body>
</html>`,
    template: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Seu Exercício</title>
</head>
<body>
  <!-- Seu código aqui -->
</body>
</html>`,
    difficulty: "iniciante",
    language: "html",
    tags: ["html", "estrutura", "semantica"],
    checkPatterns: ["<!DOCTYPE html>", "<html", "<body>"],
    explanation: [
      "1. DOCTYPE informa o modo padrão (standards).",
      "2. <html lang='pt-BR'> define idioma.",
      "3. <head> contém metadados (charset, título).",
      "4. <body> contém conteúdo renderizado.",
    ],
    exampleUsage: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Treina Pro</title>
</head>
<body>
  <h1>Olá, HTML!</h1>
</body>
</html>`,
  },
]

const cssExercises: Exercise[] = [
  {
    id: 501,
    title: "Layout Flexbox",
    func: "flexLayout",
    description: "Crie um container flex com itens centralizados tanto no eixo x como y.",
    concept: "Entender display:flex e alinhamentos justify-content e align-items.",
    hint: "use display: flex; justify-content: center; align-items: center;",
    solution: `#container { display: flex; justify-content: center; align-items: center; }`,
    template: `#container {
  /* Seu código aqui */
}`,
    difficulty: "iniciante",
    language: "css",
    tags: ["flexbox", "layout", "css"],
    checkPatterns: ["display\s*:\s*flex", "justify-content", "align-items"],
    explanation: [
      "1. display: flex transforma o elemento em container flexível.",
      "2. justify-content centraliza no eixo principal.",
      "3. align-items centraliza no eixo cruzado.",
    ],
    exampleUsage: `#container {
  display: flex;
  justify-content: center;
  align-items: center;
}`,
  },
]

const phpExercises: Exercise[] = [
  {
    id: 601,
    title: "Palindrome PHP",
    func: "isPalindrome",
    description: "Crie função para verificar palíndromo ignorando espaços e maiúsculas.",
    concept: "Manipulação de strings em PHP e funções nativas como strtolower e str_replace.",
    hint: "Use str_replace(' ', '', $text) e strrev().",
    solution: `<?php
function isPalindrome($text) {
  $normalized = strtolower(str_replace(' ', '', $text));
  return $normalized === strrev($normalized);
}`,
    template: `<?php
function isPalindrome($text) {
  // Seu código aqui
}`,
    difficulty: "iniciante",
    language: "php",
    tags: ["php", "string", "função"],
    checkPatterns: ["strtolower", "strrev", "return"],
    explanation: [
      "1. Remover espaços com str_replace.",
      "2. Converter para minúsculas com strtolower.",
      "3. Comparar string com strrev.",
    ],
    exampleUsage: `<?php
var_dump(isPalindrome('arara')); // true
var_dump(isPalindrome('Hello')); // false`,
  },
]

export const exercises: Exercise[] = [
  ...cExercises,
  ...shellExercises,
  ...pythonExercises,
  ...javascriptExercises,
  ...htmlExercises,
  ...cssExercises,
  ...phpExercises,
]

export function getExercisesByLanguage(lang: Language): Exercise[] {
  return exercises.filter((e) => e.language === lang)
}

export function getExercisesByDifficulty(diff: Difficulty): Exercise[] {
  return exercises.filter((e) => e.difficulty === diff)
}

export function getLanguageLabel(lang: Language): string {
  switch (lang) {
    case "c":
      return "C"
    case "shell":
      return "Shell"
    case "python":
      return "Python"
    case "javascript":
      return "JavaScript"
    case "html":
      return "HTML"
    case "css":
      return "CSS"
    case "php":
      return "PHP"
  }
}

export function getLanguageColor(lang: Language): string {
  switch (lang) {
    case "c":
      return "text-primary"
    case "shell":
      return "text-accent"
    case "python":
      return "text-warning"
    case "javascript":
      return "text-yellow-500"
    case "html":
      return "text-orange-500"
    case "css":
      return "text-blue-500"
    case "php":
      return "text-indigo-400"
  }
}

export function getDifficultyColor(diff: Difficulty): string {
  switch (diff) {
    case "iniciante":
      return "text-success"
    case "intermediario":
      return "text-warning"
    case "avancado":
      return "text-destructive"
  }
}

export function getDifficultyLabel(diff: Difficulty): string {
  switch (diff) {
    case "iniciante":
      return "Iniciante"
    case "intermediario":
      return "Intermediario"
    case "avancado":
      return "Avancado"
  }
}
