import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="not-authenticated">
        <h1>Access Denied</h1>
        <p>Please log in to access this page</p>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
