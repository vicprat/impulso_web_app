import { type Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import type {
  LinkCreateInput,
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
  return await prisma.links.create({
    data: {
      userId,
      ...linkData,
    },
  })
}

export const updateLink = async (linkId: string, userId: string, linkData: LinkUpdateInput) => {
  const link = await prisma.links.findUnique({
    where: { id: linkId },
  })

  if (!link || link.userId !== userId) {
    throw new Error('Link not found or you do not have permission to update it.')
  }

  return await prisma.links.update({
    data: linkData,
    where: { id: linkId },
  })
}

export const deleteLink = async (linkId: string, userId: string) => {
  const link = await prisma.links.findUnique({
    where: { id: linkId },
  })

  if (!link || link.userId !== userId) {
    throw new Error('Link not found or you do not have permission to delete it.')
  }

  return await prisma.links.delete({
    where: { id: linkId },
  })
}

// ✅ CORREGIDO: Usando UserRole para schema actual
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
    // ✅ CORREGIDO: Usar UserRole en lugar de roles directos
    ...(role && { UserRole: { some: { role: { name: role } } } }),
  }

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      include: {
        // ✅ CORREGIDO: Usar UserRole en lugar de role directo
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

  // ✅ TRANSFORMAR: Convertir UserRole a formato esperado por frontend
  const transformedUsers = users.map((user) => ({
    ...user,

    // Agregar permisos si los necesitas
    permissions: user.UserRole.flatMap(
      (ur) => ur.role.permissions?.map((rp) => rp.permission.name) ?? []
    ),

    // Mantener compatibilidad con frontend que espera roles como array
    roles: user.UserRole.map((ur) => ur.role.name),
  }))

  return { total, users: transformedUsers }
}

// ✅ CORREGIDO: Usando UserRole
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
      links: true,
      profile: true, // Add this line to include links
    },
    where: { id: userId },
  })

  if (!user) return null

  // ✅ TRANSFORMAR: Convertir a formato esperado
  return {
    ...user,
    permissions: user.UserRole.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.name)),
    roles: user.UserRole.map((ur) => ur.role.name),
  }
}

// ✅ NUEVO: Función para obtener un perfil público por ID de usuario
export const getPublicProfileByUserId = async (userId: string) => {
  const user = await prisma.user.findUnique({
    include: {
      UserRole: {
        include: {
          role: true,
        },
      },
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

// ✅ NUEVO: Método para actualizar rol usando UserRole
export const updateUserRole = async (userId: string, roleName: string) => {
  const role = await prisma.role.findUnique({
    where: { name: roleName },
  })

  if (!role) {
    throw new Error(`Role ${roleName} not found`)
  }

  // Eliminar rol actual y asignar nuevo (un solo rol por usuario)
  await prisma.$transaction(async (tx) => {
    // Eliminar roles existentes
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
  })

  // Retornar usuario actualizado
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

// ✅ NUEVO: Función para actualizar el estado isPublic de un usuario
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
      // Delete existing links for the user that are not in the new list
      const existingLinks = await tx.links.findMany({ where: { userId } })
      const linksToDelete = existingLinks.filter(
        (link) => !data.links?.some((newLink) => newLink.id === link.id)
      )
      for (const link of linksToDelete) {
        await tx.links.delete({ where: { id: link.id } })
      }

      // Create or update links
      for (const linkData of data.links) {
        if (linkData.id) {
          // Update existing link
          await tx.links.update({
            data: linkData,
            where: { id: linkData.id },
          })
        } else {
          // Create new link
          await tx.links.create({
            data: {
              userId,
              ...linkData,
            },
          })
        }
      }
    }

    // Fetch the updated user with all related data
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
