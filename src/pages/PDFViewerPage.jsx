import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Header from '../components/ui/Header'
import ParticleBackground from '../components/ui/ParticleBackground'
import PDFViewer from '../components/pdf/PDFViewer'
import { contentAPI } from '../services/api'

const PDFViewerPage = ({ isAdminLoggedIn, onLogout }) => {
  const { id } = useParams()
  const [content, setContent] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchContent()
  }, [id])

  const fetchContent = async () => {
    try {
      setIsLoading(true)
      const response = await contentAPI.getById(id)
      console.log('📍 Fetching content with ID:', id)
      console.log('✅ Content fetched:', response.data)
      setContent(response.data)
      
      // Fetch PDF as blob for react-pdf
      if (response.data && response.data.file_url) {
        console.log('📖 Fetching PDF blob for viewer...')
        const blobUrl = await contentAPI.getPdfForViewer(response.data.file_url, response.data.type)
        console.log('📖 Blob URL created:', blobUrl)
        setPdfUrl(blobUrl)
      }
    } catch (error) {
      console.error('❌ Error fetching content:', error)
      console.error('❌ Error message:', error.message)
      toast.error(error.message || 'Failed to load content')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    console.log('🔴 START: Download button handler called')
    
    if (!content || !content.file_url) {
      console.error('❌ Download failed: No content or file_url')
      toast.error('File URL not available')
      return
    }
    
    console.log('✅ Content exists, file_url:', content.file_url)
    
    const downloadUrl = contentAPI.downloadUrl(content.file_url, content.type)
    console.log('✅ downloadUrl returned:', downloadUrl)
    
    if (!downloadUrl) {
      console.error('❌ Download failed: downloadUrl is empty!')
      toast.error('Unable to generate download link')
      return
    }
    
    try {
      console.log('🔴 Creating link element...')
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${content.title}.pdf`
      link.target = '_blank'
      link.setAttribute('download', '')
      
      console.log('🔴 Link properties set:')
      console.log('  - href:', link.href)
      console.log('  - download:', link.download)
      console.log('  - target:', link.target)
      
      console.log('🔴 Appending link to body...')
      document.body.appendChild(link)
      
      console.log('🔴 Triggering click...')
      link.click()
      
      console.log('🔴 Removing link from body...')
      document.body.removeChild(link)
      
      console.log('✅ DOWNLOAD SUCCESS!')
      toast.success('Download started!')
    } catch (error) {
      console.error('❌ Download error:', error)
      toast.error('Download failed: ' + error.message)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <ParticleBackground />
        <Header isAdminLoggedIn={isAdminLoggedIn} onLogout={onLogout} />
      </div>
    )
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <ParticleBackground />
        <Header isAdminLoggedIn={isAdminLoggedIn} onLogout={onLogout} />
        <div className="pt-32 text-center">
          <p className="text-slate-400">Content not found</p>
        </div>
      </div>
    )
  }

  // Generate full public URL for PDF viewer
  const publicUrl = pdfUrl || contentAPI.downloadUrl(content.file_url, content.type)
  
  console.log('🔍 PDFViewerPage rendering:')
  console.log('📄 content.file_url:', content.file_url)
  console.log('📊 content.type:', content.type)
  console.log('🌐 Using publicUrl:', publicUrl)
  console.log('📖 pdfUrl (blob):', pdfUrl)
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <ParticleBackground />
      <Header isAdminLoggedIn={isAdminLoggedIn} onLogout={onLogout} />
      <div className="pt-16">
        {publicUrl && <PDFViewer
          fileUrl={publicUrl}
          fileName={content.title}
          onDownload={handleDownload}
        />}
      </div>
    </div>
  )
}

export default PDFViewerPage
