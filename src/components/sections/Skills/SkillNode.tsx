import { forwardRef } from 'react'

import { resolveIcon, type IconSet } from '@/components/sections/Skills/iconRegistry'

export interface SkillItem {
  id: string
  label: string
  set: IconSet
  icon: string
  color: string
  category: string
}

export type SkillNodeState = 'default' | 'active' | 'dimmed'

interface SkillNodeProps {
  item: SkillItem
  state?: SkillNodeState
}

export const SkillNode = forwardRef<HTMLDivElement, SkillNodeProps>(function SkillNode(
  { item, state = 'default' },
  ref,
) {
  const Icon = resolveIcon(item.set, item.icon)

  return (
    <div
      ref={ref}
      className="absolute left-1/2 top-1/2 flex flex-col items-center gap-1.5 will-change-transform"
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-full border bg-surface shadow-lg transition-all duration-500 ease-out md:h-14 md:w-14 ${
          state === 'dimmed' ? 'border-border grayscale' : 'border-border'
        } ${state === 'active' ? 'scale-[1.15]' : 'scale-100'}`}
        style={{
          color: item.color,
          opacity: state === 'dimmed' ? 0.25 : 1,
          boxShadow: state === 'active' ? `0 0 22px 3px ${item.color}99, 0 0 0 1px ${item.color}` : undefined,
        }}
      >
        {Icon && <Icon className="h-5 w-5 md:h-6 md:w-6" />}
      </div>
      <span
        className="whitespace-nowrap font-mono text-[10px] transition-opacity duration-500"
        style={{
          color: state === 'active' ? item.color : 'var(--color-fg-muted)',
          opacity: state === 'dimmed' ? 0.25 : 1,
        }}
      >
        {item.label}
      </span>
    </div>
  )
})
