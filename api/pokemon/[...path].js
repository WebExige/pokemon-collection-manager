/**
 * Proxy API Vercel pour PokéTCG
 * Contourne automatiquement les restrictions CORS
 * Compatible avec Edge Functions
 */

export default async function handler(req, res) {
  // Récupération du path dynamique
  const { path } = req.query;
  const pathString = Array.isArray(path) ? path.join('/') : path || '';
  
  // Récupération des paramètres de query
  const url = new URL(req.url, 'http://localhost');
  const queryString = url.search;
  
  // Construction de l'URL de l'API PokéTCG
  const apiUrl = `https://api.pokemontcg.io/v2/${pathString}${queryString}`;
  
  // Headers CORS pour toutes les réponses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Api-Key');
  
  // Répondre aux requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    console.log('🔗 Proxy Vercel vers:', apiUrl.substring(0, 80) + '...');
    
    // Appel direct à l'API PokéTCG (Edge Runtime compatible)
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
    
    const response = await fetch(apiUrl, {
      method: req.method,
      headers: headers
    });
    
    // Vérifier si la réponse est OK
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    // Parser la réponse JSON
    const data = await response.json();
    
    // Retourner les données avec le bon status
    res.status(response.status).json(data);
    
    console.log('✅ Proxy réussi:', data.data?.length || 'N/A', 'éléments');
    
  } catch (error) {
    console.error('❌ Erreur proxy Vercel:', error.message);
    
    // Réponse d'erreur structurée
    res.status(500).json({
      error: 'Proxy API Error',
      message: error.message,
      timestamp: new Date().toISOString(),
      path: pathString
    });
  }
}