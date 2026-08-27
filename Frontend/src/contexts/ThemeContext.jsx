import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('system') // 'light', 'dark', or 'system'
  const [isDark, setIsDark] = useState(false)

  // Get system preference
  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  // Apply theme
  const applyTheme = (themeMode) => {
    let shouldBeDark = false

    if (themeMode === 'system') {
      shouldBeDark = getSystemTheme() === 'dark'
    } else {
      shouldBeDark = themeMode === 'dark'
    }

    setIsDark(shouldBeDark)
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Initialize theme
  useEffect(() => {
    const saved = localStorage.getItem('kb_theme')
    const defaultTheme = window.innerWidth < 640 ? 'light' : 'system'
    const initialTheme = saved || defaultTheme

    setTheme(initialTheme)
    applyTheme(initialTheme)
  }, [])

  // Listen for system theme changes
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => {
        applyTheme('system')
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  const setThemeMode = (themeMode) => {
    setTheme(themeMode)
    localStorage.setItem('kb_theme', themeMode)
    applyTheme(themeMode)
  }

  const toggleTheme = () => {
    // Legacy toggle - cycles through light -> dark -> system
    if (theme === 'light') {
      setThemeMode('dark')
    } else if (theme === 'dark') {
      setThemeMode('system')
    } else {
      setThemeMode('light')
    }
  }

  return (
    <ThemeContext.Provider value={{ isDark, theme, setThemeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

