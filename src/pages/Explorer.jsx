import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  Calendar, 
  Package, 
  Star,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  BarChart3
} from 'lucide-react'
import { cachedPokemonApi } from '../services/pokemonApi'
import { useCollectionStore } from '../stores/collectionStore'
import Button from '../components/UI/Button'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import PokemonCard from '../components/UI/PokemonCard'

const Explorer = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sets, setSets] = useState([])
  const [selectedSet, setSelectedSet] = useState(null)
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [cardsLoading, setCardsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeries, setSelectedSeries] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize] = useState(50)
  const [showFilters, setShowFilters] = useState(false)
  
  const { ownedCards, wishlistCards } = useCollectionStore()

  useEffect(() => {
    loadSets()
  }, [])

  useEffect(() => {
    // Vérifier si un set est spécifié dans l'URL
    const setId = searchParams.get('set')
    if (setId && sets.length > 0) {
      const set = sets.find(s => s.id === setId)
      if (set) {
        handleSetClick(set)
      }
    }
  }, [searchParams, sets])

  const loadSets = async () => {
    try {
      setLoading(true)
      const setsData = await cachedPokemonApi.getSets()
      setSets(setsData)
    } catch (error) {
      console.error('Erreur lors du chargement des sets:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCards = async (set, page = 1) => {
    try {
      setCardsLoading(true)
      const response = await cachedPokemonApi.getCardsBySet(set.id, page, pageSize)
      setCards(response.cards)
      setTotalPages(response.totalPages)
      setCurrentPage(page)
    } catch (error) {
      console.error('Erreur lors du chargement des cartes:', error)
    } finally {
      setCardsLoading(false)
    }
  }

  const handleSetClick = (set) => {
    setSelectedSet(set)
    setSearchParams({ set: set.id })
    loadCards(set, 1)
  }

  const handleBackToSets = () => {
    setSelectedSet(null)
    setCards([])
    setSearchParams({})
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && selectedSet) {
      loadCards(selectedSet, newPage)
    }
  }

  // Filtrer les sets
  const filteredSets = sets.filter(set => {
    const matchesSearch = searchQuery === '' || 
      set.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      set.series.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesSeries = selectedSeries === '' || set.series === selectedSeries
    
    return matchesSearch && matchesSeries
  })

  // Grouper les sets par série
  const seriesList = [...new Set(sets.map(set => set.series))].sort()

  // Calculer les statistiques du set sélectionné
  const getSetStats = (set) => {
    if (!set) return { owned: 0, wishlist: 0, completion: 0 }
    
    let owned = 0
    let wishlist = 0
    
    ownedCards.forEach(card => {
      if (card.cardData.set.id === set.id) owned++
    })
    
    wishlistCards.forEach(card => {
      if (card.cardData.set.id === set.id) wishlist++
    })
    
    const completion = set.total > 0 ? Math.round((owned / set.total) * 100) : 0
    
    return { owned, wishlist, completion }
  }

  const SetCard = ({ set }) => {
    const stats = getSetStats(set)
    
    return (
      <div
        className="group cursor-pointer bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 overflow-hidden"
        onClick={() => handleSetClick(set)}
      >
        {/* Image du set */}
        <div className="aspect-video bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-700 dark:to-gray-600 p-6 flex items-center justify-center">
          {set.images?.logo ? (
            <img
              src={set.images.logo}
              alt={set.name}
              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">{set.name}</p>
            </div>
          )}
        </div>

        {/* Informations du set */}
        <div className="p-4">
          <div className="mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
              {set.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {set.series}
            </p>
          </div>

          {/* Statistiques */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progression</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {stats.completion}%
              </span>
            </div>
            
            <div className="progress-bar">
              <div 
                className="progress-fill bg-primary-500"
                style={{ width: `${stats.completion}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{stats.owned}/{set.total} possédées</span>
              <span>{stats.wishlist} en wishlist</span>
            </div>
          </div>

          {/* Métadonnées */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="h-3 w-3" />
              <span>{new Date(set.releaseDate).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Package className="h-3 w-3" />
              <span>{set.total} cartes</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="large" text="Chargement des sets..." />
      </div>
    )
  }

  // Vue des cartes d'un set
  if (selectedSet) {
    const stats = getSetStats(selectedSet)
    
    return (
      <div className="space-y-6">
        {/* Header du set */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start gap-4">
            <Button
              variant="outline"
              onClick={handleBackToSets}
              icon={ChevronLeft}
              size="small"
            >
              Retour
            </Button>
            
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedSet.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {selectedSet.series} • {selectedSet.total} cartes
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(selectedSet.releaseDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>

                {selectedSet.images?.logo && (
                  <div className="w-24 h-16 flex items-center justify-center">
                    <img
                      src={selectedSet.images.logo}
                      alt={selectedSet.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Statistiques du set */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.owned}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Possédées</div>
                </div>
                
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {stats.wishlist}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Wishlist</div>
                </div>
                
                <div className="text-center p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {stats.completion}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Completion</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contrôles */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {cards.length} cartes affichées
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode d'affichage */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                onClick={() => setViewMode('grid')}
                icon={Grid3X3}
                size="small"
                className="rounded-r-none border-r border-gray-300 dark:border-gray-600"
              />
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                onClick={() => setViewMode('list')}
                icon={List}
                size="small"
                className="rounded-l-none"
              />
            </div>
          </div>
        </div>

        {/* Liste des cartes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {cardsLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="large" text="Chargement des cartes..." />
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {cards.map((card) => (
                    <PokemonCard
                      key={card.id}
                      card={card}
                      size="small"
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {cards.map((card) => (
                    <div
                      key={card.id}
                      className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <img
                        src={card.images?.small}
                        alt={card.name}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {card.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {card.number} • {card.rarity}
                        </p>
                        {card.types && (
                          <div className="flex gap-1 mt-1">
                            {card.types.slice(0, 2).map((type) => (
                              <span
                                key={type}
                                className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    icon={ChevronLeft}
                    size="small"
                  >
                    Précédent
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'primary' : 'outline'}
                          onClick={() => handlePageChange(page)}
                          size="small"
                        >
                          {page}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    icon={ChevronRight}
                    size="small"
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  // Vue des sets
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Explorer les Sets</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Découvrez les différentes extensions Pokémon TCG et complétez votre collection
        </p>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un set..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Filtres */}
          <div className="flex items-center gap-2">
            <select
              value={selectedSeries}
              onChange={(e) => setSelectedSeries(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
            >
              <option value="">Toutes les séries</option>
              {seriesList.map((series) => (
                <option key={series} value={series}>{series}</option>
              ))}
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setSelectedSeries('')
              }}
              size="small"
            >
              Réinitialiser
            </Button>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <BarChart3 className="h-8 w-8 text-primary-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{filteredSets.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Sets disponibles</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <Star className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {sets.reduce((acc, set) => acc + getSetStats(set).owned, 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Cartes possédées</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <Package className="h-8 w-8 text-orange-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {sets.reduce((acc, set) => acc + set.total, 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Cartes totales</div>
        </div>
      </div>

      {/* Grille des sets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredSets.map((set) => (
          <SetCard key={set.id} set={set} />
        ))}
      </div>

      {filteredSets.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucun set trouvé
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Essayez de modifier vos critères de recherche.
          </p>
        </div>
      )}
    </div>
  )
}

export default Explorer