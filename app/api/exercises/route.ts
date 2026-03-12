import { NextResponse } from 'next/server'

export interface Exercise {
  id: string
  name: string
  category: string
  difficulty: string
  description: string
  completed: boolean
  folder: string
  fileName: string
  template?: string
}

// Dados dos exercicios da Piscine 42
const EXERCISES: Exercise[] = [
  // C00
  {
    id: 'c00-ex00',
    name: 'ft_putchar',
    category: 'C00',
    difficulty: 'Facil',
    description: 'Escreva uma funcao que exiba o caractere passado como parametro.',
    completed: false,
    folder: 'c00/ex00',
    fileName: 'ft_putchar.c'
  },
  {
    id: 'c00-ex01',
    name: 'ft_print_alphabet',
    category: 'C00',
    difficulty: 'Facil',
    description: 'Escreva uma funcao que exiba o alfabeto em minusculas.',
    completed: false,
    folder: 'c00/ex01',
    fileName: 'ft_print_alphabet.c'
  },
  {
    id: 'c00-ex02',
    name: 'ft_print_reverse_alphabet',
    category: 'C00',
    difficulty: 'Facil',
    description: 'Escreva uma funcao que exiba o alfabeto em minusculas ao contrario.',
    completed: false,
    folder: 'c00/ex02',
    fileName: 'ft_print_reverse_alphabet.c'
  },
  {
    id: 'c00-ex03',
    name: 'ft_print_numbers',
    category: 'C00',
    difficulty: 'Facil',
    description: 'Escreva uma funcao que exiba todos os digitos de 0 a 9.',
    completed: false,
    folder: 'c00/ex03',
    fileName: 'ft_print_numbers.c'
  },
  {
    id: 'c00-ex04',
    name: 'ft_is_negative',
    category: 'C00',
    difficulty: 'Facil',
    description: 'Escreva uma funcao que exiba N ou P dependendo do sinal do numero.',
    completed: false,
    folder: 'c00/ex04',
    fileName: 'ft_is_negative.c'
  },
  // C01
  {
    id: 'c01-ex00',
    name: 'ft_ft',
    category: 'C01',
    difficulty: 'Facil',
    description: 'Escreva uma funcao que atribua 42 ao valor apontado por ponteiro.',
    completed: false,
    folder: 'c01/ex00',
    fileName: 'ft_ft.c'
  },
  {
    id: 'c01-ex01',
    name: 'ft_ultimate_ft',
    category: 'C01',
    difficulty: 'Medio',
    description: 'Escreva uma funcao que atribua 42 usando 9 niveis de ponteiros.',
    completed: false,
    folder: 'c01/ex01',
    fileName: 'ft_ultimate_ft.c'
  },
  {
    id: 'c01-ex02',
    name: 'ft_swap',
    category: 'C01',
    difficulty: 'Facil',
    description: 'Escreva uma funcao que troque os valores de dois inteiros.',
    completed: false,
    folder: 'c01/ex02',
    fileName: 'ft_swap.c'
  },
  {
    id: 'c01-ex03',
    name: 'ft_div_mod',
    category: 'C01',
    difficulty: 'Facil',
    description: 'Escreva uma funcao que calcule a divisao e o resto de dois numeros.',
    completed: false,
    folder: 'c01/ex03',
    fileName: 'ft_div_mod.c'
  },
  {
    id: 'c01-ex04',
    name: 'ft_ultimate_div_mod',
    category: 'C01',
    difficulty: 'Medio',
    description: 'Escreva uma funcao que calcule divisao e resto no proprio endereco.',
    completed: false,
    folder: 'c01/ex04',
    fileName: 'ft_ultimate_div_mod.c'
  },
  {
    id: 'c01-ex05',
    name: 'ft_putstr',
    category: 'C01',
    difficulty: 'Facil',
    description: 'Escreva uma funcao que exiba uma string.',
    completed: false,
    folder: 'c01/ex05',
    fileName: 'ft_putstr.c'
  },
  {
    id: 'c01-ex06',
    name: 'ft_strlen',
    category: 'C01',
    difficulty: 'Facil',
    description: 'Escreva uma funcao que retorne o tamanho de uma string.',
    completed: false,
    folder: 'c01/ex06',
    fileName: 'ft_strlen.c'
  },
  {
    id: 'c01-ex07',
    name: 'ft_rev_int_tab',
    category: 'C01',
    difficulty: 'Medio',
    description: 'Escreva uma funcao que inverta um array de inteiros.',
    completed: false,
    folder: 'c01/ex07',
    fileName: 'ft_rev_int_tab.c'
  },
  {
    id: 'c01-ex08',
    name: 'ft_sort_int_tab',
    category: 'C01',
    difficulty: 'Medio',
    description: 'Escreva uma funcao que ordene um array de inteiros em ordem crescente.',
    completed: false,
    folder: 'c01/ex08',
    fileName: 'ft_sort_int_tab.c'
  },
  // C02
  {
    id: 'c02-ex00',
    name: 'ft_strcpy',
    category: 'C02',
    difficulty: 'Facil',
    description: 'Reproduza a funcao strcpy da libc.',
    completed: false,
    folder: 'c02/ex00',
    fileName: 'ft_strcpy.c'
  },
  {
    id: 'c02-ex01',
    name: 'ft_strncpy',
    category: 'C02',
    difficulty: 'Facil',
    description: 'Reproduza a funcao strncpy da libc.',
    completed: false,
    folder: 'c02/ex01',
    fileName: 'ft_strncpy.c'
  },
  {
    id: 'c02-ex02',
    name: 'ft_str_is_alpha',
    category: 'C02',
    difficulty: 'Facil',
    description: 'Escreva uma funcao que retorne 1 se a string contiver apenas letras.',
    completed: false,
    folder: 'c02/ex02',
    fileName: 'ft_str_is_alpha.c'
  },
  {
    id: 'c02-ex03',
    name: 'ft_str_is_numeric',
    category: 'C02',
    difficulty: 'Facil',
    description: 'Escreva uma funcao que retorne 1 se a string contiver apenas digitos.',
    completed: false,
    folder: 'c02/ex03',
    fileName: 'ft_str_is_numeric.c'
  },
  {
    id: 'c02-ex04',
    name: 'ft_str_is_lowercase',
    category: 'C02',
    difficulty: 'Facil',
    description: 'Escreva uma funcao que retorne 1 se a string contiver apenas minusculas.',
    completed: false,
    folder: 'c02/ex04',
    fileName: 'ft_str_is_lowercase.c'
  },
  {
    id: 'c02-ex05',
    name: 'ft_str_is_uppercase',
    category: 'C02',
    difficulty: 'Facil',
    description: 'Escreva uma funcao que retorne 1 se a string contiver apenas maiusculas.',
    completed: false,
    folder: 'c02/ex05',
    fileName: 'ft_str_is_uppercase.c'
  },
  // C03
  {
    id: 'c03-ex00',
    name: 'ft_strcmp',
    category: 'C03',
    difficulty: 'Facil',
    description: 'Reproduza a funcao strcmp da libc.',
    completed: false,
    folder: 'c03/ex00',
    fileName: 'ft_strcmp.c'
  },
  {
    id: 'c03-ex01',
    name: 'ft_strncmp',
    category: 'C03',
    difficulty: 'Facil',
    description: 'Reproduza a funcao strncmp da libc.',
    completed: false,
    folder: 'c03/ex01',
    fileName: 'ft_strncmp.c'
  },
  {
    id: 'c03-ex02',
    name: 'ft_strcat',
    category: 'C03',
    difficulty: 'Medio',
    description: 'Reproduza a funcao strcat da libc.',
    completed: false,
    folder: 'c03/ex02',
    fileName: 'ft_strcat.c'
  },
  {
    id: 'c03-ex03',
    name: 'ft_strncat',
    category: 'C03',
    difficulty: 'Medio',
    description: 'Reproduza a funcao strncat da libc.',
    completed: false,
    folder: 'c03/ex03',
    fileName: 'ft_strncat.c'
  },
  {
    id: 'c03-ex04',
    name: 'ft_strstr',
    category: 'C03',
    difficulty: 'Medio',
    description: 'Reproduza a funcao strstr da libc.',
    completed: false,
    folder: 'c03/ex04',
    fileName: 'ft_strstr.c'
  },
  {
    id: 'c03-ex05',
    name: 'ft_strlcat',
    category: 'C03',
    difficulty: 'Dificil',
    description: 'Reproduza a funcao strlcat.',
    completed: false,
    folder: 'c03/ex05',
    fileName: 'ft_strlcat.c'
  },
  // Shell00
  {
    id: 'sh00-ex00',
    name: 'z',
    category: 'Shell00',
    difficulty: 'Facil',
    description: 'Crie um arquivo z com permissoes especificas.',
    completed: false,
    folder: 'shell00/ex00',
    fileName: 'z'
  },
  {
    id: 'sh00-ex01',
    name: 'testShell00',
    category: 'Shell00',
    difficulty: 'Facil',
    description: 'Crie um arquivo testShell00 com data especifica.',
    completed: false,
    folder: 'shell00/ex01',
    fileName: 'testShell00'
  },
  {
    id: 'sh00-ex02',
    name: 'list_files',
    category: 'Shell00',
    difficulty: 'Medio',
    description: 'Crie um script que liste arquivos de forma especifica.',
    completed: false,
    folder: 'shell00/ex02',
    fileName: 'list_files.sh'
  }
]

export async function GET() {
  return NextResponse.json({ 
    exercises: EXERCISES,
    total: EXERCISES.length 
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { category } = body
    
    const filtered = category 
      ? EXERCISES.filter(ex => ex.category === category)
      : EXERCISES
    
    return NextResponse.json({ 
      exercises: filtered,
      total: filtered.length 
    })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
