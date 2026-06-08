import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import MapPage from './pages/MapPage'
import CheckerLoginPage from './pages/CheckerLoginPage'
import CheckerPage from './pages/CheckerPage'
import CompletePage from './pages/CompletePage'
import DashboardLoginPage from './pages/DashboardLoginPage'
import DashboardPage from './pages/DashboardPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 공개 */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/map" element={<MapPage />} />

        {/* 검수자 */}
        <Route path="/checker/login" element={<CheckerLoginPage />} />
        <Route path="/checker" element={
          <ProtectedRoute role="checker"><CheckerPage /></ProtectedRoute>
        } />
        <Route path="/checker/complete" element={
          <ProtectedRoute role="checker"><CompletePage /></ProtectedRoute>
        } />

        {/* 관리자 */}
        <Route path="/dashboard/login" element={<DashboardLoginPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute role="admin"><DashboardPage /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App