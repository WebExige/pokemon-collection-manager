# 🚀 Guide de déploiement Vercel

## 🎯 Déployez votre app Pokemon en 5 minutes

### 📋 Étape 1: Préparer le code pour Vercel

1. **Modifier vite.config.js** pour Vercel :
```javascript
export default defineConfig({
  plugins: [react()],
  // Retirer base: './' car Vercel gère automatiquement
  build: {
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', 'react-hot-toast'],
          charts: ['recharts'],
        }
      }
    }
  }
})
```

2. **Créer api/pokemon/[...path].js** (Proxy Vercel) :
```javascript
export default async function handler(req, res) {
  const { path } = req.query
  const queryString = new URL(req.url, 'http://localhost').search
  
  const apiUrl = `https://api.pokemontcg.io/v2/${path.join('/')}${queryString}`
  
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        ...(process.env.VITE_POKEMON_API_KEY && {
          'X-Api-Key': process.env.VITE_POKEMON_API_KEY
        })
      }
    })
    
    const data = await response.json()
    
    // Headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ error: 'API Error' })
  }
}
```

3. **Modifier pokemonApi.js** pour utiliser le proxy Vercel :
```javascript
// Détecter l'environnement Vercel
const isVercel = window.location.hostname.includes('vercel.app') || 
                 window.location.hostname === 'your-domain.com'

const getApiUrl = (endpoint) => {
  if (isVercel) {
    return `/api/pokemon${endpoint}`
  }
  return POKEMON_API_BASE + endpoint
}
```

### 📋 Étape 2: Pousser sur GitHub

1. **Initialiser Git** (si pas fait) :
```bash
git init
git add .
git commit -m "Initial commit - Pokemon Collection Manager"
```

2. **Créer repo GitHub** :
- Aller sur github.com → New Repository
- Nom: `pokemon-collection-manager`
- Public ou Private (au choix)

3. **Pousser le code** :
```bash
git remote add origin https://github.com/VOTRE-USERNAME/pokemon-collection-manager.git
git branch -M main
git push -u origin main
```

### 📋 Étape 3: Déployer sur Vercel

1. **Aller sur vercel.com** → Sign up with GitHub
2. **Import Project** → Sélectionner votre repo
3. **Configure Project** :
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variables** :
   - `VITE_FIREBASE_API_KEY`: Votre clé Firebase
   - `VITE_FIREBASE_AUTH_DOMAIN`: votre-projet.firebaseapp.com
   - `VITE_FIREBASE_PROJECT_ID`: votre-projet-id
   - `VITE_POKEMON_API_KEY`: (optionnel) Votre clé PokéTCG
5. **Deploy** → Attendre 2-3 minutes

### 📋 Étape 4: Configurer domaine custom (optionnel)

1. **Dans Vercel Dashboard** → Settings → Domains
2. **Ajouter** : `collection.votredomaine.com`
3. **DNS** : Ajouter CNAME chez votre registrar
4. **SSL** : Automatique (5-10 minutes)

### 🎯 Résultat final

✅ **URL Vercel** : `https://pokemon-collection-manager.vercel.app`
✅ **API fonctionnelle** : Accès à 25,000+ cartes réelles
✅ **Performance** : CDN mondial ultra-rapide
✅ **Sécurité** : HTTPS, variables env protégées
✅ **Maintenance** : Déploiement auto à chaque push

### 🔧 Dépannage

**Si problème CORS** :
- Vérifier que `api/pokemon/[...path].js` est bien créé
- Variables d'environnement bien configurées
- Redéployer si nécessaire

**Si Firebase ne marche pas** :
- Vérifier toutes les variables VITE_FIREBASE_*
- Domaine Vercel ajouté dans Firebase Auth

### 🚀 Commandes utiles

```bash
# Build local pour tester
npm run build
npm run preview

# Vercel CLI (optionnel)
npm i -g vercel
vercel login
vercel --prod
```