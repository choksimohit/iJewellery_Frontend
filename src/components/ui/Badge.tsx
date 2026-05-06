import { cn } from '../../lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default'
  className?: string
}

const variants = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  warning: 'bg-amber-50 text-amber-700 ring-amber-100',
  danger:  'bg-red-50 text-red-700 ring-red-100',
  info:    'bg-blue-50 text-blue-700 ring-blue-100',
  default: 'bg-gray-100 text-gray-600 ring-gray-200',
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
