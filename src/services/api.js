// src/services/api.js
import { supabase } from './supabaseClient'

// ========================
// Subject API
// ========================
export const subjectAPI = {
  getAll: async () => {
    const { data, error } = await supabase.from('subjects').select('*')
    if (error) throw error
    return { data }
  }
}

// ========================
// Content API
// ========================
export const contentAPI = {
  getByType: async (type) => {
    const { data, error } = await supabase
      .from('content')
      .select('*, subject(name)')
      .eq('type', type)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data }
  },

  create: async (formData) => {
    try {
      const file = formData.get('file')
      const fileName = `${Date.now()}_${file.name}`

      console.log('Uploading file:', fileName)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pdfs')
        .upload(fileName, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      console.log('File uploaded, data:', uploadData)
      console.log('Inserting content with:', { title: formData.get('title'), subject_id: formData.get('subject_id'), type: formData.get('type'), file_url: uploadData.path })

      const { data, error } = await supabase.from('content').insert([
        {
          title: formData.get('title'),
          subject_id: formData.get('subject_id'),
          type: formData.get('type'),
          file_url: uploadData.path,
          file_key: uploadData.path,
        },
      ])

      if (error) {
        console.error('Insert error:', error)
        throw new Error(`Database insert failed: ${error.message}`)
      }
      
      console.log('Content created:', data)
      return { data }
    } catch (err) {
      console.error('Create error:', err)
      throw err
    }
  },

  update: async (id, formData) => {
    const updates = {
      title: formData.get('title'),
      subject_id: formData.get('subject_id'),
    }

    const file = formData.get('file')
    if (file) {
      const fileName = `${Date.now()}_${file.name}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pdfs')
        .upload(fileName, file)

      if (uploadError) throw uploadError
      updates.file_url = uploadData.path
      updates.file_key = uploadData.path
    }

    const { data, error } = await supabase
      .from('content')
      .update(updates)
      .eq('id', id)

    if (error) throw error
    return { data }
  },

  delete: async (id) => {
    const { data, error } = await supabase
      .from('content')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { data }
  },
}

// ========================
// ✅ FINAL WORKING Stats API
// ========================
export const statsAPI = {
  getStats: async () => {
    try {
      const [
        { count: totalSubjects, error: subjectError },
        { count: totalNotes, error: notesError },
        { count: totalQuestionBanks, error: qbError },
        { count: totalPapers, error: qpError },
      ] = await Promise.all([
        supabase.from('subjects').select('*', { count: 'exact', head: true }),
        supabase.from('content').select('*', { count: 'exact', head: true }).eq('type', 'note'),
        supabase.from('content').select('*', { count: 'exact', head: true }).eq('type', 'qb'),
        supabase.from('content').select('*', { count: 'exact', head: true }).eq('type', 'paper'),
      ])

      // Log any errors from individual queries
      if (subjectError) console.error('Subjects error:', subjectError)
      if (notesError) console.error('Notes error:', notesError)
      if (qbError) console.error('Question banks error:', qbError)
      if (qpError) console.error('Question papers error:', qpError)

      console.log('Stats fetched:', { totalSubjects, totalNotes, totalQuestionBanks, totalPapers })

      return {
        data: {
          totalSubjects: totalSubjects || 0,
          totalNotes: totalNotes || 0,
          totalQuestionBanks: totalQuestionBanks || 0,
          totalPapers: totalPapers || 0,
        },
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      throw error
    }
  },
}