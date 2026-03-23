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
        .select('*, subjects(name)') // corrected relation name
        .eq('type', 'qb')
        .order('created_at', { ascending: false })
      if (contentError) throw contentError

      // Fetch subjects
      const { data: subjectsData, error: subjectError } = await supabase
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
    if (!formData.title.trim() || !formData.subject_id) {
      toast.error('Please fill in all fields')
      return
    }

    setIsSubmitting(true)
    try {
      let fileUrl = null

      if (formData.file) {
        // Upload PDF if new file is selected
        const fileExt = formData.file.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase
          .storage
          .from('question_banks')
          .upload(fileName, formData.file, { upsert: true })
        if (uploadError) throw uploadError

        fileUrl = supabase
          .storage
          .from('question_banks')
          .getPublicUrl(fileName).data.publicUrl
      }

      if (editingId) {
        // Update existing record
        const updateData = {
          title: formData.title,
          subject_id: formData.subject_id
        }
        if (fileUrl) updateData.file_url = fileUrl

        const { error: updateError } = await supabase
          .from('content')
          .update(updateData)
          .eq('id', editingId)
        if (updateError) throw updateError
        toast.success('Question bank updated successfully')
      } else {
        if (!fileUrl) throw new Error('Please select a file to upload')
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
      {/* Page content (form & table) remains same structure as your previous pages */}
    </div>
  )
}

export default QuestionBanksPage