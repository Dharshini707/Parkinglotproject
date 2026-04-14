import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import {
  RiLockPasswordLine, RiNotification3Line, RiDeleteBin2Line,
  RiEyeLine, RiEyeOffLine, RiSaveLine, RiShieldLine,
  RiLogoutBoxLine
} from 'react-icons/ri'

function Section({ icon: Icon, title, delay, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay }} className="card p-6">
      <h2 className="font-display font-bold text-lg flex items-center gap-2 mb-6">
        <Icon className="text-brand-400" /> {title}
      </h2>
      {children}
    </motion.div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
        checked ? 'bg-brand-500' : 'bg-surface-200'
      }`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow
                        transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuthStore()
  const navigate = useNavigate()

  // ── Password state ─────────────────────────────────────────────────────────
  const [pwForm, setPwForm]       = useState({ current: '', newPw: '', confirm: '' })
  const [showPw, setShowPw]       = useState({ current: false, newPw: false, confirm: false })
  const [pwLoading, setPwLoading] = useState(false)

  // ── Notifications state — seed from user in DB ─────────────────────────────
  const [notifs, setNotifs]           = useState({
    bookingConfirmed: user?.notifications?.bookingConfirmed ?? true,
    bookingReminder:  user?.notifications?.bookingReminder  ?? true,
    promotions:       user?.notifications?.promotions       ?? false,
    newsletter:       user?.notifications?.newsletter       ?? false,
  })
  const [notifsLoading, setNotifsLoading] = useState(false)

  // ── Change password ────────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!pwForm.current || !pwForm.newPw || !pwForm.confirm)
      return toast.error('Please fill all password fields')
    if (pwForm.newPw.length < 6)
      return toast.error('New password must be at least 6 characters')
    if (pwForm.newPw !== pwForm.confirm)
      return toast.error('New passwords do not match')

    setPwLoading(true)
    try {
      await api.patch('/auth/change-password', {
        currentPassword: pwForm.current,
        newPassword:     pwForm.newPw,
      })
      toast.success('Password changed successfully!')
      setPwForm({ current: '', newPw: '', confirm: '' })
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to change password')
    } finally {
      setPwLoading(false)
    }
  }

  // ── Save notifications to DB ───────────────────────────────────────────────
  const handleSaveNotifs = async () => {
    setNotifsLoading(true)
    try {
      const res = await api.patch('/auth/profile', { notifications: notifs })
      updateUser(res.data.user)
      toast.success('Notification preferences saved!')
    } catch (e) {
      toast.error('Failed to save preferences')
    } finally {
      setNotifsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const handleDeleteAccount = () => {
    toast('Feature coming soon.', { icon: '⚠️' })
  }

  // Password strength
  const strength = pwForm.newPw.length === 0 ? 0
    : pwForm.newPw.length < 4  ? 1
    : pwForm.newPw.length < 7  ? 2
    : pwForm.newPw.length < 10 ? 3 : 4
  const strengthLabel = ['', 'Too short', 'Weak', 'Good', 'Strong'][strength]
  const strengthColor = ['', 'bg-red-500', 'bg-accent-yellow', 'bg-blue-400', 'bg-brand-500'][strength]

  const PwInput = ({ field, placeholder }) => (
    <div className="relative">
      <input
        type={showPw[field] ? 'text' : 'password'}
        className="input-field w-full pr-10"
        placeholder={placeholder}
        value={pwForm[field]}
        onChange={e => setPwForm(f => ({ ...f, [field]: e.target.value }))}
      />
      <button type="button"
        onClick={() => setShowPw(s => ({ ...s, [field]: !s[field] }))}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
        {showPw[field] ? <RiEyeOffLine /> : <RiEyeLine />}
      </button>
    </div>
  )

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display font-bold text-3xl text-white">Settings</h1>
          <p className="text-gray-400 mt-1">Manage your account preferences</p>
        </motion.div>

        {/* ── Change Password ─────────────────────────────────────────────── */}
        <Section icon={RiLockPasswordLine} title="Change Password" delay={0.1}>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Current Password</label>
              <PwInput field="current" placeholder="Enter current password" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">New Password</label>
              <PwInput field="newPw" placeholder="At least 6 characters" />
            </div>

            {/* Strength bar */}
            {pwForm.newPw && (
              <div>
                <div className="flex gap-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                      i <= strength ? strengthColor : 'bg-surface-200'
                    }`} />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">{strengthLabel}</p>
              </div>
            )}

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Confirm New Password</label>
              <PwInput field="confirm" placeholder="Repeat new password" />
              {pwForm.confirm && pwForm.newPw !== pwForm.confirm && (
                <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
              )}
            </div>

            <button onClick={handleChangePassword} disabled={pwLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              <RiSaveLine /> {pwLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </Section>

        {/* ── Notifications ───────────────────────────────────────────────── */}
        <Section icon={RiNotification3Line} title="Notifications" delay={0.2}>
          <div className="space-y-1">
            {[
              { key: 'bookingConfirmed', label: 'Booking Confirmed',   desc: 'Get notified when your booking is confirmed' },
              { key: 'bookingReminder',  label: 'Booking Reminder',    desc: 'Reminder 30 mins before parking starts' },
              { key: 'promotions',       label: 'Promotions & Offers', desc: 'Discounts and special offers' },
              { key: 'newsletter',       label: 'Newsletter',          desc: 'Monthly updates and news' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-3
                                        border-b border-surface-300/30 last:border-0">
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
                <Toggle
                  checked={notifs[key]}
                  onChange={val => setNotifs(n => ({ ...n, [key]: val }))}
                />
              </div>
            ))}
            <button onClick={handleSaveNotifs} disabled={notifsLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-4">
              <RiSaveLine /> {notifsLoading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </Section>

        {/* ── Account ─────────────────────────────────────────────────────── */}
        <Section icon={RiShieldLine} title="Account" delay={0.3}>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 glass rounded-xl">
              <div>
                <p className="text-sm font-medium text-white">Log out</p>
                <p className="text-xs text-gray-500">Signs you out of this session</p>
              </div>
              <button onClick={handleLogout}
                className="btn-ghost !py-2 !px-3 text-sm flex items-center gap-2">
                <RiLogoutBoxLine /> Logout
              </button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl
                            border border-red-500/20 bg-red-500/5">
              <div>
                <p className="text-sm font-medium text-red-400">Delete Account</p>
                <p className="text-xs text-gray-500">Permanently delete your account and all data</p>
              </div>
              <button onClick={handleDeleteAccount}
                className="!py-2 !px-3 text-sm flex items-center gap-2 text-red-400
                           border border-red-500/30 rounded-xl hover:bg-red-500/10 transition-colors">
                <RiDeleteBin2Line /> Delete
              </button>
            </div>
          </div>
        </Section>

      </div>
    </div>
  )
}
