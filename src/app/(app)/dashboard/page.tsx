'use client';

import IntegratedDashboard from '@/components/Dashboard/IntegratedDashboard';
import { GraphQLDebugger } from '@/components/Debug/GraphQLDebugger';
import { Guard } from '@/modules/auth/client';



export default function DashboardPage() {
  return (
    <Guard.Auth>
      <IntegratedDashboard />
      <GraphQLDebugger/>
      {/* <APIConnectivityStatus /> */}
    </Guard.Auth>
  );
}