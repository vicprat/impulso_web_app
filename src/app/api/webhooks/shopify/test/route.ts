import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const headers = Object.fromEntries(request.headers.entries())
    
    console.log('🧪 Test webhook recibido:')
    console.log('  - Headers:', JSON.stringify(headers, null, 2))
    console.log('  - Body:', `${body.substring(0, 500)  }...`)
    
    return NextResponse.json({
      bodyLength: body.length,
      headers,
      message: 'Test webhook received',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('❌ Error en test webhook:', error)
    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : 'Unknown error',
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test webhook endpoint is active',
    timestamp: new Date().toISOString(),
  })
} 