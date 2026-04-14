import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './stores/authStore'

import Layout         from './components/ui/Layout'
import Home           from './pages/Home'
import MapPage        from './pages/MapPage'
import BookingPage    from './pages/BookingPage'
import Dashboard      from './pages/Dashboard'
import AdminPage      from './pages/AdminPage'
import LoginPage      from './pages/LoginPage'
import RegisterPage   from './pages/RegisterPage'
import BookingHistory from './pages/BookingHistory'
import ProfilePage    from './pages/ProfilePage'
import SettingsPage   from './pages/SettingsPage'
import PaymentSuccess from './pages/PaymentSuccess'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAuthenticated } = useAuthStore()
  const location = useLocation()
  if (!isAuthenticated)
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  if (adminOnly && user?.role !== 'admin')
    return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: 'rgba(20,40,32,0.95)', color: '#fff',
          border: '1px solid rgba(20,179,113,0.3)', borderRadius: '12px',
          backdropFilter: 'blur(16px)', fontFamily: '"DM Sans", sans-serif',
        },
        success: { iconTheme: { primary: '#14b371', secondary: '#fff' } },
        error:   { iconTheme: { primary: '#f54242', secondary: '#fff' } },
      }}/>
      <Routes>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<Layout />}>
          <Route path="/"    element={<Home />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/book/:lotId"     element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
          <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/dashboard"       element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/history"         element={<ProtectedRoute><BookingHistory /></ProtectedRoute>} />
          <Route path="/profile"         element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings"        element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/admin"           element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
        </Route>
      </Routes>
    </>
  )
}
