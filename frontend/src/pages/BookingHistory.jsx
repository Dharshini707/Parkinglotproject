import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import {
  RiParkingLine, RiTimeLine, RiCheckLine, RiCloseLine,
  RiSearchLine, RiLoader4Line, RiCalendarLine,
  RiMapPin2Line, RiBankCardLine, RiRefreshLine,
  RiCarLine, RiMoneyDollarCircleLine,
} from 'react-icons/ri'
import api   from '../services/api'
import toast from 'react-hot-toast'

const statusConfig = {
  confirmed: { bg:'bg-brand-500/20',  text:'text-brand-400',  border:'border-brand-500/30',  icon:RiCheckLine, label:'Confirmed' },
  active:    { bg:'bg-brand-500/20',  text:'text-brand-400',  border:'border-brand-500/30',  icon:RiTimeLine,  label:'Active'    },
  completed: { bg:'bg-surface-100',   text:'text-gray-400',   border:'border-surface-300',   icon:RiCheckLine, label:'Completed' },
  cancelled: { bg:'bg-red-500/10',    text:'text-red-400',    border:'border-red-500/20',    icon:RiCloseLine, label:'Cancelled' },
  pending:   { bg:'bg-yellow-500/10', text:'text-yellow-400', border:'border-yellow-500/20', icon:RiTimeLine,  label:'Pending'   },
}

const paymentBadge = (payment) => {
  if (!payment) return null
  if (payment.status === 'paid') {
    return (
      <span className="flex items-center gap-1 text-xs text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full">
        <RiBankCardLine />
        {payment.method === 'stripe' ? 'Paid via Stripe' : 'Payment confirmed'}
      </span>
    )
  }
  if (payment.status === 'pending') {
    return (
      <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full">
        ⏳ Payment pending
      </span>
    )
  }
  return null
}

