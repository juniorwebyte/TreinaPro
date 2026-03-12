import { NextResponse } from 'next/server'

interface SubmitRequest {
  exerciseId: string
  content: string
  timestamp: string
}

interface SubmitResult {
  success: boolean
  score: number
  feedback: string
  norminettePass: boolean
  testsPass: boolean
  errors: string[]
}

// Verificacao basica de norminette
function checkNorminette(content: string): { pass: boolean; errors: string[] } {
  const errors: string[] = []
  const lines = content.split('\n')
  
  // Verificar header da 42
  if (!content.includes('/* ****')) {
    errors.push('Header da 42 ausente ou invalido')
  }
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1
    
    // Linha muito longa (max 80 caracteres)
    if (line.length > 80) {
      errors.push(`Linha ${lineNum}: muito longa (${line.length} caracteres, max 80)`)
    }
    
    // Espaco no final da linha
    if (line.match(/\s+$/)) {
      errors.push(`Linha ${lineNum}: espaco antes da quebra de linha`)
    }
    
    // Verificar tabs vs espacos para indentacao
    if (line.match(/^ +\S/) && !line.match(/^\t/)) {
      errors.push(`Linha ${lineNum}: use tabs em vez de espacos para indentacao`)
    }
  }
  
  // Verificar numero de funcoes (max 5 por arquivo)
  const funcMatches = content.match(/^[a-z_]+\s+[a-z_]+\s*\(/gm)
  if (funcMatches && funcMatches.length > 5) {
    errors.push(`Arquivo com ${funcMatches.length} funcoes (max 5)`)
  }
  
  return {
    pass: errors.length === 0,
    errors: errors.slice(0, 5) // Limita a 5 erros
  }
}

// Verificacao basica de implementacao
function checkImplementation(exerciseId: string, content: string): { pass: boolean; feedback: string } {
  const checks: Record<string, (content: string) => boolean> = {
    'c00-ex00': (c) => c.includes('write') && c.includes('ft_putchar'),
    'c00-ex01': (c) => c.includes('ft_print_alphabet') && (c.includes('while') || c.includes('for')),
    'c00-ex02': (c) => c.includes('ft_print_reverse_alphabet'),
    'c00-ex03': (c) => c.includes('ft_print_numbers'),
    'c00-ex04': (c) => c.includes('ft_is_negative') && c.includes('if'),
    'c01-ex00': (c) => c.includes('*nbr') && c.includes('42'),
    'c01-ex01': (c) => c.includes('*********') && c.includes('42'),
    'c01-ex02': (c) => c.includes('ft_swap') && c.includes('tmp') || c.includes('temp'),
    'c01-ex05': (c) => c.includes('ft_putstr') && c.includes('while'),
    'c01-ex06': (c) => c.includes('ft_strlen') && c.includes('return'),
    'c02-ex00': (c) => c.includes('ft_strcpy') && c.includes('while'),
    'c03-ex00': (c) => c.includes('ft_strcmp') && c.includes('return')
  }
  
  const check = checks[exerciseId]
  if (!check) {
    return { pass: true, feedback: 'Exercicio enviado. Verifique manualmente.' }
  }
  
  const pass = check(content)
  return {
    pass,
    feedback: pass 
      ? 'Implementacao parece correta! Verifique se todos os testes passam.'
      : 'Implementacao pode estar incompleta. Verifique o subject novamente.'
  }
}

export async function POST(request: Request) {
  try {
    const body: SubmitRequest = await request.json()
    const { exerciseId, content, timestamp } = body
    
    if (!exerciseId || !content) {
      return NextResponse.json(
        { success: false, error: 'exerciseId e content sao obrigatorios' },
        { status: 400 }
      )
    }
    
    // Verificar norminette
    const norminetteResult = checkNorminette(content)
    
    // Verificar implementacao
    const implementationResult = checkImplementation(exerciseId, content)
    
    // Calcular score
    let score = 0
    if (norminetteResult.pass) score += 30 // 30 pontos por passar na norminette
    if (implementationResult.pass) score += 70 // 70 pontos pela implementacao
    
    const result: SubmitResult = {
      success: true,
      score,
      feedback: implementationResult.feedback,
      norminettePass: norminetteResult.pass,
      testsPass: implementationResult.pass,
      errors: norminetteResult.errors
    }
    
    // Log para debug
    console.log(`[API Submit] Exercise: ${exerciseId}, Score: ${score}, Time: ${timestamp}`)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('[API Submit] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao processar submissao' },
      { status: 500 }
    )
  }
}
