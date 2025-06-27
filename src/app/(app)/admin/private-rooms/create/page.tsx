'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { privateRoomsApi } from '@/modules/rooms/api';
import { toast } from 'sonner';
import { Form } from '@/components/Forms';
import { PrivateRoomData } from '@/components/Forms/Room';

export default function CreatePrivateRoomPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (data: PrivateRoomData) => {
    setIsLoading(true);
    try {
      await privateRoomsApi.createPrivateRoom({
        name: data.name,
        description: data.description,
        userId: data.userId,
        productIds: data.products.map(p => p.productId),
      });
      
      toast.success('Private room created successfully!');
      router.push('/admin/private-rooms'); // Redirigir a la lista
      
    } catch (error) {
      console.error('Error creating private room:', error);
      toast.error('Failed to create private room.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form.Room
      mode="create"
      onSubmit={handleCreate}
      isLoading={isLoading}
    />
  );
}