import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import useBackendStatus from '../hooks/useBackendStatus'

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, hasStoredToken, loading } = useAuth()
  const { state: backendState } = useBackendStatus()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!isAuthenticated && hasStoredToken && backendState !== 'ready') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-900 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-current" />
          <h2 className="text-lg font-semibold">Reconnecting to the backend</h2>
          <p className="mt-2 text-sm opacity-90">
            Your session is still stored locally. This page will continue once the backend is ready again.
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute

