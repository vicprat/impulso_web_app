import type { FinancialEntryStatus, FinancialEntryType } from '@prisma/client'

// Tipos base para entidades financieras
export interface BankAccount {
  id: string
  name: string
  bankName?: string
  accountNo?: string
  clabe?: string
  initialBalance: number
  currentBalance: number
  createdAt: string
  updatedAt: string
}

export interface FinancialEntry {
  id: string
  type: 'INCOME' | 'EXPENSE'
  amount: number
  amountPaid: number
  currency: string
  description: string
  date: string
  eventId?: string
  source?: string
  sourceId?: string
  category?: string
  paymentMethod?: string
  relatedParty?: string
  status: 'PENDING' | 'PARTIALLY_PAID' | 'COMPLETED' | 'CANCELLED'
  dueDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
  bankAccountId?: string
  userId?: string
  bankAccount?: BankAccount
  user?: User
  event?: Event
}

// Tipos para usuarios del sistema financiero
export interface User {
  id: string
  email: string
  name?: string
  roles?: UserRole[]
}

export interface UserRole {
  id: string
  userId: string
  roleId: string
  assignedAt: string
  assignedBy?: string
  role: Role
}

export interface Role {
  id: string
  name: string
  description?: string
}

export interface Event {
  id: string
  name: string
  date?: string
}

// Tipos para reportes financieros
export interface IncomeStatement {
  totalIncome: number
  totalExpense: number
  netIncome: number
  incomeCount: number
  expenseCount: number
}

export interface CashFlow {
  inflows: number
  outflows: number
  netCashFlow: number
}

export interface BalanceSheet {
  assets: number
  liabilities: number
  equity: number
  bankAccounts: {
    name: string
    balance: number
  }[]
}

export interface GlobalSummary {
  balance: number
  totalIncome: number
  totalExpense: number
  accounts: {
    name: string
    balance: number
    initialBalance: number
  }[]
  statistics: {
    totalEntries: number
    pendingEntries: number
    completedEntries: number
  }
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface FinancialReportResponse {
  type: string
  data: IncomeStatement | CashFlow | BalanceSheet | GlobalSummary
  generatedAt: string
}

// Tipos para filtros y parámetros
export interface DateRange {
  startDate?: string
  endDate?: string
}

export interface FinancialEntryFilters extends DateRange {
  type?: FinancialEntryType
  status?: FinancialEntryStatus
  bankAccountId?: string
  userId?: string
  eventId?: string
  category?: string
}

export interface ReportFilters extends DateRange {
  bankAccountId?: string
  userId?: string
}

// Tipos para formularios
export interface CreateBankAccountData {
  name: string
  bankName?: string
  accountNo?: string
  clabe?: string
  initialBalance: number
}

export interface UpdateBankAccountData extends Partial<CreateBankAccountData> {
  currentBalance?: number
}

export interface CreateFinancialEntryData {
  type: 'INCOME' | 'EXPENSE'
  amount: number
  amountPaid?: number
  currency?: string
  description: string
  date?: string
  eventId?: string
  source?: string
  sourceId?: string
  category?: string
  paymentMethod?: string
  relatedParty?: string
  status?: 'PENDING' | 'PARTIALLY_PAID' | 'COMPLETED' | 'CANCELLED'
  dueDate?: string
  notes?: string
  bankAccountId?: string
  userId?: string
}

export type UpdateFinancialEntryData = Partial<CreateFinancialEntryData>

// Enums para tipos de reporte
export type ReportType = 'income-statement' | 'cash-flow' | 'balance-sheet' | 'global-summary'

// Tipos para estadísticas
export interface FinancialStatistics {
  totalEntries: number
  pendingEntries: number
  completedEntries: number
  totalIncome: number
  totalExpense: number
  balance: number
}
