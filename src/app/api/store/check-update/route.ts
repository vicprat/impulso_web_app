import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { lastUpdate } = await request.json()

    if (!lastUpdate) {
      return NextResponse.json({ error: 'lastUpdate is required' }, { status: 400 })
    }

    // Por ahora, siempre retornar que no hay actualizaciones
    // En el futuro, podríamos implementar una lógica más sofisticada
    // para detectar cambios en productos, inventario, etc.
    return NextResponse.json({
      hasUpdates: false,
      lastUpdate: Date.now(),
      message: 'Store update check completed',
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
} 