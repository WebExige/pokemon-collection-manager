import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light',
      
      // Basculer entre les thèmes
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: newTheme })
        
        // Appliquer immédiatement au document
        document.documentElement.className = newTheme
      },
      
      // Définir un thème spécifique
      setTheme: (theme) => {
        set({ theme })
        document.documentElement.className = theme
      },
      
      // Détecter le thème système
      detectSystemTheme: () => {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
          ? 'dark' 
          : 'light'
        set({ theme: systemTheme })
        document.documentElement.className = systemTheme
      }
    }),
    {
      name: 'pokemon-theme-storage',
      storage: {
        getItem: (name) => {
          const value = localStorage.getItem(name)
          return value ? JSON.parse(value) : null
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          localStorage.removeItem(name)
        }
      }
    }
  )
)