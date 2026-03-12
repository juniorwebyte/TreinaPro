import { NextResponse } from 'next/server'

// Templates para cada exercicio
const TEMPLATES: Record<string, string> = {
  'ft_putchar': `/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ft_putchar.c                                       :+:      :+:    :+:   */
/*                                                                            */
/*   By: marvin <marvin@student.42.fr>              +#+  +:+       +#+        */
/*                                                                            */
/*   Created: 2026/03/12 00:00:00 by marvin            #+#    #+#             */
/*   Updated: 2026/03/12 00:00:00 by marvin           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include <unistd.h>

void	ft_putchar(char c)
{
	// Sua implementacao aqui
}
`,
  'ft_print_alphabet': `/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ft_print_alphabet.c                                :+:      :+:    :+:   */
/*                                                                            */
/*   By: marvin <marvin@student.42.fr>              +#+  +:+       +#+        */
/*                                                                            */
/*   Created: 2026/03/12 00:00:00 by marvin            #+#    #+#             */
/*   Updated: 2026/03/12 00:00:00 by marvin           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include <unistd.h>

void	ft_print_alphabet(void)
{
	// Sua implementacao aqui
}
`,
  'ft_swap': `/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ft_swap.c                                          :+:      :+:    :+:   */
/*                                                                            */
/*   By: marvin <marvin@student.42.fr>              +#+  +:+       +#+        */
/*                                                                            */
/*   Created: 2026/03/12 00:00:00 by marvin            #+#    #+#             */
/*   Updated: 2026/03/12 00:00:00 by marvin           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

void	ft_swap(int *a, int *b)
{
	// Sua implementacao aqui
}
`,
  'ft_strlen': `/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ft_strlen.c                                        :+:      :+:    :+:   */
/*                                                                            */
/*   By: marvin <marvin@student.42.fr>              +#+  +:+       +#+        */
/*                                                                            */
/*   Created: 2026/03/12 00:00:00 by marvin            #+#    #+#             */
/*   Updated: 2026/03/12 00:00:00 by marvin           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

int	ft_strlen(char *str)
{
	// Sua implementacao aqui
	return (0);
}
`
}

const HINTS: Record<string, string[]> = {
  'c00-ex00': [
    'Use a funcao write() para escrever um caractere.',
    'A assinatura de write: write(fd, buffer, count)',
    'Para stdout, use fd = 1'
  ],
  'c00-ex01': [
    'Use um loop de a ate z.',
    'O caractere a tem valor ASCII 97.',
    'Incremente a variavel de controle ate chegar em z (122).'
  ],
  'c01-ex02': [
    'Crie uma variavel temporaria para guardar um dos valores.',
    'Primeiro: temp = *a',
    'Depois: *a = *b e *b = temp'
  ],
  'c01-ex06': [
    'Percorra a string ate encontrar o caractere nulo \\0.',
    'Use um contador para contar quantos caracteres foram percorridos.',
    'Retorne o contador no final.'
  ]
}

// Exercicios inline para busca por ID
const EXERCISES = [
  { id: 'c00-ex00', name: 'ft_putchar', category: 'C00', difficulty: 'Facil', folder: 'c00/ex00', fileName: 'ft_putchar.c' },
  { id: 'c00-ex01', name: 'ft_print_alphabet', category: 'C00', difficulty: 'Facil', folder: 'c00/ex01', fileName: 'ft_print_alphabet.c' },
  { id: 'c01-ex02', name: 'ft_swap', category: 'C01', difficulty: 'Facil', folder: 'c01/ex02', fileName: 'ft_swap.c' },
  { id: 'c01-ex06', name: 'ft_strlen', category: 'C01', difficulty: 'Facil', folder: 'c01/ex06', fileName: 'ft_strlen.c' }
]

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  const exercise = EXERCISES.find(ex => ex.id === id)
  
  if (!exercise) {
    return NextResponse.json(
      { error: 'Exercise not found' },
      { status: 404 }
    )
  }
  
  const template = TEMPLATES[exercise.name] || generateDefaultTemplate(exercise.fileName)
  const hints = HINTS[id] || ['Nenhuma dica disponivel para este exercicio.']
  
  return NextResponse.json({
    exercise: {
      ...exercise,
      template,
      hints
    }
  })
}

function generateDefaultTemplate(fileName: string): string {
  return `/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ${fileName.padEnd(51)}:+:      :+:    :+:   */
/*                                                                            */
/*   By: marvin <marvin@student.42.fr>              +#+  +:+       +#+        */
/*                                                                            */
/*   Created: 2026/03/12 00:00:00 by marvin            #+#    #+#             */
/*   Updated: 2026/03/12 00:00:00 by marvin           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// Sua implementacao aqui
`
}
