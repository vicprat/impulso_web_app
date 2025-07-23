import { type Prisma, FinancialEntryType } from '@prisma/client'

import { prisma } from '@/lib/prisma'

export const getFinancialEntries = async (params: {
  startDate?: string
  endDate?: string
  type?: 'income' | 'expense'
  category?: string
  search?: string
}) => {
  const { category, endDate, search, startDate, type } = params

  // Validación de parámetros
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw new Error('Start date cannot be after end date')
  }

  const where: Prisma.FinancialEntryWhereInput = {}

  if (startDate || endDate) {
    const dateFilter: Prisma.DateTimeFilter = {}
    if (startDate) dateFilter.gte = new Date(startDate)
    if (endDate) dateFilter.lte = new Date(endDate)
    where.date = dateFilter
  }

  if (type) {
    where.type = type === 'income' ? FinancialEntryType.INCOME : FinancialEntryType.EXPENSE
  }

  if (category) {
    where.category = category
  }

  if (search) {
    where.OR = [
      { description: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } },
    ]
  }

  return prisma.financialEntry.findMany({
    include: {
      bankAccount: true,
      user: true,
    },
    orderBy: {
      date: 'desc',
    },
    where,
  })
}

export const getFinancialSummary = async (params: { startDate?: string; endDate?: string }) => {
  const { endDate, startDate } = params

  // Validación de parámetros
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw new Error('Start date cannot be after end date')
  }

  const where: Prisma.FinancialEntryWhereInput = {}

  if (startDate || endDate) {
    const dateFilter: Prisma.DateTimeFilter = {}
    if (startDate) dateFilter.gte = new Date(startDate)
    if (endDate) dateFilter.lte = new Date(endDate)
    where.date = dateFilter
  }

  // Usar agregaciones de Prisma para optimizar la consulta
  const summary = await prisma.financialEntry.groupBy({
    _sum: { amount: true },
    by: ['type'],
    where,
  })

  const totalIncome =
    summary.find((s) => s.type === FinancialEntryType.INCOME)?._sum.amount?.toNumber() || 0
  const totalExpense =
    summary.find((s) => s.type === FinancialEntryType.EXPENSE)?._sum.amount?.toNumber() || 0
  const balance = totalIncome - totalExpense

  return {
    balance,
    totalExpense,
    totalIncome,
  }
}

export const getIncomeStatement = async (params: { startDate?: string; endDate?: string }) => {
  const { endDate, startDate } = params

  // Validación de parámetros
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw new Error('Start date cannot be after end date')
  }

  const where: Prisma.FinancialEntryWhereInput = {}

  if (startDate || endDate) {
    const dateFilter: Prisma.DateTimeFilter = {}
    if (startDate) dateFilter.gte = new Date(startDate)
    if (endDate) dateFilter.lte = new Date(endDate)
    where.date = dateFilter
  }

  // Agrupar por mes y tipo
  const monthlyData = await prisma.financialEntry.groupBy({
    _count: true,
    _sum: { amount: true },
    by: ['type'],
    where,
  })

  const totalIncome =
    monthlyData.find((s) => s.type === FinancialEntryType.INCOME)?._sum.amount?.toNumber() || 0
  const totalExpense =
    monthlyData.find((s) => s.type === FinancialEntryType.EXPENSE)?._sum.amount?.toNumber() || 0
  const netIncome = totalIncome - totalExpense

  return {
    expenseCount: monthlyData.find((s) => s.type === FinancialEntryType.EXPENSE)?._count || 0,
    incomeCount: monthlyData.find((s) => s.type === FinancialEntryType.INCOME)?._count || 0,
    netIncome,
    totalExpense,
    totalIncome,
  }
}

