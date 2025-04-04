import { useState, useEffect, createContext } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import CoursesPage from './pages/CoursesPage'
import CourseDetailsPage from './pages/CourseDetailsPage'
import LearningPathsPage from './pages/LearningPathsPage'
import AiMentorPage from './pages/AiMentorPage'
import YouTubeCoursesPage from './pages/YouTubeCoursesPage'
import ProfilePage from './pages/ProfilePage'

// Theme context
export const ThemeContext = createContext(null)

function App() {
  const [darkMode, setDarkMode] = useState(false)

  // Check user preference for dark mode
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true)
    }
  }, [])

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      <AuthProvider>
        <div className="App bg-background dark:bg-darkBg min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/youtube" element={<YouTubeCoursesPage />} />
            <Route path="/courses/:courseId" element={<CourseDetailsPage />} />
            <Route path="/learning-paths" element={<LearningPathsPage />} />
            <Route path="/ai-mentor" element={<AiMentorPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            {/* Additional routes will be added as we build components */}
            {/* Future routes:
              - /learning-paths/:pathId - Individual learning path details
              - /profile - User profile settings
            */}
          </Routes>
        </div>
      </AuthProvider>
    </ThemeContext.Provider>
  )
}

export default App
