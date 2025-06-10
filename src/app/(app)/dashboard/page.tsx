'use client';

import IntegratedDashboard from '@/components/Dashboard/IntegratedDashboard';
import { Guard } from '@/modules/auth/client';



export default function DashboardPage() {
  return (
    <Guard.Auth>
      <IntegratedDashboard />
    </Guard.Auth>
  );
}