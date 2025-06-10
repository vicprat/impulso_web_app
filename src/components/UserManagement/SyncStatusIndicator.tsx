// components/UserManagement/SyncStatusIndicator.tsx
'use client';

import { useUserManagement } from "@/modules/user/context";


interface SyncStatusIndicatorProps {
  className?: string;
}

export function SyncStatusIndicator({ className = '' }: SyncStatusIndicatorProps) {
  const { currentUser, syncWithShopify } = useUserManagement();
  
  if (!currentUser) return null;

  // Comparar datos locales vs Shopify
  const localData = {
    firstName: currentUser.firstName || '',
    lastName: currentUser.lastName || ''
  };
  
  const shopifyData = {
    firstName: currentUser.shopifyData?.displayName?.split(' ')[0] || '',
    lastName: currentUser.shopifyData?.displayName?.split(' ').slice(1).join(' ') || ''
  };

  const hasChanges = currentUser.needsShopifySync || 
    localData.firstName !== shopifyData.firstName || 
    localData.lastName !== shopifyData.lastName;

  if (!hasChanges) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <span className="text-green-600">✅</span>
          <span className="text-green-800 text-sm font-medium">Sincronizado</span>
        </div>
        <p className="text-green-700 text-xs mt-1">
          Tus datos están sincronizados con Shopify
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-orange-50 border border-orange-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-orange-600">⚠️</span>
          <span className="text-orange-800 font-medium">Cambios Pendientes</span>
        </div>
        <button
          onClick={() => syncWithShopify()}
          className="text-xs bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700"
        >
          Sincronizar Ahora
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <p className="text-orange-700">Los siguientes cambios se aplicarán en Shopify:</p>
        
        <div className="bg-white border border-orange-200 rounded p-3 space-y-2">
          {localData.firstName !== shopifyData.firstName && (
            <div className="flex justify-between">
              <span className="text-gray-600">Nombre:</span>
              <div className="text-right">
                <div className="text-red-600 line-through text-xs">
                  {shopifyData.firstName || 'No definido'}
                </div>
                <div className="text-green-600 font-medium">
                  {localData.firstName}
                </div>
              </div>
            </div>
          )}
          
          {localData.lastName !== shopifyData.lastName && (
            <div className="flex justify-between">
              <span className="text-gray-600">Apellido:</span>
              <div className="text-right">
                <div className="text-red-600 line-through text-xs">
                  {shopifyData.lastName || 'No definido'}
                </div>
                <div className="text-green-600 font-medium">
                  {localData.lastName}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <p className="text-orange-600 text-xs">
          💡 Los cambios se enviarán desde tu base de datos local hacia Shopify
        </p>
      </div>
    </div>
  );
}

// components/UserManagement/SyncHistory.tsx - Historial de sincronizaciones
export function SyncHistory() {
  const { currentUser } = useUserManagement();
  
  if (!currentUser) return null;

  // En una implementación real, esto vendría de una API
  const syncHistory = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      status: 'success',
      changes: ['firstName: "Victor" → "Enrique"', 'lastName: "Trujillo" → "Prado"'],
      direction: 'local_to_shopify'
    },
    {
      id: '2', 
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 día atrás
      status: 'success',
      changes: ['Initial sync'],
      direction: 'shopify_to_local'
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="font-medium text-gray-900 mb-3">Historial de Sincronización</h3>
      
      <div className="space-y-3">
        {syncHistory.map((sync) => (
          <div key={sync.id} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-b-0">
            <div className={`p-1 rounded-full ${
              sync.status === 'success' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <span className={`text-xs ${
                sync.status === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {sync.status === 'success' ? '✓' : '✗'}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-gray-900">
                  {sync.direction === 'local_to_shopify' ? 'Enviado a Shopify' : 'Recibido de Shopify'}
                </span>
                <span className="text-xs text-gray-500">
                  {sync.direction === 'local_to_shopify' ? '📤' : '📥'}
                </span>
              </div>
              
              <div className="text-xs text-gray-500 mb-1">
                {sync.timestamp.toLocaleString()}
              </div>
              
              <div className="text-xs text-gray-600">
                {sync.changes.map((change, index) => (
                  <div key={index} className="font-mono bg-gray-50 px-2 py-1 rounded mt-1">
                    {change}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200">
        <button className="text-xs text-blue-600 hover:text-blue-800">
          Ver historial completo
        </button>
      </div>
    </div>
  );
}

// utils/syncHelpers.ts - Utilidades para sincronización
export const SyncHelpers = {
  /**
   * Compara datos locales con datos de Shopify
   */
  compareProfileData: (localData: any, shopifyData: any) => {
    const differences = [];
    
    const localName = {
      firstName: localData.firstName || '',
      lastName: localData.lastName || ''
    };
    
    const shopifyName = {
      firstName: shopifyData?.displayName?.split(' ')[0] || '',
      lastName: shopifyData?.displayName?.split(' ').slice(1).join(' ') || ''
    };
    
    if (localName.firstName !== shopifyName.firstName) {
      differences.push({
        field: 'firstName',
        local: localName.firstName,
        shopify: shopifyName.firstName,
        type: 'update'
      });
    }
    
    if (localName.lastName !== shopifyName.lastName) {
      differences.push({
        field: 'lastName',
        local: localName.lastName,
        shopify: shopifyName.lastName,
        type: 'update'
      });
    }
    
    return differences;
  },

  /**
   * Genera un resumen de cambios para mostrar al usuario
   */
  generateChangesSummary: (differences: any[]) => {
    if (differences.length === 0) {
      return 'No hay cambios pendientes';
    }
    
    const summary = differences.map(diff => {
      const fieldNames = {
        firstName: 'Nombre',
        lastName: 'Apellido'
      };
      
      const fieldName = fieldNames[diff.field as keyof typeof fieldNames] || diff.field;
      return `${fieldName}: "${diff.shopify}" → "${diff.local}"`;
    });
    
    return summary.join(', ');
  },

  /**
   * Valida que los datos pueden ser sincronizados
   */
  validateSyncData: (data: any) => {
    const errors = [];
    
    if (!data.firstName?.trim()) {
      errors.push('El nombre es requerido');
    }
    
    if (!data.lastName?.trim()) {
      errors.push('El apellido es requerido');
    }
    
    if (data.firstName && data.firstName.length > 50) {
      errors.push('El nombre no puede exceder 50 caracteres');
    }
    
    if (data.lastName && data.lastName.length > 50) {
      errors.push('El apellido no puede exceder 50 caracteres');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};