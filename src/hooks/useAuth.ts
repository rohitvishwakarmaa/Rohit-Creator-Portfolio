import { useState, useCallback } from 'react'
import { adminService } from '@/services/adminService'
import { useAuthStore } from '@/store/authStore'
import type { LoginCredentials } from '@/types'

export const useAuth = () => {
  const { token, user, isAuthenticated, login, logout } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await adminService.login(credentials)
        login(res.token, res.user)
        return true
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Login failed. Please try again.'
        setError(message)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [login]
  )

  const handleLogout = useCallback(() => {
    logout()
  }, [logout])

  return { token, user, isAuthenticated, isLoading, error, handleLogin, handleLogout }
}
