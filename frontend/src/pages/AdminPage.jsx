import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  RiParkingLine, RiCarLine, RiMoneyDollarCircleLine, RiUserLine,
  RiAddLine, RiEditLine, RiDeleteBinLine, RiCheckLine, RiCloseLine,
  RiRefreshLine, RiSettings4Line
} from 'react-icons/ri'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from 'recharts'

const revenueData = [
  { day: 'Mon', revenue: 4200, bookings: 38 },
  { day: 'Tue', revenue: 5800, bookings: 52 },
  { day: 'Wed', revenue: 3900, bookings: 34 },
  { day: 'Thu', revenue: 7200, bookings: 65 },
  { day: 'Fri', revenue: 9100, bookings: 82 },
  { day: 'Sat', revenue: 11400, bookings: 103 },
  { day: 'Sun', revenue: 8600, bookings: 78 },
]

const LOTS = [
  { _id: '1', name: 'Central Park Garage',     total: 50, available: 12, revenue: 18400, status: 'active' },
  { _id: '2', name: 'Metro Station Parking',   total: 30, available: 3,  revenue: 9200,  status: 'active' },
  { _id: '3', name: 'Mall Basement Parking',   total: 80, available: 0,  revenue: 34600, status: 'active' },
  { _id: '4', name: 'IT Hub Smart Parking',    total: 60, available: 25, revenue: 22100, status: 'active' },
  { _id: '5', name: 'Old City Parking Zone',   total: 40, available: 8,  revenue: 7800,  status: 'maintenance' },
]

const USERS = [
  { _id: '1', name: 'Arjun Sharma',  email: 'arjun@mail.com',  bookings: 14, spent: 2840, role: 'user',  joined: '2024-08-12' },
  { _id: '2', name: 'Priya Nair',    email: 'priya@mail.com',  bookings: 8,  spent: 1620, role: 'user',  joined: '2024-09-22' },
  { _id: '3', name: 'Rahul Verma',   email: 'rahul@mail.com',  bookings: 22, spent: 5100, role: 'admin', joined: '2024-07-01' },
  { _id: '4', name: 'Meera Pillai',  email: 'meera@mail.com',  bookings: 5,  spent: 980,  role: 'user',  joined: '2024-11-05' },
]

const adminStats = [
  { label: 'Total Lots',    value: '12',     icon: RiParkingLine,           color: 'brand' },
  { label: 'Active Users',  value: '1,284',  icon: RiUserLine,              color: 'blue' },
  { label: "Today's Rev",   value: '₹9,100', icon: RiMoneyDollarCircleLine, color: 'yellow' },
  { label: 'Live Bookings', value: '48',     icon: RiCarLine,               color: 'brand' },
]

