'use client'

import { useParams } from 'next/navigation'

import { Dialog } from '@/components/Dialog'
import { Form } from '@/components/Forms'
import { Permission } from '@/components/Guards/Permission'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PERMISSIONS } from '@/config/Permissions'
import { useDialog } from '@/hooks/useDialog'
import { usePost } from '@/modules/blog/hooks'

export default function BlogEditPage() {
  const params = useParams<{ id: string }>()
  const id = String(params.id)
  const { data } = usePost(id)
  const categoryDialog = useDialog()
  const tagDialog = useDialog()

  return (
    <Permission permission={PERMISSIONS.MANAGE_OWN_BLOG_POSTS}>
      <div className='space-y-6'>
        <h1 className='text-xl font-semibold'>Editar entrada</h1>

        <div className='grid gap-6 md:grid-cols-3'>
          <Card className='md:col-span-2'>
            <CardHeader>
              <CardTitle>Contenido</CardTitle>
            </CardHeader>
            <CardContent>
              {data && (
                <Form.Post
                  defaultValues={{
                    additionalImages: data.additionalImages,
                    content: data.content,
                    excerpt: data.excerpt ?? undefined,
                    featured: data.featured,
                    featuredImageUrl: data.featuredImageUrl ?? undefined,
                    id: data.id,
                    metaDescription: data.metaDescription ?? undefined,
                    metaTitle: data.metaTitle ?? undefined,
                    status: data.status,
                    title: data.title,
                  }}
                  mode='edit'
                />
              )}
            </CardContent>
          </Card>

          <div className='space-y-6'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between'>
                <CardTitle>Categorías</CardTitle>
                <Permission permission={PERMISSIONS.MANAGE_ALL_BLOG_POSTS}>
                  <Dialog.Form onOpenChange={categoryDialog.onOpenChange} open={categoryDialog.open} title='Crear Categoría' triggerText='Añadir'>
                    <Form.Category />
                  </Dialog.Form>
                </Permission>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>Gestiona categorías desde el botón “Añadir”.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between'>
                <CardTitle>Tags</CardTitle>
                <Permission permission={PERMISSIONS.MANAGE_ALL_BLOG_POSTS}>
                  <Dialog.Form onOpenChange={tagDialog.onOpenChange} open={tagDialog.open} title='Crear Tag' triggerText='Añadir'>
                    <Form.Tag />
                  </Dialog.Form>
                </Permission>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>Gestiona tags desde el botón “Añadir”.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Permission>
  )
}


