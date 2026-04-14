import { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RiParkingLine, RiMailLine, RiLockLine, RiEyeLine, RiEyeOffLine, RiLoader4Line } from 'react-icons/ri'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuthStore()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from || '/'

  const [form,    setForm]    = useState({ email: '', password: '' })
  const [showPw,  setShowPw]  = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch {
      // error toast handled in api.js
    } finally {
      setLoading(false)
    }
  }

  const demoLogin = async (role) => {
    setLoading(true)
    const creds = role === 'admin'
      ? { email: 'admin@parksmart.in', password: 'admin123' }
      : { email: 'demo@parksmart.in',  password: 'demo123'  }
    try {
      await login(creds.email, creds.password)
      toast.success(`Logged in as ${role}!`)
      navigate(role === 'admin' ? '/admin' : from, { replace: true })
    } catch {
      // Backend offline — create mock session so UI still works
      const mockUser = {
        _id: role === 'admin' ? 'admin-1' : 'user-1',
        name:  role === 'admin' ? 'Admin User'  : 'Demo Driver',
        email: role === 'admin' ? 'admin@parksmart.in' : 'demo@parksmart.in',
        role,
      }
      useAuthStore.setState({ user: mockUser, token: 'demo-token', isAuthenticated: true })
      toast.success(`Demo login as ${role}!`)
      navigate(role === 'admin' ? '/admin' : from, { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(20,179,113,1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,179,113,1) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }}/>
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-brand-500/8 rounded-full blur-3xl"/>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-blue/6 rounded-full blur-3xl animate-float"/>

      <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <NavLink to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(20,179,113,0.4)]">
              <RiParkingLine className="text-white text-2xl"/>
            </div>
            <span className="font-display font-bold text-2xl text-gradient">ParkSmart</span>
          </NavLink>
          <h1 className="font-display font-bold text-3xl mt-6 mb-2">Welcome back</h1>
          <p className="text-gray-500">Sign in to your account</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Email</label>
              <div className="relative">
                <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
                <input type="email" required value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com" className="input-field w-full pl-10"/>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Password</label>
              <div className="relative">
                <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
                <input type={showPw ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••" className="input-field w-full pl-10 pr-10"/>
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  {showPw ? <RiEyeOffLine/> : <RiEyeLine/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <><RiLoader4Line className="animate-spin"/> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-300/40"/>
            </div>
            <div className="relative text-center">
              <span className="bg-surface-100 px-3 text-xs text-gray-500 rounded">or try a demo account</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => demoLogin('user')} disabled={loading}
              className="btn-ghost text-sm flex items-center justify-center gap-1">
              👤 Demo User
            </button>
            <button onClick={() => demoLogin('admin')} disabled={loading}
              className="btn-ghost text-sm flex items-center justify-center gap-1">
              🔧 Demo Admin
            </button>
          </div>

          <p className="text-center text-gray-500 text-sm mt-5">
            Don't have an account?{' '}
            <NavLink to="/register" className="text-brand-400 hover:text-brand-300 font-medium">Sign up free</NavLink>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
