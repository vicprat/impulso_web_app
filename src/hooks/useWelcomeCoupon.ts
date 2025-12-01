import { useCallback, useEffect, useState } from 'react'

import { ROLES } from '@/config/Roles'
import { useAuth } from '@/modules/auth/context/useAuth'
import { useCustomerOrders } from '@/modules/customer/hooks'
import { useGetDiscounts } from '@/services/product/queries'

export function useWelcomeCoupon() {
  const { isAuthenticated, isLoading: authLoading, user, hasRole } = useAuth()
  const [hasShownWelcome, setHasShownWelcome] = useState(false)
  const [shouldShowDialog, setShouldShowDialog] = useState(false)

  // Obtener órdenes del usuario
  const { data: ordersData, isLoading: ordersLoading } = useCustomerOrders(
    { first: 1 }, // Solo necesitamos verificar si tiene al menos una orden
    { enabled: isAuthenticated }
  )

  // Obtener cupones activos
  const { data: discounts = [], isLoading: discountsLoading } = useGetDiscounts({
    appliesTo: 'ALL_PRODUCTS',
    isActive: true,
  })

  // Buscar el cupón de bienvenida específico
  const welcomeCoupon = discounts.find(
    (discount: any) =>
      discount.code === 'BIENVENIDOIMPULSO' &&
      discount.type === 'PERCENTAGE' &&
      discount.value === 10 &&
      discount.isActive
  )

  // Verificar si el usuario tiene órdenes
  const hasOrders = (ordersData?.customer?.orders?.edges?.length ?? 0) > 0

  // Verificar si el usuario tiene un rol válido (customer o vip_customer)
  const hasValidRole =
    hasRole(ROLES.CUSTOMER.NAME) || hasRole(ROLES.VIP_CUSTOMER.NAME)

  // Verificar si debe mostrar el dialog
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

  // Efecto para verificar si debe mostrar el dialog
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
