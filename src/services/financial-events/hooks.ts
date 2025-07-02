import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'

interface FinancialEvent {
  id: string
  name: string
  shopifyProductId: string
}

interface UpdateExpensePayload {
  id: string
  description: string
  amount: number
  category: string
  paymentMethod?: string
  relatedParty?: string
  notes?: string
}

export interface FinancialEntry {
  id: string
  type: 'INCOME' | 'EXPENSE'
  amount: number
  currency: string
  description: string
  date: string
  eventId: string | null
  source: string | null
  sourceId: string | null
  category: string | null
  paymentMethod: string | null
  relatedParty: string | null
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
  notes: string | null
  createdAt: string
  updatedAt: string
}

interface AssignIncomePayload {
  incomeEntryId: string
  eventId: string
}

interface CreateExpensePayload {
  eventId: string
  description: string
  amount: number
  category: string
  paymentMethod?: string
  relatedParty?: string
  notes?: string
  id?: string
}

interface CreateIncomePayload extends Omit<CreateExpensePayload, 'eventId'> {
  eventId: string
}

export interface PendingIncomeEntry {
  id: string
  description: string
  amount: number
  currency: string
  date: string
  source: string
  sourceId: string
  relatedParty: string | null
}

const FINANCIAL_EVENTS_QUERY_KEY = 'financialEvents'

export const useGetFinancialEvents = () => {
  return useQuery<FinancialEvent[]>({
    queryFn: async () => {
      const { data } = await axios.get('/api/management/finance/events')
      return data
    },
    queryKey: [FINANCIAL_EVENTS_QUERY_KEY],
  })
}

export const useGetFinancialEvent = (eventId: string) => {
  return useQuery<FinancialEvent>({
    enabled: !!eventId,
    queryFn: async () => {
      const { data } = await axios.get(`/api/management/finance/events/${eventId}`)
      return data
    },
    queryKey: [FINANCIAL_EVENTS_QUERY_KEY, eventId],
  })
}

export const useGetPendingIncomeEntries = () => {
  return useQuery<PendingIncomeEntry[]>({
    queryFn: async () => {
      const { data } = await axios.get('/api/management/finance/income/pending')
      return data
    },
    queryKey: [FINANCIAL_EVENTS_QUERY_KEY, 'pendingIncome'],
  })
}

export const useAssignIncomeEntry = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: AssignIncomePayload) => {
      if (!payload.incomeEntryId) {
        throw new Error('Por favor, selecciona un ingreso para asignar.')
      }
      const { data } = await axios.post('/api/management/finance/income/assign', payload)
      return data
    },
    onError: (error: Error) => {
      toast.error(`Error al asignar ingreso: ${error.message}`)
    },
    onSuccess: () => {
      toast.success('Ingreso asignado exitosamente!')
      void queryClient.invalidateQueries({
        queryKey: [FINANCIAL_EVENTS_QUERY_KEY, 'pendingIncome'],
      })
      void queryClient.invalidateQueries({ queryKey: [FINANCIAL_EVENTS_QUERY_KEY, 'detail'] })
    },
  })
}

export const useCreateExpense = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateExpensePayload) => {
      if (!payload.description.trim()) {
        throw new Error('La descripción es obligatoria.')
      }
      if (!payload.amount || payload.amount <= 0) {
        throw new Error('El monto debe ser mayor a 0.')
      }
      if (!payload.category.trim()) {
        throw new Error('La categoría es obligatoria.')
      }

      const { data } = await axios.post('/api/management/finance/expense', payload)
      return data
    },
    onError: (error: Error) => {
      toast.error(`Error al registrar egreso: ${error.message}`)
    },
    onSuccess: (_, variables) => {
      toast.success('Egreso registrado exitosamente!')
      void queryClient.invalidateQueries({
        queryKey: [FINANCIAL_EVENTS_QUERY_KEY, variables.eventId],
      })
      void queryClient.invalidateQueries({
        queryKey: [FINANCIAL_EVENTS_QUERY_KEY, 'entries', variables.eventId],
      })
    },
  })
}

export const useGetFinancialEntriesByEvent = (eventId: string) => {
  return useQuery<FinancialEntry[]>({
    enabled: !!eventId,
    queryFn: async () => {
      const { data } = await axios.get(`/api/management/finance/entries/${eventId}`)
      return data
    },
    queryKey: [FINANCIAL_EVENTS_QUERY_KEY, 'entries', eventId],
  })
}

