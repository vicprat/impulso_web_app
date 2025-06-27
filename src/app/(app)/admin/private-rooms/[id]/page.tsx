'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { privateRoomsApi } from '@/modules/rooms/api';
import { useProductsByIds } from '@/modules/shopify/hooks'; // ✅ Importar el hook
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card as ShadcnCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit3, 
  Eye, 
  Trash2, 
  Save, 
  X,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { Form } from '@/components/Forms';
import { PrivateRoomData, PrivateRoomMode } from '@/components/Forms/Room';

interface PrivateRoomPageProps {
  params: Promise<{ id: string }>;
}

export default function PrivateRoomPage({ params }: PrivateRoomPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Estado para el modo actual - viene de query param o default 'view'
  const [currentMode, setCurrentMode] = useState<PrivateRoomMode>(
    (searchParams.get('mode') as PrivateRoomMode) || 'view'
  );
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);
  const [roomData, setRoomData] = useState<any>(null); // Datos raw del API
  const [error, setError] = useState<string | null>(null);

  // ✅ CORRECCIÓN: Usar el hook para cargar productos
  const productIds = roomData?.products?.map((p: any) => p.productId) || [];
  const { 
    data: productsData, 
    isLoading: isLoadingProducts, 
    error: productsError 
  } = useProductsByIds(productIds, {
    enabled: productIds.length > 0
  });

  const products = productsData?.products || [];

  // Cargar datos del private room
  useEffect(() => {
    loadRoomData();
  }, [id]);

  // Actualizar el modo cuando cambia el query param
  useEffect(() => {
    const mode = (searchParams.get('mode') as PrivateRoomMode) || 'view';
    setCurrentMode(mode);
  }, [searchParams]);

  const loadRoomData = async () => {
    try {
      setIsLoadingRoom(true);
      setError(null);
      
      const response = await fetch(`/api/private-rooms/${id}`);
      if (!response.ok) {
        throw new Error('Failed to load private room');
      }
      
      const privateRoom = await response.json();
      setRoomData(privateRoom);
      
    } catch (error) {
      console.error('Error loading room data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load private room');
    } finally {
      setIsLoadingRoom(false);
    }
  };

  const handleSubmit = async (data: PrivateRoomData) => {
    setIsLoading(true);
    try {
      await privateRoomsApi.updatePrivateRoom(id, {
        name: data.name,
        description: data.description,
        userId: data.userId,
        productIds: data.products.map(p => p.productId),
      });
      
      toast.success('Private room updated successfully!');
      setCurrentMode('view');
      // Actualizar URL sin recargar
      router.replace(`/admin/private-rooms/${id}?mode=view`);
      // Recargar datos
      await loadRoomData();
      
    } catch (error) {
      console.error('Error updating private room:', error);
      toast.error('Failed to update private room.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this private room? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      await privateRoomsApi.deletePrivateRoom(id);
      
      toast.success('Private room deleted successfully!');
      router.push('/admin/private-rooms');
      
    } catch (error) {
      console.error('Error deleting private room:', error);
      toast.error('Failed to delete private room.');
    } finally {
      setIsLoading(false);
    }
  };

  const changeMode = (newMode: PrivateRoomMode) => {
    setCurrentMode(newMode);
    router.replace(`/admin/private-rooms/${id}?mode=${newMode}`);
  };

  const cancelEdit = () => {
    setCurrentMode('view');
    router.replace(`/admin/private-rooms/${id}?mode=view`);
  };

  // ✅ Loading combinado - esperar tanto room como productos
  const isLoadingAll = isLoadingRoom || (productIds.length > 0 && isLoadingProducts);

  // Loading state
  if (isLoadingAll) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-80" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !roomData || productsError) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/private-rooms">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Private Rooms
            </Link>
          </Button>
          
          <Alert variant="destructive">
            <AlertDescription>
              {error || productsError?.message || 'Private room not found'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // ✅ CORRECCIÓN: Preparar datos correctos para el formulario
  const initialData: PrivateRoomData = {
    id: roomData.id,
    name: roomData.name,
    description: roomData.description,
    userId: roomData.userId,
    // ✅ Pasar los productos completos de Shopify, no solo los IDs
    products: products.length > 0 ? products : [] // Usar directamente los productos del hook
  };

  // Configuración de la UI según el modo
  const getModeConfig = () => {
    switch (currentMode) {
      case 'view':
        return {
          title: 'Private Room Details',
          showActions: true,
          headerColor: 'bg-blue-50 border-blue-200',
          headerIcon: <Eye className="h-5 w-5 text-blue-600" />
        };
      case 'edit':
        return {
          title: 'Edit Private Room',
          showActions: false,
          headerColor: 'bg-orange-50 border-orange-200',
          headerIcon: <Edit3 className="h-5 w-5 text-orange-600" />
        };
      case 'delete':
        return {
          title: 'Delete Private Room',
          showActions: false,
          headerColor: 'bg-red-50 border-red-200',
          headerIcon: <Trash2 className="h-5 w-5 text-red-600" />
        };
      default:
        return {
          title: 'Private Room',
          showActions: true,
          headerColor: 'bg-gray-50 border-gray-200',
          headerIcon: <Eye className="h-5 w-5" />
        };
    }
  };

  const config = getModeConfig();

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header con navegación y acciones */}
        <div className="space-y-4">
          {/* Breadcrumb */}
          <Button variant="ghost" asChild>
            <Link href="/admin/private-rooms">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Private Rooms
            </Link>
          </Button>

      
<div className='flex w-full justify-end'>
          {config.showActions && currentMode === 'view' && (
            <div className="flex gap-2">
              <Button 
                onClick={() => changeMode('edit')}
                variant="outline"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Room
              </Button>
              
              <Button 
                onClick={() => changeMode('delete')}
                variant="destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Room
              </Button>
            </div>
          )}

          {/* Cancel button para edit mode */}
          {currentMode === 'edit' && (
            <div className="flex gap-2">
              <Button 
                onClick={cancelEdit}
                variant="outline"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel Edit
              </Button>
            </div>
          )}

          {/* Cancel button para delete mode */}
          {currentMode === 'delete' && (
            <div className="flex gap-2">
              <Button 
                onClick={() => changeMode('view')}
                variant="outline"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel Delete
              </Button>
            </div>
          )}
        </div>
        </div>

     

        <Form.Room
          mode={currentMode}
          initialData={initialData}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          isLoading={isLoading}
          showUserSelection={currentMode !== 'view'} 
          submitButtonText={
            currentMode === 'edit' ? 'Save Changes' :
            currentMode === 'delete' ? 'Delete Private Room' :
            undefined
          }
        />
      </div>
    </div>
  );
}