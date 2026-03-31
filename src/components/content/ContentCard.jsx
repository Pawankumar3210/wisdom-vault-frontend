import React from 'react'
import { motion } from 'framer-motion'
import { Download, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const ContentCard = ({ item, onDownload }) => {
  const navigate = useNavigate()

  const typeEmoji = {
    note: '📄',
    qb: '📋',
    paper: '📑',
  }

  const typeLabel = {
    note: 'Note',
    qb: 'Question Bank',
    paper: 'Paper',
  }

  return (
    <motion.div
      className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-400/50 transition-all duration-300 hover:bg-slate-800/60 cursor-pointer"
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-400/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:via-cyan-400/20 group-hover:to-blue-500/10 rounded-lg transition-all duration-300" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-2xl mb-2">{typeEmoji[item.type]}</p>
            <h3 className="text-sm font-sci-fi text-cyan-300 font-semibold line-clamp-2">
              {item.title}
            </h3>
          </div>
          <span className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded text-xs text-cyan-400 font-sci-fi whitespace-nowrap">
            {typeLabel[item.type]}
          </span>
        </div>

        {/* Subject */}
        <p className="text-xs text-slate-400 mb-4">{item.subject}</p>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-cyan-500/10">
          <button
            onClick={() => navigate(`/viewer/${item.id}`)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/40 hover:to-blue-500/40 border border-cyan-500/30 hover:border-cyan-400/60 text-cyan-400 hover:text-cyan-300 rounded text-xs font-sci-fi transition-all duration-200"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onDownload(item.file_url, item.title, item.content_type)
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/40 hover:to-purple-500/40 border border-blue-500/30 hover:border-blue-400/60 text-blue-400 hover:text-blue-300 rounded text-xs font-sci-fi transition-all duration-200"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default ContentCard
