import { NextResponse } from 'next/server'

const HINTS: Record<string, string[]> = {
  'c00-ex00': [
    'Use a funcao write() para escrever um caractere.',
    'A assinatura de write: write(fd, buffer, count)',
    'Para stdout, use fd = 1',
    'Lembre-se: voce precisa passar o endereco do caractere, nao o caractere em si.'
  ],
  'c00-ex01': [
    'Use um loop de a ate z.',
    'O caractere a tem valor ASCII 97 e z tem 122.',
    'Incremente a variavel de controle ate chegar em z.',
    'Use ft_putchar para exibir cada letra.'
  ],
  'c00-ex02': [
    'Similar ao ex01, mas comece de z e va ate a.',
    'Use um loop decrementando a variavel.',
    'z = 122, a = 97 em ASCII.'
  ],
  'c00-ex03': [
    'Use um loop de 0 ate 9.',
    'O caractere 0 tem valor ASCII 48.',
    'Incremente ate chegar em 9 (ASCII 57).'
  ],
  'c00-ex04': [
    'Verifique se n < 0 para saber se e negativo.',
    'Se n < 0, exiba N. Caso contrario, exiba P.',
    '0 e considerado positivo neste exercicio.'
  ],
  'c01-ex00': [
    'Lembre-se: *p = 42 atribui 42 ao valor apontado por p.',
    'O parametro e int *nbr, entao *nbr acessa o valor.',
    'Simplesmente faca: *nbr = 42;'
  ],
  'c01-ex01': [
    'Cada * adicional dereferencia um nivel do ponteiro.',
    'Para int *********nbr, use 9 asteriscos: *********nbr = 42;',
    'Isso acessa o valor final atraves de 9 niveis de indireção.'
  ],
  'c01-ex02': [
    'Crie uma variavel temporaria para guardar um dos valores.',
    'Primeiro: tmp = *a (salva o valor de a)',
    'Depois: *a = *b (copia b para a)',
    'Por fim: *b = tmp (copia o valor original de a para b)'
  ],
  'c01-ex03': [
    'Divisao inteira: *div = a / b',
    'Resto (modulo): *mod = a % b',
    'Cuidado com a ordem dos parametros!'
  ],
  'c01-ex04': [
    'Similar ao ex03, mas os resultados ficam nos proprios parametros.',
    'Guarde *a em uma variavel temporaria primeiro.',
    '*a = tmp / *b e *b = tmp % *b'
  ],
  'c01-ex05': [
    'Use um loop while para percorrer a string.',
    'Pare quando encontrar o caractere nulo (\\0).',
    'Use ft_putchar ou write para cada caractere.'
  ],
  'c01-ex06': [
    'Percorra a string ate encontrar \\0.',
    'Conte quantos caracteres foram percorridos.',
    'Use um contador: int i = 0; while(str[i]) i++;',
    'Retorne o valor do contador.'
  ],
  'c02-ex00': [
    'strcpy copia src para dest, incluindo o \\0.',
    'Use um loop: while(src[i]) { dest[i] = src[i]; i++; }',
    'Nao esqueca de copiar o \\0 no final!',
    'Retorne dest.'
  ],
  'c02-ex01': [
    'strncpy copia ate n caracteres.',
    'Se src tiver menos que n, preencha dest com \\0.',
    'Nao adicione \\0 se n caracteres foram copiados.'
  ],
  'c03-ex00': [
    'strcmp compara duas strings caractere por caractere.',
    'Retorne a diferenca do primeiro caractere diferente.',
    'Se forem iguais, retorne 0.'
  ],
  'c03-ex02': [
    'strcat concatena src ao final de dest.',
    'Primeiro, encontre o final de dest (o \\0).',
    'Depois, copie src a partir dali.',
    'Retorne dest.'
  ]
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  const exerciseHints = HINTS[id]
  
  if (!exerciseHints || exerciseHints.length === 0) {
    return NextResponse.json({
      hint: 'Nenhuma dica disponivel para este exercicio. Consulte o subject ou pergunte a um colega!'
    })
  }
  
  // Retorna uma dica aleatoria
  const randomHint = exerciseHints[Math.floor(Math.random() * exerciseHints.length)]
  
  return NextResponse.json({
    hint: randomHint,
    totalHints: exerciseHints.length
  })
}
