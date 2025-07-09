export const PERMISSIONS = {
  ACCESS_ADMIN: 'access_admin',
  CANCEL_ORDERS: 'cancel_orders',
  CREATE_ORDERS: 'create_orders',
  EXPORT_DATA: 'export_data',
  MANAGE_ADDRESSES: 'manage_addresses',
  MANAGE_ALL_BLOG_POSTS: 'manage_all_blog_posts',
  MANAGE_ALL_ORDERS: 'manage_all_orders',
  MANAGE_CART: 'manage_cart',
  MANAGE_EVENTS: 'manage_events',
  MANAGE_INVENTORY: 'manage_inventory',
  MANAGE_OWN_BLOG_POSTS: 'manage_own_blog_posts',
  MANAGE_OWN_PRODUCTS: 'manage_own_products',
  MANAGE_PRIVATE_ROOMS: 'manage_private_rooms',
  MANAGE_PRODUCTS: 'manage_products',
  MANAGE_ROLES: 'manage_roles',
  MANAGE_USERS: 'manage_users',
  UPDATE_PROFILE: 'update_profile',
  VIEW_ACQUIRED_TICKETS: 'view_acquired_tickets',
  VIEW_ADDRESSES: 'view_addresses',
  VIEW_ALL_ORDERS: 'view_all_orders',
  VIEW_ANALYTICS: 'view_analytics',
  VIEW_LOGS: 'view_logs',
  VIEW_ORDERS: 'view_orders',
  VIEW_PRIVATE_ROOMS: 'view_private_rooms',
  VIEW_PRODUCTS: 'view_products',
  VIEW_PROFILE: 'view_profile',
} as const

export type PermissionKey = keyof typeof PERMISSIONS
export type PermissionValue = (typeof PERMISSIONS)[PermissionKey]

export const ALL_PERMISSIONS = Object.values(PERMISSIONS)
