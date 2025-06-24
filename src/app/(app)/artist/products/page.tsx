"use client";

import { useState, useCallback, useEffect } from "react";
import { 
  useGetArtistProductsPaginated,
  useUpdateArtistProduct 
} from "@/modules/user/artists/hooks";
import { columns } from "./columns"; 
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {  PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useReactTable, getCoreRowModel, getSortedRowModel } from "@tanstack/react-table";
import { ArtistProduct } from "@/modules/user/artists/types";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { TablePagination } from "@/components/Pagination/Table";
import Link from "next/link";

export default function Page() {
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [cursorsHistory, setCursorsHistory] = useState<string[]>([]);
  
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  const currentCursor = currentPage > 1 ? cursorsHistory[currentPage - 2] : undefined;
  
  const { 
    data: paginatedData, 
    isLoading, 
    error,
    isFetching
  } = useGetArtistProductsPaginated({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch,
    cursor: currentCursor
  });
  
  const updateMutation = useUpdateArtistProduct();

  const products = paginatedData?.products || [];
  const pageInfo = paginatedData?.pageInfo;
  const totalItems = paginatedData?.totalItems || 0;

  useEffect(() => {
    if (pageInfo?.endCursor && currentPage > cursorsHistory.length) {
      setCursorsHistory(prev => [...prev, pageInfo.endCursor!]);
    }
  }, [pageInfo?.endCursor, currentPage, cursorsHistory.length]);

  useEffect(() => {
    setCursorsHistory([]);
    setCurrentPage(1);
  }, [debouncedSearch]);

  const handleUpdateProduct = useCallback((payload: Partial<ArtistProduct> & { id: string }) => {
    toast.info("Guardando cambios...");
    const { status, ...rest } = payload;
    const safeStatus = status === "ARCHIVED" ? undefined : status;
    updateMutation.mutate(
      { ...rest, ...(safeStatus !== undefined ? { status: safeStatus } : {}), id: payload.id },
      {
        onSuccess: () => {
          toast.success("Producto actualizado con éxito.");
          setEditingRowId(null);
        },
        onError: (err) => {
          toast.error(`Error al actualizar: ${err.message}`);
        }
      }
    );
  }, [updateMutation]);

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true, 
    pageCount: -1, 
    state: {
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: pageSize,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newPagination = updater({
          pageIndex: currentPage - 1,
          pageSize: pageSize,
        });
        
        const newPage = newPagination.pageIndex + 1;
        const newSize = newPagination.pageSize;
        
        if (newSize !== pageSize) {
          setPageSize(newSize);
          setCurrentPage(1);
          setCursorsHistory([]);
        } else if (newPage !== currentPage) {
          setCurrentPage(newPage);
        }
      }
    },
    meta: {
      editingRowId,
      setEditingRowId,
      updateProduct: handleUpdateProduct,
      isUpdating: updateMutation.isPending,
    }
  });

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    setCursorsHistory([]);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  if (isLoading && !products.length) {
    return <div><Skeleton className="h-96 w-full" /></div>;
  }
  
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mis Obras</h1>
        <Link href="/artist/products/create">
          <Button >
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Nueva Obra
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {(debouncedSearch || isFetching) && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          {isFetching && <span>Cargando...</span>}
          {debouncedSearch && (
            <span>
              Mostrando resultados para: <strong>&quot;{debouncedSearch}&quot;</strong>
            </span>
          )}
        </div>
      )}

      <div className="rounded-md border">
        <DataTable 
          table={table} 
          emptyMessage={
            debouncedSearch 
              ? `No se encontraron productos que coincidan con "${debouncedSearch}"`
              : "No se encontraron productos."
          }
        />
      </div>

         <TablePagination 
        table={table}
        isServerSide={true}
        hasNextPage={pageInfo?.hasNextPage}
        hasPreviousPage={pageInfo?.hasPreviousPage || currentPage > 1}
        currentPage={currentPage}
        totalItems={totalItems}
        isLoading={isFetching}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}