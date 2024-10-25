'use client'

import { createContext, useContext } from 'react'

type ToastType = 'success' | 'warning' | 'error'

interface ToastContext {
  showToast: (message: string, type: ToastType) => void
  closeToast: () => void
}

export const ToastContext = createContext<ToastContext>({
  showToast: () => {},
  closeToast: () => {}
})

export const useToast = () => {
  return useContext(ToastContext)
}