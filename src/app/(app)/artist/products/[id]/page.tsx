"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetArtistProduct, useUpdateArtistProduct, useDeleteArtistProduct } from "@/modules/user/artists/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit, Trash2, ExternalLink } from "lucide-react";
import { Form } from "@/components/Forms";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const { data: product, isLoading, error } = useGetArtistProduct(productId);
  const updateMutation = useUpdateArtistProduct();
  const deleteMutation = useDeleteArtistProduct();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "No se pudo cargar el producto"}
          </p>
          <Button onClick={() => router.push("/artist/products")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Productos
          </Button>
        </div>
      </div>
    );
  }

  const handleUpdate = (data: any) => {
    const gid = product.id;
    updateMutation.mutate(
      { id: gid, ...data },
      {
        onSuccess: () => {
          toast.success("Producto actualizado exitosamente");
          setIsEditMode(false);
        },
        onError: (error) => {
          toast.error(`Error al actualizar: ${error.message}`);
        }
      }
    );
  };

  const handleDelete = () => {
    const numericId = product.id.split('/').pop();
    if (!numericId) return;
    
    deleteMutation.mutate(parseInt(numericId), {
      onSuccess: () => {
        toast.success("Producto eliminado exitosamente");
        router.push("/artist/products");
      },
      onError: (error) => {
        toast.error(`Error al eliminar: ${error.message}`);
      }
    });
  };

  const formatCurrency = (amount: string | number, currencyCode = 'MXN') => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currencyCode,
    }).format(Number(amount));
  };

  const primaryImage = product.images?.edges[0]?.node;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.push("/artist/products")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{product.title}</h1>
            <p className="text-muted-foreground">ID: {product.id.split('/').pop()}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
         <Link 
  href={`/store/product/${product.handle}`}
  target="_blank"
  rel="noopener noreferrer"
>
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              Ver en Tienda
            </Button>
          </Link>
          
          <Button 
            onClick={() => setIsEditMode(true)}
            disabled={isEditMode}
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>¿Eliminar producto?</DialogTitle>
                <DialogDescription>
                  Esta acción no se puede deshacer. El producto será eliminado permanentemente.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Cancelar
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isEditMode ? (
        <Card>
          <CardHeader>
            <CardTitle>Editar Producto</CardTitle>
            <CardDescription>
              Modifica los detalles del producto. Los cambios se reflejarán en Shopify.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form.Product 
              product={product}
              onSave={handleUpdate}
              onCancel={() => setIsEditMode(false)}
              isLoading={updateMutation.isPending}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Imagen Principal */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Imagen Principal</CardTitle>
              </CardHeader>
              <CardContent>
                {primaryImage ? (
                  <div className="space-y-4">
                    <Image
                      src={primaryImage.url}
                      alt={primaryImage.altText || product.title}
                      width={400}
                      height={400}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <div className="text-sm text-muted-foreground">
                      <p><strong>Alt Text:</strong> {primaryImage.altText || "Sin texto alternativo"}</p>
                      <p><strong>ID:</strong> {primaryImage.id.split('/').pop()}</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-square bg-secondary rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Sin imagen</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Información del Producto */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información General */}
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Título</label>
                    <p className="font-medium">{product.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Handle</label>
                    <p className="font-mono text-sm">{product.handle}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Vendor</label>
                    <p>{product.vendor}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tipo de Producto</label>
                    <p>{product.productType || "Sin tipo"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Estado</label>
                    <Badge variant={product.status === "ACTIVE" ? "default" : "secondary"}>
                      {product.status}
                    </Badge>
                  </div>
                </div>
                
                {product.descriptionHtml && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Descripción</label>
                    <div 
                      className="prose prose-sm mt-2"
                      dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                    />
                  </div>
                )}
                
                {product.tags && product.tags.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tags</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {product.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información de Variantes */}
            <Card>
              <CardHeader>
                <CardTitle>Variantes y Precios</CardTitle>
              </CardHeader>
              <CardContent>
                {product.variants?.edges && product.variants.edges.length > 0 ? (
                  <div className="space-y-4">
                    {product.variants.edges.map((variant) => (
                      <div key={variant.node.id} className="border rounded-lg p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Título</label>
                            <p className="font-medium">{variant.node.title}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Precio</label>
                            <p className="text-lg font-bold">{formatCurrency(variant.node.price)}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">SKU</label>
                            <p className="font-mono text-sm">{variant.node.sku || "Sin SKU"}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">ID</label>
                            <p className="text-sm text-muted-foreground">{variant.node.id.split('/').pop()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No hay variantes configuradas</p>
                )}
              </CardContent>
            </Card>

            {/* Galería de Imágenes */}
            {product.images?.edges && product.images.edges.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Galería de Imágenes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {product.images.edges.slice(1).map((image) => (
                      <div key={image.node.id} className="space-y-2">
                        <Image
                          src={image.node.url}
                          alt={image.node.altText || product.title}
                          width={200}
                          height={200}
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                        <p className="text-xs text-muted-foreground text-center">
                          {image.node.altText || "Sin texto alternativo"}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}