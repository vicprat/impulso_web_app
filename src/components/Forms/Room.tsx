'use client';

import { useState, useRef, useEffect } from 'react';
import { useUsersManagement } from '@/modules/user/hooks/management';
import { useProducts } from '@/modules/shopify/hooks';
import { useDebounce } from '@/hooks/use-debounce';
import Image from 'next/image';

import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card as ShadcnCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Plus, Search, Trash2, Edit3, Eye } from 'lucide-react';
import { Product } from '@/modules/shopify/types';

export type PrivateRoomMode = 'create' | 'edit' | 'view' | 'delete';

export interface PrivateRoomData {
  id?: string;
  name: string;
  description?: string | null;
  userId: string;
  products: Array<{
    id?: string;
    productId: string;
  }>;
}

export interface PrivateRoomFormProps {
  mode: PrivateRoomMode;
  initialData?: PrivateRoomData;
  onSubmit: (data: PrivateRoomData) => Promise<void>;
  onDelete?: () => Promise<void>;
  isLoading?: boolean;
  submitButtonText?: string;
  showUserSelection?: boolean;
}

export const Room = ({
  mode,
  initialData,
  onSubmit,
  onDelete,
  isLoading = false,
  submitButtonText,
  showUserSelection = true
}: PrivateRoomFormProps) => {
  // Estados del formulario
  const [selectedUser, setSelectedUser] = useState<string | null>(
    initialData?.userId || null
  );
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [roomName, setRoomName] = useState<string>(initialData?.name || '');
  const [roomDescription, setRoomDescription] = useState<string>(
    initialData?.description || ''
  );
  
  // Estados para la búsqueda de productos
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const debouncedProductSearchQuery = useDebounce(productSearchQuery, 300);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Determinar si el formulario es de solo lectura
  const isReadOnly = mode === 'view' || mode === 'delete';
  const isDeleteMode = mode === 'delete';

  // Hooks para datos
  const { data: usersData, isLoading: isLoadingUsers } = useUsersManagement({ 
    role: 'vip_customer' 
  });
  const users = usersData?.users || [];

  const { data: productsData, isLoading: isLoadingProducts, isError: isProductSearchError } = useProducts(
    { 
      filters: {
        query: `(title:*${debouncedProductSearchQuery}*) OR (product_type:*${debouncedProductSearchQuery}*) OR (tag:*${debouncedProductSearchQuery}*)`
      },
      first: 20,
      sortKey: 'RELEVANCE'
    },
    {
      enabled: !!debouncedProductSearchQuery && !isReadOnly,
    }
  );
  const products = productsData?.products || [];

  // ✅ CORRECCIÓN: Cargar productos iniciales cuando se proporciona initialData
  useEffect(() => {
    if (initialData?.products && initialData.products.length > 0) {
      // Los productos ya vienen completos desde el componente padre
      setSelectedProducts(initialData.products);
    }
  }, [initialData]);

  // Event handlers para dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (debouncedProductSearchQuery && (products.length > 0 || isLoadingProducts) && !isReadOnly) {
      setIsDropdownOpen(true);
    } else if (!debouncedProductSearchQuery) {
      setIsDropdownOpen(false);
    }
  }, [debouncedProductSearchQuery, products.length, isLoadingProducts, isReadOnly]);

  // Handlers
  const handleAddProduct = (product: Product) => {
    if (!selectedProducts.some(p => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, product]);
    }
    setProductSearchQuery('');
    setIsDropdownOpen(false);
    inputRef.current?.blur();
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const handleInputFocus = () => {
    if (debouncedProductSearchQuery && (products.length > 0 || isLoadingProducts) && !isReadOnly) {
      setIsDropdownOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isDeleteMode && onDelete) {
      await onDelete();
      return;
    }

    if (!selectedUser || !roomName) {
      alert('Please select a user and provide a room name.');
      return;
    }

    const formData: PrivateRoomData = {
      id: initialData?.id,
      name: roomName,
      description: roomDescription || null,
      userId: selectedUser,
      // ✅ CORRECCIÓN: Asegurar que se envíen los IDs correctos de Shopify
      products: selectedProducts.map(p => ({ 
        productId: p.id // El ID del producto de Shopify (GID)
      }))
    };

    await onSubmit(formData);
  };

  // Configuración de texto según el modo
  const getConfig = () => {
    switch (mode) {
      case 'create':
        return {
          title: 'Create New Private Room',
          subtitle: 'Set up a personalized shopping experience for your VIP customers',
          submitText: submitButtonText || 'Create Private Room',
          icon: <Plus className="h-5 w-5" />,
          alertVariant: null
        };
      case 'edit':
        return {
          title: 'Edit Private Room',
          subtitle: 'Update the private room details and products',
          submitText: submitButtonText || 'Update Private Room',
          icon: <Edit3 className="h-5 w-5" />,
          alertVariant: null
        };
      case 'view':
        return {
          title: 'Private Room Details',
          subtitle: 'View the private room configuration',
          submitText: null,
          icon: <Eye className="h-5 w-5" />,
          alertVariant: null
        };
      case 'delete':
        return {
          title: 'Delete Private Room',
          subtitle: 'This action cannot be undone',
          submitText: submitButtonText || 'Delete Private Room',
          icon: <Trash2 className="h-5 w-5" />,
          alertVariant: 'destructive' as const
        };
      default:
        return {
          title: 'Private Room',
          subtitle: '',
          submitText: 'Submit',
          icon: null,
          alertVariant: null
        };
    }
  };

  const config = getConfig();

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">

        {/* Alert para modo delete */}
        {isDeleteMode && (
          <Alert variant="destructive">
            <Trash2 className="h-4 w-4" />
            <AlertDescription>
              You are about to permanently delete this private room. This action cannot be undone.
            </AlertDescription>
          </Alert>
        )}


          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Room Name */}
            <div className="space-y-2">
              <Label htmlFor="roomName">Room Name</Label>
              <Input
                id="roomName"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter a descriptive room name..."
                required={!isDeleteMode}
                disabled={isReadOnly}
              />
            </div>

            {/* Room Description */}
            <div className="space-y-2">
              <Label htmlFor="roomDescription">Description (Optional)</Label>
              <Input
                id="roomDescription"
                value={roomDescription}
                onChange={(e) => setRoomDescription(e.target.value)}
                placeholder="Add a description for this private room..."
                disabled={isReadOnly}
              />
            </div>

            {/* User Selection */}
            {showUserSelection && (
              <div className="space-y-2">
                <Label htmlFor="userSelect">VIP User</Label>
                {isReadOnly ? (
                  <Input
                    value={users.find(u => u.id === selectedUser)?.email || 'Loading...'}
                    disabled
                  />
                ) : (
                  <Select value={selectedUser || undefined} onValueChange={setSelectedUser} required>
                    <SelectTrigger>
                      <SelectValue placeholder={
                        isLoadingUsers 
                          ? "Loading users..." 
                          : users.length === 0 
                            ? "No VIP users available"
                            : "Choose a VIP customer"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {!isLoadingUsers && users.length > 0 && users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.email} ({user.firstName} {user.lastName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Product Search */}
            {!isDeleteMode && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Products</Label>
                  {!isReadOnly && (
                    <div className="relative" ref={dropdownRef}>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          ref={inputRef}
                          type="text"
                          placeholder="Search products by title, type, or tag..."
                          value={productSearchQuery}
                          onChange={(e) => setProductSearchQuery(e.target.value)}
                          onFocus={handleInputFocus}
                          className="pl-10"
                        />
                      </div>
                      
                      {/* Search Dropdown */}
                      {isDropdownOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {isLoadingProducts && (
                            <div className="p-4 space-y-2">
                              <Skeleton className="h-8 w-full"/>
                              <Skeleton className="h-8 w-full"/>
                              <Skeleton className="h-8 w-full"/>
                            </div>
                          )}
                          
                          {!isLoadingProducts && !isProductSearchError && products.length === 0 && debouncedProductSearchQuery && (
                            <div className="p-4 text-center text-muted-foreground">
                              No products found for &quot;{debouncedProductSearchQuery}&quot;
                            </div>
                          )}
                          
                          {isProductSearchError && (
                            <div className="p-4 text-center text-destructive">Error searching for products</div>
                          )}

                          {products.length > 0 && !isLoadingProducts && (
                            <div className="py-2">
                              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50 border-b">
                                Products ({products.length} found)
                              </div>
                              {products.map((product) => (
                                <button
                                  key={product.id}
                                  type="button"
                                  onClick={() => handleAddProduct(product)}
                                  className="w-full flex items-center gap-4 px-3 py-3 text-left hover:bg-muted/50 border-b border-border/50 last:border-b-0 transition-colors"
                                >
                                  <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                                    <Image
                                      src={product.images[0]?.url || '/placeholder.svg'}
                                      alt={product.title}
                                      fill
                                      sizes="48px"
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="flex flex-col min-w-0 flex-1 space-y-1">
                                    <span className="font-medium text-sm truncate">{product.title}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground">
                                        ${product.priceRange.minVariantPrice.amount} {product.priceRange.minVariantPrice.currencyCode}
                                      </span>
                                      {product.productType && (
                                        <Badge variant="secondary" className="text-xs">
                                          {product.productType}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <Plus className="h-4 w-4 text-muted-foreground" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Products */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      {isReadOnly ? 'Products in this room' : 'Selected Products'}
                    </Label>
                    {selectedProducts.length > 0 && (
                      <Badge variant="outline">{selectedProducts.length} {isReadOnly ? 'products' : 'selected'}</Badge>
                    )}
                  </div>
                  
                  <ShadcnCard className="min-h-[200px] p-4">
                    {selectedProducts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center space-y-2 text-muted-foreground">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          <Search className="h-6 w-6" />
                        </div>
                        <p className="text-sm">
                          {isReadOnly ? 'No products in this room' : 'No products added yet'}
                        </p>
                        {!isReadOnly && (
                          <p className="text-xs">Search and select products to add them to this room</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedProducts.map((product) => (
                          <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                                <Image
                                  src={product.images[0]?.url || '/placeholder.svg'}
                                  alt={product.title}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="font-medium text-sm truncate">{product.title}</span>
                                <span className="text-xs text-muted-foreground">
                                  ${product.priceRange.minVariantPrice.amount} {product.priceRange.minVariantPrice.currencyCode}
                                </span>
                              </div>
                            </div>
                            {!isReadOnly && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveProduct(product.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </ShadcnCard>
                </div>
              </div>
            )}

            {/* Submit Button */}
            {config.submitText && (
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={(!selectedUser || !roomName) && !isDeleteMode || isLoading}
                  variant={isDeleteMode ? 'destructive' : 'default'}
                >
                  {isLoading ? 'Processing...' : config.submitText}
                </Button>
              </div>
            )}
          </form>
      </div>
    </div>
  );
}