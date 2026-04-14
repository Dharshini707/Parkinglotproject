import { useState } from 'react'
import { motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import {
  RiParkingLine, RiTimeLine, RiMoneyDollarCircleLine,
  RiMapPin2Line, RiArrowRightLine, RiCarLine,
  RiCalendarLine, RiCheckLine
} from 'react-icons/ri'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const spendingData = [
  { month: 'Jan', amount: 280 }, { month: 'Feb', amount: 420 },
  { month: 'Mar', amount: 180 }, { month: 'Apr', amount: 560 },
  { month: 'May', amount: 340 }, { month: 'Jun', amount: 680 },
]

const recentBookings = [
  { id: 'PK001A', lot: 'Central Park Garage', spot: 'A12', date: 'Today, 09:00 AM', duration: '2h', amount: 80,  status: 'active' },
  { id: 'PK002B', lot: 'Metro Station Parking', spot: 'B05', date: 'Yesterday, 2:30 PM', duration: '3h', amount: 75,  status: 'completed' },
  { id: 'PK003C', lot: 'IT Hub Smart Parking',  spot: 'C18', date: 'Dec 10, 11:00 AM',  duration: '4h', amount: 140, status: 'completed' },
]

const stats = [
  { label: 'Total Bookings', value: '740',    icon: RiCalendarLine,         color: 'brand' },
  { label: 'Hours Parked',   value: '86h',   icon: RiTimeLine,             color: 'blue' },
  { label: 'Total Spent',    value: '₹2,840', icon: RiMoneyDollarCircleLine, color: 'yellow' },
  { label: 'Lots Visited',   value: '8',     icon: RiMapPin2Line,          color: 'brand' },
]

const colorMap = {
  brand:  'from-brand-500/20 to-brand-900/5 border-brand-500/20 text-brand-400',
  blue:   'from-accent-blue/20 to-blue-900/5 border-accent-blue/20 text-accent-blue',
  yellow: 'from-accent-yellow/20 to-yellow-900/5 border-accent-yellow/20 text-accent-yellow',
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const [activeBooking] = useState(recentBookings[0])

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display font-bold text-3xl">
            Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0] || 'Driver'}</span>
          </h1>
          <p className="text-gray-400 mt-1">Here's your parking overview</p>
        </motion.div>

        {/* Active Booking Banner */}
        {activeBooking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-5 mb-6 border border-brand-500/30 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-brand-900/20 to-transparent" />
            <div className="relative flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-500/20 border border-brand-500/40 rounded-2xl flex items-center justify-center">
                  <RiCarLine className="text-brand-400 text-2xl" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
                    <span className="text-brand-400 text-sm font-medium">Active Booking</span>
                  </div>
                  <p className="font-display font-semibold">{activeBooking.lot}</p>
                  <p className="text-gray-400 text-sm">Spot {activeBooking.spot} • Expires in 1h 24m</p>
                </div>
              </div>
              <NavLink to="/history" className="btn-ghost flex items-center gap-2 text-sm">
                View Details <RiArrowRightLine />
              </NavLink>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map(({ label, value, icon: Icon, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`card bg-gradient-to-br ${colorMap[color]} border`}
            >
              <Icon className={`text-2xl mb-3 ${colorMap[color].split(' ').find(c => c.startsWith('text-'))}`} />
              <div className="font-display font-bold text-2xl">{value}</div>
              <div className="text-gray-500 text-sm mt-1">{label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Spending chart */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="card">
            <h3 className="font-display font-semibold mb-4">Monthly Spending</h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={spendingData}>
                <defs>
                  <linearGradient id="spend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#14b371" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b371" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                <Tooltip
                  contentStyle={{ background: 'rgba(20,40,32,0.9)', border: '1px solid rgba(20,179,113,0.2)', borderRadius: '12px', color: '#fff' }}
                  formatter={v => [`₹${v}`, 'Spent']}
                />
                <Area type="monotone" dataKey="amount" stroke="#14b371" strokeWidth={2} fill="url(#spend)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Recent Bookings */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-semibold">Recent Bookings</h3>
              <NavLink to="/history" className="text-brand-400 text-sm hover:text-brand-300">View all</NavLink>
            </div>
            <div className="space-y-3">
              {recentBookings.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-3 py-3 border-b border-surface-300/20 last:border-0"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    b.status === 'active' ? 'bg-brand-500/20 border border-brand-500/40' : 'bg-surface-100 border border-surface-300'
                  }`}>
                    {b.status === 'active' ? <RiCarLine className="text-brand-400 text-sm" /> : <RiCheckLine className="text-gray-500 text-sm" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{b.lot}</p>
                    <p className="text-xs text-gray-500">{b.date} • {b.duration}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-mono font-medium">₹{b.amount}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      b.status === 'active' ? 'bg-brand-500/20 text-brand-400' : 'bg-surface-100 text-gray-500'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6 grid sm:grid-cols-2 gap-4">
          <NavLink to="/map" className="card flex items-center gap-4 hover:border-brand-500/40 group">
            <div className="w-12 h-12 bg-brand-500/10 border border-brand-500/20 rounded-2xl flex items-center justify-center group-hover:bg-brand-500/20 transition-all">
              <RiMapPin2Line className="text-brand-400 text-2xl" />
            </div>
            <div>
              <p className="font-display font-semibold">Find Parking</p>
              <p className="text-gray-500 text-sm">Browse available spots near you</p>
            </div>
            <RiArrowRightLine className="ml-auto text-gray-600 group-hover:text-brand-400 transition-colors" />
          </NavLink>
          <NavLink to="/history" className="card flex items-center gap-4 hover:border-brand-500/40 group">
            <div className="w-12 h-12 bg-brand-500/10 border border-brand-500/20 rounded-2xl flex items-center justify-center group-hover:bg-brand-500/20 transition-all">
              <RiTimeLine className="text-brand-400 text-2xl" />
            </div>
            <div>
              <p className="font-display font-semibold">Booking History</p>
              <p className="text-gray-500 text-sm">View all past and upcoming bookings</p>
            </div>
            <RiArrowRightLine className="ml-auto text-gray-600 group-hover:text-brand-400 transition-colors" />
          </NavLink>
        </motion.div>
      </div>
    </div>
  )
}
