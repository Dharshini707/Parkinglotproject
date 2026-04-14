import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
dotenv.config()

import User         from '../models/User.js'
import ParkingLot   from '../models/ParkingLot.js'
import Booking      from '../models/Booking.js'

const LOTS_DATA = [
  {
    name: 'Central Park Garage',
    address: 'Connaught Place, New Delhi',
    location: { type: 'Point', coordinates: [77.2090, 28.6139] },
    totalSpots: 50,
    pricePerHour: 40,
    type: 'covered',
    amenities: ['ev_charging', 'open_24h', 'cctv', 'handicap'],
    rating: 4.5,
    floors: 2,
    images: [],
  },
  {
    name: 'Metro Station Parking',
    address: 'Rajiv Chowk Metro, New Delhi',
    location: { type: 'Point', coordinates: [77.2080, 28.6229] },
    totalSpots: 30,
    pricePerHour: 25,
    type: 'open',
    amenities: ['open_24h', 'cctv'],
    rating: 4.0,
    floors: 1,
  },
  {
    name: 'Mall Basement Parking',
    address: 'Select Citywalk, Saket, New Delhi',
    location: { type: 'Point', coordinates: [77.2200, 28.6100] },
    totalSpots: 80,
    pricePerHour: 60,
    type: 'basement',
    amenities: ['ev_charging', 'cctv', 'valet'],
    rating: 4.8,
    floors: 3,
  },
  {
    name: 'IT Hub Smart Parking',
    address: 'Cyber City, Gurugram',
    location: { type: 'Point', coordinates: [77.2150, 28.6280] },
    totalSpots: 60,
    pricePerHour: 35,
    type: 'covered',
    amenities: ['ev_charging', 'open_24h', 'cctv'],
    rating: 4.6,
    floors: 2,
  },
  {
    name: 'Airport Express Parking',
    address: 'New Delhi Railway Station Area',
    location: { type: 'Point', coordinates: [77.2000, 28.6320] },
    totalSpots: 100,
    pricePerHour: 50,
    type: 'basement',
    amenities: ['ev_charging', 'open_24h', 'cctv', 'handicap'],
    rating: 4.7,
    floors: 4,
  },
]

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'smart-parking' })
  console.log('Connected to MongoDB')

  // Clear existing
  await Promise.all([User.deleteMany(), ParkingLot.deleteMany(), Booking.deleteMany()])
  console.log('Cleared existing data')

  // Create users
  const adminUser = await User.create({
    name: 'Admin User',
    email: 'admin@parksmart.in',
    password: await bcrypt.hash('admin123', 10),
    role: 'admin',
  })
  const demoUser = await User.create({
    name: 'Demo Driver',
    email: 'demo@parksmart.in',
    password: await bcrypt.hash('demo123', 10),
    role: 'user',
  })
  console.log('✅ Users created')

  // Create parking lots with spots
  for (const lotData of LOTS_DATA) {
    const spots = []
    const floorCount = lotData.floors
    const spotsPerFloor = Math.ceil(lotData.totalSpots / floorCount)

    for (let floor = 1; floor <= floorCount; floor++) {
      for (let s = 1; s <= spotsPerFloor; s++) {
        const num = (floor - 1) * spotsPerFloor + s
        if (num > lotData.totalSpots) break
        spots.push({
          number: `${String.fromCharCode(64 + floor)}${String(s).padStart(2, '0')}`,
          floor,
          status: Math.random() < 0.25 ? 'occupied' : 'available',
          isEV: Math.random() < 0.15,
          isHandicap: Math.random() < 0.05,
        })
      }
    }

    const available = spots.filter(s => s.status === 'available').length
    await ParkingLot.create({ ...lotData, spots, availableSpots: available })
  }
  console.log('✅ Parking lots created with spots')

  console.log('\n🎉 Database seeded successfully!')
  console.log('Admin: admin@parksmart.in / admin123')
  console.log('Demo:  demo@parksmart.in  / demo123')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })
