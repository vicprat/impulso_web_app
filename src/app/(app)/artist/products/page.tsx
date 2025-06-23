/* eslint-disable @next/next/no-img-element */
'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from '@/components/ui/badge';
import { Guard } from '@/components/Guards';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/Forms';
import { Product } from '@/modules/shopify/types';


export default function ArtistProductsPage() {
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [editingProduct, setEditingProduct] = React.useState<Product | undefined>(undefined);

    const { data: products = [], isLoading } = useQuery<Product[]>({
        queryKey: ['artist-products'],
        queryFn: () => fetch('/api/artists/products').then(res => res.json())
    });

    const deleteMutation = useMutation({
        mutationFn: (productId: string) => {
            return fetch(`/api/artists/products/${productId.split('/').pop()}`, { method: 'DELETE' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['artist-products'] });
        }
    });

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    }

    const handleCreate = () => {
        setEditingProduct(undefined);
        setIsFormOpen(true);
    }


    return (
        <Guard.Permission permission="manage_own_products">
            <div className="container mx-auto py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Mis Obras</h1>
                    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={handleCreate}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Crear Obra
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <Form.Product product={editingProduct} onFinished={() => setIsFormOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Imagen</TableHead>
                                    <TableHead>Título</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Precio</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={5} className="text-center">Cargando obras...</TableCell></TableRow>
                                ) : products.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="text-center">Aún no has creado ninguna obra.</TableCell></TableRow>
                                ) : (
                                    products.map(product => (
                                        <TableRow key={product.id}>
                                            <TableCell>
                                                <img 
                                                    src={product.images?.[0]?.url || '/placeholder.svg'} 
                                                    alt={product.title}
                                                    className="w-16 h-16 object-cover rounded-md"
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{product.title}</TableCell>
                                            <TableCell>
                                                <Badge variant={product.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                                    {product.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>${product.priceRange?.minVariantPrice.amount}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(product)}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            <span>Editar</span>
                                                        </DropdownMenuItem>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                                    <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                                                                    <span className="text-destructive">Eliminar</span>
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Esta acción no se puede deshacer. Esto eliminará permanentemente la obra de tu tienda.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => deleteMutation.mutate(product.id)}>
                                                                        Sí, eliminar
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </Guard.Permission>
    )
}