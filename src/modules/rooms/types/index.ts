export interface PrivateRoom {
  id: string
  name: string
  description: string | null
  userId: string
  createdAt: string
  updatedAt: string
  products: PrivateRoomProduct[]
  user?: {
    id: string
    name: string | null
    email: string
  }
}

export interface PrivateRoomProduct {
  id: string
  privateRoomId: string
  productId: string
}

export interface CreatePrivateRoomDto {
  name: string
  description?: string
  userId: string
  productIds: string[]
}

export interface UpdatePrivateRoomDto {
  name?: string
  description?: string
  userId?: string
  productIds?: string[]
}
