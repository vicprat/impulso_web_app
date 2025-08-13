'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Permission } from '@/components/Guards/Permission'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { PERMISSIONS } from '@/config/Permissions'
import { useCreateTag, useUpdateTag } from '@/modules/blog/hooks'
import { tagCreateSchema, tagUpdateSchema, type CreateTagDto, type UpdateTagDto } from '@/modules/blog/types'

type Mode = 'create' | 'edit'

interface Props {
  defaultValues?: Partial<CreateTagDto & { id?: string }>
  mode?: Mode
  onSuccess?: (tagId?: string) => void
}

export const TagForm: React.FC<Props> = ({ defaultValues, mode = 'create', onSuccess }) => {
  const isEdit = mode === 'edit'
  const createMutation = useCreateTag()
  const updateMutation = useUpdateTag(defaultValues?.id ?? '')

  const form = useForm<CreateTagDto | UpdateTagDto>({
    defaultValues: {
      color: defaultValues?.color ?? '',
      isActive: defaultValues?.isActive ?? true,
      name: defaultValues?.name ?? '',
      slug: defaultValues?.slug ?? '',
    },
    resolver: zodResolver(isEdit ? tagUpdateSchema : tagCreateSchema),
  })

  const onSubmit = form.handleSubmit(async (values) => {
    if (isEdit && defaultValues?.id) {
      const payload = values as UpdateTagDto
      const res = await updateMutation.mutateAsync(payload)
      onSuccess?.(res.id)
    } else {
      const payload = values as CreateTagDto
      const res = await createMutation.mutateAsync(payload)
      onSuccess?.(res.id)
      form.reset()
    }
  })

  return (
    <form onSubmit={onSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='name'>Nombre</Label>
        <Input id='name' placeholder='Nombre del tag' {...form.register('name')} />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='slug'>Slug (opcional)</Label>
        <Input id='slug' placeholder='mi-tag' {...form.register('slug')} />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='color'>Color</Label>
        <Input id='color' placeholder='#00FF00 o token de diseño' {...form.register('color')} />
      </div>

      <div className='flex items-center justify-between rounded-md border p-3'>
        <div>
          <Label className='mb-1 block'>Activo</Label>
          <p className='text-xs text-muted-foreground'>Controla la visibilidad en la UI pública</p>
        </div>
        <Switch checked={!!form.watch('isActive')} onCheckedChange={(v) => form.setValue('isActive', v)} />
      </div>

      <div className='flex justify-end'>
        <Permission permission={PERMISSIONS.MANAGE_ALL_BLOG_POSTS}>
          <Button disabled={createMutation.isPending || updateMutation.isPending} type='submit'>
            {isEdit ? 'Guardar cambios' : 'Crear tag'}
          </Button>
        </Permission>
      </div>
    </form>
  )
}


