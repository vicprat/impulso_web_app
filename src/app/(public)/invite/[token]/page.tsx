'use client'

import { ArrowRight, CheckCircle, Loader2, Lock, UserPlus, XCircle } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/modules/auth/context/useAuth'

interface InviteData {
  token: string
  privateRoom: {
    id: string
    name: string
    description: string | null
  }
  email: string | null
  expiresAt: string | null
}

type Status =
  | 'loading'
  | 'valid'
  | 'expired'
  | 'used'
  | 'joining'
  | 'joined'
  | 'error'
  | 'already_member'

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const [status, setStatus] = useState<Status>('loading')
  const [inviteData, setInviteData] = useState<InviteData | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isJoining, setIsJoining] = useState(false)

  const fetchInvite = useCallback(async () => {
    try {
      const response = await fetch(`/api/private-rooms/invites/${token}`)
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 404) {
          setStatus('error')
          setErrorMessage('Invitación no encontrada')
        } else if (response.status === 410) {
          if (data.error.includes('expired')) {
            setStatus('expired')
          } else {
            setStatus('used')
          }
          setErrorMessage(data.error)
        } else {
          setStatus('error')
          setErrorMessage(data.error || 'Error al cargar la invitación')
        }
        return
      }

      setInviteData(data)
      setStatus('valid')
    } catch {
      setStatus('error')
      setErrorMessage('Error al conectar con el servidor')
    }
  }, [token])

  useEffect(() => {
    if (!authLoading) {
      void fetchInvite()
    }
  }, [authLoading, fetchInvite])

  const handleJoin = async () => {
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(`/invite/${token}`)
      router.push(`/auth/login?redirect=${returnUrl}`)
      return
    }

    setIsJoining(true)
    setStatus('joining')

    try {
      const response = await fetch(`/api/private-rooms/invites/${token}`, {
        method: 'POST',
      })
      const data = await response.json()

      if (!response.ok) {
        setStatus('error')
        setErrorMessage(data.error || 'Error al unirse a la sala')
        setIsJoining(false)
        return
      }

      if (data.message === 'Ya eres miembro de esta sala') {
        setStatus('already_member')
      } else {
        setStatus('joined')
      }
    } catch {
      setStatus('error')
      setErrorMessage('Error al conectar con el servidor')
      setIsJoining(false)
    }
  }

  const isLoading = status === 'loading' || authLoading || isJoining

  return (
    <div className='flex min-h-[80vh] items-center justify-center px-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='bg-primary/10 mx-auto mb-4 flex size-16 items-center justify-center rounded-full'>
            <Lock className='size-8 text-primary' />
          </div>
          <CardTitle className='text-2xl'>
            {status === 'loading' && 'Verificando invitación...'}
            {status === 'valid' && 'Invitación a Sala Privada'}
            {status === 'expired' && 'Invitación Expirada'}
            {status === 'used' && 'Invitación Ya Utilizada'}
            {status === 'joined' && '¡Bienvenido!'}
            {status === 'already_member' && 'Ya eres miembro'}
            {status === 'error' && 'Error'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Por favor espera mientras verificamos tu invitación'}
            {status === 'valid' && inviteData?.privateRoom.description}
            {status === 'expired' && 'Esta invitación ya no es válida'}
            {status === 'used' && 'Esta invitación ya fue utilizada por otro usuario'}
            {status === 'joined' && 'Te has unido a la sala exitosamente'}
            {status === 'already_member' && 'Ya tienes acceso a esta sala privada'}
            {status === 'error' && errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {status === 'valid' && inviteData && (
            <>
              <div className='rounded-lg bg-muted p-4 text-center'>
                <p className='text-2xl font-bold'>{inviteData.privateRoom.name}</p>
                {inviteData.expiresAt && (
                  <p className='mt-2 text-sm text-muted-foreground'>
                    Válida hasta: {new Date(inviteData.expiresAt).toLocaleDateString('es-MX')}
                  </p>
                )}
              </div>

              <Button className='w-full' onClick={handleJoin} disabled={isJoining}>
                {isJoining ? (
                  <>
                    <Loader2 className='mr-2 size-4 animate-spin' />
                    Uniendote...
                  </>
                ) : isAuthenticated ? (
                  <>
                    <UserPlus className='mr-2 size-4' />
                    Unirme a la Sala
                  </>
                ) : (
                  <>
                    Iniciar Sesión para Unirme
                    <ArrowRight className='ml-2 size-4' />
                  </>
                )}
              </Button>

              {!isAuthenticated && (
                <span className='block text-center text-sm text-muted-foreground'>
                  ¿No tienes cuenta?{' '}
                  <Button
                    variant='link'
                    className='h-auto p-0 text-primary'
                    onClick={() =>
                      router.push(`/auth/login?redirect=${encodeURIComponent(`/invite/${token}`)}`)
                    }
                  >
                    Regístrate aquí
                  </Button>
                </span>
              )}
            </>
          )}

          {(status === 'joined' || status === 'already_member') && inviteData && (
            <>
              <div className='flex justify-center'>
                <CheckCircle className='size-16 text-green-500' />
              </div>
              <Button
                className='w-full'
                onClick={() => router.push(`/private-room/${inviteData.privateRoom.id}`)}
              >
                Ver Sala Privada
                <ArrowRight className='ml-2 size-4' />
              </Button>
            </>
          )}

          {(status === 'expired' || status === 'used') && (
            <div className='flex justify-center'>
              <XCircle className='size-16 text-muted-foreground' />
            </div>
          )}

          {status === 'error' && (
            <div className='flex justify-center'>
              <XCircle className='size-16 text-destructive' />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
