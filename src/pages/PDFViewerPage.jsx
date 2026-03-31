import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Header from '../components/ui/Header'
import ParticleBackground from '../components/ui/ParticleBackground'
import PDFViewer from '../components/pdf/PDFViewer'
import FuturisticLoader from '../components/ui/FuturisticLoader'
import { contentAPI } from '../services/api'

const PDFViewerPage = ({ isAdminLoggedIn, onLogout }) => {
  const { id } = useParams()
  const [content, setContent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchContent()
  }, [id])

  const fetchContent = async () => {
    try {
      setIsLoading(true)
      const response = await contentAPI.getById(id)
      console.log('PDFViewerPage: Content fetched:', response.data)
      setContent(response.data)
    } catch (error) {
      console.error('Error fetching content:', error)
      toast.error(error.message || 'Failed to load content')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!content || !content.file_url) {
      toast.error('File URL not available')
      return
    }
    const downloadUrl = contentAPI.downloadUrl(content.file_url)
    if (!downloadUrl) {
      toast.error('Unable to generate download link')
      return
    }
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `${content.title}.pdf`
    link.target = '_blank'
    link.setAttribute('download', '')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Download started!')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <ParticleBackground />
        <Header isAdminLoggedIn={isAdminLoggedIn} onLogout={onLogout} />
        <div className="flex flex-col items-center gap-4 pt-20">
          <FuturisticLoader />
          <p className="text-cyan-400 font-sci-fi">Loading content...</p>
        </div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <ParticleBackground />
      <Header isAdminLoggedIn={isAdminLoggedIn} onLogout={onLogout} />
      <div className="pt-16">
        <PDFViewer
          fileUrl={content.file_url}
          fileName={content.title}
          onDownload={handleDownload}
        />
      </div>
    </div>
  )
}

export default PDFViewerPage
