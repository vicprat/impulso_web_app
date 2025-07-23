import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { financeApi } from './api'
import {
  type CreateBankAccountData,
  type CreateFinancialEntryData,
  type FinancialEntryFilters,
  type ReportFilters,
  type ReportType,
  type UpdateBankAccountData,
  type UpdateFinancialEntryData,
  type User,
} from './types'

// ===== CUENTAS BANCARIAS =====
export const useBankAccounts = () => {
  return useQuery({
    queryFn: () => financeApi.bankAccounts.getAll(),
    queryKey: ['bank-accounts'],
  })
}

export const useBankAccount = (id: string) => {
  return useQuery({
    enabled: !!id,
    queryFn: () => financeApi.bankAccounts.getById(id),
    queryKey: ['bank-accounts', id],
  })
}

export const useCreateBankAccount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBankAccountData) => financeApi.bankAccounts.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] })
    },
  })
}

export const useUpdateBankAccount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ data, id }: { id: string; data: UpdateBankAccountData }) =>
      financeApi.bankAccounts.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] })
      queryClient.invalidateQueries({ queryKey: ['bank-accounts', id] })
    },
  })
}

export const useDeleteBankAccount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => financeApi.bankAccounts.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] })
    },
  })
}

// ===== MOVIMIENTOS FINANCIEROS =====
export const useFinancialEntries = (filters?: FinancialEntryFilters) => {
  return useQuery({
    queryFn: () => financeApi.entries.getAll(filters),
    queryKey: ['financial-entries', filters],
  })
}

export const useFinancialEntry = (id: string) => {
  return useQuery({
    enabled: !!id,
    queryFn: () => financeApi.entries.getById(id),
    queryKey: ['financial-entries', id],
  })
}

export const useCreateFinancialEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateFinancialEntryData) => financeApi.entries.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-entries'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export const useUpdateFinancialEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ data, id }: { id: string; data: UpdateFinancialEntryData }) =>
      financeApi.entries.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['financial-entries'] })
      queryClient.invalidateQueries({ queryKey: ['financial-entries', id] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export const useDeleteFinancialEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => financeApi.entries.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-entries'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

// ===== PROVEEDORES =====
export const useProviders = () => {
  return useQuery({
    queryFn: () => financeApi.providers.getAll(),
    queryKey: ['providers'],
  })
}

export const useProvider = (id: string) => {
  return useQuery({
    enabled: !!id,
    queryFn: () => financeApi.providers.getById(id),
    queryKey: ['providers', id],
  })
}

export const useCreateProvider = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<User>) => financeApi.providers.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] })
    },
  })
}

export const useUpdateProvider = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ data, id }: { id: string; data: Partial<User> }) =>
      financeApi.providers.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['providers'] })
      queryClient.invalidateQueries({ queryKey: ['providers', id] })
    },
  })
}

export const useDeleteProvider = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => financeApi.providers.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] })
    },
  })
}

// ===== EMPLEADOS =====
export const useEmployees = () => {
  return useQuery({
    queryFn: () => financeApi.employees.getAll(),
    queryKey: ['employees'],
  })
}

export const useEmployee = (id: string) => {
  return useQuery({
    enabled: !!id,
    queryFn: () => financeApi.employees.getById(id),
    queryKey: ['employees', id],
  })
}

export const useCreateEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<User>) => financeApi.employees.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ data, id }: { id: string; data: Partial<User> }) =>
      financeApi.employees.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['employees', id] })
    },
  })
}

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => financeApi.employees.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}

// ===== SOCIOS =====
export const usePartners = () => {
  return useQuery({
    queryFn: () => financeApi.partners.getAll(),
    queryKey: ['partners'],
  })
}

export const usePartner = (id: string) => {
  return useQuery({
    enabled: !!id,
    queryFn: () => financeApi.partners.getById(id),
    queryKey: ['partners', id],
  })
}

export const useCreatePartner = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<User>) => financeApi.partners.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] })
    },
  })
}

export const useUpdatePartner = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ data, id }: { id: string; data: Partial<User> }) =>
      financeApi.partners.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['partners'] })
      queryClient.invalidateQueries({ queryKey: ['partners', id] })
    },
  })
}

export const useDeletePartner = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => financeApi.partners.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] })
    },
  })
}

// ===== REPORTES FINANCIEROS =====
export const useIncomeStatement = (filters?: ReportFilters) => {
  return useQuery({
    queryFn: () => financeApi.reports.getIncomeStatement(filters),
    queryKey: ['reports', 'income-statement', filters],
  })
}

export const useCashFlow = (filters?: ReportFilters) => {
  return useQuery({
    queryFn: () => financeApi.reports.getCashFlow(filters),
    queryKey: ['reports', 'cash-flow', filters],
  })
}

export const useBalanceSheet = (filters?: ReportFilters) => {
  return useQuery({
    queryFn: () => financeApi.reports.getBalanceSheet(filters),
    queryKey: ['reports', 'balance-sheet', filters],
  })
}

export const useGlobalSummary = (filters?: ReportFilters) => {
  return useQuery({
    queryFn: () => financeApi.reports.getGlobalSummary(filters),
    queryKey: ['reports', 'global-summary', filters],
  })
}

export const useFinancialReport = (type: ReportType, filters?: ReportFilters) => {
  return useQuery({
    queryFn: () => financeApi.reports.getReport(type, filters),
    queryKey: ['reports', type, filters],
  })
}

// ===== HOOKS DE UTILIDAD =====
export const useFinanceData = () => {
  const bankAccounts = useBankAccounts()
  const financialEntries = useFinancialEntries()
  const providers = useProviders()
  const employees = useEmployees()
  const partners = usePartners()

  return {
    bankAccounts,
    employees,
    error:
      bankAccounts.error ||
      financialEntries.error ||
      providers.error ||
      employees.error ||
      partners.error,
    financialEntries,
    isLoading:
      bankAccounts.isLoading ||
      financialEntries.isLoading ||
      providers.isLoading ||
      employees.isLoading ||
      partners.isLoading,
    partners,
    providers,
  }
}

export const useFinanceReports = (filters?: ReportFilters) => {
  const incomeStatement = useIncomeStatement(filters)
  const cashFlow = useCashFlow(filters)
  const balanceSheet = useBalanceSheet(filters)
  const globalSummary = useGlobalSummary(filters)

  return {
    balanceSheet,
    cashFlow,
    error: incomeStatement.error || cashFlow.error || balanceSheet.error || globalSummary.error,
    globalSummary,
    incomeStatement,
    isLoading:
      incomeStatement.isLoading ||
      cashFlow.isLoading ||
      balanceSheet.isLoading ||
      globalSummary.isLoading,
  }
}
