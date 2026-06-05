import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import CheckerPage from './pages/CheckerPage'
import DashboardPage from './pages/DashboardPage'
import CompletePage from './pages/CompletePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/checker" element={<CheckerPage />} />
        <Route path="/complete" element={<CompletePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App