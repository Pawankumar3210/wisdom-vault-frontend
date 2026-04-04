import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Header from '../../components/ui/Header'
import ParticleBackground from '../../components/ui/ParticleBackground'
import FuturisticLoader from '../../components/ui/FuturisticLoader'
import { Plus, Edit2, Trash2, ArrowLeft, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {supabase} from '../../services/supabaseClient' // ✅ corrected import

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
      const { data: contentsData, error: contentError } = await supabase
        .from('content')
        .select('*, subject:subject_id(name)')
        .eq('type', 'qb')
        .order('created_at', { ascending: false })
      if (contentError) {
        console.error('❌ Content fetch error:', contentError)
        throw new Error(`Failed to fetch question banks: ${contentError.message}`)
      }

      // Fetch subjects
      const { data: subjectsData, error: subjectError } = await supabase
        .from('subjects')
        .select('*')
      if (subjectError) {
        console.error('❌ Subjects fetch error:', subjectError)
        throw new Error(`Failed to fetch subjects: ${subjectError.message}`)
      }

      console.log('✅ Fetched contents:', contentsData)
      console.log('✅ Fetched subjects:', subjectsData)

      setContents(contentsData || [])
      setSubjects(subjectsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error(error.message || 'Failed to load data')
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
    if (!formData.title.trim() || !formData.subject_id) {
      toast.error('Please fill in all fields')
      return
    }

    setIsSubmitting(true)
    try {
      let fileUrl = null

      if (formData.file) {
        console.log('📤 [QB Upload] Uploading file:', formData.file.name)
        // Upload PDF if new file is selected
        const fileExt = formData.file.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase
          .storage
          .from('question_banks')
          .upload(fileName, formData.file, { upsert: true })
        if (uploadError) {
          console.error('❌ [QB Upload] Storage upload error:', uploadError)
          throw new Error(`Storage upload failed: ${uploadError.message}`)
        }

        console.log('✅ [QB Upload] File uploaded successfully:', fileName)
        const publicUrlResult = supabase
          .storage
          .from('question_banks')
          .getPublicUrl(fileName)
        
        fileUrl = publicUrlResult.data.publicUrl
        console.log('✅ [QB Upload] Public URL generated:', fileUrl)
      }

      if (editingId) {
        console.log('📝 [QB] Updating question bank:', editingId)
        // Update existing record
        const updateData = {
          title: formData.title,
          subject_id: formData.subject_id
        }
        if (fileUrl) {
          updateData.file_url = fileUrl
          updateData.file_key = fileUrl
        }

        const { error: updateError } = await supabase
          .from('content')
          .update(updateData)
          .eq('id', editingId)
        if (updateError) {
          console.error('❌ [QB] Update error:', updateError)
          throw new Error(`Update failed: ${updateError.message}`)
        }
        console.log('✅ [QB] Question bank updated successfully')
        toast.success('Question bank updated successfully')
      } else {
        if (!fileUrl) throw new Error('Please select a file to upload')
        console.log('➕ [QB] Creating new question bank')
        // Insert new record
        const { error: insertError } = await supabase
          .from('content')
          .insert([{
            title: formData.title,
            subject_id: formData.subject_id,
            type: 'qb',
            file_url: fileUrl,
            file_key: fileUrl
          }])
        if (insertError) {
          console.error('❌ [QB] Insert error:', insertError)
          throw new Error(`Insert failed: ${insertError.message}`)
        }
        console.log('✅ [QB] Question bank created successfully')
        toast.success('Question bank added successfully')
      }

      setShowAddForm(false)
      setFormData({ title: '', subject_id: '', file: null })
      setEditingId(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      await fetchData()
    } catch (error) {
      console.error('❌ Error saving question bank:', error)
      console.error('❌ Error details:', error.message)
      toast.error(error.message || 'Failed to save question bank')
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
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 hover:from-cyan-500/50 hover:to-blue-500/50 border border-cyan-500/50 text-cyan-300 rounded-lg font-sci-fi transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,217,255,0.4)]"
            >
              <Plus className="w-5 h-5" />
              Add Question Bank
            </button>
          </motion.div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div
              className="mb-8 bg-slate-800/50 border border-cyan-500/30 rounded-lg p-6 relative z-30"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-cyan-400 text-sm font-sci-fi mb-2">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., DBMS Question Bank"
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
                      : editingId ? 'Update Question Bank' : 'Upload Question Bank'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddForm(false); setFormData({ title: '', subject_id: '', file: null }); setEditingId(null) }}
                    className="px-6 py-2 bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600 text-slate-300 rounded-lg font-sci-fi transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Question Banks Table */}
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
              <p className="text-slate-400">No question banks yet.</p>
            </motion.div>
          ) : (
            <motion.div
              className="bg-slate-800/50 border border-cyan-500/20 rounded-lg overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <table className="w-full">
                <thead className="bg-slate-700/50 border-b border-cyan-500/20">
                  <tr>
                    <th className="px-6 py-3 text-left text-cyan-400 font-sci-fi">Title</th>
                    <th className="px-6 py-3 text-left text-cyan-400 font-sci-fi">Subject</th>
                    <th className="px-6 py-3 text-left text-cyan-400 font-sci-fi">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contents.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      className="border-b border-cyan-500/10 hover:bg-slate-700/30 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <td className="px-6 py-4 text-slate-300">{item.title}</td>
                      <td className="px-6 py-4 text-slate-300">{item.subject?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 flex gap-2">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-2 hover:bg-cyan-500/20 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-cyan-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 hover:bg-red-500/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuestionBanksPage