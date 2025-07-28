import { type Links, type Profile } from '@prisma/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  type LinkCreateInput,
  type LinksOrderInput,
  type LinkUpdateInput,
  type UserAndProfileUpdateInput,
} from '@/types/user'

const PROFILE_QUERY_KEY = ['user', 'profile']
const LINKS_QUERY_KEY = ['user', 'links']

const fetchProfile = async (): Promise<Profile | null> => {
  const response = await fetch('/api/profile')
  if (!response.ok) throw new Error('Failed to fetch profile')
  return response.json()
}

const fetchLinks = async (): Promise<Links[]> => {
  const response = await fetch('/api/links')
  if (!response.ok) throw new Error('Failed to fetch links')
  return response.json()
}

export const useUserProfile = () => {
  const queryClient = useQueryClient()

  const profileQuery = useQuery({
    queryFn: fetchProfile,
    queryKey: PROFILE_QUERY_KEY,
  })

  const linksQuery = useQuery({
    queryFn: fetchLinks,
    queryKey: LINKS_QUERY_KEY,
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UserAndProfileUpdateInput) => {
      const response = await fetch('/api/profile', {
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        method: 'PUT',
      })
      if (!response.ok) throw new Error('Failed to update profile')
      return response.json()
    },
    onError: (error) => {
      toast.error('Error al actualizar el perfil', {
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado',
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY })
      // También invalidar la caché de artistas públicos para que se vean los cambios
      void queryClient.invalidateQueries({ queryKey: ['publicArtists'] })
      toast.success('Perfil actualizado correctamente')
    },
  })

  const createLinkMutation = useMutation({
    mutationFn: async (data: LinkCreateInput) => {
      const response = await fetch('/api/links', {
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to create link')
      return response.json()
    },
    onError: (error) => {
      toast.error('Error al crear el link', {
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado',
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LINKS_QUERY_KEY })
      toast.success('Link creado correctamente')
    },
  })

  const updateLinkMutation = useMutation({
    mutationFn: async ({ data, linkId }: { linkId: string; data: LinkUpdateInput }) => {
      const response = await fetch(`/api/links/${linkId}`, {
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        method: 'PUT',
      })
      if (!response.ok) throw new Error('Failed to update link')
      return response.json()
    },
    onError: (error) => {
      toast.error('Error al actualizar el link', {
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado',
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LINKS_QUERY_KEY })
      toast.success('Link actualizado correctamente')
    },
  })

  const deleteLinkMutation = useMutation({
    mutationFn: async (linkId: string) => {
      const response = await fetch(`/api/links/${linkId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete link')
    },
    onError: (error) => {
      toast.error('Error al eliminar el link', {
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado',
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LINKS_QUERY_KEY })
      toast.success('Link eliminado correctamente')
    },
  })

  const updateLinksOrderMutation = useMutation({
    mutationFn: async (data: LinksOrderInput) => {
      const response = await fetch('/api/links/reorder', {
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to reorder links')
      return response.json()
    },
    onError: (error) => {
      toast.error('Error al reordenar los links', {
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado',
      })
      // Optimistically revert
      void queryClient.invalidateQueries({ queryKey: LINKS_QUERY_KEY })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LINKS_QUERY_KEY })
      toast.success('Orden de los links actualizado')
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
    links: linksQuery.data,
    profile: profileQuery.data,
    updateLink: updateLinkMutation.mutateAsync,
    updateLinksOrder: updateLinksOrderMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
  }
}