export const getCashFlow = async (params: { startDate?: string; endDate?: string }) => {
  const { endDate, startDate } = params

  // Validación de parámetros
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw new Error('Start date cannot be after end date')
  }

  const where: Prisma.FinancialEntryWhereInput = {}

  if (startDate || endDate) {
    const dateFilter: Prisma.DateTimeFilter = {}
    if (startDate) dateFilter.gte = new Date(startDate)
    if (endDate) dateFilter.lte = new Date(endDate)
    where.date = dateFilter
  }

  // Agrupar por tipo para calcular entradas y salidas
  const cashFlowData = await prisma.financialEntry.groupBy({
    _sum: { amount: true },
    by: ['type'],
    where,
  })

  const inflows =
    cashFlowData.find((s) => s.type === FinancialEntryType.INCOME)?._sum.amount?.toNumber() || 0
  const outflows =
    cashFlowData.find((s) => s.type === FinancialEntryType.EXPENSE)?._sum.amount?.toNumber() || 0
  const netCashFlow = inflows - outflows

  return {
    inflows,
    netCashFlow,
    outflows,
  }
}

export const getBalanceSheet = async (params: { startDate?: string; endDate?: string }) => {
  const { endDate, startDate } = params

  // Validación de parámetros
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw new Error('Start date cannot be after end date')
  }

  // Obtener saldos de cuentas bancarias
  const bankAccounts = await prisma.bankAccount.findMany()
  const totalAssets = bankAccounts.reduce(
    (sum, account) => sum + account.currentBalance.toNumber(),
    0
  )

  // Obtener movimientos pendientes (pasivos)
  const where: Prisma.FinancialEntryWhereInput = {}
  if (startDate || endDate) {
    const dateFilter: Prisma.DateTimeFilter = {}
    if (startDate) dateFilter.gte = new Date(startDate)
    if (endDate) dateFilter.lte = new Date(endDate)
    where.date = dateFilter
  }

  const pendingEntries = await prisma.financialEntry.findMany({
    where: {
      ...where,
      status: 'PENDING',
    },
  })

  const totalLiabilities = pendingEntries.reduce((sum, entry) => {
    const pendingAmount = entry.amount.toNumber() - entry.amountPaid.toNumber()
    return sum + pendingAmount
  }, 0)

  const equity = totalAssets - totalLiabilities

  return {
    assets: totalAssets,
    bankAccounts: bankAccounts.map((account) => ({
      balance: account.currentBalance.toNumber(),
      name: account.name,
    })),
    equity,
    liabilities: totalLiabilities,
  }
}

export const getGlobalSummary = async (params: { startDate?: string; endDate?: string }) => {
  const { endDate, startDate } = params

  // Validación de parámetros
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw new Error('Start date cannot be after end date')
  }

  // Obtener resumen financiero
  const financialSummary = await getFinancialSummary({ endDate, startDate })

  // Obtener saldos de cuentas
  const bankAccounts = await prisma.bankAccount.findMany()

  // Obtener estadísticas de movimientos
  const where: Prisma.FinancialEntryWhereInput = {}
  if (startDate || endDate) {
    const dateFilter: Prisma.DateTimeFilter = {}
    if (startDate) dateFilter.gte = new Date(startDate)
    if (endDate) dateFilter.lte = new Date(endDate)
    where.date = dateFilter
  }

  const entryStats = await prisma.financialEntry.groupBy({
    _count: true,
    _sum: { amount: true },
    by: ['type', 'status'],
    where,
  })

  return {
    ...financialSummary,
    accounts: bankAccounts.map((account) => ({
      balance: account.currentBalance.toNumber(),
      initialBalance: account.initialBalance.toNumber(),
      name: account.name,
    })),
    statistics: {
      completedEntries: entryStats
        .filter((s) => s.status === 'COMPLETED')
        .reduce((sum, stat) => sum + stat._count, 0),
      pendingEntries: entryStats
        .filter((s) => s.status === 'PENDING')
        .reduce((sum, stat) => sum + stat._count, 0),
      totalEntries: entryStats.reduce((sum, stat) => sum + stat._count, 0),
    },
  }
}
