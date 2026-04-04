import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Header from '../../components/ui/Header'
import ParticleBackground from '../../components/ui/ParticleBackground'
import FuturisticLoader from '../../components/ui/FuturisticLoader'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {supabase} from '../../services/supabaseClient' // ✅ default import

const SubjectsPage = ({ onLogout }) => {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ name: '', code: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.from('subjects').select('*')
      if (error) throw error
      setSubjects(data)
    } catch (error) {
      console.error('Error fetching subjects:', error)
      toast.error('Failed to load subjects')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddClick = () => {
    setShowAddForm(true)
    setEditingId(null)
    setFormData({ name: '', code: '' })
  }

  const handleEditClick = (subject) => {
    setEditingId(subject.id)
    setFormData({ name: subject.name, code: subject.code })
    setShowAddForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setIsSubmitting(true)
    try {
      if (editingId) {
        console.log('📝 [Subject] Updating subject:', editingId)
        const { error } = await supabase
          .from('subjects')
          .update({ name: formData.name, code: formData.code })
          .eq('id', editingId)
        if (error) {
          console.error('❌ [Subject] Update error:', error)
          throw new Error(`Update failed: ${error.message}`)
        }
        console.log('✅ [Subject] Subject updated successfully')
        toast.success('Subject updated successfully')
      } else {
        console.log('➕ [Subject] Creating new subject')
        const { error } = await supabase
          .from('subjects')
          .insert([{ name: formData.name, code: formData.code }])
        if (error) {
          console.error('❌ [Subject] Insert error:', error)
          throw new Error(`Insert failed: ${error.message}`)
        }
        console.log('✅ [Subject] Subject created successfully')
        toast.success('Subject added successfully')
      }
      setShowAddForm(false)
      setFormData({ name: '', code: '' })
      setEditingId(null)
      await fetchSubjects()
    } catch (error) {
      console.error('❌ Error saving subject:', error)
      console.error('❌ Error details:', error.message)
      toast.error(error.message || 'Failed to save subject')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        const { error } = await supabase.from('subjects').delete().eq('id', id)
        if (error) throw error
        toast.success('Subject deleted successfully')
        await fetchSubjects()
      } catch (error) {
        console.error('Error deleting subject:', error)
        toast.error('Failed to delete subject')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <ParticleBackground />
      <Header isAdminLoggedIn={true} onLogout={onLogout} />

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            className="mb-8 flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 hover:bg-cyan-500/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-cyan-400" />
              </button>
              <div>
                <h1 className="text-3xl font-futuristic font-bold text-cyan-400">Manage Subjects</h1>
                <p className="text-slate-400 text-sm">Add, edit, and delete subjects</p>
              </div>
            </div>
            <button
              onClick={handleAddClick}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 hover:from-cyan-500/50 hover:to-blue-500/50 border border-cyan-500/50 hover:border-cyan-400/80 text-cyan-300 rounded-lg font-sci-fi transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,217,255,0.4)]"
            >
              <Plus className="w-5 h-5" />
              Add Subject
            </button>
          </motion.div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <motion.div
              className="mb-8 bg-slate-800/50 border border-cyan-500/30 rounded-lg p-6 relative z-30"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-cyan-400 text-sm font-sci-fi mb-2">Subject Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Database Management Systems"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-cyan-500/20 rounded-lg text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-400/60 transition-colors"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-cyan-400 text-sm font-sci-fi mb-2">Subject Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., CS401"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-cyan-500/20 rounded-lg text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-400/60 transition-colors"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 hover:from-cyan-500/50 hover:to-blue-500/50 border border-cyan-500/50 text-cyan-300 rounded-lg font-sci-fi transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : editingId ? (
                      'Update Subject'
                    ) : (
                      'Add Subject'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingId(null)
                      setFormData({ name: '', code: '' })
                    }}
                    className="px-6 py-2 bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600 text-slate-300 rounded-lg font-sci-fi transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Subjects Table */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <FuturisticLoader />
            </div>
          ) : subjects.length === 0 ? (
            <motion.div
              className="text-center py-20 bg-slate-800/50 border border-cyan-500/20 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-slate-400">No subjects yet. Create one to get started!</p>
            </motion.div>
          ) : (
            <motion.div
              className="bg-slate-800/50 border border-cyan-500/20 rounded-lg overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cyan-500/20 bg-slate-900/30">
                      <th className="px-6 py-4 text-left text-cyan-400 font-sci-fi text-sm">Subject Name</th>
                      <th className="px-6 py-4 text-left text-cyan-400 font-sci-fi text-sm">Subject Code</th>
                      <th className="px-6 py-4 text-center text-cyan-400 font-sci-fi text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((subject, index) => (
                      <motion.tr
                        key={subject.id}
                        className="border-b border-cyan-500/10 hover:bg-slate-800/50 transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <td className="px-6 py-4 text-slate-300 font-sci-fi">{subject.name}</td>
                        <td className="px-6 py-4 text-slate-400 font-sci-fi text-sm">{subject.code}</td>
                        <td className="px-6 py-4 flex justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(subject)}
                            className="p-2 hover:bg-blue-500/10 rounded transition-colors text-blue-400"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(subject.id)}
                            className="p-2 hover:bg-red-500/10 rounded transition-colors text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SubjectsPage