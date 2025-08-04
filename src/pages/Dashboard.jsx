import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Package, 
  TrendingUp, 
  Star, 
  Heart,
  Plus,
  Eye,
  BarChart3,
  PieChart,
  Trophy,
  Target,
  Calendar,
  Sparkles
} from 'lucide-react'
import { useCollectionStore } from '../stores/collectionStore'
import { useAuthStore } from '../stores/authStore'
import { cachedPokemonApi, pokemonApiService } from '../services/pokemonApi'
import Button from '../components/UI/Button'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import PokemonCard from '../components/UI/PokemonCard'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'

const Dashboard = () => {
  const [popularCards, setPopularCards] = useState([])
  const [recentSets, setRecentSets] = useState([])
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState([])
  
  const { stats, ownedCards, wishlistCards } = useCollectionStore()
  const { userProfile } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Test de diagnostic de l'API
      console.log('🔬 === DIAGNOSTIC API POKÉTCG ===')
      let apiWorking = await pokemonApiService.testApi()
      
      // Essayer de charger les vraies données, fallback vers mock
      let recentSetsData = []
      if (apiWorking) {
        try {
          const setsData = await cachedPokemonApi.getSets()
          recentSetsData = setsData.slice(0, 3)
          console.log('✅ API PokéTCG chargée avec succès')
        } catch (apiError) {
          console.log('⚠️ Erreur inattendue après test réussi:', apiError)
          apiWorking = false
        }
      }
      
      if (!apiWorking) {
        console.log('⚠️ API indisponible, utilisation des données de demo')
        // Données de démonstration pour les sets récents
        recentSetsData = [
        {
          id: 'sv4pt5',
          name: 'Paldean Fates',
          series: 'Scarlet & Violet',
          releaseDate: '2024-01-26',
          total: 244,
          images: {
            logo: 'https://images.pokemontcg.io/sv4pt5/logo.png'
          }
        },
        {
          id: 'sv04',
          name: 'Paradox Rift',
          series: 'Scarlet & Violet',
          releaseDate: '2023-11-03',
          total: 266,
          images: {
            logo: 'https://images.pokemontcg.io/sv04/logo.png'
          }
        },
        {
          id: 'sv03',
          name: 'Obsidian Flames',
          series: 'Scarlet & Violet',
          releaseDate: '2023-08-11',
          total: 230,
          images: {
            logo: 'https://images.pokemontcg.io/sv03/logo.png'
          }
        }
        ]
      }
      
      setRecentSets(recentSetsData)

      // Générer des données de graphique de progression simulées
      const mockProgressData = [
        { month: 'Jan', collection: 45, wishlist: 20 },
        { month: 'Fév', collection: 52, wishlist: 18 },
        { month: 'Mar', collection: 61, wishlist: 25 },
        { month: 'Avr', collection: 73, wishlist: 22 },
        { month: 'Mai', collection: 89, wishlist: 30 },
        { month: 'Juin', collection: stats.ownedCards, wishlist: stats.wishlistCards },
      ]
      setChartData(mockProgressData)

      console.log('Dashboard chargé avec succès')

    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {trend && (
              <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-${color}-100 dark:bg-${color}-900/30`}>
          <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
    </div>
  )

  const QuickAction = ({ title, description, icon: Icon, onClick, color = 'primary' }) => (
    <button
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 group"
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${color}-100 dark:bg-${color}-900/30 group-hover:bg-${color}-200 dark:group-hover:bg-${color}-800/50 transition-colors`}>
          <Icon className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`} />
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </button>
  )

  const pieData = [
    { name: 'Possédées', value: stats.ownedCards, fill: '#10b981' },
    { name: 'Wishlist', value: stats.wishlistCards, fill: '#f59e0b' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="large" text="Chargement du dashboard..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header de bienvenue */}
      <div className="bg-gradient-to-r from-primary-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Bonjour, {userProfile?.displayName || 'Dresseur'} ! 👋
            </h1>
            <p className="text-primary-100 mt-1">
              Voici un aperçu de votre collection Pokémon
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-yellow-300" />
            <Trophy className="h-8 w-8 text-yellow-300" />
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Cartes"
          value={stats.totalCards}
          subtitle="Dans votre collection"
          icon={Package}
          color="blue"
          trend={5.2}
        />
        <StatCard
          title="Cartes Possédées"
          value={stats.ownedCards}
          subtitle={`${stats.completionRate}% de completion`}
          icon={Star}
          color="green"
          trend={12.1}
        />
        <StatCard
          title="Wishlist"
          value={stats.wishlistCards}
          subtitle="Cartes recherchées"
          icon={Heart}
          color="orange"
          trend={-2.5}
        />
        <StatCard
          title="Valeur Estimée"
          value={`${stats.totalValue}€`}
          subtitle="Prix de marché"
          icon={TrendingUp}
          color="purple"
          trend={8.7}
        />
      </div>

      {/* Graphiques et Actions Rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique de progression */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Évolution de la Collection
            </h2>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  className="text-sm"
                  stroke="currentColor"
                />
                <YAxis 
                  className="text-sm"
                  stroke="currentColor"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgb(31 41 55)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="collection" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Cartes possédées"
                />
                <Line 
                  type="monotone" 
                  dataKey="wishlist" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="Wishlist"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="space-y-6">
          {/* Répartition */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="h-5 w-5 text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Répartition</h3>
            </div>
            
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={40}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 space-y-2">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions rapides */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Actions Rapides</h3>
            <QuickAction
              title="Explorer les Sets"
              description="Découvrir de nouvelles cartes"
              icon={Eye}
              onClick={() => navigate('/explorer')}
              color="blue"
            />
            <QuickAction
              title="Recherche Avancée"
              description="Trouver des cartes spécifiques"
              icon={Target}
              onClick={() => navigate('/search')}
              color="purple"
            />
            <QuickAction
              title="Ma Collection"
              description="Gérer vos cartes"
              icon={Package}
              onClick={() => navigate('/collection')}
              color="green"
            />
          </div>
        </div>
      </div>

      {/* Sets récents */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Sets Récents
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Les dernières extensions Pokémon TCG
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/explorer')}
            icon={Plus}
          >
            Voir tout
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentSets.map((set) => (
            <div
              key={set.id}
              className="group cursor-pointer rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200"
              onClick={() => navigate(`/explorer?set=${set.id}`)}
            >
              <div className="flex items-center gap-3">
                {set.images?.logo && (
                  <img
                    src={set.images.logo}
                    alt={set.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {set.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(set.releaseDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {set.total} cartes
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Objectifs et suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Objectifs</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Compléter le set actuel</span>
                <span className="font-medium text-gray-900 dark:text-white">75%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill bg-green-500" style={{ width: '75%' }} />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Atteindre 100 cartes</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {Math.round((stats.ownedCards / 100) * 100)}%
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill bg-blue-500" 
                  style={{ width: `${Math.min((stats.ownedCards / 100) * 100, 100)}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Suggestions</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Explorer les cartes Vintage
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Des cartes classiques très recherchées
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Compléter votre set préféré
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Il vous manque 5 cartes pour terminer
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard