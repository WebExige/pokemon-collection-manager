# 🚀 Guide de Démarrage Rapide

## Installation Express (5 minutes)

### 1. Prérequis
```bash
# Vérifiez Node.js (version 16+)
node --version

# Installez les dépendances
npm install
```

### 2. Configuration Firebase
1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Créez un nouveau projet
3. Activez Authentication > Email/Password
4. Créez une base Firestore
5. Copiez `env.example` vers `.env` et remplissez vos clés

### 3. Lancement
```bash
# Développement
npm run dev

# Build pour production
npm run build:deploy
```

## ⚡ Déploiement O2switch (10 minutes)

### 1. Build du projet
```bash
npm run build:deploy
```

### 2. Upload vers O2switch
- Connectez-vous à votre cPanel
- Gestionnaire de fichiers > public_html
- Uploadez tout le contenu de `/dist`
- Vérifiez que `.htaccess` est présent

### 3. Configuration finale
- Ajoutez votre domaine dans Firebase Console > Authentication > Domains
- Testez l'application sur votre domaine

## 📱 Fonctionnalités Clés

✅ **Dashboard** - Vue d'ensemble avec statistiques  
✅ **Collection** - Gestion des cartes possédées/wishlist  
✅ **Explorer** - Navigation par sets Pokémon  
✅ **Recherche** - Filtres avancés et autocomplétion  
✅ **Profil** - Gestion utilisateur et préférences  
✅ **PWA** - Mode hors-ligne et installation  
✅ **Responsive** - Mobile et desktop optimisés  
✅ **Thèmes** - Mode sombre/clair  

## 🔗 Liens Utiles

- [Documentation complète](README.md)
- [Instructions de déploiement](dist/DEPLOY.md) *(après build)*
- [Firebase Console](https://console.firebase.google.com/)
- [PokéTCG API](https://pokemontcg.io/)
- [O2switch cPanel](https://cpanel.o2switch.fr/)

## 🆘 Support Rapide

### Problème : Page 404
➡️ Vérifiez que `.htaccess` est dans le dossier racine

### Problème : Erreur Firebase
➡️ Contrôlez les variables d'environnement dans `.env`

### Problème : API non accessible
➡️ Vérifiez votre connexion et la clé PokéTCG API

---

**🎯 Prêt en moins de 15 minutes !**