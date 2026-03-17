import { NextResponse } from 'next/server';

export async function GET() {
  // Redireciona para o arquivo estático na pasta public
  const vsixUrl = '/treino-pro-1.3.2.vsix'
  return NextResponse.redirect(new URL(vsixUrl, process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
}
