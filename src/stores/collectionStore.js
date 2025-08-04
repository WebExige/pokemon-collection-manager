import { create } from 'zustand'
import { doc, collection, getDocs, setDoc, deleteDoc, query, where } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuthStore } from './authStore'
import toast from 'react-hot-toast'

export const useCollectionStore = create((set, get) => ({
  ownedCards: new Map(), // Map<cardId, cardData>
  wishlistCards: new Map(),
  sets: [],
  loading: false,
  stats: {
    totalCards: 0,
    ownedCards: 0,
    wishlistCards: 0,
    completionRate: 0,
    totalValue: 0
  },

  // Charger la collection de l'utilisateur
  loadCollection: async () => {
    try {
      set({ loading: true })
      const user = useAuthStore.getState().user
      if (!user) return

      // Charger les cartes possédées
      const ownedQuery = query(
        collection(db, 'collections'),
        where('userId', '==', user.uid),
        where('status', '==', 'owned')
      )
      const ownedSnapshot = await getDocs(ownedQuery)
      const ownedCards = new Map()
      
      ownedSnapshot.forEach((doc) => {
        const data = doc.data()
        ownedCards.set(data.cardId, {
          ...data,
          id: doc.id
        })
      })

      // Charger la wishlist
      const wishlistQuery = query(
        collection(db, 'collections'),
        where('userId', '==', user.uid),
        where('status', '==', 'wishlist')
      )
      const wishlistSnapshot = await getDocs(wishlistQuery)
      const wishlistCards = new Map()
      
      wishlistSnapshot.forEach((doc) => {
        const data = doc.data()
        wishlistCards.set(data.cardId, {
          ...data,
          id: doc.id
        })
      })

      // Calculer les statistiques
      const stats = get().calculateStats(ownedCards, wishlistCards)

      set({ 
        ownedCards, 
        wishlistCards, 
        stats,
        loading: false 
      })
    } catch (error) {
      console.error('Erreur lors du chargement de la collection:', error)
      toast.error('Erreur lors du chargement de la collection')
      set({ loading: false })
    }
  },

  // Calculer les statistiques
  calculateStats: (ownedCards, wishlistCards) => {
    const totalOwned = ownedCards.size
    const totalWishlist = wishlistCards.size
    
    // Calculer la valeur totale estimée (basée sur les prix des cartes)
    let totalValue = 0
    ownedCards.forEach((card) => {
      if (card.estimatedPrice) {
        totalValue += card.estimatedPrice
      }
    })

    return {
      totalCards: totalOwned + totalWishlist,
      ownedCards: totalOwned,
      wishlistCards: totalWishlist,
      completionRate: totalOwned > 0 ? Math.round((totalOwned / (totalOwned + totalWishlist)) * 100) : 0,
      totalValue: Math.round(totalValue * 100) / 100
    }
  },

  // Ajouter une carte à la collection
  addToCollection: async (cardData, status = 'owned') => {
    try {
      const user = useAuthStore.getState().user
      if (!user) {
        toast.error('Vous devez être connecté')
        return
      }

      const collectionData = {
        userId: user.uid,
        cardId: cardData.id,
        status: status, // 'owned' ou 'wishlist'
        addedDate: new Date().toISOString(),
        cardData: {
          name: cardData.name,
          set: cardData.set,
          number: cardData.number,
          rarity: cardData.rarity,
          images: cardData.images,
          types: cardData.types || [],
          estimatedPrice: cardData.cardmarket?.prices?.averageSellPrice || 0
        },
        notes: '',
        condition: 'mint', // mint, near-mint, excellent, good, light-played, played, poor
        tags: []
      }

      // Sauvegarder dans Firestore
      const docRef = doc(collection(db, 'collections'))
      await setDoc(docRef, collectionData)

      // Mettre à jour le store local
      const { ownedCards, wishlistCards } = get()
      const newData = { ...collectionData, id: docRef.id }

      if (status === 'owned') {
        const newOwnedCards = new Map(ownedCards)
        newOwnedCards.set(cardData.id, newData)
        
        // Retirer de la wishlist si elle y était
        const newWishlistCards = new Map(wishlistCards)
        newWishlistCards.delete(cardData.id)
        
        const stats = get().calculateStats(newOwnedCards, newWishlistCards)
        set({ ownedCards: newOwnedCards, wishlistCards: newWishlistCards, stats })
        toast.success('Carte ajoutée à votre collection')
      } else {
        const newWishlistCards = new Map(wishlistCards)
        newWishlistCards.set(cardData.id, newData)
        
        const stats = get().calculateStats(ownedCards, newWishlistCards)
        set({ wishlistCards: newWishlistCards, stats })
        toast.success('Carte ajoutée à votre wishlist')
      }

    } catch (error) {
      console.error('Erreur lors de l\'ajout à la collection:', error)
      toast.error('Erreur lors de l\'ajout de la carte')
    }
  },

  // Retirer une carte de la collection
  removeFromCollection: async (cardId) => {
    try {
      const user = useAuthStore.getState().user
      if (!user) return

      const { ownedCards, wishlistCards } = get()
      
      // Trouver la carte dans owned ou wishlist
      let docToDelete = null
      let isOwned = false
      
      if (ownedCards.has(cardId)) {
        docToDelete = ownedCards.get(cardId)
        isOwned = true
      } else if (wishlistCards.has(cardId)) {
        docToDelete = wishlistCards.get(cardId)
        isOwned = false
      }

      if (docToDelete) {
        // Supprimer de Firestore
        await deleteDoc(doc(db, 'collections', docToDelete.id))

        // Mettre à jour le store local
        if (isOwned) {
          const newOwnedCards = new Map(ownedCards)
          newOwnedCards.delete(cardId)
          const stats = get().calculateStats(newOwnedCards, wishlistCards)
          set({ ownedCards: newOwnedCards, stats })
        } else {
          const newWishlistCards = new Map(wishlistCards)
          newWishlistCards.delete(cardId)
          const stats = get().calculateStats(ownedCards, newWishlistCards)
          set({ wishlistCards: newWishlistCards, stats })
        }

        toast.success('Carte retirée de votre collection')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error('Erreur lors de la suppression de la carte')
    }
  },

  // Déplacer une carte entre owned et wishlist
  moveCard: async (cardId, newStatus) => {
    try {
      const { ownedCards, wishlistCards } = get()
      let cardData = null
      
      if (ownedCards.has(cardId)) {
        cardData = ownedCards.get(cardId)
      } else if (wishlistCards.has(cardId)) {
        cardData = wishlistCards.get(cardId)
      }

      if (cardData) {
        // Supprimer l'ancienne entrée
        await get().removeFromCollection(cardId)
        
        // Ajouter avec le nouveau statut
        await get().addToCollection(cardData.cardData, newStatus)
      }
    } catch (error) {
      console.error('Erreur lors du déplacement:', error)
      toast.error('Erreur lors du déplacement de la carte')
    }
  },

  // Mettre à jour les notes d'une carte
  updateCardNotes: async (cardId, notes) => {
    try {
      const { ownedCards, wishlistCards } = get()
      let cardData = null
      let isOwned = false
      
      if (ownedCards.has(cardId)) {
        cardData = ownedCards.get(cardId)
        isOwned = true
      } else if (wishlistCards.has(cardId)) {
        cardData = wishlistCards.get(cardId)
        isOwned = false
      }

      if (cardData) {
        // Mettre à jour dans Firestore
        await setDoc(doc(db, 'collections', cardData.id), {
          ...cardData,
          notes: notes
        }, { merge: true })

        // Mettre à jour le store local
        const updatedCard = { ...cardData, notes }
        
        if (isOwned) {
          const newOwnedCards = new Map(ownedCards)
          newOwnedCards.set(cardId, updatedCard)
          set({ ownedCards: newOwnedCards })
        } else {
          const newWishlistCards = new Map(wishlistCards)
          newWishlistCards.set(cardId, updatedCard)
          set({ wishlistCards: newWishlistCards })
        }

        toast.success('Notes mises à jour')
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des notes:', error)
      toast.error('Erreur lors de la mise à jour')
    }
  },

  // Vérifier si une carte est dans la collection
  isInCollection: (cardId) => {
    const { ownedCards, wishlistCards } = get()
    return {
      owned: ownedCards.has(cardId),
      wishlist: wishlistCards.has(cardId),
      exists: ownedCards.has(cardId) || wishlistCards.has(cardId)
    }
  },

  // Obtenir les cartes par set
  getCardsBySet: (setId) => {
    const { ownedCards, wishlistCards } = get()
    const setCards = {
      owned: [],
      wishlist: []
    }

    ownedCards.forEach((card) => {
      if (card.cardData.set.id === setId) {
        setCards.owned.push(card)
      }
    })

    wishlistCards.forEach((card) => {
      if (card.cardData.set.id === setId) {
        setCards.wishlist.push(card)
      }
    })

    return setCards
  },

  // Nettoyer le store (pour la déconnexion)
  clearStore: () => {
    set({
      ownedCards: new Map(),
      wishlistCards: new Map(),
      sets: [],
      loading: false,
      stats: {
        totalCards: 0,
        ownedCards: 0,
        wishlistCards: 0,
        completionRate: 0,
        totalValue: 0
      }
    })
  }
}))