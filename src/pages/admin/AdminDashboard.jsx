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

      // ✅ CORRECT CALL
      const response = await statsAPI.getStats()

      // ✅ CORRECT DATA ACCESS
      setStats(response.data)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <ParticleBackground />
      <Header isAdminLoggedIn={true} onLogout={onLogout} />

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          <h1 className="text-4xl font-bold text-cyan-400 mb-8">
            Admin Dashboard
          </h1>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <FuturisticLoader />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((card, index) => {
                const Icon = card.icon
                return (
                  <button
                    key={index}
                    onClick={() => navigate(card.path)}
                    className={`p-6 rounded-lg border ${card.borderColor} bg-slate-800 hover:scale-105 transition`}
                  >
                    <Icon className="mb-4 text-cyan-400" />
                    <p className="text-slate-400">{card.title}</p>
                    <h3 className="text-3xl text-white">{card.value}</h3>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard