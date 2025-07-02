'use client'
import { useState } from 'react'

import { Confirm } from './Confirm'
import { Form } from './Form'
import { Main } from './Main'

export const Dialog = {
  Confirm,
  Form,
  Main,
}

export const useDialogForm = (initialOpen = false) => {
  const [open, setOpen] = useState(initialOpen)

  const openDialog = () => setOpen(true)
  const closeDialog = () => setOpen(false)
  const toggleDialog = () => setOpen((prev) => !prev)

  return {
    closeDialog,
    onOpenChange: setOpen,
    open,
    openDialog,
    toggleDialog,
  }
}
