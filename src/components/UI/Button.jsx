import { forwardRef } from 'react'
import LoadingSpinner from './LoadingSpinner'

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-700',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-sm hover:shadow-md',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500 shadow-sm hover:shadow-md',
    pokemon: 'bg-gradient-to-r from-pokemon-red to-pokemon-blue text-white hover:from-pokemon-red/90 hover:to-pokemon-blue/90 focus:ring-pokemon-blue shadow-sm hover:shadow-md'
  }

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm gap-1.5',
    medium: 'px-4 py-2 text-sm gap-2',
    large: 'px-6 py-3 text-base gap-2',
    xl: 'px-8 py-4 text-lg gap-3'
  }

  const iconSizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-4 w-4',
    large: 'h-5 w-5',
    xl: 'h-6 w-6'
  }

  const isDisabled = disabled || loading

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <LoadingSpinner 
          size="small" 
          color={variant === 'primary' || variant === 'danger' || variant === 'success' || variant === 'pokemon' ? 'white' : 'gray'} 
        />
      )}
      
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className={iconSizeClasses[size]} />
      )}
      
      {children}
      
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className={iconSizeClasses[size]} />
      )}
    </button>
  )
})

Button.displayName = 'Button'

export default Button