// src/app/test-customer-api/page.tsx
import { TestCustomerData } from '@/components/TestCustomerData';

export default function TestCustomerAPIPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Test Customer Account API
          </h1>
          <p className="text-gray-600">
            Página de prueba para verificar que la integración con Shopify Customer Account API funciona correctamente.
          </p>
        </div>
        
        <TestCustomerData />
        
        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">📋 Instrucciones de Uso</h3>
            <div className="text-left space-y-2 text-sm">
              <p><strong>1.</strong> Asegúrate de estar autenticado con Shopify</p>
              <p><strong>2.</strong> Haz clic en &quot;Test API Directa&quot; para verificar la conexión básica</p>
              <p><strong>3.</strong> Prueba &quot;Cargar Perfil&quot; para obtener información del cliente</p>
              <p><strong>4.</strong> Usa &quot;Cargar Órdenes&quot; para ver las órdenes del cliente</p>
              <p><strong>5.</strong> Prueba &quot;Cargar Direcciones&quot; para ver las direcciones guardadas</p>
              <p><strong>6.</strong> Revisa la consola del navegador para ver logs detallados</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}