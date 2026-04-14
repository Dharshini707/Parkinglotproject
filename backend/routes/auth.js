import express from 'express'
import jwt     from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import User    from '../models/User.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

// ─── POST /api/auth/register ─────────────────────────────────────────────────
router.post('/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

    const { name, email, password } = req.body
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: 'Email already registered' })

    const user  = await User.create({ name, email, password })
    const token = signToken(user._id)
    res.status(201).json({ user, token })
  }
)

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Invalid credentials' })

    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' })

    const token = signToken(user._id)
    res.json({ user, token })
  }
)

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user })
})

// ─── PATCH /api/auth/profile ──────────────────────────────────────────────────
// Handles: name, phone, vehicles, notifications  (all optional, save only what's sent)
router.patch('/profile', protect, async (req, res) => {
  try {
    const { name, phone, vehicles, notifications } = req.body
    const update = {}

    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ message: 'Name cannot be empty' })
      update.name = name.trim()
    }
    if (phone         !== undefined) update.phone         = phone
    if (vehicles      !== undefined) update.vehicles      = vehicles
    if (notifications !== undefined) update.notifications = notifications

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: update },
      { new: true, runValidators: true }
    )

    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── PATCH /api/auth/change-password ─────────────────────────────────────────
router.patch('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Both current and new password are required' })

    if (newPassword.length < 6)
      return res.status(400).json({ message: 'New password must be at least 6 characters' })

    // Fetch user WITH password (toJSON strips it)
    const user = await User.findById(req.user._id)
    const match = await user.comparePassword(currentPassword)
    if (!match)
      return res.status(401).json({ message: 'Current password is incorrect' })

    user.password = newPassword   // pre-save hook hashes it
    await user.save()

    res.json({ message: 'Password changed successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
