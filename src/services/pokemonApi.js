import axios from 'axios'
import { 
  pokemonSets, 
  pokemonCards, 
  pokemonTypes, 
  pokemonRarities,
  getAllCards,
  searchCards as localSearchCards,
  getSuggestions as localGetSuggestions,
  offlineMode
} from '../data/pokemonData.js'

// Configuration de l'API PokéTCG
const POKEMON_API_BASE = 'https://api.pokemontcg.io/v2'
const API_KEY = import.meta.env.VITE_POKEMON_API_KEY

// Configuration du proxy CORS externe (solution de contournement)
const CORS_PROXY_BASE = 'https://api.allorigins.win/get?url='
const USE_CORS_PROXY = false // Désactiver le proxy CORS externe (utiliser Vercel Functions)

// Détection de l'environnement et plateforme d'hébergement
const isProduction = import.meta.env.PROD
const isO2SwitchDomain = window.location.hostname.includes('webexige.fr') || window.location.hostname.includes('o2switch')
const isVercelDomain = window.location.hostname.includes('vercel.app') || 
                       window.location.hostname.includes('vercel-deploy') ||
                       (isProduction && !isO2SwitchDomain) // Assume Vercel si pas O2switch en prod
const forceOfflineMode = isProduction && isO2SwitchDomain // Seulement O2switch = hors ligne

// Fonction utilitaire pour simuler les délais d'API
const simulateApiDelay = (min = 200, max = 800) => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

// Fonction helper pour traiter les réponses du proxy CORS
const processApiResponse = (response, apiUrl) => {
  // Si c'est une réponse du proxy CORS externe
  if (USE_CORS_PROXY && apiUrl.includes('allorigins.win')) {
    console.log('🔍 Traitement réponse proxy CORS externe')
    
    // allorigins.win renvoie { contents: "json_string" }
    if (response.data && response.data.contents) {
      try {
        const parsedData = JSON.parse(response.data.contents)
        console.log('✅ Données proxy CORS parsées avec succès')
        return parsedData
      } catch (parseError) {
        console.error('❌ Erreur parsing données proxy CORS:', parseError)
        throw new Error('Erreur de parsing des données du proxy CORS')
      }
    } else {
      console.error('❌ Format de réponse proxy CORS invalide:', response.data)
      throw new Error('Format de réponse proxy CORS invalide')
    }
  } else {
    // Réponse directe ou proxy interne
    console.log('✅ Traitement réponse API directe/proxy interne')
    return response.data
  }
}

// Configuration du mode API selon la plateforme
const getApiMode = () => {
  if (forceOfflineMode) {
    console.log('🔌 Mode hors ligne forcé (O2switch) - Données locales utilisées')
    return 'offline'
  } else if (isVercelDomain) {
    console.log('⚡ Mode Vercel - API via proxy Node.js Functions')
    return 'online'
  } else {
    console.log('📡 Mode API en ligne - Tentative de connexion directe')
    return 'online'
  }
}

// Configuration de l'URL selon la plateforme
const getApiUrl = (endpoint) => {
  if (getApiMode() === 'offline') {
    return null // Pas d'URL nécessaire en mode hors ligne
  }
  
  // Priorité au proxy CORS externe si activé
  if (USE_CORS_PROXY) {
    const targetUrl = POKEMON_API_BASE + endpoint
    const proxyUrl = CORS_PROXY_BASE + encodeURIComponent(targetUrl)
    console.log('🌐 Proxy CORS externe utilisé:', endpoint.substring(0, 30) + '...')
    console.log('🔗 URL proxy:', proxyUrl.substring(0, 80) + '...')
    return proxyUrl
  }
  
  if (isVercelDomain) {
    // Vercel : utiliser le proxy Node.js Functions
    console.log('⚡ Proxy Vercel utilisé:', endpoint.substring(0, 30) + '...')
    return `/api/pokemon${endpoint}`
  } else if (isProduction && isO2SwitchDomain) {
    // O2switch : utiliser le proxy PHP (si besoin)
    console.log('🐘 Proxy PHP O2switch utilisé:', endpoint.substring(0, 30) + '...')
    return `/api/pokemon${endpoint}`
  } else {
    // Développement ou autre : accès direct
    console.log('📡 Accès direct à l\'API:', endpoint.substring(0, 30) + '...')
    return POKEMON_API_BASE + endpoint
  }
}

