const BAR_HEIGHTS = [40, 70, 55, 90, 65, 80, 45]

export function MockDashboard({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex h-full w-full gap-2 bg-bg-elevated p-2.5">
      {!compact && (
        <div className="flex w-8 flex-col gap-2 rounded-md bg-surface p-1.5">
          <div className="h-2 w-full rounded-sm bg-accent/70" />
          <div className="h-2 w-full rounded-sm bg-fg-subtle/30" />
          <div className="h-2 w-full rounded-sm bg-fg-subtle/30" />
          <div className="h-2 w-full rounded-sm bg-fg-subtle/30" />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2">
        <div className="grid grid-cols-3 gap-1.5">
          {['Burn rate', 'Runway', 'Margin'].map((label) => (
            <div key={label} className="rounded-md bg-surface p-1.5">
              <div className="h-1 w-2/3 rounded-full bg-fg-subtle/40" />
              <div className="mt-1.5 h-2 w-1/2 rounded-full bg-accent/80" />
            </div>
          ))}
        </div>
        <div className="flex flex-1 items-end gap-1 rounded-md bg-surface p-2">
          {BAR_HEIGHTS.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm bg-accent/70"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
