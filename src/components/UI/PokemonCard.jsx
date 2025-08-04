import { useState } from 'react'
import { Heart, Plus, Check, Eye, Star, Bookmark } from 'lucide-react'
import { useCollectionStore } from '../../stores/collectionStore'
import Button from './Button'
import LoadingSpinner from './LoadingSpinner'

const PokemonCard = ({ 
  card, 
  showActions = true, 
  size = 'medium',
  className = '',
  onClick 
}) => {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const { addToCollection, removeFromCollection, isInCollection } = useCollectionStore()
  
  const collectionStatus = isInCollection(card.id)

  const handleAddToOwned = async (e) => {
    e.stopPropagation()
    await addToCollection(card, 'owned')
  }

  const handleAddToWishlist = async (e) => {
    e.stopPropagation()
    await addToCollection(card, 'wishlist')
  }

  const handleRemove = async (e) => {
    e.stopPropagation()
    await removeFromCollection(card.id)
  }

  const getRarityColor = (rarity) => {
    const rarityColors = {
      'Common': 'border-gray-400 bg-gray-50',
      'Uncommon': 'border-green-400 bg-green-50',
      'Rare': 'border-blue-400 bg-blue-50',
      'Rare Holo': 'border-purple-400 bg-purple-50',
      'Rare Holo EX': 'border-purple-500 bg-purple-100',
      'Rare Holo GX': 'border-purple-600 bg-purple-100',
      'Rare Holo V': 'border-indigo-500 bg-indigo-100',
      'Rare Holo VMAX': 'border-indigo-600 bg-indigo-100',
      'Rare Secret': 'border-yellow-400 bg-yellow-50',
      'Rare Rainbow': 'border-pink-400 bg-pink-50'
    }
    return rarityColors[rarity] || 'border-gray-300 bg-gray-50'
  }

  const getTypeColor = (type) => {
    const typeColors = {
      'Grass': 'bg-green-500',
      'Fire': 'bg-red-500',
      'Water': 'bg-blue-500',
      'Lightning': 'bg-yellow-500',
      'Psychic': 'bg-purple-500',
      'Fighting': 'bg-red-700',
      'Darkness': 'bg-gray-800',
      'Metal': 'bg-gray-500',
      'Fairy': 'bg-pink-500',
      'Dragon': 'bg-indigo-600',
      'Colorless': 'bg-gray-400'
    }
    return typeColors[type] || 'bg-gray-400'
  }

  const sizeClasses = {
    small: 'w-32',
    medium: 'w-40',
    large: 'w-48',
    xl: 'w-56'
  }

  const imageSrc = card.images?.small || card.images?.large || '/placeholder-card.png'

  return (
    <div className={`
      pokemon-card group relative bg-white dark:bg-gray-800 border-2 ${getRarityColor(card.rarity)}
      ${sizeClasses[size]} ${className}
      ${onClick ? 'cursor-pointer' : ''}
    `}
    onClick={onClick}
    >
      {/* Badge de collection */}
      {collectionStatus.exists && (
        <div className="absolute top-2 left-2 z-10">
          {collectionStatus.owned ? (
            <div className="flex items-center gap-1 rounded-full bg-green-500 px-2 py-1 text-xs font-semibold text-white shadow-md">
              <Check className="h-3 w-3" />
              Possédée
            </div>
          ) : (
            <div className="flex items-center gap-1 rounded-full bg-orange-500 px-2 py-1 text-xs font-semibold text-white shadow-md">
              <Heart className="h-3 w-3" />
              Wishlist
            </div>
          )}
        </div>
      )}

      {/* Image de la carte */}
      <div className="relative aspect-[2.5/3.5] overflow-hidden rounded-t-lg">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
            <LoadingSpinner size="small" />
          </div>
        )}
        
        {!imageError ? (
          <img
            src={imageSrc}
            alt={card.name}
            className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true)
              setImageLoading(false)
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-700">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <div className="mb-2 text-2xl">🃏</div>
              <div className="text-xs">Image non disponible</div>
            </div>
          </div>
        )}

        {/* Overlay d'actions au survol */}
        {showActions && (
          <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="flex h-full items-center justify-center gap-2">
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  onClick && onClick()
                }}
                icon={Eye}
                variant="ghost"
                className="bg-white/20 text-white hover:bg-white/30"
              >
                Voir
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Informations de la carte */}
      <div className="p-3">
        <div className="mb-2">
          <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
            {card.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {card.set?.name} • {card.number}
          </p>
        </div>

        {/* Types */}
        {card.types && card.types.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {card.types.slice(0, 2).map((type) => (
              <span
                key={type}
                className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${getTypeColor(type)}`}
              >
                {type}
              </span>
            ))}
          </div>
        )}

        {/* Rareté */}
        <div className="mb-3 text-xs text-gray-600 dark:text-gray-400">
          {card.rarity}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-1">
            {!collectionStatus.owned && (
              <Button
                size="small"
                variant="success"
                onClick={handleAddToOwned}
                icon={Plus}
                className="flex-1 text-xs"
              >
                Ajouter
              </Button>
            )}
            
            {!collectionStatus.wishlist && !collectionStatus.owned && (
              <Button
                size="small"
                variant="outline"
                onClick={handleAddToWishlist}
                icon={Bookmark}
                className="flex-shrink-0"
              />
            )}
            
            {collectionStatus.exists && (
              <Button
                size="small"
                variant="danger"
                onClick={handleRemove}
                className="flex-1 text-xs"
              >
                Retirer
              </Button>
            )}
          </div>
        )}

        {/* Prix estimé */}
        {card.cardmarket?.prices?.averageSellPrice && (
          <div className="mt-2 text-right">
            <span className="text-xs font-semibold text-green-600 dark:text-green-400">
              ~{card.cardmarket.prices.averageSellPrice.toFixed(2)}€
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default PokemonCard