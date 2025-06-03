import { PrismaClient } from '@prisma/client';

import {
  exchangeCodeForTokens,
  refreshAccessToken,
  getCustomerInfo,
  calculateExpiresAt,
  isTokenExpired,
} from './utils';
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

  // Autenticar usuario con código de autorización

async authenticateWithCode(code: string, codeVerifier: string): Promise<AuthSession> {
  try {
    // 1. Intercambiar código por tokens
    console.log('🔄 Paso 1: Intercambiando código por tokens...');
    const tokenResponse = await exchangeCodeForTokens(this.config, code, codeVerifier);
    console.log('✅ Tokens obtenidos exitosamente');
    
    // 2. Obtener información del customer de Shopify
    console.log('🔄 Paso 2: Obteniendo información del cliente...');
    const customerInfo = await getCustomerInfo(this.config, tokenResponse.access_token);
    console.log('✅ Información del cliente obtenida:', {
      id: customerInfo.id,
      email: customerInfo.email
    });
    
    // 3. Crear o actualizar usuario en nuestra DB
    console.log('🔄 Paso 3: Guardando usuario en base de datos...');
    const user = await this.upsertUser(customerInfo);
    console.log('✅ Usuario guardado:', { 
      id: user.id, 
      email: user.email,
      shopifyCustomerId: user.shopifyCustomerId 
    });
    
    // 4. Guardar tokens en DB
    console.log('🔄 Paso 4: Guardando tokens en base de datos...');
    const expiresAt = calculateExpiresAt(tokenResponse.expires_in);
    console.log('📅 Token expirará en:', expiresAt);
    
    const savedSession = await this.saveSessionToken(user.id, tokenResponse, expiresAt);
    console.log('✅ Tokens guardados en base de datos:', {
      sessionId: savedSession.id,
      userId: savedSession.userId,
      accessToken: savedSession.accessToken.substring(0, 20) + '...',
      isActive: savedSession.isActive,
      expiresAt: savedSession.expiresAt
    });
    
    // 5. Verificar inmediatamente que se guardó correctamente
    console.log('🔍 Verificando token guardado en BD...');
    const verifySession = await prisma.sessionToken.findUnique({
      where: { accessToken: tokenResponse.access_token },
      include: { user: true }
    });
    console.log('📊 Verificación de sesión:', verifySession ? '✅ Encontrada' : '❌ No encontrada');
    if (verifySession) {
      console.log('📋 Detalles de la sesión verificada:', {
        id: verifySession.id,
        userId: verifySession.userId,
        userEmail: verifySession.user.email,
        isActive: verifySession.isActive,
        expiresAt: verifySession.expiresAt,
        createdAt: verifySession.createdAt
      });
    }
    
    // 6. Obtener roles y permisos del usuario
    console.log('🔄 Paso 5: Obteniendo roles y permisos...');
      const userWithPermissions = await this.getUserWithPermissions(user.id);
    const effectivePermissions = await this.getEffectivePermissions(user.id);
    console.log('✅ Roles y permisos obtenidos');
    
    // 7. Registrar login en logs
    console.log('🔄 Paso 6: Registrando actividad...');
    await this.logActivity(user.id, 'login', null, {
      loginMethod: 'oauth_code',
      shopifyCustomerId: customerInfo.id
    });
    console.log('✅ Actividad registrada');

    console.log('🎉 === AUTENTICACIÓN COMPLETADA EXITOSAMENTE ===');
    
     return {
      user: {
        id: user.id,
        shopifyCustomerId: user.shopifyCustomerId,
        email: user.email,
        firstName: user.firstName ?? undefined,
        lastName: user.lastName ?? undefined,
        roles: userWithPermissions.roles.map(ur => ur.role.name),
        permissions: effectivePermissions, // ✅ Permisos efectivos
      },
      tokens: {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        idToken: tokenResponse.id_token,
        expiresAt,
      },
    };
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    throw new Error('Authentication failed');
  }
}

  // Renovar sesión con refresh token
  async refreshSession(refreshToken: string): Promise<AuthSession | null> {
    try {
      // 1. Buscar sesión existente
      const existingSession = await prisma.sessionToken.findUnique({
        where: { refreshToken },
        include: { user: true },
      });

      if (!existingSession || !existingSession.isActive) {
        return null;
      }

      // 2. Renovar tokens con Shopify
      const tokenResponse = await refreshAccessToken(this.config, refreshToken);
      
      // 3. Actualizar tokens en DB
      const expiresAt = calculateExpiresAt(tokenResponse.expires_in);
      await prisma.sessionToken.update({
        where: { id: existingSession.id },
        data: {
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          expiresAt,
          updatedAt: new Date(),
        },
      });

      // 4. Obtener usuario con permisos actualizados
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
        permissions: effectivePermissions, // ✅ Permisos efectivos
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

  // Obtener sesión por access token
async getSessionByAccessToken(accessToken: string): Promise<AuthSession | null> {
  try {
    console.log('🔍 === BUSCANDO SESIÓN POR ACCESS TOKEN ===');
    
    // Validaciones iniciales más robustas
    if (!accessToken) {
      console.log('❌ Token no proporcionado (null/undefined)');
      return null;
    }

    const trimmedToken = accessToken.trim();
    if (!trimmedToken) {
      console.log('❌ Token vacío después de trim');
      return null;
    }

    console.log('🔧 Token details:', {
      originalLength: accessToken.length,
      trimmedLength: trimmedToken.length,
      firstChars: trimmedToken.substring(0, 50),
      lastChars: trimmedToken.substring(trimmedToken.length - 10),
      hasWhitespace: accessToken !== trimmedToken,
      encoding: Buffer.from(trimmedToken).toString('base64').substring(0, 20) + '...'
    });

    // Intentar búsqueda exacta primero
    console.log('🔍 Intentando búsqueda exacta...');
    let session = await prisma.sessionToken.findUnique({
      where: { accessToken: trimmedToken },
      include: { user: true },
    });

    if (!session) {
      console.log('❌ Búsqueda exacta falló, intentando alternativas...');
      
      // Intentar búsqueda con el token original (sin trim)
      if (accessToken !== trimmedToken) {
        console.log('🔍 Intentando con token original (sin trim)...');
        session = await prisma.sessionToken.findUnique({
          where: { accessToken: accessToken },
          include: { user: true },
        });
      }

      if (!session) {
        // Búsqueda de debugging - buscar tokens similares
        console.log('🔍 Búsqueda de debugging - tokens similares...');
        const prefix = trimmedToken.substring(0, 20);
        const similarTokens = await prisma.sessionToken.findMany({
          where: {
            isActive: true,
            accessToken: {
              startsWith: prefix
            }
          },
          include: { user: true },
          take: 10
        });

        console.log('🔍 Tokens similares encontrados:', similarTokens.length);
        
        for (const similarToken of similarTokens) {
          const matches = {
            exactMatch: similarToken.accessToken === trimmedToken,
            originalMatch: similarToken.accessToken === accessToken,
            lengthMatch: similarToken.accessToken.length === trimmedToken.length,
            startsWithSame: similarToken.accessToken.startsWith(prefix),
            tokenId: similarToken.id,
            userId: similarToken.userId,
            isActive: similarToken.isActive
          };
          
          console.log('🔍 Token comparison:', matches);
          
          // Si encontramos uno que coincide exactamente pero no se encontró antes
          if (matches.exactMatch || matches.originalMatch) {
            console.log('✅ Encontrado token coincidente en búsqueda de debugging');
            session = similarToken;
            break;
          }
        }

        // Si aún no encontramos nada, mostrar todos los tokens activos para debugging
        if (!session) {
          console.log('🔍 Mostrando todos los tokens activos para debugging...');
          const allActiveSessions = await prisma.sessionToken.findMany({
            where: { isActive: true },
            select: {
              id: true,
              accessToken: true,
              userId: true,
              isActive: true,
              expiresAt: true,
              createdAt: true,
              user: {
                select: {
                  email: true
                }
              }
            },
            take: 5,
            orderBy: { createdAt: 'desc' }
          });
          
          console.log('📊 Tokens activos en BD:', allActiveSessions.map(s => ({
            id: s.id,
            accessTokenStart: s.accessToken.substring(0, 50),
            accessTokenEnd: s.accessToken.substring(s.accessToken.length - 10),
            accessTokenLength: s.accessToken.length,
            userId: s.userId,
            userEmail: s.user.email,
            isActive: s.isActive,
            expiresAt: s.expiresAt,
            createdAt: s.createdAt,
            exactMatch: s.accessToken === trimmedToken,
            originalMatch: s.accessToken === accessToken
          })));
        }
      }
    }

    if (!session) {
      console.log('❌ No se encontró sesión válida');
      return null;
    }

    console.log('✅ Sesión encontrada:', {
      id: session.id,
      userId: session.userId,
      userEmail: session.user.email,
      isActive: session.isActive,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
      tokenMatch: session.accessToken === trimmedToken ? 'EXACT' : 'PARTIAL'
    });

    if (!session.isActive) {
      console.log('❌ Sesión encontrada pero no está activa');
      return null;
    }

    // Verificar si el token ha expirado
    const isExpired = isTokenExpired(session.expiresAt);
    console.log('📅 Verificación de expiración:', {
      expiresAt: session.expiresAt,
      now: new Date(),
      isExpired: isExpired,
      timeRemaining: isExpired ? 'EXPIRED' : `${Math.floor((session.expiresAt.getTime() - Date.now()) / 1000)}s`
    });
    
    if (isExpired) {
      console.log('❌ Token ha expirado');
      return null;
    }

    console.log('✅ Sesión válida encontrada');
    
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
        permissions: effectivePermissions, // ✅ Ahora incluye permisos de roles + overrides
      },
      tokens: {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        idToken: session.idToken ?? undefined,
        expiresAt: session.expiresAt,
      },
    };
  } catch (error) {
    console.error('❌ Get session failed:', error);
    return null;
  }
}

  // Cerrar sesión
  async logout(accessToken: string): Promise<boolean> {
    try {
      const session = await prisma.sessionToken.findUnique({
        where: { accessToken },
        include: { user: true },
      });

      if (!session) {
        return false;
      }

      // Desactivar token en DB
      await prisma.sessionToken.update({
        where: { id: session.id },
        data: { isActive: false },
      });

      // Registrar logout
      await this.logActivity(session.userId, 'logout');

      return true;
    } catch (error) {
      console.error('Logout failed:', error);
      return false;
    }
  }

  // Gestión de roles y permisos
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



  // Verificar permiso
  async hasPermission(userId: string, permissionName: string): Promise<boolean> {
    const userWithPermissions = await this.getUserWithPermissions(userId);
    
    // Verificar permisos a través de roles
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

  // Métodos privados
private async upsertUser(customerInfo: CustomerInfo) {
  console.log('🔄 Upsert user iniciado para:', customerInfo.email);
  
  // Verificar si el usuario ya existe
  const existingUser = await prisma.user.findUnique({
    where: { shopifyCustomerId: customerInfo.id },
    include: { roles: true }
  });

  if (existingUser) {
    console.log('✅ Usuario existente encontrado, actualizando datos...');
    // Usuario existe, solo actualizar datos
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

  console.log('🆕 Usuario nuevo, creando con rol por defecto...');
  
  // Usuario nuevo, obtener rol por defecto desde configuración
  const defaultRoleConfig = await prisma.appConfig.findUnique({
    where: { key: 'default_user_role' }
  });
  
  const defaultRoleName = defaultRoleConfig?.value || 'customer';
  console.log('👑 Rol por defecto a asignar:', defaultRoleName);
  
  // Buscar el rol por defecto
  const defaultRole = await prisma.role.findUnique({
    where: { name: defaultRoleName }
  });

  if (!defaultRole) {
    console.error(`❌ Rol por defecto '${defaultRoleName}' no encontrado en la base de datos`);
    throw new Error(`Default role '${defaultRoleName}' not found`);
  }

  console.log('✅ Rol encontrado:', defaultRole.name);

  // Crear usuario nuevo con transacción para asegurar consistencia
  const newUser = await prisma.$transaction(async (tx) => {
    // 1. Crear el usuario
    const user = await tx.user.create({
      data: {
        shopifyCustomerId: customerInfo.id,
        email: customerInfo.email,
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        lastLoginAt: new Date(),
      },
    });

    console.log('✅ Usuario creado con ID:', user.id);

    // 2. Asignar rol por defecto
    await tx.userRole.create({
      data: {
        userId: user.id,
        roleId: defaultRole.id,
        assignedBy: 'system', // Indicar que fue asignado automáticamente
      },
    });

    console.log('✅ Rol asignado exitosamente');

    return user;
  });

  console.log('🎉 Usuario nuevo creado exitosamente con rol por defecto');
  return newUser;
}

  private async saveSessionToken(userId: string, tokens: TokenResponse, expiresAt: Date) {
    // Desactivar tokens existentes del usuario
    await prisma.sessionToken.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    // Crear nuevo token
    return prisma.sessionToken.create({
      data: {
        userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        idToken: tokens.id_token,
        expiresAt,
      },
    });
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