'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Permission } from '@/components/Guards/Permission'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { PERMISSIONS } from '@/config/Permissions'
import { useCreateCategory, useUpdateCategory } from '@/modules/blog/hooks'
import {
  categoryCreateSchema,
  categoryUpdateSchema,
  type CreateCategoryDto,
  type UpdateCategoryDto,
} from '@/modules/blog/types'

type Mode = 'create' | 'edit'

interface Props {
  defaultValues?: Partial<CreateCategoryDto & { id?: string }>
  mode?: Mode
  onSuccess?: (categoryId?: string) => void
}

export const CategoryForm: React.FC<Props> = ({ defaultValues, mode = 'create', onSuccess }) => {
  const isEdit = mode === 'edit'
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory(defaultValues?.id ?? '')

  const form = useForm<CreateCategoryDto | UpdateCategoryDto>({
    defaultValues: {
      color: defaultValues?.color ?? '',
      description: defaultValues?.description ?? '',
      isActive: defaultValues?.isActive ?? true,
      name: defaultValues?.name ?? '',
      order: defaultValues?.order ?? 0,
      slug: defaultValues?.slug ?? '',
    },
    resolver: zodResolver(isEdit ? categoryUpdateSchema : categoryCreateSchema),
  })

  const onSubmit = form.handleSubmit(async (values) => {
    if (isEdit && defaultValues?.id) {
      const payload = values as UpdateCategoryDto
      const res = await updateMutation.mutateAsync(payload)
      onSuccess?.(res.id)
    } else {
      const payload = values as CreateCategoryDto
      const res = await createMutation.mutateAsync(payload)
      onSuccess?.(res.id)
      form.reset()
    }
  })

  return (
    <form onSubmit={onSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='name'>Nombre</Label>
        <Input id='name' placeholder='Nombre de la categoría' {...form.register('name')} />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='slug'>Slug (opcional)</Label>
        <Input id='slug' placeholder='mi-categoria' {...form.register('slug')} />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='description'>Descripción</Label>
        <Textarea id='description' placeholder='Descripción de la categoría' {...form.register('description')} />
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='color'>Color</Label>
          <Input id='color' placeholder='#00FF00 o token de diseño' {...form.register('color')} />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='order'>Orden</Label>
          <Input id='order' type='number' {...form.register('order', { valueAsNumber: true })} />
        </div>
      </div>

      <div className='flex items-center justify-between rounded-md border p-3'>
        <div>
          <Label className='mb-1 block'>Activa</Label>
          <p className='text-xs text-muted-foreground'>Controla la visibilidad en la UI pública</p>
        </div>
        <Switch checked={!!form.watch('isActive')} onCheckedChange={(v) => form.setValue('isActive', v)} />
      </div>

      <div className='flex justify-end'>
        <Permission permission={PERMISSIONS.MANAGE_ALL_BLOG_POSTS}>
          <Button disabled={createMutation.isPending || updateMutation.isPending} type='submit'>
            {isEdit ? 'Guardar cambios' : 'Crear categoría'}
          </Button>
        </Permission>
      </div>
    </form>
  )
}


