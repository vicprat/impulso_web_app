import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const headers = Object.fromEntries(request.headers.entries())
    
    console.log('🧪 Test webhook recibido:')
    console.log('  - Headers:', JSON.stringify(headers, null, 2))
    console.log('  - Body:', body.substring(0, 500) + '...')
    
    return NextResponse.json({
      message: 'Test webhook received',
      headers: headers,
      bodyLength: body.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('❌ Error en test webhook:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
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