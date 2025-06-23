/* eslint-disable @next/next/no-img-element */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Product as ProductType } from '@/modules/shopify/types';
import { Label } from '../ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import React from 'react';
import { ImageUploader } from './ImageUploader';

type Props = {
    product?: ProductType;
    onFinished: () => void;
}

const productSchema = z.object({
  title: z.string().min(3, { message: "El título debe tener al menos 3 caracteres." }),
  descriptionHtml: z.string().optional(),
  status: z.enum(['ACTIVE', 'DRAFT']),
  price: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Debe ser un número válido."
  }),
});

type ProductFormData = z.infer<typeof productSchema>;

export const Product: React.FC<Props> = ({ product, onFinished }) => {
    const queryClient = useQueryClient();
    const [newImages, setNewImages] = React.useState<{ mediaContentType: 'IMAGE', originalSource: string }[]>([]);

    const form = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            title: product?.title || '',
            descriptionHtml: '', 
            status: product?.status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT',
            price: product?.priceRange?.minVariantPrice?.amount || '0.00',
        }
    });

    const mutation = useMutation({
        mutationFn: async (formData: ProductFormData) => {
            const isEditing = !!product;
            const url = isEditing ? `/api/artists/products/${product.id.split('/').pop()}` : '/api/artists/products';
            const method = isEditing ? 'PUT' : 'POST';

            const priceValue = parseFloat(formData.price);
            if (isNaN(priceValue) || priceValue < 0) {
                throw new Error(`Precio inválido: ${formData.price}`);
            }

            if (newImages.length > 0) {
                newImages.forEach((img, index) => {
                    if (!img.originalSource || !img.originalSource.startsWith('http')) {
                        throw new Error(`Imagen ${index + 1} tiene URL inválida: ${img.originalSource}`);
                    }
                    if (!img.mediaContentType) {
                        throw new Error(`Imagen ${index + 1} no tiene mediaContentType`);
                    }
                });
            }

            if (!formData.title || formData.title.trim().length < 3) {
                throw new Error(`Título inválido: ${formData.title}`);
            }

            const apiData = {
                title: formData.title,
                descriptionHtml: formData.descriptionHtml,
                status: formData.status,
                price: formData.price,
                images: newImages,
            };

            let jsonString: string;
            try {
                const payloadToSend = isEditing ? { id: product.id, ...apiData } : apiData;
                jsonString = JSON.stringify(payloadToSend);
                JSON.parse(jsonString);
            } catch (jsonError) {
                throw new Error('Error generando JSON válido: ' + (jsonError instanceof Error ? jsonError.message : 'Error desconocido'));
            }

            const response = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: jsonString,
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error del servidor:', errorData);
                throw new Error(errorData.errors?.[0]?.message || errorData.error || "Error al guardar el producto");
            }
            
            const responseData = await response.json();
            return responseData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['artist-products'] });
            toast.success(`Obra ${product ? 'actualizada' : 'creada'} con éxito.`);
            onFinished();
        },
        onError: (error: Error) => {
            console.error('Error en mutación:', error);
            toast.error(`Error: ${error.message}`);
        }
    });

    const onSubmit = (data: ProductFormData) => {
        mutation.mutate(data);
    };

    const handleUploadComplete = (resourceUrl: string) => {
        const newImage = {
            mediaContentType: 'IMAGE' as const,
            originalSource: resourceUrl
        };

        setNewImages(prev => [...prev, newImage]);
    };

    return (
        <>
            <DialogHeader>
                <DialogTitle>{product ? 'Editar Obra' : 'Crear Nueva Obra'}</DialogTitle>
                <DialogDescription>
                    Completa los detalles de la obra. Los cambios se reflejarán en Shopify.
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Título</FormLabel>
                                <FormControl>
                                    <Input placeholder="Título de la obra" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="descriptionHtml"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descripción</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Describe tu obra, técnica, inspiración..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Precio (MXN)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="0.00" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estado</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona un estado" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">Activo (Visible en tienda)</SelectItem>
                                            <SelectItem value="DRAFT">Borrador (Oculto)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    
                    <div>
                        <Label>Imágenes</Label>
                        <ImageUploader onUploadComplete={handleUploadComplete} />
                        {product?.images && product.images.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-medium mb-2">Imágenes Actuales</p>
                                <div className="grid grid-cols-3 gap-4">
                                    {product.images.map(img => (
                                        <div key={img.id} className="relative aspect-square">
                                            <img src={img.url} alt={img.altText || ''} className="h-full w-full rounded-md object-cover"/>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onFinished}>Cancelar</Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Guardando...' : 'Guardar Obra'}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </>
    );
}