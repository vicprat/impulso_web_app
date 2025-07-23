'use client'

import { Calendar, Mail, Phone, Shield, Tag, User } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserById } from '@/modules/user/hooks/management'
import { Button } from '@/src/components/ui/button'
import { replaceRouteParams, ROUTES } from '@/src/config/routes'

export default function UserDetailPage() {
  const params = useParams()
  const userId = params.id as string

  const { data: user, isError, isLoading } = useUserById(userId)

  if (isLoading) {
    return (
      <div className='space-y-6 p-4 md:p-6'>
        <Card className='shadow-elevation-1'>
          <CardHeader className='flex flex-row items-center gap-4'>
            <div className='size-24 animate-pulse rounded-full bg-muted' />
            <div className='w-full space-y-2'>
              <div className='h-8 w-1/2 animate-pulse bg-muted' />
              <div className='h-6 w-1/3 animate-pulse bg-muted' />
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='h-6 w-full animate-pulse bg-muted' />
            <div className='h-6 w-full animate-pulse bg-muted' />
            <div className='h-6 w-full animate-pulse bg-muted' />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isError || !user) {
    return (
      <div className='flex h-full items-center justify-center p-6'>
        <Card className='w-full max-w-md bg-error-container p-6 text-center shadow-elevation-2'>
          <h2 className='text-2xl font-bold text-on-error'>Error</h2>
          <p className='text-on-error/80'>
            No se pudo cargar la información del usuario. Por favor, intenta de nuevo más tarde.
          </p>
        </Card>
      </div>
    )
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase()
  }

  return (
    <div className='space-y-6 p-4 md:p-6'>
      {/* User Header Card */}
      <Card className='overflow-hidden shadow-elevation-1'>
        <div className='bg-surface-container-low p-6'>
          <div className='flex flex-col items-center gap-4 text-center md:flex-row md:text-left'>
            <Avatar className='size-24 border-4 border-surface shadow-elevation-2 '>
              <AvatarImage
                src={user.profile?.avatarUrl ?? user.shopifyData?.imageUrl}
                alt={`${user.firstName} ${user.lastName}`}
              />
              <AvatarFallback className='text-3xl font-semibold'>
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className='text-3xl font-bold text-foreground'>
                {user.firstName} {user.lastName}
              </h1>
              <p className='text-lg text-muted-foreground'>{user.email}</p>
              <Link href={replaceRouteParams(ROUTES.PUBLIC.PROFILE_DETAIL.PATH, { id: user.id })}>
                <Button variant='container-success' className='mt-4'>
                  <User className='mr-2 size-4' />
                  Ver Perfil Público
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* User Details Grid */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Main Info Card */}
        <Card className='shadow-elevation-1 lg:col-span-2'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-foreground'>
              <User className='size-5' /> Información General
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-3'>
              <Mail className='size-5 text-muted-foreground' />
              <span className='text-foreground'>{user.email}</span>
            </div>
            <div className='flex items-center gap-3'>
              <Phone className='size-5 text-muted-foreground' />
              <span className='text-foreground'>
                {user.shopifyData?.phoneNumber ?? 'No disponible'}
              </span>
            </div>
            <div className='flex items-center gap-3'>
              <Calendar className='size-5 text-muted-foreground' />
              <span className='text-foreground'>
                Miembro desde {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Roles and Status Card */}
        <Card className='shadow-elevation-1'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-foreground'>
              <Shield className='size-5' /> Roles y Estado
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='font-medium text-muted-foreground'>Estado</span>
              <Badge
                className={
                  user.isActive
                    ? 'bg-success-container text-success'
                    : 'bg-error-container text-on-error'
                }
              >
                {user.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            <div className='space-y-2'>
              <h4 className='font-medium text-muted-foreground'>Roles</h4>
              <div className='flex flex-wrap gap-2'>
                {user.roles.map((role: string) => (
                  <Badge
                    key={role}
                    variant='secondary'
                    className='bg-primary-container text-on-primary-container'
                  >
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shopify Info Card */}
        {user.shopifyData && (
          <Card className='shadow-elevation-1 lg:col-span-3'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-foreground'>
                <Tag className='size-5' /> Datos de Shopify
              </CardTitle>
            </CardHeader>
            <CardContent className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div>
                <p className='font-medium text-muted-foreground'>ID de Cliente</p>
                <p className='text-sm text-foreground'>{user.shopifyCustomerId ?? 'No asignado'}</p>
              </div>
              <div>
                <p className='font-medium text-muted-foreground'>Pedidos Realizados</p>
                <p className='text-sm text-foreground'>{user.shopifyData.orderCount}</p>
              </div>
              <div className='md:col-span-2'>
                <p className='font-medium text-muted-foreground'>Dirección por Defecto</p>
                <p className='text-sm text-foreground'>
                  {user.shopifyData.defaultAddress
                    ? `${user.shopifyData.defaultAddress.address1}, ${user.shopifyData.defaultAddress.city}, ${user.shopifyData.defaultAddress.province} ${user.shopifyData.defaultAddress.zip}, ${user.shopifyData.defaultAddress.country}`
                    : 'No disponible'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
