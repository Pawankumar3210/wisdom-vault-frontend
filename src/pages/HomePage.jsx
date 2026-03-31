import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Header from '../components/ui/Header'
import ParticleBackground from '../components/ui/ParticleBackground'
import SearchBar from '../components/search/SearchBar'
import ContentCard from '../components/content/ContentCard'
import FuturisticLoader from '../components/ui/FuturisticLoader'
import { contentAPI } from '../services/api'

const HomePage = ({ isAdminLoggedIn, onLogout }) => {
  const [contents, setContents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    fetchContents()
  }, [])

  const fetchContents = async () => {
    try {
      setIsLoading(true)
      const response = await contentAPI.getAll()
      console.log('✅ Contents loaded:', response.data)
      setContents(response.data || [])
    } catch (error) {
      console.error('❌ Error fetching contents:', error)
      toast.error(error.message || 'Failed to load contents')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = (fileUrl, title) => {
    if (!fileUrl) {
      toast.error('File URL not found')
      return
    }
    const downloadUrl = contentAPI.downloadUrl(fileUrl)
    if (!downloadUrl) {
      toast.error('Unable to generate download link')
      return
    }
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `${title}.pdf`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredContents = activeFilter === 'all'
    ? contents
    : contents.filter(c => c.type === activeFilter)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
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
      <Header isAdminLoggedIn={isAdminLoggedIn} onLogout={onLogout} />

      {/* Hero Section */}
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-4xl mx-auto text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-5xl font-futuristic font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Academic Excellence
          </h2>
          <p className="text-slate-300 text-lg sm:text-xl mb-8 leading-relaxed">
            "Knowledge is the only treasure that grows when shared. Built with purpose, preserved for excellence."
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <SearchBar />
        </motion.div>
      </div>

      {/* Filter Buttons */}
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 flex justify-center gap-3 flex-wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {[
          { id: 'all', label: 'All Resources' },
          { id: 'note', label: '📄 Notes' },
          { id: 'qb', label: '📋 Question Banks' },
          { id: 'paper', label: '📑 Papers' },
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-6 py-2 rounded-lg font-sci-fi text-sm font-semibold transition-all duration-300 ${
              activeFilter === filter.id
                ? 'bg-gradient-to-r from-cyan-500/40 to-blue-500/40 border border-cyan-400/60 text-cyan-300 shadow-[0_0_15px_rgba(0,217,255,0.4)]'
                : 'bg-slate-800/50 border border-cyan-500/20 text-slate-400 hover:border-cyan-500/40 hover:text-cyan-400'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </motion.div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <FuturisticLoader />
          </div>
        ) : filteredContents.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-slate-400 text-lg">No content available yet.</p>
            <p className="text-slate-500 text-sm mt-2">Check back soon for updates!</p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredContents.map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                <ContentCard
                  item={item}
                  onDownload={() => handleDownload(item.file_url, item.title)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default HomePage
