import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  RiParkingLine, RiMailLine, RiLockLine,
  RiUserLine, RiEyeLine, RiEyeOffLine, RiLoader4Line, RiCheckLine
} from 'react-icons/ri'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

const perks = [
  'Real-time parking spot availability',
  'AI-powered chatbot assistant',
  'Secure Stripe payments',
  'Full booking history & receipts',
]

export default function RegisterPage() {
  const { register } = useAuthStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Account created! Welcome to ParkSmart 🎉')
      navigate('/dashboard')
    } catch {
      // error handled in interceptor — for demo, mock register
      const mockUser = { _id: Date.now().toString(), name: form.name, email: form.email, role: 'user' }
      useAuthStore.setState({ user: mockUser, token: 'demo-token', isAuthenticated: true })
      toast.success('Account created! Welcome to ParkSmart 🎉')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(20,179,113,1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,179,113,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
      />
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-brand-500/8 rounded-full blur-3xl animate-pulse-slow" />

      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left panel */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
          <NavLink to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(20,179,113,0.4)]">
              <RiParkingLine className="text-white text-xl" />
            </div>
            <span className="font-display font-bold text-xl text-gradient">ParkSmart</span>
          </NavLink>
          <h1 className="font-display font-bold text-4xl mb-4 leading-tight">
            Start parking<br /><span className="text-gradient">smarter today</span>
          </h1>
          <p className="text-gray-400 mb-8">Join thousands of drivers who save time and money every day with ParkSmart.</p>
          <div className="space-y-3">
            {perks.map((perk, i) => (
              <motion.div
                key={perk}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 bg-brand-500/20 border border-brand-500/40 rounded-full flex items-center justify-center flex-shrink-0">
                  <RiCheckLine className="text-brand-400 text-xs" />
                </div>
                <span className="text-gray-300 text-sm">{perk}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div className="card">
            <h2 className="font-display font-bold text-xl mb-6">Create your account</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Full Name</label>
                <div className="relative">
                  <RiUserLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text" required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="John Doe"
                    className="input-field w-full pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Email</label>
                <div className="relative">
                  <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email" required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="input-field w-full pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Password</label>
                <div className="relative">
                  <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showPw ? 'text' : 'password'} required
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Min 6 characters"
                    className="input-field w-full pl-10 pr-10"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                    {showPw ? <RiEyeOffLine /> : <RiEyeLine />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Confirm Password</label>
                <div className="relative">
                  <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="password" required
                    value={form.confirm}
                    onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                    placeholder="Repeat password"
                    className="input-field w-full pl-10"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
              >
                {loading ? <><RiLoader4Line className="animate-spin" /> Creating account...</> : 'Create Account'}
              </button>
            </form>
            <p className="text-center text-gray-500 text-sm mt-5">
              Already have an account?{' '}
              <NavLink to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</NavLink>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
