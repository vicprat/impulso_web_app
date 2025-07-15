import {
  type Links as PrismaLink,
  type Profile as PrismaProfile,
  type User as PrismaUser,
} from '@prisma/client'

export type User = PrismaUser
export type Profile = PrismaProfile
export type Link = PrismaLink

export type ProfileUpdateInput = Partial<
  Pick<Profile, 'occupation' | 'description' | 'bio' | 'avatarUrl' | 'backgroundImageUrl'>
>

export type UserAndProfileUpdateInput = ProfileUpdateInput &
  Partial<Pick<User, 'firstName' | 'lastName'>>

export type LinkCreateInput = Pick<Link, 'platform' | 'url'>

export type LinkUpdateInput = Partial<Pick<Link, 'platform' | 'url' | 'order' | 'isPrimary'>>

export type LinksOrderInput = {
  id: string
  order: number
}[]

export interface UserPublicProfile extends User {
  profile: Profile | null
  links: Link[]
}

export interface UserFilters {
  search?: string
  role?: string
  isActive?: boolean
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'lastLoginAt' | 'email' | 'firstName'
  sortOrder?: 'asc' | 'desc'
  isPublic?: boolean
}
