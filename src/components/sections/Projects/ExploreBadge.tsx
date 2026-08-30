import { useId } from 'react'
import { LuArrowUpRight } from 'react-icons/lu'

interface ExploreBadgeProps {
  label?: string
}

/**
 * A circular "OPEN TO EXPLORE" label that spins continuously around a
 * centered dot, plus a small arrow-in-circle button top-right — both fade
 * in only while the parent (the screenshot area) is hovered. Meant to sit
 * absolutely-positioned inside a `group relative` image container.
 */
export function ExploreBadge({ label = 'OPEN TO EXPLORE • OPEN TO EXPLORE • ' }: ExploreBadgeProps) {
  const pathId = useId()

  return (
    <>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="explore-badge-spin relative h-28 w-28">
          <svg viewBox="0 0 100 100" className="h-full w-full text-fg">
            <defs>
              <path id={pathId} d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
            </defs>
            <text fontSize="7.5" fill="currentColor" letterSpacing="1.5">
              <textPath href={`#${pathId}`}>{label}</textPath>
            </text>
          </svg>
          <span className="absolute inset-0 m-auto flex h-9 w-9 items-center justify-center rounded-full bg-fg text-bg">
            <LuArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
      <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-fg text-bg opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <LuArrowUpRight className="h-4 w-4" />
      </span>
    </>
  )
}
