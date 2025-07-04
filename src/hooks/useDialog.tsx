'use client'
import { useState } from 'react'
export const useDialog = (initialOpen = false) => {
  const [open, setOpen] = useState(initialOpen)

  const openDialog = () => setOpen(true)
  const closeDialog = () => setOpen(false)
  const toggleDialog = () => setOpen((previous) => !previous)

  return {
    closeDialog,
    onOpenChange: setOpen,
    open,
    openDialog,
    toggleDialog,
  }
}
