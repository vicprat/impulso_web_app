import {
  type BalanceSheet,
  type BankAccount,
  type CashFlow,
  type CreateBankAccountData,
  type CreateFinancialEntryData,
  type FinancialEntry,
  type FinancialEntryFilters,
  type FinancialReportResponse,
  type GlobalSummary,
  type IncomeStatement,
  type ReportFilters,
  type ReportType,
  type UpdateBankAccountData,
  type UpdateFinancialEntryData,
  type User,
} from './types'

const API_BASE = '/api/finance'

async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
  }
  return response.json()
}

function buildQueryParams(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  return searchParams.toString()
}

export const bankAccountApi = {
  async create(data: CreateBankAccountData): Promise<BankAccount> {
    const response = await fetch(`${API_BASE}/bank-accounts`, {
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    return handleApiResponse<BankAccount>(response)
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/bank-accounts/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
    }
  },

  async getAll(): Promise<BankAccount[]> {
    const response = await fetch(`${API_BASE}/bank-accounts`)
    return handleApiResponse<BankAccount[]>(response)
  },

  async getById(id: string): Promise<BankAccount> {
    const response = await fetch(`${API_BASE}/bank-accounts/${id}`)
    return handleApiResponse<BankAccount>(response)
  },

  async update(id: string, data: UpdateBankAccountData): Promise<BankAccount> {
    const response = await fetch(`${API_BASE}/bank-accounts/${id}`, {
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PUT',
    })
    return handleApiResponse<BankAccount>(response)
  },
}

export const financialEntryApi = {
  async create(data: CreateFinancialEntryData): Promise<FinancialEntry> {
    const response = await fetch(`${API_BASE}/entries`, {
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    return handleApiResponse<FinancialEntry>(response)
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/entries/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
    }
  },

  async getAll(filters?: FinancialEntryFilters): Promise<FinancialEntry[]> {
    const queryParams = filters ? buildQueryParams(filters) : ''
    const url = queryParams ? `${API_BASE}/entries?${queryParams}` : `${API_BASE}/entries`
    const response = await fetch(url)
    return handleApiResponse<FinancialEntry[]>(response)
  },

  async getById(id: string): Promise<FinancialEntry> {
    const response = await fetch(`${API_BASE}/entries/${id}`)
    return handleApiResponse<FinancialEntry>(response)
  },

  async update(id: string, data: UpdateFinancialEntryData): Promise<FinancialEntry> {
    const response = await fetch(`${API_BASE}/entries/${id}`, {
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PUT',
    })
    return handleApiResponse<FinancialEntry>(response)
  },
}

export const providerApi = {
  async create(data: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE}/providers`, {
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    return handleApiResponse<User>(response)
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/providers/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
    }
  },

  async getAll(): Promise<User[]> {
    const response = await fetch(`${API_BASE}/providers`)
    return handleApiResponse<User[]>(response)
  },

  async getById(id: string): Promise<User> {
    const response = await fetch(`${API_BASE}/providers/${id}`)
    return handleApiResponse<User>(response)
  },

  async update(id: string, data: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE}/providers/${id}`, {
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PUT',
    })
    return handleApiResponse<User>(response)
  },
}

export const employeeApi = {
  async create(data: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE}/employees`, {
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    return handleApiResponse<User>(response)
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/employees/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
    }
  },

  async getAll(): Promise<User[]> {
    const response = await fetch(`${API_BASE}/employees`)
    return handleApiResponse<User[]>(response)
  },

  async getById(id: string): Promise<User> {
    const response = await fetch(`${API_BASE}/employees/${id}`)
    return handleApiResponse<User>(response)
  },

  async update(id: string, data: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE}/employees/${id}`, {
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PUT',
    })
    return handleApiResponse<User>(response)
  },
}

export const partnerApi = {
  async create(data: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE}/partners`, {
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    return handleApiResponse<User>(response)
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/partners/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
    }
  },

  async getAll(): Promise<User[]> {
    const response = await fetch(`${API_BASE}/partners`)
    return handleApiResponse<User[]>(response)
  },

  async getById(id: string): Promise<User> {
    const response = await fetch(`${API_BASE}/partners/${id}`)
    return handleApiResponse<User>(response)
  },

  async update(id: string, data: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE}/partners/${id}`, {
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PUT',
    })
    return handleApiResponse<User>(response)
  },
}

export const reportApi = {
  async getBalanceSheet(filters?: ReportFilters): Promise<BalanceSheet> {
    const queryParams = filters ? buildQueryParams(filters) : ''
    const url = queryParams
      ? `${API_BASE}/reports?type=balance-sheet&${queryParams}`
      : `${API_BASE}/reports?type=balance-sheet`
    const response = await fetch(url)
    const result = await handleApiResponse<FinancialReportResponse>(response)
    return result.data as BalanceSheet
  },

  async getCashFlow(filters?: ReportFilters): Promise<CashFlow> {
    const queryParams = filters ? buildQueryParams(filters) : ''
    const url = queryParams
      ? `${API_BASE}/reports?type=cash-flow&${queryParams}`
      : `${API_BASE}/reports?type=cash-flow`
    const response = await fetch(url)
    const result = await handleApiResponse<FinancialReportResponse>(response)
    return result.data as CashFlow
  },

  async getGlobalSummary(filters?: ReportFilters): Promise<GlobalSummary> {
    const queryParams = filters ? buildQueryParams(filters) : ''
    const url = queryParams
      ? `${API_BASE}/reports?type=global-summary&${queryParams}`
      : `${API_BASE}/reports?type=global-summary`
    const response = await fetch(url)
    const result = await handleApiResponse<FinancialReportResponse>(response)
    return result.data as GlobalSummary
  },

  async getIncomeStatement(filters?: ReportFilters): Promise<IncomeStatement> {
    const queryParams = filters ? buildQueryParams(filters) : ''
    const url = queryParams
      ? `${API_BASE}/reports?type=income-statement&${queryParams}`
      : `${API_BASE}/reports?type=income-statement`
    const response = await fetch(url)
    const result = await handleApiResponse<FinancialReportResponse>(response)
    return result.data as IncomeStatement
  },

  async getReport(
    type: ReportType,
    filters?: ReportFilters
  ): Promise<IncomeStatement | CashFlow | BalanceSheet | GlobalSummary> {
    const queryParams = filters ? buildQueryParams(filters) : ''
    const url = queryParams
      ? `${API_BASE}/reports?type=${type}&${queryParams}`
      : `${API_BASE}/reports?type=${type}`
    const response = await fetch(url)
    const result = await handleApiResponse<FinancialReportResponse>(response)
    return result.data
  },
}

export const financeApi = {
  bankAccounts: bankAccountApi,
  employees: employeeApi,
  entries: financialEntryApi,
  partners: partnerApi,
  providers: providerApi,
  reports: reportApi,
}
