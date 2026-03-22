import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export interface Option {
  id: string
  name: string
  isActive?: boolean
}

interface UseGetOptionsOptions {
  onError?: (error: Error) => void
}

export const useGetOptions = (optionType: string, options?: UseGetOptionsOptions) => {
  return useQuery<Option[]>({
    queryFn: async () => {
      const { data } = await axios.get(`/api/options/${optionType}`)
      return data
    },
    queryKey: ['options', optionType],
    retry: 1,
    staleTime: 10 * 60 * 1000,
  })
}

export const useGetOption = (
  optionType: string,
  id: string | null,
  options?: UseGetOptionsOptions
) => {
  return useQuery<Option>({
    enabled: !!id,
    queryFn: async () => {
      if (!id) throw new Error('Option ID is required')
      const { data } = await axios.get(`/api/options/${optionType}`)
      const option = data.find((opt: Option) => opt.id === id)
      if (!option) throw new Error('Option not found')
      return option
    },
    queryKey: ['options', optionType, id],
    retry: 1,
    staleTime: 10 * 60 * 1000,
  })
}

interface UseCreateOptionOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export const useCreateOption = (optionType: string, options?: UseCreateOptionOptions) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await axios.post(`/api/options/${optionType}`, { name })
      return data
    },
    onError: options?.onError,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['options', optionType] })
      options?.onSuccess?.()
    },
  })
}

export const useUpdateOption = (optionType: string, options?: UseCreateOptionOptions) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data } = await axios.put(`/api/options/${optionType}`, { id, name })
      return data
    },
    onError: options?.onError,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['options', optionType] })
      options?.onSuccess?.()
    },
  })
}

export const useDeleteOption = (optionType: string, options?: UseCreateOptionOptions) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(`/api/options/${optionType}?id=${id}`)
      return data
    },
    onError: options?.onError,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['options', optionType] })
      options?.onSuccess?.()
    },
  })
}
