import { MockDashboard } from '@/components/sections/Projects/MockDashboard'

interface DeviceFramePreviewProps {
  device: 'browser' | 'desktop' | 'mobile'
  title: string
}

function BrowserFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-72 overflow-hidden rounded-xl border border-border bg-bg-elevated shadow-2xl md:w-80">
      <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
        <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
        <span className="h-2 w-2 rounded-full bg-[#28c840]" />
        <span className="ml-2 truncate rounded-full bg-surface px-2 py-0.5 font-mono text-[9px] text-fg-subtle">
          {title.toLowerCase().replace(/\s+/g, '')}.dev
        </span>
      </div>
      <div className="h-40">{children}</div>
    </div>
  )
}

function MobileFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-40 overflow-hidden rounded-[1.75rem] border-4 border-bg-elevated bg-bg-elevated shadow-2xl">
      <div className="relative h-64 overflow-hidden rounded-[1.4rem] bg-bg-elevated">
        <div className="absolute left-1/2 top-1.5 h-1.5 w-10 -translate-x-1/2 rounded-full bg-surface" />
        <div className="h-full pt-4">{children}</div>
      </div>
    </div>
  )
}

export function DeviceFramePreview({ device, title }: DeviceFramePreviewProps) {
  if (device === 'mobile') {
    return (
      <MobileFrame>
        <MockDashboard compact />
      </MobileFrame>
    )
  }

  return (
    <BrowserFrame title={title}>
      <MockDashboard />
    </BrowserFrame>
  )
}
