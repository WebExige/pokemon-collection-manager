// Test de l'API PokéTCG
async function testPokemonAPI() {
  console.log('🧪 Test de l\'API PokéTCG...')
  
  try {
    // Test 1: Sets basiques
    console.log('📋 Test 1: Récupération des sets...')
    const setsResponse = await fetch('https://api.pokemontcg.io/v2/sets?pageSize=5')
    
    if (!setsResponse.ok) {
      throw new Error(`HTTP ${setsResponse.status}: ${setsResponse.statusText}`)
    }
    
    const setsData = await setsResponse.json()
    console.log('✅ Sets récupérés:', setsData.data.length)
    console.log('📦 Premier set:', setsData.data[0]?.name)
    
    // Test 2: Cartes basiques  
    console.log('\n🃏 Test 2: Récupération des cartes...')
    const cardsResponse = await fetch('https://api.pokemontcg.io/v2/cards?pageSize=3')
    
    if (!cardsResponse.ok) {
      throw new Error(`HTTP ${cardsResponse.status}: ${cardsResponse.statusText}`)
    }
    
    const cardsData = await cardsResponse.json()
    console.log('✅ Cartes récupérées:', cardsData.data.length)
    console.log('🃏 Première carte:', cardsData.data[0]?.name)
    
    // Test 3: Avec headers personnalisés
    console.log('\n🔑 Test 3: Avec headers...')
    const headersResponse = await fetch('https://api.pokemontcg.io/v2/sets?pageSize=2', {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Pokemon Collection Manager'
      }
    })
    
    if (headersResponse.ok) {
      console.log('✅ Headers acceptés')
    }
    
    return {
      success: true,
      message: 'API PokéTCG fonctionne parfaitement ! 🎉'
    }
    
  } catch (error) {
    console.error('❌ Erreur API:', error.message)
    
    if (error.message.includes('CORS')) {
      return {
        success: false,
        message: 'Problème CORS - L\'API fonctionne mieux en production',
        solution: 'Déployer sur votre site ou utiliser des données mock'
      }
    }
    
    if (error.message.includes('429')) {
      return {
        success: false,
        message: 'Rate limit atteint - Obtenez une clé API gratuite',
        solution: 'Visitez https://pokemontcg.io/ pour une clé API'
      }
    }
    
    return {
      success: false,
      message: `Erreur: ${error.message}`,
      solution: 'Vérifiez votre connexion internet'
    }
  }
}

// Lancer le test
testPokemonAPI().then(result => {
  console.log('\n📊 RÉSULTAT FINAL:')
  console.log(result.message)
  if (result.solution) {
    console.log('💡 Solution:', result.solution)
  }
})

export default testPokemonAPI