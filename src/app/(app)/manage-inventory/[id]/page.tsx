"use client";

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useGetProduct, useUpdateProduct, useDeleteProduct } from '@/services/product/hook';
import { UpdateProductPayload } from '@/services/product/types';
import { Form } from '@/components/Forms';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit2, Eye, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  
  const productId = params.id as string;
  
  const { 
    data: product, 
    isLoading, 
    error,
    refetch 
  } = useGetProduct(productId);
  
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSave = async (updatePayload: UpdateProductPayload) => {
    try {
      await updateMutation.mutateAsync(updatePayload);
      toast.success('Producto actualizado exitosamente');
      setIsEditing(false);
      refetch();
    } catch (error) {
      toast.error(`Error al actualizar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    const confirmed = window.confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.');
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(product.id);
      toast.success('Producto eliminado exitosamente');
      router.push('/manage-inventory');
    } catch (error) {
      toast.error(`Error al eliminar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Error al cargar producto</h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'Error desconocido'}
            </p>
            <div className="space-x-2">
              <Button onClick={() => refetch()}>Reintentar</Button>
              <Button variant="outline" onClick={() => router.push('/manage-inventory')}>
                Volver al listado
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Producto no encontrado</h3>
            <p className="text-muted-foreground mb-4">
              El producto que buscas no existe o no tienes permisos para verlo.
            </p>
            <Button onClick={() => router.push('/manage-inventory')}>
              Volver al listado
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
            <Link href="/manage-inventory" className="hover:text-foreground">
              Gestión de Inventario
            </Link>
            <span>/</span>
            <span>{product.title}</span>
            {isEditing && (
              <>
                <span>/</span>
                <span>Editar</span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/manage-inventory')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold">
              {isEditing ? 'Editar Producto' : product.title}
            </h1>
            {!isEditing && (
              <Badge variant={
                product.status === 'ACTIVE' ? 'default' : 
                product.status === 'DRAFT' ? 'secondary' : 'destructive'
              }>
                {product.statusLabel}
              </Badge>
            )}
          </div>
        </div>
        
        {!isEditing && (
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleEdit}>
              <Edit2 className="h-4 w-4 mr-2" />
              Editar
            </Button>
           <Link href={`/store/product/${product.handle}`} target="_blank" className="flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Ver en tienda
            </Link>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (

        <Form.Product
          mode="edit"
          product={product}
          onSave={handleSave}
          onCancel={handleCancelEdit}
          isLoading={updateMutation.isPending}
        />
      ) : (

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información del Producto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Título</Label>
                    <p className="text-sm">{product.title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Handle</Label>
                    <p className="text-sm font-mono">{product.handle}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Artista</Label>
                    <p className="text-sm">{product.vendor}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Tipo</Label>
                    <p className="text-sm">{product.productType}</p>
                  </div>
                </div>
                
                {product.descriptionHtml && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Descripción</Label>
                    <div 
                      className="text-sm prose prose-sm max-w-none mt-2"
                      dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {product.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {product.images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Imágenes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {product.images.map((image, index) => (
                      <div key={index} className="relative aspect-square">
                        <Image
                          src={image.url}
                          alt={image.altText || product.title}
                          fill
                          className="object-cover rounded-md"
                        />
                        {index === 0 && (
                          <Badge className="absolute top-2 left-2">
                            Principal
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Precio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {product.formattedPrice}
                </div>
                {product.primaryVariant?.sku && (
                  <p className="text-sm text-muted-foreground mt-2">
                    SKU: {product.primaryVariant.sku}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Cantidad disponible</span>
                    <span className="text-lg font-semibold">
                      {product.primaryVariant?.inventoryQuantity || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Estado</span>
                    <Badge variant={product.isAvailable ? "default" : "destructive"}>
                      {product.isAvailable ? "Disponible" : "Agotado"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Gestión</span>
                    <span className="text-sm text-muted-foreground">
                      {product.primaryVariant?.inventoryManagement || 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalles Técnicos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">ID del Producto</span>
                  <span className="font-mono text-xs">{product.id.split('/').pop()}</span>
                </div>
                {product.primaryVariant && (
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">ID de Variante</span>
                    <span className="font-mono text-xs">{product.primaryVariant.id.split('/').pop()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}