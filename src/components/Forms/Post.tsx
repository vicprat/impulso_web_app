'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { SupabaseImageUploader } from '@/components/Forms/SupabaseImageUploader'
import { Tiptap } from '@/components/TipTap'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useCategories, useCreatePost, useTags, useUpdatePost } from '@/modules/blog/hooks'
import { postCreateSchema, postUpdateSchema, type CreatePostDto, type PostStatus, type UpdatePostDto } from '@/modules/blog/types'

type Mode = 'create' | 'edit'

interface Props {
  defaultValues?: Partial<CreatePostDto & { id?: string; status?: PostStatus }>
  mode?: Mode
  onSuccess?: (postId?: string) => void
}

export const PostForm: React.FC<Props> = ({ defaultValues, mode = 'create', onSuccess }) => {
  const isEdit = mode === 'edit'
  const createMutation = useCreatePost()
  const updateMutation = useUpdatePost(defaultValues?.id ?? '')

  const form = useForm<CreatePostDto | UpdatePostDto>({
    defaultValues: {
      additionalImages: defaultValues?.additionalImages ?? [],
      content: defaultValues?.content ?? '',
      excerpt: defaultValues?.excerpt ?? '',
      featured: defaultValues?.featured ?? false,
      featuredImageUrl: defaultValues?.featuredImageUrl ?? '',
      metaDescription: defaultValues?.metaDescription ?? '',
      metaTitle: defaultValues?.metaTitle ?? '',
      status: (defaultValues?.status ?? 'DRAFT') as PostStatus,
      title: defaultValues?.title ?? '',
    },
    resolver: zodResolver(isEdit ? postUpdateSchema : postCreateSchema),
  })

  const { data: categories } = useCategories()
  const { data: tags } = useTags()

  const onSubmit = form.handleSubmit(async (values) => {
    if (isEdit && defaultValues?.id) {
      const payload = values as UpdatePostDto
      const res = await updateMutation.mutateAsync(payload)
      onSuccess?.(res.id)
    } else {
      const payload = values as CreatePostDto
      const res = await createMutation.mutateAsync(payload)
      onSuccess?.(res.id)
    }
  })

  useEffect(() => {
    if (!isEdit) return
    form.reset(form.getValues())
  }, [ form, isEdit ])

  return (
    <form onSubmit={onSubmit} className='space-y-6'>
      <div className='grid gap-6 md:grid-cols-2'>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='title'>Título</Label>
            <Input id='title' placeholder='Título del post' {...form.register('title')} />
          </div>

          <div className='space-y-2'>
            <Label>Contenido</Label>
            <Tiptap.Editor
              content={String(form.getValues('content') ?? '')}
              onChange={(content) => form.setValue('content', content, { shouldDirty: true })}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='excerpt'>Resumen</Label>
            <Textarea id='excerpt' placeholder='Resumen del post' {...form.register('excerpt')}></Textarea>
          </div>
        </div>

        <div className='space-y-4'>
          <div className='flex items-center justify-between rounded-md border p-4'>
            <div>
              <Label className='mb-1 block'>Destacado</Label>
              <p className='text-xs text-muted-foreground'>Marcar como destacado</p>
            </div>
            <Switch checked={!!form.watch('featured')} onCheckedChange={(v) => form.setValue('featured', v)} />
          </div>

          <div className='space-y-2'>
            <Label>Imagen destacada</Label>
            <SupabaseImageUploader
              value={(form.watch('featuredImageUrl') as string | undefined) || null}
              onChange={(url) => form.setValue('featuredImageUrl', url ?? '', { shouldDirty: true })}
              type='blog'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='status'>Estado</Label>
            <Select value={String(form.watch('status') ?? 'DRAFT')} onValueChange={(v) => form.setValue('status', v as PostStatus)}>
              <SelectTrigger id='status'>
                <SelectValue placeholder='Selecciona estado' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='DRAFT'>Borrador</SelectItem>
                <SelectItem value='PUBLISHED'>Publicado</SelectItem>
                <SelectItem value='ARCHIVED'>Archivado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label>Categorías</Label>
            <div className='grid grid-cols-2 gap-2'>
              {categories?.map((c) => (
                <label key={c.id} className='flex items-center gap-2 text-sm'>
                  <input
                    checked={(form.watch('categoryIds') as string[] | undefined)?.includes(c.id) ?? false}
                    className='size-4'
                    onChange={(e) => {
                      const current = (form.getValues('categoryIds') as string[] | undefined) ?? []
                      const next = e.target.checked ? Array.from(new Set([ ...current, c.id ])) : current.filter((x) => x !== c.id)
                      form.setValue('categoryIds', next)
                    }}
                    type='checkbox'
                  />
                  <span>{c.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Tags</Label>
            <div className='grid grid-cols-2 gap-2'>
              {tags?.map((t) => (
                <label key={t.id} className='flex items-center gap-2 text-sm'>
                  <input
                    checked={(form.watch('tagIds') as string[] | undefined)?.includes(t.id) ?? false}
                    className='size-4'
                    onChange={(e) => {
                      const current = (form.getValues('tagIds') as string[] | undefined) ?? []
                      const next = e.target.checked ? Array.from(new Set([ ...current, t.id ])) : current.filter((x) => x !== t.id)
                      form.setValue('tagIds', next)
                    }}
                    type='checkbox'
                  />
                  <span>{t.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='metaTitle'>Meta título</Label>
            <Input id='metaTitle' placeholder='Título SEO' {...form.register('metaTitle')} />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='metaDescription'>Meta descripción</Label>
            <Textarea id='metaDescription' placeholder='Descripción SEO' {...form.register('metaDescription')} />
          </div>
        </div>
      </div>

      <div className='flex justify-end gap-2'>
        <Button disabled={createMutation.isPending || updateMutation.isPending} type='submit'>
          {isEdit ? 'Guardar cambios' : 'Crear post'}
        </Button>
      </div>
    </form>
  )
}


