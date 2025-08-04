import { Loader2 } from 'lucide-react'

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  text = '',
  className = '' 
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-6 w-6',
    large: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  const colorClasses = {
    primary: 'text-primary-500',
    white: 'text-white',
    gray: 'text-gray-500',
    red: 'text-red-500',
    green: 'text-green-500'
  }

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader2 
        className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
      />
      {text && (
        <span className={`text-sm ${colorClasses[color]}`}>
          {text}
        </span>
      )}
    </div>
  )
}

export default LoadingSpinner