// Instance axios configurée
const pokemonApi = axios.create({
  baseURL: POKEMON_API_BASE,
  headers: {
    'Content-Type': 'application/json',
    ...(API_KEY && { 'X-Api-Key': API_KEY })
  }
})

// Intercepteur pour la gestion des erreurs avec retry
pokemonApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('Erreur API PokéTCG:', error)
    
    // Si c'est une erreur CORS ou réseau, on peut retry une fois
    if (error.code === 'ERR_NETWORK' && !error.config._retry) {
      error.config._retry = true
      try {
        // Attendre 1 seconde et retry
        await new Promise(resolve => setTimeout(resolve, 1000))
        return pokemonApi.request(error.config)
      } catch (retryError) {
        console.log('Retry échoué, fallback vers démo')
      }
    }
    
    return Promise.reject(error)
  }
)

export const pokemonApiService = {
  // Test de connectivité API avec mode hors ligne
  async testApi() {
    try {
      console.log('🧪 Test de connectivité API PokéTCG...')
      console.log('🌐 URL de base:', pokemonApi.defaults.baseURL)
      console.log('🔑 API Key présente:', !!API_KEY)
      console.log('🔧 User Agent:', navigator.userAgent.substring(0, 50) + '...')
      console.log('🌍 Origin:', window.location.origin)
      
      // Vérifier le mode de fonctionnement
      const mode = getApiMode()
      
      if (mode === 'offline') {
        // Mode hors ligne : utiliser les données locales (seulement O2switch)
        console.log('🔌 Mode hors ligne détecté')
        console.log('📊 Sets locaux disponibles:', pokemonSets.length)
        console.log('🃏 Cartes locales disponibles:', getAllCards().length)
        console.log('📅 Dernière mise à jour:', offlineMode.lastUpdate)
        console.log('✅ Données locales chargées avec succès!')
        
        // Simuler un délai pour l'UX
        await simulateApiDelay(100, 300)
        return true
      }
      
      // Mode en ligne : Vercel ou développement
      const apiUrl = getApiUrl('/sets?pageSize=1')
      const response = await axios.get(apiUrl, {
        headers: {
          'Accept': 'application/json',
          // N'envoyer l'API key que si ce n'est pas un proxy
          ...(API_KEY && !apiUrl.startsWith('/api/pokemon') && !apiUrl.includes('allorigins.win') && { 'X-Api-Key': API_KEY })
        }
      })
      
      const responseData = processApiResponse(response, apiUrl)
      console.log('✅ API PokéTCG fonctionnelle!')
      console.log('📊 Sets trouvés:', responseData.data.length)
      
      if (apiUrl.includes('allorigins.win')) {
        console.log('🌐 Via: Proxy CORS externe (allorigins.win)')
      } else if (isVercelDomain) {
        console.log('⚡ Via: Proxy Vercel Node.js Functions')
      } else if (apiUrl.startsWith('/api/pokemon')) {
        console.log('🐘 Via: Proxy PHP O2switch')
      } else {
        console.log('📡 Via: Accès direct API')
      }
      
      return true
      
    } catch (error) {
      console.log('❌ API PokéTCG indisponible:', error.message)
      console.log('🔄 Basculement vers mode hors ligne...')
      
      // En cas d'échec, basculer vers les données locales
      console.log('📊 Sets locaux disponibles:', pokemonSets.length)
      console.log('🃏 Cartes locales disponibles:', getAllCards().length)
      console.log('✅ Mode hors ligne activé automatiquement!')
      
      return true // Toujours retourner true car on a les données locales
    }
  },

  // Récupérer tous les sets/extensions (mode hors ligne supporté)
  async getSets() {
    try {
      const mode = getApiMode()
      
      if (mode === 'offline') {
        // Mode hors ligne : utiliser les données locales
        console.log('🔌 Récupération des sets locaux...')
        await simulateApiDelay(200, 500)
        
        const sortedSets = [...pokemonSets].sort((a, b) => 
          new Date(b.releaseDate) - new Date(a.releaseDate)
        )
        
        console.log('📊 Sets locaux récupérés:', sortedSets.length)
        return sortedSets
      }
      
      // Mode en ligne : tenter l'API
      const apiUrl = getApiUrl('/sets')
      
      const response = await axios.get(apiUrl, {
        headers: {
          'Accept': 'application/json',
          // N'envoyer l'API key que si ce n'est pas un proxy
          ...(API_KEY && !apiUrl.startsWith('/api/pokemon') && !apiUrl.includes('allorigins.win') && { 'X-Api-Key': API_KEY })
        }
      })
      
      const responseData = processApiResponse(response, apiUrl)
      return responseData.data.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
      
    } catch (error) {
      console.error('Erreur lors de la récupération des sets:', error)
      console.log('🔄 Basculement vers sets locaux...')
      
      // Fallback vers données locales
      await simulateApiDelay(100, 200)
      return [...pokemonSets].sort((a, b) => 
        new Date(b.releaseDate) - new Date(a.releaseDate)
      )
    }
  },

  // Récupérer un set spécifique avec proxy CORS
  async getSet(setId) {
    try {
      // Construction de l'URL avec proxy si nécessaire
      const apiUrl = getApiUrl(`/sets/${setId}`)
      
      // Requête avec axios direct
      const response = await axios.get(apiUrl, {
        headers: {
          'Accept': 'application/json',
          // N'envoyer l'API key que si ce n'est pas un proxy
          ...(API_KEY && !apiUrl.startsWith('/api/pokemon') && !apiUrl.includes('allorigins.win') && { 'X-Api-Key': API_KEY })
        }
      })
      
      const responseData = processApiResponse(response, apiUrl)
      return responseData.data
    } catch (error) {
      console.error('Erreur lors de la récupération du set:', error)
      throw error
    }
  },

  // Récupérer les cartes d'un set avec proxy CORS
  async getCardsBySet(setId, page = 1, pageSize = 50) {
    try {
      // Construction des paramètres URL
      const params = new URLSearchParams({
        q: `set.id:${setId}`,
        page: page.toString(),
        pageSize: pageSize.toString(),
        orderBy: 'number'
      })

      // Construction de l'URL avec proxy CORS
      const endpoint = `/cards?${params.toString()}`
      const apiUrl = getApiUrl(endpoint)
      
      // Requête avec axios direct
      const response = await axios.get(apiUrl, {
        headers: {
          'Accept': 'application/json',
          // N'envoyer l'API key que si ce n'est pas un proxy
          ...(API_KEY && !apiUrl.startsWith('/api/pokemon') && !apiUrl.includes('allorigins.win') && { 'X-Api-Key': API_KEY })
        }
      })
      
      const responseData = processApiResponse(response, apiUrl)
      return {
        cards: responseData.data || [],
        totalCount: responseData.totalCount || 0,
        page: responseData.page || page,
        pageSize: responseData.pageSize || pageSize,
        totalPages: Math.ceil((responseData.totalCount || 0) / pageSize)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des cartes:', error)
      throw error
    }
  },

  // Rechercher des cartes (mode hors ligne supporté)
  async searchCards(query, filters = {}, page = 1, pageSize = 50) {
    try {
      const mode = getApiMode()
      
      if (mode === 'offline') {
        // Mode hors ligne : recherche locale
        console.log('🔌 Recherche locale pour:', query || 'toutes les cartes')
        await simulateApiDelay(300, 600)
        
        // Utiliser la fonction de recherche locale
        let results = localSearchCards(query, filters)
        
        // Pagination locale
        const totalCount = results.length
        const totalPages = Math.ceil(totalCount / pageSize)
        const startIndex = (page - 1) * pageSize
        const endIndex = startIndex + pageSize
        const paginatedResults = results.slice(startIndex, endIndex)
        
        console.log('🔍 Résultats locaux:', paginatedResults.length, 'sur', totalCount, 'cartes')
        
        return {
          cards: paginatedResults,
          totalCount,
          page,
          pageSize,
          totalPages
        }
      }
      
      // Mode en ligne : recherche API
      let searchQuery = ''
      
      if (query) {
        searchQuery += `name:"${query}*"`
      }

      if (filters.set) {
        searchQuery += searchQuery ? ` AND set.id:${filters.set}` : `set.id:${filters.set}`
      }
      
      if (filters.rarity) {
        searchQuery += searchQuery ? ` AND rarity:"${filters.rarity}"` : `rarity:"${filters.rarity}"`
      }
      
      if (filters.type) {
        searchQuery += searchQuery ? ` AND types:"${filters.type}"` : `types:"${filters.type}"`
      }

      const params = new URLSearchParams({
        q: searchQuery || '*',
        page: page.toString(),
        pageSize: pageSize.toString(),
        orderBy: 'set.releaseDate,-number'
      })

      const endpoint = `/cards?${params.toString()}`
      const apiUrl = getApiUrl(endpoint)
      
      console.log('🔍 Recherche cartes via:', apiUrl.includes('allorigins.win') ? 'Proxy CORS externe' : (isVercelDomain && apiUrl.startsWith('/api/pokemon')) ? 'Proxy Vercel Node.js' : apiUrl.startsWith('/api/pokemon') ? 'Proxy PHP O2switch' : 'Direct')

      const response = await axios.get(apiUrl, {
        headers: {
          'Accept': 'application/json',
          // N'envoyer l'API key que si ce n'est pas un proxy
          ...(API_KEY && !apiUrl.startsWith('/api/pokemon') && !apiUrl.includes('allorigins.win') && { 'X-Api-Key': API_KEY })
        }
      })

      const responseData = processApiResponse(response, apiUrl)
      return {
        cards: responseData.data || [],
        totalCount: responseData.totalCount || 0,
        page: responseData.page || page,
        pageSize: responseData.pageSize || pageSize,
        totalPages: Math.ceil((responseData.totalCount || 0) / pageSize)
      }
      
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
      console.log('🔄 Basculement vers recherche locale...')
      
      // Fallback vers recherche locale
      await simulateApiDelay(200, 400)
      let results = localSearchCards(query, filters)
      
      const totalCount = results.length
      const totalPages = Math.ceil(totalCount / pageSize)
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedResults = results.slice(startIndex, endIndex)
      
      return {
        cards: paginatedResults,
        totalCount,
        page,
        pageSize,
        totalPages
      }
    }
  },

  // Récupérer une carte spécifique
  async getCard(cardId) {
    try {
      const response = await pokemonApi.get(`/cards/${cardId}`)
      return response.data.data
    } catch (error) {
      console.error('Erreur lors de la récupération de la carte:', error)
      throw error
    }
  },

  // Récupérer les cartes populaires/récentes
  async getPopularCards(limit = 20) {
    try {
      const response = await pokemonApi.get('/cards', {
        params: {
          pageSize: limit,
          orderBy: 'set.releaseDate',
          q: 'rarity:"Rare Holo" OR rarity:"Rare Holo EX" OR rarity:"Rare Holo GX"'
        }
      })
      return response.data.data
    } catch (error) {
      console.error('Erreur lors de la récupération des cartes populaires:', error)
      throw error
    }
  },

  // Récupérer les types de cartes disponibles
  async getTypes() {
    try {
      const response = await pokemonApi.get('/types')
      return response.data.data
    } catch (error) {
      console.error('Erreur lors de la récupération des types:', error)
      throw error
    }
  },

  // Récupérer les sous-types disponibles
  async getSubtypes() {
    try {
      const response = await pokemonApi.get('/subtypes')
      return response.data.data
    } catch (error) {
      console.error('Erreur lors de la récupération des sous-types:', error)
      throw error
    }
  },

  // Récupérer les raretés disponibles
  async getRarities() {
    try {
      const response = await pokemonApi.get('/rarities')
      return response.data.data
    } catch (error) {
      console.error('Erreur lors de la récupération des raretés:', error)
      throw error
    }
  },

  // Suggestions de recherche (mode hors ligne supporté)
  async getSuggestions(query, limit = 10) {
    try {
      if (!query || query.length < 2) return []
      
      const mode = getApiMode()
      
      if (mode === 'offline') {
        // Mode hors ligne : suggestions locales
        console.log('🔌 Suggestions locales pour:', query)
        await simulateApiDelay(100, 300)
        
        const suggestions = localGetSuggestions(query)
        console.log('💡 Suggestions trouvées:', suggestions.length)
        
        return suggestions.slice(0, limit)
      }
      
      // Mode en ligne : suggestions API
      const params = new URLSearchParams({
        q: `name:"${query}*"`,
        pageSize: limit.toString(),
        select: 'name,id,images'
      })

      const endpoint = `/cards?${params.toString()}`
      const apiUrl = getApiUrl(endpoint)
      
      console.log('🔍 Suggestions via:', apiUrl.includes('allorigins.win') ? 'Proxy CORS externe' : (isVercelDomain && apiUrl.startsWith('/api/pokemon')) ? 'Proxy Vercel Node.js' : apiUrl.startsWith('/api/pokemon') ? 'Proxy PHP O2switch' : 'Direct')

      const response = await axios.get(apiUrl, {
        headers: {
          'Accept': 'application/json',
          // N'envoyer l'API key que si ce n'est pas un proxy
          ...(API_KEY && !apiUrl.startsWith('/api/pokemon') && !apiUrl.includes('allorigins.win') && { 'X-Api-Key': API_KEY })
        }
      })
      
      const responseData = processApiResponse(response, apiUrl)
      const uniqueNames = [...new Set(responseData.data.map(card => card.name))]
      return uniqueNames.slice(0, limit)
      
    } catch (error) {
      console.error('Erreur lors de la récupération des suggestions:', error)
      console.log('🔄 Basculement vers suggestions locales...')
      
      // Fallback vers suggestions locales
      await simulateApiDelay(50, 150)
      const suggestions = localGetSuggestions(query)
      return suggestions.slice(0, limit)
    }
  },

  // Récupérer les sets par série
  async getSetsBySeries() {
    try {
      const sets = await this.getSets()
      const groupedSets = sets.reduce((acc, set) => {
        const series = set.series || 'Autres'
        if (!acc[series]) {
          acc[series] = []
        }
        acc[series].push(set)
        return acc
      }, {})
      
      return groupedSets
    } catch (error) {
      console.error('Erreur lors du regroupement des sets:', error)
      throw error
    }
  }
}

// Cache simple pour éviter les requêtes répétées
const cache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const cachedPokemonApi = {
  async getSets() {
    const key = 'sets'
    const cached = cache.get(key)
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }
    
    const data = await pokemonApiService.getSets()
    cache.set(key, { data, timestamp: Date.now() })
    return data
  },

  async getCardsBySet(setId, page = 1, pageSize = 50) {
    const key = `cards-${setId}-${page}-${pageSize}`
    const cached = cache.get(key)
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }
    
    const data = await pokemonApiService.getCardsBySet(setId, page, pageSize)
    cache.set(key, { data, timestamp: Date.now() })
    return data
  }
}

export default pokemonApiService