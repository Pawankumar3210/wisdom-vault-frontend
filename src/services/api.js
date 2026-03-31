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
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Get all content error:', error)
        throw new Error(`Failed to fetch all content: ${error.message}`)
      }
      console.log('✅ Fetched all content:', data)
      return { data }
    } catch (err) {
      console.error('❌ Error in getAll:', err)
      throw err
    }
  },

  getByType: async (type) => {
    const { data, error } = await supabase
      .from('content')
      .select('*, subject:subject_id(name)')
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

  downloadUrl: (fileName) => {
    // Generate public URL for the file in the pdfs bucket
    const { data } = supabase.storage
      .from('pdfs')
      .getPublicUrl(fileName)
    return data?.publicUrl || ''
  },
}

// ========================
// ✅ FINAL WORKING Stats API
// ========================
export const statsAPI = {
  getStats: async () => {
    try {
      console.log('Starting stats fetch...')
      
      // Fetch each stat individually to get better error handling
      const subjectsRes = await supabase
        .from('subjects')
        .select('*', { count: 'exact', head: true })
      
      const notesRes = await supabase
        .from('content')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'note')
      
      const qbRes = await supabase
        .from('content')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'qb')
      
      const papersRes = await supabase
        .from('content')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'paper')

      // Check for errors
      if (subjectsRes.error) {
        console.error('❌ Subjects query error:', subjectsRes.error)
        throw new Error(`Subjects query failed: ${subjectsRes.error.message}`)
      }
      if (notesRes.error) {
        console.error('❌ Notes query error:', notesRes.error)
        throw new Error(`Notes query failed: ${notesRes.error.message}`)
      }
      if (qbRes.error) {
        console.error('❌ Question Banks query error:', qbRes.error)
        throw new Error(`Question Banks query failed: ${qbRes.error.message}`)
      }
      if (papersRes.error) {
        console.error('❌ Papers query error:', papersRes.error)
        throw new Error(`Papers query failed: ${papersRes.error.message}`)
      }

      const totalSubjects = subjectsRes.count || 0
      const totalNotes = notesRes.count || 0
      const totalQuestionBanks = qbRes.count || 0
      const totalPapers = papersRes.count || 0

      console.log('✅ Stats fetched successfully:', { totalSubjects, totalNotes, totalQuestionBanks, totalPapers })

      return {
        data: {
          totalSubjects,
          totalNotes,
          totalQuestionBanks,
          totalPapers,
        },
      }
    } catch (error) {
      console.error('❌ Error fetching stats:', error)
      throw error
    }
  },
}