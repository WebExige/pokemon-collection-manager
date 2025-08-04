import { useState } from 'react'
import { 
  User, 
  Edit, 
  Save, 
  X, 
  Upload,
  Download,
  Share2,
  Settings,
  Bell,
  Eye,
  EyeOff,
  Calendar,
  Trophy,
  Star,
  Heart,
  Package
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useCollectionStore } from '../stores/collectionStore'
import { useThemeStore } from '../stores/themeStore'
import Button from '../components/UI/Button'
import LoadingSpinner from '../components/UI/LoadingSpinner'

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [saving, setSaving] = useState(false)
  
  const { user, userProfile, updateProfile } = useAuthStore()
  const { stats } = useCollectionStore()
  const { theme, toggleTheme } = useThemeStore()

  const handleEdit = () => {
    setFormData({
      displayName: userProfile?.displayName || '',
      bio: userProfile?.bio || '',
      publicCollection: userProfile?.preferences?.publicCollection || false,
      notifications: userProfile?.preferences?.notifications || true
    })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({})
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await updateProfile({
        displayName: formData.displayName,
        bio: formData.bio,
        preferences: {
          ...userProfile?.preferences,
          publicCollection: formData.publicCollection,
          notifications: formData.notifications
        }
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const generateShareableLink = () => {
    const baseUrl = window.location.origin
    const userId = user?.uid
    return `${baseUrl}/collection/public/${userId}`
  }

  const copyShareableLink = async () => {
    try {
      await navigator.clipboard.writeText(generateShareableLink())
      // Toast success serait bien ici
    } catch (error) {
      console.error('Erreur lors de la copie:', error)
    }
  }

  const exportCollection = () => {
    // Cette fonction serait implémentée pour exporter la collection
    console.log('Export collection')
  }

  const joinDate = userProfile?.joinDate ? new Date(userProfile.joinDate) : new Date()

  const achievements = [
    {
      id: 'first_card',
      name: 'Première Carte',
      description: 'Ajouter votre première carte',
      icon: Star,
      earned: stats.ownedCards > 0,
      date: '2024-01-15'
    },
    {
      id: 'collector',
      name: 'Collectionneur',
      description: 'Posséder 50 cartes',
      icon: Package,
      earned: stats.ownedCards >= 50,
      date: stats.ownedCards >= 50 ? '2024-02-01' : null
    },
    {
      id: 'wishlist_master',
      name: 'Maître de la Wishlist',
      description: 'Avoir 25 cartes en wishlist',
      icon: Heart,
      earned: stats.wishlistCards >= 25,
      date: stats.wishlistCards >= 25 ? '2024-02-15' : null
    },
    {
      id: 'completionist',
      name: 'Complétionniste',
      description: 'Compléter un set à 100%',
      icon: Trophy,
      earned: stats.completionRate === 100,
      date: stats.completionRate === 100 ? '2024-03-01' : null
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mon Profil</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gérez vos informations personnelles et vos préférences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profil */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Informations du profil
              </h2>
              {!isEditing ? (
                <Button
                  variant="outline"
                  onClick={handleEdit}
                  icon={Edit}
                  size="small"
                >
                  Modifier
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    icon={X}
                    size="small"
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    icon={Save}
                    size="small"
                    loading={saving}
                  >
                    Sauvegarder
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  {userProfile?.avatar ? (
                    <img
                      src={userProfile.avatar}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                      <User className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                    </div>
                  )}
                  {isEditing && (
                    <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white hover:bg-primary-600 transition-colors">
                      <Upload className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {userProfile?.displayName || 'Utilisateur'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <Calendar className="w-4 h-4" />
                    <span>Membre depuis {joinDate.toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>

              {/* Formulaire */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom d'utilisateur
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white py-2">
                      {userProfile?.displayName || 'Non défini'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900 dark:text-white py-2">{user?.email}</p>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Biographie
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Parlez-nous de vous et de votre passion pour Pokémon..."
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white py-2">
                    {userProfile?.bio || 'Aucune biographie définie.'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Préférences */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Préférences
            </h2>

            <div className="space-y-4">
              {/* Thème */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Thème</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Choisissez entre le mode clair et sombre
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={toggleTheme}
                  icon={theme === 'dark' ? Eye : EyeOff}
                  size="small"
                >
                  {theme === 'dark' ? 'Clair' : 'Sombre'}
                </Button>
              </div>

              {/* Collection publique */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Collection publique</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Permettre aux autres de voir votre collection
                  </p>
                </div>
                {isEditing ? (
                  <input
                    type="checkbox"
                    checked={formData.publicCollection}
                    onChange={(e) => handleInputChange('publicCollection', e.target.checked)}
                    className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  />
                ) : (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    userProfile?.preferences?.publicCollection
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {userProfile?.preferences?.publicCollection ? 'Activé' : 'Désactivé'}
                  </span>
                )}
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Notifications</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Recevoir des notifications sur les nouveautés
                  </p>
                </div>
                {isEditing ? (
                  <input
                    type="checkbox"
                    checked={formData.notifications}
                    onChange={(e) => handleInputChange('notifications', e.target.checked)}
                    className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  />
                ) : (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    userProfile?.preferences?.notifications
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {userProfile?.preferences?.notifications ? 'Activé' : 'Désactivé'}
                  </span>
                )}
              </div>

              {/* Partage de collection */}
              {userProfile?.preferences?.publicCollection && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Lien de partage</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Partagez votre collection avec un lien unique
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={copyShareableLink}
                      icon={Share2}
                      size="small"
                    >
                      Copier le lien
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Actions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={exportCollection}
                icon={Download}
                className="justify-start"
              >
                <div className="text-left">
                  <div className="font-medium">Exporter ma collection</div>
                  <div className="text-xs text-gray-500">Télécharger en CSV</div>
                </div>
              </Button>

              <Button
                variant="outline"
                icon={Upload}
                className="justify-start"
              >
                <div className="text-left">
                  <div className="font-medium">Importer une collection</div>
                  <div className="text-xs text-gray-500">Depuis un fichier CSV</div>
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar - Statistiques et Succès */}
        <div className="space-y-6">
          {/* Statistiques */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Statistiques
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Possédées</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats.ownedCards}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Wishlist</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats.wishlistCards}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats.totalCards}
                </span>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Completion</span>
                  <span className="font-semibold text-primary-600 dark:text-primary-400">
                    {stats.completionRate}%
                  </span>
                </div>
                <div className="progress-bar mt-2">
                  <div 
                    className="progress-fill bg-primary-500"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Valeur estimée</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {stats.totalValue}€
                </span>
              </div>
            </div>
          </div>

          {/* Succès */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Succès
            </h3>

            <div className="space-y-3">
              {achievements.map((achievement) => {
                const Icon = achievement.icon
                return (
                  <div
                    key={achievement.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      achievement.earned
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'bg-gray-50 dark:bg-gray-700/50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      achievement.earned
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-gray-100 dark:bg-gray-600'
                    }`}>
                      <Icon className={`w-4 h-4 ${
                        achievement.earned
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium text-sm ${
                        achievement.earned
                          ? 'text-green-900 dark:text-green-100'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {achievement.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {achievement.description}
                      </p>
                      {achievement.earned && achievement.date && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Obtenu le {new Date(achievement.date).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile