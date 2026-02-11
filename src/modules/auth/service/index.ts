import { type Links, type Profile } from '@prisma/client'

import {
  calculateExpiresAt,
  exchangeCodeForTokens,
  getCustomerInfo,
  refreshAccessToken,
} from '../utils'

import { prisma } from '@/src/lib/prisma'
import { type AuthConfig, type CustomerInfo, type TokenResponse } from '@/src/types'

export interface AuthSession {
  user: {
    id: string
    shopifyCustomerId?: string
    email: string
    firstName?: string
    lastName?: string
    roles: string[]
    permissions: string[]
    profile?: Profile | null
    links?: Links[] | null
    artist?: { id: string; name: string } | null
  }
  tokens: {
    accessToken: string
    refreshToken: string
    idToken?: string
    expiresAt: Date
  }
}

export class AuthService {
  private config: AuthConfig

  constructor(config: AuthConfig) {
    this.config = config
  }

  async authenticateWithCode(code: string, codeVerifier: string): Promise<AuthSession> {
    try {
      const tokenResponse = await exchangeCodeForTokens(this.config, code, codeVerifier)
      const customerInfo = await getCustomerInfo(this.config, tokenResponse.access_token)
      const user = await this.upsertUser(customerInfo)
      const expiresAt = calculateExpiresAt(tokenResponse.expires_in)

      try {
        await this.saveSessionToken(user.id, tokenResponse, expiresAt)
      } catch (saveError) {
        console.error('Failed to save session token:', saveError)
        throw saveError
      }

      try {
        const verifySession = await prisma.sessionToken.findUnique({
          include: { user: true },
          where: { accessToken: tokenResponse.access_token },
        })
        if (!verifySession) {
          console.error('Session not found in database after saving')
        }
      } catch (verifyError) {
        console.error('Error verifying saved session:', verifyError)
      }

      const userWithPermissions = await this.getUserWithPermissions(user.id)
      const effectivePermissions = await this.getEffectivePermissions(user.id)

      await this.logActivity(user.id, 'login', null, {
        loginMethod: 'oauth_code',
        shopifyCustomerId: customerInfo.id,
      })

      return {
        tokens: {
          accessToken: tokenResponse.access_token,
          expiresAt,
          idToken: tokenResponse.id_token,
          refreshToken: tokenResponse.refresh_token,
        },
        user: {
          artist: userWithPermissions.artist,
          email: user.email,
          firstName: user.firstName ?? undefined,
          id: user.id,
          lastName: user.lastName ?? undefined,
          permissions: effectivePermissions,
          roles: userWithPermissions.UserRole.map((ur) => ur.role.name),
          shopifyCustomerId: user.shopifyCustomerId ?? undefined,
        },
      }
    } catch (error) {
      console.error('Authentication failed:', error)
      throw new Error('Authentication failed')
    }
  }

  async refreshSession(refreshToken: string): Promise<AuthSession | null> {
    try {
      const existingSession = await prisma.sessionToken.findFirst({
        include: { user: true },
        where: {
          expiresAt: {
            gt: new Date(),
          },
          isActive: true,
          refreshToken: refreshToken.trim(),
        },
      })

      if (!existingSession) {
        return null
      }

      const tokenResponse = await refreshAccessToken(this.config, refreshToken.trim())
      const expiresAt = calculateExpiresAt(tokenResponse.expires_in)

      await this.saveSessionToken(
        existingSession.userId,
        {
          access_token: tokenResponse.access_token,
          expires_in: tokenResponse.expires_in,
          refresh_token: tokenResponse.refresh_token,
        } as TokenResponse,
        expiresAt
      )

      const userWithPermissions = await this.getUserWithPermissions(existingSession.userId)
      const effectivePermissions = await this.getEffectivePermissions(existingSession.userId)

      return {
        tokens: {
          accessToken: tokenResponse.access_token,
          expiresAt,
          refreshToken: tokenResponse.refresh_token,
        },
        user: {
          artist: userWithPermissions.artist,
          email: existingSession.user.email,
          firstName: existingSession.user.firstName ?? undefined,
          id: existingSession.user.id,
          lastName: existingSession.user.lastName ?? undefined,
          permissions: effectivePermissions,
          roles: userWithPermissions.UserRole.map((ur) => ur.role.name),
          shopifyCustomerId: existingSession.user.shopifyCustomerId ?? undefined,
        },
      }
    } catch (error) {
      console.error('Session refresh failed:', error)
      return null
    }
  }

