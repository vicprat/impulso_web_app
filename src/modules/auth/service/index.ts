import { PrismaClient } from '@prisma/client';

import {
  exchangeCodeForTokens,
  refreshAccessToken,
  getCustomerInfo,
  calculateExpiresAt,
} from '../utils';
import { AuthConfig, CustomerInfo, TokenResponse } from '@/types';

const prisma = new PrismaClient();

export interface AuthSession {
  user: {
    id: string;
    shopifyCustomerId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles: string[];
    permissions: string[];
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    idToken?: string;
    expiresAt: Date;
  };
}

export class AuthService {
  private config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
  }

  async authenticateWithCode(code: string, codeVerifier: string): Promise<AuthSession> {
    try {
      const tokenResponse = await exchangeCodeForTokens(this.config, code, codeVerifier);
      const customerInfo = await getCustomerInfo(this.config, tokenResponse.access_token);
      const user = await this.upsertUser(customerInfo);
      const expiresAt = calculateExpiresAt(tokenResponse.expires_in);
      
      try {
        await this.saveSessionToken(user.id, tokenResponse, expiresAt);
      } catch (saveError) {
        console.error('Failed to save session token:', saveError);
        throw saveError;
      }

      try {
        const verifySession = await prisma.sessionToken.findUnique({
          where: { accessToken: tokenResponse.access_token },
          include: { user: true }
        });
        if (!verifySession) {
          console.error('Session not found in database after saving');
        }
      } catch (verifyError) {
        console.error('Error verifying saved session:', verifyError);
      }

      const userWithPermissions = await this.getUserWithPermissions(user.id);
      const effectivePermissions = await this.getEffectivePermissions(user.id);
      
      await this.logActivity(user.id, 'login', null, {
        loginMethod: 'oauth_code',
        shopifyCustomerId: customerInfo.id
      });

      return {
        user: {
          id: user.id,
          shopifyCustomerId: user.shopifyCustomerId,
          email: user.email,
          firstName: user.firstName ?? undefined,
          lastName: user.lastName ?? undefined,
          roles: userWithPermissions.roles.map(ur => ur.role.name),
          permissions: effectivePermissions,
        },
        tokens: {
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          idToken: tokenResponse.id_token,
          expiresAt,
        },
      };
    } catch (error) {
      console.error('Authentication failed:', error);
      throw new Error('Authentication failed');
    }
  }

  async refreshSession(refreshToken: string): Promise<AuthSession | null> {
    try {
      const existingSession = await prisma.sessionToken.findFirst({
        where: { 
          refreshToken: refreshToken.trim(),
          isActive: true,
          expiresAt: {
            gt: new Date()
          }
        },
        include: { user: true },
      });

      if (!existingSession) {
        return null;
      }

      const tokenResponse = await refreshAccessToken(this.config, refreshToken.trim());
      const expiresAt = calculateExpiresAt(tokenResponse.expires_in);
      
      await this.saveSessionToken(existingSession.userId, {
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token,
        expires_in: tokenResponse.expires_in
      } as TokenResponse, expiresAt);

      const userWithPermissions = await this.getUserWithPermissions(existingSession.userId);
      const effectivePermissions = await this.getEffectivePermissions(existingSession.userId);

      return {
        user: {
          id: existingSession.user.id,
          shopifyCustomerId: existingSession.user.shopifyCustomerId,
          email: existingSession.user.email,
          firstName: existingSession.user.firstName ?? undefined,
          lastName: existingSession.user.lastName ?? undefined,
          roles: userWithPermissions.roles.map(ur => ur.role.name),
          permissions: effectivePermissions,
        },
        tokens: {
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          expiresAt,
        },
      };
    } catch (error) {
      console.error('Session refresh failed:', error);
      return null;
    }
  }

  async getSessionByAccessToken(accessToken: string): Promise<AuthSession | null> {
    try {
      if (!accessToken) {
        return null;
      }

      const trimmedToken = accessToken.trim();
      if (!trimmedToken) {
        return null;
      }

      let session = await prisma.sessionToken.findFirst({
        where: {
          accessToken: trimmedToken,
          isActive: true,
          expiresAt: {
            gt: new Date()
          }
        },
        include: { user: true },
      });

      if (!session && accessToken !== trimmedToken) {
        session = await prisma.sessionToken.findFirst({
          where: {
            accessToken: accessToken,
            isActive: true,
            expiresAt: {
              gt: new Date()
            }
          },
          include: { user: true },
        });
      }

      if (!session) {
        return null;
      }
      
      const userWithPermissions = await this.getUserWithPermissions(session.userId);
      const effectivePermissions = await this.getEffectivePermissions(session.userId);

      return {
        user: {
          id: session.user.id,
          shopifyCustomerId: session.user.shopifyCustomerId,
          email: session.user.email,
          firstName: session.user.firstName ?? undefined,
          lastName: session.user.lastName ?? undefined,
          roles: userWithPermissions.roles.map(ur => ur.role.name),
          permissions: effectivePermissions,
        },
        tokens: {
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          idToken: session.idToken ?? undefined,
          expiresAt: session.expiresAt,
        },
      };
    } catch (error) {
      console.error('Get session failed:', error);
      return null;
    }
  }

  async logout(accessToken: string): Promise<boolean> {
    try {
      const session = await prisma.sessionToken.findFirst({
        where: { 
          accessToken: accessToken.trim(),
          isActive: true 
        },
        include: { user: true },
      });

      if (!session) {
        return false;
      }

      await prisma.sessionToken.delete({
        where: { id: session.id },
      });

      await this.logActivity(session.userId, 'logout');

      return true;
    } catch (error) {
      console.error('Logout failed:', error);
      return false;
    }
  }

  async cleanupExpiredTokens(): Promise<void> {
    try {
      await prisma.sessionToken.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { isActive: false },
          ]
        }
      });
    } catch (error) {
      console.error('Error cleaning tokens:', error);
    }
  }

  async assignRole(userId: string, roleName: string, assignedBy?: string): Promise<void> {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new Error(`Role ${roleName} not found`);

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId,
          roleId: role.id,
        },
      },
      update: {},
      create: {
        userId,
        roleId: role.id,
        assignedBy,
      },
    });
  }

  async removeRole(userId: string, roleName: string): Promise<void> {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new Error(`Role ${roleName} not found`);

    await prisma.userRole.deleteMany({
      where: {
        userId,
        roleId: role.id,
      },
    });
  }

  async hasPermission(userId: string, permissionName: string): Promise<boolean> {
    const userWithPermissions = await this.getUserWithPermissions(userId);
    
    for (const userRole of userWithPermissions.roles) {
      const rolePermission = await prisma.rolePermission.findFirst({
        where: {
          roleId: userRole.roleId,
          permission: { name: permissionName },
        },
      });
      if (rolePermission) {
        return true;
      }
    }

    return false;
  }

  private async upsertUser(customerInfo: CustomerInfo) {
    const existingUser = await prisma.user.findUnique({
      where: { shopifyCustomerId: customerInfo.id },
      include: { roles: true }
    });

    if (existingUser) {
      return prisma.user.update({
        where: { id: existingUser.id },
        data: {
          email: customerInfo.email,
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          lastLoginAt: new Date(),
        },
      });
    }
    
    const defaultRoleConfig = await prisma.appConfig.findUnique({
      where: { key: 'default_user_role' }
    });
    
    const defaultRoleName = defaultRoleConfig?.value || 'customer';
    
    const defaultRole = await prisma.role.findUnique({
      where: { name: defaultRoleName }
    });

    if (!defaultRole) {
      throw new Error(`Default role '${defaultRoleName}' not found`);
    }

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          shopifyCustomerId: customerInfo.id,
          email: customerInfo.email,
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          lastLoginAt: new Date(),
        },
      });

      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: defaultRole.id,
          assignedBy: 'system',
        },
      });

      return user;
    });

    return newUser;
  }

  private async saveSessionToken(userId: string, tokens: TokenResponse, expiresAt: Date) {
    try {
      await prisma.sessionToken.deleteMany({
        where: { userId },
      });

      await prisma.sessionToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      });

      const tokenData = {
        userId,
        accessToken: tokens.access_token.trim(),
        refreshToken: tokens.refresh_token.trim(),
        idToken: tokens.id_token?.trim(),
        expiresAt,
        isActive: true,
      };

      const newToken = await prisma.sessionToken.create({
        data: tokenData,
      });

      const immediateCheck = await prisma.sessionToken.findUnique({
        where: { id: newToken.id },
        include: { user: true }
      });
      
      if (!immediateCheck) {
        console.error('Immediate verification failed - token not found by ID');
      }

      return newToken;
      
    } catch (error) {
      console.error('saveSessionToken failed:', error);
      
      try {
        await prisma.sessionToken.findMany({
          where: { userId },
          select: { id: true, accessToken: true, isActive: true, expiresAt: true }
        });
      } catch (dbError) {
        console.error('Failed to query database state:', dbError);
      }
      
      throw error;
    }
  }

  private async getUserWithPermissions(userId: string) {
    return prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        roles: {
          include: { 
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          },
        },
      },
    });
  }

  private async getEffectivePermissions(userId: string): Promise<string[]> {
    const userWithRoles = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        roles: {
          include: { 
            role: {
              include: {
                permissions: {
                  include: { permission: true }
                }
              }
            }
          }
        }
      },
    });

    const permissions = new Set<string>();
    userWithRoles.roles.forEach(userRole => {
      userRole.role.permissions.forEach(rolePermission => {
        permissions.add(rolePermission.permission.name);
      });
    });

    return Array.from(permissions);
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
        userId,
        action,
        resource,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metadata: metadata as any,
        ipAddress,
        userAgent,
      },
    });
  }
}