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
    const file = formData.get('file')
    const fileName = `${Date.now()}_${file.name}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pdfs')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    const { data, error } = await supabase.from('content').insert([
      {
        title: formData.get('title'),
        subject_id: formData.get('subject_id'),
        type: formData.get('type'),
        file_url: uploadData.path,
      },
    ])

    if (error) throw error
    return { data }
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
        { count: totalSubjects },
        { count: totalNotes },
        { count: totalQuestionBanks },
        { count: totalPapers },
      ] = await Promise.all([
        supabase.from('subjects').select('*', { count: 'exact', head: true }),
        supabase.from('content').select('*', { count: 'exact', head: true }).eq('type', 'note'),
        supabase.from('content').select('*', { count: 'exact', head: true }).eq('type', 'question_bank'),
        supabase.from('content').select('*', { count: 'exact', head: true }).eq('type', 'question_paper'),
      ])

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