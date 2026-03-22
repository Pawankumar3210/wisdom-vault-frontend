import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import ParticleBackground from '../../components/ui/ParticleBackground'
import FuturisticLoader from '../../components/ui/FuturisticLoader'
import { Eye, EyeOff } from 'lucide-react'

const AdminLoginPage = ({ setIsAdminLoggedIn }) => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword] = useState(false)

  // Hardcoded credentials
  const ADMIN_USERNAME = 'wisdomadminman01'
  const ADMIN_PASSWORD = 'per$everance@001'

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!username.trim() || !password.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500))

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem('adminLoggedIn', 'true')
      setIsAdminLoggedIn(true)
      toast.success('Login successful! Welcome Admin')
      navigate('/admin/dashboard')
    } else {
      toast.error('Invalid credentials. Please try again.')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <ParticleBackground />

      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Glow background */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-3xl opacity-40" />

        {/* Card */}
        <div className="relative bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-8 backdrop-blur-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-futuristic font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Wisdom Vault
            </h1>
            <p className="text-cyan-400 font-sci-fi text-sm">Admin Portal</p>
            <p className="text-slate-400 text-xs mt-3">Manage your academic resources</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Field */}
            <div>
              <label className="block text-cyan-400 text-sm font-sci-fi mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-lg text-slate-200 placeholder-slate-500 font-sci-fi outline-none focus:border-cyan-400/60 focus:bg-slate-800/70 transition-all duration-300"
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-cyan-400 text-sm font-sci-fi mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-lg text-slate-200 placeholder-slate-500 font-sci-fi outline-none focus:border-cyan-400/60 focus:bg-slate-800/70 transition-all duration-300"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-8 py-3 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 hover:from-cyan-500/50 hover:to-blue-500/50 border border-cyan-500/50 hover:border-cyan-400/80 rounded-lg text-cyan-300 hover:text-cyan-200 font-sci-fi font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,217,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                  Logging in...
                </>
              ) : (
                '🔐 Login'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-cyan-500/20">
            <p className="text-center text-slate-500 text-xs">
              Only authorized administrators can access this portal
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminLoginPage
