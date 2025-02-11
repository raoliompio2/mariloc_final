import { lazy, Suspense } from 'react'
import * as icons from 'lucide-react'

interface DynamicIconProps {
  name: string
  className?: string
}

export function DynamicIcon({ name, className }: DynamicIconProps) {
  const Icon = icons[name as keyof typeof icons]

  if (!Icon) {
    console.warn(`Icon ${name} not found`)
    return null
  }

  return (
    <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
      <Icon className={className || "h-10 w-10 text-primary"} />
    </div>
  )
}
