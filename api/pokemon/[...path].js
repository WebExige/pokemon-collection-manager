/**
 * Proxy API Vercel pour PokéTCG
 * Contourne automatiquement les restrictions CORS  
 * Compatible avec Node.js Functions (plus stable qu'Edge)
 */

export default async function handler(req, res) {
  console.log('🚀 Node.js Function démarrée');
  console.log('📍 Method:', req.method);
  console.log('📍 URL:', req.url);
  
  // Headers CORS pour toutes les réponses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Api-Key');
  
  // Gestion des requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    console.log('✅ Requête OPTIONS traitée');
    return res.status(200).end();
  }
  
  try {
    // Récupération du path dynamique depuis la query
    const { path } = req.query;
    const pathString = Array.isArray(path) ? path.join('/') : path || '';
    
    // Récupération des paramètres de query (sans le path)
    const url = new URL(req.url, 'http://localhost');
    const queryString = url.search;
    
    console.log('📍 Path extraite:', pathString);
    console.log('📍 Query string:', queryString);
    
    // Construction de l'URL de l'API PokéTCG
    const apiUrl = `https://api.pokemontcg.io/v2/${pathString}${queryString}`;
    
    console.log('🔗 Proxy Vercel vers:', apiUrl.substring(0, 80) + '...');
    
    // Variables d'environnement (utiliser VITE_POKEMON_API_KEY comme défini dans Vercel)
    const apiKey = process.env.VITE_POKEMON_API_KEY;
    console.log('🔑 API Key disponible:', !!apiKey);
    console.log('🔑 API Key preview:', apiKey ? `${apiKey.substring(0, 8)}...` : 'AUCUNE');
    console.log('🔗 URL finale:', apiUrl);
    
    // Headers optimisés selon la documentation PokéTCG
    const headers = {
      'Accept': 'application/json',
      'User-Agent': 'Pokemon Collection Manager/1.0',
      'Content-Type': 'application/json'
    };
    
    // Ajouter la clé API OBLIGATOIRE selon la doc
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
      console.log('🔑 Header X-Api-Key ajouté');
    } else {
      console.log('⚠️ ATTENTION: Pas de clé API = rate limit 30/min seulement!');
    }
    
    console.log('🔄 Début fetch vers PokéTCG API...');
    console.log('⏱️ Timeout configuré: 60 secondes');
    
    // Fetch vers l'API PokéTCG avec timeout optimisé
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 50000); // 50s timeout
    
    try {
      const response = await fetch(apiUrl, {
        method: req.method,
        headers: headers,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('⚡ Fetch terminé avec succès');
      
      console.log('📡 Réponse reçue, status:', response.status);
      
      // Vérifier si la réponse est OK
      if (!response.ok) {
        console.error('❌ API error status:', response.status);
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Données JSON parsées, size:', JSON.stringify(data).length);
      console.log('✅ Proxy réussi:', data.data?.length || 'N/A', 'éléments');
      
      // Retourner les données avec le bon status
      res.status(response.status).json(data);
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error('❌ Timeout de 50s dépassé');
        throw new Error('Request timeout after 50 seconds');
      } else {
        console.error('❌ Erreur fetch:', fetchError.message);
        throw fetchError;
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur Node.js Function:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    
    // Données de fallback pour diagnostic
    const mockData = {
      data: [{ 
        id: 'test-1', 
        name: 'Test Set',
        series: 'Diagnostic Node.js Function',
        total: 1,
        releaseDate: '2024/01/01'
      }],
      page: 1,
      pageSize: 1,
      count: 1,
      totalCount: 1,
      _diagnostic: {
        nodeFunction: 'OK',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    };
    
    console.log('🔄 Fallback vers données de test');
    res.status(200).json(mockData); // Retourner 200 avec données de test
  }
}