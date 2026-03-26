import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import EmailVerification from './pages/EmailVerification'
import Dashboard from './pages/Dashboard'
import MeetSpllit from './pages/MeetSpllit'
import Pricing from './pages/Pricing'
import FAQ from './pages/FAQ'
import Footer from './pages/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import './pages/Login.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/" element={
            <>
              <Login />
              <MeetSpllit />
              <Pricing />
              <FAQ />
              <Footer />
            </>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App