import { useCallback, useEffect, useState } from 'react'

import { ROLES } from '@/config/Roles'
import { useAuth } from '@/modules/auth/context/useAuth'
import { useCustomerOrders } from '@/modules/customer/hooks'
import { useGetDiscounts } from '@/services/product/queries'

const COUPON_CODE = 'BIENVENIDOIMPULSO'

export function useWelcomeCoupon() {
  const { hasRole, isAuthenticated, isLoading: authLoading, user } = useAuth()
  const [hasShownWelcome, setHasShownWelcome] = useState(false)
  const [shouldShowDialog, setShouldShowDialog] = useState(false)

  const { data: ordersData, isLoading: ordersLoading } = useCustomerOrders(
    { first: 1 },
    { enabled: isAuthenticated }
  )

  const { data: discounts = [], isLoading: discountsLoading } = useGetDiscounts({
    appliesTo: 'ALL_PRODUCTS',
    isActive: true,
    search: 'BIENVENIDOIMPULSO',
  })

  const welcomeCoupon = discounts.find(
    (discount: any) =>
      discount.code === COUPON_CODE && discount.type === 'PERCENTAGE' && discount.isActive
  )

  const hasOrders = (ordersData?.customer?.orders?.edges?.length ?? 0) > 0

  const hasValidRole = hasRole(ROLES.CUSTOMER.NAME) || hasRole(ROLES.VIP_CUSTOMER.NAME)

  const checkShouldShowDialog = useCallback(() => {
    if (authLoading || ordersLoading || discountsLoading) return false
    if (!isAuthenticated || !user) return false
    if (!hasValidRole) return false
    if (hasShownWelcome) return false
    if (hasOrders) return false
    if (!welcomeCoupon) return false

    return true
  }, [
    authLoading,
    ordersLoading,
    discountsLoading,
    isAuthenticated,
    user,
    hasValidRole,
    hasShownWelcome,
    hasOrders,
    welcomeCoupon,
  ])

  useEffect(() => {
    const shouldShow = checkShouldShowDialog()
    setShouldShowDialog(shouldShow)
  }, [checkShouldShowDialog])

  const markAsShown = useCallback(() => {
    setHasShownWelcome(true)
    setShouldShowDialog(false)
  }, [])

  return {
    hasOrders,
    isAuthenticated,
    isLoading: authLoading || ordersLoading || discountsLoading,
    markAsShown,
    shouldShowDialog,
    user,
    welcomeCoupon,
  }
}
