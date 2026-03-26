import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailLink, isSignInWithEmailLink } from 'firebase/auth'
import { auth } from '../firebase'
import './Login.css'

function EmailVerification() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const verifyEmailLink = async () => {
      try {
        if (isSignInWithEmailLink(auth, window.location.href)) {
          const email = window.localStorage.getItem('emailForSignIn')
          
          if (!email) {
            setError('Email not found. Please try signing in again.')
            setLoading(false)
            return
          }

          const result = await signInWithEmailLink(auth, email, window.location.href)
          
          window.localStorage.removeItem('emailForSignIn')
          
          setSuccess(true)
          
          setTimeout(() => {
            navigate('/dashboard')
          }, 2000)
        }
      } catch (error) {
        if (error.code === 'auth/invalid-email') {
          setError('Invalid email. Please try signing in again.')
        } else if (error.code === 'auth/expired-action-code') {
          setError('Your sign-in link has expired. Please request a new one.')
        } else {
          setError(error.message || 'Failed to verify email. Please try again.')
        }
        setLoading(false)
      }
    }

    verifyEmailLink()
  }, [navigate])

  return (
    <div className="login-container">
      <div className="main-content">
        <div className="left-section">
          <div className="login-card">
            {loading && (
              <div>
                <p style={{ textAlign: 'center', fontSize: '18px', color: '#666' }}>
                  Verifying your email...
                </p>
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid #f0f0f0',
                    borderTop: '3px solid #D97757',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto'
                  }}></div>
                </div>
              </div>
            )}

            {error && (
              <div className="error-message">
                <p>{error}</p>
                <button 
                  onClick={() => navigate('/login')}
                  style={{ 
                    color: '#D97757', 
                    textDecoration: 'underline', 
                    marginTop: '10px', 
                    display: 'block',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Back to Sign In
                </button>
              </div>
            )}

            {success && !loading && (
              <div className="success-message">
                <p>Email verified successfully!</p>
                <p style={{ marginTop: '10px', color: '#3c3' }}>Redirecting to dashboard...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default EmailVerification
