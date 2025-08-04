#!/usr/bin/env node

/**
 * Script de build et déploiement pour O2switch
 * Ce script optimise la build pour l'hébergement partagé
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🚀 Démarrage du build pour O2switch...\n')

// Configuration
const DIST_DIR = path.join(__dirname, 'dist')
const PUBLIC_DIR = path.join(__dirname, 'public')

// Étape 1: Nettoyage
console.log('🧹 Nettoyage des anciens builds...')
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true })
}

// Étape 2: Build Vite
console.log('⚡ Build avec Vite...')
try {
  execSync('npm run build', { stdio: 'inherit' })
} catch (error) {
  console.error('❌ Erreur lors du build Vite')
  process.exit(1)
}

// Étape 3: Optimisations spécifiques à O2switch
console.log('🔧 Optimisations pour O2switch...')

// Copier le .htaccess
const htaccessSource = path.join(PUBLIC_DIR, '.htaccess')
const htaccessDest = path.join(DIST_DIR, '.htaccess')
if (fs.existsSync(htaccessSource)) {
  fs.copyFileSync(htaccessSource, htaccessDest)
  console.log('✅ .htaccess copié')
}

// Vérifier et optimiser les assets
optimizeAssets()

// Générer le fichier de vérification
generateVerificationFile()

// Créer le fichier de configuration pour l'upload FTP
generateFTPConfig()

console.log('\n✨ Build terminé avec succès!')
console.log('📁 Fichiers générés dans le dossier /dist')
console.log('📋 Instructions de déploiement dans /dist/DEPLOY.md')

function optimizeAssets() {
  console.log('📊 Optimisation des assets...')
  
  // Analyser la taille des fichiers
  const stats = analyzeBundle()
  
  // Créer un rapport de build
  const report = {
    buildDate: new Date().toISOString(),
    stats: stats,
    version: process.env.npm_package_version || '1.0.0',
    environment: 'production'
  }
  
  fs.writeFileSync(
    path.join(DIST_DIR, 'build-report.json'),
    JSON.stringify(report, null, 2)
  )
  
  console.log('✅ Rapport de build généré')
}

function analyzeBundle() {
  const stats = {
    totalSize: 0,
    files: {},
    chunks: []
  }
  
  function getDirectorySize(dirPath) {
    let totalSize = 0
    const files = fs.readdirSync(dirPath)
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file)
      const stat = fs.statSync(filePath)
      
      if (stat.isDirectory()) {
        totalSize += getDirectorySize(filePath)
      } else {
        const size = stat.size
        totalSize += size
        const relativePath = path.relative(DIST_DIR, filePath)
        stats.files[relativePath] = {
          size: size,
          sizeKB: Math.round(size / 1024 * 100) / 100
        }
      }
    })
    
    return totalSize
  }
  
  if (fs.existsSync(DIST_DIR)) {
    stats.totalSize = getDirectorySize(DIST_DIR)
    stats.totalSizeKB = Math.round(stats.totalSize / 1024 * 100) / 100
    stats.totalSizeMB = Math.round(stats.totalSize / (1024 * 1024) * 100) / 100
  }
  
  return stats
}

function generateVerificationFile() {
  const verification = {
    app: 'Pokemon Collection Manager',
    version: process.env.npm_package_version || '1.0.0',
    buildDate: new Date().toISOString(),
    buildFor: 'O2switch',
    features: [
      'SPA Routing',
      'PWA Support',
      'Firebase Integration',
      'PokéTCG API',
      'Dark/Light Theme',
      'Offline Support'
    ],
    status: 'ready-for-deployment'
  }
  
  fs.writeFileSync(
    path.join(DIST_DIR, 'app-info.json'),
    JSON.stringify(verification, null, 2)
  )
}

function generateFTPConfig() {
  const deployInstructions = `# Instructions de déploiement sur O2switch

## Étapes de déploiement

### 1. Préparation
- Connectez-vous à votre cPanel O2switch
- Accédez au gestionnaire de fichiers
- Naviguez vers le dossier \`public_html\` de votre domaine/sous-domaine

### 2. Upload des fichiers
- Supprimez le contenu existant de \`public_html\` (sauvegardez si nécessaire)
- Uploadez TOUT le contenu du dossier \`dist\` vers \`public_html\`
- Assurez-vous que le fichier \`.htaccess\` est bien présent

### 3. Configuration Firebase
- Créez un fichier \`.env\` dans le dossier racine avec vos clés Firebase:
\`\`\`
VITE_FIREBASE_API_KEY=votre_clé_api
VITE_FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre_projet_id
VITE_FIREBASE_STORAGE_BUCKET=votre_projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
VITE_FIREBASE_APP_ID=votre_app_id
\`\`\`

### 4. Configuration du sous-domaine (optionnel)
Pour créer un sous-domaine comme \`collection.mondomaine.fr\`:
- Dans cPanel, allez dans "Sous-domaines"
- Créez un nouveau sous-domaine pointant vers ce dossier
- Le .htaccess gérera automatiquement le routing

### 5. Vérification
- Visitez votre site
- Vérifiez que toutes les pages se chargent correctement
- Testez l'authentification Firebase
- Vérifiez le mode hors-ligne en coupant la connexion

## Structure des fichiers uploadés

\`\`\`
public_html/
├── index.html              # Page principale
├── .htaccess               # Configuration Apache
├── manifest.json           # Configuration PWA
├── service-worker.js       # Cache et mode hors-ligne
├── assets/                 # CSS, JS, et autres assets
├── app-info.json          # Informations de l'app
└── build-report.json      # Rapport de build
\`\`\`

## Dépannage

### Problème: Pages 404 lors de la navigation
- Vérifiez que le fichier .htaccess est présent
- Assurez-vous que mod_rewrite est activé (généralement le cas sur O2switch)

### Problème: Erreurs Firebase
- Vérifiez la configuration des variables d'environnement
- Assurez-vous que les domaines sont autorisés dans Firebase Console

### Problème: Assets non chargés
- Vérifiez les permissions des fichiers (644 pour les fichiers, 755 pour les dossiers)
- Contrôlez la configuration du cache dans .htaccess

## Support
- Documentation O2switch: https://help.o2switch.fr/
- Firebase Documentation: https://firebase.google.com/docs/web/setup
- PokéTCG API: https://pokemontcg.io/

## Performance
- Taille totale du build: ${fs.existsSync(path.join(DIST_DIR, 'build-report.json')) ? 
    JSON.parse(fs.readFileSync(path.join(DIST_DIR, 'build-report.json'), 'utf8')).stats.totalSizeMB + ' MB' : 
    'Non calculé'}
- Temps de chargement initial estimé: < 3s sur connexion standard
- Mode hors-ligne: Disponible après la première visite
`

  fs.writeFileSync(path.join(DIST_DIR, 'DEPLOY.md'), deployInstructions)
  console.log('✅ Instructions de déploiement créées')
  
  // Créer aussi un script de upload FTP simple
  const ftpScript = `#!/bin/bash
# Script d'upload FTP pour O2switch
# Remplacez les variables par vos informations

FTP_HOST="votre-serveur.o2switch.net"
FTP_USER="votre-username"
FTP_PASS="votre-password"
REMOTE_DIR="/public_html"
LOCAL_DIR="./dist"

echo "🚀 Upload vers O2switch..."
echo "⚠️  Assurez-vous d'avoir configuré vos identifiants FTP"

# Utiliser lftp pour un upload récursif
lftp -c "
open ftp://$FTP_USER:$FTP_PASS@$FTP_HOST
mirror -R $LOCAL_DIR $REMOTE_DIR --verbose
bye
"

echo "✅ Upload terminé"
echo "🌐 Visitez votre site pour vérifier le déploiement"
`

  fs.writeFileSync(path.join(DIST_DIR, 'upload-ftp.sh'), ftpScript)
  fs.chmodSync(path.join(DIST_DIR, 'upload-ftp.sh'), '755')
  console.log('✅ Script FTP créé')
}