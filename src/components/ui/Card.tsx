import { cn } from '../../lib/utils'

interface Props {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: Props) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-100 shadow-sm', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: Props) {
  return (
    <div className={cn('px-6 py-4 border-b border-gray-100', className)}>{children}</div>
  )
}

export function CardTitle({ children, className }: Props) {
  return (
    <h3 className={cn('font-semibold text-gray-900 text-base', className)}>{children}</h3>
  )
}

export function CardContent({ children, className }: Props) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>
}
