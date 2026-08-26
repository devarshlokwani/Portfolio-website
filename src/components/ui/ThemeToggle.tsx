import { useTheme } from '@/hooks/useTheme'

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3">
      <circle cx="12" cy="12" r="4" />
      <path
        strokeLinecap="round"
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
      <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 1020.354 15.354z" />
    </svg>
  )
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      className="relative flex h-8 w-14 items-center rounded-full border border-border bg-surface px-1 transition-colors"
    >
      <span
        className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-fg transition-transform duration-300 ease-out"
        style={{ transform: isDark ? 'translateX(0)' : 'translateX(1.5rem)' }}
      >
        {isDark ? <MoonIcon /> : <SunIcon />}
      </span>
    </button>
  )
}
