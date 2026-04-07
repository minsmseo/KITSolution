import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './routes/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import MyClasses from './pages/MyClasses'
import LectureList from './pages/LectureList'
import LectureDetail from './pages/LectureDetail'
import Analytics from './pages/Analytics'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/my-classes" element={
            <ProtectedRoute>
              <MyClasses />
            </ProtectedRoute>
          } />

          <Route path="/lectures" element={
            <ProtectedRoute>
              <LectureList />
            </ProtectedRoute>
          } />

          <Route path="/lectures/:lectureId" element={
            <ProtectedRoute>
              <LectureDetail />
            </ProtectedRoute>
          } />

          <Route path="/analytics" element={
            <ProtectedRoute roles={['admin', 'manager']}>
              <Analytics />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
