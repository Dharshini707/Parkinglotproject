import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'
import api from '../services/api'
import toast from 'react-hot-toast'
import {
  RiUserLine, RiMailLine, RiPhoneLine, RiCarLine,
  RiEditLine, RiSaveLine, RiAddLine, RiDeleteBinLine,
  RiShieldCheckLine, RiCalendarLine, RiMotorbikeLine,
  RiTruckLine
} from 'react-icons/ri'

const VEHICLE_TYPES = [
  { value: 'car',   label: 'Car',   icon: RiCarLine },
  { value: 'bike',  label: 'Bike',  icon: RiMotorbikeLine },
  { value: 'suv',   label: 'SUV',   icon: RiTruckLine },
  { value: 'other', label: 'Other', icon: RiCarLine },
]

const emptyVehicle = { plate: '', label: '', type: 'car' }

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()

  // Personal info
  const [editingInfo, setEditingInfo] = useState(false)
  const [infoLoading, setInfoLoading] = useState(false)
  const [form, setForm] = useState({
    name:  user?.name  || '',
    phone: user?.phone || '',
  })

  // Vehicle form
  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [vehicleForm, setVehicleForm]         = useState(emptyVehicle)
  const [vehicleLoading, setVehicleLoading]   = useState(false)

  // ── Save profile info ──────────────────────────────────────────────────────
  const handleSaveInfo = async () => {
    if (!form.name.trim()) return toast.error('Name cannot be empty')
    setInfoLoading(true)
    try {
      const res = await api.patch('/auth/profile', {
        name:  form.name.trim(),
        phone: form.phone.trim(),
      })
      updateUser(res.data.user)
      toast.success('Profile updated!')
      setEditingInfo(false)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed')
    } finally {
      setInfoLoading(false)
    }
  }

  // ── Add vehicle ────────────────────────────────────────────────────────────
  const handleAddVehicle = async () => {
    if (!vehicleForm.plate.trim()) return toast.error('Enter a plate number')

    const plateClean = vehicleForm.plate.trim().toUpperCase()

    // Check duplicate
    const exists = (user?.vehicles || []).some(v => v.plate === plateClean)
    if (exists) return toast.error('This plate is already added')

    setVehicleLoading(true)
    try {
      const newVehicles = [
        ...(user?.vehicles || []),
        { plate: plateClean, label: vehicleForm.label.trim(), type: vehicleForm.type },
      ]
      const res = await api.patch('/auth/profile', { vehicles: newVehicles })
      updateUser(res.data.user)
      setVehicleForm(emptyVehicle)
      setShowVehicleForm(false)
      toast.success('Vehicle added!')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to add vehicle')
    } finally {
      setVehicleLoading(false)
    }
  }

  // ── Remove vehicle ─────────────────────────────────────────────────────────
  const handleRemoveVehicle = async (vehicleId) => {
    try {
      const newVehicles = (user?.vehicles || []).filter(v => v._id !== vehicleId)
      const res = await api.patch('/auth/profile', { vehicles: newVehicles })
      updateUser(res.data.user)
      toast.success('Vehicle removed')
    } catch (e) {
      toast.error('Failed to remove vehicle')
    }
  }

  const avatar = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U'
  const joined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : 'Recently'

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="card p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-brand-500 flex items-center justify-center
                          text-white font-display font-bold text-3xl flex-shrink-0 shadow-lg
                          shadow-brand-500/30">
            {avatar}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="font-display font-bold text-2xl text-white">{user?.name}</h1>
            <p className="text-gray-400 mt-1">{user?.email}</p>
            <div className="flex items-center gap-4 mt-3 justify-center sm:justify-start flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                user?.role === 'admin'
                  ? 'bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/30'
                  : 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
              }`}>
                {user?.role === 'admin' ? '⭐ Admin' : '👤 User'}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <RiCalendarLine /> Joined {joined}
              </span>
              <span className="text-xs text-gray-500">
                {(user?.vehicles || []).length} vehicle{(user?.vehicles || []).length !== 1 ? 's' : ''} saved
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Personal Info ───────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }} className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-lg flex items-center gap-2">
              <RiUserLine className="text-brand-400" /> Personal Info
            </h2>
            {!editingInfo ? (
              <button onClick={() => { setForm({ name: user?.name || '', phone: user?.phone || '' }); setEditingInfo(true) }}
                className="btn-ghost !py-2 !px-3 text-sm flex items-center gap-2">
                <RiEditLine /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditingInfo(false)} className="btn-ghost !py-2 !px-3 text-sm">
                  Cancel
                </button>
                <button onClick={handleSaveInfo} disabled={infoLoading}
                  className="btn-primary !py-2 !px-3 text-sm flex items-center gap-2">
                  <RiSaveLine /> {infoLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Full Name</label>
              {editingInfo ? (
                <input className="input-field w-full" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              ) : (
                <div className="flex items-center gap-2 px-4 py-3 glass rounded-xl">
                  <RiUserLine className="text-brand-400 flex-shrink-0" />
                  <span className="text-white">{user?.name || '—'}</span>
                </div>
              )}
            </div>

            {/* Email read-only */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Email Address</label>
              <div className="flex items-center gap-2 px-4 py-3 glass rounded-xl opacity-60">
                <RiMailLine className="text-brand-400 flex-shrink-0" />
                <span className="text-white truncate">{user?.email}</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Phone Number</label>
              {editingInfo ? (
                <input className="input-field w-full" value={form.phone}
                  placeholder="+91 98765 43210"
                  onChange={e => setForm({ ...form, phone: e.target.value })} />
              ) : (
                <div className="flex items-center gap-2 px-4 py-3 glass rounded-xl">
                  <RiPhoneLine className="text-brand-400 flex-shrink-0" />
                  <span className="text-white">{user?.phone || 'Not added'}</span>
                </div>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Account Role</label>
              <div className="flex items-center gap-2 px-4 py-3 glass rounded-xl opacity-60">
                <RiShieldCheckLine className="text-brand-400 flex-shrink-0" />
                <span className="text-white capitalize">{user?.role}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Vehicles ────────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }} className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-lg flex items-center gap-2">
              <RiCarLine className="text-brand-400" /> My Vehicles
            </h2>
            <button
              onClick={() => { setShowVehicleForm(!showVehicleForm); setVehicleForm(emptyVehicle) }}
              className="btn-primary !py-2 !px-3 text-sm flex items-center gap-2">
              <RiAddLine /> Add Vehicle
            </button>
          </div>

          {/* Add vehicle form */}
          {showVehicleForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-4 rounded-2xl border border-brand-500/30 bg-brand-500/5 space-y-3">
              <p className="text-sm font-medium text-brand-400">New Vehicle</p>

              {/* Plate */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Plate Number *</label>
                <input
                  className="input-field w-full uppercase"
                  placeholder="e.g. MH01AB1234"
                  value={vehicleForm.plate}
                  onChange={e => setVehicleForm({ ...vehicleForm, plate: e.target.value.toUpperCase() })}
                  onKeyDown={e => e.key === 'Enter' && handleAddVehicle()}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Nickname */}
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Nickname (optional)</label>
                  <input
                    className="input-field w-full"
                    placeholder="e.g. My Honda City"
                    value={vehicleForm.label}
                    onChange={e => setVehicleForm({ ...vehicleForm, label: e.target.value })}
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Vehicle Type</label>
                  <select
                    className="input-field w-full"
                    value={vehicleForm.type}
                    onChange={e => setVehicleForm({ ...vehicleForm, type: e.target.value })}>
                    {VEHICLE_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowVehicleForm(false)}
                  className="btn-ghost flex-1 text-sm">Cancel</button>
                <button onClick={handleAddVehicle} disabled={vehicleLoading}
                  className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
                  <RiSaveLine /> {vehicleLoading ? 'Saving...' : 'Save Vehicle'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Vehicle list */}
          <div className="space-y-2">
            {(user?.vehicles || []).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <RiCarLine className="text-4xl mx-auto mb-2 opacity-30" />
                <p className="text-sm">No vehicles added yet</p>
                <p className="text-xs mt-1">Add your vehicle plates for quick booking</p>
              </div>
            ) : (
              (user?.vehicles || []).map(vehicle => {
                const TypeIcon = VEHICLE_TYPES.find(t => t.value === vehicle.type)?.icon || RiCarLine
                return (
                  <motion.div key={vehicle._id} layout
                    className="flex items-center justify-between px-4 py-3 glass rounded-xl group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-500/20 flex items-center justify-center">
                        <TypeIcon className="text-brand-400" />
                      </div>
                      <div>
                        <p className="font-mono font-bold text-white tracking-wider">{vehicle.plate}</p>
                        <p className="text-xs text-gray-500">
                          {vehicle.label || vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveVehicle(vehicle._id)}
                      className="text-gray-600 hover:text-red-400 p-2 rounded-lg
                                 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
                      <RiDeleteBinLine />
                    </button>
                  </motion.div>
                )
              })
            )}
          </div>
        </motion.div>

      </div>
    </div>
  )
}
