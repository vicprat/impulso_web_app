export const ROLES = {
  ADMIN: {
    NAME: 'admin',
  },

  ARTIST: {
    NAME: 'artist',
  },
  CUSTOMER: {
    NAME: 'customer',
  },
  MANAGER: {
    NAME: 'manager',
  },
  SUPPORT: {
    NAME: 'support',
  },
  VIP_CUSTOMER: {
    NAME: 'vip_customer',
  },
} as const

export type RoleKey = keyof typeof ROLES
export type RoleValue = (typeof ROLES)[RoleKey]['NAME']

export const ALL_ROLES = Object.values(ROLES).map((role) => role.NAME)
