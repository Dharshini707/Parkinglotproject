import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const vehicleSchema = new mongoose.Schema({
  plate: { type: String, required: true, trim: true, uppercase: true },
  label: { type: String, trim: true, default: '' },
  type:  { type: String, enum: ['car', 'bike', 'suv', 'other'], default: 'car' },
}, { _id: true })

const notificationSchema = new mongoose.Schema({
  bookingConfirmed: { type: Boolean, default: true  },
  bookingReminder:  { type: Boolean, default: true  },
  promotions:       { type: Boolean, default: false },
  newsletter:       { type: Boolean, default: false },
}, { _id: false })

const userSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:      { type: String, required: true, minlength: 6 },
  role:          { type: String, enum: ['user', 'admin'], default: 'user' },
  phone:         { type: String, default: '' },
  vehicles:      { type: [vehicleSchema], default: [] },
  notifications: { type: notificationSchema, default: () => ({}) },
  isActive:      { type: Boolean, default: true },
}, { timestamps: true })

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password)
}

userSchema.methods.toJSON = function() {
  const obj = this.toObject()
  delete obj.password
  return obj
}

export default mongoose.model('User', userSchema)
