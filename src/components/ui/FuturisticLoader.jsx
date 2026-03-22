import React from 'react'
import { motion } from 'framer-motion'

const FuturisticLoader = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-16 h-16">
        {/* Outer rotating ring */}
        <motion.div
          className="absolute inset-0 border-2 border-transparent border-t-cyan-400 border-r-blue-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />

        {/* Middle rotating ring */}
        <motion.div
          className="absolute inset-2 border-2 border-transparent border-b-cyan-500 border-l-blue-500 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />

        {/* Inner dot */}
        <motion.div
          className="absolute inset-4 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  )
}

export default FuturisticLoader
