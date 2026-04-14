import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import Chatbot from '../chat/Chatbot'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '../../stores/authStore'
import {
  RiParkingLine, RiMapPin2Line, RiDashboardLine,
  RiHistoryLine, RiSettings4Line, RiMenuLine,
  RiCloseLine, RiLogoutBoxLine, RiUserLine,
  RiUserSettingsLine, RiArrowDownSLine
} from 'react-icons/ri'

const navItems = [
  { to: '/',          icon: RiParkingLine,   label: 'Home' },
  { to: '/map',       icon: RiMapPin2Line,   label: 'Find Parking' },
  { to: '/dashboard', icon: RiDashboardLine, label: 'Dashboard' },
  { to: '/history',   icon: RiHistoryLine,   label: 'My Bookings' },
]

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [scrolled,     setScrolled]     = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    navigate('/login')
  }

  const avatar = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-dark shadow-lg shadow-black/20' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center
                              group-hover:shadow-[0_0_20px_rgba(20,179,113,0.5)] transition-all duration-300">
                <RiParkingLine className="text-white text-xl" />
              </div>
              <span className="font-display font-bold text-xl text-gradient">ParkSmart</span>
            </NavLink>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to} end={to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-surface-100'
                    }`
                  }>
                  <Icon className="text-base" /> {label}
                </NavLink>
              ))}
              {user?.role === 'admin' && (
                <NavLink to="/admin"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/30'
                        : 'text-gray-400 hover:text-white hover:bg-surface-100'
                    }`
                  }>
                  <RiSettings4Line className="text-base" /> Admin
                </NavLink>
              )}
            </nav>

            {/* Auth */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  {/* Avatar button */}
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 glass rounded-xl
                               hover:bg-surface-100 transition-all duration-200">
                    <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center
                                    text-white text-xs font-bold">
                      {avatar}
                    </div>
                    <span className="text-sm text-gray-300">{user?.name?.split(' ')[0]}</span>
                    <RiArrowDownSLine className={`text-gray-400 transition-transform duration-200 ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {/* Dropdown menu */}
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0,  scale: 1    }}
                        exit={{    opacity: 0, y: 8, scale: 0.95  }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-48 glass-dark rounded-2xl
                                   border border-surface-300/30 shadow-xl overflow-hidden z-50"
                      >
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-surface-300/30">
                          <p className="text-sm font-medium text-white">{user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>

                        {/* Links */}
                        <div className="py-1">
                          <NavLink to="/profile" onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300
                                       hover:text-white hover:bg-surface-100 transition-colors">
                            <RiUserLine className="text-brand-400" /> My Profile
                          </NavLink>
                          <NavLink to="/settings" onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300
                                       hover:text-white hover:bg-surface-100 transition-colors">
                            <RiUserSettingsLine className="text-brand-400" /> Settings
                          </NavLink>
                        </div>

                        {/* Logout */}
                        <div className="border-t border-surface-300/30 py-1">
                          <button onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                                       text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                            <RiLogoutBoxLine /> Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <NavLink to="/login"    className="btn-ghost !py-2 text-sm">Sign In</NavLink>
                  <NavLink to="/register" className="btn-primary !py-2 text-sm">Get Started</NavLink>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button className="md:hidden text-gray-400 hover:text-white p-2"
              onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <RiCloseLine className="text-2xl" /> : <RiMenuLine className="text-2xl" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{    opacity: 0, height: 0    }}
              className="md:hidden glass-dark border-t border-brand-900/30"
            >
              <div className="px-4 py-4 space-y-1">
                {navItems.map(({ to, icon: Icon, label }) => (
                  <NavLink key={to} to={to} end={to === '/'}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive ? 'bg-brand-500/20 text-brand-400' : 'text-gray-400'
                      }`
                    }>
                    <Icon className="text-lg" /> {label}
                  </NavLink>
                ))}

                {/* Profile & Settings in mobile */}
                {isAuthenticated && (
                  <>
                    <NavLink to="/profile" onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          isActive ? 'bg-brand-500/20 text-brand-400' : 'text-gray-400'
                        }`
                      }>
                      <RiUserLine className="text-lg" /> Profile
                    </NavLink>
                    <NavLink to="/settings" onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          isActive ? 'bg-brand-500/20 text-brand-400' : 'text-gray-400'
                        }`
                      }>
                      <RiSettings4Line className="text-lg" /> Settings
                    </NavLink>
                  </>
                )}

                <div className="pt-2 border-t border-surface-300 flex flex-col gap-2">
                  {isAuthenticated ? (
                    <button onClick={handleLogout} className="btn-ghost w-full text-sm">Logout</button>
                  ) : (
                    <>
                      <NavLink to="/login"    onClick={() => setMobileOpen(false)} className="btn-ghost text-sm text-center">Sign In</NavLink>
                      <NavLink to="/register" onClick={() => setMobileOpen(false)} className="btn-primary text-sm text-center">Get Started</NavLink>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      <Chatbot />

      <footer className="glass-dark border-t border-surface-300/30 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <RiParkingLine className="text-brand-500 text-xl" />
            <span className="font-display font-semibold text-gradient">ParkSmart</span>
          </div>
          <p className="text-gray-500 text-sm">© 2025 ParkSmart. Smart Parking Management System.</p>
        </div>
      </footer>
    </div>
  )
}
