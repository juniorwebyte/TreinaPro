import { NextResponse } from 'next/server'

export interface ProgressStats {
  totalExercises: number
  completedExercises: number
  totalPoints: number
  streak: number
  level: string
}

function calculateLevel(points: number): string {
  if (points >= 5000) return 'Mestre'
  if (points >= 3000) return 'Avancado'
  if (points >= 1500) return 'Intermediario'
  if (points >= 500) return 'Aprendiz'
  return 'Iniciante'
}

export async function GET() {
  // Em producao, isso viria do banco de dados com base no usuario autenticado
  // Por enquanto, retornamos dados de exemplo
  const progress: ProgressStats = {
    totalExercises: 50,
    completedExercises: 0,
    totalPoints: 0,
    streak: 0,
    level: 'Iniciante'
  }
  
  return NextResponse.json({ progress })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { exerciseId, score, completed } = body
    
    // Em producao, atualizaria o banco de dados
    // Calcula o novo nivel baseado nos pontos
    const newPoints = body.totalPoints || 0
    const level = calculateLevel(newPoints)
    
    return NextResponse.json({
      success: true,
      exerciseId,
      score,
      completed,
      level,
      message: 'Progresso atualizado com sucesso'
    })
  } catch {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
