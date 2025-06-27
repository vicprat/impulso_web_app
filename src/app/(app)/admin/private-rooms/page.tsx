'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card as ShadcnCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  Users, 
  Package,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { Card } from '@/components/Card.tsx';

interface PrivateRoom {
  id: string;
  name: string;
  description?: string;
  userId: string;
  user?: {
    email: string;
    firstName: string;
    lastName: string;
  };
  products: Array<{ id: string; productId: string }>;
  createdAt: string;
  updatedAt: string;
}

export default function PrivateRoomsListPage() {
  const [privateRooms, setPrivateRooms] = useState<PrivateRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPrivateRooms();
  }, []);

  const loadPrivateRooms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/private-rooms');
      if (!response.ok) {
        throw new Error('Failed to load private rooms');
      }
      
      const data = await response.json();
      setPrivateRooms(data.privateRooms || data);
      
    } catch (error) {
      console.error('Error loading private rooms:', error);
      setError(error instanceof Error ? error.message : 'Failed to load private rooms');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Private Rooms</h1>
            <p className="text-muted-foreground">
              Manage personalized shopping experiences for VIP customers
            </p>
          </div>
          <div className="flex items-center space-x-2">

          <Button asChild>
            <Link href="/admin/private-rooms/create">
              <Plus className="h-5 w-5 mr-2" />
              Create New Room
            </Link>
          </Button>
          <Button variant="outline" onClick={loadPrivateRooms} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ShadcnCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Rooms</p>
                <p className="text-2xl font-bold">{privateRooms.length}</p>
              </div>
            </div>
          </ShadcnCard>
          
          <ShadcnCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">
                  {privateRooms.reduce((acc, room) => acc + room.products.length, 0)}
                </p>
              </div>
            </div>
          </ShadcnCard>
          
          <ShadcnCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active This Month</p>
                <p className="text-2xl font-bold">
                  {privateRooms.filter(room => 
                    new Date(room.createdAt).getMonth() === new Date().getMonth()
                  ).length}
                </p>
              </div>
            </div>
          </ShadcnCard>
        </div>

        {/* Private Rooms List */}
        {isLoading ? (
        <Card.Loader />
        ) : privateRooms.length === 0 ? (
          <ShadcnCard className="p-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No Private Rooms Yet</h3>
                <p className="text-muted-foreground">
                  Create your first private room to get started with personalized shopping experiences.
                </p>
              </div>
              <Button asChild>
                <Link href="/admin/private-rooms/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Room
                </Link>
              </Button>
            </div>
          </ShadcnCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {privateRooms.map((room) => (
              <ShadcnCard key={room.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  {/* Header con link al room */}
                  <div className="space-y-2">
                    <Link 
                      href={`/admin/private-rooms/${room.id}`}
                      className="block group"
                    >
                      <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                        {room.name}
                        <ExternalLink className="inline h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                    </Link>
                    {room.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {room.description}
                      </p>
                    )}
                  </div>

                  {/* User Info */}
                  {room.user && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">
                        {room.user.firstName} {room.user.lastName}
                      </span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>{room.products.length} products</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(room.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions - ACTUALIZADO con URLs simplificadas */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/private-rooms/${room.id}`}>
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Link>
                    </Button>
                    
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/private-rooms/${room.id}?mode=edit`}>
                        <Edit3 className="h-3 w-3 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    
                    <Button size="sm" variant="destructive" asChild>
                      <Link href={`/admin/private-rooms/${room.id}?mode=delete`}>
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Link>
                    </Button>
                  </div>

                </div>
              </ShadcnCard>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}