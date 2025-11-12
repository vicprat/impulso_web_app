export interface PrivateRoomUser {
  id: string
  userId: string
  privateRoomId: string
  assignedAt: string
  user?: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
  }
}

export interface PrivateRoom {
  id: string
  name: string
  description: string | null
  userId?: string | null
  createdAt: string
  updatedAt: string
  products: PrivateRoomProduct[]
  users?: PrivateRoomUser[]
  user?: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
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
  userIds: string[]
  productIds: string[]
}

export interface UpdatePrivateRoomDto {
  name?: string
  description?: string
  userIds?: string[]
  productIds?: string[]
}
