'use client'

import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { type Links as LinkType } from '@prisma/client'
import { GripVertical, Loader2, Pencil, PlusCircle, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PLATFORMS } from '@/config/platforms'
import { useUserProfile } from '@/modules/user/hooks/useUserProfile'

// --- SortableLinkItem Component ---
interface SortableLinkItemProps {
  link: LinkType
  isEditing: boolean
  isUpdating: boolean
  isDeleting: boolean
  editedUrl: string
  onEditClick: (id: string, url: string) => void
  onCancelEdit: () => void
  onSaveEdit: (id: string) => void
  onDelete: (id: string) => void
  onUrlChange: (value: string) => void
}

const SortableLinkItem = ({
  editedUrl,
  isDeleting,
  isEditing,
  isUpdating,
  link,
  onCancelEdit,
  onDelete,
  onEditClick,
  onSaveEdit,
  onUrlChange,
}: SortableLinkItemProps) => {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    id: link.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  }

  const platform = useMemo(
    () => PLATFORMS.find((p) => p.id === link.platform) || PLATFORMS.find((p) => p.id === 'custom'),
    [link.platform]
  )

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between rounded-md bg-surface-container p-3 shadow-elevation-1 ${isDragging ? 'shadow-elevation-4' : ''}`}
    >
      {isEditing ? (
        <div className='flex w-full items-center gap-2'>
          <Input
            value={editedUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            className='grow border-input bg-background text-foreground focus:border-primary focus:ring-primary'
            disabled={isUpdating}
          />
          <Button size='sm' onClick={() => onSaveEdit(link.id)} disabled={isUpdating}>
            {isUpdating ? <Loader2 className='animate-spin' /> : 'Save'}
          </Button>
          <Button size='sm' variant='outline' onClick={onCancelEdit}>
            Cancel
          </Button>
        </div>
      ) : (
        <>
          <div className='flex items-center gap-3'>
            <button
              {...attributes}
              {...listeners}
              className='cursor-grab p-1 text-muted-foreground hover:text-foreground'
            >
              <GripVertical className='size-5' />
            </button>
            <div className='flex items-center gap-2'>
              {platform?.icon}
              <a
                href={link.url}
                target='_blank'
                rel='noopener noreferrer'
                className='truncate text-sm font-medium text-foreground hover:underline'
              >
                {link.url.replace(/^(https?):\/\//, '')}
              </a>
            </div>
          </div>
          <div className='flex gap-1'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => onEditClick(link.id, link.url)}
              disabled={isDeleting || isUpdating}
              className='text-muted-foreground hover:text-foreground'
            >
              <Pencil className='size-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => onDelete(link.id)}
              disabled={isDeleting || isUpdating}
              className='hover:bg-destructive/10 text-destructive'
            >
              <Trash2 className='size-4' />
            </Button>
          </div>
        </>
      )}
    </li>
  )
}

// --- Main Links Component ---
export const Links = () => {
  const [newLinkUrl, setNewLinkUrl] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState(PLATFORMS[0].id)
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null)
  const [editedLinkUrl, setEditedLinkUrl] = useState('')
  const [orderedLinks, setOrderedLinks] = useState<LinkType[]>([])

  const {
    createLink,
    deleteLink,
    isCreatingLink,
    isDeletingLink,
    isLinksLoading,
    isUpdatingLink,
    links,
    updateLink,
    updateLinksOrder,
  } = useUserProfile()

  useEffect(() => {
    if (links) {
      setOrderedLinks(links)
    }
  }, [links])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleAddLink = async () => {
    if (!newLinkUrl.trim()) {
      toast.error('El identificador del enlace no puede estar vacío.')
      return
    }

    const platform = PLATFORMS.find((p) => p.id === selectedPlatform)
    if (!platform) return

    const finalUrl = platform.id === 'custom' ? newLinkUrl : `${platform.prefix}${newLinkUrl}`

    try {
      new URL(finalUrl.startsWith('http') ? finalUrl : `https://${finalUrl}`)
    } catch {
      toast.error('Formato de URL inválido.')
      return
    }

    await createLink({ platform: selectedPlatform, url: finalUrl })
    setNewLinkUrl('')
  }

  const handleDeleteLink = async (linkId: string) => await deleteLink(linkId)

  const handleEditClick = (linkId: string, currentUrl: string) => {
    setEditingLinkId(linkId)
    setEditedLinkUrl(currentUrl)
  }

  const handleCancelEdit = () => {
    setEditingLinkId(null)
    setEditedLinkUrl('')
  }

  const handleSaveEdit = async (linkId: string) => {
    const platform = PLATFORMS.find(
      (p) => p.id === orderedLinks.find((l) => l.id === linkId)?.platform
    )
    const finalUrl = editedLinkUrl
    try {
      new URL(finalUrl.startsWith('http') ? finalUrl : `https://${finalUrl}`)
    } catch {
      toast.error('Formato de URL inválido.')
      return
    }

    await updateLink({ data: { platform: platform?.id, url: finalUrl }, linkId })
    handleCancelEdit()
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = orderedLinks.findIndex((link) => link.id === active.id)
      const newIndex = orderedLinks.findIndex((link) => link.id === over.id)
      const newOrder = arrayMove(orderedLinks, oldIndex, newIndex)
      setOrderedLinks(newOrder)

      const reorderPayload = newOrder.map((link, index) => ({ id: link.id, order: index }))
      updateLinksOrder(reorderPayload)
    }
  }

  return (
    <Card className='border-none shadow-none'>
      <CardHeader className='px-0 pt-0'>
        <CardTitle className='text-lg font-semibold text-foreground'>
          Administra tus enlaces
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6 px-0'>
        <div className='space-y-2 rounded-lg border border-outline p-4'>
          <Label className='text-muted-foreground'>Añadir nuevo enlace</Label>
          <div className='flex flex-col gap-2 sm:flex-row'>
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className='w-full sm:w-[180px]'>
                <SelectValue placeholder='Selecciona una plataforma' />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder={
                PLATFORMS.find((p) => p.id === selectedPlatform)?.prefix || 'https://...'
              }
              className='grow border-input bg-background text-foreground focus:border-primary focus:ring-primary'
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              disabled={isCreatingLink}
            />
            <Button
              onClick={handleAddLink}
              disabled={isCreatingLink}
              className='hover:bg-primary/90 bg-primary text-on-primary'
            >
              <PlusCircle className='mr-2 size-4' /> {isCreatingLink ? 'Añadiendo...' : 'Añadir'}
            </Button>
          </div>
        </div>

        <div className='space-y-3'>
          <h3 className='font-medium text-muted-foreground'>Tus enlaces</h3>
          {isLinksLoading ? (
            <div className='rounded-md bg-surface-container p-4 text-center text-muted-foreground'>
              <Loader2 className='mx-auto animate-spin' />
            </div>
          ) : orderedLinks.length > 0 ? (
            <DndContext
              sensors={sensors}
              onDragEnd={handleDragEnd}
              collisionDetection={closestCenter}
            >
              <SortableContext items={orderedLinks} strategy={verticalListSortingStrategy}>
                <ul className='space-y-2'>
                  {orderedLinks.map((link) => (
                    <SortableLinkItem
                      key={link.id}
                      link={link}
                      isEditing={editingLinkId === link.id}
                      editedUrl={editedLinkUrl}
                      isUpdating={isUpdatingLink}
                      isDeleting={isDeletingLink}
                      onEditClick={handleEditClick}
                      onCancelEdit={handleCancelEdit}
                      onSaveEdit={handleSaveEdit}
                      onDelete={handleDeleteLink}
                      onUrlChange={setEditedLinkUrl}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          ) : (
            <div className='rounded-md bg-surface-container-low p-6 text-center text-muted-foreground'>
              <p>Aún no has añadido ningún enlace.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
