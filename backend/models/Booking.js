import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lot:          { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingLot', required: true },
  spotId:       { type: mongoose.Schema.Types.ObjectId, required: true },
  spotNumber:   { type: String, required: true },
  startTime:    { type: Date, required: true },
  endTime:      { type: Date, required: true },
  duration:     { type: Number, required: true }, // hours
  totalAmount:  { type: Number, required: true },
  status:       { type: String, enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'], default: 'pending' },
  payment: {
    status:          { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    method:          { type: String, enum: ['stripe', 'cash'] },
    stripePaymentId: String,
    stripeSessionId: String,
    paidAt:          Date,
  },
  vehiclePlate: String,
  cancellationReason: String,
  cancelledAt:  Date,
}, { timestamps: true })

bookingSchema.virtual('isActive').get(function() {
  const now = new Date()
  return this.status === 'confirmed' && this.startTime <= now && this.endTime >= now
})

export default mongoose.model('Booking', bookingSchema)
