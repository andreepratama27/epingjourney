import { Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '#/hooks/use-theme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [hovered, setHovered] = useState(false)
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: 10,
        background: 'transparent',
        border: `1.5px solid ${hovered ? 'var(--ep-rose-deep)' : 'var(--ep-hairline)'}`,
        color: hovered ? 'var(--ep-rose-deep)' : 'var(--ep-ink)',
        cursor: 'pointer',
        transition: 'all 200ms ease',
        flexShrink: 0,
      }}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