  async getSessionByAccessToken(accessToken: string): Promise<AuthSession | null> {
    try {
      if (!accessToken) {
        return null
      }

      const trimmedToken = accessToken.trim()
      if (!trimmedToken) {
        return null
      }

      let session = await prisma.sessionToken.findFirst({
        include: { user: true },
        where: {
          accessToken: trimmedToken,
          expiresAt: {
            gt: new Date(),
          },
          isActive: true,
        },
      })

      if (!session && accessToken !== trimmedToken) {
        session = await prisma.sessionToken.findFirst({
          include: { user: true },
          where: {
            accessToken,
            expiresAt: {
              gt: new Date(),
            },
            isActive: true,
          },
        })
      }

      if (!session) {
        return null
      }

      const userWithPermissions = await this.getUserWithPermissions(session.userId)
      const effectivePermissions = await this.getEffectivePermissions(session.userId)

      return {
        tokens: {
          accessToken: session.accessToken,
          expiresAt: session.expiresAt,
          idToken: session.idToken ?? undefined,
          refreshToken: session.refreshToken,
        },
        user: {
          artist: userWithPermissions.artist,
          email: session.user.email,
          firstName: session.user.firstName ?? undefined,
          id: session.user.id,
          lastName: session.user.lastName ?? undefined,
          permissions: effectivePermissions,
          roles: userWithPermissions.UserRole.map((ur) => ur.role.name),
          shopifyCustomerId: session.user.shopifyCustomerId ?? undefined,
        },
      }
    } catch (error) {
      console.error('Get session failed:', error)
      return null
    }
  }

  async logout(accessToken: string): Promise<boolean> {
    try {
      const session = await prisma.sessionToken.findFirst({
        include: { user: true },
        where: {
          accessToken: accessToken.trim(),
          isActive: true,
        },
      })

      if (!session) {
        return false
      }

      await prisma.sessionToken.delete({
        where: { id: session.id },
      })

      await this.logActivity(session.userId, 'logout')

      return true
    } catch (error) {
      console.error('Logout failed:', error)
      return false
    }
  }

  async cleanupExpiredTokens(): Promise<void> {
    try {
      await prisma.sessionToken.deleteMany({
        where: {
          OR: [{ expiresAt: { lt: new Date() } }, { isActive: false }],
        },
      })
    } catch (error) {
      console.error('Error cleaning tokens:', error)
    }
  }

  async assignRole(userId: string, roleName: string, assignedBy?: string): Promise<void> {
    const role = await prisma.role.findUnique({ where: { name: roleName } })
    if (!role) throw new Error(`Role ${roleName} not found`)

    await prisma.userRole.upsert({
      create: {
        assignedBy,
        roleId: role.id,
        userId,
      },
      update: {},
      where: {
        userId_roleId: {
          roleId: role.id,
          userId,
        },
      },
    })
  }

  async removeRole(userId: string, roleName: string): Promise<void> {
    const role = await prisma.role.findUnique({ where: { name: roleName } })
    if (!role) throw new Error(`Role ${roleName} not found`)

    await prisma.userRole.deleteMany({
      where: {
        roleId: role.id,
        userId,
      },
    })

    await this.logActivity(userId, 'role_removed', 'user_role', {
      roleName,
    })
  }

  async hasPermission(userId: string, permissionName: string): Promise<boolean> {
    const userWithPermissions = await this.getUserWithPermissions(userId)

    for (const userRole of userWithPermissions.UserRole) {
      const rolePermission = await prisma.rolePermission.findFirst({
        where: {
          permission: { name: permissionName },
          roleId: userRole.roleId,
        },
      })
      if (rolePermission) {
        return true
      }
    }

    return false
  }

