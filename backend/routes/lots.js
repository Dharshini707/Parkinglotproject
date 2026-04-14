import express    from 'express'
import ParkingLot from '../models/ParkingLot.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// GET /api/lots
router.get('/', async (req, res) => {
  try {
    const { type, maxPrice, available, ev, open24h } = req.query
    const query = { isActive: true }
    if (type)              query.type         = type
    if (maxPrice)          query.pricePerHour = { $lte: +maxPrice }
    if (available==='true') query.availableSpots = { $gt: 0 }
    if (ev==='true')        query.amenities   = { $in: ['ev_charging','ev'] }
    if (open24h==='true')   query.amenities   = { $in: ['open_24h','24h'] }
    const lots = await ParkingLot.find(query).select('-spots')
    res.json(lots)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// GET /api/lots/:id
router.get('/:id', async (req, res) => {
  try {
    const lot = await ParkingLot.findById(req.params.id)
    if (!lot) return res.status(404).json({ message: 'Lot not found' })
    res.json(lot)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// POST /api/lots/find-or-create
// Only called when a user books — creates lot in DB only if not already there
router.post('/find-or-create', protect, async (req, res) => {
  try {
    const { name, address, lat, lng, pricePerHour, type, amenities, rating, totalSpots, spots } = req.body

    let lot = await ParkingLot.findOne({ name: name.trim(), address: address.trim() })

    if (!lot) {
      const spotsArr = (spots || []).map(s => ({
        number:     s.number,
        floor:      s.floor      || 1,
        status:     s.status     || 'available',
        isEV:       s.isEV       || false,
        isHandicap: s.isHandicap || false,
      }))

      // Map frontend shorthand → backend enum values
      const amenityMap = { ev: 'ev_charging', '24h': 'open_24h' }
      const mappedAmenities = (amenities || [])
        .map(a => amenityMap[a] || a)
        .filter(a => ['ev_charging','open_24h','cctv','handicap','valet'].includes(a))

      lot = await ParkingLot.create({
        name:      name.trim(),
        address:   address.trim(),
        location:  { type: 'Point', coordinates: [lng || 77.2090, lat || 28.6139] },
        totalSpots: totalSpots || spotsArr.length,
        availableSpots: spotsArr.filter(s => s.status === 'available').length,
        spots:     spotsArr,
        pricePerHour,
        type:      type   || 'open',
        amenities: mappedAmenities,
        rating:    rating || 0,
        isActive:  true,
        status:    'active',
      })
    }

    res.json(lot)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// POST /api/lots — admin create
router.post('/', protect, async (req, res) => {
  try {
    const lot = await ParkingLot.create(req.body)
    res.status(201).json(lot)
  } catch (err) { res.status(400).json({ message: err.message }) }
})

// PATCH /api/lots/:id
router.patch('/:id', protect, async (req, res) => {
  try {
    const lot = await ParkingLot.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!lot) return res.status(404).json({ message: 'Lot not found' })
    res.json(lot)
  } catch (err) { res.status(400).json({ message: err.message }) }
})

// DELETE /api/lots/:id — soft delete
router.delete('/:id', protect, async (req, res) => {
  try {
    await ParkingLot.findByIdAndUpdate(req.params.id, { isActive: false })
    res.json({ message: 'Lot deactivated' })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

export default router
