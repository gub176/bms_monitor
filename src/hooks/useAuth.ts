import { useAuthStore } from '../stores/authStore'

export function useAuth() {
  const { user, session, loading, error, signOut } = useAuthStore()

  const isAuthenticated = !!user
  const email = user?.email

  return {
    user,
    session,
    loading,
    error,
    isAuthenticated,
    email,
    signOut,
  }
}
