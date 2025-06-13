// src/components/Debug/APIConnectivity.tsx
'use client';

import { useAPIConnectivity } from '@/modules/customer/hooks/cart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function APIConnectivityStatus() {
  const { data: connectivity, isLoading, error } = useAPIConnectivity();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Verificando Conectividad API
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Probando conexión con Shopify APIs...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !connectivity) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Error de Conectividad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">
            Error al verificar conectividad: {error instanceof Error ? error.message : 'Error desconocido'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de APIs de Shopify</CardTitle>
        <CardDescription>
          Verificación de conectividad con las diferentes APIs de Shopify
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Storefront API Status */}
        <div className="flex items-center justify-between p-3 border rounded">
          <div>
            <h3 className="font-medium">Storefront API</h3>
            <p className="text-sm text-gray-600">Para operaciones de carrito</p>
            <p className="text-xs text-gray-500">
              Endpoint: https://{process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/{process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION}/graphql.json
            </p>
          </div>
          <div className="flex items-center gap-2">
            {connectivity.cart.success ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <Badge variant={connectivity.cart.success ? "default" : "destructive"}>
              {connectivity.cart.success ? "Conectado" : "Error"}
            </Badge>
          </div>
        </div>

        {/* Customer Account API Status */}
        <div className="flex items-center justify-between p-3 border rounded">
          <div>
            <h3 className="font-medium">Customer Account API</h3>
            <p className="text-sm text-gray-600">Para datos del customer</p>
            <p className="text-xs text-gray-500">
              Endpoint: /api/customer/graphql
            </p>
          </div>
          <div className="flex items-center gap-2">
            {connectivity.customer.success ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <Badge variant={connectivity.customer.success ? "default" : "destructive"}>
              {connectivity.customer.success ? "Conectado" : "Error"}
            </Badge>
          </div>
        </div>

        {/* Error Details */}
        {(!connectivity.cart.success || !connectivity.customer.success) && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <h4 className="font-medium text-red-800 mb-2">Detalles de Errores:</h4>
            {!connectivity.cart.success && (
              <p className="text-sm text-red-700">
                <strong>Storefront API:</strong> {connectivity.cart.error}
              </p>
            )}
            {!connectivity.customer.success && (
              <p className="text-sm text-red-700">
                <strong>Customer Account API:</strong> {connectivity.customer.error}
              </p>
            )}
          </div>
        )}

        {/* Success Message */}
        {connectivity.cart.success && connectivity.customer.success && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-700">
              ✅ <strong>Todas las APIs están funcionando correctamente!</strong>
            </p>
            <p className="text-xs text-green-600 mt-1">
              • Cart operations: Storefront API<br/>
              • Customer data: Customer Account API
            </p>
          </div>
        )}

        {/* Usage Guide */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <h4 className="font-medium text-blue-800 mb-2">Cómo funciona:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>🛒 <strong>Cart operations</strong> → Storefront API (sin auth)</li>
            <li>👤 <strong>Customer data</strong> → Customer Account API (con auth)</li>
            <li>🔄 <strong>Auto-routing</strong> → Se elige la API correcta automáticamente</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

