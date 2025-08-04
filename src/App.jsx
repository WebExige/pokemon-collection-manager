import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './stores/authStore'
import { useThemeStore } from './stores/themeStore'

// Import des composants principaux
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard'
import Collection from './pages/Collection'
import Explorer from './pages/Explorer'
import Search from './pages/Search'
import Profile from './pages/Profile'
import Login from './pages/Login'
import LoadingSpinner from './components/UI/LoadingSpinner'

function App() {
  const { user, loading, checkAuth } = useAuthStore()
  const { theme } = useThemeStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    // Appliquer le thème au document
    document.documentElement.className = theme
  }, [theme])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  // Redirection vers login si non connecté
  if (!user) {
    return <Login />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/explorer" element={<Explorer />} />
        <Route path="/search" element={<Search />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Layout>
  )
}

export default App