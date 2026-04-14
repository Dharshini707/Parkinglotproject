import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RiCheckLine, RiLoader4Line, RiCloseLine, RiParkingLine } from 'react-icons/ri'
import { format } from 'date-fns'
import api from '../services/api'

export default function PaymentSuccess() {
  const navigate         = useNavigate()
  const [params]         = useSearchParams()
  const [status, setStatus]   = useState('loading') // loading | success | error
  const [booking, setBooking] = useState(null)

  const sessionId = params.get('session_id')
  const bookingId = params.get('booking_id')

  useEffect(() => {
    if (!bookingId) { setStatus('error'); return }
    const verify = async () => {
      try {
        const res = await api.get(
          `/payments/verify?session_id=${sessionId || ''}&booking_id=${bookingId}`
        )
        setBooking(res.data.booking)
        setStatus('success')
      } catch {
        setStatus('error')
      }
    }
    verify()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity:0, scale:0.9 }}
        animate={{ opacity:1, scale:1 }}
        className="card max-w-md w-full text-center py-12"
      >

        {/* Loading */}
        {status === 'loading' && (
          <>
            <RiLoader4Line className="text-5xl text-brand-400 animate-spin mx-auto mb-4"/>
            <h2 className="font-display font-bold text-xl mb-2">Verifying payment...</h2>
            <p className="text-gray-500 text-sm">Please wait, do not close this page</p>
          </>
        )}

        {/* Success */}
        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale:0 }} animate={{ scale:1 }}
              transition={{ type:'spring', stiffness:200, delay:0.1 }}
              className="w-20 h-20 bg-brand-500/20 border-2 border-brand-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <RiCheckLine className="text-brand-400 text-4xl"/>
            </motion.div>

            <h2 className="font-display font-bold text-2xl mb-1">Payment Successful!</h2>
            <p className="text-gray-400 text-sm mb-6">Your parking slot is confirmed</p>

            <div className="glass rounded-xl p-4 text-left space-y-2.5 mb-6">
              {[
                ['Booking ID', `#${booking?._id?.slice(-8).toUpperCase()}`],
                ['Parking Lot', booking?.lot?.name],
                ['Spot',        booking?.spotNumber],
                ['Duration',    `${booking?.duration}h`],
                ['Amount Paid', `₹${booking?.totalAmount}`],
                ['Status',      booking?.status],
                ['Payment',     booking?.payment?.method === 'stripe' ? '💳 Stripe' : '✅ Confirmed'],
              ].map(([k,v]) => v && (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-mono text-white capitalize font-medium">{v}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate('/history')} className="btn-ghost">My Bookings</button>
              <button onClick={() => navigate('/map')} className="btn-primary">Find More Parking</button>
            </div>
          </>
        )}

        {/* Error */}
        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-500/20 border-2 border-red-500/40 rounded-full flex items-center justify-center mx-auto mb-6">
              <RiCloseLine className="text-red-400 text-4xl"/>
            </div>
            <h2 className="font-display font-bold text-xl mb-2">Verification Failed</h2>
            <p className="text-gray-500 text-sm mb-6">
              Could not verify your payment. Your booking may still be confirmed — check My Bookings.
            </p>
            <button onClick={() => navigate('/history')} className="btn-primary w-full">
              Check My Bookings
            </button>
          </>
        )}

      </motion.div>
    </div>
  )
}
