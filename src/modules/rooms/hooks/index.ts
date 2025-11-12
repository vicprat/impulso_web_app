import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { privateRoomsApi } from '../api'
import { type CreatePrivateRoomDto, type UpdatePrivateRoomDto } from '../types'

export const useAllPrivateRooms = () => {
  return useQuery({
    queryFn: privateRoomsApi.getAllPrivateRooms,
    queryKey: ['privateRooms'],
  })
}

export const usePrivateRoom = (id: string) => {
  return useQuery({
    enabled: !!id,
    queryFn: () => privateRoomsApi.getPrivateRoomById(id),
    queryKey: ['privateRoom', id],
  })
}

export const useUserPrivateRooms = (userId: string) => {
  return useQuery({
    enabled: !!userId,
    queryFn: () => privateRoomsApi.getPrivateRoomsByUserId(userId),
    queryKey: ['userPrivateRooms', userId],
  })
}

export const usePrivateRoomProducts = (productIds: string[]) => {
  return useQuery({
    enabled: productIds.length > 0,
    queryFn: () => privateRoomsApi.getProducts(productIds),
    queryKey: ['privateRoomProducts', productIds],
  })
}

export const useCreatePrivateRoom = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePrivateRoomDto) => privateRoomsApi.createPrivateRoom(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['privateRooms'] })
    },
  })
}

export const useUpdatePrivateRoom = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ data, id }: { id: string; data: UpdatePrivateRoomDto }) =>
      privateRoomsApi.updatePrivateRoom(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['privateRooms'] })
      void queryClient.invalidateQueries({ queryKey: ['privateRoom'] })
    },
  })
}

export const useDeletePrivateRoom = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => privateRoomsApi.deletePrivateRoom(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['privateRooms'] })
    },
  })
}
