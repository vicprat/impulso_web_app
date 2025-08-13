import { type Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import type {
  LinkCreateInput,
  LinksOrderInput,
  LinkUpdateInput,
  ProfileUpdateInput,
  UserFilters,
} from '@/types/user'

export const getProfileByUserId = async (userId: string) => {
  return await prisma.profile.findUnique({
    where: { userId },
  })
}

export const upsertUserProfile = async (userId: string, data: ProfileUpdateInput) => {
  return await prisma.profile.upsert({
    create: {
      userId,
      ...data,
    },
    update: data,
    where: { userId },
  })
}

export const getLinksByUserId = async (userId: string) => {
  return await prisma.links.findMany({
    orderBy: { order: 'asc' },
    where: { userId },
  })
}

export const createLink = async (userId: string, linkData: LinkCreateInput) => {
  const currentLinks = await getLinksByUserId(userId)
  const maxOrder = currentLinks.reduce((max, link) => (link.order > max ? link.order : max), -1)

  return await prisma.links.create({
    data: {
      ...linkData,
      order: maxOrder + 1,
      userId,
    },
  })
}

export const updateLink = async (linkId: string, userId: string, linkData: LinkUpdateInput) => {
  return await prisma.links.update({
    data: linkData,
    where: { id: linkId, userId },
  })
}

export const updateLinksOrder = async (userId: string, linksOrder: LinksOrderInput) => {
  const transactions = linksOrder.map((link) =>
    prisma.links.update({
      data: { order: link.order },
      where: { id: link.id, userId },
    })
  )

  return await prisma.$transaction(transactions)
}

export const deleteLink = async (linkId: string, userId: string) => {
  return await prisma.links.delete({
    where: { id: linkId, userId },
  })
}
export const getAllUsers = async (filters: UserFilters) => {
  const {
    isActive,
    isPublic,
    limit = 10,
    page = 1,
    role,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = filters

  const skip = (page - 1) * limit

  const where: Prisma.UserWhereInput = {
    ...(search && {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(typeof isActive === 'boolean' && { isActive }),
    ...(typeof isPublic === 'boolean' && { isPublic }),
    ...(role && { UserRole: { some: { role: { name: role } } } }),
  }

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      include: {
        UserRole: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        artist: true,
        profile: true,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
      where,
    }),
    prisma.user.count({ where }),
  ])

  const transformedUsers = users.map((user) => ({
    ...user,

    permissions: user.UserRole.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.name)),

    roles: user.UserRole.map((ur) => ur.role.name),
  }))

  return { total, users: transformedUsers }
}

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    include: {
      UserRole: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
      artist: true,
      links: true,
      profile: true,
    },
    where: { id: userId },
  })

  if (!user) return null

  return {
    ...user,
    permissions: user.UserRole.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.name)),
    roles: user.UserRole.map((ur) => ur.role.name),
  }
}

export const getPublicProfileByUserId = async (userId: string) => {
  const user = await prisma.user.findUnique({
    include: {
      UserRole: {
        include: {
          role: true,
        },
      },
      artist: true,
      links: true,
      profile: true,
    },
    where: {
      UserRole: {
        some: {
          role: {
            name: {
              in: ['artist', 'support', 'manager', 'admin'],
            },
          },
        },
      },
      id: userId,
      isPublic: true,
    },
  })

  if (!user) return null

  return {
    ...user,
    roles: user.UserRole.map((ur) => ur.role.name),
  }
}

export const updateUserRole = async (userId: string, roleName: string) => {
  const role = await prisma.role.findUnique({
    where: { name: roleName },
  })

  if (!role) {
    throw new Error(`Role ${roleName} not found`)
  }

  // Obtener el usuario actual para verificar si es artista
  const currentUser = await prisma.user.findUnique({
    include: {
      UserRole: {
        include: {
          role: true,
        },
      },
      artist: true,
    },
    where: { id: userId },
  })

  if (!currentUser) {
    throw new Error(`User ${userId} not found`)
  }

  // Verificar si el usuario actual es artista
  const isCurrentlyArtist = currentUser.UserRole.some((ur) => ur.role.name === 'artist')
  const willBeArtist = roleName === 'artist'

  await prisma.$transaction(async (tx) => {
    // Eliminar roles actuales
    await tx.userRole.deleteMany({
      where: { userId },
    })

    // Crear nuevo rol
    await tx.userRole.create({
      data: {
        assignedBy: 'admin',
        roleId: role.id,
        userId,
      },
    })

    // Si el usuario era artista y ahora no lo será, eliminar el registro del artista
    if (isCurrentlyArtist && !willBeArtist && currentUser.artist) {
      await tx.artist.delete({
        where: { id: currentUser.artist.id },
      })

      // También limpiar la referencia en el usuario
      await tx.user.update({
        data: { artistId: null },
        where: { id: userId },
      })
    }

    // Importante: ya no creamos automáticamente un Artist al promover a 'artist'.
    // La asociación con un vendor se hará explícitamente mediante los endpoints de artistas.
  })

  return await getUserById(userId)
}

export const deactivateUser = async (userId: string) => {
  return await prisma.user.update({
    data: { isActive: false },
    where: { id: userId },
  })
}

export const reactivateUser = async (userId: string) => {
  return await prisma.user.update({
    data: { isActive: true },
    where: { id: userId },
  })
}

export const updateUserPublicStatus = async (userId: string, isPublic: boolean) => {
  return await prisma.user.update({
    data: { isPublic },
    where: { id: userId },
  })
}

export const updateUserAndRelatedData = async (
  userId: string,
  data: {
    user?: {
      firstName?: string
      lastName?: string
      email?: string
    }
    profile?: {
      occupation?: string | null
      description?: string | null
      bio?: string | null
    }
    links?: {
      id?: string
      platform: string
      url: string
      order?: number
      isPrimary?: boolean
    }[]
  }
) => {
  return await prisma.$transaction(async (tx) => {
    if (data.user) {
      await tx.user.update({
        data: data.user,
        where: { id: userId },
      })
    }

    if (data.profile) {
      await tx.profile.upsert({
        create: {
          userId,
          ...data.profile,
        },
        update: data.profile,
        where: { userId },
      })
    }

    if (data.links) {
      const existingLinks = await tx.links.findMany({ where: { userId } })
      const linksToDelete = existingLinks.filter(
        (link) => !data.links?.some((newLink) => newLink.id === link.id)
      )
      for (const link of linksToDelete) {
        await tx.links.delete({ where: { id: link.id } })
      }

      for (const linkData of data.links) {
        if (linkData.id) {
          await tx.links.update({
            data: linkData,
            where: { id: linkData.id },
          })
        } else {
          await tx.links.create({
            data: {
              userId,
              ...linkData,
            },
          })
        }
      }
    }

    return await tx.user.findUnique({
      include: {
        UserRole: {
          include: {
            role: true,
          },
        },
        links: true,
        profile: true,
      },
      where: { id: userId },
    })
  })
}

export const cleanupOrphanedArtists = async () => {
  // Encontrar artistas que no están asignados a ningún usuario
  const orphanedArtists = await prisma.artist.findMany({
    where: {
      user: null,
    },
  })

  if (orphanedArtists.length > 0) {
    await prisma.artist.deleteMany({
      where: {
        user: null,
      },
    })
  }

  return orphanedArtists.length
}

export const getOrphanedArtists = async () => {
  return await prisma.artist.findMany({
    include: {
      user: true,
    },
    where: {
      user: null,
    },
  })
}
