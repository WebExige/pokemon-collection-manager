import { create } from 'zustand'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebase'
import toast from 'react-hot-toast'

export const useAuthStore = create((set, get) => ({
  user: null,
  userProfile: null,
  loading: true,
  
  // Vérifier l'état de l'authentification
  checkAuth: () => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          // Récupérer le profil utilisateur depuis Firestore
          const userProfile = await get().getUserProfile(user.uid)
          set({ 
            user: {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName
            },
            userProfile,
            loading: false 
          })
        } else {
          set({ user: null, userProfile: null, loading: false })
        }
        unsubscribe()
        resolve()
      })
    })
  },

  // Récupérer le profil utilisateur
  getUserProfile: async (uid) => {
    try {
      const docRef = doc(db, 'users', uid)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return docSnap.data()
      } else {
        // Créer un profil par défaut
        const defaultProfile = {
          displayName: '',
          avatar: '',
          joinDate: new Date().toISOString(),
          preferences: {
            theme: 'light',
            notifications: true,
            publicCollection: false
          },
          stats: {
            totalCards: 0,
            ownedCards: 0,
            wishlistCards: 0,
            completionRate: 0
          }
        }
        
        await setDoc(docRef, defaultProfile)
        return defaultProfile
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error)
      return null
    }
  },

  // Connexion
  login: async (email, password) => {
    try {
      set({ loading: true })
      const result = await signInWithEmailAndPassword(auth, email, password)
      toast.success('Connexion réussie !')
      return result
    } catch (error) {
      console.error('Erreur de connexion:', error)
      let message = 'Erreur de connexion'
      
      switch (error.code) {
        case 'auth/user-not-found':
          message = 'Aucun compte trouvé avec cet email'
          break
        case 'auth/wrong-password':
          message = 'Mot de passe incorrect'
          break
        case 'auth/invalid-email':
          message = 'Email invalide'
          break
        case 'auth/too-many-requests':
          message = 'Trop de tentatives. Réessayez plus tard'
          break
        default:
          message = error.message
      }
      
      toast.error(message)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  // Inscription
  register: async (email, password, displayName) => {
    try {
      set({ loading: true })
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // Créer le profil utilisateur
      const userProfile = {
        displayName: displayName || '',
        email: email,
        avatar: '',
        joinDate: new Date().toISOString(),
        preferences: {
          theme: 'light',
          notifications: true,
          publicCollection: false
        },
        stats: {
          totalCards: 0,
          ownedCards: 0,
          wishlistCards: 0,
          completionRate: 0
        }
      }
      
      await setDoc(doc(db, 'users', result.user.uid), userProfile)
      
      toast.success('Compte créé avec succès !')
      return result
    } catch (error) {
      console.error('Erreur d\'inscription:', error)
      let message = 'Erreur lors de la création du compte'
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'Cet email est déjà utilisé'
          break
        case 'auth/weak-password':
          message = 'Le mot de passe doit contenir au moins 6 caractères'
          break
        case 'auth/invalid-email':
          message = 'Email invalide'
          break
        default:
          message = error.message
      }
      
      toast.error(message)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  // Déconnexion
  logout: async () => {
    try {
      await signOut(auth)
      set({ user: null, userProfile: null })
      toast.success('Déconnexion réussie')
    } catch (error) {
      console.error('Erreur de déconnexion:', error)
      toast.error('Erreur lors de la déconnexion')
    }
  },

  // Mettre à jour le profil
  updateProfile: async (updates) => {
    try {
      const { user } = get()
      if (!user) return
      
      const docRef = doc(db, 'users', user.uid)
      await setDoc(docRef, updates, { merge: true })
      
      set({ 
        userProfile: { 
          ...get().userProfile, 
          ...updates 
        } 
      })
      
      toast.success('Profil mis à jour')
    } catch (error) {
      console.error('Erreur mise à jour profil:', error)
      toast.error('Erreur lors de la mise à jour')
    }
  }
}))