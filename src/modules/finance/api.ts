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

// Configuración base para las llamadas a la API
const API_BASE = '/api/finance'

// Función helper para manejar respuestas de la API
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
  }
  return response.json()
}

// Función helper para construir query parameters
function buildQueryParams(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  return searchParams.toString()
}

// ===== CUENTAS BANCARIAS =====
export const bankAccountApi = {
  // Crear una nueva cuenta bancaria
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

  // Eliminar una cuenta bancaria
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/bank-accounts/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
    }
  },

  // Obtener todas las cuentas bancarias
  async getAll(): Promise<BankAccount[]> {
    const response = await fetch(`${API_BASE}/bank-accounts`)
    return handleApiResponse<BankAccount[]>(response)
  },

  // Obtener una cuenta bancaria por ID
  async getById(id: string): Promise<BankAccount> {
    const response = await fetch(`${API_BASE}/bank-accounts/${id}`)
    return handleApiResponse<BankAccount>(response)
  },

  // Actualizar una cuenta bancaria
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

// ===== MOVIMIENTOS FINANCIEROS =====
export const financialEntryApi = {
  // Crear un nuevo movimiento financiero
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

  // Eliminar un movimiento financiero
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/entries/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
    }
  },

  // Obtener movimientos financieros con filtros
  async getAll(filters?: FinancialEntryFilters): Promise<FinancialEntry[]> {
    const queryParams = filters ? buildQueryParams(filters) : ''
    const url = queryParams ? `${API_BASE}/entries?${queryParams}` : `${API_BASE}/entries`
    const response = await fetch(url)
    return handleApiResponse<FinancialEntry[]>(response)
  },

  // Obtener un movimiento financiero por ID
  async getById(id: string): Promise<FinancialEntry> {
    const response = await fetch(`${API_BASE}/entries/${id}`)
    return handleApiResponse<FinancialEntry>(response)
  },

  // Actualizar un movimiento financiero
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

// ===== PROVEEDORES =====
export const providerApi = {
  // Crear un nuevo proveedor
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

  // Eliminar un proveedor
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/providers/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
    }
  },

  // Obtener todos los proveedores
  async getAll(): Promise<User[]> {
    const response = await fetch(`${API_BASE}/providers`)
    return handleApiResponse<User[]>(response)
  },

  // Obtener un proveedor por ID
  async getById(id: string): Promise<User> {
    const response = await fetch(`${API_BASE}/providers/${id}`)
    return handleApiResponse<User>(response)
  },

  // Actualizar un proveedor
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

// ===== EMPLEADOS =====
export const employeeApi = {
  // Crear un nuevo empleado
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

  // Eliminar un empleado
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/employees/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
    }
  },

  // Obtener todos los empleados
  async getAll(): Promise<User[]> {
    const response = await fetch(`${API_BASE}/employees`)
    return handleApiResponse<User[]>(response)
  },

  // Obtener un empleado por ID
  async getById(id: string): Promise<User> {
    const response = await fetch(`${API_BASE}/employees/${id}`)
    return handleApiResponse<User>(response)
  },

  // Actualizar un empleado
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

// ===== SOCIOS =====
export const partnerApi = {
  // Crear un nuevo socio
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

  // Eliminar un socio
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/partners/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
    }
  },

  // Obtener todos los socios
  async getAll(): Promise<User[]> {
    const response = await fetch(`${API_BASE}/partners`)
    return handleApiResponse<User[]>(response)
  },

  // Obtener un socio por ID
  async getById(id: string): Promise<User> {
    const response = await fetch(`${API_BASE}/partners/${id}`)
    return handleApiResponse<User>(response)
  },

  // Actualizar un socio
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

// ===== REPORTES FINANCIEROS =====
export const reportApi = {
  // Generar reporte de balance general
  async getBalanceSheet(filters?: ReportFilters): Promise<BalanceSheet> {
    const queryParams = filters ? buildQueryParams(filters) : ''
    const url = queryParams
      ? `${API_BASE}/reports?type=balance-sheet&${queryParams}`
      : `${API_BASE}/reports?type=balance-sheet`
    const response = await fetch(url)
    const result = await handleApiResponse<FinancialReportResponse>(response)
    return result.data as BalanceSheet
  },

  // Generar reporte de flujo de efectivo
  async getCashFlow(filters?: ReportFilters): Promise<CashFlow> {
    const queryParams = filters ? buildQueryParams(filters) : ''
    const url = queryParams
      ? `${API_BASE}/reports?type=cash-flow&${queryParams}`
      : `${API_BASE}/reports?type=cash-flow`
    const response = await fetch(url)
    const result = await handleApiResponse<FinancialReportResponse>(response)
    return result.data as CashFlow
  },

  // Generar reporte de resumen global
  async getGlobalSummary(filters?: ReportFilters): Promise<GlobalSummary> {
    const queryParams = filters ? buildQueryParams(filters) : ''
    const url = queryParams
      ? `${API_BASE}/reports?type=global-summary&${queryParams}`
      : `${API_BASE}/reports?type=global-summary`
    const response = await fetch(url)
    const result = await handleApiResponse<FinancialReportResponse>(response)
    return result.data as GlobalSummary
  },

  // Generar reporte de estado de resultados
  async getIncomeStatement(filters?: ReportFilters): Promise<IncomeStatement> {
    const queryParams = filters ? buildQueryParams(filters) : ''
    const url = queryParams
      ? `${API_BASE}/reports?type=income-statement&${queryParams}`
      : `${API_BASE}/reports?type=income-statement`
    const response = await fetch(url)
    const result = await handleApiResponse<FinancialReportResponse>(response)
    return result.data as IncomeStatement
  },

  // Generar reporte genérico por tipo
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

// Exportar todas las APIs como un objeto unificado
export const financeApi = {
  bankAccounts: bankAccountApi,
  employees: employeeApi,
  entries: financialEntryApi,
  partners: partnerApi,
  providers: providerApi,
  reports: reportApi,
}
