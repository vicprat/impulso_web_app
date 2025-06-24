 
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import React, { useState, useEffect } from 'react';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArtistProduct, CreateProductPayload } from '@/modules/user/artists/types';
import { X } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import Image from 'next/image';

type Props = {
    product?: ArtistProduct; 
    onSave: (data: CreateProductPayload) => void;
    onCancel: () => void;
    isLoading?: boolean;
    mode?: 'create' | 'edit';
}

const productFormSchema = z.object({
  title: z.string().min(3, { message: "El título debe tener al menos 3 caracteres." }),
  handle: z.string().min(3, { message: "El handle debe tener al menos 3 caracteres." }),
  descriptionHtml: z.string().optional(),
  productType: z.string().optional(),
  status: z.enum(['ACTIVE', 'DRAFT']),
  tags: z.string(), 
  variantPrice: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Debe ser un número válido."
  }),
});

type ProductFormData = z.infer<typeof productFormSchema>;

export const Product: React.FC<Props> = ({ 
    product,
    onSave, 
    onCancel, 
    isLoading = false,
    mode 
}) => {
    const [newImages, setNewImages] = useState<{ mediaContentType: 'IMAGE', originalSource: string }[]>([]);
    const [tagsArray, setTagsArray] = useState<string[]>([]);

    const formMode = mode || (product ? 'edit' : 'create');
    const isEditing = formMode === 'edit';
    
    const primaryVariant = product?.variants?.edges[0]?.node;

    const form = useForm<ProductFormData>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            title: product?.title || '',
            handle: product?.handle || '',
            descriptionHtml: product?.descriptionHtml || '', 
            productType: product?.productType || '',
            status: product?.status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT',
            tags: (product?.tags || []).join(', '),
            variantPrice: primaryVariant?.price || '0.00',
        }
    });

    useEffect(() => {
        if (product?.tags) {
            setTagsArray(product.tags);
        }
    }, [product]);

    const onSubmit = (data: ProductFormData) => {
        const baseData = {
            title: data.title,
            handle: data.handle,
            descriptionHtml: data.descriptionHtml,
            productType: data.productType,
            status: data.status,
            tags: data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        };

        if (isEditing) {
            const formattedData = {
                ...baseData,
                price: data.variantPrice,
                ...(primaryVariant?.id && {
                    variantData: {
                        id: primaryVariant.id,
                        price: data.variantPrice,
                    }
                }),
                ...(newImages.length > 0 && { images: newImages }),
            };
            onSave(formattedData);
        } else {
            const formattedData = {
                ...baseData,
                price: data.variantPrice, 
                ...(newImages.length > 0 && { images: newImages }),
            };
            onSave(formattedData);
        }
    };

    const handleUploadComplete = (resourceUrl: string) => {
        const newImage = {
            mediaContentType: 'IMAGE' as const,
            originalSource: resourceUrl
        };
        setNewImages(prev => [...prev, newImage]);
    };

    const removeTag = (tagToRemove: string) => {
        const currentTags = form.getValues('tags');
        const updatedTags = currentTags
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag !== tagToRemove && tag.length > 0)
            .join(', ');
        form.setValue('tags', updatedTags);
        setTagsArray(updatedTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0));
    };

    const generateHandle = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') 
            .replace(/\s+/g, '-') 
            .replace(/-+/g, '-') 
            .trim();
    };

    const handleTitleChange = (value: string) => {
        form.setValue('title', value);
        if (!isEditing && value) {
            const generatedHandle = generateHandle(value);
            form.setValue('handle', generatedHandle);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {isEditing ? 'Editar Información Básica' : 'Información Básica'}
                        </CardTitle>
                        <CardDescription>
                            {isEditing 
                                ? 'Modifica los detalles principales del producto'
                                : 'Completa los detalles principales de tu nueva obra'
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Título *</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Título de la obra" 
                                                {...field}
                                                onChange={(e) => handleTitleChange(e.target.value)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="handle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Handle (URL) *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="url-de-la-obra" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            {isEditing 
                                                ? 'Se usa en la URL del producto. Solo letras, números y guiones.'
                                                : 'Se genera automáticamente, pero puedes editarlo. Solo letras, números y guiones.'
                                            }
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="productType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Producto</FormLabel>
                                        <FormControl>
                                            <Input placeholder="ej: Pintura, Escultura, etc." {...field} />
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
                                        <FormLabel>Estado *</FormLabel>
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

                        <FormField
                            control={form.control}
                            name="descriptionHtml"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            placeholder="Describe tu obra, técnica, inspiración..." 
                                            className="min-h-[100px]"
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Puedes usar HTML básico para formato.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Tags</CardTitle>
                        <CardDescription>
                            Etiquetas para categorizar tu obra
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="tags"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tags (separados por comas)</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="Arte Contemporáneo, Disponible, Óleo" 
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                const newTagsArray = e.target.value
                                                    .split(',')
                                                    .map(tag => tag.trim())
                                                    .filter(tag => tag.length > 0);
                                                setTagsArray(newTagsArray);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        {tagsArray.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {tagsArray.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                        {tag}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                            onClick={() => removeTag(tag)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Precio</CardTitle>
                        <CardDescription>
                            {isEditing 
                                ? 'Configuración de precio para la variante principal'
                                : 'Establece el precio de tu obra'
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="variantPrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Precio (MXN) *</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {isEditing && primaryVariant && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">SKU Actual</label>
                                        <p className="text-sm border rounded-md px-3 py-2 bg-muted">
                                            {primaryVariant.sku || "Sin SKU"}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Título de Variante Actual</label>
                                        <p className="text-sm border rounded-md px-3 py-2 bg-muted">
                                            {primaryVariant.title || "Sin título"}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {isEditing && (
                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                <p className="text-sm text-yellow-800">
                                    <strong>Nota:</strong> Por el momento, solo puedes editar el precio. 
                                    Para cambiar el SKU o título de la variante, contacta al administrador.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Imágenes</CardTitle>
                        <CardDescription>
                            {isEditing 
                                ? 'Gestiona las imágenes del producto'
                                : 'Agrega imágenes de tu obra'
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isEditing && product?.images?.edges && product.images.edges.length > 0 && (
                            <>
                                <div>
                                    <h4 className="text-sm font-medium mb-3">Imágenes Actuales</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {product.images.edges.map((img, index) => (
                                            <div key={img.node.id} className="space-y-2">
                                                <div className="relative aspect-square">
                                                    <Image 
                                                        src={img.node.url} 
                                                        alt={img.node.altText || product.title}
                                                        fill
                                                        className="object-cover rounded-md"
                                                    />
                                                    {index === 0 && (
                                                        <Badge className="absolute top-1 left-1" variant="default">
                                                            Principal
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground text-center">
                                                    {img.node.altText || "Sin texto alternativo"}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Separator />
                            </>
                        )}

                        <div>
                            <h4 className="text-sm font-medium mb-3">
                                {isEditing ? 'Agregar Nuevas Imágenes' : 'Imágenes de la Obra'}
                            </h4>
                            <ImageUploader onUploadComplete={handleUploadComplete} />
                            {!isEditing && newImages.length === 0 && (
                                <p className="text-sm text-muted-foreground mt-2">
                                    Es recomendable agregar al menos una imagen de tu obra.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end space-x-4 pt-6">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading 
                            ? 'Guardando...' 
                            : isEditing 
                                ? 'Guardar Cambios' 
                                : 'Crear Obra'
                        }
                    </Button>
                </div>
            </form>
        </Form>
    );
};