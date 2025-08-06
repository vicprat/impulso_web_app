import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { type UserAndProfileUpdateInput } from '@/types/user'

const fetchUserProfile = async (userId: string) => {
  const response = await fetch(`/api/admin/users/${userId}/profile`)
  if (!response.ok) throw new Error('Failed to fetch user profile')
  return response.json()
}

export const useAdminUserProfile = (userId: string) => {
  const queryClient = useQueryClient()

  const profileQuery = useQuery({
    queryFn: () => fetchUserProfile(userId),
    queryKey: ['admin', 'user', userId, 'profile'],
    enabled: !!userId,
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UserAndProfileUpdateInput) => {
      const response = await fetch(`/api/admin/users/${userId}/profile`, {
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        method: 'PUT',
      })
      if (!response.ok) throw new Error('Failed to update user profile')
      return response.json()
    },
    onError: (error) => {
      toast.error('Error al actualizar el perfil del usuario', {
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado',
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId, 'profile'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      void queryClient.invalidateQueries({ queryKey: ['user', userId] })
      toast.success('Perfil del usuario actualizado correctamente')
    },
  })

  return {
    profile: profileQuery.data,
    isProfileLoading: profileQuery.isLoading,
    isUpdatingProfile: updateProfileMutation.isPending,
    updateProfile: updateProfileMutation.mutateAsync,
  }
}
