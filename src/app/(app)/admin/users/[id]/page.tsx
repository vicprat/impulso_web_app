'use client'

import {
  ArrowLeft,
  Calendar,
  CreditCard,
  DollarSign,
  Edit,
  FileText,
  Handshake,
  Mail,
  Phone,
  Plus,
  Shield,
  Tag,
  TrendingUp,
  User,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'

import { Dialog } from '@/components/Dialog'
import { Form } from '@/components/Forms'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Currency } from '@/components/ui/currency'
import { useUserById } from '@/modules/user/hooks/management'
import { useAdminUserProfile } from '@/modules/user/hooks/useAdminUserProfile'
import { useUserBankAccounts } from '@/modules/user/hooks/useUserBankAccounts'
import { useUserFinance } from '@/modules/user/hooks/useUserFinance'
import { ROUTES } from '@/src/config/routes'

export default function UserDetailPage() {
  const params = useParams()
  const userId = params.id as string
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [profileEditDialogOpen, setProfileEditDialogOpen] = useState(false)
  const [linksEditDialogOpen, setLinksEditDialogOpen] = useState(false)
  const [artistTypeEditDialogOpen, setArtistTypeEditDialogOpen] = useState(false)

  const { data: user, isError, isLoading } = useUserById(userId)
  const primaryRole = user?.roles[0] || 'customer'

  console.log('User data:', user)
  console.log('Primary role:', primaryRole)
  console.log('User ID:', userId)

  const { data: financeData, isLoading: financeLoading } = useUserFinance(
    userId,
    user ? primaryRole : undefined
  )
  const { data: bankAccountsData, isLoading: bankAccountsLoading } = useUserBankAccounts(userId)

  // Hook para manejar el perfil del usuario por parte del admin
  const {
    createLink,
    deleteLink,
    isCreatingLink,
    isDeletingLink,
    // Links functionality
    isLinksLoading,
    isProfileLoading,
    isUpdatingLink,
    isUpdatingLinksOrder,
    isUpdatingProfile,
    links: userLinks,
    profile: userProfile,
    updateLink,
    updateLinksOrder,
    updateProfile,
  } = useAdminUserProfile(userId)

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

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Sin nombre'

  // Componentes específicos por rol
  const renderRoleSpecificContent = () => {
    switch (primaryRole) {
      case 'provider':
        return <ProviderSection user={user} financeData={financeData} isLoading={financeLoading} />
      case 'employee':
        return <EmployeeSection user={user} financeData={financeData} isLoading={financeLoading} />
      case 'partner':
        return <PartnerSection user={user} financeData={financeData} isLoading={financeLoading} />
      case 'artist':
        return (
          <ArtistSection
            user={user}
            financeData={financeData}
            isLoading={financeLoading}
            onEditProfile={() => setProfileEditDialogOpen(true)}
            onEditLinks={() => setLinksEditDialogOpen(true)}
            onEditArtistType={() => setArtistTypeEditDialogOpen(true)}
          />
        )
      case 'customer':
      case 'vip_customer':
        return <CustomerSection user={user} financeData={financeData} isLoading={financeLoading} />
      default:
        return <DefaultSection user={user} />
    }
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
                alt={fullName}
              />
              <AvatarFallback className='text-3xl font-semibold'>
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1'>
              <h1 className='text-3xl font-bold text-foreground'>{fullName}</h1>
              <p className='text-lg text-muted-foreground'>{user.email}</p>
              <div className='mt-2 flex flex-wrap gap-2'>
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
            <div className='flex flex-col gap-2'>
              <Link href={ROUTES.ADMIN.USERS.MAIN.PATH}>
                <Button variant='ghost' size='sm'>
                  <ArrowLeft className='mr-2 size-4' />
                  Volver
                </Button>
              </Link>
              <Button onClick={() => setEditDialogOpen(true)}>
                <Edit className='mr-2 size-4' />
                Editar
              </Button>
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
            {user.lastLoginAt && (
              <div className='flex items-center gap-3'>
                <Calendar className='size-5 text-muted-foreground' />
                <span className='text-foreground'>
                  Último acceso: {new Date(user.lastLoginAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Roles and Status Card */}
        <Card className='shadow-elevation-1'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-foreground'>
              <Shield className='size-5' /> Estado
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
              <h4 className='font-medium text-muted-foreground'>Roles Asignados</h4>
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
      </div>

      {/* Bank Accounts Section */}
      {bankAccountsData && bankAccountsData.bankAccounts.length > 0 && (
        <Card className='shadow-elevation-1'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-foreground'>
              <CreditCard className='size-5' /> Cuentas Bancarias Relacionadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {bankAccountsData.bankAccounts.map((account) => (
                <Card key={account.id} className='shadow-elevation-1'>
                  <CardContent className='p-4'>
                    <div className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <h4 className='font-semibold'>{account.name}</h4>
                        <Badge variant='outline'>{account.bankName}</Badge>
                      </div>
                      <div className='space-y-1 text-sm'>
                        <p className='flex justify-between'>
                          <span>Saldo:</span>
                          <Currency amount={account.currentBalance} />
                        </p>
                        <p className='flex justify-between'>
                          <span>Movimientos:</span>
                          <span>{account.movementsCount}</span>
                        </p>
                        {account.lastMovement && (
                          <p className='flex justify-between'>
                            <span>Último:</span>
                            <span className='text-xs'>
                              {new Date(account.lastMovement.date).toLocaleDateString()}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role-Specific Content */}
      {renderRoleSpecificContent()}

      {/* Shopify Info Card */}
      {user.shopifyData && (
        <Card className='shadow-elevation-1'>
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

      {/* Edit User Dialog */}
      <Dialog.Form
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title={`Editar Usuario - ${fullName}`}
        description='Modifica la información del usuario y sus roles.'
      >
        <Form.Artist
          user={user}
          onSuccess={() => {
            setEditDialogOpen(false)
            // Refetch user data
            window.location.reload()
          }}
          onCancel={() => setEditDialogOpen(false)}
        />
      </Dialog.Form>

      {/* Edit Profile Dialog - Only for Artists */}
      {primaryRole === 'artist' && (
        <Dialog.Form
          open={profileEditDialogOpen}
          onOpenChange={setProfileEditDialogOpen}
          title={`Editar Perfil de Artista - ${fullName}`}
          description='Modifica la información del perfil del artista.'
          maxWidth='5xl'
          contentClassName='max-h-[85vh] overflow-y-auto'
        >
          <div className='space-y-4 pr-2'>
            {isProfileLoading ? (
              <div className='flex items-center justify-center p-8'>
                <div className='size-8 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
              </div>
            ) : (
              <Form.Profile
                profile={userProfile}
                onSave={updateProfile}
                isLoading={isUpdatingProfile}
                compact={true}
              />
            )}
          </div>
        </Dialog.Form>
      )}

      {/* Edit Links Dialog - Only for Artists */}
      {primaryRole === 'artist' && (
        <Dialog.Form
          open={linksEditDialogOpen}
          onOpenChange={setLinksEditDialogOpen}
          title={`Editar Links de Artista - ${fullName}`}
          description='Modifica los enlaces del artista.'
          maxWidth='4xl'
          contentClassName='max-h-[85vh] overflow-y-auto'
        >
          <div className='space-y-4 pr-2'>
            {isLinksLoading ? (
              <div className='flex items-center justify-center p-8'>
                <div className='size-8 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
              </div>
            ) : (
              <Form.AdminLinks
                userId={userId}
                links={userLinks || []}
                isLoading={isLinksLoading}
                isCreating={isCreatingLink}
                isUpdating={isUpdatingLink}
                isDeleting={isDeletingLink}
                isUpdatingOrder={isUpdatingLinksOrder}
                onCreateLink={createLink}
                onUpdateLink={(linkId, data) => updateLink({ data, linkId })}
                onDeleteLink={deleteLink}
                onUpdateLinksOrder={updateLinksOrder}
              />
            )}
          </div>
        </Dialog.Form>
      )}

      {/* Edit Artist Type Dialog - Only for Artists */}
      {primaryRole === 'artist' && (
        <Dialog.Form
          open={artistTypeEditDialogOpen}
          onOpenChange={setArtistTypeEditDialogOpen}
          title={`Editar Tipo de Artista - ${fullName}`}
          description='Modifica el tipo de artista.'
        >
          <ArtistTypeEditForm
            user={user}
            onSuccess={() => {
              setArtistTypeEditDialogOpen(false)
              window.location.reload()
            }}
            onCancel={() => setArtistTypeEditDialogOpen(false)}
          />
        </Dialog.Form>
      )}
    </div>
  )
}

// Componentes específicos por rol
function ProviderSection({
  financeData,
  isLoading,
  user,
}: {
  user: any
  financeData: any
  isLoading: boolean
}) {
  const metrics = financeData?.financialMetrics

  return (
    <Card className='shadow-elevation-1'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-foreground'>
          <Users className='size-5' /> Información de Proveedor
        </CardTitle>
      </CardHeader>
      <CardContent className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <div>
          <p className='font-medium text-muted-foreground'>Movimientos Relacionados</p>
          <p className='text-sm text-foreground'>
            {isLoading ? (
              <span className='animate-pulse'>Cargando...</span>
            ) : (
              metrics?.totalMovements || 0
            )}
          </p>
        </div>
        <div>
          <p className='font-medium text-muted-foreground'>Total por Pagar</p>
          <p className='text-sm text-foreground'>
            {isLoading ? (
              <span className='animate-pulse'>Cargando...</span>
            ) : (
              <Currency amount={metrics?.pendingAmount || 0} />
            )}
          </p>
        </div>
        <div>
          <p className='font-medium text-muted-foreground'>Total Pagado</p>
          <p className='text-sm text-foreground'>
            {isLoading ? (
              <span className='animate-pulse'>Cargando...</span>
            ) : (
              <Currency amount={metrics?.totalExpensesPaid || 0} />
            )}
          </p>
        </div>
        <div>
          <p className='font-medium text-muted-foreground'>Último Movimiento</p>
          <p className='text-sm text-foreground'>
            {isLoading ? (
              <span className='animate-pulse'>Cargando...</span>
            ) : metrics?.lastMovement ? (
              <span>
                {new Date(metrics.lastMovement.date).toLocaleDateString()}
                <br />
                <span className='text-xs text-muted-foreground'>
                  {metrics.lastMovement.description}
                </span>
              </span>
            ) : (
              'Sin movimientos'
            )}
          </p>
        </div>
      </CardContent>
      <CardContent className='border-t pt-4'>
        <div className='flex gap-2'>
          <Link href={`${ROUTES.ADMIN.FINANCE.ENTRIES.MAIN.PATH}?userId=${user.id}`}>
            <Button variant='outline' size='sm'>
              <FileText className='mr-2 size-4' />
              Ver Movimientos
            </Button>
          </Link>
          <Link href={`${ROUTES.ADMIN.FINANCE.ENTRIES.CREATE.PATH}?userId=${user.id}`}>
            <Button size='sm'>
              <Plus className='mr-2 size-4' />
              Crear Movimiento
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function EmployeeSection({
  financeData,
  isLoading,
  user,
}: {
  user: any
  financeData: any
  isLoading: boolean
}) {
  const metrics = financeData?.financialMetrics

  return (
    <Card className='shadow-elevation-1'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-foreground'>
          <User className='size-5' /> Información de Empleado
        </CardTitle>
      </CardHeader>
      <CardContent className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <div>
          <p className='font-medium text-muted-foreground'>Movimientos Relacionados</p>
          <p className='text-sm text-foreground'>
            {isLoading ? (
              <span className='animate-pulse'>Cargando...</span>
            ) : (
              metrics?.totalMovements || 0
            )}
          </p>
        </div>
        <div>
          <p className='font-medium text-muted-foreground'>Total por Pagar</p>
          <p className='text-sm text-foreground'>
            {isLoading ? (
              <span className='animate-pulse'>Cargando...</span>
            ) : (
              <Currency amount={metrics?.pendingAmount || 0} />
            )}
          </p>
        </div>
        <div>
          <p className='font-medium text-muted-foreground'>Total Pagado</p>
          <p className='text-sm text-foreground'>
            {isLoading ? (
              <span className='animate-pulse'>Cargando...</span>
            ) : (
              <Currency amount={metrics?.totalExpensesPaid || 0} />
            )}
          </p>
        </div>
        <div>
          <p className='font-medium text-muted-foreground'>Último Movimiento</p>
          <p className='text-sm text-foreground'>
            {isLoading ? (
              <span className='animate-pulse'>Cargando...</span>
            ) : metrics?.lastMovement ? (
              <span>
                {new Date(metrics.lastMovement.date).toLocaleDateString()}
                <br />
                <span className='text-xs text-muted-foreground'>
                  {metrics.lastMovement.description}
                </span>
              </span>
            ) : (
              'Sin movimientos'
            )}
          </p>
        </div>
      </CardContent>
      <CardContent className='border-t pt-4'>
        <div className='flex gap-2'>
          <Link href={`${ROUTES.ADMIN.FINANCE.ENTRIES.MAIN.PATH}?userId=${user.id}`}>
            <Button variant='outline' size='sm'>
              <FileText className='mr-2 size-4' />
              Ver Movimientos
            </Button>
          </Link>
          <Link href={`${ROUTES.ADMIN.FINANCE.ENTRIES.CREATE.PATH}?userId=${user.id}`}>
            <Button size='sm'>
              <Plus className='mr-2 size-4' />
              Crear Movimiento
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function PartnerSection({
  financeData,
  isLoading,
  user,
}: {
  user: any
  financeData: any
  isLoading: boolean
}) {
  const metrics = financeData?.financialMetrics

  return (
    <Card className='shadow-elevation-1'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-foreground'>
          <Handshake className='size-5' /> Información de Socio
        </CardTitle>
      </CardHeader>
      <CardContent className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <div>
          <p className='font-medium text-muted-foreground'>Movimientos Relacionados</p>
          <p className='text-sm text-foreground'>
            {isLoading ? (
              <span className='animate-pulse'>Cargando...</span>
            ) : (
              metrics?.totalMovements || 0
            )}
          </p>
        </div>
        <div>
          <p className='font-medium text-muted-foreground'>Total por Pagar</p>
          <p className='text-sm text-foreground'>
            {isLoading ? (
              <span className='animate-pulse'>Cargando...</span>
            ) : (
              <Currency amount={metrics?.pendingAmount || 0} />
            )}
          </p>
        </div>
        <div>
          <p className='font-medium text-muted-foreground'>Total Pagado</p>
          <p className='text-sm text-foreground'>
            {isLoading ? (
              <span className='animate-pulse'>Cargando...</span>
            ) : (
              <Currency amount={metrics?.totalExpensesPaid || 0} />
            )}
          </p>
        </div>
        <div>
          <p className='font-medium text-muted-foreground'>Último Movimiento</p>
          <p className='text-sm text-foreground'>
            {isLoading ? (
              <span className='animate-pulse'>Cargando...</span>
            ) : metrics?.lastMovement ? (
              <span>
                {new Date(metrics.lastMovement.date).toLocaleDateString()}
                <br />
                <span className='text-xs text-muted-foreground'>
                  {metrics.lastMovement.description}
                </span>
              </span>
            ) : (
              'Sin movimientos'
            )}
          </p>
        </div>
      </CardContent>
      <CardContent className='border-t pt-4'>
        <div className='flex gap-2'>
          <Link href={`${ROUTES.ADMIN.FINANCE.ENTRIES.MAIN.PATH}?userId=${user.id}`}>
            <Button variant='outline' size='sm'>
              <FileText className='mr-2 size-4' />
              Ver Movimientos
            </Button>
          </Link>
          <Link href={`${ROUTES.ADMIN.FINANCE.ENTRIES.CREATE.PATH}?userId=${user.id}`}>
            <Button size='sm'>
              <Plus className='mr-2 size-4' />
              Crear Movimiento
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function ArtistSection({
  financeData,
  isLoading,
  onEditArtistType,
  onEditLinks,
  onEditProfile,
  user,
}: {
  user: any
  financeData: any
  isLoading: boolean
  onEditProfile: () => void
  onEditLinks: () => void
  onEditArtistType: () => void
}) {
  const metrics = financeData?.financialMetrics
  const artistInfo = financeData?.artistInfo

  return (
    <Card className='shadow-elevation-1'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-foreground'>
          <TrendingUp className='size-5' /> Información de Artista
        </CardTitle>
      </CardHeader>
      <CardContent className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <div>
          <p className='font-medium text-muted-foreground'>Tipo de Artista</p>
          <p className='text-sm text-foreground'>
            {user.artist?.artistType ? (
              <Badge variant='secondary' className='capitalize'>
                {user.artist.artistType.toLowerCase()}
              </Badge>
            ) : (
              <span className='text-muted-foreground'>No especificado</span>
            )}
          </p>
        </div>
        <div>
          <p className='font-medium text-muted-foreground'>Movimientos Relacionados</p>
          <p className='text-sm text-foreground'>
            {isLoading ? (
              <span className='animate-pulse'>Cargando...</span>
            ) : (
              metrics?.totalMovements || 0
            )}
          </p>
        </div>
        <div>
          <p className='font-medium text-muted-foreground'>Total por Recibir</p>
          <p className='text-sm text-foreground'>
            {isLoading ? (
              <span className='animate-pulse'>Cargando...</span>
            ) : (
              <Currency amount={metrics?.pendingAmount || 0} />
            )}
          </p>
        </div>
        <div>
          <p className='font-medium text-muted-foreground'>Total Recibido</p>
          <p className='text-sm text-foreground'>
            {isLoading ? (
              <span className='animate-pulse'>Cargando...</span>
            ) : (
              <Currency amount={metrics?.totalIncomePaid || 0} />
            )}
          </p>
        </div>
        <div>
          <p className='font-medium text-muted-foreground'>Último Movimiento</p>
          <p className='text-sm text-foreground'>
            {isLoading ? (
              <span className='animate-pulse'>Cargando...</span>
            ) : metrics?.lastMovement ? (
              <span>
                {new Date(metrics.lastMovement.date).toLocaleDateString()}
                <br />
                <span className='text-xs text-muted-foreground'>
                  {metrics.lastMovement.description}
                </span>
              </span>
            ) : (
              'Sin movimientos'
            )}
          </p>
        </div>
      </CardContent>
      <CardContent className='border-t pt-4'>
        <div className='flex gap-2'>
          <Link href={`${ROUTES.ADMIN.FINANCE.ENTRIES.MAIN.PATH}?userId=${user.id}`}>
            <Button variant='outline' size='sm'>
              <FileText className='mr-2 size-4' />
              Ver Movimientos
            </Button>
          </Link>
          <Link href={`${ROUTES.ADMIN.FINANCE.ENTRIES.CREATE.PATH}?userId=${user.id}`}>
            <Button size='sm'>
              <Plus className='mr-2 size-4' />
              Crear Movimiento
            </Button>
          </Link>
          <Button onClick={onEditProfile} className='ml-auto'>
            <Edit className='mr-2 size-4' />
            Editar Perfil
          </Button>
          <Button onClick={onEditLinks} variant='outline'>
            <Edit className='mr-2 size-4' />
            Editar Links
          </Button>
          <Button onClick={onEditArtistType} variant='outline'>
            <Edit className='mr-2 size-4' />
            Editar Tipo
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function CustomerSection({
  financeData,
  isLoading,
  user,
}: {
  user: any
  financeData: any
  isLoading: boolean
}) {
  const customerInfo = financeData?.customerInfo
  const metrics = financeData?.financialMetrics

  return (
    <Card className='shadow-elevation-1'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-foreground'>
          <DollarSign className='size-5' /> Información de Cliente
        </CardTitle>
      </CardHeader>
      <CardContent className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <div>
          <p className='font-medium text-muted-foreground'>Movimientos Relacionados</p>
          <p className='text-sm text-foreground'>
            {isLoading ? (
              <span className='animate-pulse'>Cargando...</span>
            ) : (
              metrics?.totalMovements || 0
            )}
          </p>
        </div>
        <div>
          <p className='font-medium text-muted-foreground'>Total Gastado</p>
          <p className='text-sm text-foreground'>
            {isLoading ? (
              <span className='animate-pulse'>Cargando...</span>
            ) : (
              <Currency amount={metrics?.totalExpensesPaid || 0} />
            )}
          </p>
        </div>
        <div>
          <p className='font-medium text-muted-foreground'>Pedidos Realizados</p>
          <p className='text-sm text-foreground'>
            {isLoading ? (
              <span className='animate-pulse'>Cargando...</span>
            ) : (
              customerInfo?.orderCount || 0
            )}
          </p>
        </div>
        <div>
          <p className='font-medium text-muted-foreground'>Total en Shopify</p>
          <p className='text-sm text-foreground'>
            {isLoading ? (
              <span className='animate-pulse'>Cargando...</span>
            ) : (
              <Currency amount={customerInfo?.totalSpent || 0} />
            )}
          </p>
        </div>
      </CardContent>
      <CardContent className='border-t pt-4'>
        <div className='flex gap-2'>
          <Link href={ROUTES.PUBLIC.PROFILE_DETAIL.PATH.replace(':id', user.id)}>
            <Button variant='outline' size='sm'>
              <User className='mr-2 size-4' />
              Ver Perfil Público
            </Button>
          </Link>
          {customerInfo?.orders && customerInfo.orders.length > 0 && (
            <Link href={`${ROUTES.ADMIN.FINANCE.ENTRIES.MAIN.PATH}?userId=${user.id}`}>
              <Button variant='outline' size='sm'>
                <FileText className='mr-2 size-4' />
                Ver Movimientos
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function DefaultSection({ user }: { user: any }) {
  return (
    <Card className='shadow-elevation-1'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-foreground'>
          <Shield className='size-5' /> Información General
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-muted-foreground'>
          No hay información específica disponible para este tipo de usuario.
        </p>
      </CardContent>
    </Card>
  )
}

function ArtistTypeEditForm({
  onCancel,
  onSuccess,
  user,
}: {
  user: any
  onSuccess: () => void
  onCancel: () => void
}) {
  const [artistType, setArtistType] = useState<'IMPULSO' | 'COLLECTIVE'>(
    user?.artist?.artistType || 'IMPULSO'
  )
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (!user?.artist?.id) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/artists/${user.artist.id}`, {
        body: JSON.stringify({ artistType }),
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      })

      if (!response.ok) {
        throw new Error('Error al actualizar el tipo de artista')
      }

      onSuccess()
    } catch (error) {
      console.error('Error updating artist type:', error)
      // Aquí podrías agregar un toast de error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='space-y-4'>
      <div className='space-y-3'>
        <h3 className='text-lg font-medium'>Tipo de Artista</h3>
        <div className='space-y-2'>
          <label className='flex cursor-pointer items-center space-x-3'>
            <input
              type='radio'
              name='artistType'
              value='IMPULSO'
              checked={artistType === 'IMPULSO'}
              onChange={(e) => setArtistType(e.target.value as 'IMPULSO' | 'COLLECTIVE')}
              className='size-4 border-input bg-background text-primary focus:ring-ring'
            />
            <div>
              <div className='text-sm font-medium'>Impulso</div>
              <div className='text-xs text-muted-foreground'>Artista interno de Impulso</div>
            </div>
          </label>
          <label className='flex cursor-pointer items-center space-x-3'>
            <input
              type='radio'
              name='artistType'
              value='COLLECTIVE'
              checked={artistType === 'COLLECTIVE'}
              onChange={(e) => setArtistType(e.target.value as 'IMPULSO' | 'COLLECTIVE')}
              className='size-4 border-input bg-background text-primary focus:ring-ring'
            />
            <div>
              <div className='text-sm font-medium'>Collective</div>
              <div className='text-xs text-muted-foreground'>Artista del colectivo</div>
            </div>
          </label>
        </div>
      </div>

      <div className='flex justify-end space-x-3'>
        <Button variant='outline' onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </div>
  )
}
