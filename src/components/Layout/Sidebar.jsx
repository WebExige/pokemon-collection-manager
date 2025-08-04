import { NavLink } from 'react-router-dom'
import { 
  Home, 
  Package, 
  Search, 
  Library, 
  User, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TrendingUp
} from 'lucide-react'
import { useCollectionStore } from '../../stores/collectionStore'

const Sidebar = ({ isOpen, isCollapsed, onClose, onToggleCollapse }) => {
  const { stats } = useCollectionStore()

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home,
      description: 'Vue d\'ensemble'
    },
    {
      name: 'Ma Collection',
      href: '/collection',
      icon: Package,
      description: 'Cartes possédées',
      badge: stats.ownedCards
    },
    {
      name: 'Explorer',
      href: '/explorer',
      icon: Library,
      description: 'Parcourir les sets'
    },
    {
      name: 'Recherche',
      href: '/search',
      icon: Search,
      description: 'Recherche avancée'
    },
    {
      name: 'Profil',
      href: '/profile',
      icon: User,
      description: 'Mon profil'
    }
  ]

  const NavItem = ({ item }) => (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-primary-50 dark:hover:bg-gray-700 ${
          isActive
            ? 'bg-primary-100 text-primary-700 dark:bg-gray-700 dark:text-primary-400'
            : 'text-gray-700 dark:text-gray-300'
        } ${isCollapsed ? 'justify-center px-2' : ''}`
      }
      onClick={onClose}
    >
      <item.icon className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? 'h-6 w-6' : ''}`} />
      
      {!isCollapsed && (
        <>
          <span className="truncate">{item.name}</span>
          {item.badge && item.badge > 0 && (
            <span className="ml-auto rounded-full bg-primary-500 px-2 py-0.5 text-xs font-semibold text-white">
              {item.badge}
            </span>
          )}
        </>
      )}

      {/* Tooltip pour sidebar réduite */}
      {isCollapsed && (
        <div className="absolute left-14 z-50 hidden group-hover:block">
          <div className="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white shadow-lg">
            <div className="font-medium">{item.name}</div>
            <div className="text-xs text-gray-300">{item.description}</div>
            {item.badge && item.badge > 0 && (
              <div className="mt-1 text-xs text-primary-400">{item.badge} cartes</div>
            )}
          </div>
        </div>
      )}
    </NavLink>
  )

  return (
    <>
      {/* Sidebar Desktop */}
      <div className={`
        hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50
        ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
        transition-all duration-300 ease-in-out
        bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
      `}>
        {/* Header */}
        <div className={`flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700 ${isCollapsed ? 'justify-center' : ''}`}>
          {!isCollapsed ? (
            <>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  PokéCollection
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Manager TCG
                </p>
              </div>
            </>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          )}
          
          <button
            onClick={onToggleCollapse}
            className={`p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${isCollapsed ? 'ml-0' : 'ml-auto'}`}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-500" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigationItems.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </nav>

        {/* Stats rapides */}
        {!isCollapsed && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Collection</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {stats.completionRate}%
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill bg-primary-500"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {stats.ownedCards} cartes possédées
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Mobile */}
      <div className={`
        lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header Mobile */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              PokéCollection
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Manager TCG
            </p>
          </div>
        </div>

        {/* Navigation Mobile */}
        <nav className="flex-1 space-y-1 p-4">
          {navigationItems.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </nav>

        {/* Stats Mobile */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Progression
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Collection</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {stats.completionRate}%
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill bg-primary-500"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="text-center">
                <div className="font-semibold text-primary-600 dark:text-primary-400">
                  {stats.ownedCards}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Possédées</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-orange-600 dark:text-orange-400">
                  {stats.wishlistCards}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Wishlist</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar