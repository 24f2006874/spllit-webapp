import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, ChevronDown } from 'lucide-react'
import { signInWithPopup, GoogleAuthProvider, sendSignInLinkToEmail } from 'firebase/auth'
import { auth } from '../firebase'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setError('')
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      setSuccessMessage(`Welcome ${result.user.displayName}!`)
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
    } catch (error) {
      setError(error.message || 'Google sign-in failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      setError('')
      setSuccessMessage('')

      if (!email) {
        setError('Please enter your email')
        setIsLoading(false)
        return
      }

      const actionCodeSettings = {
        url: `${window.location.origin}/verify-email`,
        handleCodeInApp: true,
      }

      await sendSignInLinkToEmail(auth, email, actionCodeSettings)
      
      window.localStorage.setItem('emailForSignIn', email)
      
      setEmailSent(true)
      setSuccessMessage(`Check your email at ${email} for the sign-in link`)
      
      setEmail('')
    } catch (error) {
      if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email')
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many requests. Try again later')
      } else {
        setError(error.message || 'Failed to send sign-in link')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <nav className="navbar">
        <div className="nav-left">
          <div className="logo">
            <img src="/icons.png" alt="SPLLIT" />
          </div>
        </div>
        
        <div className="nav-center">
          <div className="nav-item">Meet Spllit Social <ChevronDown size={16} /></div>
          <div className="nav-item">How It Works <ChevronDown size={16} /></div>
          <div className="nav-item">Solutions <ChevronDown size={16} /></div>
          <div className="nav-item">Pricing <ChevronDown size={16} /></div>
          <div className="nav-item">About us <ChevronDown size={16} /></div>
        </div>

        <div className="nav-right">
          <button className="btn btn-primary">Try SPLLIT</button>
        </div>
      </nav>

      <div className="main-content">
        <div className="left-section">
          <h1 className="hero-title">One platform,<br />endless possibilities</h1>
          {/* <p className="hero-subtitle">Brainstorm in SPLLIT, build in Cowork</p> */}

          <div className="login-card">
            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}

            {error && (
              <div className="error-message">{error}</div>
            )}

            <button 
              onClick={handleGoogleLogin} 
              className="btn-google"
              disabled={isLoading}
            >
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isLoading ? 'Connecting...' : 'Continue with Google'}
            </button>

            <div className="divider"><span>OR</span></div>

            <form onSubmit={handleEmailSubmit}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="email-input"
                required
                disabled={isLoading}
              />
              <button type="submit" className="btn-email" disabled={isLoading}>
                {isLoading ? 'Sending link...' : 'Continue with email'}
              </button>
            </form>
          </div>

          <button className="btn-desktop" disabled={isLoading}>
            <Download size={18} />
            Download desktop app
          </button>
        </div>

        <div className="right-section">
          <div className="app-preview-placeholder">
            <img
              src="/your-app-preview.png"
              alt="SPLLIT App Preview"
              className="app-preview-image"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
