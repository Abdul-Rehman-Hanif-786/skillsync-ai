import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { authService } from './services'
import { useAuthStore } from './store/authStore'

// Auth
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

// Dashboard
import Dashboard from './pages/dashboard/Dashboard'

// Profile
import ProfileView from './pages/profile/ProfileView'
import ProfileEdit from './pages/profile/ProfileEdit'
import SkillsManagement from './pages/profile/SkillsManagement'

// Resume
import ResumeUpload from './pages/resume/ResumeUpload'
import ResumeInsights from './pages/resume/ResumeInsights'

// Recommendations
import RecommendationsList from './pages/recommendations/RecommendationsList'
import CareerSuggestions from './pages/recommendations/CareerSuggestions'

// Roadmaps
import MyRoadmaps from './pages/roadmaps/MyRoadmaps'
import RoadmapDetail from './pages/roadmaps/RoadmapDetail'
import CareerAdvisor from './pages/roadmaps/CareerAdvisor'

// Settings
import Settings from './pages/settings/Settings'

// Layout
import MainLayout from './components/layout/MainLayout'
import AuthLayout from './components/layout/AuthLayout'

function App() {
  const { isAuthenticated, user, updateUser } = useAuthStore()

  // If logged in but user object missing — fetch from backend
  useEffect(() => {
    if (isAuthenticated && !user?.full_name) {
      authService.getMe()
        .then(res => updateUser(res.data))
        .catch(() => {})
    }
  }, [isAuthenticated])

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes - Always accessible */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Protected Routes */}
        {isAuthenticated ? (
          <Route element={<MainLayout />}>
            {/* Dashboard */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Profile */}
            <Route path="/profile" element={<ProfileView />} />
            <Route path="/profile/edit" element={<ProfileEdit />} />
            <Route path="/profile/skills" element={<SkillsManagement />} />

            {/* Resume */}
            <Route path="/resume/upload" element={<ResumeUpload />} />
            <Route path="/resume/:id" element={<ResumeInsights />} />

            {/* Recommendations */}
            <Route path="/recommendations" element={<RecommendationsList />} />
            <Route path="/recommendations/careers" element={<CareerSuggestions />} />

            {/* Roadmaps */}
            <Route path="/roadmaps" element={<MyRoadmaps />} />
            <Route path="/roadmaps/advisor" element={<CareerAdvisor />} />
            <Route path="/roadmaps/:id" element={<RoadmapDetail />} />

            {/* Settings */}
            <Route path="/settings" element={<Settings />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </>
  )
}

export default App
