import { motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  RiMapPin2Line, RiTimeLine, RiShieldCheckLine,
  RiRobot2Line, RiArrowRightLine, RiParkingLine,
  RiCarLine, RiMoneyDollarCircleLine, RiFlashlightLine
} from 'react-icons/ri'

const stats = [
  { label: 'Parking Lots',   value: '500+',  icon: RiParkingLine },
  { label: 'Active Users',   value: '12K+',  icon: RiCarLine },
  { label: 'Cities Covered', value: '25+',   icon: RiMapPin2Line },
  { label: 'Saved per User', value: '₹2K/mo', icon: RiMoneyDollarCircleLine },
]

const features = [
  {
    icon: RiMapPin2Line,
    title: 'Live Map View',
    desc: 'See real-time availability across all lots on an interactive map. Filter by location, price, and type.',
    color: 'brand',
  },
  {
    icon: RiTimeLine,
    title: 'Instant Booking',
    desc: 'Book your spot in seconds with our seamless slot booking interface and instant confirmation.',
    color: 'blue',
  },
  {
    icon: RiRobot2Line,
    title: 'AI Chatbot',
    desc: 'Our Dialogflow-powered assistant helps you find and book spots via natural conversation.',
    color: 'yellow',
  },
  {
    icon: RiShieldCheckLine,
    title: 'Secure Payments',
    desc: 'Pay safely with Stripe integration. Full booking history and easy cancellations.',
    color: 'brand',
  },
  {
    icon: RiFlashlightLine,
    title: 'Real-time Updates',
    desc: 'Live socket updates ensure you always see the latest spot availability without refreshing.',
    color: 'blue',
  },
  {
    icon: RiCarLine,
    title: 'Smart Filters',
    desc: 'Filter by EV charging, covered parking, 24/7 availability, and maximum price.',
    color: 'yellow',
  },
]

const colorMap = {
  brand:  { bg: 'bg-brand-500/10',  border: 'border-brand-500/30',  icon: 'text-brand-400' },
  blue:   { bg: 'bg-accent-blue/10',  border: 'border-accent-blue/30',  icon: 'text-accent-blue' },
  yellow: { bg: 'bg-accent-yellow/10', border: 'border-accent-yellow/30', icon: 'text-accent-yellow' },
}

export default function Home() {
  const [counter, setCounter] = useState({ lots: 0, users: 0, cities: 0 })

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(prev => ({
        lots:   Math.min(prev.lots + 7,   500),
        users:  Math.min(prev.users + 180, 12000),
        cities: Math.min(prev.cities + 1,  25),
      }))
    }, 30)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(20,179,113,1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,179,113,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
        />
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-blue/8 rounded-full blur-3xl animate-float" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-brand-400 text-sm font-medium mb-8 border border-brand-500/20">
              <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
              Live spots updating in real-time
            </div>

            <h1 className="font-display font-bold text-5xl md:text-7xl leading-tight mb-6">
              Park Smarter,<br />
              <span className="text-gradient">Not Harder</span>
            </h1>

            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Find, book, and pay for parking in seconds. Real-time availability,
              AI-powered search, and seamless booking — all in one platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <NavLink to="/map" className="btn-primary flex items-center justify-center gap-2 text-base">
                <RiMapPin2Line /> Find Parking Now <RiArrowRightLine />
              </NavLink>
              <NavLink to="/register" className="btn-ghost flex items-center justify-center gap-2 text-base">
                Get Started Free
              </NavLink>
            </div>
          </motion.div>

          {/* Floating parking visualization */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="mt-16 grid grid-cols-5 gap-2 max-w-xs mx-auto"
          >
            {Array.from({ length: 20 }).map((_, i) => {
              const status = [0,3,7,10,14,16,19].includes(i) ? 'occupied'
                           : [5,8,12].includes(i) ? 'reserved' : 'available'
              return (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.04 }}
                  className={`h-10 rounded-lg flex items-center justify-center text-xs ${
                    status === 'available' ? 'spot-available animate-pulse-slow' :
                    status === 'occupied'  ? 'spot-occupied' : 'spot-reserved'
                  }`}
                >
                  {status === 'available' ? 'P' : status === 'occupied' ? '✕' : '~'}
                </motion.div>
              )
            })}
          </motion.div>
          <div className="flex justify-center gap-6 mt-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-brand-500 rounded" />Available</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-accent-red rounded" />Occupied</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-accent-yellow rounded" />Reserved</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-surface-300/30">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ label, value, icon: Icon }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-brand-500/10 border border-brand-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Icon className="text-brand-400 text-2xl" />
              </div>
              <div className="font-display font-bold text-3xl text-gradient">{value}</div>
              <div className="text-gray-500 text-sm mt-1">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
            Everything you need to<br /><span className="text-gradient">park without stress</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">Built for drivers, powered by AI, backed by real-time data.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, color }, i) => {
            const c = colorMap[color]
            return (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="card group cursor-default"
              >
                <div className={`w-12 h-12 ${c.bg} border ${c.border} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300`}>
                  <Icon className={`${c.icon} text-2xl`} />
                </div>
                <h3 className="font-display font-semibold text-xl mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-12 border border-brand-500/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-900/30 to-transparent" />
            <div className="relative z-10">
              <h2 className="font-display font-bold text-4xl mb-4">Ready to park smarter?</h2>
              <p className="text-gray-400 mb-8">Join thousands of drivers who save time and money every day.</p>
              <NavLink to="/map" className="btn-primary inline-flex items-center gap-2 text-base">
                <RiMapPin2Line /> Start Finding Parking
              </NavLink>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
