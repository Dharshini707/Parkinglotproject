import express from 'express'
import Booking    from '../models/Booking.js'
import ParkingLot from '../models/ParkingLot.js'
import User       from '../models/User.js'
import { adminOnly } from '../middleware/auth.js'

const router = express.Router()
router.use(adminOnly)

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  const [totalLots, totalUsers, totalBookings, revenueData] = await Promise.all([
    ParkingLot.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'user' }),
    Booking.countDocuments(),
    Booking.aggregate([
      { $match: { 'payment.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
  ])

  const activeBookings = await Booking.countDocuments({ status: 'active' })
  const totalRevenue = revenueData[0]?.total || 0

  res.json({ totalLots, totalUsers, totalBookings, totalRevenue, activeBookings })
})

// GET /api/admin/users
router.get('/users', async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).limit(100)
  res.json(users)
})

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true })
  res.json(user)
})

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isActive: false })
  res.json({ message: 'User deactivated' })
})

// GET /api/admin/bookings
router.get('/bookings', async (req, res) => {
  const bookings = await Booking.find()
    .populate('user', 'name email')
    .populate('lot', 'name')
    .sort({ createdAt: -1 })
    .limit(200)
  res.json(bookings)
})

// GET /api/admin/revenue — daily revenue for past 7 days
router.get('/revenue', async (req, res) => {
  const days = 7
  const since = new Date()
  since.setDate(since.getDate() - days)

  const revenue = await Booking.aggregate([
    { $match: { 'payment.status': 'paid', createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ])

  res.json(revenue)
})

export default router
