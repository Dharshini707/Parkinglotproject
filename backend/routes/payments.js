import express     from 'express'
import Stripe      from 'stripe'
import Booking     from '../models/Booking.js'
import ParkingLot  from '../models/ParkingLot.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Stripe v18: pass apiVersion explicitly for stable behavior
const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key || key.includes('PASTE') || key.includes('your_stripe')) return null
  return new Stripe(key, {
    apiVersion: '2025-04-30.basil', // Latest stable Stripe API version (v18 SDK)
  })
}

// ── Helper: mark booking as paid and update spot to reserved ─────────────────
const confirmBookingPaid = async (bookingId, method, stripeSessionId, stripePaymentId, io) => {
  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    {
      status:                    'confirmed',
      'payment.status':          'paid',
      'payment.method':          method,
      'payment.paidAt':          new Date(),
      ...(stripeSessionId && { 'payment.stripeSessionId': stripeSessionId }),
      ...(stripePaymentId && { 'payment.stripePaymentId': stripePaymentId }),
    },
    { new: true }
  ).populate('lot', 'name address pricePerHour')

  if (!booking) return null

  // Ensure spot is reserved in lot
  const lot = await ParkingLot.findById(booking.lot?._id || booking.lot)
  if (lot) {
    const spot = lot.spots.id(booking.spotId)
    if (spot && spot.status !== 'reserved') {
      spot.status         = 'reserved'
      spot.currentBooking = booking._id
      lot.recalculateAvailable()
      await lot.save()
    }
    // Emit real-time update so map refreshes
    io?.to(`lot-${lot._id}`).emit('spot-update', {
      lotId:          lot._id,
      spotId:         booking.spotId,
      status:         'reserved',
      availableSpots: lot.availableSpots,
    })
  }

  return booking
}

// ── POST /api/payments/create-session ────────────────────────────────────────
router.post('/create-session', protect, async (req, res) => {
  try {
    const { bookingId } = req.body
    const booking = await Booking.findOne({ _id: bookingId, user: req.user._id })
      .populate('lot', 'name address')
    if (!booking) return res.status(404).json({ message: 'Booking not found' })

    const stripe = getStripe()
    const io     = req.app.get('io')

    // ── Demo mode: no Stripe key → auto-confirm immediately ──────────────
    if (!stripe) {
      const confirmed = await confirmBookingPaid(bookingId, 'cash', null, null, io)
      return res.json({ mode: 'auto', confirmed: true, booking: confirmed })
    }

    // ── Stripe mode: create hosted checkout session ───────────────────────
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode:                 'payment',
      client_reference_id:  bookingId,
      metadata: {
        bookingId: bookingId.toString(),
        userId:    req.user._id.toString(),
      },
      line_items: [{
        price_data: {
          currency: 'inr',
          product_data: {
            name:        `Parking — ${booking.lot?.name || 'Parking Lot'}`,
            description: `Spot ${booking.spotNumber} • ${booking.duration}h`,
          },
          unit_amount: Math.round(booking.totalAmount * 100), // paise
        },
        quantity: 1,
      }],
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
      cancel_url:  `${process.env.CLIENT_URL}/book/${booking.lot?._id}?cancelled=true`,
    })

    // Save Stripe session ID to booking so we can verify later
    await Booking.findByIdAndUpdate(bookingId, {
      'payment.stripeSessionId': session.id,
    })

    res.json({ mode: 'stripe', sessionId: session.id, url: session.url })
  } catch (err) {
    console.error('Payment error:', err)
    res.status(500).json({ message: err.message })
  }
})

// ── GET /api/payments/verify ──────────────────────────────────────────────────
// Called by PaymentSuccess page after Stripe redirects user back
// Verifies payment with Stripe, marks booking as paid, confirms spot reserved
router.get('/verify', protect, async (req, res) => {
  try {
    const { session_id, booking_id } = req.query
    if (!booking_id) return res.status(400).json({ message: 'booking_id is required' })

    const stripe = getStripe()
    const io     = req.app.get('io')

    // ── Demo mode: no Stripe, just confirm ───────────────────────────────
    if (!stripe) {
      const booking = await confirmBookingPaid(booking_id, 'cash', null, null, io)
      if (!booking) return res.status(404).json({ message: 'Booking not found' })
      return res.json({ confirmed: true, booking })
    }

    // ── Stripe mode: verify session with Stripe API ───────────────────────
    if (!session_id) return res.status(400).json({ message: 'session_id is required' })

    const session = await stripe.checkout.sessions.retrieve(session_id)

    // Check payment was actually completed
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not yet completed' })
    }

    // Confirm booking as paid in DB
    const booking = await confirmBookingPaid(
      booking_id,
      'stripe',
      session_id,
      session.payment_intent,
      io
    )
    if (!booking) return res.status(404).json({ message: 'Booking not found' })

    res.json({ confirmed: true, booking })
  } catch (err) {
    console.error('Verify error:', err)
    res.status(500).json({ message: err.message })
  }
})

// ── Stripe webhook handler ─────────────────────────────────────────────────
export const stripeWebhookHandler = async (req, res) => {
  const stripe = getStripe()
  if (!stripe) return res.json({ received: true })

  const sig    = req.headers['stripe-signature']
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) return res.json({ received: true })

  let event
  try {
    event = await stripe.webhooks.constructEventAsync(req.body, sig, secret)
  } catch (err) {
    console.error('Webhook signature error:', err.message)
    return res.status(400).json({ message: `Webhook Error: ${err.message}` })
  }

  if (event.type === 'checkout.session.completed') {
    const session   = event.data.object
    const bookingId = session.metadata?.bookingId
    if (bookingId) {
      const io = req.app?.get('io')
      await confirmBookingPaid(bookingId, 'stripe', session.id, session.payment_intent, io)
      console.log(`✅ Webhook confirmed booking ${bookingId}`)
    }
  }

  res.json({ received: true })
}

// ── POST /api/payments/webhook ────────────────────────────────────────────────
// Stripe sends this as backup when checkout.session.completed fires
// Handles cases where user closes browser before /verify runs
router.post('/webhook', stripeWebhookHandler)

export default router
