import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Toaster from './components/ui/Toaster'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Pages
import HomePage from './pages/HomePage'
import PDFViewerPage from './pages/PDFViewerPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import SubjectsPage from './pages/admin/SubjectsPage'
import NotesPage from './pages/admin/NotesPage'
import QuestionBanksPage from './pages/admin/QuestionBanksPage'
import QuestionPapersPage from './pages/admin/QuestionPapersPage'

function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)

  useEffect(() => {
    // Check if admin is logged in from session storage
    const adminSession = sessionStorage.getItem('adminLoggedIn')
    if (adminSession) {
      setIsAdminLoggedIn(true)
    }
  }, [])

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false)
    sessionStorage.removeItem('adminLoggedIn')
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage isAdminLoggedIn={isAdminLoggedIn} onLogout={handleAdminLogout} />} />
          <Route path="/viewer/:id" element={<PDFViewerPage isAdminLoggedIn={isAdminLoggedIn} onLogout={handleAdminLogout} />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={
            isAdminLoggedIn ? <Navigate to="/admin/dashboard" /> : <AdminLoginPage setIsAdminLoggedIn={setIsAdminLoggedIn} />
          } />
          
          {/* Protected Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute isLoggedIn={isAdminLoggedIn}>
              <AdminDashboard onLogout={handleAdminLogout} />
            </ProtectedRoute>
          } />
          <Route path="/admin/subjects" element={
            <ProtectedRoute isLoggedIn={isAdminLoggedIn}>
              <SubjectsPage onLogout={handleAdminLogout} />
            </ProtectedRoute>
          } />
          <Route path="/admin/notes" element={
            <ProtectedRoute isLoggedIn={isAdminLoggedIn}>
              <NotesPage onLogout={handleAdminLogout} />
            </ProtectedRoute>
          } />
          <Route path="/admin/question-banks" element={
            <ProtectedRoute isLoggedIn={isAdminLoggedIn}>
              <QuestionBanksPage onLogout={handleAdminLogout} />
            </ProtectedRoute>
          } />
          <Route path="/admin/question-papers" element={
            <ProtectedRoute isLoggedIn={isAdminLoggedIn}>
              <QuestionPapersPage onLogout={handleAdminLogout} />
            </ProtectedRoute>
          } />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  )
}

export default App
