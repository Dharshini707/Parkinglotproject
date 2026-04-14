import express    from 'express'
import Booking    from '../models/Booking.js'
import ParkingLot from '../models/ParkingLot.js'

const router = express.Router()

// ── GET /api/bookings — all bookings for logged-in user ──────────────────────
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('lot', 'name address pricePerHour')
      .sort({ createdAt: -1 })
    res.json(bookings)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── POST /api/bookings — create a new booking ────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { lotId, spotId, startTime, endTime, duration, vehiclePlate } = req.body

    const lot = await ParkingLot.findById(lotId)
    if (!lot) return res.status(404).json({ message: 'Lot not found' })

    const spot = lot.spots.id(spotId)
    if (!spot)                        return res.status(404).json({ message: 'Spot not found' })
    if (spot.status !== 'available')  return res.status(400).json({ message: 'Spot is no longer available' })

    const totalAmount = duration * lot.pricePerHour

    // Booking is created with status 'confirmed' and payment 'pending'
    // Payment route will update payment.status to 'paid' after Stripe completes
    const booking = await Booking.create({
      user:         req.user._id,
      lot:          lotId,
      spotId,
      spotNumber:   spot.number,
      startTime,
      endTime,
      duration,
      totalAmount,
      vehiclePlate: vehiclePlate || '',
      status:       'confirmed',
      payment: {
        status: 'pending',
        method: undefined,
        paidAt: undefined,
      },
    })

    // Mark spot as reserved immediately so no one else can book it
    spot.status         = 'reserved'
    spot.currentBooking = booking._id
    lot.recalculateAvailable()
    await lot.save()

    // Emit real-time update to map
    const io = req.app.get('io')
    io?.to(`lot-${lotId}`).emit('spot-update', {
      lotId,
      spotId,
      status:         'reserved',
      availableSpots: lot.availableSpots,
    })

    res.status(201).json(booking)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── GET /api/bookings/:id ────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id })
      .populate('lot', 'name address pricePerHour')
    if (!booking) return res.status(404).json({ message: 'Booking not found' })
    res.json(booking)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── PATCH /api/bookings/:id/cancel ───────────────────────────────────────────
router.patch('/:id/cancel', async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id })
    if (!booking) return res.status(404).json({ message: 'Booking not found' })
    if (['cancelled', 'completed'].includes(booking.status))
      return res.status(400).json({ message: 'Booking cannot be cancelled' })

    booking.status             = 'cancelled'
    booking.cancellationReason = req.body.reason || 'User cancelled'
    booking.cancelledAt        = new Date()
    await booking.save()

    // Free the spot so others can book it
    const lot = await ParkingLot.findById(booking.lot)
    if (lot) {
      const spot = lot.spots.id(booking.spotId)
      if (spot) {
        spot.status         = 'available'
        spot.currentBooking = null
      }
      lot.recalculateAvailable()
      await lot.save()

      const io = req.app.get('io')
      io?.to(`lot-${booking.lot}`).emit('spot-update', {
        lotId:          booking.lot,
        spotId:         booking.spotId,
        status:         'available',
        availableSpots: lot.availableSpots,
      })
    }

    res.json(booking)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
