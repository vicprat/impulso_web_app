import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

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

export const useUserPrivateRoom = (userId: string) => {
  return useQuery({
    enabled: !!userId,
    queryFn: () => privateRoomsApi.getPrivateRoomByUserId(userId),
    queryKey: ['userPrivateRoom', userId],
  })
}

export const useCreatePrivateRoom = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePrivateRoomDto) => privateRoomsApi.createPrivateRoom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privateRooms'] })
    },
  })
}

export const useUpdatePrivateRoom = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ data, id }: { id: string; data: UpdatePrivateRoomDto }) =>
      privateRoomsApi.updatePrivateRoom(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privateRooms'] })
      queryClient.invalidateQueries({ queryKey: ['privateRoom'] })
    },
  })
}

export const useDeletePrivateRoom = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => privateRoomsApi.deletePrivateRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privateRooms'] })
    },
  })
}
