import mongoose from 'mongoose'

const spotSchema = new mongoose.Schema({
  number:         { type: String, required: true },
  floor:          { type: Number, default: 1 },
  status:         { type: String, enum: ['available','occupied','reserved','maintenance'], default: 'available' },
  isEV:           { type: Boolean, default: false },
  isHandicap:     { type: Boolean, default: false },
  currentBooking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
})

const parkingLotSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  address:        { type: String, required: true },
  location: {
    type:         { type: String, default: 'Point', enum: ['Point'] },
    coordinates:  { type: [Number], required: true },
  },
  totalSpots:     { type: Number, required: true },
  availableSpots: { type: Number, default: 0 },
  spots:          [spotSchema],
  pricePerHour:   { type: Number, required: true },
  type:           { type: String, enum: ['covered','open','basement'], default: 'open' },
  // Accept both shorthand (ev, 24h) and full names (ev_charging, open_24h)
  amenities:      [{ type: String, enum: ['ev_charging','open_24h','cctv','handicap','valet','ev','24h'] }],
  rating:         { type: Number, default: 0, min: 0, max: 5 },
  reviewCount:    { type: Number, default: 0 },
  floors:         { type: Number, default: 1 },
  images:         [String],
  isActive:       { type: Boolean, default: true },
  status:         { type: String, enum: ['active','maintenance','closed'], default: 'active' },
  owner:          { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

parkingLotSchema.index({ location: '2dsphere' })

parkingLotSchema.methods.recalculateAvailable = function() {
  this.availableSpots = this.spots.filter(s => s.status === 'available').length
}

export default mongoose.model('ParkingLot', parkingLotSchema)
