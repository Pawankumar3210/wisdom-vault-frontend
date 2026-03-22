import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Header from '../../components/ui/Header'
import ParticleBackground from '../../components/ui/ParticleBackground'
import FuturisticLoader from '../../components/ui/FuturisticLoader'
import { BookOpen, FileText, ClipboardList, Award } from 'lucide-react'
import { statsAPI } from '../../services/api'

const AdminDashboard = ({ onLogout }) => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalQuestionBanks: 0,
    totalPapers: 0,
    totalSubjects: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const response = await statsAPI.getStats()
      setStats(response.data.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Failed to load statistics')
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Subjects',
      value: stats.totalSubjects,
      icon: BookOpen,
      color: 'from-cyan-500/20 to-blue-500/20',
      borderColor: 'border-cyan-500/30',
      path: '/admin/subjects',
    },
    {
      title: 'Total Notes',
      value: stats.totalNotes,
      icon: FileText,
      color: 'from-blue-500/20 to-purple-500/20',
      borderColor: 'border-blue-500/30',
      path: '/admin/notes',
    },
    {
      title: 'Question Banks',
      value: stats.totalQuestionBanks,
      icon: ClipboardList,
      color: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30',
      path: '/admin/question-banks',
    },
    {
      title: 'Question Papers',
      value: stats.totalPapers,
      icon: Award,
      color: 'from-pink-500/20 to-red-500/20',
      borderColor: 'border-pink-500/30',
      path: '/admin/question-papers',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <ParticleBackground />
      <Header isAdminLoggedIn={true} onLogout={onLogout} />

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl font-futuristic font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-3">
              Admin Dashboard
            </h1>
            <p className="text-slate-400 text-lg">Manage your platform and content</p>
          </motion.div>

          {/* Stats Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <FuturisticLoader />
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {statCards.map((card, index) => {
                const Icon = card.icon
                return (
                  <motion.button
                    key={index}
                    onClick={() => navigate(card.path)}
                    variants={itemVariants}
                    whileHover={{ y: -4 }}
                    className={`group relative bg-gradient-to-br ${card.color} border ${card.borderColor} rounded-lg p-6 hover:border-opacity-100 transition-all duration-300 text-left cursor-pointer`}
                  >
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 rounded-lg transition-all duration-300" />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <Icon className="w-8 h-8 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                        <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded font-sci-fi">
                          Manage
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm font-sci-fi mb-2">{card.title}</p>
                      <h3 className="text-4xl font-futuristic font-bold text-cyan-300">
                        {card.value}
                      </h3>
                    </div>
                  </motion.button>
                )
              })}
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
              <h3 className="text-lg font-sci-fi text-cyan-400 mb-4">📊 Recent Activity</h3>
              <div className="space-y-3">
                <p className="text-slate-400 text-sm">No recent activity</p>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
              <h3 className="text-lg font-sci-fi text-cyan-400 mb-4">🎯 Quick Links</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/admin/subjects')}
                  className="block w-full text-left px-3 py-2 rounded hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-400 transition-colors text-sm"
                >
                  → Manage Subjects
                </button>
                <button
                  onClick={() => navigate('/admin/notes')}
                  className="block w-full text-left px-3 py-2 rounded hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-400 transition-colors text-sm"
                >
                  → Upload Notes
                </button>
                <button
                  onClick={() => navigate('/admin/question-banks')}
                  className="block w-full text-left px-3 py-2 rounded hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-400 transition-colors text-sm"
                >
                  → Manage Question Banks
                </button>
                <button
                  onClick={() => navigate('/admin/question-papers')}
                  className="block w-full text-left px-3 py-2 rounded hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-400 transition-colors text-sm"
                >
                  → Manage Question Papers
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