const colorMap = {
  brand:  'text-brand-400 bg-brand-500/10 border-brand-500/20',
  blue:   'text-accent-blue bg-accent-blue/10 border-accent-blue/20',
  yellow: 'text-accent-yellow bg-accent-yellow/10 border-accent-yellow/20',
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [editingLot, setEditingLot] = useState(null)

  const tabs = ['overview', 'lots', 'users', 'settings']

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl">Admin Dashboard</h1>
            <p className="text-gray-400 mt-1">Manage your parking network</p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <RiAddLine /> Add Parking Lot
          </button>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-surface-300/30 pb-0">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-5 py-3 capitalize text-sm font-medium transition-all border-b-2 -mb-px ${
                activeTab === t
                  ? 'border-brand-500 text-brand-400'
                  : 'border-transparent text-gray-500 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {adminStats.map(({ label, value, icon: Icon, color }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`card border ${colorMap[color].split(' ').slice(1).join(' ')}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorMap[color]}`}>
                    <Icon className="text-xl" />
                  </div>
                  <div className="font-display font-bold text-2xl">{value}</div>
                  <div className="text-gray-500 text-sm mt-1">{label}</div>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <div className="card">
                <h3 className="font-display font-semibold mb-4">Weekly Revenue (₹)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={revenueData}>
                    <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
                    <Tooltip
                      contentStyle={{ background: 'rgba(20,40,32,0.9)', border: '1px solid rgba(20,179,113,0.2)', borderRadius: '12px', color: '#fff' }}
                      formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#14b371" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card">
                <h3 className="font-display font-semibold mb-4">Daily Bookings</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: 'rgba(20,40,32,0.9)', border: '1px solid rgba(20,179,113,0.2)', borderRadius: '12px', color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="bookings" stroke="#42c5f5" strokeWidth={2} dot={{ fill: '#42c5f5', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Lot occupancy */}
            <div className="card">
              <h3 className="font-display font-semibold mb-4">Lot Occupancy Overview</h3>
              <div className="space-y-4">
                {LOTS.map(lot => {
                  const pct = Math.round(((lot.total - lot.available) / lot.total) * 100)
                  return (
                    <div key={lot._id}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{lot.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">{lot.total - lot.available}/{lot.total} occupied</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            lot.status === 'maintenance' ? 'bg-accent-yellow/20 text-accent-yellow' : 'bg-brand-500/20 text-brand-400'
                          }`}>{lot.status}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-surface-300 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: pct >= 90 ? '#f54242' : pct >= 60 ? '#f5e642' : '#14b371' }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Lots Management */}
        {activeTab === 'lots' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-300/30">
                    {['Lot Name', 'Availability', 'Revenue', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-300/20">
                  {LOTS.map((lot, i) => (
                    <motion.tr
                      key={lot._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="hover:bg-surface-50/30 transition-colors"
                    >
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-brand-500/10 border border-brand-500/20 rounded-lg flex items-center justify-center">
                            <RiParkingLine className="text-brand-400 text-sm" />
                          </div>
                          <span className="font-medium text-sm">{lot.name}</span>
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <div>
                          <span className={`text-sm font-mono font-medium ${
                            lot.available === 0 ? 'text-accent-red' :
                            lot.available < 5  ? 'text-accent-yellow' : 'text-brand-400'
                          }`}>{lot.available}</span>
                          <span className="text-gray-600 text-sm"> / {lot.total}</span>
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="text-sm font-mono">₹{lot.revenue.toLocaleString()}</span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          lot.status === 'maintenance'
                            ? 'bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/20'
                            : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                        }`}>{lot.status}</span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 glass rounded-lg text-gray-400 hover:text-brand-400 transition-colors">
                            <RiEditLine className="text-sm" />
                          </button>
                          <button className="p-1.5 glass rounded-lg text-gray-400 hover:text-accent-red transition-colors">
                            <RiDeleteBinLine className="text-sm" />
                          </button>
                          <button className="p-1.5 glass rounded-lg text-gray-400 hover:text-accent-blue transition-colors">
                            <RiRefreshLine className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Users Management */}
        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-300/30">
                    {['User', 'Bookings', 'Total Spent', 'Role', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-300/20">
                  {USERS.map((u, i) => (
                    <motion.tr
                      key={u._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="hover:bg-surface-50/30 transition-colors"
                    >
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-brand-500/20 border border-brand-500/30 rounded-full flex items-center justify-center">
                            <span className="text-brand-400 text-sm font-bold">{u.name[0]}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{u.name}</p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4"><span className="text-sm font-mono">{u.bookings}</span></td>
                      <td className="py-4 pr-4"><span className="text-sm font-mono text-brand-400">₹{u.spent.toLocaleString()}</span></td>
                      <td className="py-4 pr-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          u.role === 'admin'
                            ? 'bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/20'
                            : 'bg-surface-100 text-gray-400 border border-surface-300'
                        }`}>{u.role}</span>
                      </td>
                      <td className="py-4 pr-4"><span className="text-sm text-gray-400">{u.joined}</span></td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <button className="p-1.5 glass rounded-lg text-gray-400 hover:text-brand-400 transition-colors"><RiEditLine className="text-sm" /></button>
                          <button className="p-1.5 glass rounded-lg text-gray-400 hover:text-accent-red transition-colors"><RiDeleteBinLine className="text-sm" /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'Pricing Rules', fields: [
                  { label: 'Base Rate (₹/hr)', type: 'number', value: '30' },
                  { label: 'Weekend Surcharge (%)', type: 'number', value: '20' },
                  { label: 'EV Spot Premium (₹/hr)', type: 'number', value: '10' },
                ]},
              { title: 'Notifications', fields: [
                  { label: 'Low Availability Alert (%)', type: 'number', value: '10' },
                  { label: 'Admin Email', type: 'email', value: 'admin@parksmart.in' },
                ]},
            ].map(({ title, fields }) => (
              <div key={title} className="card">
                <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <RiSettings4Line className="text-brand-400" /> {title}
                </h3>
                <div className="space-y-4">
                  {fields.map(f => (
                    <div key={f.label}>
                      <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
                      <input type={f.type} defaultValue={f.value} className="input-field w-full" />
                    </div>
                  ))}
                  <button className="btn-primary w-full mt-2">Save Changes</button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
