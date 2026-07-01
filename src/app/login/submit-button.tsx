'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export function SubmitButton({ 
  formAction, 
  variant = 'exec', 
  className = '', 
  children,
  loadingLabel = "PROCESSING..."
}: { 
  formAction: any
  variant?: 'exec' | 'info' | 'warning' | 'ghost'
  className?: string
  children: React.ReactNode
  loadingLabel?: string
}) {
  const { pending } = useFormStatus()

  if (pending) {
    return (
      <div className={`flex justify-center items-center py-2 ${className}`}>
        <Spinner label="LOADING..." />
      </div>
    )
  }

  return (
    <Button formAction={formAction} variant={variant} className={className}>
      {children}
    </Button>
  )
}
