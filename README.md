# 🃏 Pokémon Collection Manager

Une application web moderne et élégante pour gérer votre collection de cartes Pokémon TCG.

## 🚀 **Choisissez votre hébergement**

### 🔥 **Option 1 : Vercel (Recommandé) - API Complète**
- **✅ 25,000+ cartes** PokéTCG réelles via API
- **✅ 900+ sets** officiels complets  
- **✅ Recherche illimitée** et filtres avancés
- **✅ Déploiement automatique** depuis GitHub
- **✅ Performance CDN** mondiale
- **📋 Guide complet :** [DEPLOY_VERCEL_GUIDE.md](./DEPLOY_VERCEL_GUIDE.md)

### 🏠 **Option 2 : O2switch - Mode Hors Ligne**  
- **✅ 8 cartes** de démonstration
- **✅ 7 sets** populaires  
- **✅ Fonctionnement autonome** sans API
- **✅ Compatible** hébergement partagé
- **📋 Guide :** Section "Build et Déploiement" ci-dessous

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)
![Vite](https://img.shields.io/badge/Vite-5.0.8-646cff.svg)
![Firebase](https://img.shields.io/badge/Firebase-10.7.1-ffca28.svg)

## ✨ Fonctionnalités

### 🏠 Dashboard Personnel
- Vue d'ensemble de votre collection avec statistiques détaillées
- Graphiques de progression et analyse de completion
- Suivi de la valeur estimée de votre collection
- Objectifs et suggestions personnalisées

### 🔍 Explorateur de Cartes
- Navigation par sets/extensions officiels
- Filtres avancés (rareté, type, génération, année)
- Aperçu des cartes avec images haute qualité
- Statistiques de completion par set

### 📦 Ma Collection
- Système de marquage "possédées" / "wishlist"
- Recherche et filtres dans votre collection
- Import/export en CSV
- Notes personnalisées et système de tags

### 🎯 Suivi de Progression
- Barres de progression pour chaque set
- Cartes manquantes mises en évidence
- Historique des ajouts à la collection
- Achievements et succès

### 🔎 Recherche Avancée
- Recherche par nom, numéro, type, rareté
- Autocomplétion intelligente
- Recherches récentes et populaires
- Filtres multi-critères

## 🛠️ Stack Technique

### Frontend
- **React 18** avec hooks modernes
- **Vite** pour le bundling et développement rapide
- **Tailwind CSS** pour le design responsive
- **React Router** pour la navigation
- **Zustand** pour la gestion d'état
- **Lucide React** pour les icônes

### Backend & Services
- **Firebase Authentication** pour la connexion utilisateur
- **Firestore** pour la base de données NoSQL
- **PokéTCG API** pour les données des cartes (gratuite)
- **Service Worker** pour le mode hors-ligne

### Build & Déploiement
- Configuration optimisée pour hébergement partagé
- Fichier `.htaccess` pour le routing SPA
- PWA avec cache intelligent
- Compression Gzip et optimisation des assets

## 🚀 Installation et Configuration

### 1. Cloner le projet
```bash
git clone https://github.com/votre-username/pokemon-collection-manager.git
cd pokemon-collection-manager
npm install
```

### 2. Configuration Firebase
1. Créez un projet sur [Firebase Console](https://console.firebase.google.com/)
2. Activez Authentication (Email/Password)
3. Créez une base Firestore
4. Copiez `env.example` vers `.env` et remplissez vos clés

```bash
cp env.example .env
```

Remplissez le fichier `.env` :
```env
VITE_FIREBASE_API_KEY=votre_clé_api
VITE_FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre_projet_id
VITE_FIREBASE_STORAGE_BUCKET=votre_projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
VITE_FIREBASE_APP_ID=votre_app_id
```

### 3. API PokéTCG (Optionnel)
Obtenez une clé API gratuite sur [PokéTCG.io](https://pokemontcg.io/) et ajoutez-la dans `.env` :
```env
VITE_POKEMON_API_KEY=votre_clé_pokemon_api
```

### 4. Développement
```bash
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

## 📦 Build et Déploiement sur O2switch

### Build pour production
```bash
npm run build:deploy
```

Cette commande :
- Génère les fichiers optimisés dans `/dist`
- Copie le fichier `.htaccess` configuré
- Créé les instructions de déploiement
- Génère un rapport de build détaillé

### Déploiement sur O2switch
1. Connectez-vous à votre cPanel O2switch
2. Accédez au gestionnaire de fichiers
3. Naviguez vers `public_html` de votre domaine
4. Uploadez tout le contenu du dossier `/dist`
5. Assurez-vous que `.htaccess` est présent

📋 Instructions détaillées dans `/dist/DEPLOY.md` après le build

### Configuration sous-domaine
Pour créer `collection.mondomaine.fr` :
1. Dans cPanel > Sous-domaines
2. Créez le sous-domaine pointant vers le dossier de l'app
3. Le routing sera géré automatiquement

## 🎨 Design et UX

### Thèmes
- Mode sombre/clair avec basculement automatique
- Couleurs inspirées de l'univers Pokémon
- Design moderne avec animations fluides

### Responsive
- Mobile-first approach
- Breakpoints optimisés pour tous les écrans
- Navigation adaptive avec sidebar collapsible

### Animations
- Transitions CSS fluides
- Hover effects sur les cartes
- Loading states et skeletons
- Animations d'apparition des éléments

## 🔧 Fonctionnalités Avancées

### PWA (Progressive Web App)
- Installable sur mobile et desktop
- Mode hors-ligne avec cache intelligent
- Notifications push (future feature)
- Icônes et splashscreen personnalisés

### Performance
- Lazy loading des images
- Code splitting automatique
- Compression des assets
- Cache stratégique des API

### SEO & Partage
- Meta tags optimisés
- Open Graph pour les réseaux sociaux
- Sitemap automatique
- URLs clean et friendly

## 📊 Structure des Données

### Collection Utilisateur
```javascript
{
  userId: "user_id",
  cardId: "card_id", 
  status: "owned" | "wishlist",
  addedDate: "ISO_date",
  cardData: {
    name: "Nom de la carte",
    set: { id: "set_id", name: "Nom du set" },
    number: "Numéro",
    rarity: "Rareté",
    images: { small: "url", large: "url" },
    types: ["Type1", "Type2"],
    estimatedPrice: 0.00
  },
  notes: "Notes personnelles",
  condition: "mint" | "near-mint" | "excellent" | "good" | "light-played" | "played" | "poor",
  tags: ["tag1", "tag2"]
}
```

### Profil Utilisateur
```javascript
{
  displayName: "Nom d'affichage",
  email: "email@example.com",
  avatar: "url_avatar",
  joinDate: "ISO_date",
  preferences: {
    theme: "light" | "dark",
    notifications: boolean,
    publicCollection: boolean
  },
  stats: {
    totalCards: 0,
    ownedCards: 0,
    wishlistCards: 0,
    completionRate: 0,
    totalValue: 0.00
  }
}
```

## 🛡️ Sécurité

### Firebase Security Rules
```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Collections privées par utilisateur
    match /collections/{document} {
      allow read, write: if resource.data.userId == request.auth.uid;
    }
    
    // Profils utilisateur
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Protection des données
- Authentification Firebase sécurisée
- Données utilisateur isolées par UID
- Validation côté client et serveur
- Headers de sécurité dans `.htaccess`

## 🧪 Tests et Qualité

### Scripts disponibles
```bash
npm run dev          # Développement
npm run build        # Build de production
npm run build:deploy # Build optimisé pour O2switch
npm run preview      # Preview de la build
npm run lint         # Vérification du code
npm run analyze      # Analyse du bundle
```

### Monitoring
- Build reports automatiques
- Analyse de la taille des bundles
- Monitoring des performances
- Logs d'erreur structurés

## 🤝 Contribution

### Structure du projet
```
pokemon-collection-manager/
├── public/                 # Assets statiques
│   ├── .htaccess          # Configuration Apache
│   ├── manifest.json      # PWA manifest
│   └── service-worker.js  # Cache et offline
├── src/
│   ├── components/        # Composants réutilisables
│   ├── pages/            # Pages principales
│   ├── stores/           # Gestion d'état Zustand
│   ├── services/         # Services API
│   ├── config/           # Configuration
│   └── utils/            # Utilitaires
├── build-deploy.js       # Script de build personnalisé
└── README.md
```

### Standards de code
- ESLint configuration stricte
- Composants fonctionnels avec hooks
- Props validation
- Naming conventions cohérentes

## 📈 Roadmap

### Version 1.1 (Q2 2024)
- [ ] Mode collaboratif (partage de collection)
- [ ] Système d'échange entre utilisateurs
- [ ] Notifications push
- [ ] Génération de PDF des collections

### Version 1.2 (Q3 2024)
- [ ] Mode tournoi et deck builder
- [ ] Intégration prix temps réel
- [ ] Statistiques avancées
- [ ] API publique pour développeurs

### Version 2.0 (Q4 2024)
- [ ] Mobile app native
- [ ] Reconnaissance par photo (IA)
- [ ] Marketplace intégré
- [ ] Version desktop Electron

## 📞 Support

### Documentation
- [Firebase Setup](https://firebase.google.com/docs/web/setup)
- [PokéTCG API](https://pokemontcg.io/docs)
- [O2switch Help](https://help.o2switch.fr/)
- [Vite Guide](https://vitejs.dev/guide/)

### Issues et Bugs
Rapportez les problèmes sur [GitHub Issues](https://github.com/votre-username/pokemon-collection-manager/issues)

### Contact
- Email: support@votredomaine.fr
- Discord: [Serveur Communauté]
- Twitter: [@PokemonCollMgr]

## 📄 Licence

MIT License - voir [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- [PokéTCG API](https://pokemontcg.io/) pour les données des cartes
- [Firebase](https://firebase.google.com/) pour l'infrastructure
- [The Pokémon Company](https://www.pokemon.com/) pour l'univers Pokémon
- Communauté des collectionneurs pour les retours

---

**⚡ Développé avec passion pour la communauté Pokémon TCG**

*Ce projet n'est pas affilié à The Pokémon Company International*