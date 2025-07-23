import { Dashboard } from '@/src/components/Dashboard'
import { ROLES } from '@/src/config/Roles'
import { getServerSession } from '@/src/modules/auth/server/server'

export default async function Page() {
  const session = await getServerSession()
  const userRoles = session?.user.roles ?? []

  let primaryRole = 'customer'
  if (userRoles.includes(ROLES.ADMIN.NAME)) {
    primaryRole = ROLES.ADMIN.NAME
  } else if (userRoles.includes(ROLES.MANAGER.NAME)) {
    primaryRole = ROLES.MANAGER.NAME
  } else if (userRoles.includes(ROLES.ARTIST.NAME)) {
    primaryRole = ROLES.ARTIST.NAME
  } else if (userRoles.includes(ROLES.SUPPORT.NAME)) {
    primaryRole = ROLES.SUPPORT.NAME
  } else if (userRoles.includes(ROLES.VIP_CUSTOMER.NAME)) {
    primaryRole = ROLES.VIP_CUSTOMER.NAME
  }

  return <Dashboard role={primaryRole} userId={session?.user.id} />
}
