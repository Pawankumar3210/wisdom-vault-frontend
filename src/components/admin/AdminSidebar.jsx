import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { BookOpen, FileText, ClipboardList, Award, LayoutDashboard } from 'lucide-react'

const AdminSidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: BookOpen, label: 'Subjects', path: '/admin/subjects' },
    { icon: FileText, label: 'Notes', path: '/admin/notes' },
    { icon: ClipboardList, label: 'Question Banks', path: '/admin/question-banks' },
    { icon: Award, label: 'Question Papers', path: '/admin/question-papers' },
  ]

  return (
    <div className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-900 border-r border-cyan-500/20 flex-col pt-24">
      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border border-cyan-500/50 text-cyan-300'
                  : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-sci-fi">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export default AdminSidebar
