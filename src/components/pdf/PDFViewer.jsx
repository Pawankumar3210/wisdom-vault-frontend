import React, { useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, Download, Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import FuturisticLoader from '../ui/FuturisticLoader'
import toast from 'react-hot-toast'

// Set up the worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const PDFViewer = ({ fileUrl, fileName, onDownload }) => {
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  console.log('🔍 PDFViewer received fileUrl:', fileUrl)
  console.log('🔍 PDFViewer received fileName:', fileName)
  
  useEffect(() => {
    console.log('🔍 PDFViewer useEffect - fileUrl changed:', fileUrl)
    if (!fileUrl) {
      console.error('❌ PDFViewer: fileUrl is empty!')
    }
  }, [fileUrl])

  const goToPreviousPage = () => {
    if (pageNumber > 1) setPageNumber(pageNumber - 1)
  }

  const goToNextPage = () => {
    if (numPages && pageNumber < numPages) setPageNumber(pageNumber + 1)
  }

  const handleDownload = () => {
    console.log('📥 Download button clicked')
    onDownload()
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    console.log('✅ PDF Document loaded successfully! Pages:', numPages)
    setNumPages(numPages)
    setIsLoading(false)
  }

  const onDocumentError = (error) => {
    console.error('❌ PDF Document Error:', error)
    console.error('❌ Error name:', error?.name)
    console.error('❌ Error message:', error?.message)
    console.error('❌ Error details:', JSON.stringify(error, null, 2))
    toast.error(`Failed to load PDF: ${error?.message || 'Unknown error'}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Toolbar */}
      <div className="sticky top-0 z-40 bg-slate-900/95 border-b border-cyan-500/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-cyan-500/10 rounded-lg transition-colors"
              title="Go to home"
            >
              <Home className="w-5 h-5 text-cyan-400" />
            </button>
            <div>
              <h2 className="text-cyan-300 font-sci-fi font-semibold truncate">{fileName}</h2>
              <p className="text-xs text-slate-400">
                Page {pageNumber}{numPages && ` of ${numPages}`}
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              console.log('📥 Download button clicked - preventing default')
              e.preventDefault()
              e.stopPropagation()
              handleDownload()
            }}
            className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/40 hover:to-purple-500/40 border border-blue-500/30 hover:border-blue-400/60 text-blue-400 hover:text-blue-300 rounded-lg font-sci-fi text-sm flex items-center gap-2 transition-all duration-200"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 flex items-center justify-center overflow-auto p-4">
        {isLoading && (
          <div className="flex flex-col items-center gap-4">
            <FuturisticLoader />
            <p className="text-cyan-400 font-sci-fi">Loading PDF...</p>
          </div>
        )}

        <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4 max-w-4xl">
          <Document 
            file={fileUrl} 
            onLoadSuccess={onDocumentLoadSuccess}
            onError={onDocumentError}
            loading={<FuturisticLoader />}
          >
            <Page
              pageNumber={pageNumber}
              width={Math.min(window.innerWidth - 100, 1000)}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>
      </div>

      {/* Navigation Controls */}
      {numPages && (
        <div className="bg-slate-900/95 border-t border-cyan-500/30 backdrop-blur-md p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
            <button
              onClick={goToPreviousPage}
              disabled={pageNumber === 1}
              className="p-2 rounded-lg border border-cyan-500/30 hover:border-cyan-400/60 hover:bg-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-cyan-400 transition-colors disabled:hover:bg-transparent disabled:hover:border-cyan-500/30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="px-6 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg">
              <p className="text-cyan-400 font-sci-fi font-semibold text-sm">
                {pageNumber} / {numPages}
              </p>
            </div>

            <button
              onClick={goToNextPage}
              disabled={pageNumber === numPages}
              className="p-2 rounded-lg border border-cyan-500/30 hover:border-cyan-400/60 hover:bg-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-cyan-400 transition-colors disabled:hover:bg-transparent disabled:hover:border-cyan-500/30"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PDFViewer
