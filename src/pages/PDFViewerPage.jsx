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
      console.log('📍 [PDFViewerPage] Fetching content with ID:', id)
      
      const response = await contentAPI.getById(id)
      console.log('✅ [PDFViewerPage] Content fetched:', response.data)
      setContent(response.data)
      
      // Generate public URL for react-pdf (blob URLs have CORS issues)
      if (response.data && response.data.file_url) {
        console.log('📖 [PDFViewerPage] Generating public URL for PDF...')
        const publicUrl = contentAPI.downloadUrl(response.data.file_url, response.data.type)
        console.log('✅ [PDFViewerPage] Public URL generated:', publicUrl)
        setPdfUrl(publicUrl)
      }
    } catch (error) {
      console.error('❌ [PDFViewerPage] Error fetching content:', error)
      console.error('❌ [PDFViewerPage] Error message:', error.message)
      toast.error(error.message || 'Failed to load content')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    console.log('🔴 [PDFViewerPage.handleDownload] FIRED')
    console.log('🔴 content exists?:', !!content)
    console.log('🔴 content.file_url:', content?.file_url)
    
    if (!content || !content.file_url) {
      console.error('❌ [PDFViewerPage] Download failed: No content or file_url')
      toast.error('File URL not available')
      return
    }
    
    console.log('✅ [PDFViewerPage] Content exists, getting download URL...')
    const downloadUrl = contentAPI.downloadUrl(content.file_url, content.type)
    console.log('✅ [PDFViewerPage] downloadUrl returned:', downloadUrl)
    
    if (!downloadUrl) {
      console.error('❌ [PDFViewerPage] downloadUrl is empty!')
      toast.error('Unable to generate download link')
      return
    }
    
    try {
      console.log('🔴 [PDFViewerPage] Creating download link element...')
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${content.title}.pdf`
      
      console.log('🔴 [PDFViewerPage] Link properties:')
      console.log('   href:', link.href)
      console.log('   download:', link.download)
      
      console.log('🔴 [PDFViewerPage] Appending to body and clicking...')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      console.log('✅ [PDFViewerPage] DOWNLOAD INITIATED!')
      toast.success('Download started!')
    } catch (error) {
      console.error('❌ [PDFViewerPage] Error during download:', error)
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

  // Use blob URL if available, otherwise use public URL
  let displayUrl = pdfUrl
  if (!displayUrl && content) {
    displayUrl = contentAPI.downloadUrl(content.file_url, content.type)
  }
  
  console.log('🔍 [PDFViewerPage] FINAL RENDER:')
  console.log('📄 content.file_url:', content?.file_url)
  console.log('📊 content.type:', content?.type)
  console.log('📖 pdfUrl (blob):', pdfUrl)
  console.log('🌐 displayUrl (final):', displayUrl)
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <ParticleBackground />
      <Header isAdminLoggedIn={isAdminLoggedIn} onLogout={onLogout} />
      <div className="pt-16">
        {displayUrl ? (
          <PDFViewer
            fileUrl={displayUrl}
            fileName={content.title}
            onDownload={handleDownload}
          />
        ) : (
          <div className="text-center pt-32">
            <p className="text-slate-400">Loading PDF...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PDFViewerPage
