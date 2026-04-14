import { create } from 'zustand'
import api from '../services/api'

export const useParkingStore = create((set, get) => ({
  lots: [],
  selectedLot: null,
  filters: { city: '', type: '', maxPrice: 100, available: false },

  fetchLots: async (filters = {}) => {
    const params = { ...get().filters, ...filters }
    const res = await api.get('/lots', { params })
    set({ lots: res.data })
  },

  fetchLot: async (id) => {
    const res = await api.get(`/lots/${id}`)
    set({ selectedLot: res.data })
    return res.data
  },

  setFilters: (filters) => {
    set(state => ({ filters: { ...state.filters, ...filters } }))
  },

  updateLotFromSocket: (data) => {
    set(state => ({
      lots: state.lots.map(l => l._id === data.lotId
        ? { ...l, availableSpots: data.availableSpots }
        : l
      ),
      selectedLot: state.selectedLot?._id === data.lotId
        ? { ...state.selectedLot, spots: state.selectedLot.spots.map(s =>
            s._id === data.spotId ? { ...s, status: data.status } : s
          )}
        : state.selectedLot,
    }))
  },
}))
