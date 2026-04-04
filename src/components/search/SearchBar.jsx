import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

const SearchBar = () => {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef(null)
  const navigate = useNavigate()

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim() === '') {
        setSuggestions([])
        setIsOpen(false)
        return
      }

      setIsLoading(true)
      try {
        console.log('🔍 [SearchBar] Searching for:', query)
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/search`, {
          params: { q: query },
        })
        console.log('✅ [SearchBar] Response:', response.data)
        console.log('✅ [SearchBar] Results count:', response.data.results?.length || 0)
        
        setSuggestions(response.data.results || [])
        setIsOpen(response.data.results && response.data.results.length > 0)
      } catch (error) {
        console.error('❌ [SearchBar] Search error:', error)
        console.error('❌ [SearchBar] Error details:', error.response?.data || error.message)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSuggestionClick = (item) => {
    navigate(`/viewer/${item.id}`)
    setQuery('')
    setSuggestions([])
    setIsOpen(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (suggestions.length > 0) {
      handleSuggestionClick(suggestions[0])
    }
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center gap-3 px-4 py-3 bg-slate-900/50 border border-cyan-500/30 rounded-xl backdrop-blur-sm hover:border-cyan-400/50 transition-colors duration-300">
            <Search className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search notes, subjects, question banks..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query && setIsOpen(true)}
              className="flex-1 bg-transparent text-slate-200 placeholder-slate-500 outline-none font-sci-fi text-sm"
            />
            {isLoading && (
              <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
            )}
          </div>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {query.trim() !== '' && isOpen && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 border border-cyan-500/30 rounded-lg backdrop-blur-md shadow-2xl max-h-96 overflow-y-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {suggestions.length > 0 ? (
              suggestions.map((item, index) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleSuggestionClick(item)}
                  className="w-full px-4 py-3 text-left border-b border-cyan-500/10 hover:bg-cyan-500/10 transition-colors duration-200 last:border-b-0 group focus:outline-none"
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full group-hover:shadow-[0_0_8px_rgba(0,217,255,0.6)]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-cyan-300 font-sci-fi truncate">{item.title}</p>
                      <p className="text-xs text-slate-400">{item.type === 'note' ? '📄 Note' : item.type === 'qb' ? '📋 Question Bank' : '📑 Paper'} • {item.subject}</p>
                    </div>
                  </div>
                </motion.button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-slate-400 font-sci-fi">
                <p>No results found for "{query}"</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* No results message */}
      <AnimatePresence>
        {isOpen && query && !isLoading && suggestions.length === 0 && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 px-4 py-6 bg-slate-900/95 border border-cyan-500/30 rounded-lg backdrop-blur-md text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-slate-400 text-sm">No results found for "{query}"</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SearchBar
