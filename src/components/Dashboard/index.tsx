'use client'

import React from 'react'

import { Admin } from './Admin'
import { Artist } from './Artist'
import { Customer } from './Customer'
import { FinanceOverview } from './FinanceOverview'
import { Manager } from './Manager'

interface Props {
  role: string
  userId?: string
}

export const Dashboard: React.FC<Props> = ({ role, userId }) => {
  switch (role) {
    case 'admin':
      return <Admin />
    case 'customer':
      return <Customer userId={userId} role={role} />
    case 'vip_customer':
      return <Customer userId={userId} role={role} />
    case 'manager':
      return <Manager />
    case 'artist':
      if (!userId)
        return <div className='p-8 text-center'>User ID is required for Artist Dashboard.</div>
      return <Artist userId={userId} />
    case 'employee':
      return (
        <div className='space-y-6 p-8'>
          <h1 className='text-2xl font-bold'>Dashboard de Empleado</h1>
          <FinanceOverview role={role} userId={userId} showDetails={false} />
          <div className='p-8 text-center text-muted-foreground'>
            Dashboard completo de empleado (Coming Soon!)
          </div>
        </div>
      )
    case 'provider':
      return (
        <div className='space-y-6 p-8'>
          <h1 className='text-2xl font-bold'>Dashboard de Proveedor</h1>
          <FinanceOverview role={role} userId={userId} showDetails={false} />
          <div className='p-8 text-center text-muted-foreground'>
            Dashboard completo de proveedor (Coming Soon!)
          </div>
        </div>
      )
    case 'partner':
      return (
        <div className='space-y-6 p-8'>
          <h1 className='text-2xl font-bold'>Dashboard de Socio</h1>
          <FinanceOverview role={role} userId={userId} showDetails={false} />
          <div className='p-8 text-center text-muted-foreground'>
            Dashboard completo de socio (Coming Soon!)
          </div>
        </div>
      )
    case 'support':
      return <div className='p-8 text-center'>Support Dashboard (Coming Soon!)</div>
    default:
      return <div className='p-8 text-center'>No dashboard available for your role.</div>
  }
}
