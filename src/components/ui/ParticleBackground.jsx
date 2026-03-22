import React from 'react'
import { motion } from 'framer-motion'

const ParticleBackground = () => {
  const particles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 15 + Math.random() * 10,
  }))

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full opacity-40"
          style={{ left: `${particle.left}%`, top: '-10px' }}
          animate={{
            y: window.innerHeight + 10,
            x: Math.random() * 100 - 50,
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}

export default ParticleBackground
