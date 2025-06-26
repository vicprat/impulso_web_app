/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Product } from "@/models/Product";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Trash2, 
  Check, 
  X,
  ArrowUpDown,
  ExternalLink
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

declare module '@tanstack/react-table' {
   
  interface TableMeta<TData> {
    editingRowId?: string | null;
    setEditingRowId?: (id: string | null) => void;
    updateProduct?: (payload: { 
      id: string; 
      title?: string;
      price?: string;
      inventoryQuantity?: number;
      status?: 'ACTIVE' | 'DRAFT';
    }) => void;
    isUpdating?: boolean;
  }
}

const EditableTitle = ({ 
  product, 
  isEditing, 
  onUpdate, 
  onCancel 
}: { 
  product: Product; 
  isEditing: boolean; 
  onUpdate: (value: string) => void;
  onCancel: () => void;
}) => {
  const [value, setValue] = useState(product.title);

  if (!isEditing) {
    return (
      <div className="flex flex-col">
        <span className="font-medium">{product.title}</span>
        {product.primaryImage && (
          <span className="text-xs text-muted-foreground">SKU: {product.primaryVariant?.sku || 'N/A'}</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-8"
        onKeyDown={(e) => {
          if (e.key === 'Enter') onUpdate(value);
          if (e.key === 'Escape') onCancel();
        }}
      />
      <Button size="sm" variant="outline" onClick={() => onUpdate(value)}>
        <Check className="h-3 w-3" />
      </Button>
      <Button size="sm" variant="outline" onClick={onCancel}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

const EditablePrice = ({ 
  product, 
  isEditing, 
  onUpdate, 
  onCancel 
}: { 
  product: Product; 
  isEditing: boolean; 
  onUpdate: (value: string) => void;
  onCancel: () => void;
}) => {
  const variant = product.variants?.[0];
  const priceAmount = variant?.price?.amount || '0';
  const currencyCode = variant?.price?.currencyCode || 'MXN';
  const [value, setValue] = useState(priceAmount);

  const formatPrice = (amount: string, currency: string) => {
    const numericAmount = parseFloat(amount);
    return `$${numericAmount.toLocaleString('es-MX')} ${currency}`;
  };

  if (!isEditing) {
    const displayPrice = variant ? formatPrice(priceAmount, currencyCode) : 'Sin precio';
    
    return (
      <span className="font-medium">
        {displayPrice}
      </span>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-8 w-24"
        onKeyDown={(e) => {
          if (e.key === 'Enter') onUpdate(value);
          if (e.key === 'Escape') onCancel();
        }}
      />
      <Button size="sm" variant="outline" onClick={() => onUpdate(value)}>
        <Check className="h-3 w-3" />
      </Button>
      <Button size="sm" variant="outline" onClick={onCancel}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

const EditableInventory = ({ 
  product, 
  isEditing, 
  onUpdate, 
  onCancel 
}: { 
  product: Product; 
  isEditing: boolean; 
  onUpdate: (value: number) => void;
  onCancel: () => void;
}) => {
  const variant = product.variants?.[0];
  const currentQuantity = variant?.inventoryQuantity ?? 0;
  const [value, setValue] = useState(currentQuantity.toString());


  if (!isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <span>{currentQuantity}</span>
        <Badge variant={currentQuantity > 0 ? "default" : "destructive"}>
          {currentQuantity > 0 ? "Disponible" : "Agotado"}
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-8 w-20"
        onKeyDown={(e) => {
          if (e.key === 'Enter') onUpdate(parseInt(value) || 0);
          if (e.key === 'Escape') onCancel();
        }}
      />
      <Button size="sm" variant="outline" onClick={() => onUpdate(parseInt(value) || 0)}>
        <Check className="h-3 w-3" />
      </Button>
      <Button size="sm" variant="outline" onClick={onCancel}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "image",
    header: "Imagen",
    cell: ({ row }) => {
      const product = row.original;
      const image = product.images[0];
      
      if (!image) {
        return (
          <div className="w-16 h-16  rounded-md flex items-center justify-center">
            <span className="text-xs ">Sin imagen</span>
          </div>
        );
      }

      return (
        <div className="relative w-16 h-16 rounded-md overflow-hidden">
          <Image
            src={image.url}
            alt={image.altText || product.title}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Título
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row, table }) => {
      const product = row.original;
      const { editingRowId, setEditingRowId, updateProduct } = table.options.meta || {};
      const isEditing = editingRowId === product.id;

      return (
        <EditableTitle
          product={product}
          isEditing={isEditing}
          onUpdate={(value) => {
            updateProduct?.({ id: product.id, title: value });
          }}
          onCancel={() => setEditingRowId?.(null)}
        />
      );
    },
  },
  {
    accessorKey: "vendor",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Artista
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const product = row.original;
      return <span className="font-medium">{product.vendor}</span>;
    },
  },
  {
    accessorKey: "productType",
    header: "Tipo",
    cell: ({ row }) => {
      const product = row.original;
      return <Badge variant="outline">{product.productType}</Badge>;
    },
  },
  // Nueva columna para Técnica
  {
    accessorKey: "artworkDetails.medium",
    header: "Técnica",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <span className="text-sm">
          {product.artworkDetails?.medium || "-"}
        </span>
      );
    },
  },
  // Nueva columna para Año
  {
    accessorKey: "artworkDetails.year",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Año
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const product = row.original;
      return (
        <span className="text-sm">
          {product.artworkDetails?.year || "-"}
        </span>
      );
    },
  },
  // Nueva columna para Medidas
  {
    id: "dimensions",
    header: "Medidas (cm)",
    cell: ({ row }) => {
      const product = row.original;
      const { height, width, depth } = product.artworkDetails || {};
      const dimensions = [height, width, depth].filter(Boolean);
      
      if (dimensions.length === 0) return <span className="text-sm text-muted-foreground">-</span>;
      
      return (
        <span className="text-sm">
          {dimensions.join(" × ")}
        </span>
      );
    },
  },
  // Nueva columna para Localización
  {
    accessorKey: "artworkDetails.location",
    header: "Localización",
    cell: ({ row }) => {
      const product = row.original;
      const location = product.artworkDetails?.location;
      
      if (!location) return <span className="text-sm text-muted-foreground">-</span>;
      
      return (
        <Badge variant="secondary" className="text-xs">
          {location}
        </Badge>
      );
    },
  },
  {
    accessorFn: (row) => row.variants?.[0]?.price?.amount,
    id: "price", 
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Precio
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row, table }) => {
      const product = row.original;
      const { editingRowId, setEditingRowId, updateProduct } = table.options.meta || {};
      const isEditing = editingRowId === product.id;

      return (
        <EditablePrice
          product={product}
          isEditing={isEditing}
          onUpdate={(value) => {
            updateProduct?.({ id: product.id, price: value });
          }}
          onCancel={() => setEditingRowId?.(null)}
        />
      );
    },
  },
  {
    accessorFn: (row) => row.variants?.[0]?.inventoryQuantity,
    id: "inventory",
    header: "Inventario",
    cell: ({ row, table }) => {
      const product = row.original;
      const { editingRowId, setEditingRowId, updateProduct } = table.options.meta || {};
      const isEditing = editingRowId === product.id;

      return (
        <EditableInventory
          product={product}
          isEditing={isEditing}
          onUpdate={(value) => {
            updateProduct?.({ id: product.id, inventoryQuantity: value });
          }}
          onCancel={() => setEditingRowId?.(null)}
        />
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row, table }) => {
      const product = row.original;
      const { editingRowId, setEditingRowId, updateProduct } = table.options.meta || {};
      const isEditing = editingRowId === product.id;

      if (isEditing) {
        return (
          <Select
            value={product.status}
            onValueChange={(value: 'ACTIVE' | 'DRAFT') => {
              updateProduct?.({ id: product.id, status: value });
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Activo</SelectItem>
              <SelectItem value="DRAFT">Borrador</SelectItem>
            </SelectContent>
          </Select>
        );
      }

      const statusColors = {
        'ACTIVE': 'default',
        'DRAFT': 'secondary',
        'ARCHIVED': 'destructive'
      } as const;

      return (
        <Badge variant={statusColors[product.status] || 'secondary'}>
          {product.statusLabel}
        </Badge>
      );
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const product = row.original;
      const displayTags = product.tags.slice(0, 3);
      const hasMore = product.tags.length > 3;

      return (
        <div className="flex flex-wrap gap-1">
          {displayTags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {hasMore && (
            <Badge variant="outline" className="text-xs">
              +{product.tags.length - 3}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const product = row.original;
      const { editingRowId, setEditingRowId, isUpdating } = table.options.meta || {};
      const isEditing = editingRowId === product.id;

      if (isEditing) {
        return (
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingRowId?.(null)}
              disabled={isUpdating}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setEditingRowId?.(product.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/manage-inventory/${product.id.split('/').pop()}`}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalles
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem 
            >
              <Link href={`/store/product/${product.handle}`} target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              Ver en la tienda
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Columnas simplificadas para vista móvil/tableta
export const mobileColumns: ColumnDef<Product>[] = [
  {
    id: "product",
    header: "Producto",
    cell: ({ row }) => {
      const product = row.original;
      const image = product.images[0];
      const variant = product.variants?.[0];
      
      return (
        <div className="flex items-start space-x-3">
          <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
            {image ? (
              <Image
                src={image.url}
                alt={image.altText || product.title}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-500">Sin imagen</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 space-y-1">
            <p className="font-medium line-clamp-2">{product.title}</p>
            <p className="text-sm text-muted-foreground">{product.vendor}</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {product.productType}
              </Badge>
              {product.artworkDetails?.year && (
                <Badge variant="secondary" className="text-xs">
                  {product.artworkDetails.year}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-medium">{product.formattedPrice}</span>
              <span className="text-muted-foreground">
                Stock: {variant?.inventoryQuantity || 0}
              </span>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    id: "status",
    header: "Estado",
    cell: ({ row }) => {
      const product = row.original;
      const statusColors = {
        'ACTIVE': 'default',
        'DRAFT': 'secondary',
        'ARCHIVED': 'destructive'
      } as const;

      return (
        <Badge variant={statusColors[product.status] || 'secondary'}>
          {product.statusLabel}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/manage-inventory/${product.id.split('/').pop()}`}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalles
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/store/product/${product.handle}`} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver en tienda
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];