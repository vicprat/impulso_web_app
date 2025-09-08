import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { type UserAndProfileUpdateInput } from '@/types/user'

const fetchUserProfile = async (userId: string) => {
  const response = await fetch(`/api/admin/users/${userId}/profile`)
  if (!response.ok) throw new Error('Failed to fetch user profile')
  return response.json()
}

const fetchUserLinks = async (userId: string) => {
  const response = await fetch(`/api/admin/users/${userId}/links`)
  if (!response.ok) throw new Error('Failed to fetch user links')
  return response.json()
}

export const useAdminUserProfile = (userId: string) => {
  const queryClient = useQueryClient()

  const profileQuery = useQuery({
    enabled: !!userId,
    queryFn: () => fetchUserProfile(userId),
    queryKey: [ 'admin', 'user', userId, 'profile' ],
  })

  const linksQuery = useQuery({
    enabled: !!userId,
    queryFn: () => fetchUserLinks(userId),
    queryKey: [ 'admin', 'user', userId, 'links' ],
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
      void queryClient.invalidateQueries({ queryKey: [ 'admin', 'user', userId, 'profile' ] })
      void queryClient.invalidateQueries({ queryKey: [ 'admin', 'users' ] })
      void queryClient.invalidateQueries({ queryKey: [ 'user', userId ] })
      toast.success('Perfil del usuario actualizado correctamente')
    },
  })

  const createLinkMutation = useMutation({
    mutationFn: async (data: { platform: string; url: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/links`, {
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to create user link')
      return response.json()
    },
    onError: (error) => {
      toast.error('Error al crear el link del usuario', {
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado',
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ 'admin', 'user', userId, 'links' ] })
      toast.success('Link del usuario creado correctamente')
    },
  })

  const updateLinkMutation = useMutation({
    mutationFn: async ({ data, linkId }: { linkId: string; data: { platform: string; url: string } }) => {
      const response = await fetch(`/api/admin/users/${userId}/links/${linkId}`, {
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        method: 'PUT',
      })
      if (!response.ok) throw new Error('Failed to update user link')
      return response.json()
    },
    onError: (error) => {
      toast.error('Error al actualizar el link del usuario', {
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado',
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ 'admin', 'user', userId, 'links' ] })
      toast.success('Link del usuario actualizado correctamente')
    },
  })

  const deleteLinkMutation = useMutation({
    mutationFn: async (linkId: string) => {
      const response = await fetch(`/api/admin/users/${userId}/links/${linkId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete user link')
      return response.json()
    },
    onError: (error) => {
      toast.error('Error al eliminar el link del usuario', {
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado',
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ 'admin', 'user', userId, 'links' ] })
      toast.success('Link del usuario eliminado correctamente')
    },
  })

  const updateLinksOrderMutation = useMutation({
    mutationFn: async (data: { id: string; order: number }[]) => {
      const response = await fetch(`/api/admin/users/${userId}/links/reorder`, {
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to reorder user links')
      return response.json()
    },
    onError: (error) => {
      toast.error('Error al reordenar los links del usuario', {
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado',
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ 'admin', 'user', userId, 'links' ] })
      toast.success('Orden de los links del usuario actualizado')
    },
  })

  return {
    createLink: createLinkMutation.mutateAsync,
    deleteLink: deleteLinkMutation.mutateAsync,
    
isCreatingLink: createLinkMutation.isPending,
    

isDeletingLink: deleteLinkMutation.isPending,
    
    
isLinksLoading: linksQuery.isLoading,
    
isProfileLoading: profileQuery.isLoading,
    
isUpdatingLink: updateLinkMutation.isPending,
    
isUpdatingLinksOrder: updateLinksOrderMutation.isPending,
    
isUpdatingProfile: updateProfileMutation.isPending,
    // Links functionality
links: linksQuery.data,
    profile: profileQuery.data,
    updateLink: updateLinkMutation.mutateAsync,
    updateLinksOrder: updateLinksOrderMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
  }
}
