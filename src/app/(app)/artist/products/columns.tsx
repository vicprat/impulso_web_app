"use client";

import { type ColumnDef, type RowData } from "@tanstack/react-table";
import { type ArtistProduct } from "@/modules/user/artists/types"; 
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Edit, ExternalLink, Save, X } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import Link from "next/link";

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    editingRowId: string | null;
    setEditingRowId: (id: string | null) => void;
    updateProduct: (product: Partial<ArtistProduct> & { id: string }) => void;
    isUpdating: boolean;
  }
}

const formatCurrency = (amount: string | number | undefined, currencyCode = 'MXN') => {
  if (amount === undefined || amount === null) return "N/D";
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currencyCode,
  }).format(Number(amount));
};

export const columns: ColumnDef<ArtistProduct>[] = [
  {
    accessorKey: "images",
    header: "Imagen",
    enableSorting: false,
    cell: ({ row }) => {
      const imageUrl = row.original.images?.edges[0]?.node.url;
      const imageAlt = row.original.images?.edges[0]?.node.altText ?? row.original.title;

      return imageUrl ? (
        <Image
          src={imageUrl}
          alt={imageAlt}
          width={64}
          height={64}
          className="rounded-md object-cover w-16 h-16"
        />
      ) : (
        <div className="w-16 h-16 bg-secondary rounded-md flex items-center justify-center text-muted-foreground">
          Sin foto
        </div>
      );
    },
  },
  {
  accessorKey: "title",
  header: ({ column }) => (
     <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      Título
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  ),
  cell: ({ row, table }) => {
    const isEditing = table.options.meta?.editingRowId === row.original.id;
    const productId = row.original.id.split('/').pop();
    
    if (isEditing) {
      return <Input defaultValue={row.original.title} id={`title-${row.id}`} className="w-full" />;
    }
    
    return (
      <Link href={`/artist/products/${productId}`} className="hover:underline">
        <div className="font-medium text-blue-600 hover:text-blue-800">
          {row.original.title}
        </div>
      </Link>
    );
  }
},
  {
    accessorKey: "productType",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Tipo
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Estatus
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            status === "ACTIVE"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorFn: (row) => row.variants?.edges[0]?.node.price,
    id: "variantPrice",
    header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Precio
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    cell: ({ getValue }) => {
      const price = getValue<string>();
      return formatCurrency(price);
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row, table }) => {
      const isEditing = table.options.meta?.editingRowId === row.original.id;
      const isUpdating = table.options.meta?.isUpdating;

      if (isEditing) {
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                  const titleInput = document.getElementById(`title-${row.id}`) as HTMLInputElement;
                  table.options.meta?.updateProduct({
                      id: row.original.id,
                      title: titleInput.value,
                  });
              }}
              disabled={isUpdating}
            >
              <Save className="h-4 w-4 mr-2" />
              {isUpdating ? "..." : "Guardar"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => table.options.meta?.setEditingRowId(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      }

      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => table.options.meta?.setEditingRowId(row.original.id)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      );
    },
  },
    {
  id: "navigation",
  header: "Ver Detalle",
  cell: ({ row }) => {
    const productId = row.original.id.split('/').pop();
    return (
      <Link href={`/artist/products/${productId}`}>
        <Button variant="outline" size="sm">
          <ExternalLink className="h-4 w-4 mr-2" />
          Ver Detalle
        </Button>
      </Link>
    );
  },
},
];