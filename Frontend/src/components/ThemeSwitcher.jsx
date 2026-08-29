import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const options = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

const ThemeSwitcher = () => {
  const { theme, setThemeMode } = useTheme()

  return (
    <div
      className="fixed bottom-20 right-3 z-[65] flex items-center gap-1 rounded-full border border-gray-200/90 bg-white/92 p-1 shadow-[0_10px_30px_rgba(15,23,42,.12)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0a0a0a]/92 lg:bottom-auto lg:right-4 lg:top-[5.75rem]"
      role="group"
      aria-label="Choose appearance"
    >
      {options.map(({ value, label, icon: Icon }) => {
        const active = theme === value
        return (
          <button
            key={value}
            type="button"
            onClick={() => setThemeMode(value)}
            className={`grid h-8 w-8 place-items-center rounded-full transition-all ${
              active
                ? 'bg-[#108910] text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white'
            }`}
            aria-label={`Use ${label.toLowerCase()} theme`}
            aria-pressed={active}
            title={`${label} theme`}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
          </button>
        )
      })}
    </div>
  )
}

export default ThemeSwitcher
