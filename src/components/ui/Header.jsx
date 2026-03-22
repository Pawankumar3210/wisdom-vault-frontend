import React from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen } from 'lucide-react'

const Header = ({ isAdminLoggedIn, onLogout }) => {
  const navigate = useNavigate()

  const handleAdminClick = () => {
    if (isAdminLoggedIn) {
      navigate('/admin/dashboard')
    } else {
      navigate('/admin/login')
    }
  }

  const handleLogout = () => {
    onLogout()
    navigate('/')
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-slate-900/50 border-b border-cyan-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left: Logo and Title */}
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/')}
          >
            <div className="relative">
              <BookOpen className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
              <div className="absolute inset-0 animate-pulse opacity-50">
                <BookOpen className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-futuristic font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(0,217,255,0.3)]">
                Wisdom Vault
              </h1>
              <p className="text-xs text-cyan-500/70 font-sci-fi">CSE 4th Semester</p>
            </div>
          </div>

          {/* Right: Admin Button */}
          <button
            onClick={isAdminLoggedIn ? handleLogout : handleAdminClick}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 text-cyan-400 font-sci-fi hover:from-cyan-500/40 hover:to-blue-500/40 hover:border-cyan-400 hover:text-cyan-300 transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,217,255,0.4)] text-sm sm:text-base"
          >
            {isAdminLoggedIn ? '🚪 Logout' : '🔐 Admin Login'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Header
