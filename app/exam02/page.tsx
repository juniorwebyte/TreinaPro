"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, BookOpen, Code2, Bug, Brain, Zap, ChevronDown, ChevronUp, Copy, Check, Terminal, Lightbulb, AlertTriangle, Target, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { ExamAccessGate } from "@/components/exam-access-gate"

// Code Block Component with Copy
function CodeBlock({ code, language = "c" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 rounded-md bg-secondary/80 p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-secondary hover:text-foreground group-hover:opacity-100"
        aria-label="Copiar codigo"
      >
        {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
      </button>
      <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-terminal p-4 font-mono text-xs leading-relaxed text-terminal-foreground md:text-sm">
        <code>{code}</code>
      </pre>
    </div>
  )
}

// Collapsible Section
function CollapsibleSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="rounded-lg border border-border bg-card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left font-medium text-foreground hover:bg-secondary/50"
      >
        {title}
        {isOpen ? <ChevronUp className="size-5 text-muted-foreground" /> : <ChevronDown className="size-5 text-muted-foreground" />}
      </button>
      {isOpen && <div className="border-t border-border p-4">{children}</div>}
    </div>
  )
}

// Exercise Card
function ExerciseCard({ 
  name, 
  difficulty, 
  description, 
  code, 
  explanation 
}: { 
  name: string
  difficulty: number
  description: string
  code: string
  explanation: string
}) {
  const stars = Array.from({ length: 5 }, (_, i) => i < difficulty)

  return (
    <CollapsibleSection title={`${name} - ${"*".repeat(difficulty)} (${["Muito Facil", "Facil", "Facil-Medio", "Medio", "Dificil"][difficulty - 1]})`}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Dificuldade:</span>
          <div className="flex gap-0.5">
            {stars.map((filled, i) => (
              <span key={i} className={filled ? "text-warning" : "text-muted-foreground/30"}>*</span>
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
        <CodeBlock code={code} />
        <div className="rounded-lg bg-primary/5 p-3">
          <p className="text-sm text-foreground"><span className="font-semibold text-primary">Conceito:</span> {explanation}</p>
        </div>
      </div>
    </CollapsibleSection>
  )
}

export default function Exam02Page() {
  return (
    <ExamAccessGate>
    <div className="min-h-[100dvh] bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-5" />
              <span className="hidden sm:inline">Voltar</span>
            </Link>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <GraduationCap className="size-6 text-primary" />
              <span className="font-bold text-foreground">Guia Exam02</span>
            </div>
          </div>
          <Link href="/treinar">
            <Button size="sm" className="gap-2">
              <Terminal className="size-4" />
              Praticar
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent py-12">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h1 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
            Guia Completo do Exam02
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            Documentacao completa para te ajudar a entender a logica dos exercicios do Exam02 da 42 Sao Paulo. 
            Estude os conceitos, pratique bastante e conquiste sua aprovacao.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-card px-4 py-2">
              <Target className="size-4 text-primary" />
              <span className="text-sm">5 Exercicios Principais</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-warning/20 bg-card px-4 py-2">
              <Lightbulb className="size-4 text-warning" />
              <span className="text-sm">Explicacoes Detalhadas</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-accent/20 bg-card px-4 py-2">
              <Bug className="size-4 text-accent" />
              <span className="text-sm">Guia de Debugging</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Tabs defaultValue="guia" className="w-full">
          <TabsList className="mb-8 flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
            <TabsTrigger value="guia" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BookOpen className="size-4" />
              Guia Completo
            </TabsTrigger>
            <TabsTrigger value="resumo" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Zap className="size-4" />
              Resumo Rapido
            </TabsTrigger>
            <TabsTrigger value="pratica" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Code2 className="size-4" />
              Testes Praticos
            </TabsTrigger>
            <TabsTrigger value="debug" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Bug className="size-4" />
              Debugging
            </TabsTrigger>
            <TabsTrigger value="mapa" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Brain className="size-4" />
              Mapa Mental
            </TabsTrigger>
          </TabsList>

          {/* Guia Completo */}
          <TabsContent value="guia" className="mt-0">
            <div className="flex flex-col gap-6">
              {/* Aviso Importante */}
              <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
                  <div>
                    <h3 className="font-semibold text-foreground">Informacao Importante</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Este guia foi criado para te AJUDAR a ENTENDER a logica. Quando for fazer o exame, voce DEVE escrever o codigo sozinho (sem copiar-colar). Entenda COMO funciona, nao apenas copie. Estude o conceito, nao memorize linhas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Os 5 Principais */}
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
                  <Target className="size-5 text-primary" />
                  Os 5 Exercicios Principais (Comece Aqui!)
                </h2>

                <div className="flex flex-col gap-4">
                  {/* ft_strlen */}
                  <ExerciseCard
                    name="ft_strlen"
                    difficulty={1}
                    description="Contar quantas letras tem em uma string ate encontrar o \\0 (final da string). Voce vai usar este conceito em TODOS os outros exercicios!"
                    code={`int ft_strlen(char *str)
{
    int count = 0;  // Comeca contando do zero
    
    while (str[count] != '\\0')  // Enquanto nao chegar no fim...
    {
        count++;  // Adiciona 1 ao contador
    }
    
    return count;  // Retorna quantas letras tinha
}`}
                    explanation="Iterar string ate encontrar o caractere nulo \\0 que marca o fim da string em C."
                  />

                  {/* ft_atoi */}
                  <ExerciseCard
                    name="ft_atoi"
                    difficulty={2}
                    description="Transformar uma string tipo '123' em um numero 123 que voce pode fazer contas. O conceito char - '0' converte caractere para numero!"
                    code={`int ft_atoi(const char *str)
{
    int result = 0;    // Comecamos com 0
    int negative = 1;  // 1 = positivo, -1 = negativo
    int i = 0;
    
    // PASSO 1: Pular espacos no comeco
    while (str[i] == ' ' || str[i] == '\\t')
        i++;
    
    // PASSO 2: Verificar se e negativo
    if (str[i] == '-')
    {
        negative = -1;
        i++;
    }
    else if (str[i] == '+')
        i++;
    
    // PASSO 3: Converter cada numero
    while (str[i] >= '0' && str[i] <= '9')
    {
        result = result * 10 + (str[i] - '0');
        i++;
    }
    
    return result * negative;
}`}
                    explanation="Multiplicar por 10 'empurra' os digitos para a esquerda. O truque char - '0' converte o caractere ASCII para seu valor numerico."
                  />

                  {/* ft_split */}
                  <ExerciseCard
                    name="ft_split"
                    difficulty={5}
                    description="Pegar uma string como 'Oi mundo teste' e transformar em um array de palavras separadas. Usa TUDO que voce aprendeu: contar, malloc, ponteiros, loops."
                    code={`#include <stdlib.h>

// Funcao auxiliar: contar quantas palavras tem
int count_words(char *str)
{
    int count = 0;
    int in_word = 0;
    
    while (*str)
    {
        if (*str != ' ' && *str != '\\t' && in_word == 0)
        {
            count++;
            in_word = 1;
        }
        else if (*str == ' ' || *str == '\\t')
            in_word = 0;
        str++;
    }
    return count;
}

char **ft_split(char *str)
{
    if (!str || *str == '\\0')
        return NULL;
    
    int word_count = count_words(str);
    
    // Alocar array de ponteiros
    char **result = (char **)malloc((word_count + 1) * sizeof(char *));
    
    if (!result)
        return NULL;
    
    // ... logica para alocar e copiar cada palavra ...
    
    result[word_count] = NULL;  // Marca fim do array
    return result;
}`}
                    explanation="Precisa de 3 mallocs: um para o array de ponteiros, e um para cada palavra. Sempre coloque NULL no final do array!"
                  />

                  {/* ft_itoa */}
                  <ExerciseCard
                    name="ft_itoa"
                    difficulty={3}
                    description="Transformar um numero como 456 em uma string '456'. E o oposto de ft_atoi! Use % para extrair digitos e + '0' para converter para char."
                    code={`#include <stdlib.h>

int count_digits(int nbr)
{
    int count = 0;
    if (nbr <= 0) count = 1;
    if (nbr < 0) nbr = -nbr;
    while (nbr > 0)
    {
        count++;
        nbr = nbr / 10;
    }
    return count;
}

char *ft_itoa(int nbr)
{
    int len = count_digits(nbr);
    char *result = (char *)malloc((len + 1) * sizeof(char));
    
    if (!result)
        return NULL;
    
    result[len] = '\\0';
    
    if (nbr == 0)
    {
        result[0] = '0';
        return result;
    }
    
    int is_negative = (nbr < 0);
    if (is_negative)
    {
        nbr = -nbr;
        result[0] = '-';
    }
    
    int index = len - 1;
    while (nbr > 0)
    {
        result[index] = (nbr % 10) + '0';
        nbr = nbr / 10;
        index--;
    }
    
    return result;
}`}
                    explanation="nbr % 10 extrai o ultimo digito, nbr / 10 remove ele. Preencha a string de tras para frente!"
                  />

                  {/* ft_range */}
                  <ExerciseCard
                    name="ft_range"
                    difficulty={3}
                    description="Dado start = 1 e end = 5, criar um array [1, 2, 3, 4, 5]. Se start > end, conta para tras!"
                    code={`#include <stdlib.h>

int *ft_range(int start, int end)
{
    int i;
    int *array;
    
    // Calcular quantos numeros precisamos
    int size;
    if (start <= end)
        size = end - start + 1;
    else
        size = start - end + 1;
    
    // Alocar espaco
    array = (int *)malloc(size * sizeof(int));
    
    if (!array)
        return NULL;
    
    // Preencher o array
    i = 0;
    if (start <= end)
    {
        while (start <= end)
        {
            array[i] = start;
            start++;
            i++;
        }
    }
    else
    {
        while (start >= end)
        {
            array[i] = start;
            start--;
            i++;
        }
    }
    
    return array;
}`}
                    explanation="O +1 no calculo do tamanho e para contar AMBOS os extremos. ft_range(1, 3) tem 3 numeros: 1, 2, 3."
                  />
                </div>
              </div>

              {/* Por Que Começar com Estes? */}
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
                  <Lightbulb className="size-5 text-warning" />
                  Por Que Começar com o Nível 0?
                </h2>
                <div className="rounded-lg bg-warning/5 border border-warning/30 p-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">✓ Simples</h4>
                      <p className="text-sm text-muted-foreground">Só precisa entender argumentos e loops básicos. Sem malloc, sem alocação dinâmica.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">✓ Fundamental</h4>
                      <p className="text-sm text-muted-foreground">Ensina como acessar argv[1], como iterar strings com while, quando usar write.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">✓ Importante</h4>
                      <p className="text-sm text-muted-foreground">A diferença entre aff_a e aff_z ensina lógica condicional e atenção aos detalhes.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">✓ Base Sólida</h4>
                      <p className="text-sm text-muted-foreground">Todo programa em C começa com int main(int argc, char **argv). Domine isso agora!</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Outros Exercicios por Nivel */}
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
                  <BookOpen className="size-5 text-primary" />
                  Outros Exercicios por Nivel
                </h2>

                <div className="flex flex-col gap-4">
                  {/* Nivel 0 */}
                  <CollapsibleSection title="Nivel 0 ⭐ (COMECE AQUI - OS MAIS FÁCEIS!)">
                    <div className="flex flex-col gap-4">
                      <p className="text-sm font-semibold text-primary mb-3">Esses são os primeiros exercícios - aquecimento! Entenda a lógica aqui e o resto fica fácil.</p>
                      
                      <div>
                        <h4 className="mb-2 font-semibold text-foreground">aff_a ⭐⭐⭐⭐⭐ (PRIMEIRO EXERCÍCIO - AQUECIMENTO!)</h4>
                        <p className="text-sm text-muted-foreground mb-2"><strong>Dificuldade:</strong> ⭐ (Muito Fácil) | <strong>Importância:</strong> ⭐⭐⭐ (BOM PARA COMEÇAR)</p>
                        <p className="text-sm text-muted-foreground mb-3">Escreva um programa que recebe uma string e exibe o primeiro caractere 'a' que encontra nela, seguido de uma nova linha. Se não houver 'a', apenas nova linha. Se nenhum argumento, imprime 'a'.</p>
                        <CodeBlock code={`#include <unistd.h>

int main(int argc, char **argv)
{
    int i = 0;
    
    // CASO 1: Nenhum argumento ou mais de 1
    if (argc != 2)
    {
        write(1, "a\\n", 2);  // Sempre imprime 'a'
        return 0;
    }
    
    // CASO 2: Tem exatamente 1 argumento
    // Procurar o primeiro 'a'
    while (argv[1][i] != '\\0')
    {
        if (argv[1][i] == 'a')
        {
            write(1, "a\\n", 2);  // Achou! Imprime e sai
            return 0;
        }
        i++;
    }
    
    // CASO 3: Chegou aqui = não achou nenhum 'a'
    write(1, "\\n", 1);  // Apenas nova linha
    return 0;
}`} />
                      </div>

                      <div className="pt-2 border-t border-border">
                        <h4 className="mb-2 font-semibold text-foreground">aff_z ⭐⭐⭐⭐⭐ (SEGUNDO EXERCÍCIO - VARIANTE DO PRIMEIRO)</h4>
                        <p className="text-sm text-muted-foreground mb-2"><strong>Dificuldade:</strong> ⭐ (Muito Fácil) | <strong>Importância:</strong> ⭐⭐⭐</p>
                        <p className="text-sm text-muted-foreground mb-3"><strong className="text-primary">DIFERENÇA CRUCIAL:</strong> Se não achar 'z', imprime 'z' + nova linha (não apenas nova linha como em aff_a!)</p>
                        <CodeBlock code={`#include <unistd.h>

int main(int argc, char **argv)
{
    int i = 0;
    
    // CASO 1: Nenhum argumento ou mais de 1
    if (argc != 2)
    {
        write(1, "z\\n", 2);  // Sempre imprime 'z'
        return 0;
    }
    
    // CASO 2: Tem exatamente 1 argumento
    // Procurar o primeiro 'z'
    while (argv[1][i] != '\\0')
    {
        if (argv[1][i] == 'z')
        {
            write(1, "z\\n", 2);  // Achou! Imprime e sai
            return 0;
        }
        i++;
    }
    
    // CASO 3: Chegou aqui = não achou nenhum 'z'
    // DIFERENTE DO aff_a: AQUI imprime 'z' MESMO ASSIM!
    write(1, "z\\n", 2);
    return 0;
}`} />
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* Nivel 1 */}
                  <CollapsibleSection title="Nivel 1 ⭐⭐ (BEM FÁCIL)">
                    <div className="flex flex-col gap-4">
                      <p className="text-sm text-muted-foreground">Exercícios fundamentais que você precisa dominar. Entenda esses e o resto fica mais fácil.</p>
                      
                      <div>
                        <h4 className="mb-2 font-semibold text-foreground">ft_strlen ⭐⭐⭐⭐⭐ (TERCEIRO EXERCÍCIO - PILAR!)</h4>
                        <p className="text-sm text-muted-foreground mb-2"><strong>Dificuldade:</strong> ⭐ (Muito Fácil) | <strong>Importância:</strong> ⭐⭐⭐⭐⭐ (ESSENCIAL)</p>
                        <p className="text-sm text-muted-foreground mb-3">Você vai usar este conceito em TODOS os outros exercícios! Apenas conte caracteres até encontrar o \\0</p>
                        <CodeBlock code={`#include <unistd.h>

int ft_strlen(char *str)
{
    int count = 0;  // Começa contando do zero
    
    while (str[count] != '\\0')  // Enquanto não chegar no fim...
    {
        count++;  // Adiciona 1 ao contador
    }
    
    return count;  // Retorna quantas letras tinha
}`} />
                        <p className="text-sm text-muted-foreground mt-2">ft_strlen("") = 0 | ft_strlen("a") = 1 | ft_strlen("ABC") = 3</p>
                      </div>

                      <div className="pt-2 border-t border-border">
                        <h4 className="mb-2 font-semibold text-foreground">ft_swap - Trocar valores via ponteiros</h4>
                        <p className="text-sm text-muted-foreground mb-3">Trabalhar com ponteiros para modificar variáveis. O * acessa o valor que o ponteiro aponta.</p>
                        <CodeBlock code={`void ft_swap(int *a, int *b)
{
    int temp;  // Variável temporária para guardar um valor
    
    temp = *a;  // Guarda o valor que 'a' aponta
    *a = *b;    // 'a' recebe o valor que 'b' aponta
    *b = temp;  // 'b' recebe o valor guardado
}`} />
                      </div>

                      <div className="pt-2 border-t border-border">
                        <h4 className="mb-2 font-semibold text-foreground">rev_print - Imprimir string ao contrário</h4>
                        <p className="text-sm text-muted-foreground mb-3">Iterar string de trás para frente. Use len-- para voltar.</p>
                        <CodeBlock code={`#include <unistd.h>

char *rev_print(char *str)
{
    int len = 0;
    
    // Contar tamanho da string
    while (str[len] != '\\0')
        len++;
    
    len--;  // Começar do último caractere (antes do \\0)
    
    // Imprimir de trás para frente
    while (len >= 0)
    {
        write(1, &str[len], 1);  // Imprime um caractere
        len--;
    }
    
    write(1, "\\n", 1);  // Newline no final
    
    return str;
}`} />
                        <p className="text-sm text-muted-foreground mt-2">Entrada: "ABC" → Saída: "CBA"</p>
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* Nivel 2 */}
                  <CollapsibleSection title="Nivel 2 ⭐⭐⭐ (FÁCIL-MÉDIO)">
                    <div className="flex flex-col gap-4">
                      <p className="text-sm text-muted-foreground">Exercícios que combinam loops com lógica extra. Teste seus conhecimentos básicos com variações.</p>
                      
                      <div>
                        <h4 className="mb-2 font-semibold text-foreground">first_word - Imprimir primeira palavra</h4>
                        <p className="text-sm text-muted-foreground mb-3">Itere a string, imprima caracteres até encontrar espaço. Depois para.</p>
                        <CodeBlock code={`#include <unistd.h>

int main(int argc, char **argv)
{
    int i = 0;
    
    if (argc != 2)
    {
        write(1, "\\n", 1);
        return 0;
    }
    
    while (argv[1][i] != ' ' && argv[1][i] != '\\0')
    {
        write(1, &argv[1][i], 1);
        i++;
    }
    
    write(1, "\\n", 1);
    return 0;
}`} />
                      </div>

                      <div className="pt-2 border-t border-border">
                        <h4 className="mb-2 font-semibold text-foreground">ft_strrev - Reverter string (malloc)</h4>
                        <p className="text-sm text-muted-foreground mb-3">Use ft_strlen para saber o tamanho, malloc para alocar, depois copia de trás para frente.</p>
                        <CodeBlock code={`#include <stdlib.h>

char *ft_strrev(char *str)
{
    int len = 0;
    char *result;
    
    // Contar tamanho
    while (str[len])
        len++;
    
    // Alocar memória
    result = malloc((len + 1) * sizeof(char));
    if (!result)
        return NULL;
    
    // Copiar de trás para frente
    int i = 0;
    while (i < len)
    {
        result[i] = str[len - 1 - i];
        i++;
    }
    result[len] = '\\0';
    
    return result;
}`} />
                      </div>

                      <div className="pt-2 border-t border-border">
                        <h4 className="mb-2 font-semibold text-foreground">rot_13 - Cada letra pula 13 posições</h4>
                        <p className="text-sm text-muted-foreground mb-3">{"Fórmula: (c - 'a' + 13) % 26 + 'a'. O % 26 garante que nunca passa de 'z'!"}</p>
                        <CodeBlock code={`#include <unistd.h>

int main(int argc, char **argv)
{
    int i = 0;
    char c;
    
    if (argc != 2)
    {
        write(1, "\\n", 1);
        return 0;
    }
    
    while (argv[1][i] != '\\0')
    {
        c = argv[1][i];
        
        if (c >= 'a' && c <= 'z')
            c = (c - 'a' + 13) % 26 + 'a';
        else if (c >= 'A' && c <= 'Z')
            c = (c - 'A' + 13) % 26 + 'A';
        
        write(1, &c, 1);
        i++;
    }
    
    write(1, "\\n", 1);
    return 0;
}`} />
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* Nivel 3 */}
                  <CollapsibleSection title="Nivel 3 ⭐⭐⭐⭐ (MÉDIO)">
                    <div className="flex flex-col gap-4">
                      <p className="text-sm text-muted-foreground">Exercícios que combinam múltiplos conceitos. Comece a pensar em lógica mais complexa.</p>
                      
                      <div>
                        <h4 className="mb-2 font-semibold text-foreground">last_word - Imprimir última palavra</h4>
                        <p className="text-sm text-muted-foreground mb-3">Procure o último espaço e imprima tudo depois dele até o fim da string.</p>
                        <CodeBlock code={`#include <unistd.h>
#include <stdlib.h>

int main(int argc, char **argv)
{
    int i;
    int last_space = -1;
    
    if (argc != 2)
    {
        write(1, "\\n", 1);
        return 0;
    }
    
    // Encontrar posição do último espaço
    i = 0;
    while (argv[1][i] != '\\0')
    {
        if (argv[1][i] == ' ')
            last_space = i;
        i++;
    }
    
    // Imprimir do último espaço até o fim
    i = last_space + 1;
    while (argv[1][i] != '\\0')
    {
        write(1, &argv[1][i], 1);
        i++;
    }
    
    write(1, "\\n", 1);
    return 0;
}`} />
                      </div>

                      <div className="pt-2 border-t border-border">
                        <h4 className="mb-2 font-semibold text-foreground">inter - Caracteres em AMBAS strings</h4>
                        <p className="text-sm text-muted-foreground mb-3">{"Use um array de 256 posições como \"memória\" para não repetir caracteres."}</p>
                        <CodeBlock code={`#include <unistd.h>

int main(int argc, char **argv)
{
    int i = 0;
    int j;
    int already_printed[256];
    
    for (int k = 0; k < 256; k++)
        already_printed[k] = 0;
    
    if (argc != 3)
    {
        write(1, "\\n", 1);
        return 0;
    }
    
    while (argv[1][i] != '\\0')
    {
        j = 0;
        while (argv[2][j] != '\\0')
        {
            if (argv[1][i] == argv[2][j])
            {
                if (already_printed[(unsigned char)argv[1][i]] == 0)
                {
                    write(1, &argv[1][i], 1);
                    already_printed[(unsigned char)argv[1][i]] = 1;
                }
                break;
            }
            j++;
        }
        i++;
    }
    
    write(1, "\\n", 1);
    return 0;
}`} />
                      </div>

                      <div className="pt-2 border-t border-border">
                        <h4 className="mb-2 font-semibold text-foreground">union - Todos caracteres únicos de AMBAS strings</h4>
                        <p className="text-sm text-muted-foreground mb-3">Parecido com inter, mas imprime caracteres de ambas as strings sem repetir.</p>
                        <CodeBlock code={`#include <unistd.h>

int main(int argc, char **argv)
{
    int already_printed[256];
    int i = 0;
    int j;
    
    for (int k = 0; k < 256; k++)
        already_printed[k] = 0;
    
    if (argc != 3)
    {
        write(1, "\\n", 1);
        return 0;
    }
    
    // Imprimir caracteres únicos de argv[1]
    while (argv[1][i] != '\\0')
    {
        if (already_printed[(unsigned char)argv[1][i]] == 0)
        {
            write(1, &argv[1][i], 1);
            already_printed[(unsigned char)argv[1][i]] = 1;
        }
        i++;
    }
    
    // Imprimir caracteres únicos de argv[2]
    i = 0;
    while (argv[2][i] != '\\0')
    {
        if (already_printed[(unsigned char)argv[2][i]] == 0)
        {
            write(1, &argv[2][i], 1);
            already_printed[(unsigned char)argv[2][i]] = 1;
        }
        i++;
    }
    
    write(1, "\\n", 1);
    return 0;
}`} />
                      </div>
                    </div>
                  </CollapsibleSection>
                </div>
              </div>

              {/* Conceitos Chave */}
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
                  <Lightbulb className="size-5 text-warning" />
                  Conceitos-Chave para Memorizar
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="mb-2 font-semibold text-primary">{"Strings terminam com \\0"}</h3>
                    <p className="text-sm text-muted-foreground">{"\"ABC\" e guardado como ['A']['B']['C']['\\0']. Sempre procure por \\0 para saber onde termina!"}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="mb-2 font-semibold text-primary">Ponteiros apontam para enderecos</h3>
                    <p className="text-sm text-muted-foreground">int *ptr = &x; ptr aponta para x. *ptr = 10; muda o valor de x.</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="mb-2 font-semibold text-primary">Malloc aloca memoria</h3>
                    <p className="text-sm text-muted-foreground">char *str = malloc(10); Agora tem 10 bytes. Sempre faca free(str) quando terminar!</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="mb-2 font-semibold text-primary">ASCII e importante</h3>
                    <p className="text-sm text-muted-foreground">{"'0' = 48, '9' = 57, 'a' = 97, 'z' = 122, 'A' = 65, 'Z' = 90, ' ' = 32"}</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Resumo Rapido */}
          <TabsContent value="resumo" className="mt-0">
            <div className="flex flex-col gap-6">
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                <h3 className="flex items-center gap-2 font-semibold text-foreground">
                  <Zap className="size-5 text-primary" />
                  Para Quando Tiver Pressa
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Os 5 principais exercicios que voce DEVE dominar. Estude estes AGORA!
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border border-border bg-card p-4">
                  <h4 className="mb-2 font-semibold text-foreground">1. ft_strlen</h4>
                  <p className="mb-2 text-xs text-muted-foreground">Contar tamanho de string</p>
                  <p className="text-sm text-primary">{"Lembrete: \\0 marca o FIM da string sempre!"}</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                  <h4 className="mb-2 font-semibold text-foreground">2. ft_atoi</h4>
                  <p className="mb-2 text-xs text-muted-foreground">String para numero</p>
                  <p className="text-sm text-primary">{"Lembrete: char - '0' = numero! Ex: '5' - '0' = 5"}</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                  <h4 className="mb-2 font-semibold text-foreground">3. ft_split</h4>
                  <p className="mb-2 text-xs text-muted-foreground">Dividir string em palavras</p>
                  <p className="text-sm text-primary">Lembrete: Malloc 3x (array + cada palavra)</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                  <h4 className="mb-2 font-semibold text-foreground">4. ft_itoa</h4>
                  <p className="mb-2 text-xs text-muted-foreground">Numero para string</p>
                  <p className="text-sm text-primary">{"Lembrete: Extrai com %, converte com + '0'"}</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                  <h4 className="mb-2 font-semibold text-foreground">5. ft_range</h4>
                  <p className="mb-2 text-xs text-muted-foreground">Array de start ate end</p>
                  <p className="text-sm text-primary">Lembrete: Se start {'>'} end, vai para TRAS!</p>
                </div>
              </div>

              <div>
                <h3 className="mb-4 font-semibold text-foreground">Conceitos Que Aparecem Em TUDO</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="p-2 text-left font-semibold">Conceito</th>
                        <th className="p-2 text-left font-semibold">Uso</th>
                        <th className="p-2 text-left font-semibold">Exemplo</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border/50"><td className="p-2 font-mono text-xs">{"while (str[i] != '\\0')"}</td><td className="p-2">Iterar string</td><td className="p-2">ft_strlen</td></tr>
                      <tr className="border-b border-border/50"><td className="p-2 font-mono text-xs">ptr = malloc(size)</td><td className="p-2">Alocar memoria</td><td className="p-2">ft_split</td></tr>
                      <tr className="border-b border-border/50"><td className="p-2 font-mono text-xs">{"char - '0'"}</td><td className="p-2">Char para numero</td><td className="p-2">ft_atoi</td></tr>
                      <tr className="border-b border-border/50"><td className="p-2 font-mono text-xs">{"num + '0'"}</td><td className="p-2">Numero para char</td><td className="p-2">ft_itoa</td></tr>
                      <tr className="border-b border-border/50"><td className="p-2 font-mono text-xs">num % 10</td><td className="p-2">Ultimo digito</td><td className="p-2">ft_itoa</td></tr>
                      <tr className="border-b border-border/50"><td className="p-2 font-mono text-xs">num / 10</td><td className="p-2">Remove ultimo</td><td className="p-2">ft_itoa</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="mb-4 font-semibold text-foreground">Ordem de Estudo Recomendada</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">1</span>
                    <span className="text-sm">ft_strlen (5 min - a mais simples)</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">2</span>
                    <span className="text-sm">ft_atoi (20 min - importante)</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">3</span>
                    <span className="text-sm">ft_range (15 min - malloc basico)</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">4</span>
                    <span className="text-sm">ft_itoa (20 min - inverso de ft_atoi)</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">5</span>
                    <span className="text-sm">ft_split (30 min - a mais complexa)</span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">Total: ~1:30h de estudo intenso</p>
              </div>

              <div>
                <h3 className="mb-4 font-semibold text-foreground">Checklist do Exame</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  {[
                    "Li o subject 3 vezes",
                    "Entendi TODOS os exemplos",
                    "Testei com entrada vazia \"\"",
                    "Testei com numeros negativos",
                    "Testei com espacos multiplos",
                    "Codigo compilou sem warnings",
                    "Testei todos os casos do subject"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-card p-2">
                      <div className="size-4 rounded border border-primary/50" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Testes Praticos */}
          <TabsContent value="pratica" className="mt-0">
            <div className="flex flex-col gap-6">
              <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
                <h3 className="flex items-center gap-2 font-semibold text-foreground">
                  <Code2 className="size-5 text-accent" />
                  Exercicios Praticos de Memorizacao
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Tente responder sem olhar para o guia completo. Se errar, volte e estude o conceito.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="font-semibold text-foreground">Nivel 1: Basico (Responda rapido!)</h3>
                
                <CollapsibleSection title="Pergunta 1.1: O que e \\0?">
                  <p className="text-sm text-muted-foreground">
                    {"O caractere nulo. Marca o FINAL de uma string em C."}<br />
                    {"\"ABC\" = ['A']['B']['C']['\\0']"}
                  </p>
                </CollapsibleSection>

                <CollapsibleSection title="Pergunta 1.2: Como verificar se chegou no fim de uma string?">
                  <CodeBlock code={`if (str[i] == '\\0')  // Chegou no fim!
// ou
while (str[i] != '\\0')  // Enquanto nao for fim`} />
                </CollapsibleSection>

                <CollapsibleSection title="Pergunta 1.3: O que *ptr significa?">
                  <p className="text-sm text-muted-foreground">
                    "Acesse o valor que o ponteiro aponta"<br />
                    Se ptr aponta para x, entao *ptr e o valor de x.
                  </p>
                </CollapsibleSection>

                <CollapsibleSection title="Pergunta 1.4: Como saber quantos bytes alocar para strings?">
                  <CodeBlock code={`tamanho + 1   // +1 para o \\0

// Ex: "hello" tem 5 caracteres, preciso malloc(6)`} />
                </CollapsibleSection>

                <CollapsibleSection title="Pergunta 1.5: O que char - '0' faz?">
                  <p className="text-sm text-muted-foreground">
                    Converte um caractere numerico para numero inteiro!<br /><br />
                    '0' - '0' = 0<br />
                    '5' - '0' = 5<br />
                    '9' - '0' = 9
                  </p>
                </CollapsibleSection>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="font-semibold text-foreground">Nivel 2: ft_strlen (FUNDAMENTAL!)</h3>
                
                <CollapsibleSection title="Complete o codigo de ft_strlen">
                  <CodeBlock code={`int ft_strlen(char *str)
{
    int count = 0;
    while (str[count] != '\\0')  // <- Sempre procure pelo nulo!
        count++;
    return count;
}`} />
                </CollapsibleSection>

                <CollapsibleSection title='Qual é o resultado de ft_strlen("")?'>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-primary">0 (zero)!</strong><br /><br />
                    {"Uma string vazia é só: ['\\0']"}<br />
                    Nenhum caractere antes do nulo, então retorna 0.
                  </p>
                </CollapsibleSection>

                <CollapsibleSection title='Como você sabe que uma string termina?'>
                  <p className="text-sm text-muted-foreground">
                    Procure pelo caractere <strong className="text-primary">\\0</strong> (nulo).<br /><br />
                    {"\"ABC\" = ['A']['B']['C']['\\0']"}<br />
                    O \\0 marca o FINAL. Sempre procure por ele!
                  </p>
                </CollapsibleSection>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="font-semibold text-foreground">Nivel 3: ft_atoi (IMPORTANTE!)</h3>
                
                <CollapsibleSection title="Por que multiplicamos por 10 em ft_atoi?">
                  <p className="text-sm text-muted-foreground">
                    Para "empurrar" os digitos anteriores para a esquerda!<br /><br />
                    Se lemos "123":<br />
                    - Passo 1: result = 0, vejo '1' → result = 0 * 10 + 1 = 1<br />
                    - Passo 2: result = 1, vejo '2' → result = 1 * 10 + 2 = 12<br />
                    - Passo 3: result = 12, vejo '3' → result = 12 * 10 + 3 = 123
                  </p>
                </CollapsibleSection>

                <CollapsibleSection title='Qual e o resultado de ft_atoi("  -456")?'>
                  <p className="text-sm text-muted-foreground">
                    -456<br /><br />
                    Codigo precisa:<br />
                    1. Pular espacos (2 espacos)<br />
                    2. Ver '-' → lembrar que e negativo<br />
                    3. Converter "456"<br />
                    4. Aplicar sinal negativo
                  </p>
                </CollapsibleSection>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="font-semibold text-foreground">Teste Rapido: Verdadeiro ou Falso?</h3>
                
                <CollapsibleSection title="T/F: \\0 ocupa um espaco na string?">
                  <p className="text-sm text-primary font-semibold">VERDADEIRO</p>
                  <p className="text-sm text-muted-foreground">{"\"AB\" precisa de 3 bytes: 'A', 'B', '\\0'"}</p>
                </CollapsibleSection>

                <CollapsibleSection title='T/F: ft_strlen("A") retorna 2'>
                  <p className="text-sm text-destructive font-semibold">FALSO</p>
                  <p className="text-sm text-muted-foreground">{"Retorna 1. So conta as letras, nao o \\0"}</p>
                </CollapsibleSection>

                <CollapsibleSection title="T/F: ft_range(1, 1) retorna NULL">
                  <p className="text-sm text-destructive font-semibold">FALSO</p>
                  <p className="text-sm text-muted-foreground">Retorna um array com [1]. Mesmo que start == end, tem 1 elemento</p>
                </CollapsibleSection>

                <CollapsibleSection title='T/F: malloc sempre aloca na "heap" e precisa fazer free'>
                  <p className="text-sm text-primary font-semibold">VERDADEIRO</p>
                  <p className="text-sm text-muted-foreground">{"Se esquecer de fazer free, terá \"memory leak\" (vazamento de memória)! A memória fica ocupada para sempre."}</p>
                </CollapsibleSection>

                <CollapsibleSection title='Quantos bytes preciso alocar para a string "hello"?'>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-primary">6 bytes!</strong> (não 5)<br /><br />
                    - "hello" tem 5 caracteres<br />
                    - Mas precisa de +1 para o \\0<br />
                    - malloc(5 + 1) ou malloc(6)
                  </p>
                </CollapsibleSection>

                <CollapsibleSection title='O que significa ponteiro = NULL?'>
                  <p className="text-sm text-muted-foreground">
                    O ponteiro não aponta para nada. Não é alocado!<br /><br />
                    Sempre verificar antes de usar:<br />
                    <code className="text-xs bg-terminal/20 px-1 rounded">if (ptr == NULL) return;</code>
                  </p>
                </CollapsibleSection>
              </div>
            </div>
          </TabsContent>

          {/* Debugging */}
          <TabsContent value="debug" className="mt-0">
            <div className="flex flex-col gap-6">
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <h3 className="flex items-center gap-2 font-semibold text-foreground">
                  <Bug className="size-5 text-destructive" />
                  Guia de Debugging - Quando Algo Da Errado
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Problemas comuns e como resolve-los. Use printf liberalmente para debug!
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <CollapsibleSection title="Problema #1: Segmentation Fault (SIGSEGV)" defaultOpen>
                  <div className="flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground">
                      <strong>Causas possiveis:</strong>
                    </p>
                    <ul className="ml-4 list-disc text-sm text-muted-foreground">
                      <li>Acessando posicao que nao existe (str[10] quando so tem 3 chars)</li>
                      <li>Ponteiro NULL (char *str = NULL; str[0])</li>
                      <li>malloc retornou NULL e voce usou sem verificar</li>
                    </ul>
                    <p className="text-sm font-semibold text-foreground">Solucao:</p>
                    <CodeBlock code={`// Sempre verificar com \\0
while (str[i] != '\\0')

// Sempre verificar ponteiro
if (str == NULL)
    return;

// Sempre verificar malloc
char *buffer = malloc(100);
if (buffer == NULL)
    return NULL;`} />
                  </div>
                </CollapsibleSection>

                <CollapsibleSection title="Problema #2: Resultado errado (mas nao crash)">
                  <div className="flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground">
                      Ex: ft_strlen("ABC") retorna 5 em vez de 3
                    </p>
                    <p className="text-sm font-semibold text-foreground">Causas:</p>
                    <ul className="ml-4 list-disc text-sm text-muted-foreground">
                      <li>{"Esqueceu de \\0 na comparacao"}</li>
                      <li>Logica de loop errada (comecou em 1 em vez de 0)</li>
                      <li>Off-by-one error (erro de +1 ou -1)</li>
                    </ul>
                  </div>
                </CollapsibleSection>

                <CollapsibleSection title="Problema #3: ft_atoi nao funciona (sempre retorna 0)">
                  <div className="flex flex-col gap-4">
                    <p className="text-sm font-semibold text-foreground">Verificar:</p>
                    <ul className="ml-4 list-disc text-sm text-muted-foreground">
                      <li>Esta pulando espacos no inicio?</li>
                      <li>{"A validacao de digito esta correta? (>= '0' && <= '9')"}</li>
                      <li>Esta tratando o sinal negativo?</li>
                    </ul>
                    <p className="text-sm font-semibold text-foreground">Use printf para debug:</p>
                    <CodeBlock code={`int ft_atoi(const char *str)
{
    int i = 0;
    
    printf("Comecando com: '%c' (codigo %d)\\n", str[0], str[0]);
    
    // ... resto do codigo
}`} />
                  </div>
                </CollapsibleSection>

                <CollapsibleSection title="Problema #4: ft_split da Segmentation Fault">
                  <div className="flex flex-col gap-4">
                    <p className="text-sm font-semibold text-foreground">Checklist:</p>
                    <ul className="ml-4 list-disc text-sm text-muted-foreground">
                      <li>Fiz malloc para o array de ponteiros?</li>
                      <li>Fiz malloc para CADA palavra?</li>
                      <li>Coloquei NULL no final?</li>
                      <li>Estou iterando corretamente?</li>
                    </ul>
                  </div>
                </CollapsibleSection>

                <CollapsibleSection title="Problema #5: Memory Leak">
                  <div className="flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground">Programa fica mais lento com o tempo. Esqueceu de free!</p>
                    <p className="text-sm font-semibold text-foreground">Solucao:</p>
                    <CodeBlock code={`char **splits = ft_split("hello world");

// ... usar splits ...

// Liberar CADA string
int i = 0;
while (splits[i])
{
    free(splits[i]);
    i++;
}
// Liberar o array
free(splits);`} />
                  </div>
                </CollapsibleSection>
              </div>

              <div>
                <h3 className="mb-4 font-semibold text-foreground">Checklist: Antes de Submeter</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  {[
                    "Compilou sem warnings (gcc -Wall -Wextra ...)",
                    "Rodei todos os exemplos do subject",
                    "Testei com string vazia \"\"",
                    "Testei com numeros negativos",
                    "Testei com espacos multiplos",
                    "Rodei com valgrind (sem memory leaks)",
                    "Fiz free de todo malloc",
                    "Codigo esta legivel",
                    "Nao tem printf de debug (removido)",
                    "Nao tem variaveis nao usadas"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-card p-2">
                      <div className="size-4 rounded border border-primary/50" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Mapa Mental */}
          <TabsContent value="mapa" className="mt-0">
            <div className="flex flex-col gap-6">
              <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-4">
                <h3 className="flex items-center gap-2 font-semibold text-foreground">
                  <Brain className="size-5 text-purple-500" />
                  Mapa Mental - Conceitos Interconectados
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Visualize como os conceitos se conectam. Entender as relacoes ajuda a memorizar!
                </p>
              </div>

              <div>
                <h3 className="mb-4 font-semibold text-foreground">Arvore de Conhecimento</h3>
                <div className="rounded-lg bg-terminal p-4 font-mono text-xs text-terminal-foreground">
                  <pre className="whitespace-pre-wrap">{`                     EXAM02
                        |
                 _______|_______
                |       |      |
           BEM FACIL  MEDIO  MUITO DIFICIL
                |       |      |
           aff_a/z   inter   ft_split
           ft_swap   union   ft_itoa
           ft_strlen wdmatch ft_range
                     ft_atoi
                       |
              CONCEITOS BASE:
              - String = array + \\0
              - Ponteiros = enderecos
              - Loops = iterar dados
              - Malloc = memoria dinamica`}</pre>
                </div>
              </div>

              <div>
                <h3 className="mb-4 font-semibold text-foreground">Relacao Entre os 5 Principais</h3>
                <div className="rounded-lg bg-terminal p-4 font-mono text-xs text-terminal-foreground">
                  <pre className="whitespace-pre-wrap">{`ft_strlen  ->  Conta caracteres ate \\0
    |
    | (usado em)
    v
ft_split / ft_itoa  ->  Precisa saber tamanhos
    |
    | (usa conceito de)
    v
Loops + Strings
    |
    | (combinado com)
    v
ft_atoi / ft_range  ->  Conversao e alocacao
    |
    | (todos dependem de)
    v
Ponteiros + Malloc/Free
    |
    v
Validacao + Edge Cases (null, empty, negativo)`}</pre>
                </div>
              </div>

              <div>
                <h3 className="mb-4 font-semibold text-foreground">Receita para Cada Tipo</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h4 className="mb-2 font-semibold text-primary">String → Processamento</h4>
                    <ol className="ml-4 list-decimal text-sm text-muted-foreground">
                      <li>{"Iterar com while (str[i] != '\\0')"}</li>
                      <li>Fazer algo com str[i]</li>
                      <li>i++</li>
                      <li>Retornar resultado</li>
                    </ol>
                    <p className="mt-2 text-xs text-muted-foreground">Aplica em: aff_a, rev_print, ft_strlen, rot_13</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h4 className="mb-2 font-semibold text-primary">String → String (malloc)</h4>
                    <ol className="ml-4 list-decimal text-sm text-muted-foreground">
                      <li>Contar quantos bytes preciso</li>
                      <li>malloc(tamanho + 1)</li>
                      <li>Copiar dados</li>
                      <li>{"Colocar \\0 no final"}</li>
                      <li>Retornar ponteiro</li>
                    </ol>
                    <p className="mt-2 text-xs text-muted-foreground">Aplica em: ft_strrev, ft_itoa</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h4 className="mb-2 font-semibold text-primary">Numero → String (malloc)</h4>
                    <ol className="ml-4 list-decimal text-sm text-muted-foreground">
                      <li>Contar digitos</li>
                      <li>malloc(contagem + 1)</li>
                      <li>Preencher de tras para frente</li>
                      <li>Usar % para extrair digitos</li>
                      <li>{"Usar + '0' para converter"}</li>
                    </ol>
                    <p className="mt-2 text-xs text-muted-foreground">Aplica em: ft_itoa</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h4 className="mb-2 font-semibold text-primary">String → Array (malloc)</h4>
                    <ol className="ml-4 list-decimal text-sm text-muted-foreground">
                      <li>Contar quantos elementos</li>
                      <li>malloc(count + 1) para array</li>
                      <li>Para cada: malloc + copiar</li>
                      <li>Colocar NULL no final</li>
                      <li>Retornar ponteiro</li>
                    </ol>
                    <p className="mt-2 text-xs text-muted-foreground">Aplica em: ft_split</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 font-semibold text-foreground">Erros Mais Comuns (E Como Evitar)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="p-2 text-left font-semibold">Erro</th>
                        <th className="p-2 text-left font-semibold">Como Nao Cometer</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border/50"><td className="p-2">Segmentation Fault</td><td className="p-2">{"Sempre check != '\\0'"}</td></tr>
                      <tr className="border-b border-border/50"><td className="p-2">Overflow de array</td><td className="p-2">Nao acessar alem do size</td></tr>
                      <tr className="border-b border-border/50"><td className="p-2">Malloc nao verificado</td><td className="p-2">if (ptr == NULL)</td></tr>
                      <tr className="border-b border-border/50"><td className="p-2">{"Esquecer \\0 ao final"}</td><td className="p-2">Sempre result[len] = 0</td></tr>
                      <tr className="border-b border-border/50"><td className="p-2">Off-by-one</td><td className="p-2">Comecar em 0, end &lt; size</td></tr>
                      <tr className="border-b border-border/50"><td className="p-2">Memory leak</td><td className="p-2">free de cada malloc</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="mb-4 font-semibold text-foreground">Dica de Memorizacao</h3>
                <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
                  <p className="text-sm text-muted-foreground">
                    Coloque post-its em lugares importantes:<br /><br />
                    <strong>Espelho:</strong> {"\"while (str[i] != '\\0')\""}<br />
                    <strong>Gaveta:</strong> "malloc(tamanho + 1)"<br />
                    <strong>Tela PC:</strong> "free(ponteiro);"<br />
                    <strong>Parede:</strong> {"\"char - '0' = numero\""}<br />
                    <strong>Geladeira:</strong> "result = result * 10 + digit"<br /><br />
                    Todo dia que passar, voce le sem querer! Memoria espacada = aprendizado melhor.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Treino PRO - Plataforma de Estudos para 42 Sao Paulo
          </p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
              Inicio
            </Link>
            <Link href="/treinar" className="text-sm text-muted-foreground hover:text-primary">
              Praticar
            </Link>
            <a href="https://www.42sp.org.br/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary">
              42 SP
            </a>
          </div>
        </div>
      </footer>
    </div>
    </ExamAccessGate>
  )
}
