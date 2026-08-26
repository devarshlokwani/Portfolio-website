import { forwardRef } from 'react'

import { resolveIcon, type IconSet } from '@/components/sections/Skills/iconRegistry'

export interface SkillItem {
  id: string
  label: string
  set: IconSet
  icon: string
  color: string
}

interface SkillNodeProps {
  item: SkillItem
}

export const SkillNode = forwardRef<HTMLDivElement, SkillNodeProps>(function SkillNode(
  { item },
  ref,
) {
  const Icon = resolveIcon(item.set, item.icon)

  return (
    <div
      ref={ref}
      className="absolute left-1/2 top-1/2 flex flex-col items-center gap-1.5 will-change-transform"
    >
      <div
        className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface shadow-lg md:h-14 md:w-14"
        style={{ color: item.color }}
      >
        {Icon && <Icon className="h-5 w-5 md:h-6 md:w-6" />}
      </div>
      <span className="whitespace-nowrap font-mono text-[10px] text-fg-muted">{item.label}</span>
    </div>
  )
})
