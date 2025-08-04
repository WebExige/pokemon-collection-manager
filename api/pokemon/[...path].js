/**
 * Proxy API Vercel pour PokéTCG
 * Contourne automatiquement les restrictions CORS  
 * Compatible avec Edge Functions (Web API)
 */

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  console.log('🚀 Edge Function démarrée');
  console.log('📍 Method:', req.method);
  console.log('📍 URL:', req.url);
  
  // Récupération du path dynamique depuis l'URL
  const url = new URL(req.url);
  const pathSegments = url.pathname.replace('/api/pokemon/', '').split('/').filter(Boolean);
  const queryString = url.search;
  
  console.log('📍 Path segments:', pathSegments);
  console.log('📍 Query string:', queryString);
  
  // Construction de l'URL de l'API PokéTCG
  const apiUrl = `https://api.pokemontcg.io/v2/${pathSegments.join('/')}${queryString}`;
  
  // Gestion des requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    console.log('✅ Requête OPTIONS traitée');
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Api-Key',
      },
    });
  }
  
  try {
    console.log('🔗 Proxy Vercel vers:', apiUrl.substring(0, 80) + '...');
    
    // Variables d'environnement
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
    
    // Fetch vers l'API PokéTCG
    const response = await fetch(apiUrl, {
      method: req.method,
      headers: headers
    });
    
    console.log('📡 Réponse reçue, status:', response.status);
    
    // Vérifier si la réponse est OK
    if (!response.ok) {
      console.error('❌ API error status:', response.status);
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Données JSON parsées, size:', JSON.stringify(data).length);
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
    
  } catch (error) {
    console.error('❌ Erreur Edge Function:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Données de fallback pour diagnostic
    const mockData = {
      data: [{ 
        id: 'test-1', 
        name: 'Test Set',
        series: 'Diagnostic Edge Function',
        total: 1,
        releaseDate: '2024/01/01'
      }],
      page: 1,
      pageSize: 1,
      count: 1,
      totalCount: 1,
      _diagnostic: {
        edgeFunction: 'OK',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    };
    
    console.log('🔄 Fallback vers données de test');
    return new Response(JSON.stringify(mockData), {
      status: 200, // Retourner 200 avec données de test
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}