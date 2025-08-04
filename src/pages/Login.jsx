import { useState } from 'react'
import { Eye, EyeOff, Sparkles, Mail, Lock, User } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import Button from '../components/UI/Button'
import LoadingSpinner from '../components/UI/LoadingSpinner'

const Login = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  
  const { login, register, loading } = useAuthStore()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Email
    if (!formData.email) {
      newErrors.email = 'Email requis'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide'
    }

    // Mot de passe
    if (!formData.password) {
      newErrors.password = 'Mot de passe requis'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères'
    }

    // Pour l'inscription
    if (!isLogin) {
      if (!formData.displayName.trim()) {
        newErrors.displayName = 'Nom d\'utilisateur requis'
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      if (isLogin) {
        await login(formData.email, formData.password)
      } else {
        await register(formData.email, formData.password, formData.displayName)
      }
    } catch (error) {
      // Les erreurs sont gérées dans le store
      console.error('Erreur auth:', error)
    }
  }

  const InputField = ({ 
    name, 
    type = 'text', 
    placeholder, 
    icon: Icon, 
    error,
    ...props 
  }) => (
    <div className="space-y-1">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`
            block w-full pl-10 pr-3 py-3 border rounded-lg text-sm
            placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            transition-colors duration-200
            ${error 
              ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600' 
              : 'border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600'
            }
            dark:text-white dark:placeholder-gray-400
          `}
          {...props}
        />
        {name === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        <LoadingSpinner size="large" text="Connexion en cours..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            {isLogin ? 'Connexion' : 'Créer un compte'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isLogin 
              ? 'Accédez à votre collection Pokémon' 
              : 'Commencez à gérer votre collection'
            }
          </p>
        </div>

        {/* Formulaire */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLogin && (
              <InputField
                name="displayName"
                placeholder="Nom d'utilisateur"
                icon={User}
                error={errors.displayName}
              />
            )}
            
            <InputField
              name="email"
              type="email"
              placeholder="Adresse email"
              icon={Mail}
              error={errors.email}
            />
            
            <InputField
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Mot de passe"
              icon={Lock}
              error={errors.password}
            />
            
            {!isLogin && (
              <InputField
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirmer le mot de passe"
                icon={Lock}
                error={errors.confirmPassword}
              />
            )}
          </div>

          <div>
            <Button
              type="submit"
              variant="pokemon"
              size="large"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              {isLogin ? 'Se connecter' : 'Créer le compte'}
            </Button>
          </div>

          {/* Toggle entre connexion et inscription */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setErrors({})
                setFormData({
                  email: '',
                  password: '',
                  displayName: '',
                  confirmPassword: ''
                })
              }}
              className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
            >
              {isLogin 
                ? "Vous n'avez pas de compte ? Créer un compte" 
                : 'Vous avez déjà un compte ? Se connecter'
              }
            </button>
          </div>
        </form>

        {/* Info supplémentaire */}
        <div className="mt-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-primary-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Fonctionnalités
              </span>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Sauvegarde cloud de votre collection</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Synchronisation multi-appareils</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Suivi des prix et statistiques</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login