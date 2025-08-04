import { useState, useEffect, useMemo } from 'react'
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Download, 
  Upload,
  Star,
  Heart,
  Package,
  SortAsc,
  SortDesc,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { useCollectionStore } from '../stores/collectionStore'
import { cachedPokemonApi } from '../services/pokemonApi'
import Button from '../components/UI/Button'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import PokemonCard from '../components/UI/PokemonCard'

const Collection = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' ou 'list'
  const [selectedTab, setSelectedTab] = useState('owned') // 'owned', 'wishlist', 'all'
  const [sortBy, setSortBy] = useState('name') // 'name', 'set', 'rarity', 'date'
  const [sortOrder, setSortOrder] = useState('asc') // 'asc', 'desc'
  const [selectedSet, setSelectedSet] = useState('')
  const [selectedRarity, setSelectedRarity] = useState('')
  const [sets, setSets] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [showCardModal, setShowCardModal] = useState(false)

  const { 
    ownedCards, 
    wishlistCards, 
    stats,
    removeFromCollection,
    moveCard,
    updateCardNotes 
  } = useCollectionStore()

  useEffect(() => {
    loadSets()
  }, [])

  const loadSets = async () => {
    try {
      const setsData = await cachedPokemonApi.getSets()
      setSets(setsData)
    } catch (error) {
      console.error('Erreur lors du chargement des sets:', error)
    }
  }

  // Filtrer et trier les cartes
  const filteredCards = useMemo(() => {
    let cards = []

    // Sélectionner les cartes selon l'onglet
    if (selectedTab === 'owned') {
      cards = Array.from(ownedCards.values())
    } else if (selectedTab === 'wishlist') {
      cards = Array.from(wishlistCards.values())
    } else {
      cards = [...Array.from(ownedCards.values()), ...Array.from(wishlistCards.values())]
    }

    // Filtrer par recherche
    if (searchQuery) {
      cards = cards.filter(card =>
        card.cardData.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.cardData.set.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.cardData.number.includes(searchQuery)
      )
    }

    // Filtrer par set
    if (selectedSet) {
      cards = cards.filter(card => card.cardData.set.id === selectedSet)
    }

    // Filtrer par rareté
    if (selectedRarity) {
      cards = cards.filter(card => card.cardData.rarity === selectedRarity)
    }

    // Trier
    cards.sort((a, b) => {
      let valueA, valueB

      switch (sortBy) {
        case 'name':
          valueA = a.cardData.name.toLowerCase()
          valueB = b.cardData.name.toLowerCase()
          break
        case 'set':
          valueA = a.cardData.set.name.toLowerCase()
          valueB = b.cardData.set.name.toLowerCase()
          break
        case 'rarity':
          valueA = a.cardData.rarity.toLowerCase()
          valueB = b.cardData.rarity.toLowerCase()
          break
        case 'date':
          valueA = new Date(a.addedDate)
          valueB = new Date(b.addedDate)
          break
        default:
          valueA = a.cardData.name.toLowerCase()
          valueB = b.cardData.name.toLowerCase()
      }

      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return cards
  }, [ownedCards, wishlistCards, searchQuery, selectedTab, selectedSet, selectedRarity, sortBy, sortOrder])

  const handleCardClick = (card) => {
    setSelectedCard(card)
    setShowCardModal(true)
  }

  const handleExportCollection = () => {
    const allCards = [...Array.from(ownedCards.values()), ...Array.from(wishlistCards.values())]
    const csvContent = [
      ['Nom', 'Set', 'Numéro', 'Rareté', 'Type', 'Statut', 'Date d\'ajout', 'Notes'],
      ...allCards.map(card => [
        card.cardData.name,
        card.cardData.set.name,
        card.cardData.number,
        card.cardData.rarity,
        (card.cardData.types || []).join(', '),
        card.status === 'owned' ? 'Possédée' : 'Wishlist',
        new Date(card.addedDate).toLocaleDateString('fr-FR'),
        card.notes || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `pokemon-collection-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const rarities = [...new Set(Array.from(ownedCards.values()).concat(Array.from(wishlistCards.values())).map(card => card.cardData.rarity))].sort()

  const TabButton = ({ tab, label, count, icon: Icon }) => (
    <button
      onClick={() => setSelectedTab(tab)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        selectedTab === tab
          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
          : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
      {count !== undefined && (
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          selectedTab === tab
            ? 'bg-primary-200 text-primary-700 dark:bg-primary-800 dark:text-primary-300'
            : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
        }`}>
          {count}
        </span>
      )}
    </button>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ma Collection</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez vos cartes Pokémon possédées et votre wishlist
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportCollection}
            icon={Download}
            size="small"
          >
            Exporter
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Star className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.ownedCards}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Cartes possédées</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Heart className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.wishlistCards}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Dans la wishlist</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completionRate}%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Taux de completion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex flex-wrap gap-2">
        <TabButton
          tab="owned"
          label="Possédées"
          count={stats.ownedCards}
          icon={Star}
        />
        <TabButton
          tab="wishlist"
          label="Wishlist"
          count={stats.wishlistCards}
          icon={Heart}
        />
        <TabButton
          tab="all"
          label="Toutes"
          count={stats.totalCards}
          icon={Package}
        />
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
                placeholder="Rechercher une carte..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Filtres */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              icon={Filter}
              size="small"
            >
              Filtres
            </Button>

            {/* Tri */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
            >
              <option value="name">Nom</option>
              <option value="set">Set</option>
              <option value="rarity">Rareté</option>
              <option value="date">Date d'ajout</option>
            </select>

            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              icon={sortOrder === 'asc' ? SortAsc : SortDesc}
              size="small"
            />

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

        {/* Filtres avancés */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Set
                </label>
                <select
                  value={selectedSet}
                  onChange={(e) => setSelectedSet(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Tous les sets</option>
                  {sets.map((set) => (
                    <option key={set.id} value={set.id}>{set.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rareté
                </label>
                <select
                  value={selectedRarity}
                  onChange={(e) => setSelectedRarity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Toutes les raretés</option>
                  {rarities.map((rarity) => (
                    <option key={rarity} value={rarity}>{rarity}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedSet('')
                    setSelectedRarity('')
                    setSearchQuery('')
                  }}
                  size="small"
                  className="w-full"
                >
                  Réinitialiser
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Liste des cartes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        {filteredCards.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucune carte trouvée
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedTab === 'owned' 
                ? "Vous n'avez pas encore de cartes dans votre collection."
                : selectedTab === 'wishlist'
                ? "Votre wishlist est vide."
                : "Aucune carte ne correspond à vos critères de recherche."
              }
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredCards.length} carte{filteredCards.length > 1 ? 's' : ''} trouvée{filteredCards.length > 1 ? 's' : ''}
              </p>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredCards.map((card) => (
                  <PokemonCard
                    key={`${card.cardId}-${card.status}`}
                    card={{
                      id: card.cardId,
                      name: card.cardData.name,
                      set: card.cardData.set,
                      number: card.cardData.number,
                      rarity: card.cardData.rarity,
                      images: card.cardData.images,
                      types: card.cardData.types,
                      cardmarket: { prices: { averageSellPrice: card.cardData.estimatedPrice } }
                    }}
                    size="small"
                    onClick={() => handleCardClick(card)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCards.map((card) => (
                  <div
                    key={`${card.cardId}-${card.status}`}
                    className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <img
                      src={card.cardData.images?.small}
                      alt={card.cardData.name}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {card.cardData.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {card.cardData.set.name} • {card.cardData.number} • {card.cardData.rarity}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          card.status === 'owned' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}>
                          {card.status === 'owned' ? 'Possédée' : 'Wishlist'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Ajoutée le {new Date(card.addedDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => handleCardClick(card)}
                        icon={Eye}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Collection