export const useDeleteExpense = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (expenseId: string) => {
      await axios.delete(`/api/management/finance/expense/${expenseId}`)
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar egreso: ${error.message}`)
    },
    onSuccess: () => {
      toast.success('Egreso eliminado exitosamente!')
      void queryClient.invalidateQueries({ queryKey: [FINANCIAL_EVENTS_QUERY_KEY, 'entries'] })
    },
  })
}

export const useDeleteManyExpenses = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (expenseIds: string[]) => {
      if (!expenseIds.length) {
        throw new Error('No se han seleccionado gastos para eliminar.')
      }

      const response = await axios.delete('/api/management/finance/expense/bulk', {
        data: { expenseIds },
      })
      return response.data
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar gastos: ${error.message}`)
    },
    onSuccess: (data) => {
      const deletedCount = data.deletedCount ?? 0
      toast.success(
        `${deletedCount} gasto${deletedCount > 1 ? 's eliminados' : ' eliminado'} exitosamente!`
      )
      void void queryClient.invalidateQueries({ queryKey: [FINANCIAL_EVENTS_QUERY_KEY, 'entries'] })
    },
  })
}

export const useUpdateExpense = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateExpensePayload) => {
      if (!payload.description.trim()) {
        throw new Error('La descripción es obligatoria.')
      }
      if (!payload.amount || payload.amount <= 0) {
        throw new Error('El monto debe ser mayor a 0.')
      }
      if (!payload.category.trim()) {
        throw new Error('La categoría es obligatoria.')
      }

      const { id, ...data } = payload
      const response = await axios.put(`/api/management/finance/expense/${id}`, data)
      return response.data
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar egreso: ${error.message}`)
    },
    onSuccess: () => {
      toast.success('Egreso actualizado exitosamente!')
      void queryClient.invalidateQueries({ queryKey: [FINANCIAL_EVENTS_QUERY_KEY, 'entries'] })
    },
  })
}

export const useCreateIncome = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateIncomePayload) => {
      // Validaciones similares a useCreateExpense
      if (!payload.description.trim()) {
        throw new Error('La descripción es obligatoria.')
      }
      if (!payload.amount || payload.amount <= 0) {
        throw new Error('El monto debe ser mayor a 0.')
      }
      if (!payload.category.trim()) {
        throw new Error('La categoría es obligatoria.')
      }

      const { data } = await axios.post('/api/management/finance/income', payload)
      return data
    },
    onError: (error: Error) => {
      toast.error(`Error al registrar ingreso: ${error.message}`)
    },
    onSuccess: (_, variables) => {
      toast.success('Ingreso registrado exitosamente!')
      void queryClient.invalidateQueries({
        queryKey: [FINANCIAL_EVENTS_QUERY_KEY, 'entries', variables.eventId],
      })
    },
  })
}

export const useUpdateIncome = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<CreateIncomePayload>) => {
      // Validaciones similares a useUpdateExpense
      if (!payload.description?.trim()) {
        throw new Error('La descripción es obligatoria.')
      }
      if (!payload.amount || payload.amount <= 0) {
        throw new Error('El monto debe ser mayor a 0.')
      }
      if (!payload.category?.trim()) {
        throw new Error('La categoría es obligatoria.')
      }

      const { id, ...data } = payload
      const response = await axios.put(`/api/management/finance/income/${id}`, data)
      return response.data
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar ingreso: ${error.message}`)
    },
    onSuccess: () => {
      toast.success('Ingreso actualizado exitosamente!')
      void queryClient.invalidateQueries({ queryKey: [FINANCIAL_EVENTS_QUERY_KEY, 'entries'] })
    },
  })
}

export const useRevertIncomeAssignment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (incomeId: string) => {
      const response = await axios.put(`/api/management/finance/income/revert/${incomeId}`)
      return response.data
    },
    onError: (error: Error) => {
      toast.error(`Error al revertir ingreso: ${error.message}`)
    },
    onSuccess: () => {
      toast.success('Asignación de ingreso revertida exitosamente!')
      void queryClient.invalidateQueries({
        queryKey: [FINANCIAL_EVENTS_QUERY_KEY, 'pendingIncome'],
      })
      void queryClient.invalidateQueries({ queryKey: [FINANCIAL_EVENTS_QUERY_KEY, 'entries'] })
    },
  })
}