  private async upsertUser(customerInfo: CustomerInfo) {
    // Primero buscar por shopifyCustomerId
    let existingUser = await prisma.user.findUnique({
      include: { UserRole: true },
      where: { shopifyCustomerId: customerInfo.id },
    })

    // Si no se encuentra por shopifyCustomerId, buscar por email
    if (!existingUser) {
      existingUser = await prisma.user.findUnique({
        include: { UserRole: true },
        where: { email: customerInfo.email },
      })
    }

    if (existingUser) {
      // Si el usuario existe pero no tiene shopifyCustomerId, actualizarlo
      const updateData: any = {
        email: customerInfo.email,
        firstName: customerInfo.firstName,
        lastLoginAt: new Date(),
        lastName: customerInfo.lastName,
      }

      // Solo actualizar shopifyCustomerId si no lo tiene
      if (!existingUser.shopifyCustomerId) {
        updateData.shopifyCustomerId = customerInfo.id
      }

      return prisma.user.update({
        data: updateData,
        where: { id: existingUser.id },
      })
    }

    const defaultRoleConfig = await prisma.appConfig.findUnique({
      where: { key: 'default_user_role' },
    })

    const defaultRoleName = defaultRoleConfig?.value ?? 'customer'

    const defaultRole = await prisma.role.findUnique({
      where: { name: defaultRoleName },
    })

    if (!defaultRole) {
      throw new Error(`Default role '${defaultRoleName}' not found`)
    }

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: customerInfo.email,
          firstName: customerInfo.firstName,
          lastLoginAt: new Date(),
          lastName: customerInfo.lastName,
          shopifyCustomerId: customerInfo.id,
        },
      })

      await tx.userRole.create({
        data: {
          assignedBy: 'system',
          roleId: defaultRole.id,
          userId: user.id,
        },
      })

      return user
    })

    return newUser
  }

  private async saveSessionToken(userId: string, tokens: TokenResponse, expiresAt: Date) {
    try {
      await prisma.sessionToken.deleteMany({
        where: { userId },
      })

      await prisma.sessionToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      })

      const tokenData = {
        accessToken: tokens.access_token.trim(),
        expiresAt,
        idToken: tokens.id_token ? tokens.id_token.trim() : null,
        isActive: true,
        refreshToken: tokens.refresh_token.trim(),
        userId,
      }

      const newToken = await prisma.sessionToken.create({
        data: tokenData,
      })

      const immediateCheck = await prisma.sessionToken.findUnique({
        include: { user: true },
        where: { id: newToken.id },
      })

      if (!immediateCheck) {
        console.error('Immediate verification failed - token not found by ID')
      }

      return newToken
    } catch (error) {
      console.error('saveSessionToken failed:', error)

      try {
        await prisma.sessionToken.findMany({
          select: { accessToken: true, expiresAt: true, id: true, isActive: true },
          where: { userId },
        })
      } catch (dbError) {
        console.error('Failed to query database state:', dbError)
      }

      throw error
    }
  }

  private async getUserWithPermissions(userId: string) {
    return prisma.user.findUniqueOrThrow({
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
  }

  private async getEffectivePermissions(userId: string): Promise<string[]> {
    const user = await prisma.user.findUniqueOrThrow({
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

    const permissions = new Set<string>()
    user.UserRole.forEach((userRole) => {
      userRole.role.permissions.forEach((rolePermission) => {
        permissions.add(rolePermission.permission.name)
      })
    })

    return Array.from(permissions)
  }

  private async logActivity(
    userId: string,
    action: string,
    resource?: string | null,
    metadata?: unknown,
    ipAddress?: string,
    userAgent?: string
  ) {
    return prisma.activityLog.create({
      data: {
        action,
        ipAddress,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metadata: metadata as any,
        resource,
        userAgent,
        userId,
      },
    })
  }
}
