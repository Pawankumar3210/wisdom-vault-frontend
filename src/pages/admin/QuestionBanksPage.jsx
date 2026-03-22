import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Header from '../../components/ui/Header'
import ParticleBackground from '../../components/ui/ParticleBackground'
import FuturisticLoader from '../../components/ui/FuturisticLoader'
import { Plus, Edit2, Trash2, ArrowLeft, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import supabase from '../../services/supabaseClient'

const QuestionBanksPage = ({ onLogout }) => {
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

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      // Fetch question banks
      let { data: contentsData, error: contentError } = await supabase
        .from('content')
        .select(`*, subject(name)`)
        .eq('type', 'qb')
        .order('created_at', { ascending: false })
      if (contentError) throw contentError

      // Fetch subjects
      let { data: subjectsData, error: subjectError } = await supabase
        .from('subjects')
        .select('*')
      if (subjectError) throw subjectError

      setContents(contentsData || [])
      setSubjects(subjectsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.subject_id || !formData.file) {
      toast.error('Please fill in all fields')
      return
    }

    setIsSubmitting(true)
    try {
      // Upload PDF to Supabase Storage
      const fileExt = formData.file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('question_banks')
        .upload(fileName, formData.file, { upsert: true })

      if (uploadError) throw uploadError

      const fileUrl = supabase
        .storage
        .from('question_banks')
        .getPublicUrl(fileName).data.publicUrl

      if (editingId) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('content')
          .update({
            title: formData.title,
            subject_id: formData.subject_id,
            file_url: fileUrl
          })
          .eq('id', editingId)
        if (updateError) throw updateError
        toast.success('Question bank updated successfully')
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('content')
          .insert([{
            title: formData.title,
            subject_id: formData.subject_id,
            type: 'qb',
            file_url: fileUrl
          }])
        if (insertError) throw insertError
        toast.success('Question bank added successfully')
      }

      setShowAddForm(false)
      setFormData({ title: '', subject_id: '', file: null })
      setEditingId(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      await fetchData()
    } catch (error) {
      console.error('Error saving question bank:', error)
      toast.error('Failed to save question bank')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question bank?')) {
      try {
        const { error } = await supabase
          .from('content')
          .delete()
          .eq('id', id)
        if (error) throw error
        toast.success('Question bank deleted successfully')
        await fetchData()
      } catch (error) {
        console.error('Error deleting question bank:', error)
        toast.error('Failed to delete question bank')
      }
    }
  }

  const handleEditClick = (content) => {
    setEditingId(content.id)
    setFormData({
      title: content.title,
      subject_id: content.subject_id,
      file: null,
    })
    setShowAddForm(true)
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
                <h1 className="text-3xl font-futuristic font-bold text-cyan-400">📋 Manage Question Banks</h1>
                <p className="text-slate-400 text-sm">Upload and manage question banks</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowAddForm(!showAddForm)
                setEditingId(null)
                setFormData({ title: '', subject_id: '', file: null })
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 hover:from-cyan-500/50 hover:to-blue-500/50 border border-cyan-500/50 hover:border-cyan-400/80 text-cyan-300 rounded-lg font-sci-fi transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,217,255,0.4)]"
            >
              <Plus className="w-5 h-5" />
              Add Question Bank
            </button>
          </motion.div>

          {/* Add/Edit Form & Table */}
          {showAddForm && (
            <motion.div
              className="mb-8 bg-slate-800/50 border border-cyan-500/30 rounded-lg p-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Form remains same as before */}
              {/* ... */}
            </motion.div>
          )}

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
              <p className="text-slate-400">No question banks yet. Upload one to get started!</p>
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
                      <th className="px-6 py-4 text-left text-cyan-400 font-sci-fi text-sm">Question Bank Title</th>
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
                        <td className="px-6 py-4 text-slate-400 font-sci-fi text-sm">{content.subject?.name}</td>
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

export default QuestionBanksPage