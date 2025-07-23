import { type NextRequest, NextResponse } from 'next/server'

import { requirePermission } from '@/modules/auth/server/server'
import {
  getBalanceSheet,
  getCashFlow,
  getGlobalSummary,
  getIncomeStatement,
} from '@/modules/finance/service'
import { PERMISSIONS } from '@/src/config/Permissions'

export async function GET(request: NextRequest) {
  try {
    await requirePermission(PERMISSIONS.VIEW_FINANCE_REPORTS)

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Validar tipo de reporte
    if (!type) {
      return NextResponse.json({ error: 'Tipo de reporte requerido' }, { status: 400 })
    }

    const params = {
      endDate: endDate || undefined,
      startDate: startDate || undefined,
    }

    switch (type) {
      case 'income-statement': {
        const incomeStatement = await getIncomeStatement(params)
        return NextResponse.json({
          data: incomeStatement,
          generatedAt: new Date().toISOString(),
          type,
        })
      }
      case 'cash-flow': {
        const cashFlow = await getCashFlow(params)
        return NextResponse.json({
          data: cashFlow,
          generatedAt: new Date().toISOString(),
          type,
        })
      }
      case 'balance-sheet': {
        const balanceSheet = await getBalanceSheet(params)
        return NextResponse.json({
          data: balanceSheet,
          generatedAt: new Date().toISOString(),
          type,
        })
      }
      case 'global-summary': {
        const globalSummary = await getGlobalSummary(params)
        return NextResponse.json({
          data: globalSummary,
          generatedAt: new Date().toISOString(),
          type,
        })
      }
      default:
        return NextResponse.json(
          {
            error:
              'Tipo de reporte no soportado. Tipos válidos: income-statement, cash-flow, balance-sheet, global-summary',
          },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error generating financial report:', error)

    if (error instanceof Error) {
      if (error.message.includes('Start date cannot be after end date')) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    return NextResponse.json(
      {
        error: 'Error interno del servidor al generar el reporte',
      },
      { status: 500 }
    )
  }
}
