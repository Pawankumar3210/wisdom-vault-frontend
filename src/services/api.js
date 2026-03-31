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
      console.log('📍 Starting getAll() call...')
      console.log('📍 Supabase instance:', supabase ? 'exists' : 'MISSING')
      
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('📍 Raw response - data:', data)
      console.log('📍 Raw response - error:', error)

      if (error) {
        console.error('❌ Get all content error:', error)
        throw new Error(`Failed to fetch all content: ${error.message}`)
      }
      
      console.log('✅ Fetched all content. Count:', data?.length || 0)
      console.log('✅ Full data:', JSON.stringify(data, null, 2))
      
      return { data }
    } catch (err) {
      console.error('❌ Error in getAll:', err)
      console.error('❌ Error stack:', err.stack)
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

  getById: async (id) => {
    try {
      console.log('📍 Fetching content with ID:', id)
      const { data, error } = await supabase
        .from('content')
        .select('*, subject:subject_id(name)')
        .eq('id', id)
        .single()

      if (error) {
        console.error('❌ Get by ID error:', error)
        throw new Error(`Failed to fetch content: ${error.message}`)
      }

      console.log('✅ Content fetched:', data)
      return { data }
    } catch (err) {
      console.error('❌ Error in getById:', err)
      throw err
    }
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

  // Special method for react-pdf to handle CORS issues
  getPdfForViewer: async (fileName, contentType = 'note') => {
    if (!fileName) {
      console.error('❌ getPdfForViewer: fileName is empty!')
      throw new Error('No file name provided')
    }
    
    try {
      // Determine bucket based on content type
      let bucketName = 'pdfs'
      if (contentType === 'qb' || contentType === 'question_bank') {
        bucketName = 'question_banks'
      } else if (contentType === 'paper' || contentType === 'question_paper') {
        bucketName = 'question-papers'
      }
      
      console.log('📖 getPdfForViewer - fetching from bucket:', bucketName, 'file:', fileName)
      
      // Download file as blob
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(fileName)
      
      if (error) {
        console.error('❌ Download error:', error)
        throw error
      }
      
      // Create blob URL for react-pdf
      const blobUrl = URL.createObjectURL(data)
      console.log('✅ Created blob URL:', blobUrl)
      
      return blobUrl
    } catch (err) {
      console.error('❌ Error in getPdfForViewer:', err)
      throw err
    }
  },

  downloadUrl: (fileName, contentType = 'note') => {
    if (!fileName) {
      console.error('❌ downloadUrl: fileName is empty!')
      return ''
    }
    
    try {
      // Determine bucket based on content type
      let bucketName = 'pdfs' // default for notes
      
      if (contentType === 'qb' || contentType === 'question_bank') {
        bucketName = 'question_banks'
      } else if (contentType === 'paper' || contentType === 'question_paper') {
        bucketName = 'question-papers'
      }
      
      console.log('📥 downloadUrl() called - fileName:', fileName, 'type:', contentType, 'bucket:', bucketName)
      
      // Generate public URL for the file
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName)
      
      console.log('📥 Generated publicUrl:', data?.publicUrl)
      
      if (!data?.publicUrl) {
        console.error('❌ downloadUrl: Failed to generate URL! data:', data)
        return ''
      }
      
      return data.publicUrl
    } catch (err) {
      console.error('❌ Error generating download URL:', err)
      return ''
    }
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