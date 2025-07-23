export const ROLES = {
  ADMIN: {
    DESCRIPTION: 'Administrador con acceso completo',
    NAME: 'admin',
  },
  ARTIST: {
    DESCRIPTION: 'Artista con acceso a herramientas de gestión de su perfil',
    NAME: 'artist',
  },
  CUSTOMER: {
    DESCRIPTION: 'Cliente básico del sistema',
    NAME: 'customer',
  },
  EMPLOYEE: {
    DESCRIPTION: 'Empleado de la empresa',
    NAME: 'employee',
  },
  MANAGER: {
    DESCRIPTION: 'Gerente con acceso amplio al sistema',
    NAME: 'manager',
  },
  PARTNER: {
    DESCRIPTION: 'Socio de la empresa',
    NAME: 'partner',
  },
  PROVIDER: {
    DESCRIPTION: 'Proveedor de servicios o productos',
    NAME: 'provider',
  },
  SUPPORT: {
    DESCRIPTION: 'Personal de soporte al cliente',
    NAME: 'support',
  },
  VIP_CUSTOMER: {
    DESCRIPTION: 'Cliente VIP con beneficios adicionales',
    NAME: 'vip_customer',
  },
} as const

export type RoleKey = keyof typeof ROLES
export type RoleValue = (typeof ROLES)[RoleKey]['NAME']

export const ALL_ROLES = Object.values(ROLES).map((role) => role.NAME)

export const availableRoles = Object.values(ROLES).map((role) => ({
  description: role.DESCRIPTION,
  id: role.NAME,
  name: role.NAME.charAt(0).toUpperCase() + role.NAME.slice(1).replace('_', ' '),
}))
