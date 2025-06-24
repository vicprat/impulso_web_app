"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCreateArtistProduct } from "@/modules/user/artists/hooks";
import { Form } from "@/components/Forms";
import { CreateProductPayload } from "@/modules/user/artists/types";

export default function CreateArtistProductPage() {
  const router = useRouter();
  const createMutation = useCreateArtistProduct();

  const handleSave = (formData: CreateProductPayload) => {
    createMutation.mutate(formData, {
      onSuccess: (newProduct) => {
        toast.success("Obra creada exitosamente");
        const productId = newProduct.id.split('/').pop();
        router.push(`/artist/products/${productId}`);
      },
      onError: (error) => {
        toast.error(`Error al crear la obra: ${error.message}`);
        console.error('Error creating product:', error);
      }
    });
  };

  const handleCancel = () => {
    router.push('/artist/products');
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/artist/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Productos
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Crear Nueva Obra</h1>
            <p className="text-muted-foreground">
              Completa la información de tu nueva obra de arte
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl">
        <Form.Product 
          mode="create"
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  );
}