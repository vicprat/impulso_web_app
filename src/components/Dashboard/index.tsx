'use client'

import React from 'react'

import { Admin } from './Admin'
import { Artist } from './Artist'
import { Customer } from './Customer'
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
    case 'support':
      return <div className='p-8 text-center'>Support Dashboard (Coming Soon!)</div>
    default:
      return <div className='p-8 text-center'>No dashboard available for your role.</div>
  }
}
