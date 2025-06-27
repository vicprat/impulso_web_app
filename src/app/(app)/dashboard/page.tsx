'use client'

import IntegratedDashboard from '@/components/Dashboard/IntegratedDashboard'
import { Guard } from '@/components/Guards'

export default function DashboardPage() {
  return (
    <Guard.Auth>
      <IntegratedDashboard />
    </Guard.Auth>
  )
}