export default function BookingHistory() {
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('all')
  const [search,   setSearch]   = useState('')

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const res = await api.get('/bookings')
      setBookings(res.data)
    } catch {
      toast.error('Could not load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBookings() }, [])

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return
    try {
      await api.patch(`/bookings/${bookingId}/cancel`)
      setBookings(prev => prev.map(b =>
        b._id === bookingId ? { ...b, status: 'cancelled' } : b
      ))
      toast.success('Booking cancelled')
    } catch {
      toast.error('Could not cancel booking')
    }
  }

  const filtered = bookings.filter(b => {
    if (filter !== 'all' && b.status !== filter) return false
    const lotName = b.lot?.name || ''
    const id      = b._id?.slice(-6).toUpperCase() || ''
    if (search &&
      !lotName.toLowerCase().includes(search.toLowerCase()) &&
      !id.includes(search.toUpperCase())) return false
    return true
  })

  const totalSpent = bookings
    .filter(b => b.status !== 'cancelled' && b.payment?.status === 'paid')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RiLoader4Line className="text-4xl text-brand-400 animate-spin mx-auto mb-3"/>
          <p className="text-gray-500">Loading your bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} className="mb-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="font-display font-bold text-3xl mb-1">My Bookings</h1>
              <p className="text-gray-400">
                <span className="text-white font-semibold">{bookings.length}</span> booking{bookings.length!==1?'s':''} •{' '}
                Total paid: <span className="text-brand-400 font-mono font-semibold">₹{totalSpent}</span>
              </p>
            </div>
            <button onClick={fetchBookings}
              className="glass p-2.5 rounded-xl text-gray-400 hover:text-white transition-all"
              title="Refresh">
              <RiRefreshLine className="text-xl"/>
            </button>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
            {[
              { label:'Total Slots Booked', value: bookings.length, color:'text-brand-400', bg:'bg-brand-500/10 border-brand-500/20' },
              { label:'Confirmed / Active', value: bookings.filter(b=>['confirmed','active'].includes(b.status)).length, color:'text-green-400', bg:'bg-green-500/10 border-green-500/20' },
              { label:'Completed',          value: bookings.filter(b=>b.status==='completed').length, color:'text-gray-300', bg:'bg-white/5 border-white/10' },
              { label:'Total Spent',        value: `₹${totalSpent}`, color:'text-brand-400', bg:'bg-brand-500/10 border-brand-500/20' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`rounded-xl border p-4 text-center ${bg}`}>
                <p className={`font-mono font-bold text-xl ${color}`}>{value}</p>
                <p className="text-gray-500 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
            <input className="input-field w-full pl-10"
              placeholder="Search by lot name or booking ID..."
              value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all','confirmed','active','completed','cancelled'].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-2 rounded-xl text-sm capitalize transition-all ${
                  filter===s ? 'bg-brand-500 text-white' : 'glass text-gray-400 hover:text-white'
                }`}>{s}</button>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="card text-center py-16">
            <RiParkingLine className="text-5xl text-gray-600 mx-auto mb-4"/>
            <h3 className="font-display font-semibold text-lg mb-2">
              {bookings.length === 0 ? 'No bookings yet' : 'No bookings match your filter'}
            </h3>
            <p className="text-gray-500 text-sm">
              {bookings.length === 0
                ? 'After you book and pay for a parking slot, it will appear here.'
                : 'Try a different filter or search term.'}
            </p>
          </div>
        )}

        {/* Booking cards */}
        <div className="space-y-4">
          {filtered.map((b, i) => {
            const cfg       = statusConfig[b.status] || statusConfig.pending
            const Icon      = cfg.icon
            const lotName   = b.lot?.name    || 'Parking Lot'
            const lotAddr   = b.lot?.address || ''
            const shortId   = b._id?.slice(-8).toUpperCase()
            const canCancel = ['confirmed','active','pending'].includes(b.status)

            return (
              <motion.div key={b._id}
                initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
                transition={{delay: i*0.06}}
                className={`card border ${
                  b.status==='confirmed'||b.status==='active' ? 'border-brand-500/30' : ''
                }`}
              >
                <div className="flex items-start justify-between flex-wrap gap-4">

                  {/* Left */}
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${cfg.bg} border ${cfg.border} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`${cfg.text} text-xl`}/>
                    </div>
                    <div>
                      {/* Name + status */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-display font-semibold">{lotName}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                          {cfg.label}
                        </span>
                      </div>

                      {/* Spot + vehicle */}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-mono font-bold px-3 py-1 rounded-lg">
                          <RiParkingLine className="text-brand-400"/> Slot {b.spotNumber}
                        </span>
                        {b.vehiclePlate && (
                          <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-gray-300 text-xs font-mono px-3 py-1 rounded-lg">
                            <RiCarLine/> {b.vehiclePlate}
                          </span>
                        )}
                      </div>

                      {/* Address */}
                      {lotAddr && (
                        <p className="text-gray-600 text-xs flex items-center gap-1 mt-0.5">
                          <RiMapPin2Line/> {lotAddr}
                        </p>
                      )}

                      {/* Date + time */}
                      <div className="flex gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <RiCalendarLine/>
                          {format(new Date(b.startTime), 'MMM dd, yyyy')}
                        </span>
                        <span>
                          🕐 {format(new Date(b.startTime),'hh:mm a')} – {format(new Date(b.endTime),'hh:mm a')}
                        </span>
                        <span>{b.duration}h</span>
                      </div>

                      {/* Payment badge */}
                      <div className="mt-2">
                        {paymentBadge(b.payment)}
                      </div>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="text-right flex flex-col items-end gap-1">
                    <div className="font-mono font-bold text-xl text-gradient">₹{b.totalAmount}</div>
                    <div className="text-xs text-gray-500 font-mono">#{shortId}</div>
                    {canCancel && (
                      <button onClick={() => handleCancel(b._id)}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors mt-1">
                        Cancel booking
                      </button>
                    )}
                  </div>

                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
