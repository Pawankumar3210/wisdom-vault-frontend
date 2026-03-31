import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Header from '../../components/ui/Header'
import ParticleBackground from '../../components/ui/ParticleBackground'
import FuturisticLoader from '../../components/ui/FuturisticLoader'
import { Plus, Edit2, Trash2, ArrowLeft, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { contentAPI, subjectAPI } from '../../services/api'

const NotesPage = ({ onLogout }) => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [contents, setContents] = useState([])
  const [subjects, setSubjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    subject_id: '',
    file: null,
  })

  // Fetch notes and subjects
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [contentsRes, subjectsRes] = await Promise.all([
        contentAPI.getByType('note'),
        subjectAPI.getAll(),
      ])
      setContents(contentsRes.data || [])
      setSubjects(subjectsRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  // Drag & drop handlers
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      if (files[0].type === 'application/pdf') {
        setFormData({ ...formData, file: files[0] })
      } else {
        toast.error('Please upload a PDF file')
      }
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      if (e.target.files[0].type === 'application/pdf') {
        setFormData({ ...formData, file: e.target.files[0] })
      } else {
        toast.error('Please upload a PDF file')
      }
    }
  }

  // Add or update note
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.subject_id || !formData.file) {
      toast.error('Please fill in all fields')
      return
    }

    setIsSubmitting(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('subject_id', formData.subject_id)
      formDataToSend.append('type', 'note')
      formDataToSend.append('file', formData.file)

      if (editingId) {
        await contentAPI.update(editingId, formDataToSend)
        toast.success('Note updated successfully')
      } else {
        await contentAPI.create(formDataToSend)
        toast.success('Note added successfully')
      }

      resetForm()
      await fetchData()
    } catch (error) {
      console.error('Error saving note:', error)
      toast.error('Failed to save note')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await contentAPI.delete(id)
        toast.success('Note deleted successfully')
        await fetchData()
      } catch (error) {
        console.error('Error deleting note:', error)
        toast.error('Failed to delete note')
      }
    }
  }

  const handleEditClick = (content) => {
    setEditingId(content.id)
    setFormData({ title: content.title, subject_id: content.subject_id, file: null })
    setShowAddForm(true)
  }

  const resetForm = () => {
    setShowAddForm(false)
    setEditingId(null)
    setFormData({ title: '', subject_id: '', file: null })
    if (fileInputRef.current) fileInputRef.current.value = ''
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
                <h1 className="text-3xl font-futuristic font-bold text-cyan-400">📄 Manage Notes</h1>
                <p className="text-slate-400 text-sm">Upload and manage study notes</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 hover:from-cyan-500/50 hover:to-blue-500/50 border border-cyan-500/50 text-cyan-300 rounded-lg font-sci-fi transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,217,255,0.4)]"
            >
              <Plus className="w-5 h-5" />
              Add Note
            </button>
          </motion.div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <motion.div
              className="mb-8 bg-slate-800/50 border border-cyan-500/30 rounded-lg p-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-cyan-400 text-sm font-sci-fi mb-2">Note Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Chapter 1: Introduction to DBMS"
                      className="w-full px-4 py-2 bg-slate-900/50 border border-cyan-500/20 rounded-lg text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-400/60 transition-colors"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-cyan-400 text-sm font-sci-fi mb-2">Subject</label>
                    <select
                      value={formData.subject_id}
                      onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-900/50 border border-cyan-500/20 rounded-lg text-slate-200 outline-none focus:border-cyan-400/60 transition-colors"
                      disabled={isSubmitting}
                    >
                      <option value="">Select a subject</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Drag & Drop */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-cyan-400 bg-cyan-500/10'
                      : 'border-cyan-500/30 hover:border-cyan-500/60 bg-slate-900/30'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    <span className="font-sci-fi">Drag and drop or click to upload</span>
                  </button>
                  {formData.file && (
                    <p className="text-sm text-cyan-300 mt-2">✓ {formData.file.name}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 hover:from-cyan-500/50 hover:to-blue-500/50 border border-cyan-500/50 text-cyan-300 rounded-lg font-sci-fi transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting
                      ? <>
                          <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                          Uploading...
                        </>
                      : editingId ? 'Update Note' : 'Upload Note'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600 text-slate-300 rounded-lg font-sci-fi transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Notes Table */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <FuturisticLoader />
            </div>
          ) : contents.length === 0 ? (
            <motion.div
              className="text-center py-20 bg-slate-800/50 border border-cyan-500/20 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-slate-400">No notes yet. Upload one to get started!</p>
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
                      <th className="px-6 py-4 text-left text-cyan-400 font-sci-fi text-sm">Note Title</th>
                      <th className="px-6 py-4 text-left text-cyan-400 font-sci-fi text-sm">Subject</th>
                      <th className="px-6 py-4 text-left text-cyan-400 font-sci-fi text-sm">Uploaded</th>
                      <th className="px-6 py-4 text-center text-cyan-400 font-sci-fi text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contents.map((content, index) => (
                      <motion.tr
                        key={content.id}
                        className="border-b border-cyan-500/10 hover:bg-slate-800/50 transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <td className="px-6 py-4 text-slate-300 font-sci-fi">{content.title}</td>
                        <td className="px-6 py-4 text-slate-400 font-sci-fi text-sm">{content.subject}</td>
                        <td className="px-6 py-4 text-slate-400 font-sci-fi text-sm">
                          {new Date(content.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 flex justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(content)}
                            className="p-2 hover:bg-blue-500/10 rounded transition-colors text-blue-400"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(content.id)}
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

export default NotesPage