import dotenv from 'dotenv'
dotenv.config()

import express      from 'express'
import { createServer } from 'http'
import { Server }   from 'socket.io'
import cors         from 'cors'
import morgan       from 'morgan'
import Stripe       from 'stripe'
import connectDB    from './config/db.js'

import authRoutes     from './routes/auth.js'
import lotRoutes      from './routes/lots.js'
import bookingRoutes  from './routes/bookings.js'
import paymentRoutes  from './routes/payments.js'
import adminRoutes    from './routes/admin.js'
import { protect }    from './middleware/auth.js'
import { stripeWebhookHandler } from './routes/payments.js'

connectDB()

const app        = express()
const httpServer = createServer(app)

// Only initialize Stripe if a valid key is provided
const stripeKey = process.env.STRIPE_SECRET_KEY
const stripe = (stripeKey && !stripeKey.includes('PASTE') && !stripeKey.includes('your_stripe'))
  ? new Stripe(stripeKey, { apiVersion: '2025-04-30.basil' })
  : null

const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET','POST'] },
})

app.set('io', io)
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(morgan('dev'))

// Stripe webhook endpoints must use raw body parsing before JSON middleware
app.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler)
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler)

// Middleware for parsing JSON
app.use(express.json())

// API Routes
app.use('/api/auth',     authRoutes)
app.use('/api/lots',     lotRoutes)
app.use('/api/bookings', protect, bookingRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/admin',    protect, adminRoutes)

app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }))

// Socket.io Logic
io.on('connection', (socket) => {
  socket.on('join-lot',  (lotId) => socket.join(`lot-${lotId}`))
  socket.on('leave-lot', (lotId) => socket.leave(`lot-${lotId}`))
  socket.on('disconnect', () => {})
})

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' })
})

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))