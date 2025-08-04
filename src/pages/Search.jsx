import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  X, 
  Sparkles,
  TrendingUp,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { pokemonApiService } from '../services/pokemonApi'
import Button from '../components/UI/Button'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import PokemonCard from '../components/UI/PokemonCard'

// Fonction debounce pour éviter le spam d'API
const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [filters, setFilters] = useState({
    set: '',
    rarity: '',
    type: '',
    subtypes: []
  })
  const [availableFilters, setAvailableFilters] = useState({
    sets: [],
    rarities: [],
    types: [],
    subtypes: []
  })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const [popularSearches] = useState([
    'Pikachu', 'Charizard', 'Mewtwo', 'Lugia', 'Rayquaza', 
    'Arceus', 'Dialga', 'Palkia', 'Giratina', 'Reshiram'
  ])

  const pageSize = 50

  useEffect(() => {
    loadAvailableFilters()
    loadRecentSearches()
    
    // Lancer la recherche si il y a une query dans l'URL
    const query = searchParams.get('q')
    if (query) {
      setSearchQuery(query)
      handleSearch(query)
    }
  }, [])

  const loadAvailableFilters = async () => {
    try {
      // Chargement séquentiel pour éviter le spam d'API (1 requête à la fois)
      console.log('📊 Chargement des filtres de manière séquentielle...')
      
      const sets = await pokemonApiService.getSets()
      console.log('✅ Sets chargés')
      
      // Délai de 200ms entre chaque requête
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const rarities = await pokemonApiService.getRarities()
      console.log('✅ Raretés chargées')
      
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const types = await pokemonApiService.getTypes()
      console.log('✅ Types chargés')
      
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const subtypes = await pokemonApiService.getSubtypes()
      console.log('✅ Sous-types chargés')

      setAvailableFilters({
        sets: sets.slice(0, 20), // Limiter à 20 sets les plus récents
        rarities,
        types,
        subtypes
      })
      
      console.log('🎯 Tous les filtres chargés avec succès (mode respectueux API)')
    } catch (error) {
      console.error('Erreur lors du chargement des filtres:', error)
    }
  }

  const loadRecentSearches = () => {
    const saved = localStorage.getItem('pokemon-recent-searches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }

  const saveRecentSearch = (query) => {
    if (!query.trim()) return
    
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('pokemon-recent-searches', JSON.stringify(updated))
  }

  // Debouncing pour éviter le spam d'API
  const debouncedGetSuggestions = useCallback(
    debounce(async (query) => {
      if (!query || query.length < 2) {
        setSuggestions([])
        setSuggestionsLoading(false)
        return
      }

      try {
        setSuggestionsLoading(true)
        
        // Essayer l'API, fallback vers suggestions locales
        let suggestions = []
        try {
          suggestions = await pokemonApiService.getSuggestions(query, 8)
        } catch (apiError) {
          // Suggestions de démo basées sur les cartes populaires
          const popularNames = [
            'Charizard', 'Pikachu', 'Mewtwo', 'Mew', 'Lugia', 'Ho-Oh',
            'Rayquaza', 'Dialga', 'Palkia', 'Giratina', 'Arceus',
            'Reshiram', 'Zekrom', 'Kyurem', 'Xerneas', 'Yveltal'
          ]
          
          suggestions = popularNames
            .filter(name => name.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 8)
      }
      
      setSuggestions(suggestions)
    } catch (error) {
      console.error('Erreur lors de la récupération des suggestions:', error)
      setSuggestions([])
    } finally {
      setSuggestionsLoading(false)
    }
  }, 500), // Délai de 500ms pour éviter le spam
  [])

  const handleSearch = async (query = searchQuery, page = 1) => {
    if (!query.trim() && !Object.values(filters).some(f => f)) {
      return
    }

    try {
      setLoading(true)
      
      // Test rapide de l'API avant recherche
      console.log('🔍 === RECHERCHE:', query.trim(), '===')
      
      // Essayer l'API réelle, fallback vers démo
      let response
      let apiWorked = false
      
      try {
        // Timeout de 5 secondes pour éviter les blocages
        const apiPromise = pokemonApiService.searchCards(
          query.trim(),
          filters,
          page,
          pageSize
        )
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API timeout')), 5000)
        )
        
        response = await Promise.race([apiPromise, timeoutPromise])
        console.log('✅ API recherche réussie :', response.cards.length, 'cartes trouvées')
        apiWorked = true
        
      } catch (apiError) {
        console.log('⚠️ API indisponible, utilisation données démo pour:', query.trim())
        
        // Données de démonstration pour les recherches populaires
        const mockCards = getMockSearchResults(query.trim().toLowerCase())
        response = {
          cards: mockCards,
          totalCount: mockCards.length,
          totalPages: Math.ceil(mockCards.length / pageSize),
          page: page,
          pageSize: pageSize
        }
        
        // Notification subtile à l'utilisateur
        if (mockCards.length === 0) {
          console.log('💡 Astuce: Essayez "charizard", "pikachu", "mewtwo", "lugia" ou "mew"')
        }
      }

      setResults(response.cards)
      setTotalPages(response.totalPages)
      setTotalResults(response.totalCount)
      setCurrentPage(page)

      // Sauvegarder la recherche
      if (query.trim()) {
        saveRecentSearch(query.trim())
        setSearchParams({ q: query.trim() })
      }

      setShowSuggestions(false)
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (value) => {
    setSearchQuery(value)
    setShowSuggestions(true)
    // Utiliser la fonction debouncée pour éviter le spam d'API
    debouncedGetSuggestions(value)
  }

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion)
    setShowSuggestions(false)
    handleSearch(suggestion)
  }

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const handleSubtypeToggle = (subtype) => {
    setFilters(prev => ({
      ...prev,
      subtypes: prev.subtypes.includes(subtype)
        ? prev.subtypes.filter(s => s !== subtype)
        : [...prev.subtypes, subtype]
    }))
  }

  const clearFilters = () => {
    setFilters({
      set: '',
      rarity: '',
      type: '',
      subtypes: []
    })
  }

  const hasActiveFilters = Object.values(filters).some(f => 
    Array.isArray(f) ? f.length > 0 : f !== ''
  )

  // Fonction pour générer des données de démonstration
  const getMockSearchResults = (query) => {
    const mockDatabase = {
      'charizard': [
        {
          id: 'base1-4',
          name: 'Charizard',
          number: '4',
          rarity: 'Rare Holo',
          types: ['Fire'],
          set: { name: 'Base Set', id: 'base1' },
          images: {
            small: 'https://images.pokemontcg.io/base1/4.png',
            large: 'https://images.pokemontcg.io/base1/4_hires.png'
          },
          cardmarket: { prices: { averageSellPrice: 350.00 } }
        },
        {
          id: 'xy12-108',
          name: 'Charizard-EX',
          number: '108',
          rarity: 'Rare Holo EX',
          types: ['Fire'],
          set: { name: 'Evolutions', id: 'xy12' },
          images: {
            small: 'https://images.pokemontcg.io/xy12/108.png',
            large: 'https://images.pokemontcg.io/xy12/108_hires.png'
          },
          cardmarket: { prices: { averageSellPrice: 45.00 } }
        },
        {
          id: 'swsh4-25',
          name: 'Charizard VMAX',
          number: '25',
          rarity: 'Rare Holo VMAX',
          types: ['Fire'],
          set: { name: 'Vivid Voltage', id: 'swsh4' },
          images: {
            small: 'https://images.pokemontcg.io/swsh4/25.png',
            large: 'https://images.pokemontcg.io/swsh4/25_hires.png'
          },
          cardmarket: { prices: { averageSellPrice: 85.00 } }
        }
      ],
      'pikachu': [
        {
          id: 'base1-58',
          name: 'Pikachu',
          number: '58',
          rarity: 'Common',
          types: ['Lightning'],
          set: { name: 'Base Set', id: 'base1' },
          images: {
            small: 'https://images.pokemontcg.io/base1/58.png',
            large: 'https://images.pokemontcg.io/base1/58_hires.png'
          },
          cardmarket: { prices: { averageSellPrice: 25.00 } }
        },
        {
          id: 'swsh4-48',
          name: 'Pikachu VMAX',
          number: '48',
          rarity: 'Rare Holo VMAX',
          types: ['Lightning'],
          set: { name: 'Vivid Voltage', id: 'swsh4' },
          images: {
            small: 'https://images.pokemontcg.io/swsh4/48.png',
            large: 'https://images.pokemontcg.io/swsh4/48_hires.png'
          },
          cardmarket: { prices: { averageSellPrice: 55.00 } }
        },
        {
          id: 'swsh9-25',
          name: 'Pikachu V',
          number: '25',
          rarity: 'Rare Holo V',
          types: ['Lightning'],
          set: { name: 'Brilliant Stars', id: 'swsh9' },
          images: {
            small: 'https://images.pokemontcg.io/swsh9/25.png',
            large: 'https://images.pokemontcg.io/swsh9/25_hires.png'
          },
          cardmarket: { prices: { averageSellPrice: 35.00 } }
        }
      ],
      'mewtwo': [
        {
          id: 'base1-10',
          name: 'Mewtwo',
          number: '10',
          rarity: 'Rare Holo',
          types: ['Psychic'],
          set: { name: 'Base Set', id: 'base1' },
          images: {
            small: 'https://images.pokemontcg.io/base1/10.png',
            large: 'https://images.pokemontcg.io/base1/10_hires.png'
          },
          cardmarket: { prices: { averageSellPrice: 120.00 } }
        }
      ],
      'lugia': [
        {
          id: 'neo4-9',
          name: 'Lugia',
          number: '9',
          rarity: 'Rare Holo',
          types: ['Colorless'],
          set: { name: 'Neo Destiny', id: 'neo4' },
          images: {
            small: 'https://images.pokemontcg.io/neo4/9.png',
            large: 'https://images.pokemontcg.io/neo4/9_hires.png'
          },
          cardmarket: { prices: { averageSellPrice: 200.00 } }
        }
      ],
      'mew': [
        {
          id: 'swsh11-11',
          name: 'Mew VMAX',
          number: '11',
          rarity: 'Rare Holo VMAX',
          types: ['Psychic'],
          set: { name: 'Lost Origin', id: 'swsh11' },
          images: {
            small: 'https://images.pokemontcg.io/swsh11/11.png',
            large: 'https://images.pokemontcg.io/swsh11/11_hires.png'
          },
          cardmarket: { prices: { averageSellPrice: 95.00 } }
        }
      ]
    }

    // Chercher dans la base de données de démo
    for (const [key, cards] of Object.entries(mockDatabase)) {
      if (key.includes(query) || query.includes(key)) {
        return cards
      }
    }

    // Retourner une carte générique si aucune correspondance
    return [{
      id: 'demo-1',
      name: `${query.charAt(0).toUpperCase() + query.slice(1)} (Démo)`,
      number: '1',
      rarity: 'Common',
      types: ['Normal'],
      set: { name: 'Démonstration', id: 'demo' },
      images: {
        small: 'https://images.pokemontcg.io/base1/1.png',
        large: 'https://images.pokemontcg.io/base1/1_hires.png'
      },
      cardmarket: { prices: { averageSellPrice: 5.00 } }
    }]
  }

  const FilterChip = ({ label, onRemove }) => (
    <div className="flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm">
      <span>{label}</span>
      <button onClick={onRemove} className="hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full p-0.5">
        <X className="h-3 w-3" />
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recherche Avancée</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Trouvez les cartes Pokémon que vous recherchez avec nos filtres avancés
        </p>
      </div>

      {/* Barre de recherche principale */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une carte Pokémon..."
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSearch()
                }
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Suggestions */}
          {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              {/* Suggestions d'autocomplétion */}
              {suggestions.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    <Sparkles className="h-3 w-3" />
                    Suggestions
                  </div>
                  {suggestionsLoading ? (
                    <div className="px-3 py-2">
                      <LoadingSpinner size="small" />
                    </div>
                  ) : (
                    suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                      >
                        {suggestion}
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* Recherches récentes */}
              {recentSearches.length > 0 && (
                <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    <Clock className="h-3 w-3" />
                    Recherches récentes
                  </div>
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(search)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recherches populaires */}
        {!searchQuery && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Recherches populaires
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((search) => (
                <button
                  key={search}
                  onClick={() => handleSuggestionClick(search)}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex items-center gap-3 mt-6">
          <Button
            onClick={() => handleSearch()}
            variant="primary"
            icon={Search}
          >
            Rechercher
          </Button>

          <Button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            variant="outline"
            icon={Filter}
          >
            Filtres avancés
          </Button>

          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="ghost"
              size="small"
            >
              Effacer les filtres
            </Button>
          )}
        </div>

        {/* Filtres actifs */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4">
            {filters.set && (
              <FilterChip
                label={`Set: ${availableFilters.sets.find(s => s.id === filters.set)?.name || filters.set}`}
                onRemove={() => handleFilterChange('set', '')}
              />
            )}
            {filters.rarity && (
              <FilterChip
                label={`Rareté: ${filters.rarity}`}
                onRemove={() => handleFilterChange('rarity', '')}
              />
            )}
            {filters.type && (
              <FilterChip
                label={`Type: ${filters.type}`}
                onRemove={() => handleFilterChange('type', '')}
              />
            )}
            {filters.subtypes.map((subtype) => (
              <FilterChip
                key={subtype}
                label={`Sous-type: ${subtype}`}
                onRemove={() => handleSubtypeToggle(subtype)}
              />
            ))}
          </div>
        )}

        {/* Filtres avancés */}
        {showAdvancedFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Set */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Set
                </label>
                <select
                  value={filters.set}
                  onChange={(e) => handleFilterChange('set', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Tous les sets</option>
                  {availableFilters.sets.map((set) => (
                    <option key={set.id} value={set.id}>{set.name}</option>
                  ))}
                </select>
              </div>

              {/* Rareté */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rareté
                </label>
                <select
                  value={filters.rarity}
                  onChange={(e) => handleFilterChange('rarity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Toutes les raretés</option>
                  {availableFilters.rarities.map((rarity) => (
                    <option key={rarity} value={rarity}>{rarity}</option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Tous les types</option>
                  {availableFilters.types.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Sous-types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sous-types
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2">
                  {availableFilters.subtypes.slice(0, 10).map((subtype) => (
                    <label key={subtype} className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        checked={filters.subtypes.includes(subtype)}
                        onChange={() => handleSubtypeToggle(subtype)}
                        className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{subtype}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Résultats */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="large" text="Recherche en cours..." />
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-6">
          {/* Info résultats */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {totalResults} résultat{totalResults > 1 ? 's' : ''} trouvé{totalResults > 1 ? 's' : ''}
              {searchQuery && ` pour "${searchQuery}"`}
            </p>
          </div>

          {/* Grille des cartes */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {results.map((card) => (
                <PokemonCard
                  key={card.id}
                  card={card}
                  size="small"
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => handleSearch(searchQuery, currentPage - 1)}
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
                        onClick={() => handleSearch(searchQuery, page)}
                        size="small"
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => handleSearch(searchQuery, currentPage + 1)}
                  disabled={currentPage === totalPages}
                  icon={ChevronRight}
                  size="small"
                >
                  Suivant
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : searchQuery || hasActiveFilters ? (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucun résultat trouvé
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Essayez avec d'autres mots-clés ou modifiez vos filtres.
          </p>
        </div>
      ) : null}
    </div>
  )
}

export default SearchPage