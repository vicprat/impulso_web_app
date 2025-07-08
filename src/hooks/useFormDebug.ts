/* eslint-disable no-console */
import { useEffect } from 'react'
import { type FieldValues, type UseFormReturn } from 'react-hook-form'

export const useFormDebug = <T extends FieldValues>(
  form: UseFormReturn<T>,
  formName = 'Form'
): void => {
  useEffect(() => {
    const subscription = form.watch((value) => {
      console.log(`${formName} values:`, value)
    })

    return () => subscription.unsubscribe()
  }, [form, formName])

  useEffect(() => {
    if (form.formState.isSubmitSuccessful) {
      console.log(`${formName} submit successful`)
    } else {
      console.log(`${formName} isSubmitSuccessful:`, form.formState.isSubmitSuccessful)
    }

    return () => {
      /* cleanup */
    }
  }, [form.formState.isSubmitSuccessful, form, formName])

  useEffect(() => {
    if (form.formState.isSubmitting) {
      console.log(`${formName} submitting...`)
    } else {
      console.log(`${formName} isSubmitting:`, form.formState.isSubmitting)
    }

    return () => {
      /* cleanup */
    }
  }, [form.formState.isSubmitting, form, formName])
}
